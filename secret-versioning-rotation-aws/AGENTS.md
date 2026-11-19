# AGENTS.md: secret-versioning-rotation-aws

## What this folder is

Demo code and, later, slides for the workshop "Secret versioning and rotation patterns on AWS". See README.md for the layout and the run order.

## Rules

- Demo steps 2 to 4 are one Pulumi project in `02-rotating-secret/`, staged by `demoStep`. Do not split it.
- Every command shown on a slide must be one the demo runs, with the same flags.
- The rotation Lambda ports the AWS generic template. `setSecret` is a deliberate no-op; say so on the slide.
- `09-require-rotation/rules.ts` must not read resource `props`. At preview, ids are unknown and the engine skips the policy. Match on `propertyDependencies`.
- Secrets have `recoveryWindowInDays: 0` so the demo can be re-run. Do not copy that setting into production code.
- Never commit `node_modules/`, `bin/`, stack files, state or credentials. `*.md` is ignored except README.md, AGENTS.md and `slides/slides.md`.
- Names: Pulumi ESC, Pulumi IaC, Pulumi Cloud.
