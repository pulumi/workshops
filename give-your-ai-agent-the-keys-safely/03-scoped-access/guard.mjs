#!/usr/bin/env node
// guard.mjs
//
// A dependency-free MCP stdio proxy that sits in front of the real
// @pulumi/mcp-server and enforces a read-plus-propose allow-list.
//
// The upstream server ships no allow-list, read-only mode, or
// tool-scoping flag of its own: every tool it registers -- including
// pulumi-cli-up and deploy-to-aws, the two tools that can mutate real
// infrastructure -- is exposed unconditionally over stdio. This script is
// the hand-built boundary a configuration flag would otherwise be: it
// filters what tools/list reports and refuses to forward any tools/call
// whose tool name is not in ALLOW_LIST, before the request ever reaches
// the real server's stdin.
//
// See AGENTS.md in this folder for the full rationale and the companion
// second layer of defense (a read-only Pulumi Cloud access token).

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import process from 'node:process';

// Only these tool names may ever be listed or called through this proxy.
// Everything else the real server exposes -- notably pulumi-cli-up and
// deploy-to-aws -- is denied.
const ALLOW_LIST = new Set([
  'pulumi-registry-get-type',
  'pulumi-registry-get-resource',
  'pulumi-registry-get-function',
  'pulumi-registry-list-resources',
  'pulumi-registry-list-functions',
  'pulumi-cli-preview',
  'pulumi-cli-stack-output',
  'pulumi-cli-refresh',
]);

const DEFAULT_TARGET_CMD = 'npx -y @pulumi/mcp-server@0.2.0 stdio';

function log(message) {
  process.stderr.write(`[guard] ${message}\n`);
}

// JSON-RPC ids may be a string, a number, or null. Fold the runtime type
// into the key so the number 1 and the string "1" never collide.
function idKey(id) {
  return `${typeof id}:${JSON.stringify(id)}`;
}

function parseTargetCmd(raw) {
  const trimmed = (raw ?? '').trim();
  const source = trimmed.length > 0 ? trimmed : DEFAULT_TARGET_CMD;
  // Naive whitespace split, as specified -- no quote-awareness.
  const parts = source.split(/\s+/).filter(Boolean);
  return { cmd: parts[0], args: parts.slice(1), source };
}

const { cmd, args, source: targetCmdSource } = parseTargetCmd(process.env.MCP_TARGET_CMD);

let shuttingDown = false;
let child;

try {
  child = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] });
} catch (err) {
  log(`Failed to spawn target MCP server ('${targetCmdSource}'): ${err.message}`);
  process.exit(1);
}

child.on('error', (err) => {
  log(`Failed to spawn target MCP server ('${targetCmdSource}'): ${err.message}`);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (shuttingDown) return;
  log(`Target MCP server exited unexpectedly (code=${code}, signal=${signal}); shutting down.`);
  process.exit(code === null ? 1 : code);
});

child.stdin.on('error', (err) => {
  log(`Failed to write to target server stdin: ${err.message}`);
});

// The child's own stderr (npx noise, server diagnostics) passes straight
// through to our stderr. It never touches stdout, which must carry only
// the JSON-RPC channel back to the client.
child.stderr.pipe(process.stderr);

process.stdout.on('error', (err) => {
  if (err && err.code === 'EPIPE') return;
  log(`Failed to write to client stdout: ${err.message}`);
});

// Request ids for outstanding tools/list calls we forwarded, so we know
// to filter the matching response when it comes back from the child.
const pendingToolsList = new Set();

function writeToChild(line) {
  child.stdin.write(`${line}\n`);
}

function writeToClient(line) {
  process.stdout.write(`${line}\n`);
}

function handleClientLine(rawLine) {
  const line = rawLine.trim();
  if (line.length === 0) return;

  let msg;
  try {
    msg = JSON.parse(line);
  } catch (err) {
    log(`Client sent non-JSON line, forwarding as-is (fail open): ${err.message}`);
    writeToChild(line);
    return;
  }

  const method = msg && msg.method;

  if (method === 'initialize' || method === 'notifications/initialized' || method === 'ping') {
    writeToChild(line);
    return;
  }

  if (method === 'tools/list') {
    if (msg.id !== undefined) {
      pendingToolsList.add(idKey(msg.id));
    }
    writeToChild(line);
    return;
  }

  if (method === 'tools/call') {
    const toolName = msg.params && msg.params.name;
    if (ALLOW_LIST.has(toolName)) {
      writeToChild(line);
    } else {
      log(`Blocked tools/call for '${toolName}' (not in allow-list)`);
      const errorResponse = {
        jsonrpc: '2.0',
        id: msg.id !== undefined ? msg.id : null,
        error: {
          code: -32601,
          message: `blocked by workshop guard: '${toolName}' is not in the propose-only allow-list (read + preview only -- no apply, no deploy)`,
        },
      };
      writeToClient(JSON.stringify(errorResponse));
    }
    return;
  }

  // Anything else (a method we don't special-case, or a message with no
  // method at all, such as a client-side response to a server-initiated
  // request) fails open: forward it unmodified rather than drop it or
  // crash, but note it on stderr since it sits outside the routing rules
  // above.
  log(`Forwarding unrecognized client message (method=${method ?? '<none>'}) as-is (fail open)`);
  writeToChild(line);
}

function handleChildLine(rawLine) {
  const line = rawLine.trim();
  if (line.length === 0) return;

  let msg;
  try {
    msg = JSON.parse(line);
  } catch (err) {
    log(`Target server sent non-JSON line, forwarding as-is (fail open): ${err.message}`);
    writeToClient(line);
    return;
  }

  if (msg && msg.id !== undefined) {
    const key = idKey(msg.id);
    if (pendingToolsList.has(key)) {
      pendingToolsList.delete(key);
      if (msg.result && Array.isArray(msg.result.tools)) {
        msg.result.tools = msg.result.tools.filter((t) => t && ALLOW_LIST.has(t.name));
      }
      writeToClient(JSON.stringify(msg));
      return;
    }
  }

  // Every other response, notification, or server-initiated request from
  // the real server is relayed byte-for-byte. This is the normal,
  // expected traffic path, so it is not logged.
  writeToClient(line);
}

const clientRL = createInterface({ input: process.stdin, terminal: false });
const childRL = createInterface({ input: child.stdout, terminal: false });

clientRL.on('line', handleClientLine);
childRL.on('line', handleChildLine);

clientRL.on('close', () => {
  log("Client stdin closed (EOF); terminating target MCP server.");
  shuttingDown = true;
  child.kill('SIGTERM');
  process.exit(0);
});
