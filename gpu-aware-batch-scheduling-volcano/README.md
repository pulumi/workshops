# GPU-aware batch scheduling for AI training on Kubernetes with Pulumi

> Distributed training jobs need every pod at once, and a training team should
> not starve out the rest of the cluster. This workshop provisions the
> Volcano batch scheduler with Pulumi, shows Kubernetes' default scheduler
> failing both requirements, then shows Volcano fixing them — gang scheduling
> so a job never half-starts, per-team queues so an over-quota team waits
> instead of crowding everyone else out, and (optionally, with real GPU
> hardware) one GPU shared safely across two jobs via Dynamic Resource
> Allocation.

## Sessions and speakers

No date is committed yet — this workshop is not currently scheduled at an
event. Sessions and speakers are unknown until it is booked.

## What attendees learn

1. Why the default Kubernetes scheduler is insufficient for distributed AI
training jobs: no gang scheduling, no fair-share queueing across teams, no
GPU-fraction awareness.
2. How to provision a Kubernetes cluster and the Volcano scheduler with
Pulumi, in a single `pulumi up`.
3. How a Volcano job's `minAvailable` enforces gang scheduling: a job requesting
more pods than the cluster can host stays entirely `Pending`, never
partially started.
4. How a Volcano `Queue`'s `capability` enforces fair-share: an over-quota
team's job waits while an under-quota team's job runs.
5. How Dynamic Resource Allocation (DRA) makes fractional GPU sharing
possible, and where that stands today (real GPU hardware and a live segment
if quota was secured ahead of time; a recorded segment and an explanation
otherwise — see "GPU quota" below).

## Layout

```
01-cluster/         # kind cluster (CPU-only) + Volcano scheduler via its Helm chart
02-queues/           # two Volcano Queue objects: two simulated teams, different weights/limits
03-gang-scheduling/  # a vcjob whose minAvailable exceeds capacity: all pods Pending together
04-fair-share/       # two vcjobs across the two queues: the over-quota team's job waits
05-gpu-dra/          # optional, cloud: one real GPU node + NVIDIA DRA driver + fractional sharing
06-teardown/         # pulumi destroy in reverse, plus an explicit GPU-node-group-gone check
```

