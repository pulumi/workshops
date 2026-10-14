# VMs on Kubernetes as Code: Provisioning and Live-Migrating a KubeVirt VM with Pulumi

A 90-minute workshop for platform and infrastructure engineers who run VM
workloads next to containers. KubeVirt represents a virtual machine as native
Kubernetes objects, and the generic Pulumi Kubernetes provider applies those
objects like any other manifest. No dedicated VM provider is needed. You
provision a VM on a local kind cluster with Pulumi IaC and live-migrate it
between nodes.

> Most platforms run containers and VMs on two separate control planes, with
> two sets of tooling, two RBAC models and two monitoring pipelines. KubeVirt
> puts the VM inside Kubernetes as a `VirtualMachine` object. This workshop
> tests that claim with the thing a VM has to survive: moving to another node.
>
> Workshop page: not yet announced.

## Sessions and speakers

| Session | Date | Length |
|---|---|---|
| unknown | unknown | 90 min |

- Speakers: unknown

## What attendees learn

1. Write a Pulumi program that applies a KubeVirt `VirtualMachine` and check that it reaches `Running`.
2. How KubeVirt models a VM as Kubernetes objects (`VirtualMachine`, `VirtualMachineInstance`, a `virt-launcher` pod) instead of a separate control plane.
3. Trigger a live migration with `virtctl migrate` and read the `VirtualMachineInstanceMigration` status.
4. Reach the VM through its serial console and a NodePort `Service`.
5. Tear everything down with `pulumi destroy` and confirm nothing is left behind.

## Layout

```
vms-on-kubernetes-kubevirt-live-migration/
├── README.md            this file
├── AGENTS.md            conventions for agents (and humans) editing this folder
├── .gitignore           *.md ignored except README.md, AGENTS.md, slides/slides.md
├── .shellcheckrc        source-path=SCRIPTDIR, external-sources=true
├── 01-preflight/        host checks and image pre-pull, before anything else runs
├── 02-cluster/          Pulumi project: the three-node kind cluster (kind.yaml pins the node image)
├── 03-kubevirt/         Pulumi project: the KubeVirt operator manifest and the KubeVirt custom resource
├── 04-vm/               Pulumi project: the VirtualMachine and its NodePort Service
├── 05-console/          scripts to reach the VM: serial console and SSH
├── 06-live-migration/   scripts to trigger the migration, watch it and probe the Service across it
└── 07-teardown/         scripts to destroy the stacks and verify nothing is left
```

The twelve demo steps collapse into seven folders, each ending in a state you
can check. `03-kubevirt` installs the operator and applies the `KubeVirt`
resource together, because the resource cannot exist before the operator's
CRD does. `04-vm` holds the VM and its Service. `06-live-migration` holds the
trigger, the watch and the probe. `07-teardown` ends with a check, because an
unchecked teardown proves nothing. The slides follow in `slides/`.

## Prerequisites

Participants:

