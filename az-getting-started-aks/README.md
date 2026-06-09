# Getting Started with AKS — Kube Kitties 🐱

A 60-minute, hands-on workshop: stand up an **AKS** cluster with Pulumi (C#),
push a container image into **Azure Container Registry**, and deploy a silly
"random cat" web app onto the cluster — all as code, no `kubectl apply`.

Then we explore the ways to *structure* Kubernetes workloads, and where to go
next (GitOps).

> Adapted from Adam's talk *[Kubernetes in ~10 minutes](https://www.youtube.com/watch?v=2P8JLgAc5QI)*
> (originally EKS + Python), ported to AKS + C#.

## Prerequisites

- An Azure subscription + Azure CLI (`az login`)
- Pulumi CLI + .NET 8 SDK
- Basic Kubernetes literacy (you know what a pod / deployment / service is —
  we don't teach Kubernetes, we teach how to run it on AKS with Pulumi)

## The stages

Each folder is a **complete, runnable checkpoint** — they're *alternative
snapshots*, not a strict accumulation. In the live demo we build in one folder;
these are the reference + take-home.

| Stage | What it shows |
|-------|---------------|
| **`01-cluster/`** | RG + AKS (1.33, Cilium/Dataplane V2) + ACR + the `AcrPull` role wiring + kubeconfig + Kubernetes provider. The "infrastructure is ready" checkpoint. |
| **`02-app/`** | `01` + the cat app (Deployment + LoadBalancer Service), image pulled from **your ACR** (`az acr import`, no local Docker). **The core — `pulumi up`, hit the IP, see the cat.** |
| **`03-split/`** | Split into two projects — `aks-cluster/` and `workload/` — joined by a **stack reference**. Slow-moving infra vs. fast-moving workload. |
| **`04-split-yaml/`** | Same split, but the workload is your **existing Kubernetes YAML** driven via `ConfigGroup` — the on-ramp for teams that already have manifests. |
| **`05-gitops/`** | *(take-home, not demoed)* Pulumi stands up the cluster + installs **Argo CD** + registers the cat as an Argo `Application`; Argo then reconciles the cat from git. Real, verified code. Points to the production-close GKE/Flux sequel. |

## Running a stage

> ⚠️ **Don't run every stage in sequence** — each `aks-cluster` is its own
> Pulumi stack, so running them back-to-back spins up multiple clusters (slow +
> costly). Follow the live build, or pick one stage.

Single-program stages (`01`, `02`):

```bash
cd 02-app
pulumi up
# grab the LoadBalancer IP and open it
curl http://$(pulumi stack output catServiceIp)/
pulumi destroy
```

Split stages (`03`, `04`) — bring the cluster up first, then the workload:

```bash
cd 03-split/aks-cluster && pulumi up        # creates AKS + ACR, exports kubeconfig
cd ../workload && pulumi up                 # stack-refs the cluster, deploys the cat
# ... and tear down in reverse: workload, then aks-cluster
```

The workload stacks read the cluster stack name from config
(`kube-kitties-workload:clusterStack`, set in `Pulumi.dev.yaml`).

## AKS-specific bits worth calling out

- **Cilium / Dataplane V2** — eBPF networking + network policy, on by default here.
- **ACR integration** — registry + cluster are both Azure resources; Pulumi wires
  the `AcrPull` permission to the cluster's kubelet identity. No image pull secrets.
- **Entra ID RBAC, managed add-ons, Workload Identity** — what AKS-the-managed-service
  adds on top of vanilla Kubernetes (slide material; Workload Identity is the AI-agent sequel).
