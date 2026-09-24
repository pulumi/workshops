# 03-agent-client

Connects an MCP-compatible agent client to the server from `02-mcp-server`
with a token scoped to propose changes but not apply them, and proves the
scope with `verify-scope.sh`.

## Setting up a propose-only agent token

The agent client here must be able to describe and preview
`01-base-stack`, and must not be able to apply a change to it. Pulumi
Cloud's building block for that is an **organization access token** carrying
a **custom role**, not a personal access token — a personal token always
inherits the full permissions of the user who created it
(https://www.pulumi.com/docs/administration/concepts/access-tokens/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops,
read 2026-09-24).

1. In the Pulumi console, create a custom role granting the **Stack Read**
   permission set on the `01-base-stack` project/stack, and withhold
   **Stack Write**. `Stack Read` explicitly covers running previews;
   `Stack Write` is required for `pulumi up`
   (https://www.pulumi.com/docs/administration/concepts/rbac/permission-sets/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops,
   read 2026-09-24).
2. Create an organization access token and attach that custom role to it.
3. Export it as `PULUMI_ACCESS_TOKEN` in the shell the agent client and
   `verify-scope.sh` run in. Never write it to a file in this repo.

## How to work here

- `verify-scope.sh` requires a real `PULUMI_ACCESS_TOKEN` scoped as above;
  it cannot be exercised end to end without Pulumi Cloud credentials, which
  this build does not have (see the PR description). Read the script before
  running it against a real account.
- **Open question, not resolved in this build:** custom roles and
  organization access tokens with a custom role both require a **Pro or
  Enterprise** plan
  (https://www.pulumi.com/pricing/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops,
  read 2026-09-24) — the brief assumes a free-tier participant account. The
  root README's prerequisites use a presenter-hosted Pro/Enterprise
  organization as the fallback; do not tell participants a free personal
  account is enough for this step.
- Shellcheck clean (`.shellcheckrc` at the folder root of this workshop).
