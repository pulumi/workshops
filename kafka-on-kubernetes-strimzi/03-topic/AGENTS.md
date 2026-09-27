
# AGENTS.md — 03-topic

Pulumi TypeScript project: a single `KafkaTopic` custom resource,
`demo-events`, in `index.ts`. Depends on `01-cluster` and `02-kafka` via
`pulumi.StackReference` (needs the kubeconfig context and namespace from the
first, the Kafka cluster's name from the second).

## What this provisions

`KafkaTopic` `demo-events`: 3 partitions, replication factor 3, matching the
brief exactly. `retention.ms` and `min.insync.replicas` are set to sane
demo defaults, not asked for by the brief; call them out if a reviewer wants
them removed for a closer reading of the brief.

## How to work here

- `npm install`, then `npx tsc --noEmit`.
- `clusterStackRef` and `kafkaStackRef` config values must point at
  `01-cluster` and `02-kafka`'s stacks respectively.
- Same offline `renderYamlToDirectory` pattern as the other projects.
- The Topic Operator (running inside `02-kafka`'s `Kafka` resource) does the
  actual reconciliation against the Kafka cluster; this project only
  declares the `KafkaTopic` object.

## Verification

- `npx tsc --noEmit` must pass.
- Offline: `pulumi preview` with `renderYamlToDirectory` renders the
  `KafkaTopic` manifest.
- Live: `kubectl --context kind-kafka-workshop-demo get kafkatopic
  demo-events -n kafka` shows `READY: True`.
