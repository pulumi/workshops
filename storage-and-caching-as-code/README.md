# Storage and caching as code: Longhorn and DragonflyDB on Kubernetes with Pulumi

Demo code for the workshop "Storage and caching as code". You build a 3-worker kind cluster, install Longhorn (distributed block storage) with a Pulumi-managed Helm release, run a stateful app on a Longhorn volume, take down the node it runs on, and then deploy DragonflyDB (a Redis-compatible in-memory store) and talk to it from a client Job. Every piece of Kubernetes configuration is a Pulumi IaC program in TypeScript. Nothing needs a cloud account.

## Prerequisites

- Docker with at least 4 CPU cores and 8 GB RAM available to it
- kind (tested with v0.33.0), kubectl, helm (the Pulumi Helm release resolves the chart through it), Node.js 22
- The Pulumi CLI, logged in (`pulumi login`; Pulumi Cloud or a local backend both work)
- redis-cli on the laptop is optional. The scripts run redis-cli inside the cluster.
- A Linux Docker host whose kernel has the `iscsi_tcp` module (see Known issues)

## Run order

Install the npm dependencies once:

```bash
scripts/install-deps.sh
```

Each Pulumi project uses a stack named `dev`. In a project folder, run `pulumi stack init dev` the first time, then `pulumi up`. The kubeconfig context defaults to `kind-storage-workshop`. Change it with `pulumi config set kubeContext <context>`.

### Step 1. Cluster and Pulumi project

```bash
01-cluster/scripts/cluster-up.sh
cd 01-cluster && pulumi stack init dev && pulumi preview && pulumi up
kubectl get nodes
```

End state: `kubectl get nodes` shows 4 Ready nodes (1 control plane, 3 workers). `pulumi preview` is clean and the `demo` namespace exists. The script also installs open-iscsi and nfs-common in every node and starts iscsid, which Longhorn needs.

### Step 2. Longhorn

```bash
cd 02-longhorn && pulumi stack init dev && pulumi up
kubectl -n longhorn-system get pods
```

End state: the Longhorn manager pod runs on every worker, and the engine image, CSI and UI pods are Running. The first start takes a few minutes while images are pulled. Chart version 1.13.0 is pinned.

### Step 3. StorageClass

```bash
cd 03-storageclass && pulumi stack init dev && pulumi up
kubectl get storageclass
```

End state: `longhorn-workshop` is listed with provisioner `driver.longhorn.io` and no `(default)` marker. It keeps two replicas of each volume.

### Step 4. Stateful app

```bash
cd 04-stateful-app && pulumi stack init dev && pulumi up
kubectl -n demo get pod,pvc
04-stateful-app/scripts/write-record.sh "hello from Longhorn"
04-stateful-app/scripts/read-record.sh
```

End state: the `record-keeper` pod is Running, the PVC `record-data` is Bound (1Gi), and the record file reads back with the node that wrote it.

### Step 5. Node failure

```bash
05-node-failure/simulate-failure.sh
05-node-failure/restore-node.sh
```

`simulate-failure.sh` cordons the node that hosts the pod, deletes the pod, waits for the Deployment to roll out (two attempts at most), checks that the new pod is on a different node, and prints the record. Use `05-node-failure/simulate-failure.sh --drain` to drain the node instead. `restore-node.sh` uncordons it.

End state: the pod runs on another node and the record written in step 4 is still there.

### Step 6. DragonflyDB

```bash
cd 06-dragonfly && pulumi stack init dev && pulumi up
06-dragonfly/scripts/ping.sh
```

End state: the `dragonfly` pod is Running and `ping.sh` prints `PONG`. The script runs `redis-cli -h dragonfly ping` in a pinned `redis:8.2.10-alpine` pod.

### Step 7. Cache client

```bash
07-cache-client/roundtrip.sh
```

End state: the Job writes `workshop:key:1` to `workshop:key:5`, reads them back, and its log ends with `round trip ok`.

Optional, not a benchmark: `07-cache-client/compare-redis.sh` runs `redis-benchmark` against Dragonfly and a throwaway plain Redis pod, both on a laptop with small resource limits. The numbers only show that both speak the Redis protocol.

## Resetting between rehearsals

