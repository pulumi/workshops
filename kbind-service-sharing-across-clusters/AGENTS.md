# AGENTS.md - kbind-service-sharing-across-clusters

Guidance for coding agents (and humans) working in this workshop folder of `pulumi/workshops`.

## What this folder is

The demo code for the workshop on sharing Kubernetes APIs across clusters with kbind and Pulumi IaC. See `README.md` for the layout, the pins and the open points.

The repo carries what an attendee or a future presenter needs: the demo code and these notes. Working documents stay on the presenter's machine; `.gitignore` keeps every `*.md` out except `README.md`, `AGENTS.md`, the step READMEs (`0*/README.md`, `fallback/kind/README.md`) and `slides/slides.md`. A new working document is ignored by default; that is deliberate, do not force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders in this repo.
- Facts about Pulumi IaC, Pulumi ESC and Pulumi Cloud come from pulumi.com/docs read in the current run. kbind facts come from the kbind-dev/kbind repository at the pinned tag. If a source is unclear, write the question in `README.md` under "Open points" instead of guessing.
- Canonical names: Pulumi IaC, Pulumi ESC, Pulumi Cloud, Pulumi Neo, Pulumi console (lowercase console). Never "Copilot", "Pulumi Service", "Insights", "CrossGuard".
- Every command shown on a slide or in a step README is a command a script here runs, with the same flags. Change the script and the README together.
- Never pass `--yes` to `pulumi config env add`. Mutating commands ask unless `KBIND_DEMO_YES=1`.
- Pins live in `01-stacks-and-esc/lib.sh` (shell) and `package.json` / `02-provider/kbind-provider.ts` (TypeScript). Change all places together.
- Conventional Commits scoped to this folder, e.g. `feat(kbind-service-sharing-across-clusters): ...`.
- Do not commit credentials, `node_modules/`, `.state/`, kubeconfigs or Pulumi state. Kubeconfig outputs are secrets and are written only to `.state/`.

## Checks

```bash
shellcheck -x $(find . -name '*.sh' -not -path '*/node_modules/*')
(cd 02-provider && npm install && npx tsc --noEmit)
(cd 05-consumer && npm install && npx tsc --noEmit)
```

Neither check proves the demo works; that needs AWS and a run of every step.
