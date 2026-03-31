# AGENTS.md - Infrastructure (00-infrastructure)

## Overview

EKS-based multi-tenant Kubernetes platform using Pulumi TypeScript. Deploys a shared EKS cluster with Karpenter autoscaling and vCluster-based tenant isolation. GPU and standard workloads are separated via dedicated Karpenter NodePools.

## Architecture

### Host Cluster

- **EKS 1.32** in `eu-central-1` with API authentication mode
- **System nodes**: Managed node group (`m6i.large` x2) with `CriticalAddonsOnly` taint
- **Karpenter** manages all workload nodes via three NodePools:
  - `default-pool` - general workloads (`m5.large/xlarge/2xlarge`)
  - `vcluster-standard-pool` - standard vCluster workloads, label `workload-type=vcluster-standard`
  - `vcluster-gpu-pool` - GPU vCluster workloads (`g4dn.xlarge/2xlarge`, `g5.xlarge/2xlarge`), label `workload-type=vcluster-gpu`
- **NVIDIA Device Plugin** runs on GPU nodes only (nodeSelector + toleration for `nvidia.com/gpu`)
- **AWS Load Balancer Controller** for ALB/NLB ingress
- **EBS CSI Driver** with gp3 default StorageClass
- **Flux Operator v0.45.1** on all clusters (`web.enabled: true`, web UI on port 9080). Host gets LoadBalancer; vClusters use port-forward via vCluster kubeconfig
- **FluxInstance** CRD activating Flux controllers on each cluster
- **GitRepository + Kustomization** CRDs bootstrapping the `01-gitops/` monorepo

### vCluster Topology (driven by ESC)

7 vClusters defined in `esc/simulation.yaml`:

| vCluster | Pool | Node Sync |
|----------|------|-----------|
| platform-prod | standard | Virtual nodes (default) |
| platform-staging | standard | Virtual nodes (default) |
| team-frontend-dev | standard | Virtual nodes (default) |
| team-backend-dev | standard | Virtual nodes (default) |
| team-backend-staging | standard | Virtual nodes (default) |
| team-ml-dev | gpu | Real GPU nodes synced from host |
| team-ml-staging | gpu | Real GPU nodes synced from host |

### Node Sync Strategy

- **Standard vClusters**: Use vCluster's default virtual nodes. The control plane runs on the `vcluster-standard` node pool. Workload pods are synced to the host and scheduled on standard nodes automatically. No `sync.fromHost.nodes` needed.
- **GPU vClusters**: Sync real GPU nodes from the host via `sync.fromHost.nodes` with label selector `workload-type=vcluster-gpu`. This exposes GPU hardware (e.g., Tesla T4) inside the vCluster so pods can request `nvidia.com/gpu` resources. GPU tolerations are enforced on synced pods via `sync.toHost.pods.enforceTolerations`. Control plane still runs on standard nodes (no GPU wasted on the control plane).

## Key Files

| File | Purpose |
|------|---------|
| `index.ts` | Main Pulumi program - VPC, EKS, Karpenter, NodePools, vClusters |
| `src/components/vclusterComponent.ts` | VCluster ComponentResource - Helm release, LB exposure, DNS wait, optional Flux |
| `src/components/karpenterComponent.ts` | Karpenter controller + EC2NodeClass factory |
| `src/components/karpenterNodePoolComponent.ts` | Karpenter NodePool CRD wrapper |
| `src/components/awsLbControllerComponent.ts` | AWS LB Controller Helm + IAM |
| `src/components/fluxOperatorComponent.ts` | Flux Operator Helm chart - namespace + release |
| `src/components/fluxInstanceComponent.ts` | FluxInstance CRD - activates Flux controllers |
| `src/components/fluxGitOpsComponent.ts` | GitRepository + Kustomization - bootstraps GitOps from 01-gitops/ |
| `esc/simulation.yaml` | ESC environment defining vCluster topology |
| `Pulumi.dev.yaml` | Dev stack config (references ESC envs `pulumi-idp/auth` + `simulation`) |

## Commands

### Prerequisites

```bash
# AWS credentials via ESC (required for all kubectl/pulumi commands)
pulumi env run pulumi-idp/auth -- <command>
```

### Deploy

```bash
cd zero-to-production-in-kubernetes/00-infrastructure

# Preview changes
pulumi preview

# Deploy
pulumi up --yes
```

### Config Values

| Key | Description |
|-----|-------------|
| `clusterName` | EKS cluster name |
| `gitRepoUrl` | Git repository URL for Flux GitOps (set in `Pulumi.dev.yaml`) |

### ESC Environment Setup

```bash
# Create ESC environment (one-time)
pulumi env init zero-to-production-in-kubernetes-infra/simulation

# Update ESC environment from file
pulumi env edit zero-to-production-in-kubernetes-infra/simulation -f esc/simulation.yaml

# Verify ESC resolves correctly
pulumi env open zero-to-production-in-kubernetes-infra/simulation
```

