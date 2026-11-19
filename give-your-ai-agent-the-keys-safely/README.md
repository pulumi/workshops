# Give your AI agent the keys, safely: building and governing MCP-based infrastructure agents

A 90-minute workshop for platform and DevOps engineers who already provision
infrastructure with Pulumi or Terraform and want to let an AI agent propose
changes to it, without letting the agent apply them unsupervised. The demo
stands up a real MCP server in front of a real Pulumi stack, connects an
agent to it through a permission boundary that only allows reading and
proposing, and walks through what a reviewer must check on an agent-authored
diff that a human-authored one would not need.

## Sessions and speakers

None scheduled yet. This folder holds the demo code only; no event, date, or
speaker has been assigned. `04-propose-change/AGENT-SESSION.md` and the slide
deck are the next steps once a delivery date exists.

## What attendees learn

1. Given an MCP server's tool manifest, state which infrastructure operations
   it exposes to an agent and which it does not, and explain why that
   boundary is a security control, not an implementation detail.
2. Stand up a minimal MCP server in front of an existing Pulumi stack, from
   this repo, in under 15 minutes.
3. Configure agent permissions so it can propose a change but cannot apply
   one without a human step, and watch an unauthorized apply attempt get
   blocked.
4. Given an agent-generated infrastructure diff, identify at least two things
   a reviewer must check that a human-authored diff would not need checked.
5. Name two current limitations of agentic IaC tooling, so participants leave
   able to explain the gaps as well as the capabilities.

## Known limitations

Two gaps worth naming plainly rather than glossing over, both visible in this
demo:

- **Audit trail completeness.** Pulumi Cloud's activity log records who ran
  `pulumi up` and when, but it does not on its own distinguish a change a
  human typed from one an agent proposed and a human approved. This demo's
  audit trail is the MCP transport itself: `06-blocked-apply/try-apply.sh`
  shows the refusal at the point it happens, not a Pulumi Cloud feature
  built for this purpose.
- **State-file races under concurrent edits.** Nothing in this repo's guard
  or workflow prevents a human running `pulumi up` from a laptop at the same
  moment an agent's proposal is being reviewed. Both would read the same
  stack state; whichever applies second either conflicts or silently
  overwrites assumptions the other made. Pulumi's state locking prevents two
  concurrent applies from corrupting the state file, but it does not prevent
  the two from disagreeing about what should be true.

## Layout

```
give-your-ai-agent-the-keys-safely/
├── README.md              this file
├── AGENTS.md              conventions for agents (and humans) editing this folder
├── 01-base-stack/         the Pulumi TypeScript stack an agent will be asked to change: a VPC, one subnet, an S3 bucket for artifacts
├── 02-mcp-server/         launches @pulumi/mcp-server against that stack; probe.mjs is a scriptable stdio client for the tools/list handshake
├── 03-scoped-access/      guard.mjs, the allow-list proxy that gives an agent read-plus-preview and nothing else
├── 04-propose-change/     the prompt given to the agent and the diff it proposes, not a change to the live stack
├── 05-review-the-diff/    the checklist a human runs against that diff before anyone applies it
├── 06-blocked-apply/      proves the apply is refused, at the proxy layer and (documented) at the Pulumi Cloud token layer
├── 07-approve-and-apply/  a human fixes what the review found, then applies the corrected change for real
└── 08-teardown/           pulumi destroy and stack removal, with a manual confirmation step
```

The numbered folders are the demo's eight steps, in order: stand up the
stack (`01`), stand up the server (`02`), scope what an agent can reach
(`03`), ask for a change (`04`), review what came back (`05`), watch an
unauthorized apply fail (`06`), approve and apply the reviewed fix (`07`),
tear down (`08`).

`04-propose-change` and `05-review-the-diff` stay as separate folders rather
than one, because they have different end states and different audiences:
`04` is what the agent produces, `05` is what a human does with it. Merging
them would blur the one place in this demo where the reviewer's judgment,
not the agent's output, is the point.

`@pulumi/mcp-server` version 0.2.0 has no allow-list, read-only mode, or
tool-scoping flag of its own. Every tool it registers, including the two
that can mutate infrastructure, (`pulumi-cli-up`, `deploy-to-aws`), is exposed
over stdio unconditionally. `03-scoped-access/guard.mjs` supplies the
boundary the server does not. See `03-scoped-access/AGENTS.md` for the full
finding, including a live discrepancy this build turned up between what
static analysis of the package found and what the running server actually
reports.

## Prerequisites

**To run the demo against real infrastructure:**

- An AWS account with billing enabled, and credentials available to the
  Pulumi AWS provider (either `aws configure` or an ESC
  environment works; this repo does not assume one over the other).