Each numbered folder is a self-contained Pulumi TypeScript project (own
`Pulumi.yaml`, own `package.json`). 01-04 depend on each other's stack
outputs (the kind cluster's kubeconfig context, the queue names); 05 is
independent and optional.

## Prerequisites

- Node.js 22+, npm
- The [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops), logged in to a backend of your choice
- [Docker](https://docs.docker.com/get-docker/) and [`kind`](https://kind.sigs.k8s.io/) v0.33.0+ (steps 01-04; kind provisions a local Kubernetes cluster in Docker, no cloud account needed)
- `kubectl` and `helm` on your PATH
- For step 05 only: an AWS account, AWS credentials configured for Pulumi, and GPU instance quota (see "GPU quota" below)

## GPU quota — read this before the session, not during it

Step 05 requests one `g4dn.xlarge` GPU instance via `aws.eks.NodeGroup`. Most
new or lightly-used AWS accounts start with a GPU instance vCPU quota of
**zero**, and a quota increase for GPU instance families
(`Running On-Demand G and VT instances`) commonly requires an AWS Support
case, not just a self-service console request, and can take from minutes to a
day or two to approve. Request the increase at least several days before the
session.

If the quota is not approved in time, do not run step 05 live. Play a
recording of the segment instead and say so to the audience — do not silently
drop learning outcome 5. This demo's code and this README are both built so
that decision is easy to make on the day: step 05 is fully separate from
01-04, and its teardown (`06-teardown/down-gpu.sh`) is a one-line call whether
or not the segment ran.

## Run the demo

Steps 01-04 are local and free (kind runs entirely on your machine). Step 05
is optional, cloud-hosted, and billed by AWS while it runs.

```bash
# 1. cluster + scheduler
cd 01-cluster && npm install
pulumi stack init dev
pulumi up
cd ..
# verify: kubectl --context kind-gpu-batch-demo get pods -n volcano-system
#   -> scheduler, controller and admission pods all Running

# 2. two team queues
cd 02-queues && npm install
pulumi stack init dev
pulumi up
cd ..
# verify: kubectl --context kind-gpu-batch-demo get queue
#   -> team-a and team-b both Open

# 3. gang scheduling: a job asking for more pods than the cluster can host
cd 03-gang-scheduling && npm install
pulumi stack init dev
pulumi up
cd ..
# verify: kubectl --context kind-gpu-batch-demo get pods
#   -> all gang-demo pods Pending together, never partially started

# 4. fair share: one job per queue, one over quota
cd 04-fair-share && npm install
pulumi stack init dev
pulumi up
cd ..
# verify: kubectl --context kind-gpu-batch-demo get vcjob
#   -> under-quota Running, over-quota queued/Pending

# 5. optional, cloud: one real GPU shared by two pods via DRA
#    (see "GPU quota" above -- provision this well ahead of the session)
cd 05-gpu-dra && npm install
pulumi stack init dev
pulumi up
cd ..
# verify: kubectl get pods -n default
#   -> gpu-share-a and gpu-share-b both Running on the one GPU node

# teardown, in reverse -- 04 first, 01's kind cluster last
06-teardown/down.sh
# and, if step 5 was run:
06-teardown/down-gpu.sh
```

## Sources

- Volcano releases: https://github.com/volcano-sh/volcano/releases — v1.15.2 is current (v1.15.0/v1.15.1 carry a disclosed DRA-capacity-accounting DoS, GHSA-j38h-7pfq-cxmw); read 2026-09-27.
- Volcano introduction and CNCF status: https://volcano.sh/en/docs/Home/Introduction; read 2026-09-27.
- Volcano Queue concept and CRD (`scheduling.volcano.sh/v1beta1`): https://volcano.sh/en/docs/Concepts/Queue; read 2026-09-27.
- Volcano Job/vcjob concept and CRD (`batch.volcano.sh/v1alpha1`): https://volcano.sh/en/docs/Concepts/VolcanoJob; read 2026-09-27.
- Volcano Helm chart install: `helm repo add volcano-sh https://volcano-sh.github.io/helm-charts` — confirmed via multiple independent installation guides; the exact chart version was not independently confirmable this run (see "Open questions"), so `pulumi preview` (which resolves the chart at build time) is how this repo verifies it rather than a hardcoded version pin.
- kind releases and node images: https://github.com/kubernetes-sigs/kind/releases — v0.33.0, defaulting to Kubernetes v1.37.0; read 2026-09-27.
- Kubernetes Dynamic Resource Allocation: https://kubernetes.io/docs/concepts/scheduling-eviction/dynamic-resource-allocation/ — `resource.k8s.io/v1`, stable since Kubernetes v1.35; read 2026-09-27.
- Kubernetes DRA device allocation walkthrough (ResourceClaimTemplate/Pod pattern): https://kubernetes.io/docs/tasks/configure-pod-container/assign-resources/allocate-devices-dra/; read 2026-09-27.
- NVIDIA's Kubernetes DRA GPU driver (donated to kubernetes-sigs, April 2026): https://dra-driver-nvidia-gpu.sigs.k8s.io/docs/install/ — chart `oci://registry.k8s.io/dra-driver-nvidia/charts/dra-driver-nvidia-gpu`, version 0.5.0; read 2026-09-27.
- NVIDIA DRA driver time-slicing guide (Alpha feature gate `TimeSlicingSettings`): https://dra-driver-nvidia-gpu.sigs.k8s.io/docs/guides/gpu-allocation/time-slicing/; read 2026-09-27.
- EKS DRA support and current Kubernetes version lifecycle: https://aws.amazon.com/blogs/containers/unlocking-next-generation-ai-performance-with-dynamic-resource-allocation-on-amazon-eks-and-amazon-ec2-p6e-gb200/ and https://docs.aws.amazon.com/eks/latest/userguide/kubernetes-versions.html; read 2026-09-27.
- `g4dn.xlarge` on-demand price (us-east-1, ~$0.526/hr): https://instances.vantage.sh/aws/ec2/g4dn.xlarge; read 2026-09-27.
- Pulumi Kubernetes provider — `helm.v4.Chart`, `apiextensions.CustomResource`, provider `renderYamlToDirectory`: https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops, https://www.pulumi.com/registry/packages/kubernetes/api-docs/apiextensions/customresource/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops, https://www.pulumi.com/registry/packages/kubernetes/api-docs/provider/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops; read 2026-09-27.
- Pulumi Command provider — `command.local.Command`: https://www.pulumi.com/registry/packages/command/api-docs/local/command/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops; read 2026-09-27.
- Pulumi AWS provider — `aws.eks.NodeGroup` (current, not deprecated): https://www.pulumi.com/registry/packages/aws/api-docs/eks/nodegroup/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops; read 2026-09-27.

## Open questions for review

- Volcano over Armada and Kueue is this builder's judgment (Volcano's CNCF status and its own KubeCon NA 2026 session on unified scheduling for the "Agentic AI Era"), not a settled comparison across all three projects — the brief only weighed evidence for the theme, not the specific scheduler. A reviewer may want a different pick.
- The exact Volcano Helm chart *version* (as opposed to the app version v1.15.2) could not be independently confirmed from a source this run could read (artifacthub.io's chart page is JS-rendered; a direct fetch of the chart's `Chart.yaml` did not return content). `pulumi preview` in 01-cluster resolves whatever is currently published under `volcano-sh/volcano` with no version pinned — confirm and pin the version once `helm search repo volcano-sh/volcano --versions` can be run against a live Helm repo.
- Capacity numbers in 02-queues/03-gang-scheduling/04-fair-share (weights, CPU/memory capability, pod counts) are illustrative and sized for a kind cluster on a presenter's laptop. Rehearse them against the room's actual compute budget before the session.
- Fractional GPU sharing via DRA time-slicing is gated behind an Alpha feature (`TimeSlicingSettings`), disabled by default on the NVIDIA DRA driver — call this out live as an evolving, not-yet-GA capability, not a production-ready default.

## Confidence

Medium confidence in the topic: the brief's own evidence is theme-level (two
adjacent CNCF-area projects each with one supporting signal, plus eight
KubeCon NA 2026 session titles on the general topic), not a single strong
signal for this exact demo. High confidence in the mechanics: every resource
shape, CRD `apiVersion`, and Pulumi construct above was read from current
upstream docs this run (not from memory) and, where offline verification was
possible, exercised with a real `pulumi up`/`preview` and its output inspected
— see the pull request for exactly what ran and what did not.
