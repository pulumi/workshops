# AGENTS.md: aws-s3-security-baseline

Guidance for coding agents and humans working in this workshop folder of `pulumi/workshops`.

## What this folder is

The material for the workshop "Automating the S3 security baseline as code": demo code for the steps in `README.md`, and later the Slidev deck in `slides/`.

## Rules

- Stay inside this folder. Never modify other workshop folders.
- Facts about Pulumi products come from the docs listed under "Sources" in `README.md`. If a doc is unclear, write the question down instead of guessing.
- Canonical names: Pulumi Neo, Pulumi ESC, Pulumi Cloud, Pulumi IaC, Pulumi console (lowercase console). Never "Copilot", "Pulumi Service", "Insights", "CrossGuard".
- Every command in the deck is one the demo runs, with the same flags.
- Conventional Commits scoped to this folder, e.g. `feat(aws-s3-security-baseline): ...`.
- Do not commit credentials, `node_modules/`, `dist/`, state or recordings. `.gitignore` keeps every `*.md` out except `README.md`, the `AGENTS.md` files and `slides/slides.md`; do not force-add a working document.
- Pins: `@pulumi/pulumi` 3.268.0, `@pulumi/aws` 7.50.0, `@pulumi/policy` 1.21.0. Keep the five `package.json` files in step.
- The checkpoint projects (01, 04, 06, 08) share the project name `s3-baseline` and the stack name `dev`. `secureBucket.ts` is duplicated in 06 and 08; change both together.
- Scripts use `set -euo pipefail` and must pass `shellcheck -x`.
