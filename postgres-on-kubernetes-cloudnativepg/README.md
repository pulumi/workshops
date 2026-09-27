# Running Production PostgreSQL on Kubernetes with CloudNativePG and Pulumi

A 90-minute workshop for platform engineers and SREs who need Postgres to
survive on Kubernetes the way it would on dedicated hardware: replicated,
backed up, and able to fail over without a human watching. CloudNativePG
represents a Postgres cluster as a Kubernetes-native operator and CRDs, and
Pulumi provisions the whole stack — kind cluster, operator, storage,
credentials, and the Cluster itself — from one program. By the end, you will
have provisioned a self-healing, backed-up Postgres cluster on Kubernetes
with Pulumi, and triggered a failover and a point-in-time restore live.

> Most Kubernetes-Postgres setups are a bare StatefulSet plus a pile of
> hand-written scripts for backup, failover, and restore, none of which the
> operator actually understands. CloudNativePG makes replication, continuous
> backup, and failover first-class operator behavior instead: this workshop
> proves it by breaking a running cluster on purpose and watching it heal.
>
> — [Workshop brief](https://workprentice.ai/documents/3bcc1bfe-c8f7-4ea6-9c18-625ab4dc02b4)

## Sessions and speakers

| Session | Date | Length |
|---|---|---|
| Committed Notion slot (no public event page yet) | 2026-11-18 | 90 min |

Speakers not yet assigned. The originating Notion row named only "Kubernetes
related workshop" with a presenter; it did not name the subject. Radar chose
this subject from that row — a decision a person can still reverse before
build work on the slides starts.

## What attendees learn

1. What CloudNativePG's operator model gives you that a bare Kubernetes
   `StatefulSet` running Postgres does not: an operator that understands
   replication, failover, and backup as first-class behavior rather than
   external scripts bolted onto generic storage.
2. How to provision a Kubernetes cluster and the CloudNativePG operator
   together with one `pulumi up`, using Pulumi's Kubernetes provider and the
   operator's own Helm chart.
3. How to stand up a 3-instance `Cluster` custom resource and verify its
   replicas are streaming from the primary with near-zero lag.
4. How continuous backup to object storage works under CloudNativePG, and
   how to restore a cluster to a specific point in time from those backups.
5. How a live, scripted failover promotes a replica to primary with no
   manual intervention, and what "self-healing" means in practice for this
   operator.

## Layout

```text
postgres-on-kubernetes-cloudnativepg/
├── AGENTS.md                    # rules for agents/humans working in this folder
├── .gitignore                   # ignores working docs; keeps README/AGENTS/slides
├── .shellcheckrc                # shellcheck config shared by every script below
├── 01-cluster-and-operator/     # Pulumi (TS): kind cluster, cert-manager, CNPG
│                                 # operator, Barman Cloud plugin
├── 02-postgres-cluster/         # Pulumi (TS): S3 bucket, scoped IAM user, ObjectStore
│                                 # CR, 3-instance Cluster CR
├── 03-replication/               # shell: read-only replication status check
├── 04-failover/                  # shell: scripted failover trigger + verification
├── 05-backup/                    # shell: on-demand backup trigger + verification
├── 06-pitr-restore/              # Pulumi (TS): second Cluster CR restored to a point in time
├── 07-teardown/                  # shell: reverse-order teardown + clean-state check
└── slides/                       # Slidev deck (built separately, once this branch
                                    # has demo code on it)
```

Steps 3, 4, and 5 are plain shell rather than Pulumi projects: they invoke
`kubectl cnpg` operator-plugin subcommands against a cluster that already
exists, not resources Pulumi should own or track state for.

## Prerequisites

**Participants** (bring these installed and pinned before the session):

| Tool | Version | Source |
|---|---|---|
| Pulumi CLI | latest (this build used 3.263.0) | https://www.pulumi.com/docs/install/ |
| Node.js | 20+ (this build used 22.23.2) | https://nodejs.org |
| kind | v0.33.0 | https://github.com/kubernetes-sigs/kind/releases/tag/v0.33.0 |
| Docker (or Podman) | recent stable | kind's own requirement |
| kubectl | matching the kind node's Kubernetes minor (1.37) | https://kubernetes.io/docs/tasks/tools/ |
| `kubectl cnpg` plugin | matching operator v1.30.1 | https://cloudnative-pg.io/documentation/1.30/kubectl-plugin/ |

**Presenter only**:

| Tool / credential | Why |
|---|---|
| AWS account with permission to create S3 buckets and IAM users | `02-postgres-cluster` provisions its own dedicated, low-privilege backup identity — participants never touch the presenter's AWS account directly |
| `aws` CLI (optional) | only used to eyeball the backup bucket's contents live; not required to run the demo itself |

Participants do not need their own AWS account: the workshop provisions one
S3 bucket and one narrowly-scoped IAM user per run, both owned by the
presenter's account and destroyed in `07-teardown`. This keeps the workshop's
cloud footprint to a single, disposable identity rather than handing out
credentials to a room.

## Run the slides

```bash
cd slides
npm install
npm run dev
```

## Run the demo

Pinned versions used in this build, verify before every session:

| Tool | Version | Source |
|---|---|---|
| CloudNativePG operator | v1.30.1 (chart 0.29.1) | https://cloudnative-pg.io/documentation/1.30/ |
| Barman Cloud Plugin (CNPG-I) | v0.15.0 (chart 0.8.0) | https://cloudnative-pg.io/plugin-barman-cloud/docs/installation/ |
| cert-manager | v1.21.2 | https://github.com/cert-manager/cert-manager/releases |
| kind | v0.33.0 | https://github.com/kubernetes-sigs/kind/releases/tag/v0.33.0 |
| kind node image | `kindest/node:v1.37.0` (Kubernetes 1.37.0) | same release |
| PostgreSQL image | `ghcr.io/cloudnative-pg/postgresql:17.6-system-trixie` | https://cloudnative-pg.io/documentation/1.30/ |
| `@pulumi/kubernetes` | ^4.34.2 | https://www.npmjs.com/package/@pulumi/kubernetes |
| `@pulumi/aws` | ^7.48.0 | https://www.npmjs.com/package/@pulumi/aws |
| `@pulumi/command` | ^1.2.1 | https://www.npmjs.com/package/@pulumi/command |

```bash
# 0. once: install and pin the tools listed in Prerequisites, and log in to a
#    Pulumi backend (this build used `pulumi login file://~/.pulumi-pg-demo`).
export PULUMI_CONFIG_PASSPHRASE=<your passphrase>

# 1. once per run: create the kind cluster, cert-manager, the CloudNativePG
#    operator, and the Barman Cloud plugin.
cd 01-cluster-and-operator && npm install && pulumi up --stack dev && cd ..
# end state: `kubectl --context kind-pg-workshop-demo get pods -n cnpg-system`
# shows the operator pod Running.

# 2. once per run: provision the backup bucket, the scoped IAM identity, and
#    the 3-instance Postgres Cluster.
cd 02-postgres-cluster && npm install && pulumi up --stack dev && cd ..
# end state: `kubectl --context kind-pg-workshop-demo get cluster -n postgres-demo`
# shows `pg-cluster` in phase "Cluster in healthy state", with pods
# pg-cluster-1/-2/-3 Running and one of them primary.

# 3. verify replication live.
cd 03-replication && ./status.sh && cd ..
# end state: `kubectl cnpg status` shows both replicas streaming, lag near zero.

# 4. trigger a scripted failover — never `kill -9` a pod.
cd 04-failover && ./failover.sh && cd ..
# end state: instance 2 is primary within seconds, no manual intervention.

# 5. take an on-demand backup and confirm it landed in the bucket.
cd 05-backup && ./backup.sh && cd ..
# end state: `kubectl get backup` shows the new object at phase "completed";
# script prints the `aws s3 ls` command to confirm the object exists.

# 6. restore to a point in time into a brand-new Cluster.
cd 06-pitr-restore && npm install \
  && pulumi config set recoveryTargetTime "<timestamp from step 5's backup window>" \
  && pulumi up --stack dev && cd ..
# end state: `kubectl get cluster pg-cluster-restore -n postgres-demo` reports
# healthy, and a `kubectl exec` row count against it matches the pre-restore
# source cluster (see this project's AGENTS.md for the exact psql commands).

# 7. between runs: tear down in reverse order and confirm nothing is left.
cd 07-teardown && ./teardown.sh && ./verify-clean.sh && cd ..
```

## Teardown and estimated cost

`07-teardown/teardown.sh` destroys the Pulumi stacks in reverse build order,
explicitly checks for and deletes any PVCs CloudNativePG's Cluster deletion
leaves behind (this behavior is not confirmed either way in the CNPG docs —
the script verifies rather than assumes), deletes the kind cluster, and
notes the disposable S3 bucket (`forceDestroy: true`, so no manual emptying
step is needed). Estimated cost per run: near zero. kind and its cluster are
entirely local and free; the only billed resource is a handful of small S3
objects for a few minutes, well under $1, destroyed with the stack.

## Sources

- https://cloudnative-pg.io/documentation/1.30/ (read 2026-09-27)
- https://cloudnative-pg.io/documentation/1.30/installation_upgrade/ (read 2026-09-27)
- https://cloudnative-pg.io/documentation/1.30/recovery/ (read 2026-09-27)
- https://cloudnative-pg.io/documentation/1.30/kubectl-plugin/ (read 2026-09-27)
- https://cloudnative-pg.io/plugin-barman-cloud/docs/usage/ (read 2026-09-27)
- https://cloudnative-pg.io/plugin-barman-cloud/docs/installation/ (read 2026-09-27)
- https://github.com/cloudnative-pg/charts (read 2026-09-27)
- https://github.com/cert-manager/cert-manager/releases (read 2026-09-27)
- https://www.pulumi.com/registry/packages/kubernetes/ (read 2026-09-27)
- https://www.pulumi.com/registry/packages/aws/ (read 2026-09-27)
- https://www.pulumi.com/registry/packages/command/ (read 2026-09-27)
