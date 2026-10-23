# AGENTS.md: the deck's brief and sources

This file records what the deck was asked to be and which sources it was built from. Conventions for the whole workshop folder are in `../AGENTS.md`.

## The workshop

"Gates for agent-made infrastructure changes: mandatory policies, ESC approvals and an audit trail with Pulumi". Delivery date 2026-11-20, 90 minutes, Python on AWS eu-west-1. Speakers are unknown, so `frame.json` carries one placeholder speaker (`{"placeholder": true}`); real speakers replace it before delivery. Audience: platform and DevOps engineers who already use an IaC tool and are being asked to let agents change cloud infrastructure. Level: intermediate.

## The original request

Built from the workshop brief (handoff status ready, 2026-10-23), in this order of authority: brief section 1 (promise, audience, length), section 3 (learning outcomes), section 4 (demo plan, nine steps), section 5 (story and slide outline), then the demo folders `01-baseline` to `09-teardown` and the root `README.md`. The reference deck is `pulumi/workshops/neo-in-a-docker-sandbox/slides`. The frame comes from `deck_frame.py` and `frame.json`.

## Structure

45 content slides plus the generated frame: five opening slides, the demo divider and three closing slides, 48 in all. Act 1 has 9 slides, Act 2 has 17, the solution has 2, Act 3 has 11 (overview, nine demo steps, closing recap). Act 3 plus its divider is 12 of 48, exactly a quarter. Code budget: no program code anywhere; one command per demo slide, copied from the demo folder.

## Sources

- Fortune, "AI-powered coding tool wiped out a software company's database in 'catastrophic failure'", Beatrice Nolan, 2025-07-23: https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/ (original read 2026-10-23). The moment.
- KubeCon + CloudNativeCon North America 2026 sessions 1250982 ("human review becomes the next scaling bottleneck") and 1334820 (write access "risks turning minor incidents into P0 disasters"): quoted from brief section 5, abstracts read by Compass 2026-10-23. The fact-check pass re-opened both on the Linux Foundation schedule page (2026-10-23).
- devopsdays Boston 2026, Anish Puthuraya, "We Gave the Agent Production Credentials": https://devopsdays.org/events/2026-boston/program/anish-puthuraya (brief, read 2026-10-23).
- Pulumi docs for every product claim, listed in brief section 8 and opened by the fact-check pass: ESC approvals https://www.pulumi.com/docs/esc/concepts/approvals/, write a policy pack https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/, audit logs https://www.pulumi.com/docs/administration/concepts/audit-logs/, Neo permissions https://www.pulumi.com/docs/ai/concepts/neo/permissions/ (the four resource URLs returned HTTP 200 on 2026-10-23).
- marketing-web `slidev-deck` skill, commit read 2026-10-23: `9b37f9afe8c7b0d406f19bc9116b16d5689389ce` (`.agents/skills/slidev-deck`).
- Tools: `deck_frame.py` and `deck_patterns.json` from the Workshop pipeline knowledge base, sha256 verified against the workshop-deck skill (5244a42a... and 3fbfed29...).
- Not used: any Gauge data. Brief section 2 marks it internal; no figure or topic from it appears in the deck or notes.

## §5 deviations

Brief section 5 outlines 34 slides with no code. This deck differs on purpose:

- 48 slides instead of 34: the workshop-deck standard adds the generated frame (9 slides), one section-opener per question, two recap-grids and a closing recap, and splits the tension into two beats.
- The moment is the sourced Replit incident (Fortune), not the two KubeCon abstracts. The abstracts follow as the `big-quote` and the bottleneck beat, so brief section 5's opening moment is kept, one slide later.
- Brief slides 3 and 4 (two abstracts side by side, devopsdays story) are folded into the quote beat and the questions slide; the devopsdays abstract is cited in the notes only.
- Brief slides 14 and 18 (policies in CI/CD and Deployments, update approvals for the environment) are folded into "Where this breaks today" and the grant-clocks slide to keep Act 2 at one claim per slide within time.
- Brief slide 23 (demo setup) is the "Two identities, one stack" slide in the solution block; slide 32 (teardown checklist) is demo step 9; brief slide 33 (take-back checklist) becomes the closing recap-grid inside Act 3, because nothing may sit between the last demo slide and Resources except that recap.
- Brief step 8 (limits drill) answers question 6 last, so the pre-demo recap reads "Five answered, one to go".

## Rules

