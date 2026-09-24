# AGENTS.md — slides

The deck for "Give your AI agent the keys, safely."

## The workshop

- Title: Give your AI agent the keys, safely: building and governing
  MCP-based infrastructure agents
- Length: 90 minutes
- Sessions and dates: not yet scheduled (see the folder's root `README.md`,
  "Sessions and speakers")
- Speakers: not yet assigned; the deck ships with an obvious placeholder
  speaker slide and Q&A slide, both marked with a `TODO(presenter)` comment
- Owner of each half: demo code and this deck were both built on
  `anvil/iac-ai-agents-keys-safely`; see the pull request for what each run
  verified

## The original request, in order of authority

1. [Workshop brief](https://workprentice.ai/documents/49a37a73-7d7c-4070-98f3-a1c236152ee3)
   — the contract for scope, audience, level, length, and the five learning
   outcomes.
2. `../README.md` and `../AGENTS.md` — this workshop's own conventions and
   demo layout.
3. The `slidev-deck` and `workshop-deck` skills — how a Pulumi Slidev deck
   is built and what shape a workshop deck takes.

## Structure and minute budget

Frame (12 min): title (1), speaker placeholder (1), housekeeping (2),
agenda (2), hook (5), pain beat (2, folded together as 6 min of framing
before the mechanism slides... see note below).

Actual per-slide budget, in slide order (sums to 90):

1, 1, 2, 2, 5, 2, 6, 6, 4, 1, 7, 6, 6, 9, 7, 6, 8, 6, 2, 3

The two richest slides are deliberate: reading an agent's diff (9 min) is
the outcome the workshop earns, and where this breaks today (8 min) is the
credibility slide naming real limitations.

## §5 mapping

The brief's §5 lists 12 middle entries. This deck gives each one exactly
one slide, in order, and additionally uses entry 1 to also carry the
opening hook (a "statement" beat slide sits between entry 1 and entry 2
purely as a narrative pause, per the workshop-deck skill's guidance to give
the room a beat between sections; it does not claim to be its own §5
entry).

| §5 # | Slide | Demo folder |
|---|---|---|
| 1 | Why agents want infrastructure now | none |
| 2 | What an MCP server actually exposes | none |
| 3 | The permission boundary that matters | none |
| 4 | Meet the stack | `01-base-stack` |
| 5 | Standing up the MCP server | `02-mcp-server` |
| 6 | Connecting the agent | `03-agent-client` |
| 7 | Asking for a change | `04-propose-change` |
| 8 | Reading an agent's diff like a reviewer | `05-review-diff` |
| 9 | Watching the boundary hold | `06-blocked-apply` |
| 10 | Approving and applying | `07-approve-and-apply` |
| 11 | Where this breaks today | none |
| 12 | Teardown and takeaways | `08-teardown` |

## Sources read for this deck, with the date

- `pulumi.com/docs/ai/mcp-server/` — hosted vs local MCP server, available
  tools. Read 2026-09-24.
- `pulumi.com/docs/administration/concepts/rbac/permission-sets/` —
  `Stack Read` and `Stack Write` scope contents, Pro/Enterprise gating.
  Read 2026-09-24.
- `pulumi.com/docs/administration/concepts/audit-logs/` — audit log
  contents, Essentials-and-above gating. Read 2026-09-24.
- Conference program counts and Pulumi blog posts cited in the pull
  request's "Why now" section, read 2026-09-21 and 2026-09-24.
- Live command output: `02-mcp-server/preflight.sh` and `tools-list.sh`,
  re-run during this deck build. `tools-list.sh` reported 12 tools total;
  `preflight.sh`'s own summary line reported 13 in the same run. Neither
  count is printed on a slide, since the folder's own `AGENTS.md` says
  never to hardcode a tool list or count on a slide; the deck instead
  tells presenters to say "this run" and read the live count off the
  terminal.

## Deviations from the demo, and why

- No live command output is quoted verbatim from `06-blocked-apply`,
  because the exact permission-denied error text has never been captured
  against a real Pulumi Cloud account in any build so far (see
  `06-blocked-apply/AGENTS.md`). The speaker note says to capture the real
  text the first time this runs live and use that from then on.
- The custom-roles-need-Pro-or-Enterprise open question (from
  `03-agent-client/AGENTS.md`) is called out explicitly on the "Connecting
  the agent" slide rather than smoothed over, since the brief assumes a
  free-tier participant account.

## Rules that still bind

Everything in `../AGENTS.md`: stay inside this folder, Pulumi product
names come from docs read during the run that touched them (Pulumi Neo,
Pulumi ESC, Pulumi Cloud, Pulumi IaC, pulumi console lowercase; never
"Copilot," "Pulumi Service," "Insights," or "CrossGuard"), every
`pulumi.com` link in a file this folder's authors write carries the UTM
params required by the root `AGENTS.md`, and Conventional Commits scoped
to this folder.
