#!/usr/bin/env node
// probe.mjs
//
// Dependency-free MCP stdio handshake prober. Spawns a command, speaks the
// MCP stdio transport (newline-delimited JSON-RPC 2.0, one object per line,
// UTF-8 -- NOT LSP Content-Length framing), performs the standard
// initialize -> notifications/initialized -> tools/list handshake, prints
// every tool name to stdout, and optionally invokes one tool via tools/call.
//
// Usage:
//   node probe.mjs [--call <toolName> --args '<json-object-string>'] -- <command> [args...]
//
// Examples:
//   node probe.mjs -- npx -y @pulumi/mcp-server@0.2.0 stdio
//   node probe.mjs --call pulumi-cli-up --args '{"workDir":"x","stackName":"dev"}' -- node guard.mjs
//
// Exit code:
//   0 if every expected round trip (initialize, tools/list, and the
//     tools/call if requested) received a well-formed JSON-RPC response
//     matching its id -- true whether that response carries "result" or
//     "error", since a well-formed error is still a successful protocol
//     exchange.
//   1 only on a transport-level failure: the child failed to spawn, exited
//     before answering, or a response never arrived within the 15-second
//     per-request timeout. A clear diagnostic is printed to stderr.
//
// Only Node built-ins are used: node:child_process, node:readline, node:process.

import { spawn } from 'node:child_process';
import readline from 'node:readline';
import process from 'node:process';

const REQUEST_TIMEOUT_MS = 15000;

function usageError(message) {
  console.error(`probe.mjs: ${message}`);
  console.error("Usage: node probe.mjs [--call <toolName> --args '<json-object-string>'] -- <command> [args...]");
  process.exit(1);
}

function parseArgs(argv) {
  const dashDashIndex = argv.indexOf('--');
  if (dashDashIndex === -1) {
    usageError('missing "--" separator before the command to run.');
  }

  const ownArgs = argv.slice(0, dashDashIndex);
  const commandArgs = argv.slice(dashDashIndex + 1);

  let callTool = null;
  let callArgsJson = null;

  for (let i = 0; i < ownArgs.length; i++) {
    if (ownArgs[i] === '--call') {
      callTool = ownArgs[i + 1];
      i += 1;
    } else if (ownArgs[i] === '--args') {
      callArgsJson = ownArgs[i + 1];
      i += 1;
    }
  }

  if (commandArgs.length === 0) {
    usageError('no command specified after "--".');
  }

  return {
    command: commandArgs[0],
    commandArgs: commandArgs.slice(1),
    callTool,
    callArgsJson,
  };
}

