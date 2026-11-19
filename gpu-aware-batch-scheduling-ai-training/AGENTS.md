# AGENTS.md

This folder is the workshop "GPU-aware batch scheduling for AI training on Kubernetes with Pulumi". It holds three Pulumi TypeScript projects, the demo scripts and (later) the Slidev deck.

## Rules

- Stay inside this folder. Do not touch other workshops.
- Product facts come from pulumi.com/docs and the Volcano and Kubernetes docs and releases, read at the time you edit. Do not write them from memory.
- Names: Pulumi Neo, Pulumi ESC, Pulumi Cloud, Pulumi IaC. Never "Copilot" or "Pulumi Service".
- Every command shown on a slide must be one the demo runs, with the same flags.
- Commits use Conventional Commits scoped to the folder: `feat(gpu-aware-batch-scheduling-ai-training): ...`, `docs(gpu-aware-batch-scheduling-ai-training): ...`.
- Do not commit credentials, kubeconfig, `node_modules/`, `dist/`, `.state/`, rendered YAML, Pulumi stack files or recordings.

## Demo code

- `01-cluster`, `02-queues`, `03-jobs`: `npm install && npx tsc --noEmit` must pass in each.
- `02-queues` and `03-jobs` read the kubeconfig from `01-cluster` through `StackReference` (`gpu-batch-cluster`). Keep the `kubeconfig` output name in sync.
- The GPUs on kind are fake: `01-cluster` patches `example.com/gpu` onto the two workers. Say so on every slide that shows them.
- The Kubernetes provider is built either from a kubeconfig or from `renderYamlToDirectory`, never both. The render option exists only for offline verification.
- Scripts: shellcheck clean with the `.shellcheckrc` here (`shellcheck -x lib.sh */*.sh`).
- Keep the README layout tree identical to `find`.