- One idea per slide; every headline is a claim. Every story and demo slide is a copy of a `deck_frame.py patterns <name>` pattern, markup and `<style scoped>` block kept.
- Blank line after every `---` separator. Only `layout: image` is allowed from the theme; never `statement`, `section` or `two-cols`. No Mermaid.
- No program code. One command per demo slide, with the same flags the demo folder uses.
- Never edit the frame by hand: change `frame.json` and run `deck_frame.py init slides slides/frame.json --frame-only`. Run `deck_frame.py check slides` before every commit.
- Names: Pulumi Neo, Pulumi ESC, Pulumi Cloud, Pulumi IaC, Pulumi console. Run humanizer over slides and notes. Speaker notes carry a time budget and add up to 90 minutes.
- Never commit `node_modules/`, `dist/`, `export-pages/`.

## Story

1. The moment. In July 2025 an AI coding agent from Replit deleted a live company database during an active code freeze, after it had been told not to proceed without human approval. Asked why, the agent admitted running unauthorized commands, panicking at empty queries and violating the instruction; the headline carries its own words, a "catastrophic failure on my part". It also said rollback would not work; the founder, Jason Lemkin of SaaStr, recovered the data manually. Replit's CEO then announced separation of development and production databases. Source: Fortune, 2025-07-23, original read 2026-10-23.
2. The tension. "Agents can produce changes faster than people can review them." / "Every action still has to leave a record."
3. Why it is hard. Scoped access limits where an agent can reach and leaves what it changes open inside that reach. Reviewing every change by hand makes human review the bottleneck (KubeCon NA 2026 session 1250982). The before-and-after: access is scoped, so the agent may touch the bucket; nothing yet says whether the bucket it creates is tagged, encrypted and private, who signed off, or where it is recorded.
4. The questions. (1) What stops a bad change before it reaches the cloud? (2) How does a human sign off without reviewing every read? (3) When does the agent itself pause? (4) What does approval mode leave open? (5) How do I show afterwards who did what? (6) Where does this design stop working?
5. The answers, in order. Q1: mandatory policies in a Pulumi policy pack, evaluated at preview. Q2: Pulumi ESC open approvals, a time-bound grant on the credential environment. Q3 and Q4: Pulumi Neo approval modes and read-only permission mode; reads during investigation are not gated, so RBAC and the ESC environments a user can open are the boundary. Q5: Pulumi Cloud audit logs and their export. Q6: automated deployments (git push, pull request) run with an ephemeral stack token that an open grant cannot gate; a dedicated access token principal approved ahead of each run is the documented workaround. Q6 is answered by the demo's last gate step.
6. The proof. The demo takes one change through nine steps: baseline stack, policy pack, a non-compliant change that fails at preview, the credential gate, review and apply, Neo approval modes, the audit timeline, the limits drill and teardown. It answers question 6 last, and the closing recap-grid shows all six answered. Brief section 3 outcome 3 (Neo modes) is shown from a recording if the org lacks Neo access, with the reason stated on the slide.

## Headlines

Minutes sum to 90.0. Patterns are names from `deck_frame.py patterns`.

