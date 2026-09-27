# AGENTS.md — gpu-aware-batch-scheduling-volcano

Guidance for coding agents (and humans) working in this workshop folder of
`pulumi/workshops`.

## What this folder is

The material for the workshop "GPU-aware batch scheduling for AI training on
Kubernetes with Pulumi": not yet scheduled at an event. Demo code today;
slides follow on the same branch. See `README.md` for the layout and how to
run the demo.

The repo carries what an attendee or a future presenter needs: the demo code,
the deck (once built) and these notes. Presenter working documents — rehearsal
notes, fact-check logs, open-questions scratch — stay off the repo;
`.gitignore` keeps every `*.md` out except `README.md`, the `AGENTS.md` files
and `slides/slides.md`. If you write a new working document, it is ignored by
default; that is deliberate, do not force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders in this repo.
- Facts about Volcano, Kubernetes DRA, the NVIDIA DRA driver and AWS EKS come
  from the docs listed under "Sources" in `README.md`, read fresh each time
  this folder is touched — not from memory, since all of these move fast.
  Facts about Pulumi products come from pulumi.com/docs, with a link and a
  read date.
- Canonical names: Pulumi Neo (or Neo), Pulumi ESC, Pulumi Cloud, Pulumi IaC,
  Pulumi console (lowercase console). Never "Copilot", "Pulumi Service",
  "Insights", "CrossGuard".
- Conventional Commits, scoped to this folder, e.g.
  `feat(gpu-aware-batch-scheduling-volcano): …`,
  `docs(gpu-aware-batch-scheduling-volcano): …`.
- Do not commit credentials, `node_modules/`, `dist/`, `.state/`, recordings,
  or rendered Pulumi YAML output.

## Demo code

- `01-cluster/`: `npx tsc --noEmit` must pass. `pulumi preview` must resolve
  the live Volcano Helm chart cleanly (44 resources at last verification).
  The `local.Command` that runs `kind create cluster` needs Docker and `kind`
  on the machine actually running the demo; it cannot be exercised in an
  environment without them, and no PR should claim it passed unless it was
  actually run against a real Docker daemon.
- `02-queues/`, `03-gang-scheduling/`, `04-fair-share/`: `npx tsc --noEmit`
  must pass, and each project's resource graph must render offline cleanly
  with `pulumi up --config renderYamlToDirectory=<dir>` — check the rendered
  YAML matches the CRD shape in the Volcano docs (`scheduling.volcano.sh/v1beta1`
  Queue, `batch.volcano.sh/v1alpha1` Job) before committing.
- `05-gpu-dra/`: `npx tsc --noEmit` must pass. This project needs real AWS
  credentials and GPU instance quota to actually run — see README "GPU quota".
  Never claim this was run live unless it genuinely was, with real AWS
  credentials, on this run.
- `06-teardown/`: shellcheck clean (`.shellcheckrc` in this folder,
  `shellcheck --rcfile=.shellcheckrc 06-teardown/*.sh`).
- Every script and Pulumi project pins the versions named in README
  "Sources"; if a version there stops resolving, say so rather than silently
  bumping it.

See `slides/AGENTS.md` for the deck's own build record, sources and minute
budget.
