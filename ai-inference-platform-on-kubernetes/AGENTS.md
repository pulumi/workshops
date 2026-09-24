# AGENTS.md — ai-inference-platform-on-kubernetes

Guidance for coding agents (and humans) working in this workshop folder of
`pulumi/workshops`.

## What this folder is

The material for the workshop "Provisioning the AI inference platform on
Kubernetes: GPU node pools, autoscaling and quotas with Pulumi". Six Pulumi
Python projects plus a teardown script, covering the platform layer a GPU
inference workload runs on. No date has been scheduled for this workshop yet;
see the README for the KubeCon NA 2026 evidence that put it in the topic
backlog.

The repo carries what an attendee or a future presenter needs: the demo code
and these notes. The presenter's own working documents (runbook, rehearsal
checklist, fact-check log, open questions) stay off the repo; `.gitignore`
keeps every `*.md` out except `README.md`, the `AGENTS.md` files, and
`slides/slides.md` once the deck exists. If you write a new working
document, it is ignored by default; that is deliberate, do not force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders in this repo.
- Facts about Pulumi products (`pulumi-eks`, `pulumi-kubernetes`, Pulumi ESC,
  Pulumi Cloud) come from pulumi.com/docs, read the day noted in "Sources" in
  the README. Facts about Kubernetes, EKS, Karpenter, and NVIDIA's device
  plugin come from their own docs, likewise dated. If a doc is unclear, say
  so as an open question rather than guessing.
- Canonical names: Pulumi Neo (or Neo), Pulumi ESC, Pulumi Cloud, Pulumi IaC,
  Pulumi console (lowercase console). Never "Copilot", "Pulumi Service",
  "Insights", or "CrossGuard".
- Conventional Commits, scoped to this folder, e.g.
  `feat(ai-inference-platform-on-kubernetes): …`,
  `docs(ai-inference-platform-on-kubernetes): …`.
- Do not commit credentials, `node_modules/`, `dist/`, `venv/`, `.pulumi/`,
  or recordings.
- Every command shown on a slide must be a command this folder's demo
  actually runs, with the same flags.

## Demo code

- Six Pulumi Python projects, run in order: `01-cluster`, `02-device-plugin`,
  `03-quotas`, `04-autoscaling`, plus the illustrative, non-runnable
  `05-serving-layer`, and `06-teardown` (bash, not Pulumi). Each numbered
  Pulumi project has its own `AGENTS.md` with its design notes and what was
  and was not verified; read it before changing that project.
- `01-cluster` merges what the brief calls steps 1 and 2 (cluster, GPU node
  pool) into one Pulumi program, gated by a config flag, because
  `eks.ManagedNodeGroup` requires a live `eks.Cluster` object and cannot be
  fed by a `StackReference`. See `01-cluster/AGENTS.md`.
- `02-device-plugin`, `03-quotas`, and `04-autoscaling` each read the
  cluster's `kubeconfig` via `pulumi.StackReference` against `01-cluster`
  and build their own `pulumi_kubernetes.Provider` from it.
- No AWS credentials and no live cluster exist on the machine this was built
  on. `pulumi preview` was run for all four Pulumi projects against a local
  file-backed state, with `02-device-plugin`, `03-quotas` and
  `04-autoscaling` pointed at an empty (never-deployed) `01-cluster` stack.
  `01-cluster` and `04-autoscaling` built their full resource graphs and
  stopped at the AWS provider's credential check; `02-device-plugin` built
  its graph and stopped because its Helm chart needs live cluster
  connectivity even during preview; `03-quotas` previewed cleanly end to end
  (its plain Kubernetes resources do not need connectivity to preview). None
  failed on program logic. Each project's own `AGENTS.md` has the exact
  command and error text. Live cluster behavior (nodes Ready, GPU allocatable
  counts, quota rejections, Karpenter scaling, teardown leaving nothing
  behind) needs a real AWS account and is called out as unverified in the
  README and the pull request.
- AWS region is pinned to `us-west-2` throughout, per the brief.
- Estimated live-session cost: roughly $6-10 in on-demand compute for a
  90-minute session with one `g5.xlarge` GPU node, if torn down promptly
  afterward. The EKS control plane and any data transfer accrue on top of
  that; tell attendees this before they provision anything.
