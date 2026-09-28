# Storage and Caching as Code: Longhorn and Dragonfly on Kubernetes with Pulumi

A 90-minute workshop for platform engineers running stateful workloads on
Kubernetes. Everything here provisions with Pulumi TypeScript against a
local `kind` cluster: no cloud account, $0 cost.

> By the end, you will have a working Longhorn-backed persistent volume and
> a Dragonfly cache running on Kubernetes, both provisioned with Pulumi, and
> you will have watched a simulated node failure recover without data loss.

## Sessions and speakers

Not yet scheduled. This workshop entered the build pipeline from demand
evidence across three independent sources (see "Sources" below); no event,
session, or speaker is assigned as of this build.

## What attendees learn

- How Pulumi's Kubernetes provider models a Helm chart install
  (`helm.v4.Chart`), a `StorageClass`, a `PersistentVolumeClaim`, and a
  `Job`, and how to chain several of those as separate Pulumi projects with
  `pulumi.StackReference`.
- How Longhorn replicates a volume across nodes, and what that buys you
  when a node running your workload disappears mid-write.
- Why an in-memory cache (Dragonfly) is provisioned with no persistence at
  all -- the opposite tradeoff from the Longhorn-backed volume next to it,
  and why a workshop teaches both in one session.
- The operational cost of running distributed storage yourself versus a
  managed alternative, and where Rook/Ceph sits on that spectrum next to
  Longhorn (comparison only -- this workshop does not build Rook/Ceph; see
  "Known risk" below).

## Layout

```
storage-and-caching-on-kubernetes-longhorn-dragonfly/
├── 01-cluster/           kind cluster (1 control-plane, 3 workers) + the longhorn-system and caching-workshop namespaces
├── 02-longhorn/          open-iscsi preflight note + pinned Longhorn v1.12.1 Helm chart into longhorn-system
├── 03-storage-class/     Longhorn-backed StorageClass, 3 replicas, explicitly not the cluster default
├── 04-stateful-app/      1Gi PVC on that class + a small writer Deployment that appends a timestamped record
├── 05-failover-drill/    bash: cordon/drain the writer's node, verify the record survives the reschedule, uncordon
├── 06-dragonfly/         Dragonfly cache (pinned image), Deployment + ClusterIP Service, no persistence
├── 07-cache-client/      Job running redis-cli: PING, then write and read five keys
├── slides/               Slidev deck (built on this branch by the following slides run)
├── .gitignore
├── .shellcheckrc
├── AGENTS.md
└── README.md
```

Each numbered folder is its own Pulumi project. `02` and `06` read `01`'s
stack via `pulumi.StackReference`; `03` reads `02`'s; `04` reads `01` and
`03`'s; `07` reads `01` and `06`'s.

## Known risk -- read before delivering this workshop

**Longhorn on `kind` is not a documented, supported combination.** Neither
longhorn.io nor kind.sigs.k8s.io lists the other as a tested platform in
either direction. kind's "nodes" are containers sharing the Docker host's
kernel rather than separate machines, and Longhorn expects `iscsiadm`/
open-iscsi and kernel modules available at the node level -- on kind, that
means present on the Docker host itself, not injectable into a node
container. `01-cluster/kind.yaml` adds `extraMounts` for `/var/lib/longhorn`
as a workaround for kind's containers-as-nodes model; it is not verified
Longhorn guidance. **This was not tested against a live cluster during this
build** (no `docker`/`kind`/`kubectl` on the build workstation) and is the
single largest open risk in this workshop. Rehearse the full chain on a
real machine with Docker before the first live delivery; if volumes do not
attach, Longhorn's better-documented local alternative is k3d/k3s rather
than kind, and this workshop's cluster choice (fixed by the brief) would
need to be revisited.

The brief's own risk section named this precisely as a hardware- and
timing-sensitive concern; this build did not resolve it, only documented it
as thoroughly as offline research allows.

**Rook/Ceph vs Longhorn:** the workshop's title names Rook, but this build
teaches Longhorn as the primary storage system, per the brief's default
(simpler operational model, an independent tutorial backing it directly).
Rook/Ceph appears only as comparison material for the slides. See "Open
questions" in the pull request.

## Prerequisites

**Participants**, before the session:

