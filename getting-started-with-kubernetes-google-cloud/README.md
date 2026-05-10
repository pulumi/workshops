# Getting Started with Kubernetes on Google Cloud

A 60-minute, hands-on workshop that stands up a **production-close** GKE
cluster — node pool isolation, Pod Security Admission, NetworkPolicies,
Backup for GKE, GitOps and observability — and deploys an AI agent end-to-end
without a single `kubectl apply`.

---

## Live URLs (during the workshop)

Project: **`pulumi-development`** · Cluster: **`gke-workshop`** · Region: **`europe-west1`**

### Dashboards

- **Custom workshop dashboard** ("GKE Workshop — Overview") — single URL is in `pulumi stack output dashboard_url` after apply. Tiles: node count, HPA current vs. desired, pod count by namespace, container restart rate, API-server p95 latency, Podinfo HTTP rate (Managed Prometheus).
- All dashboards — https://console.cloud.google.com/monitoring/dashboards?project=pulumi-development
- GKE pre-built dashboards (cluster / workloads / namespaces) — https://console.cloud.google.com/monitoring/dashboards/integration/kubernetes-engine?project=pulumi-development

### Cluster & workloads (GKE UI)

- Cluster overview — https://console.cloud.google.com/kubernetes/clusters/details/europe-west1/gke-workshop?project=pulumi-development
- Node pools (`system` / `workload` / `workload-spot`) — https://console.cloud.google.com/kubernetes/clusters/details/europe-west1/gke-workshop/nodes?project=pulumi-development
- Workloads — https://console.cloud.google.com/kubernetes/workload?project=pulumi-development
- Services & Ingress — https://console.cloud.google.com/kubernetes/discovery?project=pulumi-development
- Cluster security posture (PSA, NetworkPolicy, image config) — https://console.cloud.google.com/kubernetes/clusters/details/europe-west1/gke-workshop/security?project=pulumi-development
- Observability tab (live signals view) — https://console.cloud.google.com/kubernetes/clusters/details/europe-west1/gke-workshop/observability?project=pulumi-development

### Backup for GKE

- Backup plans — https://console.cloud.google.com/kubernetes/backups/plans?project=pulumi-development
- Backups — https://console.cloud.google.com/kubernetes/backups?project=pulumi-development

### Logs

- All cluster pods — https://console.cloud.google.com/logs/query;query=resource.type%3D%22k8s_container%22%20resource.labels.cluster_name%3D%22gke-workshop%22?project=pulumi-development
- ADK agent only — https://console.cloud.google.com/logs/query;query=resource.type%3D%22k8s_container%22%20resource.labels.namespace_name%3D%22adk%22?project=pulumi-development
- Podinfo only — https://console.cloud.google.com/logs/query;query=resource.type%3D%22k8s_container%22%20resource.labels.namespace_name%3D%22podinfo%22?project=pulumi-development
- Flux controllers — https://console.cloud.google.com/logs/query;query=resource.type%3D%22k8s_container%22%20resource.labels.namespace_name%3D%22flux-system%22?project=pulumi-development
- Cluster API audit — https://console.cloud.google.com/logs/query;query=resource.type%3D%22k8s_cluster%22%20resource.labels.cluster_name%3D%22gke-workshop%22?project=pulumi-development

### Metrics

- Metrics Explorer (PromQL + MQL) — https://console.cloud.google.com/monitoring/metrics-explorer?project=pulumi-development
- Workload metrics — https://console.cloud.google.com/kubernetes/workload_metrics?project=pulumi-development

Useful PromQL one-liners (paste into Metrics Explorer in PromQL mode):

```promql
# Podinfo HTTP rate scraped by Managed Prometheus
sum by (status) (rate(http_requests_total{namespace="podinfo"}[1m]))

# Pod restart rate per namespace, last 5 min
sum by (namespace) (rate(kube_pod_container_status_restarts_total[5m]))

# HPA current vs desired
kubernetes_io:autoscaler_horizontal_pod_autoscaler_replicas_current{namespace_name="podinfo"}
kubernetes_io:autoscaler_horizontal_pod_autoscaler_replicas_desired{namespace_name="podinfo"}
```

