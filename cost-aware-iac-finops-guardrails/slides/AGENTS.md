# AGENTS.md — the deck's brief and sources

This file records what the deck was asked to be and which sources it was
built from. Conventions for the whole workshop folder are in `../AGENTS.md`.

## The workshop

"Cost-aware infrastructure as code: tagging, budgets and FinOps guardrails
with Pulumi." A 90-minute session covering an AWS budget, a mandatory
cost-allocation tag, and a Pulumi Policies pack that blocks an untagged or
oversized EC2 instance before it deploys. Speaker identity is unknown; the
deck uses a placeholder throughout.

## Sources

- `../README.md` and `../AGENTS.md` (this workshop folder's own docs), read
  2026-09-24. Ground truth for the workshop's title, learning outcomes, and
  layout.
- Each numbered demo folder's own `AGENTS.md` and source files
  (`01-budget/__main__.py` through `05-size-guardrail/rules.py`), read
  2026-09-24, for the exact resources, config keys, and verification state.
- Pulumi product docs, read 2026-09-24: the policy-as-code overview
  (`pulumi.com/docs/discovery-governance/concepts/policy-as-code/`) for
  current terminology and enforcement modes, and the `aws.budgets.Budget`
  registry page for the resource's required inputs.
- This deck was **not** built from a separate original brief document; the
  demo folder's own README/AGENTS.md and the pipeline's scratchpad research
  (commands, violation strings, verification state, and Pulumi docs facts,
  all dated 2026-09-24) served as the source of truth instead. The demo
  folder is the accepted authority for what actually got built.
- Slide scaffolding, `package.json` shape, `.gitignore`, and `QRCode.vue`
  copied from the reference workshop `pulumi/workshops/neo-in-a-docker-sandbox`.

## Deck structure and minute budget (90 minutes total)

| Section | Slides | Minutes |
| --- | --- | --- |
| Title | 1 | 1 |
| Speaker (placeholder) | 1 | 1 |
| Housekeeping divider + housekeeping | 2 | 1 + 1 |
| Agenda | 1 | 2 |
| Hook | 1 | 5 |
| Pain (two-cols + one more) | 2 | 5 + 4 |
| Solution (Pulumi Policies) | 1 | 6 |
| How it works (diagram) | 1 | 8 |
| Demo divider | 1 | 1 |
| Demo steps 1–5 | 5 | 6 + 6 + 8 + 6 + 8 |
| What we verified | 1 | 6 |
| Teardown | 1 | 4 |
| Recap (statement) | 1 | 4 |
| Follow-up (3 QR codes) | 1 | 4 |
| Q&A / thanks | 1 | 3 |
| **Total** | **21** | **90** |

Layouts used: `cover`, `default`, `section`, `statement`, `two-cols`,
`diagram-left`, `code`, `end` — eight named layouts across 21 slides.

## Deviations from a hypothetical brief

- **Dropped "CrossGuard."** Current Pulumi docs (read 2026-09-24) redirect
  that term entirely; the product is Pulumi Policies, the concept is policy
  as code, the artifact is a policy pack. No slide or note mentions
  CrossGuard.
- **Follow-up QR points at the repo root** (`github.com/pulumi/workshops`),
  not the folder URL, because this folder is still on its own branch and
  not yet merged to `main`. The Q&A slide's repo QR does the same.
- **No separate "oversized instance" folder.** The demo is five numbered
  folders, not six: the tagging and size checks are policy packs invoked
  with `--policy-pack` against `02-untagged-instance` and
  `04-tagged-instance`, never deployed on their own. The demo slides reflect
  this: steps 3 and 5 show a `pulumi preview --policy-pack` command, not a
  `pulumi up` inside the policy-pack folder.
- **Live AWS verification never happened in this pipeline run.** No AWS
  credentials were available on the build machine. Every demo slide's
  speaker notes say plainly that `pulumi up` and live policy enforcement
  were not run; what was verified is `python3 -m py_compile` across every
  program and `python -m unittest test_policy.py` in both policy-pack
  folders (3 tests in `03-tagging-policy`, 5 in `05-size-guardrail`).
  Attempts to run `pulumi preview --policy-pack` without live AWS
  credentials produced a false negative (the AWS provider fails to
  configure before the instance registers, so the policy never evaluates
  it) — this is called out explicitly in the "What we actually verified"
  slide and the relevant demo speaker notes, not glossed over.
- **Command text is copied verbatim** from the demo flow research, same
  flags, same order, including the `cd`/config/`preview`/`up` sequence for
  each step and the exact tagging and size violation message strings.

## Open questions

- Real speaker name, role, and socials are unknown. The title, speaker, and
  Q&A slides carry `TODO(presenter)` markers and a placeholder photo
  (`public/img/speaker-placeholder.png`, generated, not a real photo).
- The Pulumi CLI's pin to 3.264.0 was not independently confirmed against a
  live release channel in this pipeline run (per `../AGENTS.md`); the
  presenter should confirm before the session.
- Whether this folder has merged to `main` by the time the workshop runs —
  if so, the follow-up and Q&A QR codes should be updated to point at the
  folder URL instead of the repo root.
