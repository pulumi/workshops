# AGENTS.md: aws-eventbridge-patterns

Guidance for coding agents (and humans) working in this workshop folder of `pulumi/workshops`.

## What this folder is

The demo code (and, once added, the slides) for the 90-minute workshop "Event routing as code on AWS". See `README.md` for the layout and the demo flow. The repo carries the demo code and notes; presenter working documents stay local. `.gitignore` keeps every `*.md` out except `README.md`, `AGENTS.md` and `slides/slides.md`, so a new working document is ignored by default. Do not force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders in this repo.
- Facts about Pulumi products come from the docs listed under "Sources" in `README.md`. If a doc is unclear, write the question down instead of guessing.
- Canonical names: Pulumi IaC, Pulumi ESC, Pulumi Cloud, Pulumi Policies, Pulumi console (lowercase console), Pulumi Neo. Never "Copilot", "Pulumi Service", "Insights", "CrossGuard".
- Conventional Commits, scoped to this folder, e.g. `feat(aws-eventbridge-patterns): ...`.
- Do not commit credentials, `node_modules/`, `bin/`, `dist/`, state files or recordings.

## Demo code

- AWS region `eu-central-1`, TypeScript, Lambda runtime `nodejs22.x` with inline code. Versions are pinned exactly in each `package.json`.
- Steps 02 to 06, 08 and 09 share the project name `aws-eventbridge-patterns` and the stack `dev`. Keep logical resource names stable between steps: the component aliases depend on them.
- `eventRouter.ts` must be identical in `05-component`, `06-unit-test`, `08-archive-replay` and `09-schedule`. Check with `diff -q 05-component/eventRouter.ts <folder>/eventRouter.ts`.
- Checks before a push: `npx tsc --noEmit` in every project folder and in `07-policy`; `npm test` passes and `PLAIN_TARGET=1 npm test` fails in `06-unit-test`; `shellcheck -x */*.sh`.
- Policy check: `pulumi preview --policy-pack ../07-policy` from `06-unit-test` passes, and with `addPlainTarget` set to true it must report `eventbridge-target-has-dlq`. Read the output; a green exit code alone is not proof.
- Every command on a slide must be a command the demo runs, with the same flags.
