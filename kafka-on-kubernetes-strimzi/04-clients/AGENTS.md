
# AGENTS.md — 04-clients

Pulumi TypeScript project: a long-running consumer `Deployment`, in
`index.ts`. Depends on `01-cluster`, `02-kafka`, and `03-topic` via
`pulumi.StackReference`.

## What this provisions

One `Deployment`, `demo-consumer`, running
`bin/kafka-console-consumer.sh` against `demo-events` from the beginning of
the topic, using the `quay.io/strimzi/kafka:<operator>-kafka-<version>`
image (same image Strimzi ships for brokers, which already bundles the
Kafka CLI tools).

The producer is **not** a Pulumi resource. See the comment at the end of
`index.ts` and the README's "Running the demo" section for why, and for the
exact command a presenter runs live.

## How to work here

- `npm install`, then `npx tsc --noEmit`.
- `clusterStackRef`, `kafkaStackRef`, `topicStackRef` config values must
  point at the three upstream stacks.
- Same offline `renderYamlToDirectory` pattern as the other projects.
- If the Kafka or Strimzi operator version changes (see `06-rolling-upgrade`
  and `02-kafka`), this project's `clientImage` output updates on its own
  next `pulumi up` because it reads `kafkaVersion` from the `02-kafka`
  stack's outputs rather than hardcoding it a second time. Only
  `strimziOperatorVersion` is a literal here, and it should track whichever
  Strimzi operator version `01-cluster` installs.

## Verification

- `npx tsc --noEmit` must pass.
- Offline: `pulumi preview` with `renderYamlToDirectory` renders the
  `Deployment` manifest.
- Live: `kubectl --context kind-kafka-workshop-demo logs -n kafka -l
  app=demo-consumer -f` shows messages arriving after a producer sends them
  (see README "Running the demo").
