#!/usr/bin/env node
// mcp-client.js — a minimal JSON-RPC-over-stdio client for the Pulumi MCP
// server, used by preflight.sh and tools-list.sh. Not a general MCP client:
// it sends exactly one request after initialize, prints the result, and
// exits. Node is used here (not jq) because this workstation has no jq.
//
// Usage: node mcp-client.js <method> [params-json]
// Example: node mcp-client.js tools/list

const { spawn } = require("child_process");

const method = process.argv[2];
const params = process.argv[3] ? JSON.parse(process.argv[3]) : {};

if (!method) {
    console.error("usage: node mcp-client.js <method> [params-json]");
    process.exit(2);
}

const pkg = process.env.WORKSHOP_MCP_SERVER_PKG || "@pulumi/mcp-server@0.2.0";
const proc = spawn("npx", ["-y", pkg, "stdio"], { stdio: ["pipe", "pipe", "pipe"] });

let buf = "";
const responses = [];

proc.stdout.on("data", (d) => {
    buf += d.toString();
    let idx;
    while ((idx = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, idx);
        buf = buf.slice(idx + 1);
        if (line.trim().length === 0) continue;
        try {
            responses.push(JSON.parse(line));
        } catch {
            // non-JSON line on stdout; ignore
        }
    }
});

proc.stderr.on("data", (d) => process.stderr.write(d));

function send(msg) {
    proc.stdin.write(JSON.stringify(msg) + "\n");
}

send({
    jsonrpc: "2.0",
    id: 0,
    method: "initialize",
    params: {
        protocolVersion: "2025-11-25",
        capabilities: {},
        clientInfo: { name: "workshop-demo-client", version: "0.1.0" },
    },
});

const TIMEOUT_MS = Number(process.env.WORKSHOP_MCP_TIMEOUT_MS || 8000);

setTimeout(() => {
    send({ jsonrpc: "2.0", method: "notifications/initialized" });
    send({ jsonrpc: "2.0", id: 1, method, params });
}, 1200);

setTimeout(() => {
    const result = responses.find((r) => r.id === 1);
    proc.kill();
    if (!result) {
        console.error(`no response to "${method}" within ${TIMEOUT_MS}ms`);
        process.exit(1);
    }
    if (result.error) {
        console.error(JSON.stringify(result.error, null, 2));
        process.exit(1);
    }
    console.log(JSON.stringify(result.result, null, 2));
    process.exit(0);
}, TIMEOUT_MS);
