# Provisioning the AI Inference Platform on Kubernetes: GPU Node Pools, Autoscaling and Quotas with Pulumi

A 90-minute, intermediate workshop for platform engineers and SREs who run
Kubernetes and have been handed the ticket "add GPU inference support." It
teaches the platform layer a GPU inference workload runs on: node pools,
accelerators, networking, autoscaling and quotas, all as Pulumi code. It does
not teach the model or the serving framework that eventually runs on top of
that platform.

> A GPU inference workload does not fail because the model is wrong nearly
> as often as it fails because the platform underneath it was never built as
> code: node pools sized by hand, drivers installed once and forgotten,
> autoscaling that does not know a GPU from a vCPU, and no quota standing
> between one team's workload and the whole cluster's capacity. This session
> builds that platform with Pulumi, end to end, live.

## Sessions and speakers

| Session | Date | Length |
|---|---|---|
| Not yet scheduled | TBD | 90 min |

No date has been booked for this workshop and no speakers have been
confirmed. It sits in the topic backlog on the strength of KubeCon NA 2026's
schedule: the AI Inference + Agentic track carries roughly 50 sessions, the
largest of the event's 12 tracks, and GPU platform provisioning is a
recurring theme in it. This content would fit a KubeCon co-located workshop
day or a standalone Pulumi webinar equally well.

## What attendees learn

1. Stand up a managed EKS cluster and a GPU node pool from Pulumi, with the
   right AMI type and instance type for accelerated workloads.
2. Install driver and device-visibility support with a Pulumi-managed Helm
   release, and verify the cluster reports allocatable GPUs.
3. Apply quotas and namespace limits so GPU capacity is shared predictably
   instead of first-come, first-served.
4. Autoscale the GPU node pool so node count tracks pending workload instead
   of sitting at a fixed size.
5. Explain why the platform layer is a distinct infrastructure-as-code
   problem from the serving layer, and where Pulumi's tooling is mature
   (cluster, drivers, autoscaling) versus absent (no first-party KServe or
   Ray Serve package).

## Layout

The numbered folders follow the demo's flow: the cluster and its GPU pool
(`01`), device visibility (`02`), quotas (`03`), autoscaling (`04`), a guided
look at the serving layer that sits above all of it (`05`), and teardown
(`06`).

```
ai-inference-platform-on-kubernetes/
├── README.md            this file
├── AGENTS.md            conventions for agents (and humans) editing this folder
├── .gitignore           keeps working docs, venvs and Pulumi state out of the repo
├── .shellcheckrc         shellcheck config shared by every script in this folder
├── 01-cluster/          VPC, EKS cluster, system node group, config-gated GPU node group (steps 1-2)
├── 02-device-plugin/    NVIDIA device plugin Helm release, exposes nvidia.com/gpu (step 3)
├── 03-quotas/           namespace, ResourceQuota, LimitRange, and a pod that must be rejected (step 4)
├── 04-autoscaling/      Karpenter IAM/SQS prerequisites, its Helm release, and a GPU NodePool (step 5)
├── 05-serving-layer/    illustrative-only KServe/Ray Serve manifests, not built or applied (step 6)
└── 06-teardown/         reverse-order destroy plus an orphaned-resource check (step 7)
```

Each numbered folder has its own `AGENTS.md` with its design notes and what
was and was not verified during this build; read it before changing that
folder.

## Prerequisites

