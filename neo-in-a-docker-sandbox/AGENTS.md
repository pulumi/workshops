# AGENTS.md — neo-in-a-docker-sandbox

Guidance for coding agents (and humans) working in this workshop folder of
`pulumi/workshops`.

## What this folder is

The material for the workshop "Neo in a Docker Sandbox: Using Pulumi's Coding
Agent for All Things Infra Safely and Securely" (Americas 2026-09-16, EMEA
2026-10-14). Slides, a 15-minute demo, and the Docker Sandboxes kit that runs
`pulumi neo` inside a sandbox. See `README.md` for the layout and `DEMO.md`
for the runbook.

## Rules

- Stay inside this folder. Never modify other workshop folders in this repo.
- Facts about Pulumi Neo, Pulumi ESC and Docker Sandboxes come from the docs
  listed under "Sources" in `README.md`. If a doc is unclear, add an entry to
  `OPEN-QUESTIONS.md` instead of guessing.
- Canonical names: Pulumi Neo (or Neo), Pulumi ESC, Pulumi Cloud, Pulumi IaC,
  Pulumi console (lowercase console), Docker Sandboxes, `sbx`. Never "Copilot",
  "Pulumi Service", "Insights", "CrossGuard".
- Conventional Commits, scoped to this folder, e.g.
  `feat(neo-in-a-docker-sandbox): …`, `docs(neo-in-a-docker-sandbox): …`.
- Do not commit credentials, `node_modules/`, `dist/`, `.state/`, recordings.

## Slides (`slides/`)

- Slidev with `@pulumi/slidev-theme` (public npm). Keep the style of the GKE
  workshop deck: `# Title` content slides with `<div class="zoom-content">`
  lists, separator slides as centered `<h1>` in `text-[var(--p-primary)]`,
  `.gpu-card`/`.gpu-caption`/`.info-card`/`.big-code` primitives from
  `style.css`, Mermaid with the same theme variables.
- Every content slide ends with speaker notes in an HTML comment
  (`<!-- … -->`) that includes a time budget.
- Slides marked `<!-- MIKE: replace -->` belong to the Docker segment; leave
  them as placeholders unless Mike's content is provided.
- Check: `npm run build` and `npm run export` must pass.

## Demo code

- `neo-kit/`: the kit spec plus its files. After editing the guard or the
  entrypoint run `bash neo-kit/test/guard-test.sh` and
  `shellcheck neo-kit/files/home/.local/share/neo-sandbox/*.sh`.
- `01-sandbox/`, `03-guardrails/`: host-side bash, macOS and Linux, shellcheck
  clean (`.shellcheckrc` in this folder).
- `02-app/`, `00-esc/`: Pulumi TypeScript; `npx tsc --noEmit` must pass.
  `02-app` must keep `protect: true` on the bucket and must keep importing the
  ESC environment in `Pulumi.dev.yaml` (no static AWS credentials anywhere).
- `sbx` is a host tool: it cannot run inside a sandbox. Test the in-image
  parts with `docker run --entrypoint bash ghcr.io/dirien/infrastructure-sandbox:v0.9.0`
  and mount `neo-kit/files` (see `neo-kit/test/`).