- A Linux host with `/dev/kvm`. KubeVirt on kind is not supported on macOS or
  Windows hosts ([kubevirt/kubevirt#12410](https://github.com/kubevirt/kubevirt/issues/12410)).
  `useEmulation` is `true` by default in `03-kubevirt`, so a Linux host without
  KVM also works, with a much slower guest boot.
- Docker, running, with 8 GB or more RAM available to it.
- [`kind`](https://kind.sigs.k8s.io/) v0.33.0 and `kubectl` (a version within
  one minor of Kubernetes v1.36).
- [`virtctl`](https://kubevirt.io/user-guide/user_workloads/virtctl_client_tool/) v1.9.0, the same version as the KubeVirt server.
- Node.js 22 and npm, and the Pulumi CLI (built and checked with 3.263.0).
- A Pulumi backend to hold state. Pulumi Cloud works; a local one works too
  (`pulumi login file://<dir>` with `PULUMI_CONFIG_PASSPHRASE` set).

Presenter, in addition:

- Run `01-preflight/prepull-images.sh` before the session so the kind node
  image, the KubeVirt images and the VM disk image are already local.
- No cloud account or credentials are needed.

Pinned versions, read 2026-10-01:

| Tool | Version | Source |
|---|---|---|
| KubeVirt | v1.9.0 (released 2026-07-30) | https://github.com/kubevirt/kubevirt/releases/tag/v1.9.0 |
| kind | v0.33.0 (released 2026-08-26) | https://github.com/kubernetes-sigs/kind/releases/tag/v0.33.0 |
| kind node image | `kindest/node:v1.36.4`, pinned by digest in `02-cluster/kind.yaml` | same release |
| virtctl | v1.9.0 | https://github.com/kubevirt/kubevirt/releases/tag/v1.9.0 |
| VM disk | `quay.io/kubevirt/cirros-container-disk-demo`, pinned by digest in `04-vm/index.ts` | https://quay.io/repository/kubevirt/cirros-container-disk-demo |

kind v0.33.0 defaults to Kubernetes v1.37.0. The demo pins v1.36.4 instead,
because the KubeVirt support matrix lists KubeVirt 1.9 against Kubernetes
1.34, 1.35 and 1.36.

## Run the slides

The deck is built on this branch after the demo code. Until then there is
nothing to run here.

## Run the demo

Set it up once, then repeat the per-run steps as often as you like.

```bash
# 0. once: log in to a Pulumi backend and set the stack references
export PULUMI_CONFIG_PASSPHRASE=<your passphrase>      # only for a local backend
pulumi login file://<dir>                              # or pulumi login for Pulumi Cloud

# 1. once: check the host and pre-pull the images
01-preflight/preflight.sh
01-preflight/prepull-images.sh

# 2. create the kind cluster (kind create cluster runs inside a Pulumi command resource)
cd 02-cluster && npm install && pulumi stack init dev && pulumi up --stack dev && cd ..

# 3. install the KubeVirt operator and the KubeVirt resource, then wait for Deployed
cd 03-kubevirt && npm install && pulumi stack init dev && pulumi up --stack dev && cd ..
kubectl -n kubevirt get kubevirt kubevirt -o jsonpath='{.status.phase}'

# 4. provision the VM and its NodePort Service
cd 04-vm && npm install && pulumi stack init dev && pulumi up --stack dev && cd ..
kubectl get vmi

# 5. reach the VM
05-console/console.sh                                  # virtctl console demo-vm

# 6. live-migrate it (probe in a second terminal)
06-live-migration/hold-connection.sh
06-live-migration/migrate.sh                           # virtctl migrate demo-vm
06-live-migration/watch-migration.sh                   # kubectl get vmim -w, then kubectl get vmi -o wide

# 7. between runs or after the last session: destroy in reverse order and verify
07-teardown/teardown.sh
07-teardown/verify-clean.sh
```

In `03-kubevirt` and `04-vm`, set `<org>/vms-cluster/<stack>` as
`clusterStackRef` in `Pulumi.dev.yaml`. On a local backend the reference is
`organization/vms-cluster/dev`.

`teardown.sh` runs `pulumi destroy` on `04-vm`, `03-kubevirt` and `02-cluster`
in that order. Destroying `02-cluster` runs `kind delete cluster` through the
same command resource that created it. `verify-clean.sh` fails if
`kind get clusters` still lists the workshop cluster.

### Design choices

- No Helm chart. The brief called for one, but the KubeVirt installation
  guide (read 2026-10-01) documents the operator manifest and the `KubeVirt`
  custom resource and does not mention Helm. `03-kubevirt` applies the pinned v1.9.0 operator manifest with
  `k8s.yaml.v2.ConfigFile` and the `KubeVirt` resource with
  `k8s.apiextensions.CustomResource`.
- `containerDisk` instead of `DataVolume`. KubeVirt requires ReadWriteMany
  storage for a PVC-backed VM to live-migrate, and kind's default
  `local-path` class is ReadWriteOnce. A `containerDisk` has no PVC, so the VM
  migrates on kind.
- kind is part of the Pulumi program. `02-cluster` runs `kind create cluster`
  and `kind delete cluster` through `@pulumi/command`, so `pulumi destroy`
  removes the cluster.
- `runStrategy: Always` instead of `running: true`. KubeVirt documents
  `running` as the older boolean form of the same setting.

## Cost

Zero. The demo runs on a local kind cluster and needs no cloud account.

## Sources

Facts in the demo come from these pages, read on 2026-10-01:

- KubeVirt v1.9.0 release: https://github.com/kubevirt/kubevirt/releases/tag/v1.9.0
- KubeVirt installation guide: https://kubevirt.io/user-guide/cluster_admin/installation/
- KubeVirt live migration guide: https://kubevirt.io/user-guide/compute/live_migration/
- KubeVirt run strategies: https://kubevirt.io/user-guide/compute/run_strategies/
- KubeVirt node maintenance (`evictionStrategy`): https://kubevirt.io/user-guide/cluster_admin/node_maintenance/
- KubeVirt to Kubernetes support matrix: https://github.com/kubevirt/sig-release/blob/main/releases/k8s-support-matrix.md
- kind v0.33.0 release: https://github.com/kubernetes-sigs/kind/releases/tag/v0.33.0
- kind configuration: https://kind.sigs.k8s.io/docs/user/configuration/
- Pulumi Kubernetes provider, `renderYamlToDirectory`: https://www.pulumi.com/registry/packages/kubernetes/api-docs/provider/
- `kubernetes.yaml.v2.ConfigFile`: https://www.pulumi.com/registry/packages/kubernetes/api-docs/yaml/v2/configfile/
- `kubernetes.apiextensions.CustomResource`: https://www.pulumi.com/registry/packages/kubernetes/api-docs/apiextensions/customresource/
- `@pulumi/command` `local.Command`: https://www.pulumi.com/registry/packages/command/api-docs/local/command/
- Stack references: https://www.pulumi.com/docs/iac/concepts/stacks/#stackreferences
