# 00-infrastructure — Pulumi consumer

Pulumi TypeScript program that deploys the workshop's GKE cluster, Vertex AI
IAM, Flux GitOps bootstrap, custom Cloud Monitoring dashboard, and writes
the kubeconfig to disk.

The cluster itself comes from the published
[`lumitorch/gke-workshop`](https://github.com/pulumi/workshops/tree/main/getting-started-with-kubernetes-google-cloud/02-component)
component (in the lumitorch private registry). This program is the
consumer — see `index.ts`.

## Layout

```
00-infrastructure/
├── Pulumi.yaml             project file (references gke-workshop@0.6.0)
├── Pulumi.dev.yaml         dev stack — references ESC env for GCP creds
├── index.ts                ~210 lines: cluster + IAM + Flux + dashboard
├── dashboards/
│   └── gke_overview.json   custom dashboard template (cluster_name substitution)
├── package.json
├── tsconfig.json
└── kubeconfig              written by Pulumi at apply time (gitignored)
```

## Prerequisites

- [Pulumi CLI](https://www.pulumi.com/docs/install/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) ≥ 3.237
- Node ≥ 18
- Logged into Pulumi Cloud as a member of the `lumitorch` org (the dev stack lives there so the ESC env reference resolves)
- Same GCP API surface as the parent workshop — see [`../README.md`](../README.md)

## Setup

```bash
cd 00-infrastructure
npm install
pulumi stack select lumitorch/dev
```

`Pulumi.yaml` already references the published `gke-workshop` component;
`pulumi install` (run automatically by `npm install`) generates the local
SDK from the registry.

## Deploy

```bash
pulumi up --stack lumitorch/dev
```

Roughly 10–12 minutes from empty project to fully reconciled apps. The
ESC env `cloud-creds/gcp-dev-sandbox` referenced in `Pulumi.dev.yaml`
provides short-lived OAuth credentials — no `gcloud auth login` and no
SA JSON keys.

## Smoke test

After `pulumi up` returns, run the steps in [`../DEMO.md`](../DEMO.md).
Expected end state: 7 nodes (system × 3, workload × 3, workload-spot × 1),
3 Flux Kustomizations Ready=True, ADK agent + podinfo + Flux UI on
public LBs.

## Two production-close patterns worth noting

The kubernetes Provider in `index.ts` is configured with two flags that
matter once the cluster is alive:

```ts
new k8s.Provider("gke", {
  kubeconfig: cluster.kubeconfig,
  clusterIdentifier: cluster.clusterId,   // pin provider identity to cluster
  deleteUnreachable: true,                // safe destroy when API is gone
});
```

- **`clusterIdentifier`** — the kubeconfig embeds a short-lived OAuth token
  that re-evaluates on every `pulumi up`. Without `clusterIdentifier`,
  Pulumi hashes the kubeconfig string and treats token rotation as a
  Provider replacement, which cascades into `+ create` diffs for every
  dependent kubernetes resource. With the cluster ID pinned, kubeconfig
  changes become in-place updates.
- **`deleteUnreachable`** — during `pulumi destroy`, if the GKE API is
  unreachable mid-tear-down (cluster deletion races ahead in the same
  destroy), kubernetes resources get dropped from state instead of
  erroring. Pairs with `retainOnDelete: true` on both Helm releases.

## Stack outputs

| Output | What |
|---|---|
| `cluster_name` | GKE cluster name |
| `region_out` | GCP region |
| `git_cluster_path_out` | path Flux reconciles inside the GitOps repo |
| `dashboard_url` | direct link to the custom Cloud Monitoring dashboard |
| `kubeconfig_path` | path to the kubeconfig file written by Pulumi (use as `KUBECONFIG`) |
| `kubeconfig_out` | full kubeconfig YAML (sensitive — `pulumi stack output --show-secrets`) |
| `backup_plan_id` | full resource path of the daily Backup-for-GKE plan |

## Refreshing the kubeconfig token

The OAuth token in the kubeconfig has ~1h TTL. After it expires:

```bash
pulumi up --skip-preview --yes --stack lumitorch/dev
export KUBECONFIG=$(pulumi stack output kubeconfig_path --stack lumitorch/dev)
```

Re-running `pulumi up` re-evaluates `getClientConfigOutput()`, mints a
fresh token, and rewrites the kubeconfig file on disk. The
`clusterIdentifier` flag makes this a clean no-op for the kubernetes
resources.

## Teardown

```bash
pulumi destroy --stack lumitorch/dev
```

Both Helm releases are flagged `retainOnDelete: true`, so destroy never
calls `helm uninstall` and never blocks on FluxInstance finalizers — the
cluster goes away and the in-cluster artifacts go with it. If a destroy
hangs anyway, see the recovery steps in [`../DEMO.md`](../DEMO.md).
