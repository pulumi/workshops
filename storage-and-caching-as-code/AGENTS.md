# AGENTS.md: storage-and-caching-as-code

Guidance for coding agents and humans working in this workshop folder of `pulumi/workshops`.

## What this folder is

Demo code for the workshop "Storage and caching as code": Longhorn and DragonflyDB on a 3-worker kind cluster, provisioned with Pulumi IaC (TypeScript). `README.md` has the run order and the known issues.

## Conventions

- Each numbered folder is one workshop step. Folders with `Pulumi.yaml` are separate Pulumi projects with unique names (`storage-caching-NN-...`). Folders 05 and 07 are shell and manifest only.
- Every Pulumi project builds one Kubernetes Provider. It uses the `kubeContext` config (default `kind-storage-workshop`), or `renderYamlToDirectory` for offline preview. Never pass both.
- Versions are pinned: Longhorn chart 1.13.0, DragonflyDB v1.40.0, kindest/node v1.35.8, redis 8.2.10-alpine. Change a pin only after reading the product docs again, and update README.md in the same commit.
- Every command shown in README.md or the slides must be one a script or step here actually runs.
- Scripts are bash with `set -euo pipefail`, pass shellcheck, and take `CTX` and `NS` from the environment.
- Do not commit `node_modules/`, `bin/`, rendered YAML, Pulumi state or stack files, or credentials. `*.md` is ignored except README.md, AGENTS.md and `slides/slides.md`.
- Dragonfly means DragonflyDB, not the CNCF project d7y.io.
