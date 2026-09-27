# Running Apache Kafka on Kubernetes with the Strimzi Operator and Pulumi

A 90-minute workshop for platform engineers and data engineers who need event
streaming infrastructure on Kubernetes without hand-managing Kafka's broker
lifecycle, KRaft controller quorum, or version upgrades. Strimzi represents a
Kafka cluster as a Kubernetes-native operator and CRDs, and Pulumi provisions
the whole stack — kind cluster, operator, KRaft node pools, and a topic —
from one program. By the end, you will have provisioned a KRaft-mode Kafka
cluster on Kubernetes with Pulumi, produced and consumed messages through it,
and scaled and upgraded it live.

> Running Kafka on Kubernetes by hand means writing your own StatefulSet,
> your own rolling-upgrade script, and your own controller-quorum
> bootstrapping — none of which understands Kafka's own reconciliation
> needs. Strimzi makes broker lifecycle, KRaft quorum management, and
> version upgrades first-class operator behavior instead: this workshop
> proves it by scaling the broker pool and upgrading the Kafka version live,
> with a consumer counting messages throughout.
>
> — [Workshop brief](https://workprentice.ai/documents/82c5632a-2a91-4ba4-ae77-58918138969f)

## Sessions and speakers

No event page and no scheduled session exist yet for this workshop. The
backlog row (https://workprentice.ai/data-tables/topic-backlog-e0cff69e-2a86-4dcf-bdf9-5e4fc1efad86,
id `cncf-kafka-on-kubernetes`) carries no committed date. This is expected:
the pipeline builds a workshop's demo code and slides from evidence of
audience interest, not from a calendar entry, and a person picks a delivery
date from the finished material afterward. See "Why now" below for the
evidence that put this topic in the build queue.

Speakers not yet assigned.

## Why now

This topic was not requested by title; it was selected from independent
signal. Four sources, all independent of Strimzi's own release notes,
converged on it: an independent talk on Strimzi's road to its 1.0 milestone
(2026-03-26), an independent newsletter covering Strimzi (2026-04-13), an
independent cloud-native roundup mentioning Strimzi (2026-06-22), and a
KubeCon NA 2026 session titled "Life After Strimzi 1.0.0" within the
conference's stateful-data-on-Kubernetes track. Strimzi 1.2.0 also shipped
2026-08-20 with Kafka 4.3 support, inside the 90 days before this brief was
written. `pulumi/workshops` has no prior workshop covering Strimzi or
Kafka-on-Kubernetes; the only Kafka-adjacent folder is `confluent`, which
covers Confluent Cloud's managed service rather than a Kubernetes-native
operator — this is a genuine content gap, not a duplicate.

Not claimed: the KubeCon NA 2026 stateful-data track has roughly 12 sessions
in total; only one of those, "Life After Strimzi 1.0.0", is about Strimzi
specifically. Do not read this as 12 Strimzi sessions.

## What attendees learn

1. What the Strimzi operator automates versus running Kafka brokers directly
   on Kubernetes: broker lifecycle, KRaft controller quorum, and rolling
   upgrades.
2. How to provision a Kubernetes cluster and the Strimzi operator together
   with one `pulumi up`, using Pulumi's Kubernetes provider and the
   operator's own OCI Helm chart.
3. How to declare a KRaft-mode `Kafka` custom resource via Pulumi, using
   separate broker and controller node pools, and verify the broker and
   controller pods reach `Ready` state.
4. How to produce and consume messages against the cluster from a
   Pulumi-provisioned client, and how to create a `KafkaTopic` custom
   resource declaratively.
5. How to scale the broker count and trigger a rolling Kafka version upgrade
   live, and observe zero message loss throughout.

## Layout

```text
kafka-on-kubernetes-strimzi/
├── AGENTS.md              # rules for agents/humans working in this folder
├── .gitignore             # ignores working docs; keeps README/AGENTS/slides
├── .shellcheckrc          # shellcheck config shared by every script below
├── 01-cluster/            # Pulumi (TS): kind cluster, Strimzi Cluster Operator
├── 02-kafka/              # Pulumi (TS): KafkaNodePool x2 (broker, controller), Kafka CR
├── 03-topic/              # Pulumi (TS): KafkaTopic CR (demo-events)
├── 04-clients/            # Pulumi (TS): long-running consumer Deployment
│                          # (the producer is a live kubectl command, see below)
├── 05-scale-brokers/      # shell: scale the broker node pool live
├── 06-rolling-upgrade/    # shell: two-step Kafka version upgrade, live
├── 07-teardown/           # shell: reverse-order teardown + clean-state check
└── slides/                # Slidev deck (built separately, once this branch
                             # has demo code on it)
```

Steps 5 and 6 are plain shell rather than Pulumi projects in their own right:
each one is a `pulumi config set` against the already-deployed `02-kafka`
stack followed by `pulumi up`, not a new resource this workshop should
declare and track state for independently.

## Prerequisites

**Participants** (bring these installed and pinned before the session):

| Tool | Version | Source |
|---|---|---|
| Pulumi CLI | latest (this build used 3.263.0) | https://www.pulumi.com/docs/install/ |
| Node.js | 20.x (this build used 22.23.2) | https://nodejs.org |
| kind | latest stable | https://github.com/kubernetes-sigs/kind/releases |
| Docker (or Podman) | recent stable | kind's own requirement |
| kubectl | matching the kind node's Kubernetes minor | https://kubernetes.io/docs/tasks/tools/ |

No cloud account is needed — this workshop is entirely local, running
against a `kind` cluster with zero cloud dependency and zero cost.

**Presenter only**: rehearse the scaling (`05-scale-brokers`) and rolling
upgrade (`06-rolling-upgrade`) steps at least once end to end before
delivery. Both depend on Strimzi's reconciliation timing rather than a
single deterministic command, unlike everything before them.

## Run the slides

Not built yet: this run covers demo code only. Slides follow on this same
branch in a later run. Once present, the deck runs the same way as this
repository's other workshops:

```bash
cd slides
npm install
npm run dev
```

## Run the demo

Pinned versions used in this build, verify before every session — Strimzi's
release cadence has moved inside a single quarter before (see "Why now"
above), so do not assume these hold beyond the next release:

| Tool / image | Version | Source |
|---|---|---|
| Strimzi Cluster Operator (Helm chart, OCI) | 1.2.0 | https://strimzi.io/docs/operators/latest/deploying (read 2026-09-27) |
| Strimzi CRDs (`Kafka`, `KafkaNodePool`, `KafkaTopic`) | `kafka.strimzi.io/v1`, bundled with operator 1.2.0 | https://github.com/strimzi/strimzi-kafka-operator/releases/tag/1.2.0 (read 2026-09-27) |
| Kafka (starting version) | 4.2.1, `metadataVersion: 4.2-IV1` | https://strimzi.io/docs/operators/latest/deploying (read 2026-09-27) |
| Kafka (upgrade target, `06-rolling-upgrade`) | 4.3.1, `metadataVersion: 4.3-IV0` | same |
| Kafka client image | `quay.io/strimzi/kafka:1.2.0-kafka-4.2.1` and `...-4.3.1` | same |
| kind | latest stable | https://github.com/kubernetes-sigs/kind/releases |
| `@pulumi/kubernetes` | ^4.34.2 | https://www.npmjs.com/package/@pulumi/kubernetes |
| `@pulumi/command` | ^1.2.1 | https://www.npmjs.com/package/@pulumi/command |

Numbered steps and expected end state:

1. `cd 01-cluster && npm install && pulumi up` — kind cluster running (1
   control-plane, 3 workers), Strimzi Cluster Operator installed into
   namespace `kafka`. Expected: `kubectl --context kind-kafka-workshop-demo
   get pods -n kafka` shows the operator pod `Running`.
2. `cd 02-kafka && npm install && pulumi up` — a `controller` `KafkaNodePool`
   (3 replicas, controller-only), a `broker` `KafkaNodePool` (3 replicas,
   broker-only), and the KRaft-mode `Kafka` CR itself. Expected: `kubectl
   get kafka demo-cluster -n kafka` shows `Ready True`; all six node pods
   `Running`.
3. `cd 03-topic && npm install && pulumi up` — the `KafkaTopic` CR
   `demo-events` (3 partitions, replication factor 3). Expected: `kubectl
   get kafkatopic demo-events -n kafka` shows `Ready True`.
4. `cd 04-clients && npm install && pulumi up` — a long-running consumer
   `Deployment`. The producer is deliberately not a Pulumi resource (see
   `04-clients/AGENTS.md`): send a batch live with
   ```bash
   kubectl --context kind-kafka-workshop-demo -n kafka run demo-producer -it \
     --rm --restart=Never --image=quay.io/strimzi/kafka:1.2.0-kafka-4.2.1 -- \
     bin/kafka-console-producer.sh \
     --bootstrap-server demo-cluster-kafka-bootstrap:9092 --topic demo-events
   ```
   then type a few lines and press Ctrl-D. Expected: `kubectl --context
   kind-kafka-workshop-demo logs -n kafka -l app=demo-consumer -f` shows
   the same messages received in order.
5. Live: `05-scale-brokers/scale-brokers.sh` — sets the `broker` node pool's
   replica count to 4 via `pulumi config set` against `02-kafka`, then
   `pulumi up`. Expected: a fourth broker pod appears, partitions rebalance,
   and `04-clients`' consumer keeps counting messages with no gap.
6. Live: `06-rolling-upgrade/rolling-upgrade.sh` — the documented two-step
   Kafka version upgrade (see `06-rolling-upgrade/AGENTS.md`) from 4.2.1 to
   4.3.1 against `02-kafka`. Expected: Strimzi restarts brokers one at a
   time; the consumer's message count keeps climbing throughout, with no
   restart of its own.
7. Teardown: `07-teardown/teardown.sh` — `pulumi destroy` across
   04 → 03 → 02 → 01, then `07-teardown/verify-clean.sh` confirms no
   orphaned PVCs and no leftover kind cluster.

## Sources

- Strimzi documentation, "Deploying and Managing", https://strimzi.io/docs/operators/latest/deploying, read 2026-09-27.
- Strimzi CRD bundle, https://github.com/strimzi/strimzi-kafka-operator/releases/download/1.2.0/strimzi-crds-1.2.0.yaml, read 2026-09-27.
- Strimzi Kafka Operator releases, https://github.com/strimzi/strimzi-kafka-operator/releases, read 2026-09-27 (v1.2.0, 2026-08-20).
- Pulumi Kubernetes provider, `helm.v4.Chart` OCI chart support, https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/, read 2026-09-27.
- Independent talk, 2026-03-26, "The Road To Strimzi 1.0".
- Independent newsletter, 2026-04-13, "THE SIGNAL: What matters in distributed systems #2".
- Independent roundup, 2026-06-22, "Last Week in Cloud Native, Week 26 (Jun 22-28, 2026)".
- KubeCon + CloudNativeCon NA 2026 schedule, https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/, read 2026-09-27 (partial capture; "Life After Strimzi 1.0.0" confirmed).
- `pulumi/workshops` repository tree, read 2026-09-27 (coverage gap check).

## Open questions for the presenter

- No committed delivery date exists yet; a person needs to pick one from
  this finished material and confirm speakers.
- This build could not run a live `kind` cluster (no `docker`, `kind`, or
  `kubectl` on the build workstation, and no root to install them). Every
  check below the "verifiable offline" line in this workshop's acceptance
  checklist needs a presenter's real machine before the first delivery —
  see the pull request description for the exact list and what was verified
  instead.
- Resource sizing (CPU/memory for 6 total Kafka node pods across 3 kind
  worker nodes) has not been verified against a real machine or CI runner.
  Budget headroom for this in rehearsal.
