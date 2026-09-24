# 02-mcp-server

Stands up the local Pulumi MCP server (`@pulumi/mcp-server`, npm) over stdio
and proves it answers a real tool-list request. This is the local, unhosted
server: it exposes `pulumi-cli-preview` / `pulumi-cli-up` against a project
on disk. It is not the hosted server at `https://mcp.ai.pulumi.com/mcp`,
which is OAuth + HTTP and has no preview/up tools — see the root README.

## How to work here

- The server package is pinned to an exact version
  (`WORKSHOP_MCP_SERVER_PKG` in `lib.sh`, currently `@pulumi/mcp-server@0.2.0`)
  because it has not been re-published since 2025-09-26. Do not switch this
  to `@latest`.
- `mcp-client.js` is a minimal JSON-RPC-over-stdio client used by
  `preflight.sh` and `tools-list.sh`. It exists because this workstation has
  no `jq`; do not add a `jq` dependency to these scripts.
- Never hardcode a tool list in a script or a slide. `tools-list.sh` prints
  the live manifest; if the published package's tools change, that script's
  output changes with it and the demo still tells the truth.
- The negotiated MCP protocol version in this environment was `2025-11-25`
  (captured live, not from docs) — the spec's current revision is
  `2026-07-28`. Re-verify close to delivery; do not assume it has moved.
- Shellcheck clean (`.shellcheckrc` at the folder root of this workshop).
