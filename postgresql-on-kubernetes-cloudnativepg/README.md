# Running production PostgreSQL on Kubernetes with CloudNativePG and Pulumi

A 90-minute workshop for platform engineers and SREs who run stateful
workloads on Kubernetes and want to stop hand-rolling StatefulSets for
databases. Assumes basic Kubernetes (pods, PVCs, CRDs) and basic Pulumi
(stacks, providers); does not assume prior Postgres HA experience.

> By the end, you will have provisioned a self-healing, backed-up Postgres
> cluster on Kubernetes with Pulumi, and triggered a failover and a
> point-in-time restore live.

## Sessions and speakers

| Session | Date | Length |
|---|---|---|
| TBD | November 18, 2026 | 90 min |

Speaker and event page not yet assigned. The date is a committed slot; the
subject was chosen by Compass from an untitled backlog entry and is
reversible by a person before the demo build starts (see the open questions
below).

## What attendees learn

1. What problem the CloudNativePG operator solves versus running Postgres in
   a bare StatefulSet (replication, failover, backup orchestration).
2. How to provision a Kubernetes cluster and the CloudNativePG operator with
   Pulumi, in a single `pulumi up`.
3. How to declare a three-instance CloudNativePG `Cluster` custom resource
   via Pulumi and verify synchronous replication is active.
4. How to configure and trigger a continuous backup to object storage, then
   perform a point-in-time recovery (PITR) restore into a new cluster.

## Layout

```
postgresql-on-kubernetes-cloudnativepg/
├── README.md            this file
├── AGENTS.md             conventions for agents (and humans) editing this folder
├── 01-platform/         Pulumi: kind cluster, cert-manager, CNPG operator, Barman Cloud Plugin
├── 02-cluster/          Pulumi: the 3-instance Cluster, optional S3 backup wiring
├── 03-replication/      status.sh -- streaming replication and lag
├── 04-failover/         failover.sh -- graceful promotion of a replica
├── 05-backup/           backup.sh -- on-demand backup, verify it lands in S3
├── 06-restore/          Pulumi: PITR restore into a second Cluster (presenter-only)
├── 07-teardown/         teardown.sh, verify-clean.sh
└── slides/              not built yet -- a later, separate build
```

## Prerequisites

Participants (steps 1-4, `backupsEnabled` left at its default of `false`, no
cloud credentials needed):

- A container runtime (Docker or compatible) for `kind`.
- [`kind`](https://kind.sigs.k8s.io/) >= v0.33.0.
- `kubectl` and the
  [`kubectl cnpg` plugin](https://cloudnative-pg.io/documentation/current/kubectl-plugin/).
- The Pulumi CLI >= 3.255.0 and Node.js >= 20.

Presenter only (steps 5-6, `backupsEnabled=true`):

- An AWS account and credentials with rights to create and destroy an S3
  bucket and an IAM user/policy in `us-east-1` (or another region via the
  `awsRegion` config).
- A rehearsal run end to end before presenting. The live failover and PITR
  restore are the highest-risk steps: script the trigger in advance and have
  a fallback recording ready in case either fails on stage.

## Run the demo

```bash
# 1. Platform: kind cluster, cert-manager, the CNPG operator, Barman Cloud Plugin
cd 01-platform && npm install && pulumi up

# 2. The Postgres cluster itself (participants: leave backupsEnabled at its
#    default of false)
cd ../02-cluster && npm install && pulumi up
# Presenter, to also wire up backups:
#   pulumi config set backupsEnabled true
#   pulumi config set awsRegion us-east-1   # optional, this is the default
#   pulumi up

# 3. Show streaming replication and lag
cd ../03-replication && ./status.sh

# 4. Trigger a graceful failover (promotes instance 2 by default)
cd ../04-failover && ./failover.sh
../03-replication/status.sh   # confirm the new topology

# 5. Presenter only: trigger an on-demand backup and confirm it lands in S3
cd ../05-backup && ./backup.sh

# 6. Presenter only: point-in-time restore into a second Cluster
cd ../06-restore && npm install && pulumi up

# 7. Teardown, in dependency order (06 -> 02 -> 01), then check for orphans
cd ../07-teardown && ./teardown.sh && ./verify-clean.sh
```

Each Pulumi project's own `AGENTS.md` documents its config knobs and what it
exports for the scripts and sibling projects to read.

## Sources

Facts in this demo come from these pages, read on 2026-09-29 while building
it:

- CloudNativePG documentation: https://cloudnative-pg.io/documentation/current/
- CloudNativePG release v1.30.1: https://github.com/cloudnative-pg/cloudnative-pg/releases
- CloudNativePG Barman Cloud Plugin (CNPG-I): https://cloudnative-pg.io/plugin-barman-cloud/
- Pulumi Kubernetes provider, CRDs as provider extensions: https://pulumi.com/blog/kubernetes-crds-as-provider-extensions/
- Pulumi Kubernetes Helm resources: https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/
- kind (Kubernetes in Docker): https://kind.sigs.k8s.io/
- cert-manager: https://cert-manager.io/docs/
