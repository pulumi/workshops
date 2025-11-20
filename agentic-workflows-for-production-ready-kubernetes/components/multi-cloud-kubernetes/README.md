# Multi-Cloud Kubernetes Component

A Pulumi component for creating Kubernetes clusters across AWS (EKS) and Azure (AKS) with built-in support for hub-and-spoke GitOps architecture using ArgoCD.

## Features

- **Multi-cloud**: Deploy EKS or AKS clusters with a unified interface
- **Hub-and-Spoke**: Built-in support for GitOps with ArgoCD
- **Auto Mode**: EKS Auto Mode and AKS Automatic for simplified operations
- **Unique Resources**: All resources are uniquely named for multi-instance support

## Usage

### Hub Cluster (with ArgoCD)

```go
hubCluster, err := NewKubernetesCluster(ctx, "hub", &KubernetesClusterArgs{
    Provider:    ProviderAzure,
    ClusterName: pulumi.String("hub-cluster"),
    Version:     pulumi.String("1.33.5"),
    Role:        RoleHub,
    Region:      pulumi.String("westeurope"),
})
```

### Spoke Cluster (managed by hub)

```go
spokeCluster, err := NewKubernetesCluster(ctx, "spoke", &KubernetesClusterArgs{
    Provider:      ProviderAWS,
    ClusterName:   pulumi.String("spoke-cluster"),
    Version:       pulumi.String("1.33"),
    Role:          RoleSpoke,
    Region:        pulumi.String("us-east-1"),
    HubKubeconfig: hubCluster.Kubeconfig,
    HubEndpoint:   hubCluster.Endpoint,
})
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Provider` | string | Yes | Cloud provider: `aws` or `azure` |
| `ClusterName` | string | No | Cluster name (defaults to resource name) |
| `Version` | string | No | Kubernetes version (default: 1.28) |
| `Role` | string | No | Cluster role: `hub` or `spoke` (default: spoke) |
| `Region` | string | No | Deployment region (default: us-east-1) |
| `HubKubeconfig` | string | No | Hub cluster kubeconfig (required for spoke) |
| `HubEndpoint` | string | No | Hub cluster endpoint (optional) |

## Outputs

| Output | Type | Description |
|--------|------|-------------|
| `Kubeconfig` | string | Cluster kubeconfig for access |
| `Endpoint` | string | Cluster API endpoint |
| `ClusterName` | string | Cluster name |
| `Provider` | string | Cloud provider used |

## Architecture

### Hub Cluster
- Installs ArgoCD for GitOps management
- Manages deployments to spoke clusters
- Default admin password: `admin123` (change in production)

### Spoke Cluster
- Creates service account for ArgoCD access
- Registers with hub cluster automatically
- Full cluster admin permissions for ArgoCD
