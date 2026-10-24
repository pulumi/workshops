# AGENTS.md: pki-lifecycle-cert-manager-private-ca-vault

Guidance for coding agents (and humans) working in this workshop folder of `pulumi/workshops`.

## What this folder is

Demo code for the workshop "Certificate and PKI lifecycle as code with cert-manager, AWS Private CA and Vault PKI". Eight Pulumi steps (TypeScript) build a private CA hierarchy on AWS, issue certificates to EKS through cert-manager, and wrap the pattern in a component. The Slidev deck follows on the same branch in `slides/`. Read `README.md` first.

## Layout rules

- One folder per step, `NN-name`, each with its own `Pulumi.yaml` (project name `pki-NN-name`) and `index.ts`. Runtime is `nodejs` with npm.
- `package.json`, `package-lock.json` and `tsconfig.json` live at the folder root and are shared by all steps. Run `npm install` there once.
- Steps read earlier steps through `pulumi.StackReference` to `<org>/pki-NN-name/dev`. Keep the stack name `dev` and keep outputs that other steps read.
- Scripts are bash with `#!/usr/bin/env bash` and `set -euo pipefail`. Step scripts sit in the step folder, shared ones in `scripts/`.

## Pins

- Every npm package and Helm chart version is pinned exactly: `@pulumi/pulumi` 3.272.0, `@pulumi/aws` 7.51.1, `@pulumi/kubernetes` 4.34.2, `@pulumi/eks` 4.4.0, `@pulumi/vault` 7.14.0, cert-manager chart v1.21.2, aws-privateca-issuer v1.11.0, Vault chart 0.34.1, kube-prometheus-stack 92.11.0.
- Change a pin only after checking that the version exists, and update `README.md` and the slides in the same change.

## Credentials and state

- No credentials, tokens or account IDs in the repo. AWS access comes from the Pulumi ESC environment `pki-workshop/aws-vault`. The Vault token is a throwaway dev token and is set as a secret config value.
- Never commit `node_modules/`, `dist/`, `bin/`, logs, Pulumi state or recordings.
- Working documents (`*.md` other than `README.md`, `AGENTS.md` and `slides/slides.md`) are ignored by `.gitignore` on purpose. Do not force-add them.

## Checks before a commit

```bash
npm install
npx tsc --noEmit -p .
shellcheck 01-esc-environment/setup.sh 05-first-certificate/verify.sh 06-vault-pki/port-forward.sh 07-renewal-and-monitoring/renew.sh scripts/teardown.sh
```

Run them from the folder root. `.shellcheckrc` sets `source-path` and `external-sources`. Report only the results you saw. `pulumi preview` needs real AWS access, so state it plainly when you did not run one.

## Conventions

- Every command on a slide or in `README.md` is one the demo runs, with the same flags.
- Use the product names Pulumi IaC, Pulumi ESC, Pulumi Cloud and Pulumi Neo.
- Commits are Conventional Commits scoped to the folder slug, for example `fix(pki-lifecycle-cert-manager-private-ca-vault): ...`.
- Do not touch other workshop folders.