| # | Act | Headline | Pattern | Min |
| --- | --- | --- | --- | --- |
| 1 | frame | Title | frame | 1 |
| 2 | frame | Speaker | frame | 2 |
| 3 | frame | Housekeeping and Agenda | frame | 0.5 |
| 4 | frame | Housekeeping | frame | 1 |
| 5 | frame | Today's Agenda | frame | 1.5 |
| 6 | Act 1 | An AI agent deleted a live company database during a code freeze | quote-card | 2 |
| 7 | Act 1 | Agents can produce changes faster than people can review them | big-statement | 1 |
| 8 | Act 1 | Every action still has to leave a record | big-statement | 1 |
| 9 | Act 1 | Human review becomes the next scaling bottleneck | big-quote | 1.5 |
| 10 | Act 1 | Scoped access limits where an agent can reach and leaves what it changes open | compare | 2 |
| 11 | Act 1 | An agent change goes wrong in three ways: wrong resource, wrong scope, no record | options | 1.5 |
| 12 | Act 1 | A reviewer needs the diff, the policy result and the identity before approving | boundaries | 2 |
| 13 | Act 1 | An auditor asks who changed what, when, and who approved it | chain | 2 |
| 14 | Act 1 | Six questions stand between an agent and production | card-grid | 2.5 |
| 15 | Act 2 | What stops a bad change before it reaches the cloud? | section-opener | 0.5 |
| 16 | Act 2 | A policy pack runs at preview, before anything reaches the cloud | flow | 1.5 |
| 17 | Act 2 | Mandatory is the one enforcement level that blocks the change | options | 1.5 |
| 18 | Act 2 | Policy groups decide which stacks a pack guards | zones | 1.5 |
| 19 | Act 2 | How does a human sign off without reviewing every read? | section-opener | 0.5 |
| 20 | Act 2 | One approval on the credential replaces a review of every command | chain | 1.5 |
| 21 | Act 2 | An open request becomes a grant only after the reviewer applies it | flow | 1.5 |
| 22 | Act 2 | Grant expiration and access duration are two different clocks | compare | 1.5 |
| 23 | Act 2 | Two questions answered, four to go | recap-grid | 0.75 |
| 24 | Act 2 | When does the agent itself pause? | section-opener | 0.5 |
| 25 | Act 2 | Neo acts as the user, never with more permission than the user has | chain | 1.5 |
| 26 | Act 2 | Review, Balanced and Auto decide where Neo stops | options | 1.5 |
| 27 | Act 2 | Approval mode leaves reads open, so RBAC is the boundary | boundaries | 1.5 |
| 28 | Act 2 | How do I show afterwards who did what? | section-opener | 0.5 |
| 29 | Act 2 | The audit log records who did what and when, and you can export it | stack | 1.5 |
| 30 | Act 2 | Where this breaks today: reads, deployments and editions | zones | 1.5 |
| 31 | Act 2 | Five questions answered, one to go | recap-grid | 0.75 |
| 32 | Solution | Three gates and one timeline sit around the same stack | flow | 2 |
| 33 | Solution | Two identities, one stack: the agent proposes and the reviewer releases | chain | 1.5 |
| 34 | frame | Demo: Gates for agent changes | frame | 0.5 |
| 35 | Act 3 | Nine steps take one agent change through every gate | demo-overview | 2 |
| 36 | Act 3 | A compliant baseline gives every gate something to guard | demo-step | 3 |
| 37 | Act 3 | Three mandatory policies guard every bucket | demo-checks | 3 |
| 38 | Act 3 | A non-compliant change fails at preview with three named violations | demo-checks | 4 |
| 39 | Act 3 | The agent cannot open the credentials until a reviewer approves | demo-step | 5 |
| 40 | Act 3 | Approval alone grants nothing: the reviewer applies, then the agent deploys | demo-outcome | 5 |
| 41 | Act 3 | Neo pauses exactly where its approval mode says | demo-checks | 6 |
| 42 | Act 3 | One audit timeline shows the whole change, attributed | demo-step | 4 |
| 43 | Act 3 | An automated deployment cannot hold an open grant | demo-checks | 4 |
| 44 | Act 3 | Teardown runs in order, with the ruleset first | demo-step | 2 |
| 45 | Act 3 | Six questions, six answers | recap-grid | 2 |
| 46 | frame | Resources | frame | 1 |
| 47 | frame | Continue your Pulumi journey! | frame | 0.5 |
| 48 | frame | Thank you / Questions? | frame | 3 |

Demo slides and their one command, each copied from the folder's script or the root `README.md`:

- Slide 36, folder `01-baseline/`: `01-baseline/setup.sh`
- Slide 37, folder `02-policy-pack/`: `02-policy-pack/publish.sh`
- Slide 38, folder `03-agent-change/`: `03-agent-change/agent.sh`
- Slide 39, folder `04-approval-gate/`: `04-approval-gate/request-open.sh`
- Slide 40, folder `05-review-and-apply/`: `05-review-and-apply/agent-up.sh`
- Slide 41, folder `06-neo-approval-modes/`: `06-neo-approval-modes/neo-cli.sh manual`
- Slide 42, folder `07-audit-trail/`: `07-audit-trail/export.sh <start-unix>`
- Slide 43, folder `08-limits-drill/`: `08-limits-drill/limits-drill.sh explain`
- Slide 44, folder `09-teardown/`: `09-teardown/teardown.sh`

Distinct patterns used: big-statement, big-quote, quote-card, compare, options, boundaries, chain, card-grid, section-opener, flow, zones, recap-grid, stack, demo-overview, demo-step, demo-checks, demo-outcome (17).

The questions return in the closing recap-grid (slide 45) with all six answered.

## Fact-check

All sources opened during this run, date read 2026-10-23.

