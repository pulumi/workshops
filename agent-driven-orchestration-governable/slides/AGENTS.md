
# AGENTS.md — the deck's brief and sources

This file records what the deck was asked to be and which sources it was
built from, so anyone (human or agent) editing `slides.md` works from the
same brief. Folder-wide conventions are in `../AGENTS.md`.

## The workshop

"Putting Agents to Work — Agent-Driven Orchestration You Can Govern, Trust
and Repeat." Pulumi delivery calendar, 2026-10-28, 90 minutes. Event page,
session times, and speakers are all unknown as of this build; there is one
placeholder speaker slide because the count of speakers is not yet known.

## The original request

The deck was built from these inputs, in this order of authority:

1. The workshop brief:
   https://workprentice.ai/documents/fbc38b5e-bfd3-47ad-bb28-e2b212952051
2. The board card for this workshop (backlog id
   `agent-driven-orchestration-governable`).
3. The demo code in `../01-fleet` through `../06-teardown`, built in an
   earlier run on this branch and treated as fixed: every command shown on a
   slide is one the demo actually runs.
4. The `workshop-deck` and `slidev-deck` skills, which set the fixed slide
   arc (title, speakers, housekeeping, agenda, hook, pain, solution, demo,
   follow-up, Q&A) and the Slidev mechanics (theme layouts, Mermaid, QR
   codes).
5. `pulumi/workshops/neo-in-a-docker-sandbox`, the reference implementation,
   read for its `slides.md` structure, `style.css` card primitives, the
   `QRCode.vue` component, and how it lays out its speaker and closing
   slides.

Structure asked for (§5 of the brief, 90 minutes total across speaker-note
budgets): title, speaker, housekeeping (frame); who this is for and
prerequisites (2 min); the promise (1 min); agenda (2 min); the hook (5 min);
two ways to let an agent act (5 min); Automation API in one diagram (7 min);
the governance gate (6 min); live demo section plus two demo slides (1 + 14 +
18 min); what just happened (4 min); stretch goal (5 min); where to take this
next (4 min); recap of learning outcomes (4 min); follow-up and Q&A (frame).
Every §5 entry got one slide, in the brief's order, between the frame's
housekeeping/agenda and its follow-up/Q&A.

## Sources read for this build (2026-09-26)

- https://www.pulumi.com/docs/iac/concepts/automation-api/ — Automation API
  concepts, used for slide 9 (the sequence diagram) and slide 18 (learning
  outcome wording).
- https://www.pulumi.com/docs/discovery-governance/ — Pulumi Policies
  overview (preventative vs. audit mode), used for slide 11 (the governance
  gate).
- https://www.pulumi.com/docs/ai/ — confirms current product names (Pulumi
  Neo, MCP server, Agent Skills, agent-friendly CLI) for slide 8.
- QR targets confirmed reachable this run: https://slack.pulumi.com (200),
  https://app.pulumi.com/signup (200), the PR
  https://github.com/pulumi/workshops/pull/239 (200). The folder path
  `pulumi/workshops/tree/main/agent-driven-orchestration-governable` returns
  404 until the PR merges, so the repo QR points at the PR instead — update
  it to the folder URL once merged.

## Deviations from the brief's §5 wording

- **Two-cols slot (§5.6).** The theme's `two-cols` layout exposes only
  `::header::`, `::left::`, and `::right::` slots — no default slot. A plain
  left column with no slot marker renders blank with no build error. Both
  columns on slide 8 use explicit `::left::`/`::right::`.
- **The approval-gate substitution (§5.8, §5.10).** The brief's §4 describes
  the policy rule as inspecting stack configuration directly
  (`demo:approved = true`). Pulumi Policies has no documented way to read
  `pulumi.Config` from inside a policy; the demo (see `../02-policy/AGENTS.md`)
  carries the flag on a `random.RandomId` change-marker resource's `keepers`
  instead, and the rule reads it from there via `validateResourceOfType`.
  Slide 11 states this gap out loud rather than repeating the brief's
  literal wording.
- **Teardown is not a §5 slide.** `06-teardown/teardown.sh` appears in the
  speaker notes of slide 13 (when to reset between attempts) and on slide 17
  ("where to take this next"), never as its own numbered slide — it is a
  presenter/attendee reset step, not a taught concept.
- **Prerequisites folded into slide 4.** The brief's §6 prerequisites (Node
  20.x LTS, Pulumi CLI, no cloud credentials, no Pulumi Cloud account, no
  live-coding along) are not a separate slide; they sit on the same "who this
  is for" slide as the §5.2 audience description, since participants do not
  follow along live and the prerequisites are a single supporting fact about
  the audience.

## Rules that still bind

- Every command shown is one the demo runs, with the same flags: verified
  against `../03-orchestrator/orchestrator.ts`, `../04-audit`, and
  `../05-llm-stretch` on slides 13, 14, and 16.
- Canonical names only: Pulumi Neo, Pulumi ESC, Pulumi Cloud, Pulumi IaC,
  Pulumi Policies, pulumi console (lowercase). Never "Copilot", "Pulumi
  Service", "Insights", "CrossGuard".
- No em dashes or en dashes anywhere in `slides.md` — checked with a grep
  pass after every edit round, not just once at the end.
- Speaker slide is an explicit placeholder (`public/img/speaker-placeholder.png`,
  "Speaker Name", `@handle`, a `<!-- TODO(presenter): … -->` comment). Do not
  fill in an invented name, photo, or bio.
- `mermaid` and `qrcode` are real dependencies in `package.json`, not
  assumed transitively.

## Check before committing

```bash
npm run build && npm run export
```

Both passed for this build. The export needs `playwright-chromium` as a
devDependency (added during this build; the base theme starter does not
include it) and, on this workstation, the shared libraries documented in
this agent's `slidev_export_missing_chromium_libs` memory entry. Render the
exported PDF to page images and look at every slide; a clean build can still
clip or mis-slot a diagram.
