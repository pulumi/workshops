# AGENTS.md — storage-and-caching-on-kubernetes-longhorn-dragonfly

Guidance for coding agents (and humans) working in this workshop folder of
`pulumi/workshops`.

## What this folder is

The material for the workshop "Storage and caching as code: Rook,
Dragonfly and Longhorn on Kubernetes with Pulumi" -- a 90-minute session
(55 minutes guided build, 20 minutes live failover demo, 15 minutes Q&A)
for platform engineers running stateful workloads on Kubernetes. Slides and
a seven-step demo that stands up a Longhorn-backed persistent volume and a
Dragonfly cache on a local `kind` cluster, both provisioned with Pulumi,
and drills a simulated node failure to show the volume's data surviving
it. See `README.md` for the layout and how to run the demo.

Despite the workshop's working title naming Rook, this build teaches with
Longhorn as the primary storage vehicle, per the brief's own default; Rook
appears only in comparison material. See `README.md`'s "Known risk" section
and the pull request description for why, and for the open question about
whether the title should be corrected.

## Rules

- Stay inside this folder. Never modify other workshop folders in this repo.
- Facts about Pulumi Kubernetes, Longhorn and Dragonfly come from the
  sources listed in `README.md`'s "Sources" section, all read during this
  build. If a doc is unclear, it goes in the pull request as an open
  question, never filled in with something plausible.
- Canonical names: Pulumi Neo (or Neo), Pulumi ESC, Pulumi Cloud, Pulumi
  IaC, Pulumi console (lowercase console). Never "Copilot", "Pulumi
  Service", "Insights", "CrossGuard".
- Conventional Commits, scoped to this folder, e.g.
  `feat(storage-and-caching-on-kubernetes-longhorn-dragonfly): …`.
- Do not commit credentials, `node_modules/`, `dist/`, rendered manifests,
  local Pulumi state, or recordings.
- `.gitignore` keeps every `*.md` out except `README.md`, the `AGENTS.md`
  files, and `slides/slides.md` -- presenter working documents (runbook,
  rehearsal checklist, fact-check log, open questions) stay off the repo by
  design. If you write a new working document, it is ignored by default;
  do not force-add it.

## Layout

Each numbered folder is its own Pulumi TypeScript project, chained with
`pulumi.StackReference` (01 -> 02, 06; 02 -> 03; 01+03 -> 04; 01+06 -> 07).
Every project's `k8s.Provider` is built from `context` on a live run or
`renderYamlToDirectory` for offline verification, never both -- see
`01-cluster/AGENTS.md` for the pattern every later project repeats. See
each folder's own `AGENTS.md` for what it provisions and how to verify it.

## Known risk

Longhorn does not appear on Longhorn's own supported/tested platform list,
and neither does kind, in either direction. See `README.md`'s "Known risk"
section before assuming this workshop's cluster choice is validated for
Longhorn specifically.
