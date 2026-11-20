# AGENTS.md - kubernetes-cluster-fleet-as-code

Guidance for coding agents (and humans) working in this workshop folder of
`pulumi/workshops`.

## What this folder is

The material for the workshop "Run a Kubernetes cluster fleet as code: one
component, one stack per cluster, staged upgrades with Pulumi" (90 minutes).
The demo builds three AKS clusters as code and upgrades them in two stages.
See `README.md` for the layout, the nine demo steps and the sources.

The repo carries what an attendee or a future presenter needs: the deck, the
demo code and these notes. Presenter working documents (runbook, rehearsal
checklist, fact-check log, open questions) stay on the presenter's machine;
`.gitignore` keeps every `*.md` out except `README.md`, the `AGENTS.md` files
and `slides/slides.md`. A new working document is ignored by default. That is
deliberate: do not force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders in this repo.
- Facts about Pulumi products come from the pages listed under "Sources" in `README.md`. If a page is unclear, write the question down instead of guessing.
- Canonical names: Pulumi IaC, Pulumi ESC, Pulumi Cloud, Pulumi Policies, Pulumi console (lowercase console), Pulumi Automation API, Azure Kubernetes Fleet Manager. Never "Pulumi Service", "Insights", "CrossGuard".
- Conventional Commits, scoped to this folder, for example `feat(kubernetes-cluster-fleet-as-code): ...`, `docs(kubernetes-cluster-fleet-as-code): ...`.
- Do not commit credentials, `node_modules/`, `bin/`, `dist/`, state files or recordings.
- Every command on a slide is a command the demo runs, with the same flags.
- Versions are pinned exactly (no `^`) in every `package.json`: Pulumi CLI 3.277.0, Node.js 24.22.3, `@pulumi/pulumi` 3.277.0, `@pulumi/azure-native` 3.32.0, `@pulumi/kubernetes` 4.34.3, `@pulumi/policy` 1.21.0, `typescript` 6.0.3 (must stay below 7 while `@pulumi/pulumi` requires it), `@types/node` 24.19.2, `ts-node` 10.9.2. Move a pin only after the pinned set in the brief changes.

## Checks

Each Pulumi project has its own `package.json` and `package-lock.json`. Run from the project folder after `npm ci`:

- `npx tsc --noEmit` must pass in `03-fleet-core`, `04-fleet-policies`, `05-fleet-cluster` and `06-update-run`.
- `04-fleet-policies/`: `npx tsc && node --test bin/test/*.js` must report no failures. The rules must keep passing a 1.35 cluster with RBAC on, the tag `fleet=workshop` and one pool with one node.
- Shell scripts: `shellcheck` with the `.shellcheckrc` in this folder, for example `shellcheck --rcfile=.shellcheckrc 0*/*.sh`.
- Offline previews, no Azure account needed: use a local backend (`PULUMI_BACKEND_URL=file:///...`, set `PULUMI_CONFIG_PASSPHRASE`), dummy `ARM_*` values and `ARM_USE_CLI=false`, and a throwaway stack name. Never remove or re-create a committed stack name: deleting a stack deletes its `Pulumi.<stack>.yaml`. A stack file with an `environment` key does not work on a local backend; ESC needs Pulumi Cloud.
- A cluster stack reads the `fleet-core` stack through a StackReference. On a local backend, create a stub stack `fleet` of project `fleet-core` that exports `resourceGroupName`, `fleetName` and `updateStrategyId`.
- `cd 05-fleet-cluster && npm run build && node bin/rollout.js wave 1 --offline --preview-only` previews a cluster through the Automation API.
- `pulumi preview --policy-pack ../04-fleet-policies` in `05-fleet-cluster` shows the violation when `kubernetesVersion` is 1.33.
- What cannot be checked offline: every `pulumi up`, the ESC OIDC login, the update run, the reconcile step, teardown and the Entra cleanup. They need a live subscription.

## Demo code

- `01-subscription/`, `02-esc/`, `06-update-run/*.sh`, `04-fleet-policies/try-bad-version.sh`: bash, macOS and Linux, shellcheck clean. They read `PULUMI_ORG` from the environment.
- `03-fleet-core/`: shared resources. Its outputs (`resourceGroupName`, `fleetName`, `updateStrategyId`) are read by `05-fleet-cluster` and `06-update-run`. The group names in `two-waves` must match the `group` each cluster is created with.
- `04-fleet-policies/`: the rules live in `rules.ts` so tests run without Pulumi Cloud.
- `05-fleet-cluster/`: see its own `AGENTS.md`.
- `06-update-run/`: creating an UpdateRun resource does not start the run; `start.sh` does.
