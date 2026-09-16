# AGENTS.md — neo-in-a-docker-sandbox

Guidance for coding agents (and humans) working in this workshop folder of
`pulumi/workshops`.

## What this folder is

The material for the workshop "Neo in a Docker Sandbox: Using Pulumi's Coding
Agent for All Things Infra Safely and Securely" (Americas 2026-09-16, EMEA
2026-10-14). Slides, an 11-minute demo, and the Docker Sandboxes kit that runs
`pulumi neo` inside a sandbox. See `README.md` for the layout and how to run
both halves.

The repo carries what an attendee or a future presenter needs: the deck, the
demo code and these notes. The presenter's own working documents — the runbook,
the rehearsal checklist, the fact-check log, the open questions — stay on the
presenter's machine; `.gitignore` keeps every `*.md` out except `README.md`,
the `AGENTS.md` files and `slides/slides.md`. If you write a new working
document, it is ignored by default; that is deliberate, do not force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders in this repo.
- Facts about Pulumi Neo, Pulumi ESC and Docker Sandboxes come from the docs
  listed under "Sources" in `README.md`. If a doc is unclear, write down the
  question in the presenter's open-questions notes instead of guessing.
- Canonical names: Pulumi Neo (or Neo), Pulumi ESC, Pulumi Cloud, Pulumi IaC,
  Pulumi console (lowercase console), Docker Sandboxes, `sbx`. Never "Copilot",
  "Pulumi Service", "Insights", "CrossGuard".
- Conventional Commits, scoped to this folder, e.g.
  `feat(neo-in-a-docker-sandbox): …`, `docs(neo-in-a-docker-sandbox): …`.
- Do not commit credentials, `node_modules/`, `dist/`, `.state/`, recordings.

## Slides (`slides/`)

The deck's brief, its sources and the slide rules are in
[`slides/AGENTS.md`](slides/AGENTS.md); read it before touching `slides.md`.

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

- The demo sandbox is the published kit
  `ghcr.io/dirien/infrastructure-sandbox-kit:v0.10.0` (set in
  `01-sandbox/lib.sh` as `KIT_REF`). Nothing in this folder builds a kit or an
  image for the demo.
- `01-sandbox/`, `03-guardrails/`: host-side bash, macOS and Linux, shellcheck
  clean (`.shellcheckrc` in this folder).
- `04-policy/`: the policy pack. `npx tsc --noEmit` must pass and
  `npx tsc && node bin/test/rules-test.js` must report `failed=0`. The rules
  must keep passing the baseline stack and the hardened bucket; they only fire
  when a bucket is opened to the public.
- `02-app/`: Pulumi TypeScript; `npx tsc --noEmit` must pass. It must keep
  `protect: true` on the bucket, and its AWS credentials must keep coming from
  the ESC environment imported into `Pulumi.dev.yaml` (no static AWS
  credentials anywhere, and no bootstrap in this folder).
- `sbx` is a host tool: it cannot run inside a sandbox. Inspect the template
  image with `docker run --entrypoint bash ghcr.io/dirien/infrastructure-sandbox:v0.10.0`.