async function main() {
  const { command, commandArgs, callTool, callArgsJson } = parseArgs(process.argv.slice(2));

  let callArguments = {};
  if (callArgsJson !== null) {
    try {
      callArguments = JSON.parse(callArgsJson);
    } catch (err) {
      usageError(`--args value is not valid JSON: ${err.message}`);
    }
  }

  // stdio: pipe stdin/stdout so we can speak JSON-RPC to the child; inherit
  // stderr directly so it lands on our own stderr and never mixes with the
  // JSON-RPC channel on stdout.
  const child = spawn(command, commandArgs, {
    stdio: ['pipe', 'pipe', 'inherit'],
  });

  let spawnFailed = false;
  let spawnError = null;
  let childExited = false;
  let childExitCode = null;
  let childExitSignal = null;

  const pending = new Map(); // id -> { resolve, reject, timeoutHandle, method }

  function rejectAllPending(reason) {
    for (const [id, entry] of pending) {
      clearTimeout(entry.timeoutHandle);
      pending.delete(id);
      entry.reject(new Error(`${reason} (while waiting for response to id=${id}, method=${entry.method})`));
    }
  }

  child.on('error', (err) => {
    spawnFailed = true;
    spawnError = err;
    rejectAllPending(`child process failed to spawn ("${command}"): ${err.message}`);
  });

  child.on('exit', (code, signal) => {
    childExited = true;
    childExitCode = code;
    childExitSignal = signal;
    rejectAllPending(`child process exited (code=${code}, signal=${signal}) before responding`);
  });

  // Avoid unhandled 'error' events on stdin (e.g. EPIPE) crashing the process.
  child.stdin.on('error', () => {
    /* handled via the 'error'/'exit' events above */
  });

  const rl = readline.createInterface({ input: child.stdout, crlfDelay: Infinity });
  rl.on('line', (line) => {
    const trimmed = line.trim();
    if (trimmed === '') return;
    let msg;
    try {
      msg = JSON.parse(trimmed);
    } catch (err) {
      console.error(`probe.mjs: ignoring non-JSON line from child stdout: ${trimmed}`);
      return;
    }
    if (msg && typeof msg === 'object' && msg.id !== undefined && msg.id !== null) {
      const entry = pending.get(msg.id);
      if (entry) {
        clearTimeout(entry.timeoutHandle);
        pending.delete(msg.id);
        entry.resolve(msg);
      }
    }
    // Responses with no matching pending id (or server notifications) are ignored.
  });

  function sendRaw(obj) {
    child.stdin.write(JSON.stringify(obj) + '\n');
  }

  function sendRequest(obj, id) {
    return new Promise((resolve, reject) => {
      if (spawnFailed) {
        reject(new Error(`cannot send ${obj.method} (id=${id}): child process failed to spawn: ${spawnError ? spawnError.message : 'unknown error'}`));
        return;
      }
      if (childExited) {
        reject(new Error(`cannot send ${obj.method} (id=${id}): child process already exited (code=${childExitCode}, signal=${childExitSignal})`));
        return;
      }
      const timeoutHandle = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`timed out after ${REQUEST_TIMEOUT_MS}ms waiting for response to id=${id} (method=${obj.method})`));
      }, REQUEST_TIMEOUT_MS);
      pending.set(id, { resolve, reject, timeoutHandle, method: obj.method });
      try {
        sendRaw(obj);
      } catch (err) {
        clearTimeout(timeoutHandle);
        pending.delete(id);
        reject(err);
      }
    });
  }

  function finalExit(code) {
    setImmediate(() => process.exit(code));
  }

  function shutdownAndExit(code) {
    process.exitCode = code;
    if (childExited) {
      finalExit(code);
      return;
    }
    let called = false;
    const onExit = () => {
      if (called) return;
      called = true;
      finalExit(code);
    };
    child.once('exit', onExit);
    try {
      child.kill('SIGTERM');
    } catch (err) {
      // best-effort
    }
    // Fallback in case SIGTERM doesn't terminate the child quickly.
    setTimeout(() => {
      if (!called) {
        called = true;
        try {
          child.kill('SIGKILL');
        } catch (err) {
          // best-effort
        }
        finalExit(code);
      }
    }, 2000);
  }

  try {
    // 3a. initialize request
    const initResponse = await sendRequest(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-11-25',
          capabilities: {},
          clientInfo: { name: 'workshop-probe', version: '0.1.0' },
        },
      },
      1,
    );

    // 3b. log the protocol version the server actually returned. A server
    // returning a different version than requested is normal MCP behavior,
    // not a failure.
    const returnedProtocolVersion = initResponse && initResponse.result && initResponse.result.protocolVersion;
    console.error(`probe.mjs: server responded to initialize with protocolVersion=${returnedProtocolVersion}`);

    // 3c. initialized notification (no id, no reply expected)
    sendRaw({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} });

    // 3d. tools/list request
    const toolsListResponse = await sendRequest({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }, 2);

    const tools = (toolsListResponse.result && toolsListResponse.result.tools) || [];
    for (const tool of tools) {
      console.log(tool.name);
    }

    if (callTool) {
      const callResponse = await sendRequest(
        {
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: { name: callTool, arguments: callArguments },
        },
        3,
      );
      console.log('--- tools/call response ---');
      console.log(JSON.stringify(callResponse, null, 2));
    }

    shutdownAndExit(0);
  } catch (err) {
    console.error(`probe.mjs: transport-level failure: ${err.message}`);
    shutdownAndExit(1);
  }
}

main();
