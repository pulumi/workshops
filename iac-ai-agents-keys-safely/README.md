# Give your AI agent the keys, safely

A 90-minute workshop for platform and DevOps engineers who already use
Pulumi or Terraform and want an AI agent to help with infrastructure —
without giving it the keys outright.

> Coding agents changed how software gets written, but almost nobody lets
> one near their infrastructure. This workshop is about doing that anyway:
> stand up an MCP server in front of a real IaC stack, connect an agent to
> it with permissions scoped to propose rather than apply, and read an
> agent-generated infrastructure diff the way a reviewer should — catching
> what a human-authored diff would not need checking.
>
> — [Workshop brief](https://workprentice.ai/documents/49a37a73-7d7c-4070-98f3-a1c236152ee3)

## Sessions and speakers

| Session | Date | Length |
|---|---|---|
| Not yet scheduled | — | 90 min |

Speakers: not yet assigned. No event page exists for this workshop; see
"No date yet" below.

## What attendees learn

The five outcomes from the brief are the spine of the deck:

1. Given an MCP server's tool manifest, state which infrastructure
   operations it exposes to an agent and which it does not, and explain why
   that boundary is a security control, not an implementation detail.
2. Stand up a minimal MCP server in front of an existing Pulumi stack, from
   this starter repo, in under 15 minutes.
3. Configure agent permissions so it can propose a change but cannot apply
   one without a human step, and see an unauthorized apply correctly
   blocked.
4. Given an agent-generated infrastructure diff, identify at least two
   things a reviewer must check that would not need checking on a
   human-authored diff.
5. Name two current limitations of agentic IaC tooling, so participants
   leave able to explain the gaps, not just the capabilities.

## Layout

```
iac-ai-agents-keys-safely/
├── README.md               this file
├── AGENTS.md                conventions for agents (and humans) editing this folder
├── 01-base-stack/           Pulumi TypeScript: VPC + subnet + artifact S3 bucket (us-east-1)
├── 02-mcp-server/           stands up the local Pulumi MCP server, proves its tool manifest
├── 03-agent-client/         connects an agent client with a propose-only (Stack Read) token
├── 04-propose-change/       the agent's proposed change, previewed against a scratch copy
├── 05-review-diff/          the two reviewer checks from outcome 4, run against the proposal
├── 06-blocked-apply/        the agent's token attempts pulumi up — expected to fail
├── 07-approve-and-apply/    a human, holding Stack Write, applies the reviewed change
└── 08-teardown/             unprotect, empty the buckets, destroy
```

`slides/` does not exist yet — the deck is a separate, later run on this
same branch (see "Run the slides" below).

The numbered folders follow the demo's eight beats in order: baseline (`01`),
server (`02`), client (`03`), propose (`04`), review (`05`), blocked apply
(`06`), approved apply (`07`), teardown (`08`). Nothing is built for the demo
beyond `01-base-stack`; `02-mcp-server` runs the published
[`@pulumi/mcp-server`](https://www.npmjs.com/package/@pulumi/mcp-server) as-is.

## Prerequisites

**Participants:**

- A free-tier AWS account with billing enabled, and either
  `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` or an `AWS_PROFILE` exported
  before running anything in `01-base-stack` or `04-propose-change`.
- Node.js **20 LTS or newer**, and the Pulumi CLI **3.263.x or newer**
  pre-installed. Node 20 reached end of life in March 2026; this repo was
  verified on Node 22.23.2 (Maintenance LTS) — Node 24 (Active LTS) also
  works. `engines` in each `package.json` is set to `>=20` per the brief's
  pin, but do not install Node 20 itself for a new machine.
- An MCP-compatible agent client installed in advance (see the open
  question below — no client is standardized yet).
- **For step 3 onward**, a Pulumi Cloud organization access token scoped to
  a custom role with the Stack Read permission set (not Stack Write) —
  see [`03-agent-client/AGENTS.md`](03-agent-client/AGENTS.md). Custom
  roles require a **Pro or Enterprise** Pulumi Cloud plan
  (https://www.pulumi.com/pricing/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops,
  read 2026-09-24), which the brief's free-tier assumption does not cover —
  see "Open questions" below.

**Presenter:**

- This starter repo re-tested within 48 hours of delivery.
- A demo AWS account with a hard budget alarm.
- A Pulumi Cloud Pro or Enterprise organization to issue the scoped token
  above.
- A recorded fallback for steps 3–7 (agent connection through approved
  apply), in case the live agent client or Pulumi Cloud RBAC setup fails on
  stage.
- A spare agent client login.

## Run the slides

Not yet built. The slides follow the demo in a later run on this branch —
see "Next step" in the pull request.

## Run the demo

Set up once, then run steps 2 onward as often as you like:

```bash
# 0. once: install dependencies and bring up the baseline stack
cd 01-base-stack && npm install
pulumi login <your-backend>
pulumi stack init dev
pulumi config set aws:region us-east-1 --stack dev
pulumi up --stack dev                          # creates the VPC, subnet and protected artifact bucket
cd ..

# 1. once: check the MCP server answers a real tool-list request
02-mcp-server/preflight.sh
02-mcp-server/tools-list.sh

# 2. once: set up a Stack-Read-only agent token (see 03-agent-client/AGENTS.md)
export PULUMI_ACCESS_TOKEN=<the scoped token>
03-agent-client/verify-scope.sh

# 3. the agent proposes a change (preview only, no apply)
04-propose-change/propose.sh

# 4. review the proposal against the two reviewer checks from outcome 4
05-review-diff/review-diff.sh 04-propose-change/logs-bucket.patch

# 5. show the agent's token cannot apply on its own
06-blocked-apply/try-apply.sh                  # expected to fail — that is success

# 6. a human, holding Stack Write, approves and applies
unset PULUMI_ACCESS_TOKEN                      # switch back to your own, full-permission identity
07-approve-and-apply/approve-and-apply.sh
cd 01-base-stack && pulumi up --stack dev && cd ..

# between runs / after the last session
08-teardown/destroy.sh
```

## Estimated cost and teardown

Under $2 for the full workshop, per the brief's estimate — the VPC and its
one subnet carry no hourly charge with no NAT gateway or interface endpoint,
and S3 storage and requests at this scale are negligible (S3 Standard
$0.023/GB-month for the first 50 TB, $0.005 per 1,000 PUT/COPY/POST/LIST
requests, $0.0004 per 1,000 GET requests —
https://aws.amazon.com/s3/pricing/ and https://aws.amazon.com/vpc/pricing/,
read 2026-09-24). Not independently re-verified against a real AWS bill in
this build.

Teardown is `08-teardown/destroy.sh`. It is not the plain `pulumi destroy`
the brief describes — both S3 buckets carry `protect: true` and the
artifact bucket is versioned, so the script unprotects, empties every
version and delete marker, and destroys, in that order. Verify no leftovers
against the AWS console before ending the session.

## Open questions (from the brief, plus one dated finding)

> Open questions: which MCP client to standardize the live demo on (Claude
> Desktop vs. a scriptable CLI client); whether Neo Security's
> research-preview status will have progressed to GA by build time; final
> event target and its CFP deadline

Dated finding on the second question: as of 2026-09-24, Pulumi Neo Security
is still listed as "Now in research preview"
(https://www.pulumi.com/blog/pulumi-neo-security/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops);
no separate `/docs/` page exists yet. Re-check close to delivery — this
workshop does not use Neo Security, but the deck may want to mention it as
a related, evolving capability.

A fourth open question surfaced while building this demo, not in the
original brief: the brief assumes participants can complete step 3 on a
free-tier Pulumi Cloud account, but custom roles and organization access
tokens with a custom role both require Pro or Enterprise. See
[`03-agent-client/AGENTS.md`](03-agent-client/AGENTS.md).

## No date yet

This workshop has no event scheduled. The brief's evidence for the topic
(read 2026-09-21): 11 independent signals across conference programs
(KubeCon EU 2026: 12 sessions; AWS re:Invent 2026: 171; PlatformCon 2026:
112 of 416 sessions; QCon London 2026: sessions in this theme rose 9→16;
QCon San Francisco 2026: 16 of 65 sessions) and vendor primary-source
announcements. Nobody has scheduled a delivery date or assigned speakers.

## Sources

Facts in this README and in the folder `AGENTS.md` files come from these
pages, read on 2026-09-24 unless noted otherwise:

- Workshop brief: https://workprentice.ai/documents/49a37a73-7d7c-4070-98f3-a1c236152ee3
- AWS access, MCP server package: https://www.npmjs.com/package/@pulumi/mcp-server (last published 2025-09-26)
- Local MCP server tool manifest: captured live from a real JSON-RPC initialize + tools/list against @pulumi/mcp-server@0.2.0 stdio, this run
- Hosted MCP server: https://www.pulumi.com/docs/ai/mcp-server/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops
- RBAC permission sets: https://www.pulumi.com/docs/administration/concepts/rbac/permission-sets/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops
- Access tokens: https://www.pulumi.com/docs/administration/concepts/access-tokens/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops
- Audit logs: https://www.pulumi.com/docs/administration/concepts/audit-logs/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops
- Pricing tiers: https://www.pulumi.com/pricing/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops
- Pulumi Neo: https://www.pulumi.com/product/neo/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops
- Pulumi Neo Security (research preview): https://www.pulumi.com/blog/pulumi-neo-security/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops
- MCP spec current revision: https://modelcontextprotocol.io/specification/2026-07-28 (negotiated live at 2025-11-25 by this server)
- AWS S3 pricing: https://aws.amazon.com/s3/pricing/
- AWS VPC pricing: https://aws.amazon.com/vpc/pricing/