### Identity & Vertex AI

- IAM service accounts — https://console.cloud.google.com/iam-admin/serviceaccounts?project=pulumi-development
- `adk-vertex` GSA (the WI-bound identity) — https://console.cloud.google.com/iam-admin/serviceaccounts/details/adk-vertex@pulumi-development.iam.gserviceaccount.com?project=pulumi-development
- Vertex AI Studio — https://console.cloud.google.com/vertex-ai/studio/freeform?project=pulumi-development
- Vertex AI Model Garden — https://console.cloud.google.com/vertex-ai/model-garden?project=pulumi-development
- Cloud Trace (ADK OTel spans) — https://console.cloud.google.com/traces/list?project=pulumi-development

### Live endpoints

LB IPs are assigned after Flux reconciles the Services — pull them with kubectl:

```bash
export KUBECONFIG=$(pulumi stack output kubeconfig_path)

FLUX_IP=$(kubectl -n flux-system get svc flux-web-lb -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
ADK_IP=$(kubectl -n adk get svc adk-agent -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
PODINFO_IP=$(kubectl -n podinfo get svc podinfo -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

echo "Flux UI:        http://$FLUX_IP/"
echo "ADK web UI:     http://$ADK_IP/dev-ui/"
echo "ADK Swagger:    http://$ADK_IP/docs"
echo "Podinfo:        http://$PODINFO_IP:9898"
```

> Both the Flux UI and the ADK agent are reachable on **public anycast LBs without auth** for workshop convenience. Production posture is to drop the matching `allow-ingress-*-external` NetworkPolicies and front the services with IAP, a VPN, or `kubectl port-forward`. The YAML comments in `01-gitops/` call this out.

---

## What you build