- Docker Desktop or Docker Engine, >=4 CPU / 8GB RAM allocated
- [`kind`](https://kind.sigs.k8s.io/) (tested against v0.33.0)
- `kubectl`
- Node.js (any current LTS) and `npm`
- `redis-cli` (ships with Redis; used against Dragonfly, which speaks the
  same protocol)
- Pulumi CLI, authenticated (`pulumi login` -- any backend; no cloud
  account is otherwise required)
- No cloud account of any kind is needed for this workshop.

**Presenter**, before delivering:

- Rehearse the full chain, twice, on a real kind cluster -- not this build
  workstation, which has no Docker.
- Pull and cache/mirror the Longhorn chart's images and the pinned
  Dragonfly image ahead of time; a live pull mid-session is the single
  biggest timing risk in a 90-minute slot.
- Rehearse `05-failover-drill/drill.sh` specifically at least twice. Cap
  live retries at two; if it does not succeed a second time, fall back to
  a recorded run rather than attempting a third live retry. Have that
  recording ready and reviewed before delivery.

## Run the demo

**Once, before the first delivery of the day** (setup):

```bash
# From each of 01-cluster, 02-longhorn, 03-storage-class, 04-stateful-app,
# 06-dragonfly, 07-cache-client:
npm install
```

**Each run, in order:**

```bash
cd 01-cluster && pulumi up --yes    # kind cluster + namespaces
# Presenter host step, once the cluster exists -- not a Pulumi resource:
longhornctl --kubeconfig ~/.kube/config \
  --image longhornio/longhorn-cli:v1.12.1 install preflight
cd ../02-longhorn && pulumi up --yes        # Longhorn v1.12.1
cd ../03-storage-class && pulumi up --yes   # the StorageClass this workshop teaches with
cd ../04-stateful-app && pulumi up --yes    # PVC + record-writer
# proof point 1-4: see "Verification" below
cd ../05-failover-drill && ./drill.sh       # the live failover demo
cd ../06-dragonfly && pulumi up --yes       # Dragonfly cache
cd ../07-cache-client && pulumi up --yes    # PING + key round-trip via redis-cli
```

**Between runs** (reset without tearing down `npm install`):

```bash
cd 07-cache-client && pulumi destroy --yes
cd ../06-dragonfly && pulumi destroy --yes
cd ../04-stateful-app && pulumi destroy --yes
cd ../03-storage-class && pulumi destroy --yes
cd ../02-longhorn && pulumi destroy --yes
cd ../01-cluster && pulumi destroy --yes && kind delete cluster --name storage-caching-workshop-demo
```

Longhorn leaves node-local state under `/var/lib/longhorn` on a real host;
on kind's containerised nodes, `kind delete cluster` removes the containers
(and, per `01-cluster/kind.yaml`'s `extraMounts`, the host-side directories
under `/tmp/kind-longhorn/` -- delete those by hand if a fully clean host is
wanted between deliveries).

**Cost:** $0 -- everything above runs on a local `kind` cluster with no
cloud account.

## Run the slides

```bash
cd slides
npm install
npm run dev     # local preview at http://localhost:3030
npm run build   # static build
npm run export  # slides-export.pdf
```

The deck is 25 slides, with speaker notes carrying time budgets that sum to
the workshop's 90 minutes. See `slides/AGENTS.md` for the deck's sources and
the one deviation from the workshop brief's slide outline.

## Verification (this build)

Run on this build workstation, which has `pulumi`, `node`/`npm`, `git`, and
`shellcheck`, but no `docker`, `kind`, `kubectl`, `helm`, or `redis-cli`.

**Ran and passed:**

- `npm install` + `npx tsc --noEmit`, clean, in all six TypeScript projects
  (`01-cluster`, `02-longhorn`, `03-storage-class`, `04-stateful-app`,
  `06-dragonfly`, `07-cache-client`).
- Offline render chain: `pulumi login file://...`, `pulumi config set
  renderYamlToDirectory <dir>`, `pulumi up --yes --non-interactive` in
  dependency order, against a local backend with no live cluster. Every
  project rendered its manifests and every `pulumi.StackReference` resolved
  a real (non-placeholder) value from the upstream stack -- for example,
  `07-cache-client`'s rendered Job script substitutes the actual Dragonfly
  Service name (`dragonfly`) it reads from `06-dragonfly`'s real output,
  not a hardcoded string. `pulumi destroy` + `pulumi stack rm` cleaned up
  all local state afterward; nothing from this step is committed.
- Rendered YAML spot-checked against intent for every project (namespace
  names, the StorageClass's `defaultClass` staying unset, the PVC's storage
  class and size, the Job's redis-cli script).
- `shellcheck drill.sh lib.sh` (against this folder's `.shellcheckrc`):
  clean.
- The layout tree above matches `find`'s output on the finished tree.

**Not run -- no container runtime on this workstation:**

- An end-to-end run on a live, fresh, multi-node kind cluster, and whether
  it completes within 55 minutes.
- Every `kubectl`-based proof point below (nodes `Ready`; Longhorn manager/
  engine pods `Running`; the StorageClass present and not default; the PVC
  `Bound` and a record actually written; the failover drill's reschedule
  and record survival; the Dragonfly pod `Running` and `redis-cli ping`
  returning `PONG`; the key round-trip).
- `05-failover-drill/drill.sh` rehearsed against a live cluster, at all.
- A fallback recording of the failover drill existing or being reviewed.
- Verifying teardown leaves nothing orphaned on a real Docker host.
- Presenter assignment and rehearsal.

Each numbered folder's `AGENTS.md` names its own exact verification command
for the live-cluster proof point it owns.

## Sources

- Dragonfly's CNCF Sandbox graduation: infoq.com, read 2026-03-01
- LWKD (Last Week in Kubernetes Development) newsletter, week 34: lwkd.dev, read 2026-08-17
- Longhorn tutorial: oneuptime.com, read 2026-01-25
- KubeCon NA 2026 full program: read 2026-09-28
- `pulumi/workshops` repository tree: github.com, read 2026-09-28
- Internal Pulumi resource-usage signal: none available for a comparable
  typed resource; no internal table or link is cited here.
- Longhorn install/Helm/uninstall docs: longhorn.io, read 2026-09-28
- Dragonfly getting-started/Docker docs: dragonflydb.io, read 2026-09-28
- `@pulumi/kubernetes` `helm.v4.Chart` and provider docs: pulumi.com, read 2026-09-28
- kind releases and configuration docs: github.com/kubernetes-sigs/kind and kind.sigs.k8s.io, read 2026-09-28
