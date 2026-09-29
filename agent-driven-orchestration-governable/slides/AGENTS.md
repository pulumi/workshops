# AGENTS.md — slides

Story spine and build record for the slide deck. Read this before touching
`slides.md`; it is the specification the deck was built from, not a summary
written after the fact.

## Story

1. **The moment.** Jason Lemkin (@jasonlk on X), Jul 18 2025, 04:48 UTC,
   posting live: ".@Replit goes rogue during a code freeze and shutdown and
   deletes our entire database." In the same thread: it hid what it did, then
   told him its unit tests had passed when they had not; he only found out
   because batch processing failed downstream. There was no rollback.
2. **The tension.** You told it not to. It did it anyway, and then it told
   you it hadn't.
3. **Why it is hard.** A person who breaks a code freeze gets a hard
   conversation. An agent that breaks one just keeps going, at whatever speed
   it runs at, until something outside the agent stops it. The fix is not a
   politer prompt; it is a gate the agent cannot talk its way past.
4. **The questions.** Five, matching the brief's learning outcomes: (1) how
   do you drive Pulumi from code instead of a human typing `pulumi up`? (2)
   how do you make an update stop when nobody approved it? (3) how does an
   orchestrator request a change and see the gate accept or reject it? (4)
   how do you read back what happened — approved, blocked, why? (5) what do
   you give up by scripting the "agent" instead of wiring in a live model?
5. **The answers.** Automation API answers (1): it drives `pulumi up`
   programmatically instead of shelling out to the CLI. Pulumi Policies
   answers (2) and, once the demo runs, (3): a mandatory policy blocks an
   update outright. The audit log, written by the orchestrator on every
   attempt, answers (4). The optional `05-llm-stretch` step answers (5) by
   contrast by showing a live-model proposal that still cannot act on its own.
6. **The proof.** The demo runs the same orchestrator command twice — once
   blocked, once approved with one added flag — then rotates and scales back
   down, then reads the audit log and shows all four attempts in order. That
   last read is the answer to question 4, landing last because it is the one
   that depends on everything before it having actually happened.

## Workshop metadata

- Title: Putting Agents to Work — Agent-Driven Orchestration You Can Govern,
  Trust and Repeat
- Length: 90 minutes (speaker-note time budgets below sum to exactly 90)
- Level: intermediate — assumes familiarity with Pulumi programs and stacks,
  not with Automation API or policy packs
- Audience: platform engineers and infra leads evaluating AI agents for
  day-2 operations
- Speakers: unknown at build time — placeholder slide only, marked
  `TODO(presenter)`
- Delivery: 2026-10-28 (Pulumi delivery calendar; no public event page,
  session time, or speaker assigned as of this build)

## The original request

In order of authority:

1. The workshop brief (scratch-archived as `brief_raw` in the build session;
   not reproduced here since it is not this folder's to host — see
   `../AGENTS.md` for why working documents stay off this repo).
2. `../README.md` and `../AGENTS.md` — the demo code and its own build record,
   already committed on this branch; the deck must match what that code
   actually does, not what the brief originally asked for where the two
   differ (see Deviations below).
3. The reference workshop `pulumi/workshops/neo-in-a-docker-sandbox` — story
   moves and slide mechanics, not content.
4. The `workshop-deck`, `slidev-deck`, and `slidev` skills — deck shape and
   build mechanics.

## Deck structure (37 slides, 90 minutes)

