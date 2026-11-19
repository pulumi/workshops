# AGENTS.md — chaos-experiments-as-code-aws-fis

## What this folder is

A 90-minute workshop: chaos experiments as code with Pulumi IaC and AWS Fault Injection Service. Demo code in numbered folders, slides in `slides/` (added later).

## Rules

- Stay inside this folder. Do not touch other workshops.
- Take facts about Pulumi products from the pages listed in the README Sources, read in the current run.
- Use the canonical names: Pulumi IaC, Pulumi ESC, Pulumi Cloud, Pulumi Policies, Pulumi console.
- Commits are Conventional Commits scoped to `chaos-experiments-as-code-aws-fis`.
- No credentials, `node_modules/`, `bin/`, state or recordings in a commit.
- Every command shown on a slide is one the demo runs, with the same flags.

## Demo code

- Steps 2 to 6 are progressive snapshots of one project (`chaos-fis`, stack `dev`). A change to shared code goes into every later snapshot.
- Pins: `@pulumi/pulumi` 3.272.0, `@pulumi/aws` 7.51.1, `@pulumi/policy` 1.21.0, `@types/node` 26.6.5, image `nginx:1.31.2-alpine`.
- Deviation from the brief: `typescript` is pinned to 5.9.3, not 7.0.2. `@pulumi/pulumi` 3.272.0 declares the peer range `>= 3.8.3 < 7`.
- Test hook: the config keys `vpcId` and `subnetIds` skip the default VPC lookup. Set them (with the `aws:skip*` options and dummy keys) to run `pulumi preview` without AWS access. Do not set them for the workshop.
- The policy pack reads only `source` of each stop condition, never the alarm ARN. `package.json` of the pack must have a `version`.
- Verify:
  - `npx tsc --noEmit` in each Pulumi project and in `06-policy-gate/policy-pack`.
  - `shellcheck` on every `*.sh`.
  - `pulumi preview` on a local backend with the test hook; in `06-policy-gate/program` add `--policy-pack ../policy-pack` and expect a mandatory violation for `no-stop-condition`.
  - The real AWS runs (steps 1, 7 to 9, alias no-replace in step 5) need a live account.