- A [Pulumi Cloud](https://app.pulumi.com/signup) account and a personal
  access token, or an organization token if you want to exercise the
  read-only-token layer described in `03-scoped-access/AGENTS.md`.
- Node.js 20 LTS or newer, and npm.
- The Pulumi CLI, pinned to **3.263.x** in `01-base-stack/package.json`'s
  peer expectations. 3.263.0 was the latest patch on that line as of
  2026-09-30; 3.265.0 is the actual current release as of the same date, two
  releases ahead. This repo keeps the pin the brief specified rather than
  moving to the newer line; re-pin deliberately, not as a side effect of an
  unrelated change.
- An MCP-compatible agent client. `03-scoped-access/claude-desktop-config.json`
  shows the wiring for Claude Desktop; `02-mcp-server/probe.mjs` is a
  scriptable stdio client this repo uses for verification and works with any
  MCP server without a GUI client installed. Which one to standardize the
  live demo on is still open; see `04-propose-change/AGENT-SESSION.md`.

**Estimated cost:** under $2 for a full run-through. The VPC and subnet are
free; S3 storage and requests for a session-length demo are negligible. This
figure has not been re-verified against current AWS pricing in this build;
re-check close to delivery, per this repo's `AGENTS.md`.

## Run the slides

Not built yet. This run of the pipeline covers the demo code only; the slide
deck is the next assignment on this branch.

## Run the demo

```bash
# 1. Stand up the base stack.
cd 01-base-stack
npm install
pulumi stack init dev
pulumi up                          # end state: a running stack in Pulumi Cloud, no agent involved yet
cd ..

# 2. Stand up the MCP server against that stack, and confirm it is live.
node 02-mcp-server/probe.mjs -- npx -y @pulumi/mcp-server@0.2.0 stdio
# end state: a tools/list response naming the server's tools (12, as of this build; see
# 03-scoped-access/AGENTS.md for the exact count and why it is not the number static analysis found)

# 3. Connect an agent through the scoped proxy instead of the raw server, and confirm the
# boundary: the same probe against guard.mjs returns only the 8-tool read-plus-preview list.
node 02-mcp-server/probe.mjs -- node 03-scoped-access/guard.mjs
# end state: the agent can describe the stack's resources but pulumi-cli-up is not among the
# tools it can call

# 4. Ask the agent, in natural language, to add a second S3 bucket for logs.
# 04-propose-change/PROMPT.md has the exact instruction; 04-propose-change/proposed.diff is
# what came back in this build. AGENT-SESSION.md narrates the shape of that exchange -- it is
# illustrative, not a captured transcript, since a live run needs a real MCP client and AWS
# credentials this build environment does not have.
# end state: a diff, not a change to the live stack

# 5. Review the diff as a group against 05-review-the-diff/REVIEW.md's two checks.
# end state: this build's review found a real, minor flaw -- the proposed bucket does not
# carry the same tags as everything else in the file -- worth keeping as a genuine example of
# what a reviewer catches, not a contrived one.

# 6. Try the apply anyway, and watch it fail.
06-blocked-apply/try-apply.sh
# end state: blocked at the proxy layer (this script runs that attempt for real); the token
# layer is documented in the same script and in 03-scoped-access/AGENTS.md but not executed in
# this build, since this workstation has no Pulumi Cloud credentials

# 7. Fix what the review found, then approve and apply for real.
07-approve-and-apply/approve-and-apply.sh
# end state: the new bucket exists, correctly tagged this time

# 8. Tear down.
08-teardown/destroy.sh
# end state: clean AWS account, confirmed by looking, not just by the command's exit code
```

Steps 1, 6, 7 and 8 need real AWS and Pulumi Cloud credentials and were not
executed against live infrastructure during this build; each script was
written and, where it is shell, shellchecked, but says so plainly rather than
claiming a run it did not have. Steps 2 and 3 were executed for real against
the published `@pulumi/mcp-server@0.2.0` package during this build, including
the blocked `tools/call` in step 6's proxy layer. `01-base-stack` compiles
clean with `npx tsc --noEmit`, both before and after `04-propose-change`'s
diff is applied to it.

## Sources

Facts in this repo come from these pages, read on 2026-09-30 unless noted:

- Pulumi Neo, generally available: https://www.pulumi.com/product/neo/ and
  https://www.pulumi.com/docs/ai/neo/
- Pulumi Neo Security, a research preview and not GA:
  https://www.pulumi.com/blog/pulumi-neo-security/ (Joe Duffy, 2026-08-28).
  This resolves the open question the workshop brief carried about whether
  Neo Security would have reached GA by build time; it had not, as of this
  read.
- Neo's own read-only and propose-then-approve mode, the product-native
  analogue of what this demo hand-builds:
https://www.pulumi.com/docs/ai/neo/get-started/
- `@pulumi/mcp-server` package and its lack of an allow-list or read-only
  flag: https://www.pulumi.com/docs/ai/mcp-server/ and the published npm
  package itself (`@pulumi/mcp-server@0.2.0`, inspected directly)
- Pulumi Cloud access tokens: https://www.pulumi.com/docs/administration/concepts/access-tokens/
- Pulumi Cloud RBAC permission sets, including the Pro/Enterprise-only
  caveat on custom roles: https://www.pulumi.com/docs/administration/concepts/rbac/permission-sets/
- MCP specification, current revision 2026-07-28, previous 2025-11-25:
https://modelcontextprotocol.io/specification/. The live server in this
  build negotiated 2025-11-25.
- `aws.s3.Bucket` vs. the deprecated `aws.s3.BucketV2`: checked directly
  against the installed `@pulumi/aws@7.48.0` on the Pulumi AWS registry.