`scripts/reset.sh` removes the demo workloads and the volume but keeps the cluster and Longhorn. After it, run `pulumi refresh` in `04-stateful-app` and `06-dragonfly`, or `pulumi up` to recreate them.

## Offline check without a cluster

```bash
scripts/verify-offline.sh 03-storageclass
```

The script type-checks the project and runs `pulumi preview` with `renderYamlToDirectory` set, using a throwaway local backend. Your Pulumi login is untouched. Every project accepts the config key `renderYamlToDirectory`. When it is set the Kubernetes provider renders manifests instead of using the cluster context. The provider rejects both settings together, so the program passes only one.

## Teardown

Destroy in reverse order, then delete the cluster:

```bash
cd 06-dragonfly && pulumi destroy
cd 04-stateful-app && pulumi destroy
cd 03-storageclass && pulumi destroy
cd 02-longhorn && pulumi destroy
cd 01-cluster && pulumi destroy
01-cluster/scripts/cluster-down.sh
```

Longhorn refuses to uninstall unless the setting `deleting-confirmation-flag` is true. The chart values in `02-longhorn` set it, so `pulumi destroy` can remove the release. On real nodes Longhorn leaves data under `/var/lib/longhorn`. kind nodes are containers, so deleting the cluster removes it. Clean that directory by hand on real infrastructure.

## Known issues

- Dragonfly here is DragonflyDB (dragonflydb.io, github.com/dragonflydb/dragonfly), the Redis-compatible in-memory store. It is licensed under BSL 1.1 and is not a CNCF project. The CNCF project named Dragonfly (d7y.io, dragonflyoss) is a different project: peer-to-peer image and file distribution. The workshop brief mixes the two up, and the slides need to say DragonflyDB and drop the "CNCF-graduated" claim for it.
- Longhorn on kind is not documented by Longhorn. The Longhorn install docs require open-iscsi with a running iscsid on every node and the `iscsi_tcp` kernel module. kind nodes share the host kernel, so the module has to be loaded on the Docker host. `cluster-up.sh` installs the packages and starts iscsid in each node, but this has not been run end to end (this workstation has no Docker). Rehearse it on the presenting laptop. Docker Desktop on macOS and Windows has not been tested. Fallback: use a cluster of real or VM nodes that meet the Longhorn requirements, or play the recording.
- The Longhorn chart declares `kubeVersion: >=1.34.0-0`. `helm template` with the default capabilities fails; pass `--kube-version 1.35.8`. The kind node image is Kubernetes v1.35.8 to satisfy this.
- Longhorn graduated status: the CNCF project page lists Longhorn as incubating (since 2021-11-04).

## Layout

```text
storage-and-caching-as-code/
├── .gitignore
├── .shellcheckrc
├── AGENTS.md
├── README.md
├── 01-cluster/
│   ├── .gitignore
│   ├── Pulumi.yaml
│   ├── index.ts
│   ├── kind.yaml
│   ├── package-lock.json
│   ├── package.json
│   ├── tsconfig.json
│   └── scripts/
│       ├── cluster-down.sh
│       └── cluster-up.sh
├── 02-longhorn/
│   ├── .gitignore
│   ├── Pulumi.yaml
│   ├── index.ts
│   ├── package-lock.json
│   ├── package.json
│   └── tsconfig.json
├── 03-storageclass/
│   ├── .gitignore
│   ├── Pulumi.yaml
│   ├── index.ts
│   ├── package-lock.json
│   ├── package.json
│   └── tsconfig.json
├── 04-stateful-app/
│   ├── .gitignore
│   ├── Pulumi.yaml
│   ├── index.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── tsconfig.json
│   └── scripts/
│       ├── read-record.sh
│       └── write-record.sh
├── 05-node-failure/
│   ├── restore-node.sh
│   └── simulate-failure.sh
├── 06-dragonfly/
│   ├── .gitignore
│   ├── Pulumi.yaml
│   ├── index.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── tsconfig.json
│   └── scripts/
│       └── ping.sh
├── 07-cache-client/
│   ├── compare-redis.sh
│   ├── job.yaml
│   └── roundtrip.sh
└── scripts/
    ├── check-readme.sh
    ├── install-deps.sh
    ├── reset.sh
    └── verify-offline.sh
```