### Kubectl Access

```bash
# Save kubeconfig from stack output
pulumi stack output kubeconfig --show-secrets > /tmp/kubeconfig.yaml

# All kubectl commands need AWS creds via ESC
pulumi env run pulumi-idp/auth -- kubectl --kubeconfig /tmp/kubeconfig.yaml <command>
```

### Verification Checklist

```bash
KC="--kubeconfig /tmp/kubeconfig.yaml"
RUN="pulumi env run pulumi-idp/auth --"

# 1. Verify 7 vc-* namespaces
$RUN kubectl $KC get ns | grep vc-

# 2. Verify all 7 vCluster pods running
$RUN kubectl $KC get pods -A | grep -E "\-0\s"

# 3. Verify 7 kubeconfig secrets
$RUN kubectl $KC get secrets -A | grep kubeconfig

# 4. Verify vCluster LB Services have external addresses
$RUN kubectl $KC get svc -A -l app=vcluster --no-headers | grep LoadBalancer

# 5. Verify GPU vClusters are on GPU nodes
$RUN kubectl $KC get pods -A -o wide | grep -E "team-ml-(dev|staging)-0"
$RUN kubectl $KC get node <node-name> -o jsonpath='{.metadata.labels}' | python3 -m json.tool | grep -E "instance-type|gpu|workload-type"

# 6. Test vCluster access via NLB (no port-forward needed)
$RUN kubectl $KC -n vc-platform-prod get secret vc-platform-prod-kubeconfig -o jsonpath='{.data.config}' | base64 -d > /tmp/vc-prod.yaml
kubectl --kubeconfig /tmp/vc-prod.yaml --insecure-skip-tls-verify get ns
# Expect: default, kube-system, etc.
```

## Flux Verification

```bash
KC="--kubeconfig /tmp/kubeconfig.yaml"
RUN="pulumi env run pulumi-idp/auth --"

# Verify Flux Operator running on host
$RUN kubectl $KC -n flux-system get pods -l app.kubernetes.io/name=flux-operator

# Verify FluxInstance ready on host
$RUN kubectl $KC -n flux-system get fluxinstances

# Verify GitRepository reconciled
$RUN kubectl $KC -n flux-system get gitrepositories

# Verify Kustomizations applied
$RUN kubectl $KC -n flux-system get kustomizations

# Verify Web UI accessible
$RUN kubectl $KC -n flux-system get svc flux-web-lb
```

## VCluster Component Interface

```typescript
interface VClusterComponentArgs {
    vclusterName: string;           // e.g., "team-ml-dev"
    pool: "standard" | "gpu";       // Determines node sync strategy
    chartVersion?: string;          // Default: "0.33.1"
    chartRepository?: string;       // Default: "https://charts.loft.sh"
    flux?: {                        // Optional: deploy Flux inside the vCluster
        gitRepoUrl: string;
        gitRepoBranch?: string;
        clusterPath: string;
    };
}
```

- `pool: "standard"` -> virtual nodes, control plane on standard pool, no host node sync
- `pool: "gpu"` -> real GPU nodes synced from host, control plane on standard pool, GPU tolerations enforced
- `flux` -> deploys FluxOperator + FluxInstance + GitOps inside the vCluster using corrected kubeconfig

### vCluster External Access

Each vCluster API server is exposed via an internet-facing AWS NLB (`controlPlane.service.spec.type: LoadBalancer`). The component handles the full readiness chain:

1. **Helm release** deploys the vCluster StatefulSet + LB Service
2. **SSA-patched Secret** with `pulumi.com/waitFor: jsonpath={.data.config}` blocks until the kubeconfig is populated
3. **SSA-patched Service** with `pulumi.com/waitFor: jsonpath={.status.loadBalancer.ingress[0].hostname}` blocks until the LB has an address
4. **DNS polling** (`waitForDns`) retries DNS resolution (30x @ 10s) before creating the k8s.Provider, preventing "no such host" errors from AWS DNS propagation lag
5. **Kubeconfig rewrite** replaces `localhost:8443` with the actual LB hostname

## Adding a New vCluster

1. Add entry to `esc/simulation.yaml`:
   ```yaml
   - name: team-data-dev
     pool: standard   # or "gpu"
   ```
2. Push ESC update: `pulumi env edit zero-to-production-in-kubernetes-infra/simulation -f esc/simulation.yaml`
3. Deploy: `pulumi up`

## Boundaries

- **Control plane always on standard nodes** - never waste GPU for vCluster control planes
- **GPU nodes only synced into GPU vClusters** - standard vClusters never see GPU nodes
- **ESC drives topology** - vCluster list is config, not code; change `simulation.yaml` to add/remove tenants
- **Karpenter autoscales** - nodes are provisioned on demand, no static node groups for workloads
- **vCluster API via NLB** - each vCluster gets an internet-facing NLB; Pulumi manages from local machine
