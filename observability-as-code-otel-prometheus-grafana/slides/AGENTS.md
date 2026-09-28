Workshop: Observability as Code: OpenTelemetry, Prometheus and Grafana on Kubernetes with Pulumi

Session date: unknown. Speakers: unknown, one placeholder speaker slide is in the deck
(`slides.md`), marked with `<!-- TODO(presenter): replace photo, name, role, socials and bio -->`.
Replace `public/img/speaker-placeholder.png` and the placeholder text before this deck is
presented.

Length: 90 minutes total (60 min guided build, 20 min live query and dashboard exploration,
10 min Q&A). Every speaker note carries a time-budget line; they sum to exactly 90.

Built by workprentice (agent Anvil) on behalf of Engin Diri, 2026-09-28.

## The original request

In order of authority for anyone editing this deck later:

1. The accepted workshop brief: https://workprentice.ai/documents/816884ba-46d0-4fce-92d3-156277699423
2. This file and the parent `AGENTS.md`, for conventions this pipeline has settled on.
3. The demo code under the numbered folders at the workshop root, which the deck must match
   step for step. If a slide and the demo code disagree, the demo code is right; fix the slide.

## Structure and minute budget

| # | Slide | Minutes |
|---|-------|---------|
| 1 | Title | 1 |
| 2 | Speaker (placeholder) | 1 |
| 3 | Housekeeping | 1 |
| 4 | Agenda | 1 |
| 5 | Hook: the reproducibility gap | 3 |
| 6 | Architecture diagram | 3 |
| 7 | Prerequisites check | 2 |
| 8 | Demo section divider | 1 |
| 9 | Step 1: 01-cluster | 5 |
| 10 | Step 2: 02-metrics-stack | 7 |
| 11 | Concept: Helm via Pulumi vs. `helm install` | 3 |
| 12 | Step 3: 03-collector | 6 |
| 13 | Step 4: 04-sample-app | 7 |
| 14 | Step 5: 05-dashboard | 7 |
| 15 | Step 6: 06-alert-rule | 5 |
| 16 | Step 7: 07-load-and-observe | 20 |
| 17 | What you'd change on Monday | 2 |
| 18 | Common pitfalls | 2 |
| 19 | Recap of learning outcomes | 2 |
| 20 | Resources and follow-up | 1 |
| 21 | Q&A / Thanks | 10 |

Total: 90 minutes.

## Sources read this run

- Marketing-web `slidev-deck` skill (theme scaffold and conventions), commit
  `9b37f9afe8c7b0d406f19bc9116b16d5689389ce` on `pulumi/marketing-web`, read 2026-09-28.
- Reference workshop `pulumi/workshops` at `neo-in-a-docker-sandbox/slides/` on `main` in this
  same checkout: `slides.md`, `AGENTS.md`, `components/QRCode.vue`, `package.json`, and the
  layout list under `node_modules/@pulumi/slidev-theme/layouts/`. Used for the frame slides
  (title, speaker, housekeeping, agenda, follow-up, Q&A) and the `QRCode.vue` component, copied
  verbatim into `components/QRCode.vue`. Read 2026-09-28.
- Pulumi Registry, `kubernetes.helm.sh/v3.Release` API doc at pulumi.com/registry, read
  2026-09-28, for the accurate description of what a Pulumi-managed Helm `Release` is and how
  it differs from `helm install` (slide 11).
- The workshop's own `README.md` (already committed) for the exact command sequence used on
  every demo slide.

## Deviations from the brief's slide list

None in slide count or order. One judgment call the brief flags as open: the brief names only
`kube-prometheus-stack`, but step 7's live-trace-waterfall end state needs a trace store that
`kube-prometheus-stack` does not provide, so the demo (and slide 10's notes) add `grafana/tempo`
to close that gap. This is called out on slide 10 as a judgment call, not a brief requirement.

## Rules that still bind

- Commands on slides 9, 10, 12, 13, 14, 15, 16 are copied verbatim from the workshop `README.md`.
  If the demo's command sequence changes, update both files together.
- `two-cols` has no default slot; both `::left::` and `::right::` must be written explicitly.
- Mermaid diagrams only take `{scale: N}`; there is no CSS override. Re-render to PNG and look
  after any content change to a diagram slide.
- `QRCode` must be wrapped in a sized `<div>`; a size class on the tag itself clips it.
- Keep `node_modules/`, `dist/`, and any exported PDF out of git; `slides/.gitignore` covers
  this. The parent folder's `.gitignore` carries an explicit `!slides/slides.md` exception to
  its blanket `*.md` ignore; do not remove it.
