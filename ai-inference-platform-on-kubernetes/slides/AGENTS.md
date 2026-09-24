# AGENTS.md: the deck's brief and sources

This file records what the deck was asked to be and which sources it was
built from, so anyone editing `slides.md` works from the same brief.
Conventions for the whole workshop folder are in `../AGENTS.md`.

## The workshop

"Provisioning the AI Inference Platform on Kubernetes: GPU node pools,
autoscaling and quotas with Pulumi." 90 minutes, intermediate level, for
platform engineers and SREs who run Kubernetes and have been handed the
ticket "add GPU inference support." No session date, event, or speaker has
been confirmed; the speaker slides in `slides.md` are placeholders, marked
with `TODO(presenter)` comments.

Brief: https://workprentice.ai/documents/2dd12238-f1d5-478c-b431-c78c9a0d23c4

## Frame additions beyond the brief's §5 outline

The brief's §5 lists 15 content beats. The deck wraps them in the standard
workshop frame (cover, speakers, housekeeping, agenda, demo, follow-up,
Q&A); six slides in the deck are frame, not brief content:

- Speaker slide (placeholder, one slide since the speaker count is unknown)
- Housekeeping
- Agenda
- Prerequisites (drawn from the brief's §6, given its own slide since GPU
  quota approval is the one prerequisite worth calling out on its own)
- "Live demo" section divider ahead of the six demo slides
- "Keep going" follow-up slide (Slack, Pulumi Cloud signup, workshop repo)

One slide was split that the brief's §5 counted as one: §5.2 ("why this, why
now") became two slides, a data slide on KubeCon/AI Engineer World's Fair
track sizes and a one-line `statement` slide naming the DevOpsDays caveat.
Splitting it let the caveat land as its own beat instead of a bullet buried
under conference statistics. No other §5 entry was split, dropped, or
reordered. The speaker note minute budgets absorb the split: the two slides
together carry the 4 minutes the brief's structure implies for that beat.

## Speaker note minute budget (must total 90)

1+2+1+1+3 (cover, speaker, housekeeping, agenda, prerequisites)
+ 3+1+4+4+3+5 (why now, caveat, two problems, what Pulumi does well, what it
  doesn't package, diagram)
+ 1 (demo divider)
+ 14+10+9+12+5+4 (the six demo slides)
+ 3+2 (recap, where to go next)
+ 1+1 (follow-up, Q&A)
= 90. Every content slide carries a note with its own budget; re-add them
before changing any slide's content and confirm the total still holds.

## Demo-to-slide mapping

Every command shown on a demo slide is copied verbatim, flags included, from
`../README.md`'s "Run the demo" section and the numbered folders' own
`AGENTS.md` files. No slide shows a command the demo does not run.

| Slide | Demo folder | Commands shown |
| --- | --- | --- |
| 1 · Cluster, then the GPU node group | `01-cluster` | `pulumi up` twice, `pulumi config set gpuNodeGroupEnabled true` |
| 2 · Drivers, as a Helm release | `02-device-plugin` | `pulumi up`, `kubectl describe node` |
| 3 · Quotas keep one team from eating the cluster | `03-quotas` | `pulumi up`, `kubectl apply -f manifests/oversized-gpu-pod.yaml` |
| 4 · Autoscaling that understands GPUs | `04-autoscaling` | `pulumi up`, `kubectl scale` to 2 then 0 |
| 5 · Where the serving layer would start | `05-serving-layer` | nothing applied; shows `kserve-example.yaml`'s `apiVersion`/`kind` only |
| 6 · Tear it all down | `06-teardown` | `teardown.sh`, `verify-clean.sh` |

## The repo QR / link problem

The workshop's own folder
(`github.com/pulumi/workshops/tree/main/ai-inference-platform-on-kubernetes`)
does not resolve on `main` until this workshop's pull request merges. The
"Keep going" and closing slides therefore point their repo QR codes and
links at the repository root (`github.com/pulumi/workshops`) and name the
folder in the surrounding slide text instead of linking it directly. Update
both QR targets to the folder URL once the PR merges.

## Sources (read September 24, 2026)

- Brief: https://workprentice.ai/documents/2dd12238-f1d5-478c-b431-c78c9a0d23c4
- Demo README and per-folder `AGENTS.md` files in this workshop's folder,
  the source of every command and version number shown on a demo slide
- Pulumi EKS `Cluster`: https://www.pulumi.com/registry/packages/eks/api-docs/cluster/
- Pulumi EKS `ManagedNodeGroup` (decisive fact: takes a live cluster object,
  which is why steps 1 and 2 share one Pulumi project):
  https://www.pulumi.com/registry/packages/eks/api-docs/managednodegroup/
- Pulumi Kubernetes Helm v4 `Chart`: https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/
- Pulumi blog, AI agents on Kubernetes: https://www.pulumi.com/blog/ai-agents-on-kubernetes/
- `pulumi-labs/pulumi-nvidia-aicr`: https://github.com/pulumi-labs/pulumi-nvidia-aicr
- Pulumi Community Slack: https://slack.pulumi.com
- Pulumi Cloud signup: https://app.pulumi.com/signup
- Workshop repo root: https://github.com/pulumi/workshops
- KServe and Ray Serve registry pages both return 404 (checked directly,
  confirming there is no first-party Pulumi package for either), reported
  in the demo's own README and repeated on the "what Pulumi stops at" slide

All URLs above were opened and their content confirmed live during this
build, not assumed from memory.

## Conventions

- Named theme layouts throughout (`cover`, `default`, `section`, `statement`,
  `code`, `diagram`, `end`); no custom `style.css`, per the slidev-deck
  skill. The title and speaker slides use plain utility classes for the
  photo/text layout, matching the pattern the skill calls out explicitly for
  that one case.
- `qrcode` and `mermaid` are both real `package.json` dependencies; the deck
  has one Mermaid diagram (the platform overview) and three QR codes
  (follow-up slide) plus two more on the closing slide.
- Six lines or fewer per content slide. Code slides show only the commands
  a slide's demo step actually runs.

## Check before committing

```bash
npm run build && npm run export
```

Both must pass. Export every slide to PNG and look at each one for overflow,
clipped diagrams, or clipped QR codes before calling the deck done.
