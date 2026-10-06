# Scoped access guard

Notes for anyone maintaining or presenting this folder. It contains two files
besides this one: `guard.mjs`, the proxy itself, and
`claude-desktop-config.json`, an example of pointing a real MCP client at it.

## Why guard.mjs exists

`@pulumi/mcp-server` version 0.2.0 has no allow-list, read-only mode, or
tool-scoping flag of its own. This was checked against the published npm
package and its own bundled code on 2026-09-30: no match anywhere for
`ALLOWLIST`, `READ_ONLY`, or a `--tools` flag. The server registers and
exposes every tool it has over stdio, unconditionally, including
`pulumi-cli-up` and `deploy-to-aws`, the two tools that can mutate real
infrastructure.

`guard.mjs` supplies the boundary the server does not. It is a stdio proxy:
it spawns the real server as a child process, forwards `initialize`,
`notifications/initialized`, and `ping` through untouched, filters the
`tools/list` response down to an eight-tool allow-list (see the
`ALLOW_LIST` constant in `guard.mjs`), and answers any `tools/call` for a
tool outside that list with a JSON-RPC error instead of forwarding it.
`pulumi-cli-up` and `deploy-to-aws` never reach the real server's stdin
through this proxy.

## The live tool count is 12, not 10

Static analysis of the published package on 2026-09-30 found 10 tools.
Running the actual handshake against `npx @pulumi/mcp-server@0.2.0 stdio`
(`02-mcp-server/probe.mjs`, confirmed again during this build) returns 12:
the same 10, plus `pulumi-resource-search` and `neo-task-launcher`. Neither
was in the earlier static read.

This does not require a code change. `ALLOW_LIST` is an inclusion list, not
an exclusion list, so any tool name the real server reports that is not on
it is blocked automatically, whether or not it was known about when
`guard.mjs` was written. The `tools/list` probe above and the `tools/call`
refusal test in `06-blocked-apply` both confirm this directly against the
live 12-tool server: neither new tool appears in the filtered list, and a
`tools/call` for `neo-task-launcher` gets the same JSON-RPC refusal as
`pulumi-cli-up`. `neo-task-launcher` is worth naming specifically: its name
suggests it can launch a further agent task, which is exactly the kind of
capability a propose-only boundary exists to keep out, so its absence from
the allow-list is deliberate, not an oversight. `pulumi-resource-search`
reads as another read-only registry lookup alongside the five already
allowed, but it was not added to `ALLOW_LIST` in this build for lack of
time to confirm that from its actual schema; a future revision should
check and, if confirmed read-only, add it.

## Second layer: a read-only Pulumi Cloud access token

guard.mjs enforces its boundary inside a single workstation process. A bug
in its allow-list logic would be a single point of failure, so pair it with
a second, independent boundary enforced by Pulumi Cloud itself.

Use an organization access token, not a personal one. Per the Pulumi docs
on access tokens (https://www.pulumi.com/docs/administration/concepts/access-tokens/,
read 2026-09-30), personal access tokens "carry the same permissions as
your Pulumi Cloud user," including every organization membership, team
membership, and role assignment that applies to that user, and the docs
describe no way to scope a personal token narrower than that. An
organization token works differently: it "can do anything its assigned
RBAC role permits," so its permissions can be limited to exactly what the
automation needs.

Assign the organization token a role built on the built-in `Stack Read`
permission set. Per the Pulumi docs on permission sets
(https://www.pulumi.com/docs/administration/concepts/rbac/permission-sets/,
read 2026-09-30), `Stack Read` grants "basic read-only access to stacks"
and "allows for running previews," with scopes `stack:read`,
`stack:export`, `stack:encrypt`, `stack:decrypt`, `stack_deployment:read`,
`stack_deployment_settings:read`, `stack_access:read`, and
`stack_schedule:read`. It does not include `stack:write`; only
`Stack Write` and above add that. So a `pulumi up` run directly against a
stack with this token, from the CLI, bypassing guard.mjs entirely, is
refused by Pulumi Cloud itself: the update needs `stack:write` and the
token does not have it.

Availability caveat: that same docs page states permission sets are a Pro
and Enterprise feature. A free-tier or Essentials-tier organization may not
have custom roles or permission-set-level scoping available, and an
organization token there would fall back to the built-in Member or Admin
role, both of which include stack write access. In that case guard.mjs is
the only enforced boundary, and this second layer does not apply.

## Wiring the token through guard.mjs

Set `PULUMI_ACCESS_TOKEN`, in the environment guard.mjs runs in, to the
read-only organization token described above. guard.mjs spawns the real
`@pulumi/mcp-server` process as a child with `child_process.spawn`, and
Node child processes inherit the parent's environment by default, so the
real server picks up that token too. This is the point of the second
layer: even a bug in guard.mjs's allow-list that let a `pulumi-cli-up` call
through would still be refused by Pulumi Cloud, because the underlying
token cannot perform `stack:write`.
