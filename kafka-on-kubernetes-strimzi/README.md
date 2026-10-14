# Running Apache Kafka on Kubernetes with the Strimzi operator and Pulumi

A 90-minute workshop. You provision a KRaft-mode Apache Kafka cluster on a local `kind` cluster with Pulumi and the Strimzi operator, produce and consume messages, then scale the brokers and upgrade Kafka live without losing a message.

> Event page: not yet announced.

## Sessions and speakers

| Session | Date | Length |
| --- | --- | --- |
| Not yet announced | Not yet announced | 90 minutes |

- Speakers: not yet announced.

## What attendees learn

1. What the Strimzi operator automates compared with running Kafka brokers directly on Kubernetes.
2. How to provision a Kubernetes cluster and the Strimzi operator with Pulumi.
3. How to declare a KRaft-mode `Kafka` resource with `KafkaNodePool` resources and check that broker and controller pods are ready.
4. How to create a `KafkaTopic` declaratively, then produce and consume messages from a Pulumi-provisioned client pod.
5. How to scale the broker pool and run a rolling Kafka version upgrade, and how to prove no message was lost.

## Layout

```text
kafka-on-kubernetes-strimzi/
├── README.md                    this file
├── AGENTS.md                    rules for anyone (or any agent) editing this folder
├── .gitignore                   ignores working docs, node_modules, state, recordings
├── .shellcheckrc                shellcheck settings for the scripts
├── 01-cluster/                  Pulumi project: kind cluster + Strimzi operator
│   ├── .gitignore               ignores bin, node_modules, state, rendered output
│   ├── Pulumi.yaml              project definition
│   ├── index.ts                 kind cluster (local.Command), namespace, operator Helm chart
│   ├── init-stacks.sh           once-only: npm install and `dev` stack in the three projects
│   ├── kind-config.yaml         kind cluster: one control plane, three workers
│   ├── package.json             dependencies
│   ├── package-lock.json        locked dependencies
│   └── tsconfig.json            TypeScript settings
├── 02-kafka/                    Pulumi project: the Kafka cluster
│   ├── .gitignore               ignores bin, node_modules, state, rendered output
│   ├── Pulumi.yaml              project definition
│   ├── index.ts                 two KafkaNodePools (controller, broker) and the Kafka resource
│   ├── package.json             dependencies
│   ├── package-lock.json        locked dependencies
│   └── tsconfig.json            TypeScript settings
├── 03-topic/                    Pulumi project: topic and client pod
│   ├── .gitignore               ignores bin, node_modules, state, rendered output
│   ├── Pulumi.yaml              project definition
│   ├── index.ts                 the demo-events KafkaTopic and the kafka-client pod
│   ├── package.json             dependencies
│   ├── package-lock.json        locked dependencies
│   └── tsconfig.json            TypeScript settings
├── 04-clients/                  produce and consume messages
│   ├── lib.sh                   shared helpers, sourced by the other scripts
│   ├── produce.sh               send numbered messages to demo-events
│   └── consume.sh               read demo-events from the beginning, with partition and offset
├── 05-day2/                     scaling and upgrade
│   ├── check.sh                 prove no message was lost
│   ├── scale.sh                 add a broker, then rebalance partitions onto it
│   ├── traffic.sh               steady background traffic while you scale or upgrade
│   └── upgrade.sh               bump the Kafka version, rolling restart
└── 06-teardown/                 teardown
    └── teardown.sh              destroy the stacks, delete the kind cluster, report leftovers
```

## Prerequisites

Participants:

- Docker (or a compatible container runtime) with about 8 GB of memory free for it, and about 15 GB of disk.
- `kind` and `kubectl`. You do not need `helm`: Pulumi installs the operator.
- Pulumi CLI, Node.js 20 or newer, and a Pulumi Cloud account (or a self-managed backend you are logged in to).

Presenter, beforehand:

- Run steps 1 and 2 once on the demo machine to pull the `kind` node image and the Strimzi and Kafka images, then run the teardown. The first `pulumi up` is slow without cached images.
- Rehearse step 5 and step 6 at least once and keep a screen recording of a good run as a fallback.
- Check the sizing: three controllers, three brokers and Cruise Control need roughly 8 GB of memory for the container runtime.

## Run the slides

The deck is added in a follow-up commit on this branch under `slides/`.

## Run the demo

Pinned versions (checked 2026-10-04): Strimzi operator 1.2.0, Kafka 4.2.1 at the start and 4.3.1 after the upgrade, `kind` v0.33.0 (node image is its default).

Once-only setup:

```bash
01-cluster/init-stacks.sh
```

Expected end state: three `dev` stacks exist and `node_modules/` is installed in each project.

Between runs, reset with `06-teardown/teardown.sh` and run `init-stacks.sh` only if the stacks were removed.

**Step 1: cluster and operator.** In `01-cluster`: `pulumi up --yes`. Expected: `kubectl --kubeconfig 01-cluster/.state/kubeconfig -n kafka get deploy strimzi-cluster-operator` shows `1/1` ready.

**Step 2: Kafka cluster.** In `02-kafka`: `pulumi up --yes`. Expected: `kubectl -n kafka get kafka workshop` shows `READY True` and `kubectl -n kafka get pods` shows three `workshop-controller-*` and three `workshop-broker-*` pods `Running`. Export `KUBECONFIG=$PWD/01-cluster/.state/kubeconfig` first.

**Step 3: topic and client pod.** In `03-topic`: `pulumi up --yes`. Expected: `kubectl -n kafka get kafkatopic demo-events` shows `READY True`.

**Step 4: produce and consume.** Run `04-clients/produce.sh 100`, then `04-clients/consume.sh`. Expected: 100 messages `demo-1` to `demo-100`. Order holds within a partition; the topic has three.

**Step 5: scale the brokers.** Terminal A: `05-day2/traffic.sh 300`. Terminal B: `05-day2/scale.sh 4`. Expected: a fourth broker pod, a `KafkaRebalance` that reaches `Ready`, and partitions of `demo-events` spread over four brokers. Afterwards `05-day2/check.sh 300` reports 300 of 300.

**Step 6: rolling upgrade.** Terminal A: `05-day2/traffic.sh 600`. Terminal B: `05-day2/upgrade.sh 4.3.1`. Expected: brokers restart one at a time, `kubectl -n kafka get kafka workshop -o jsonpath='{.status.kafkaVersion}'` prints `4.3.1`, and `05-day2/check.sh` finds every message sent so far. The script changes the Kafka binary version only; `metadataVersion` stays at `4.2-IV1`.

**Step 7: teardown.** `06-teardown/teardown.sh`. It destroys the three stacks in reverse order, deletes the `kind` cluster, and lists leftovers. The node pools set `deleteClaim: true`, so no PVCs should remain; the script reports any it finds and deletes them.

Cost: none. Everything runs on the local machine.

## Sources

Read on 2026-10-04:

- Strimzi releases: https://github.com/strimzi/strimzi-kafka-operator/releases (1.2.0, 2026-08-20)
- Strimzi 1.2.0 `kafka-versions.yaml` and the Helm chart CRDs (`kafka.strimzi.io/v1` only)
- Pulumi Kubernetes provider: https://www.pulumi.com/registry/packages/kubernetes/
- Pulumi Kubernetes provider changelog, `pulumi.com/waitFor` annotation: https://github.com/pulumi/pulumi-kubernetes/blob/master/CHANGELOG.md
