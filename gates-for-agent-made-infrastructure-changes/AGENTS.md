# AGENTS.md: gates-for-agent-made-infrastructure-changes

Guidance for coding agents (and humans) working in this workshop folder of `pulumi/workshops`.

## What this folder is

The material for the workshop "Gates for agent-made infrastructure changes: mandatory policies, ESC approvals and an audit trail with Pulumi" (90 minutes, Python, AWS eu-west-1). Demo code for nine steps, and slides under `slides/` when present. See `README.md` for the layout and how to run each step.

The repo carries what an attendee or a future presenter needs: the demo code, the deck and these notes. Presenter working documents stay on the presenter's machine; `.gitignore` keeps every `*.md` out except `README.md`, the `AGENTS.md` files, `slides/slides.md` and the step 6 `README.md`. A new working document is ignored by default; that is deliberate, do not force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders in this repo.
- Facts about Pulumi products come from the docs listed under "Sources" in `README.md`. If a doc is unclear, write the question down instead of guessing.
- Canonical names: Pulumi Neo (or Neo), Pulumi ESC, Pulumi Cloud, Pulumi IaC, Pulumi console (lowercase console). Never "Copilot", "Pulumi Service", "Insights", "CrossGuard".
- Conventional Commits scoped to this folder, for example `feat(gates-for-agent-made-infrastructure-changes): ...` or `docs(gates-for-agent-made-infrastructure-changes): ...`.
- Do not commit credentials, `venv/`, `node_modules/`, `dist/`, state files or recordings.

## Demo code

- Every script sources `lib.sh`, reads the org from `PULUMI_ORG` and asks before any destructive or credential-changing step. Keep that.
- `01-baseline/`: Pulumi Python program. AWS credentials come from the ESC environment `agent-gates/aws-prod` through OIDC; no static AWS keys anywhere.
- `02-policy-pack/`: `venv/bin/python -m pytest tests` must pass. The three rules must keep failing the non-compliant bucket and passing the fixed one.
- Pack name (`agent-gates-s3`), stack name (`agent-gates`) and environment name (`agent-gates/aws-prod`) are referenced by several scripts. Change them everywhere or nowhere.
- Every script must pass `shellcheck` (`.shellcheckrc` sets the source path) and `python3 -m py_compile` for the Python files.
- Steps with no CLI or API route in the docs (approval ruleset, review and apply, policy group deletion) print console steps. Do not invent a command for them.
- The program uses the `*V2` S3 types in `pulumi-aws` 7.51.1, which emit three deprecation warnings. This is intentional.

## Slides

If `slides/` exists, read `slides/AGENTS.md` before touching `slides.md`. Every command on a slide must be one the demo runs, with the same flags.
