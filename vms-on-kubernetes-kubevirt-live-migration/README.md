# VMs on Kubernetes as Code: Provisioning and Live-Migrating a KubeVirt VM with Pulumi

A 90-minute workshop for platform and infrastructure engineers who run legacy
VM workloads alongside containers and want one control plane for both.
KubeVirt represents a virtual machine as native Kubernetes objects; Pulumi's
generic Kubernetes provider applies those objects like any other manifest, no
dedicated VM provider required. By the end, participants will have
provisioned a virtual machine on Kubernetes and live-migrated it between
nodes, using nothing but a Pulumi program.

> Most platforms run containers and VMs on two separate control planes: two
> sets of tooling, two RBAC models, two monitoring pipelines. KubeVirt puts
> the VM inside Kubernetes as a `VirtualMachine` object, and this workshop
> proves it holds up under the one thing a VM has to survive: moving to a
> different machine without anyone noticing.
>
> — [Workshop brief](https://workprentice.ai/documents/1dee96e0-3386-40d6-87c3-ccdfee6f540a)

## Sessions and speakers

| Session | Date | Length |
|---|---|---|
| TBD | Not yet scheduled | 90 min |

Speakers not yet assigned. This workshop entered the build queue on six
independent demand signals (see [Why this, why now](#why-this-why-now)); no
session date has been booked.

## What attendees learn

1. What changes when a virtual machine is represented as native Kubernetes
   objects (`VirtualMachine` → `VirtualMachineInstance` → a pod running
   `virt-launcher` around qemu/KVM), instead of living on a separate
   hypervisor.
2. How Pulumi's generic `@pulumi/kubernetes` provider applies KubeVirt's CRDs
   the same way it applies any other Kubernetes manifest: no dedicated
   KubeVirt provider exists or is needed.
3. How to provision a running VM on Kubernetes with a Pulumi program, and
   verify it from the guest's own console.
4. How live migration moves a running VM to a different node with zero
   downtime to the workload it is serving, and what has to be true of the
   VM's storage for that to be possible.
5. How `pulumi destroy` tears down the VM, the KubeVirt operator, and (if
   modeled) the `kind` cluster itself, leaving nothing behind.

## Why this, why now

KubeVirt v1.9.0 shipped 2026-07-30, graduating seccomp and
`ExternalNetResourceInjection` to GA and adding live-migration fixes. Six
independent signals over the following months point at rising interest in
VMs-on-Kubernetes: a KubeCon + CloudNativeCon Europe 2026 session naming
KubeVirt a main pillar for orchestrating VMs natively on Kubernetes, an
independent KubeVirt talk at DevOps Pro Europe drawing 700+ attendees, a
KubeCon recap naming a virtualization-on-Kubernetes talk among personal
favorites, a KubeCon EU 2026 Metal3.io session (the bare-metal provisioning
project adjacent to KubeVirt's story), and a CNCF blog post on platform
engineering maturity naming "Metal3 meeting KubeVirt" as a pattern for
treating VMs like bare metal within a platform. Full citations and dates are
in the [workshop brief](https://workprentice.ai/documents/1dee96e0-3386-40d6-87c3-ccdfee6f540a).

## Layout

```
vms-on-kubernetes-kubevirt-live-migration/
├── README.md            this file
├── AGENTS.md             conventions for agents (and humans) editing this folder
├── .gitignore            *.md ignored except README.md, AGENTS.md, slides/slides.md
├── .shellcheckrc         source-path=SCRIPTDIR, external-sources=true
├── 01-preflight/         host checks and image pre-pull, before anything else runs
├── 02-cluster/           Pulumi project: the three-node kind cluster
├── 03-kubevirt/          Pulumi project: the KubeVirt operator and its CR
├── 04-vm/                Pulumi project: the VirtualMachine and its NodePort Service
├── 05-console/           scripts to reach the running VM's console and SSH port
├── 06-live-migration/    scripts to trigger, watch, and prove the live migration
└── 07-teardown/          scripts to tear everything down and confirm nothing is left
```

The demo's 12 numbered steps (see the brief) collapse into seven folders,
each ending in a state you can check before moving on. `03-kubevirt` covers
both installing the operator and applying the `KubeVirt` custom resource,
because the CR cannot be applied before the operator's CRD exists, and
"operator ready" is that folder's one end state, not two. `04-vm` covers both
the VM and its Service, because the VM only exists once it reaches `Running`,
and the Service is how you reach it. `06-live-migration` covers watching the
migration and proving it caused no downtime as one continuous moment: you
cannot show a migration without watching it happen. `07-teardown` covers
destroying everything and verifying the clean state, because a teardown that
is not verified is not a teardown.

## Prerequisites

- **Linux host with KVM.** KubeVirt on `kind` needs `/dev/kvm` on the host
  kernel. This is not supported on macOS or Windows hosts
  ([kubevirt/kubevirt#12410](https://github.com/kubevirt/kubevirt/issues/12410)).
  Software emulation (`useEmulation: true`, on by default in this workshop's
  config) works on any Linux host without KVM, at the cost of a much slower
  boot; it does not lift the macOS/Windows restriction.
- Docker, running, with **8GB+ RAM** available to it. KubeVirt's virt-launcher
  pods are memory-hungry, more so under emulation.
- [`kind`](https://kind.sigs.k8s.io/) — pin the exact version you install and
  record it below when you rehearse.
- `kubectl`, matching the cluster's Kubernetes minor version (`kind` v0.33.0's
  default node image is Kubernetes 1.37.0).
- [`virtctl`](https://kubevirt.io/user-guide/user_workloads/virtctl_client_tool/)
  **v1.9.0**, matching the KubeVirt server version exactly. A mismatch causes
  console or migration commands to fail with unclear errors.
- Node.js 22.x, npm, and the Pulumi CLI (this repo builds and verified
  against Pulumi CLI v3.263.0).

Pinned versions used in this build, verify before every session:

| Tool | Version | Source |
|---|---|---|
| KubeVirt | v1.9.0 | https://github.com/kubevirt/kubevirt/releases/tag/v1.9.0 |
| kind | v0.33.0 | https://github.com/kubernetes-sigs/kind/releases/tag/v0.33.0 |
| kind node image | `kindest/node:v1.37.0` (Kubernetes 1.37.0) | same release |
| virtctl | v1.9.0 (must match KubeVirt) | https://github.com/kubevirt/kubevirt/releases/tag/v1.9.0 |
| `@pulumi/kubernetes` | ^4.34.2 | https://www.npmjs.com/package/@pulumi/kubernetes |
| `@pulumi/command` | ^1.2.1 | https://www.npmjs.com/package/@pulumi/command |

## Run the slides

```bash
cd slides
npm install
npm run dev
```

## Run the demo

```bash
# 0. once: install and pin the tools listed in Prerequisites, and log in to a
#    Pulumi backend (this build used `pulumi login file://~/.pulumi-vms-demo`).
export PULUMI_CONFIG_PASSPHRASE=<your passphrase>

# 1. once, before the session: verify the host and pre-pull images.
cd 01-preflight && ./preflight.sh && ./prepull-images.sh && cd ..

# 2. per run: create the kind cluster.
cd 02-cluster && npm install && pulumi up --stack dev && cd ..

# 3. per run: install the KubeVirt operator and its CR, wait for readiness.
cd 03-kubevirt && npm install && pulumi up --stack dev && cd ..

# 4. per run: provision the VM and its NodePort Service.
cd 04-vm && npm install && pulumi up --stack dev && cd ..

# 5. reach the running VM.
cd 05-console && ./console.sh   # or ./ssh.sh
cd ..

# 6. live-migrate it and watch nothing break.
cd 06-live-migration
./hold-uptime.sh &      # leave this running in another terminal
./migrate.sh
./watch-migration.sh
cd ..

# 7. between runs: tear down in reverse order and confirm nothing is left.
cd 07-teardown && ./teardown.sh && ./verify-clean.sh && cd ..
```

### Why containerDisk instead of DataVolume

The brief's step 5 calls for a `DataVolume` boot disk. A `DataVolume` is
provisioned by the Containerized Data Importer (CDI), a separate operator
from KubeVirt core, and it backs the VM with a `PersistentVolumeClaim`. On a
stock `kind` cluster, the default `local-path` storage class is
`ReadWriteOnce`. KubeVirt's own documentation is explicit about what that
means for this workshop's punchline: "Virtual machines using a
PersistentVolumeClaim (PVC) must have a shared ReadWriteMany (RWX) access
mode to be live migrated"
([kubevirt.io/user-guide/compute/live_migration](https://kubevirt.io/user-guide/compute/live_migration/)).
A `DataVolume`-backed VM on stock `kind` would be rejected as non-migratable,
which breaks the workshop's own promise. `04-vm` instead boots the VM from a
`containerDisk` (an image baked into a container, no PVC involved) with
`cloudInitNoCloud` for guest configuration; a `containerDisk`-backed VM has
no PVC and is migratable everywhere. The `DataVolume`/CDI path is documented
in `04-vm/AGENTS.md` as where this workshop goes next for participants who
need a persistent-disk VM.

### Why no Helm chart

The brief's step 3 calls for KubeVirt "installed via its official Helm
chart, pinned to v1.9.0." KubeVirt publishes no official Helm chart;
[kubevirt.io](https://kubevirt.io/user-guide/cluster_admin/installation/)
documents only release-pinned YAML manifests as the install path, and the
charts on ArtifactHub under KubeVirt's name are third-party community
projects. `03-kubevirt` installs the pinned v1.9.0 operator manifest with
`kubernetes.yaml.v2.ConfigFile` instead, which is Pulumi's documented,
current way to apply a remote manifest URL, then applies the `KubeVirt`
custom resource with `apiextensions.CustomResource`, depending on the
manifest apply. This is raised as an open question in the pull request.

### Is `kind` modeled in Pulumi?

Yes. `02-cluster` uses `@pulumi/command`'s `local.Command` to run
`kind create cluster` on create and `kind delete cluster` on delete, so
`pulumi destroy` genuinely removes the cluster, matching learning outcome 5
and the brief's acceptance checklist ("`pulumi destroy` leaves no orphaned
`kind` clusters").

## Cost

**$0.** Everything in this workshop runs on a local `kind` cluster; no cloud
account or credentials are used.

## Sources

All read 2026-09-26.

- KubeVirt v1.9.0 release. https://github.com/kubevirt/kubevirt/releases/tag/v1.9.0
- KubeVirt quickstart on kind, including the macOS/Windows caveat. https://kubevirt.io/quickstart_kind/
- KubeVirt live migration guide, the RWX/PVC rule. https://kubevirt.io/user-guide/compute/live_migration/
- KubeVirt node maintenance guide, `evictionStrategy: LiveMigrate`. https://kubevirt.io/user-guide/cluster_admin/node_maintenance/
- KubeVirt installation guide (no official Helm chart). https://kubevirt.io/user-guide/cluster_admin/installation/
- KubeVirt storage / Containerized Data Importer guide. https://kubevirt.io/user-guide/storage/containerized_data_importer/
- KubeVirt labs VM manifest (containerDisk image reference). https://kubevirt.io/labs/manifests/vm.yaml
- kind v0.33.0 release. https://github.com/kubernetes-sigs/kind/releases/tag/v0.33.0
- kind cluster configuration reference. https://kind.sigs.k8s.io/docs/user/configuration/
- Pulumi Kubernetes provider docs, `renderYamlToDirectory` option. https://www.pulumi.com/registry/packages/kubernetes/api-docs/provider/
- Pulumi `kubernetes.yaml.v2.ConfigFile` docs. https://www.pulumi.com/registry/packages/kubernetes/api-docs/yaml/v2/configfile/
- Pulumi `kubernetes.apiextensions.CustomResource` docs. https://www.pulumi.com/registry/packages/kubernetes/api-docs/apiextensions/customresource/
- Pulumi `@pulumi/command` `local.Command` docs. https://www.pulumi.com/registry/packages/command/api-docs/local/command/
- Full workshop brief with the six why-now signals and the acceptance checklist. https://workprentice.ai/documents/1dee96e0-3386-40d6-87c3-ccdfee6f540a