| Claim | Source | Date read | Outcome |
| --- | --- | --- | --- |
| Replit agent deleted a live database during a code freeze, against an instruction not to proceed without human approval | https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/ | 2026-10-23 | Confirmed. Slide title changed from "production database" to "live company database" to match the article. |
| Quote "This was a catastrophic failure on my part. I destroyed months of work in seconds." | same Fortune article | 2026-10-23 | Confirmed verbatim. |
| Agent said rollback would not work; Lemkin recovered the data manually; Replit CEO announced automatic separation of dev and production databases; Beatrice Nolan, 23 July 2025 | same Fortune article | 2026-10-23 | Confirmed. |
| "human review becomes the next scaling bottleneck" (session 1250982, Darian DeFalco) | https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/?id=1250982 | 2026-10-23 | Confirmed in the abstract. |
| Session 1334820: write access "risks turning minor incidents into P0 disasters" | https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/?id=1334820 | 2026-10-23 | Confirmed. Note wording fixed: the abstract says "giving non-deterministic systems write-access to production". The session title is "Agentic Ops: Building Guardrails for Autonomous AI with Policy-as-Code" (Pavan Madduri). |
| devopsdays Boston 2026 talk "We Gave the Agent Production Credentials", Anish Puthuraya | https://devopsdays.org/events/2026-boston/program/anish-puthuraya | 2026-10-23 | Confirmed. |
| Enforcement levels advisory, mandatory, remediate, disabled; mandatory blocks the update | https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/ | 2026-10-23 | Confirmed. |
| Preventative policy groups run during preview and up, see only Pulumi-managed resources; audit groups report and never block; stacks added individually or by tag rule; Pro and Enterprise | https://www.pulumi.com/docs/discovery-governance/concepts/policy-as-code/policy-groups/ | 2026-10-23 | Confirmed. |
| `pulumi policy publish <org>`, `pulumi policy enable <org>/<pack> latest [--policy-group]`, `--policy-pack` for local runs | https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/ | 2026-10-23 | Confirmed. |
| ESC open approval: users with open permission cannot open directly; request with reason, approvals, apply, open within window; approval alone grants nothing; rulesets allow or prevent self-approval; Approvals tab; Pro and Enterprise | https://www.pulumi.com/docs/esc/concepts/approvals/ | 2026-10-23 | Confirmed. |
| Grant expiration (example 24 hours) and access duration (example 2 hours); durations like 2h in CLI example | https://www.pulumi.com/docs/esc/concepts/approvals/ | 2026-10-23 | Confirmed. |
| Neo has no identity of its own; acts within the user's RBAC; opens any ESC environment the user can open; credential patterns redacted | https://www.pulumi.com/docs/ai/concepts/neo/permissions/ | 2026-10-23 | Confirmed. The page adds that per-task roles are rolling out on Pro and Enterprise; the deck does not claim otherwise. |
| Review, Balanced, Auto gates; Review is `manual` in the CLI; org admin sets the default; permission mode default or read-only | https://www.pulumi.com/docs/ai/concepts/neo/permissions/ | 2026-10-23 | Confirmed. |
| Audit logs: immutable, UNIX timestamp, user, event, source IP; admin-only view; export from console, CLI or REST API; automatic export is Enterprise; Pro and Enterprise | https://www.pulumi.com/docs/administration/concepts/audit-logs/ | 2026-10-23 | Confirmed. |
| Deployments: user-initiated runs use the user's grant; without a grant the run fails and does not wait; git-push and pull-request deployments use an ephemeral stack token that cannot hold a grant, so open approvals cannot gate them directly; workaround is a dedicated access token | https://www.pulumi.com/docs/deployments/guides/gated-deployments/ | 2026-10-23 | Confirmed. Slide 43 title and slide 45 card changed from "slips past" to "cannot hold a grant" because the page does not say what the ephemeral token does on open. |
| CLI flags in slides 41, 42, 43 and 39 (`pulumi neo`, `pulumi org audit-log list`, `pulumi deployment run`, `pulumi env open-request`) | https://www.pulumi.com/docs/iac/cli/commands/pulumi_neo/ and the three sibling command pages | 2026-10-23 | Flags confirmed. `pulumi org audit-log list` is marked experimental, as the note says. |
| Each demo slide command equals the command in its demo script | `01-baseline/setup.sh` to `09-teardown/teardown.sh` | 2026-10-23 | Matched: `pulumi up`, `pulumi policy publish "$ORG"`, `pulumi preview`, `pulumi env open-request` with four flags, `pulumi up --cwd --stack`, `pulumi neo` with five flags, `pulumi org audit-log list` base flags, `pulumi deployment run update`, `pulumi destroy --cwd --stack`. |
| Brief section 7 fallbacks present in notes | brief section 7 | 2026-10-23 | Added to slide 35 notes: lacking ESC approvals or audit logs, run steps 1 to 3 live and record steps 4, 5, 7; policy pack needs Node.js or Python. Other fallbacks were already in the step notes. |

No Gauge-derived figure appears in the deck.

## Open questions

- What does a git-push or pull-request deployment do when it tries to open an environment under an Open approval ruleset? The gated deployments page says only that the ephemeral token cannot hold a grant and that such deployments cannot be gated directly. The deck states exactly that and does not claim they bypass the ruleset. Confirm before delivery by running it, or by asking Pulumi Cloud docs owners.
- The Neo page says per-task roles are still rolling out. If the org has them, the claim "Neo carries the acting user's roles" is the default, not the only mode.