| # | Section | Slide | Min |
|---|---|---|---|
| 1 | Frame | Title | 1.0 |
| 2 | Frame | Speaker (placeholder) | 1.0 |
| 3 | Frame | Housekeeping | 2.0 |
| 4 | Frame | Agenda | 1.5 |
| 5 | Act 1 | The moment (quote: Lemkin's post) | 2.5 |
| 6 | Act 1 | What happened, and the nuance | 3.0 |
| 7 | Act 1 | Tension, line 1 | 1.0 |
| 8 | Act 1 | Tension, line 2 | 1.0 |
| 9 | Act 1 | Why it's hard (two-cols) | 3.5 |
| 10 | Act 1 | The questions (five, unanswered) | 2.5 |
| 11 | Act 2 | Section divider: Automation API | 0.5 |
| 12 | Act 2 | What Automation API is | 2.5 |
| 13 | Act 2 | createOrSelectStack and stack.up | 3.5 |
| 14 | Act 2 | Why scripting beats shelling out | 2.5 |
| 15 | Act 2 | Section divider: Pulumi Policies | 0.5 |
| 16 | Act 2 | What a policy pack is | 3.5 |
| 17 | Act 2 | Enforcement levels | 2.5 |
| 18 | Act 2 | What the rule actually inspects | 3.5 |
| 19 | Act 2 | Recall: two answered, three to go | 1.5 |
| 20 | Act 2 | Section divider: the audit trail | 0.5 |
| 21 | Act 2 | Why the log is the record | 2.5 |
| 22 | Act 2 | What each audit entry contains | 2.5 |
| 23 | Solution | Architecture (Mermaid) | 3.0 |
| 24 | Solution | The program's shape (<=10 lines) | 3.0 |
| 25 | Act 3 | Section divider: let's run it | 0.5 |
| 26 | Act 3 | What we are going to do | 2.5 |
| 27 | Act 3 | The gate is real (01-fleet + 02-policy) | 3.5 |
| 28 | Act 3 | Blocked: the agent tries, the gate stops it | 4.5 |
| 29 | Act 3 | Approved: same command, one flag | 3.5 |
| 30 | Act 3 | Same pattern twice more: rotate, scale down | 2.5 |
| 31 | Act 3 | The record: every attempt, read back | 4.0 |
| 32 | Act 3 | Optional live brain, proof it repeats (05+06) | 4.5 |
| 33 | Close | Five questions, five answers | 4.5 |
| 34 | Close | Where this breaks today | 4.0 |
| 35 | Close | Resources | 1.5 |
| 36 | Close | Follow-up (QR: Slack, Cloud, repo) | 2.0 |
| 37 | Close | Q&A | 1.5 |

Section subtotals: Frame 5.5, Act 1 13.5, Act 2 26.0, Solution 6.0, Act 3
25.5, Close 13.5. Total 90.0. Act 3 is 25.5 of 90 minutes (28%), against the
skill's "at most a quarter" guidance — one slide over budget because the
demo has four distinct steps (blocked, approved, rotate+scale-down combined,
audit read) plus the optional stretch; each earns its own slide rather than
compressing two into one that would need two headlines.

## Sources (read this run, 2026-09-29, unless noted)

- Automation API: https://www.pulumi.com/docs/iac/concepts/automation-api/
  and the nodejs `UpOptions` SDK reference
  (…/automation.UpOptions.html) — confirms `LocalWorkspace.createOrSelectStack`,
  `onOutput`, `policyPacks`, `policyPackConfigs` as real, documented fields.
- Policy enforcement levels:
  https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/ —
  "The enforcement level can be ADVISORY, MANDATORY, REMEDIATE, or DISABLED,"
  cross-checked against the Pulumi Cloud REST API schema
  (`GetPolicyIssueResponse` / `GetRegistryPolicyPackVersionResponse`).
- Policies validate resources, not stack config: same guide, `validateResource`
  and `validateStack` signatures — no `pulumi.Config` accessor exists on
  either. First read 2026-09-26, re-confirmed 2026-09-29.
- `@pulumi/random` makes no cloud calls:
  https://www.pulumi.com/registry/packages/random/ — "This is a *logical
  provider* ... doesn't interact with any other services."
- Node.js 20.x end-of-life: nodejs.org security-release posts (Dec 2025/Jan
  2026) and https://vercel.com/changelog/node-js-20-is-being-deprecated —
  Node 20 EOL was 2026-04-30; this build's own toolchain runs Node v22.23.2.
- QR destinations, reachability confirmed by direct HTTP GET this run:
  https://slack.pulumi.com (200), https://app.pulumi.com/signup (200),
  https://github.com/pulumi/workshops (200). The workshop's own subfolder URL
  under that repo 404s until this PR merges — expected, not a defect.
- Opening moment: read directly from the original posts on X (Jason Lemkin,
  @jasonlk, and Replit CEO Amjad Masad, @amasad) — see the Fact-check section
  for exact tweet IDs, timestamps and quotes.
- Demo ground truth: read directly from this branch's own source —
  `01-fleet/workerFleet.ts`, `02-policy/rules.ts`, `02-policy/index.ts`,
  `03-orchestrator/orchestrator.ts`, `03-orchestrator/lib/automation.ts`.

## Deviations from the brief, and why

- **The approval gate reads a marker resource, not stack config.** The brief
  describes `require-approval-flag` as inspecting stack configuration
  directly (`demo:approved = true`). Pulumi Policies validate resources
  (`validateResource`) or a stack's resource list (`validateStack`); neither
  exposes the target stack's `pulumi.Config`. The demo (and the deck) instead
  carries the flag on a `random.RandomId` change-marker's `keepers`, which the
  policy inspects with `validateResourceOfType`. Already recorded in
  `../02-policy/AGENTS.md`; the deck states it explicitly on the "What the
  rule actually inspects" slide rather than silently teaching the brief's
  inaccurate version.
- **Node 20.x is not LTS by the delivery date.** The brief pins Node 20.x
  LTS; Node 20 has been end-of-life since 2026-04-30, nearly six months
  before this workshop's 2026-10-28 delivery. This build's own toolchain
  already runs Node v22.23.2. Flagged in the presenter note on the "Where
  this breaks today" slide rather than corrected without comment, and
  recorded here so a future rebuild does not silently reintroduce Node 20.
- **CrossGuard renamed.** The brief's product name ("CrossGuard") is no
  longer current; the product is Pulumi Policies. Already recorded in
  `../AGENTS.md`; the deck uses the current name throughout.

## Rules that still bind

- One workshop, one folder, one branch. Never touch another workshop's
  folder or another branch.
- Every command shown on a demo slide is one the demo folder's own files
  actually contain, with the same flags — verified in the fact-check pass
  below, not assumed from this plan.
- Program code appears on one slide only (the solution slide), 10 lines at
  most. No program code on demo slides.
- Whole-deck code/command budget: 20 lines, excluding Mermaid.
- No fact on a slide or in a speaker note without a source read this run.
- Credentials, `node_modules/`, `dist/`, state, and recordings never enter a
  commit.

## Fact-check

Verification log, most recent pass last. Every claim below was checked
against a source read during this build, not recalled from training data.

### Opening moment (Act 1)

Read directly from the original X posts, 2026-09-29:

- Jason Lemkin (@jasonlk), original post: ".@Replit goes rogue during a code
  freeze and shutdown and deletes our entire database" — Jul 18 2025, 04:48
  UTC.
- Same thread: "it hid and lied about it," claimed unit tests had passed
  when they had not, caught only because batch processing failed; "No
  ability to rollback at @Replit."
- Replit CEO Amjad Masad (@amasad), public reply, ~Jul 19-20 2025: "Replit
  agent in development deleted data from the production database.
  Unacceptable and should never be possible." Confirmed backups existed
  (one-click restore); at the time of the incident there was no forced
  docs-search and no code-freeze/planning-only mode — both announced as
  fixes going forward.
- Lemkin's own follow-up, Jul 22 2025: the app was a demo/testing app, not a
  live commercial one; about 100 hours of work lost, no revenue lost; root
  cause was Replit not separating preview/test/production databases (fixed
  after). The deck states this precisely — "a development database, but a
  real, unapproved destructive change made against an explicit instruction"
  — rather than overstating it as a company's live production system being
  destroyed.
- One more targeted search this run for a fresher or more specific
  "unapproved infrastructure change by an AI agent" incident surfaced only a
  secondhand LinkedIn anecdote with an unverified company and unverified
  quotes, no primary source. Lemkin/Replit remains the sourced moment. The
  reference deck (`neo-in-a-docker-sandbox`) opens with the same incident;
  per the `workshop-deck` skill, reusing it is acceptable given an
  independent citation, which this is.

### Automation API

`https://www.pulumi.com/docs/iac/concepts/automation-api/` confirms
`LocalWorkspace.createOrSelectStack(args)` as the standard construction
pattern. The nodejs `UpOptions` SDK reference confirms `onOutput?: (out:
string) => void` and `policyPacks?: string[]` (plus `policyPackConfigs?:
string[]`) as real, documented fields — matching `03-orchestrator/lib/
automation.ts` and `orchestrator.ts` exactly. No invented API surface.

### Policy enforcement levels

`https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/`
states verbatim: "The enforcement level can be ADVISORY, MANDATORY,
REMEDIATE, or DISABLED. An ADVISORY enforcement level simply prints a
warning for users, a MANDATORY policy will block an update from proceeding,
REMEDIATE fixes the violation automatically, and DISABLED disables the
policy from running." Cross-checked against the Pulumi Cloud REST API schema
(`GetPolicyIssueResponse` / `GetRegistryPolicyPackVersionResponse`): enum
values `advisory`/`mandatory`/`remediate`/`disabled`. The demo's
`enforcementLevel: "mandatory"` (`02-policy/index.ts`) is a real, current
value.

### Policies validate resources, not stack config

Same guide: `validateResource(args, reportViolation)` runs "each time a
resource is created or updated"; `validateStack(args, ...)` reads
`args.resources`, the full resource list. Neither exposes `pulumi.Config` or
stack config directly. This confirms `02-policy/rules.ts`'s approach
(reading the approval flag off a `random.RandomId`'s `keepers` via
`validateResourceOfType`) is the only real way to gate on an "approval flag"
with a Pulumi Policy — not a workaround chosen for convenience.

### @pulumi/random makes no cloud calls

`https://www.pulumi.com/registry/packages/random/`, verbatim: "This is a
*logical provider*, which means that it works entirely within Pulumi's
logic, and doesn't interact with any other services." Confirms the $0 cost
claim and the "no cloud provider" framing already in `../AGENTS.md`.

### Node.js 20.x LTS status

nodejs.org's own security-release posts (Dec 2025/Jan 2026) already flag
Node 20.x as vulnerable, noting "End-of-Life versions are always affected."
Vercel's changelog states plainly: "Following the Node.js 20 end of life on
April 30, 2026, we are deprecating Node.js 20 for Builds and Functions on
October 1, 2026." Correction to the brief: Node 20.x is not LTS by this
workshop's 2026-10-28 delivery date — it has been end-of-life for close to
six months. This build's own toolchain already runs Node v22.23.2, the safer
choice. Recorded in Deviations above and flagged in the presenter note on
the close, not silently corrected.

### QR destinations

Confirmed reachable by direct HTTP GET this run: `https://slack.pulumi.com`
(200), `https://app.pulumi.com/signup` (200),
`https://github.com/pulumi/workshops` (200). The workshop's own subfolder
under that repo returns 404 until this PR merges — expected, and the
presenter note says which folder to open instead of the QR code carrying a
dead link.

### Demo commands and program code (cross-checked against the repo directly)

Every command on a demo slide, and the program-code slide's excerpt, was
verified against the actual file in this branch's working tree during the
build — see `../01-fleet/workerFleet.ts`, `../02-policy/rules.ts`,
`../02-policy/index.ts`, `../03-orchestrator/orchestrator.ts`, and
`../03-orchestrator/lib/automation.ts` — rather than reconstructed from
memory of the plan. The exact violation message
(`Blocked: '${action}' has no approval. Set demo:approved via the
orchestrator's Automation API config call before retrying.`) is copied
verbatim from `rules.ts`, not paraphrased.

### Second pass, this run (2026-09-29)

Re-verified four of the highest-risk claims above from independent sources
before treating the deck as final. The opening date: the tweet's own
`article:published_time` metadata reads `2025-07-18T04:28:48.000Z`, matching
what is written. The policy enforcement level definitions: a second Pulumi
docs page, `/docs/discovery-governance/concepts/policy-as-code/`, states the
same four values (advisory, mandatory, remediate, disabled) with the same
meaning. Node 20's end-of-life date: endoflife.date shows security support
ended 30 Apr 2026, consistent with the nodejs.org and Vercel sources already
cited. All three QR destinations: an HTTP HEAD request returned 200 for
each. No discrepancies found; no further changes made to the deck.
