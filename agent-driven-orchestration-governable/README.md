# Putting Agents to Work — Agent-Driven Orchestration You Can Govern, Trust and Repeat

A local, credential-free demo: a scripted stand-in agent drives a Pulumi
program through four infrastructure changes via Automation API, every change
is gated by a mandatory Pulumi Policies pack, and every attempt — approved or
blocked — lands in an append-only audit log the presenter reads back at the
end. No cloud account, no AWS/Azure/GCP credentials: the only provider in
play is `@pulumi/random`, so every `pulumi up` completes in seconds and costs
$0.

> An agent that scales a fleet or rotates a secret in staging is not
> remarkable anymore. What is still rare is proving, after the fact, that the
> change was approved, logged, and reproducible. This workshop builds that
> proof: a scripted orchestrator drives a Pulumi program through four
> infrastructure changes, a mandatory policy pack gates every one, and an
> audit log written by the run itself records what happened and why.
>
> — Workshop pitch (event page not yet published)

## Sessions and speakers

| Session | Date | Length |
|---|---|---|
| TBD | October 28, 2026 | 90 min |

No public event page, session times, or speakers are assigned as of this
build; the date comes from Pulumi's internal delivery calendar. This section
will be filled in once the event page goes live.

## What attendees learn

The five outcomes from the workshop brief are the spine of the deck:

1. Describe how Automation API differs from the Pulumi CLI, and identify a
   use case where driving Pulumi programmatically (rather than via
   `pulumi up`) is the right choice.
2. Configure a policy pack rule that blocks a stack update unless an explicit
   approval flag is present.
3. Wire a scripted orchestrator that issues a sequence of infrastructure
   changes through Automation API and observe the policy pack accept or
   reject each one.
4. Read an audit trail and state, for a given run, which changes were
   approved, which were blocked, and why.
5. Explain the tradeoff between a deterministic scripted stand-in for an
   agent (used in this workshop) and a live LLM-driven agent (out of scope
   for the live demo, discussed as a stretch extension).

## Layout

```
agent-driven-orchestration-governable/
├── README.md            this file
├── AGENTS.md            conventions for agents (and humans) editing this folder
├── .gitignore           keeps node_modules, build output, local state, and the audit log out of git
├── .shellcheckrc        shellcheck config shared by every shell script in this folder
├── 01-fleet/            target program: WorkerFleet component + configVersion
├── 02-policy/           policy pack: require-approval-flag (mandatory)
├── 03-orchestrator/     the "agent": Automation API driver + JSON audit log
├── 04-audit/            audit-trail reader the presenter walks through
├── 05-llm-stretch/      optional: LLM proposes the next action (dry-run, no key needed)
├── 06-teardown/         teardown.sh — also the between-runs reset
└── scripts/
    └── setup.sh         presenter's one-time setup
```

Steps 3–6 of the brief (blocked scale-up, approved scale-up, rotation,
scale-down) are grouped into the single `03-orchestrator/` folder rather than
four separate folders: they are four invocations of the *same* orchestrator
script with different action arguments, and four folders would mean four
copies of the same Automation API wiring and audit-log code. See
`03-orchestrator/AGENTS.md`.

## Prerequisites

### Participants

- A laptop with Node.js 20.x LTS and the Pulumi CLI installed before the
  session (installation instructions distributed in advance; no live
  install time in the session).
- No Pulumi Cloud account or cloud provider credentials required — the demo
  runs entirely on the local backend (`pulumi login --local`).
- Basic familiarity with a Pulumi program in TypeScript (a `pulumi new`
  walkthrough is out of scope for this session).

### Presenter

