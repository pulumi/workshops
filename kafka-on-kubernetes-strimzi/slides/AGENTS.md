# AGENTS.md — the deck's brief and sources

This file exists for whoever edits this deck next. It records where the
content came from and what was decided along the way. It does not replace
`../AGENTS.md`, which is the demo folder's own build record; read that one
first for the cluster mechanics this deck narrates.

## The workshop

Title: "Running Apache Kafka on Kubernetes with the Strimzi operator and
Pulumi." Length: 90 minutes. Audience: intermediate, platform and data
engineers. No session dates or event have been assigned yet, so there is
no scheduled slot to write toward. Speaker: unknown. The deck ships one
speaker placeholder slide and one placeholder QR on the closing slide;
both carry `TODO(presenter)` comments.

## The original request

In order of authority: the workshop brief (workspace document, id
`82c5632a-2a91-4ba4-ae77-58918138969f`), the backlog card that assigned
this build, the seven demo folders already committed in
`kafka-on-kubernetes-strimzi/`, the `slidev-deck` and `workshop-deck`
skills, and `pulumi/workshops/neo-in-a-docker-sandbox` as the reference
implementation for theme usage and deck shape.

Per-section minute budget (sums to 90, computed from the notes at
build time):

| Slide | Minutes |
| --- | --- |
| Cover | 1 |
| Speaker | 1 |
| Housekeeping | 1 |
| Agenda | 1 |
| Prerequisites | 2 |
| The problem without an operator | 4 |
| Strimzi closes that gap | 4 |
| Why Pulumi, not `kubectl apply` | 5 |
| Live demo divider | 1 |
| 01: kind cluster + operator | 8 |
| 02: node pools + KRaft cluster | 9 |
| 03: topic | 5 |
| 04: clients | 7 |
| 05: scale brokers | 8 |
| 06: rolling upgrade | 10 |
| Under the hood: reconciliation loop | 5 |
| Where this breaks in production | 4 |
| Beyond this workshop | 3 |
| 07: teardown | 3 |
| Recap | 3 |
| Keep going (follow-up) | 2 |
| Questions | 3 |
| **Total** | **90** |

## Sources

- Workshop brief, document id `82c5632a-2a91-4ba4-ae77-58918138969f` — read
  2026-09-27.
- `kafka-on-kubernetes-strimzi/README.md` and `AGENTS.md` (this repo,
  written by the demo-code build) — read 2026-09-27, for the exact
  commands, resource names, and version numbers shown on every demo slide.
- `05-scale-brokers/scale-brokers.sh`, `06-rolling-upgrade/rolling-upgrade.sh`,
  `07-teardown/teardown.sh`, `07-teardown/verify-clean.sh` — read in full,
  2026-09-27, so the slides narrate what the scripts actually do rather
  than a summary of their names.
- https://strimzi.io/docs/operators/latest/deploying — read 2026-09-27,
  confirms the two-step KRaft upgrade procedure (version first, then
  `metadataVersion`) shown on the 06 slide.
- https://github.com/strimzi/strimzi-kafka-operator/releases — read
  2026-09-27, confirms 1.2.0 is current and its release date.
- Independent talk, "The Road To Strimzi 1.0," 2026-03-26.
- Independent newsletter, "THE SIGNAL: What matters in distributed
  systems #2," 2026-04-13.
- Independent roundup, "Last Week in Cloud Native, Week 26," 2026-06-22.
  These three are cited on the "Strimzi closes that gap" slide for the
  CNCF Sandbox and 1.0.0 claims; none is a Pulumi source, so none is used
  for any Pulumi product claim.
- https://www.pulumi.com/docs/iac/clouds/kubernetes/ — read 2026-09-27,
  general confirmation of how Pulumi's Kubernetes provider and preview
  loop work; no specific quote used, since the deck's own claims about
  Pulumi (preview-before-apply, stack outputs) are already covered by the
  demo code's own `AGENTS.md`.
- https://slack.pulumi.com, https://app.pulumi.com/signup — fetched
  2026-09-27, both resolve; used as QR targets on the follow-up slide.
- https://github.com/pulumi/workshops/pull/244 — fetched 2026-09-27,
  resolves; used as the repo QR target until the branch merges to `main`,
  at which point the QR should point at
  `https://github.com/pulumi/workshops/tree/main/kafka-on-kubernetes-strimzi`
  instead. That swap is an open follow-up, not done here.

## Deviations from §5

- §5 gives the demo section one entry per numbered step in its outline,
  but the demo code that actually shipped has seven folders where
  producing and consuming (folder `04-clients`) is separate from creating
  the topic (folder `03-topic`). This deck follows the folder count, not
  the brief's slide count, giving `03-topic` and `04-clients` one slide
  each. The other demo folders map one slide to one folder as §5 intends.
- Added a "Prerequisites" slide (tools, `pulumi login`, cloning the repo)
  that is not one of §5's numbered entries. §6 of the brief calls for
  participants to follow along locally, which needs a setup slide before
  the pain/solution section starts.
- Added a plain section-divider slide ("Live demo") before the first demo
  folder. Neither §5 nor the arc in the `workshop-deck` skill names this
  slide explicitly, but the skill's arc calls for one, and jumping straight
  from "why Pulumi" into a code slide with no divider read as abrupt in
  the rendered build.
- The Strimzi "closes that gap" slide cites two independent trade
  articles and a newsletter for the CNCF Sandbox / 1.0.0 claim, not a
  vendor or CNCF landscape page directly. Both were read this run; no
  better primary source for "reached 1.0.0 in 2026" turned up in the time
  available. Flagged as an open question in the pull request.

## Rules that still bind

- Every command shown on a slide is a command the demo actually runs, with
  the same flags. Verified by reading `05-scale-brokers/scale-brokers.sh`
  and `06-rolling-upgrade/rolling-upgrade.sh` in full rather than
  paraphrasing their filenames.
- Speaker notes carry a time budget on every content slide; the sum is 90,
  checked programmatically at build time, not by hand-adding.
- No new Vue components beyond `QRCode.vue`, copied unmodified from the
  reference workshop.
- `two-cols` was not used in this deck; every layout that appears
  (`cover`, `default`, `statement`, `section`, `code`, `diagram`,
  `diagram-left`, `diagram-right`, `end`) is a named theme layout, none
  hand-rolled.
- No em dashes, en dashes, or the standard AI-writing tells; checked with
  a grep pass after the deck was written, separate from the writing pass
  itself.

## Check before committing

```bash
npm run build && npm run export
```

Both were run for this build. `build` passed. `export` passed with
`--wait-until networkidle --wait 1500 --timeout 60000`; the resulting PDF
is 22 pages, roughly 500 KB, and every diagram and QR-code slide was
rendered to PNG and inspected, not just measured by file size.
