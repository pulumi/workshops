# AGENTS.md

This folder is the workshop "Running Apache Kafka on Kubernetes with the Strimzi operator and Pulumi". It holds three Pulumi TypeScript projects, the demo scripts and (later) the Slidev deck.

## Rules

- Stay inside this folder. Do not touch other workshops.
- Product facts come from pulumi.com/docs and the Strimzi docs and releases, read at the time you edit. Do not write them from memory.
- Names: Pulumi Neo, Pulumi ESC, Pulumi Cloud, Pulumi IaC. Never "Copilot" or "Pulumi Service".
- Every command shown on a slide must be one the demo runs, with the same flags.
- Commits use Conventional Commits scoped to the folder: `feat(kafka-on-kubernetes-strimzi): …`, `docs(kafka-on-kubernetes-strimzi): …`.
- Do not commit credentials, kubeconfig, `node_modules/`, `dist/`, `.state/`, rendered YAML, Pulumi stack files with secrets, or recordings.

## Demo code

- `01-cluster`, `02-kafka`, `03-topic`: `npm install && npx tsc --noEmit` must pass in each.
- The three projects link through `StackReference` (`01-cluster` exports `kubeconfig` and `kafkaNamespace`; `02-kafka` exports `kafkaName` and `bootstrapServers`). Keep the output names in sync.
- Strimzi resources use `kafka.strimzi.io/v1`. KRaft only: no ZooKeeper, no `strimzi.io/kraft` or `strimzi.io/node-pools` annotations.
- The Kubernetes provider is built either from a kubeconfig or from `renderYamlToDirectory`, never both. The render option exists only for offline verification.
- Scripts in `01-cluster/init-stacks.sh`, `04-clients/`, `05-day2/`, `06-teardown/`: shellcheck clean with the `.shellcheckrc` here (`shellcheck -x */*.sh`).
- Keep the README layout tree identical to `find`.