- A [Pulumi Cloud](https://app.pulumi.com/signup?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
  account, or a self-managed state backend.
- AWS credentials for an account with quota for one `g5.xlarge` GPU
  instance in `us-west-2` (GPU instance quotas are commonly zero by default
  on a fresh account; request an increase before the live session).
- Python 3.9+, `pip`, and `pulumi` CLI ≥ 3.0.
- `kubectl` and `helm`, for inspecting the cluster during the demo.
- `aws` CLI, for `06-teardown/verify-clean.sh`'s orphan check.

## Run the demo

Seven beats, each a separate Pulumi project except the reverse-order
teardown at the end. Every project shares the `dev` stack name and reads
`aws:region: us-west-2` from its own `Pulumi.dev.yaml`.

```bash
# 1. cluster + system node group (step 1's end state)
cd 01-cluster
python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
pulumi stack init dev
pulumi up                                     # kubectl get nodes: healthy nodes, no GPU nodes yet
deactivate && cd ..

# 2. add the GPU node group (step 2's end state; same project, new config value)
cd 01-cluster && source venv/bin/activate
pulumi config set gpuNodeGroupEnabled true
pulumi up                                     # kubectl get nodes: the g5.xlarge node appears
deactivate && cd ..

# 3. install the NVIDIA device plugin
cd 02-device-plugin
python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
pulumi stack init dev
pulumi up                                     # kubectl describe node <gpu-node>: nvidia.com/gpu allocatable
deactivate && cd ..

# 4. namespace quota and the rejection demo
cd 03-quotas
python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
pulumi stack init dev
pulumi up
kubectl apply -f manifests/oversized-gpu-pod.yaml -n gpu-workloads   # rejected: exceeded quota
deactivate && cd ..

# 5. Karpenter and the scaling demo
cd 04-autoscaling
python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
pulumi stack init dev
pulumi up
kubectl apply -f manifests/gpu-inference-deployment.yaml -n gpu-workloads
kubectl scale deployment/gpu-echo -n gpu-workloads --replicas=2       # a new node should appear
kubectl scale deployment/gpu-echo -n gpu-workloads --replicas=0       # the node should be reclaimed
deactivate && cd ..

# 6. walk through 05-serving-layer/ (illustrative only, nothing to run)

# 7. teardown, in reverse dependency order, then confirm nothing is left behind
06-teardown/teardown.sh
06-teardown/verify-clean.sh
```

### Why steps 1 and 2 share one Pulumi project

`pulumi_eks.ManagedNodeGroup` takes a live `eks.Cluster` object (or
`CoreDataArgs`) as its `cluster` argument, never a name or ARN string, so the
GPU node group cannot be built in a separate Pulumi project that reads the
cluster through a `StackReference`. `01-cluster/AGENTS.md` has the full
reasoning and the registry link. The config flag `gpuNodeGroupEnabled`
preserves the step boundary attendees experience even though both live in
one program.

### Where the serving layer starts

`05-serving-layer/` is not built or applied during the demo. It exists so the
presenter can point at concrete manifests — a KServe `InferenceService`, a
Ray Serve `RayService` — and say plainly that Pulumi has no first-party
package for either today (confirmed against the Pulumi registry,
2026-09-24). A team that wants the serving layer as code would express it
through `pulumi_kubernetes`'s generic Helm and custom-resource APIs, the same
pattern `04-autoscaling` uses for Karpenter's CRDs, not a dedicated SDK.

## Sources

Facts in this workshop come from these pages, read on September 24, 2026:

- Pulumi EKS `Cluster`: https://www.pulumi.com/registry/packages/eks/api-docs/cluster/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops
- Pulumi EKS `ManagedNodeGroup` (decisive fact: takes a live cluster object): https://www.pulumi.com/registry/packages/eks/api-docs/managednodegroup/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops
- Pulumi Kubernetes Helm v4 `Chart`: https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops
- Pulumi blog, AI agents on Kubernetes: https://www.pulumi.com/blog/ai-agents-on-kubernetes/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops
- EKS Nodegroup AMI types (`AL2023_x86_64_NVIDIA`): https://docs.aws.amazon.com/eks/latest/APIReference/API_Nodegroup.html
- EKS supported Kubernetes versions: https://docs.aws.amazon.com/eks/latest/userguide/kubernetes-versions.html
- NVIDIA device plugin chart (0.20.0 pinned; 0.20.1 shipped 2026-09-22, after the brief was written): https://github.com/NVIDIA/k8s-device-plugin and https://artifacthub.io/packages/helm/nvidia-device-plugin/nvidia-device-plugin
- Karpenter getting started, NodePools, EC2NodeClasses: https://karpenter.sh/docs/getting-started/getting-started-with-karpenter/ , https://karpenter.sh/docs/concepts/nodepools/ , https://karpenter.sh/docs/concepts/nodeclasses/
- KServe and Ray Serve have no first-party Pulumi registry package (both registry URLs return 404, checked directly)

## Open questions

- **GKE variant**: deliberately out of scope for this build; the brief scopes this workshop to AWS/EKS only.
- **Device plugin vs. GPU Operator**: this build uses the NVIDIA device plugin as the brief's default, simpler path. The GPU Operator (26.7.0) is the brief's noted alternative for a team that also needs MIG, driver lifecycle management, or DCGM metrics; it is not built here.
- **Device plugin vs. Dynamic Resource Allocation (DRA)**: DRA needs Kubernetes 1.34+ and is not used here; the device plugin path is what the brief recommends for a 90-minute session.
- **KServe/Ray Serve packaging gap**: covered above and in `05-serving-layer/AGENTS.md`; there is no first-party Pulumi package for either as of 2026-09-24.
- **Grassroots signal**: the brief notes near-zero representation of this topic at DevOpsDays-scale community events, in contrast to its strong showing at KubeCon; worth weighing when deciding how to pitch this workshop beyond KubeCon.
