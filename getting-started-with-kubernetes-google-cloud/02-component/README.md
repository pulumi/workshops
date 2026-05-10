# gke-workshop

A reusable, production-close GKE cluster as a single Pulumi
[ComponentResource](https://www.pulumi.com/docs/iac/concepts/resources/components/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops).

Wraps a private regional GKE cluster, three node pools (system /
workload / workload-spot), Dataplane V2 with Hubble relay, Backup for
GKE, and a kubernetes Provider built from the cluster's endpoint + CA +
a short-lived OAuth token.

The cluster itself is the
[`terraform-google-modules/kubernetes-engine//modules/private-cluster`](https://registry.terraform.io/modules/terraform-google-modules/kubernetes-engine/google/latest)
module imported via Pulumi's
[`pulumi package add terraform-module`](https://www.pulumi.com/docs/iac/guides/building-extending/using-existing-tools/use-terraform-module/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
bridge — no rewrite of the upstream module needed.

## Usage

After `pulumi package add` from a consumer:

```ts
import * as gcp from "@pulumi/gcp";
import { GkeWorkshopCluster } from "@pulumi/gke-workshop";

const cluster = new GkeWorkshopCluster("workshop", {
  projectId: gcp.config.project!,
  region: "europe-west1",
});

export const clusterName = cluster.clusterName;
export const kubeconfig = cluster.kubeconfig;
```

That single call provisions VPC + subnet + Cloud Router + NAT + GKE
cluster (3 zones) + 3 node pools + Dataplane V2 metrics + Backup-for-GKE
plan + a `k8s.Provider`. The consumer can use `cluster.k8sProvider`
directly to build kubernetes resources on top.

## Inputs

| Field | Type | Default | Required |
|---|---|---|---|
| `projectId` | `Input<string>` | — | yes |
| `region` | `Input<string>` | — | yes |
| `clusterName` | `Input<string>` | `"gke-workshop"` | |
| `vpcCidr` | `Input<string>` | `"10.10.0.0/20"` | |
| `podsCidr` | `Input<string>` | `"10.20.0.0/14"` | |
| `servicesCidr` | `Input<string>` | `"10.24.0.0/20"` | |
| `masterCidr` | `Input<string>` | `"172.16.0.0/28"` | |
| `nodeMachineType` | `Input<string>` | `"e2-standard-4"` | |
| `nodeMinCount` | `Input<number>` | `1` | |
| `nodeMaxCount` | `Input<number>` | `5` | |
| `enableSpotPool` | `Input<boolean>` | `true` | |
| `enableBackup` | `Input<boolean>` | `true` | |
| `backupRetentionDays` | `Input<number>` | `7` | |
| `backupCronSchedule` | `Input<string>` | `"0 2 * * *"` | |
| `enableDataplaneV2Metrics` | `Input<boolean>` | `true` | |
| `enableManagedPrometheus` | `Input<boolean>` | `true` | |

## Outputs

| Field | Type |
|---|---|
| `clusterId`, `clusterName`, `clusterEndpoint`, `clusterCaCertificate` | `Output<string>` |
| `vpcName`, `subnetName` | `Output<string>` |
| `kubeconfig` | `Output<string>` (secret) |
| `kubeconfigPath` | `Output<string>` — path on disk where the kubeconfig YAML is written at apply time |
| `k8sProvider` | `k8s.Provider` — pass to dependent kubernetes resources |
| `backupPlanId` | `Output<string \| undefined>` |

## What's intentionally NOT in the component

- **Vertex AI / IAM bindings** — workshop-specific GSA + Workload
  Identity wiring lives in the consumer.
- **Flux GitOps** — operational choice, not infra.
- **Monitoring dashboards** — consumer policy.

These all stay in the consumer so the component remains a clean,
reusable cluster abstraction.

## Local setup (first checkout)

The TF-module SDK at `sdks/gke/` is gitignored and must be regenerated
on a fresh clone:

```bash
cd 02-component
npm install
pulumi package add terraform-module \
  terraform-google-modules/kubernetes-engine/google//modules/private-cluster \
  44.0.0 gke
npx tsc --noEmit   # type-check
```

## Publish (private registry)

Tag a release and `pulumi package publish` against the monorepo subpath:

```bash
git tag gke-workshop-v0.1.0
git push origin gke-workshop-v0.1.0
pulumi package publish \
  https://github.com/pulumi/workshops/getting-started-with-kubernetes-google-cloud/02-component@0.1.0 \
  --publisher lumitorch --readme ./README.md
```

The matching consumer reference in `00-infrastructure/Pulumi.yaml`:

```yaml
packages:
  gke-workshop: https://github.com/pulumi/workshops/getting-started-with-kubernetes-google-cloud/02-component@0.1.0
```
