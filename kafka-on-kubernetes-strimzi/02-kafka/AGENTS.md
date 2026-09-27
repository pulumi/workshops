
# AGENTS.md — 02-kafka

Pulumi TypeScript project: the `KafkaNodePool` resources and the `Kafka`
custom resource, in `index.ts`. Depends on `01-cluster` via
`pulumi.StackReference`.

## What this provisions

- `KafkaNodePool` `controller`: 3 replicas, role `controller` only.
- `KafkaNodePool` `broker`: 3 replicas (config `brokerReplicas`), role
  `broker` only.
- `Kafka` custom resource `demo-cluster`, KRaft mode (the only mode Strimzi
  1.2.0 supports — there is no ZooKeeper option, no feature-gate annotation
  to set), Kafka version 4.2.1 / `metadataVersion` `4.2-IV1` by default
  (config `kafkaVersion`, `metadataVersion`).

## Deviations from the brief and why

The brief describes one dual-role `KafkaNodePool`. This build uses two
single-role pools (controller-only, broker-only) instead, for one reason:
Strimzi's own docs state that scaling controller nodes in node pools is not
currently supported (`KAFKA-16538`), while broker scaling is exactly what
`05-scale-brokers` demonstrates live. A dual-role pool's replica count would
have to move both roles together, which would either scale controllers too
(unsupported) or need a second dual-role pool just for the broker delta,
which is more confusing than two single-role pools from the start. Two
single-role pools is also Strimzi's own recommended production topology
(the "separate broker and controller roles" pattern in the deploying guide).
Source: https://strimzi.io/docs/operators/latest/deploying, sections 11.3
and 2.1.1 (read 2026-09-27). If the brief's authors intended the dual-role
topology specifically to keep the resource count down for the 90-minute
slot, that is an open question raised in the pull request.

## How to work here

- `npm install`, then `npx tsc --noEmit`.
- Same offline-render pattern as `01-cluster`: `renderYamlToDirectory`
  config, mutually exclusive with reading the live context.
- `clusterStackRef` config points at the `01-cluster` stack
  (`<org>/kafka-cluster/<stack-name>`); set it before `pulumi up`.
- `brokerReplicas`, `kafkaVersion`, and `metadataVersion` are Pulumi config
  values, not hardcoded, because `05-scale-brokers` and
  `06-rolling-upgrade` change them live against this same stack with
  `pulumi config set` + `pulumi up`. Do not move these into the resource
  bodies as literals.
- `others.spec` is this project's only escape hatch for Kafka's custom
  resource schema; there is no generated TypeScript type for
  `kafka.strimzi.io/v1` resources, so this project spells out `spec` by hand
  against the CRD's OpenAPI schema (verified 2026-09-27 against the actual
  Strimzi 1.2.0 CRD bundle, not from memory).

## Verification

- `npx tsc --noEmit` must pass.
- Offline: `pulumi preview` with `renderYamlToDirectory` set renders the two
  `KafkaNodePool` manifests and the `Kafka` manifest without contacting a
  cluster.
- Live: `kubectl --context kind-kafka-workshop-demo get kafka demo-cluster -n
  kafka` shows `READY: True`; `kubectl get pods -n kafka` shows 3 controller
  and 3 broker pods `Running`.