| Pillar | What goes in |
|---|---|
| Cluster | GKE Standard regional (3 zones), private nodes, Dataplane V2 (Cilium/eBPF) with metrics + Hubble relay, Workload Identity, Shielded Nodes, release channel `REGULAR` |
| Node pools | `system` (small, taint `gke-managed-components` for DNS/csi/metrics agents) · `workload` (e2-standard-4, autoscaled 1–5) · `workload-spot` (Spot VMs, autoscaled 0–5 — fault-tolerant batch only) |
| Autoscaler | Cluster Autoscaler per pool, HPA + VPA, HPA on the sample app (2–10 replicas, 50% CPU) |
| Monitoring | Cloud Monitoring full GKE observability set + Managed Prometheus (PodMonitoring scrape on Podinfo and the ADK agent) |
| Logging | Cloud Logging — system + workloads + control plane (apiserver/scheduler/controller-manager) |
| Backup/DR | Backup for GKE addon + daily backup plan, 7-day retention, cross-region/cross-project restore capable |
| Security | Pod Security Admission (`restricted` on `adk`, `baseline`+audit-restricted on `podinfo`), per-namespace NetworkPolicies with default-deny, CiliumClusterwideNetworkPolicy locking down GCE metadata server, ResourceQuota + LimitRange per namespace |
| GitOps | Flux Operator chart + Flux Instance chart (no kubectl bootstrap step) reconciling [Podinfo](https://github.com/stefanprodan/podinfo) and the ADK agent into the cluster |
| AI | Google ADK on Vertex AI / Gemini 2.5 Flash via Workload Identity (no API keys) |
| Network | Custom VPC, /20 subnet with secondary ranges, Cloud Router, Cloud NAT |

## Layout

```
00-infrastructure/   Pulumi (TypeScript) — VPC, GKE cluster (Dataplane V2,
                                           3 pools), Backup-for-GKE plan,
                                           Vertex AI IAM, Flux operator +
                                           instance Helm releases,
                                           dashboard, kubeconfig
01-gitops/           Flux YAML reconciled into the cluster:
                       infrastructure/base/  flux-web-lb,
                                             cilium-clusterwide-policy,
                                             flux-web-allow-external
                       apps/base/podinfo     (HelmRelease + PSA + quotas
                                              + NetworkPolicies)
                       apps/base/adk-agent   (Deployment + KSA + Service
                                              + PSA + quotas + NetworkPolicies)
adk-agent/           Source for the ADK agent image (Dockerfile +
                     capital_agent demo from the official ADK tutorial).
```

The `01-gitops/` directory is the only part that has to live on `main` — the
Flux `GitRepository` Pulumi creates pulls from there. Iterate freely on
`00-infrastructure/` locally; commit `01-gitops/` to `main` once to bootstrap,
then reconciliation is hands-off.

The ADK agent runs on **Google Vertex AI / Gemini 2.5 Flash**. No API keys:
the KSA `adk/adk-agent` is annotated with the `adk-vertex` GSA email Pulumi
creates, and GKE Workload Identity does the rest. Cluster-specific values
(`gcp_project_id`, `cluster_name`) are injected at reconcile time via Flux's
`postBuild.substituteFrom` against a `cluster-vars` `ConfigMap` Pulumi
provisions in `flux-system`.

> The cluster itself is created via the
> [`terraform-google-modules/kubernetes-engine//modules/private-cluster`](https://registry.terraform.io/modules/terraform-google-modules/kubernetes-engine/google/latest)
> module, imported into Pulumi as a typed component via
> [`pulumi package add terraform-module`](https://www.pulumi.com/docs/iac/guides/building-extending/using-existing-tools/use-terraform-module/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops).
> No rewrite of the upstream module needed. The generated SDK lives under
> `00-infrastructure/sdks/gke/` (gitignored) and is regenerated by
> `pulumi package add` on first setup.

## Prerequisites

- Google Cloud project with billing enabled and these APIs on:
  `container`, `compute`, `monitoring`, `logging`, `iam`, `iamcredentials`,
  `cloudresourcemanager`, `aiplatform`, `cloudtrace`, `gkebackup`
- [Pulumi CLI](https://www.pulumi.com/docs/install/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) ≥ 3.237 — also acts as the OIDC credential broker via [Pulumi ESC](https://www.pulumi.com/docs/esc/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
- Node ≥ 18
- Logged into Pulumi Cloud as a member of the `lumitorch` org (the dev stack lives there because the ESC env reference resolves through the stack's org)
- `kubectl` (only for verification — not required by the apply itself)
- [`hey`](https://github.com/rakyll/hey) for the load test

## Auth

The dev stack references the Pulumi ESC env `cloud-creds/gcp-dev-sandbox`
in `00-infrastructure/Pulumi.dev.yaml`, which exports a short-lived
`GOOGLE_OAUTH_ACCESS_TOKEN` and `GOOGLE_PROJECT` to the gcp provider.
Pulumi pulls the env on every operation — no `pulumi env run` wrapper
needed. No SA JSON keys.

## Deploy

```bash
cd 00-infrastructure
npm install
pulumi package add terraform-module \
  terraform-google-modules/kubernetes-engine/google//modules/private-cluster \
  44.0.0 gke
pulumi stack select lumitorch/dev
pulumi up
```

Roughly 10–12 minutes from empty project to fully reconciled apps. **Single
apply, zero manual steps**: the Flux Instance Helm chart materialises the
`FluxInstance` CR, and `spec.sync` tells the operator to auto-create the
root `GitRepository` + `Kustomization` — no kubectl bootstrap and no
out-of-band wait loops.

After `pulumi up` finishes, Flux still needs ~1–2 min to reconcile Podinfo
and the ADK agent inside the cluster:

```bash
export KUBECONFIG=$(pulumi stack output kubeconfig_path)
kubectl -n flux-system get kustomization -w
```

The `kubeconfig` file is written to `00-infrastructure/kubeconfig` by
Pulumi itself with the cluster endpoint, CA, and a short-lived OAuth
token (TTL ~1h, refreshed on every `pulumi up`). No `gcloud` or
`gke-gcloud-auth-plugin` required.

## Verify

```bash
export KUBECONFIG=$(pulumi stack output kubeconfig_path)

kubectl get nodes -L pool                                   # 3 pools labelled
kubectl -n flux-system get fluxinstance,gitrepository,kustomization
kubectl -n adk get deploy,svc,networkpolicy,resourcequota
kubectl -n podinfo get helmrelease,deploy,svc,hpa,podmonitoring
kubectl get ciliumclusterwidenetworkpolicy                  # the metadata-server lockdown
pulumi stack output backup_plan_id                          # daily backup plan
```

### Talk to the agent

```bash
ADK_LB=$(kubectl -n adk get svc adk-agent -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

curl -X POST "http://$ADK_LB/apps/capital_agent/users/me/sessions/s1" \
  -H 'Content-Type: application/json' -d '{}'

curl -X POST "http://$ADK_LB/run" -H 'Content-Type: application/json' -d '{
  "appName": "capital_agent",
  "userId": "me", "sessionId": "s1",
  "newMessage": { "role": "user", "parts": [{"text": "What is the capital of France?"}] }
}' | jq
```

Or open the ADK Web UI at `http://$ADK_LB/dev-ui/`. Spans for each tool call
land in [Cloud Trace](https://console.cloud.google.com/traces/list?project=pulumi-development).

### Watch the autoscaler do real work

```bash
PODINFO_IP=$(kubectl -n podinfo get svc podinfo -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
curl http://$PODINFO_IP:9898

# load test in one terminal
hey -z 60s -c 50 http://$PODINFO_IP:9898

# in another terminal
kubectl -n podinfo get hpa -w        # replicas climb 2 → 10
kubectl get nodes -w                 # cluster autoscaler adds nodes to the workload pool
```

The custom dashboard tile "HPA — current vs. desired (podinfo)" lights up
in real time during the test.

## Production posture (what's intentionally relaxed for the workshop)

The cluster is shaped to look like production, but a few knobs are turned
down for a single-room, 60-minute session. Each is called out so attendees
can reason about what they'd flip in a real environment:

| Workshop setting | Production setting | Where |
|---|---|---|
| `master_authorized_networks = 0.0.0.0/0` | Restrict to corporate / CI CIDRs, or use a private endpoint | `00-infrastructure/index.ts` |
| Public LBs for Flux UI + ADK agent | Drop the `allow-ingress-*-external` NetworkPolicies, front with IAP / VPN / port-forward | `01-gitops/infrastructure/base/`, `01-gitops/apps/base/adk-agent/` |
| `0` delete-lock on backups | Set `backupDeleteLockDays = 7` (or compliance window) | `00-infrastructure/index.ts` |
| Single-region cluster | Two regional clusters in a Fleet + Multi-Cluster Ingress for traffic failover | future work |
| Anonymous Vertex AI agent | Front with auth (IAP, OAuth, Cloud Armor) — Vertex tokens cost real money | future work |

## Teardown

```bash
cd 00-infrastructure
pulumi destroy
```

The Helm releases are flagged `retainOnDelete: true` and the kubernetes
provider is configured with `deleteUnreachable: true`, so destroy never
calls `helm uninstall` and never blocks on FluxInstance finalizers — the
cluster goes away and the in-cluster artifacts go with it.

If a destroy gets stuck (typically because the cached OAuth token in
state expired between `up` and `destroy`), drop the offending resources
from state and rerun:

```bash
pulumi stack --show-urns | grep flux           # find the URN
pulumi state delete '<paste-urn>' --force
pulumi destroy
```

## Notes

- The Flux GitOps source defaults to this monorepo on `main` at
  `getting-started-with-kubernetes-google-cloud/01-gitops/clusters/gke-workshop`.
  Override `git_repo_url` / `git_repo_branch` / `git_cluster_path` config
  keys in `Pulumi.dev.yaml` to point at a fork.
- The ADK agent uses `google-vertex/gemini-2.5-flash` with the global Vertex
  publisher endpoint. To switch to a regional endpoint or a different model,
  edit the agent code under `adk-agent/app/` and rebuild + push the image
  (the Deployment uses `:latest` + `imagePullPolicy: Always` so a `kubectl
  rollout restart deploy/adk-agent -n adk` ships the new code).
- The `cluster-vars` ConfigMap in `flux-system` is what Flux's
  `postBuild.substituteFrom` reads to inject `${gcp_project_id}` and
  `${cluster_name}` into the GitOps YAML. Add new cluster-scoped variables
  there; do not bake them into manifests.