- Build and pin this repo's dependency versions at least 3 business days
  before 2026-10-28, and verify `pulumi up`, the blocked-action run, and the
  approved-action run all complete cleanly on a clean machine or container
  (see [Presenter checklist not covered by this repository](#presenter-checklist-not-covered-by-this-repository)).
- Rehearse `06-teardown/teardown.sh` at least once end to end to confirm no
  local state or files persist.
- Prepare the audit log's expected contents as a reference so you are not
  reading unfamiliar output live.
- If including the optional `05-llm-stretch/` segment, obtain and test API
  access in advance; do not test it for the first time live.
- Have a pre-recorded screen capture of the full demo ready as a fallback in
  case live execution fails during the session.

## Versions (re-verified 2026-09-29)

| Package | Declared | Resolved |
|---|---|---|
| Pulumi CLI | latest stable | v3.263.0 |
| `@pulumi/pulumi` | `^3.262.0` | 3.265.0 |
| `@pulumi/policy` | `^1.13.0` | 1.21.0 |
| `@pulumi/random` | `^4.21.2` | 4.21.2 |
| Node.js | 20.x LTS (brief) | v22.23.2 (build/verification machine) |

**Node version note:** the brief pins Node 20.x LTS. This build's verification
ran on Node v22.23.2, the only runtime available on the build machine; a 20.x
LTS toolchain could not be installed there. Every project's `tsconfig.json`
targets `es2020`/`commonjs` and nothing in the demo code depends on a
Node-22-only API, so it is expected to run unchanged on Node 20.x, but that
has not been verified on this build. Re-verify on Node 20.x before the
2026-10-28 delivery.

## Run the slides

Not built in this run. A follow-up assignment adds `slides/` on this same
branch, matching the demo flow below step for step. Once it lands, run it
the same way every workshop in this repository does:

```bash
cd slides
npm install
npm run dev              # http://localhost:3030, presenter view at /presenter
npm run build            # static site in dist/
npm run export           # slides-export.pdf
```

## Run the demo

Set up once per machine (or after teardown), then run the four gated
changes and the audit reader as often as you like:

```bash
scripts/setup.sh                     # once per machine (or after teardown)
cd 03-orchestrator
node bin/orchestrator.js scale-up --replicas 4              # blocked: no approval
node bin/orchestrator.js scale-up --replicas 4 --approve     # approved: replicaCount 2 -> 4
node bin/orchestrator.js rotate --approve                    # approved: configVersion rotates
node bin/orchestrator.js scale-down --replicas 2 --approve   # approved: replicaCount 4 -> 2
cd ..
node 04-audit/bin/read-audit.js                               # prints all four attempts
node 05-llm-stretch/bin/propose-next-action.js                # optional stretch, dry-run
06-teardown/teardown.sh                                        # reset to a clean checkout
```

`scripts/setup.sh` and `06-teardown/teardown.sh` both compile against a demo
passphrase (`PULUMI_CONFIG_PASSPHRASE`, default
`agent-driven-orchestration-governable-demo` unless already set in the
shell). It protects only the throwaway local backend created by this demo —
it is not a secret, and rotating or losing it costs nothing.

## Per-step end states (each verified against a real run, see PR description)

1. **01-fleet** previews/ups cleanly. `pulumi stack output` shows
   `replicaCountOut: 2`, a `configVersion`, `approvedOut: false`.
2. **02-policy** compiles and its unit tests pass: `npm test` (7 cases).
3. **Blocked scale-up**: orchestrator exits 1; `pulumi up` reports the policy
   pack's `require-approval-flag` violation; `replicaCountOut` stays 2; the
   audit log gets a `BLOCKED` entry naming the rule.
4. **Approved scale-up**: `replicaCountOut` becomes 4; audit log gets an
   `APPROVED` entry with `before`/`after` and a timestamp.
5. **Rotation**: `configVersion` output changes; `replicaCountOut` unchanged;
   audit entry recorded.
6. **Scale-down**: `replicaCountOut` returns to 2; audit entry recorded.
7. **04-audit** prints all four attempts in order, each marked approved or
   blocked with its reason, plus a summary line.
8. **05-llm-stretch** (optional): with no `OPENAI_API_KEY` set, prints a
   deterministic proposal and states plainly that no live model call was
   made. It never applies its own proposal — it prints the exact
   `03-orchestrator` command to run, gated by the same unmodified policy
   pack.
9. **06-teardown**: destroys the stack, removes the stack registration,
   deletes the local backend state directory and the audit log. A repeat run
   of the whole sequence afterward starts from the same clean state — a real
   clean checkout, not one carrying leftover state from a prior run.

## What `require-approval-flag` actually inspects

The brief describes the policy as inspecting stack configuration directly
(`demo:approved = true`). Pulumi Policies do not expose a documented way to
read `pulumi.Config` values from inside a policy; they validate resources
(`validateResource`) or a stack's resource list (`validateStack`, over
`args.resources` filtered by type). So `01-fleet/workerFleet.ts` carries the
approval flag onto a `random.RandomId` change-marker resource's `keepers`,
and the policy reads it from there. Full rationale, with doc sources, in
`02-policy/AGENTS.md`.

## Cost and cleanup

Estimated cost: **$0**. Every resource is `@pulumi/random`, a local-only
provider with no cloud calls. `06-teardown/teardown.sh` leaves no stack, no
local state, and no audit log; presenters should run it at the end of every
delivery and rehearsal.

## Presenter checklist not covered by this repository

The following require a live rehearsal and cannot be verified from a build
machine: slide markers matching the rehearsed screen state exactly,
capturing a pre-recorded fallback of the four-step run, re-verifying the
demo 3 business days before the 2026-10-28 delivery, and a teardown check on
the actual presenter machine (this build's teardown was verified on the
build machine's local backend only).

## Sources

Facts in the brief come from these pages, read on September 26, 2026 and
re-read on September 29, 2026:

- https://www.pulumi.com/docs/ — confirms current top-level doc structure,
  including Infrastructure AI and Discovery & Governance sections.
- https://www.pulumi.com/docs/ai/ — confirms Pulumi Neo, Agent Skills, an
  agent-friendly CLI, the MCP server, and Agent Accounts as current,
  documented capabilities.
- https://www.pulumi.com/docs/iac/concepts/automation-api/ — confirms
  Automation API's purpose as a programmatic SDK for driving the Pulumi
  engine; this is the mechanism `03-orchestrator/` uses.
- https://www.pulumi.com/docs/discovery-governance/ — re-read for this run
  and confirms the current product name is Pulumi Policies (policy as code,
  policy packs, policy groups; preventative or audit mode). "CrossGuard"
  does not appear on this page; the workshop brief's use of that name is out
  of date and is corrected throughout this repository. See `AGENTS.md`.
- https://www.pulumi.com/docs/reference/pkg/nodejs/pulumi/policy/ — read for
  this run. Confirms `validateResource`/`validateStack`'s `getConfig<T>()`
  resolves the *policy pack's own* configuration, never the target stack's
  `pulumi.Config`. This is why `02-policy/` inspects a resource property
  instead of stack configuration directly; see
  `02-policy/AGENTS.md`.
