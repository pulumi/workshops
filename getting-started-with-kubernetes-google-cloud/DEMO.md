# Demo / smoke-test runbook

After `pulumi up --stack lumitorch/dev` finishes (and Flux has had ~1–2 min
to reconcile), run the checks below to confirm the cluster + apps are
healthy and the LB endpoints are reachable. Designed to be copy-pasted
top-to-bottom.

## Setup

```bash
cd getting-started-with-kubernetes-google-cloud/00-infrastructure
export KUBECONFIG=$(pulumi stack output kubeconfig_path --stack lumitorch/dev)
echo "$KUBECONFIG"

# Sanity-check: should list 7 nodes, not throw a 401 / 403.
kubectl get nodes -L pool
```

> **Re-export between shells.** `KUBECONFIG` does not persist across new
> terminal windows. If `kubectl` falls back to a different cluster (you'll
> see AWS/EKS errors), the env var got dropped — re-run the `export` line.

### If `kubectl` returns "Unauthorized" / 401

The kubeconfig embeds a short-lived OAuth token (~1h TTL). After the
token expires, `pulumi up` re-evaluates the program, mints a fresh token
via `gcp.organizations.getClientConfigOutput()`, and rewrites the
kubeconfig file on disk. Run:

```bash
pulumi up --skip-preview --yes --stack lumitorch/dev
export KUBECONFIG=$(pulumi stack output kubeconfig_path --stack lumitorch/dev)
kubectl get nodes -L pool   # should work now
```

The Provider has `clusterIdentifier: cluster.clusterId` set, so this
re-up is a clean no-op for the kubernetes resources — token rotation
hashes as an in-place provider update, not a replacement.

## Cluster shape

```bash
kubectl get nodes -L pool
```

Expected: 7 nodes labelled `system`×3, `workload`×3, `workload-spot`×1
(Spot scales 0–5; the 1 here is from autoscaler nudge during bring-up).

## Flux GitOps reconciliation

```bash
kubectl -n flux-system get fluxinstance,gitrepository,kustomization
```

Expected: `FluxInstance/flux` Ready, `GitRepository/flux-system` Ready,
all three Kustomizations (`flux-system`, `infrastructure`, `apps`)
showing `Applied revision: refs/heads/main@sha1:<commit>` and `Ready=True`.

## ADK agent

```bash
kubectl -n adk get pods,svc
kubectl -n adk get networkpolicy
```

Expected:
- `pod/adk-agent-...` `1/1 Running`
- `svc/adk-agent` LoadBalancer with an external IP assigned
- 6 NetworkPolicies: `allow-egress-dns`, `allow-egress-https`,
  `allow-egress-metadata-server`, `allow-ingress-http`,
  `allow-ingress-monitoring`, `default-deny`

## Podinfo

```bash
kubectl -n podinfo get pods,svc,hpa
```

Expected:
- `pod/podinfo-...` `1/1 Running`
- `svc/podinfo` LoadBalancer with external IP
- `hpa/podinfo` `cpu: <n>%/50%`, `MINPODS=1 MAXPODS=10 REPLICAS=1`

## Cluster-wide policy

```bash
kubectl get ciliumclusterwidenetworkpolicy
```

Expected: `deny-egress-gce-metadata` `VALID=True`.

## Backup plan

```bash
pulumi stack output backup_plan_id --stack lumitorch/dev
```

Expected: `projects/<project>/locations/<region>/backupPlans/gke-workshop-daily`.

## Pull all three LB IPs into shell vars

```bash
ADK_IP=$(kubectl -n adk get svc adk-agent -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
PODINFO_IP=$(kubectl -n podinfo get svc podinfo -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
FLUX_IP=$(kubectl -n flux-system get svc flux-web-lb -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

echo "ADK agent:  http://$ADK_IP/dev-ui/"
echo "ADK API:    http://$ADK_IP/docs"
echo "Podinfo:    http://$PODINFO_IP:9898/"
echo "Flux UI:    http://$FLUX_IP/"
```

## Smoke test — Flux UI

```bash
curl -sS --max-time 10 -o /tmp/flux.html -w "HTTP %{http_code}\n" http://$FLUX_IP/
grep -oE '<title>[^<]+' /tmp/flux.html | head -1
```

Expected: `HTTP 200`, `<title>Flux Status`.

## Smoke test — Podinfo

```bash
curl -sS --max-time 10 http://$PODINFO_IP:9898/ | jq '{hostname, version, message}'
```

Expected `message: "Hello from gke-workshop"` — the `${cluster_name}`
substitution from the `cluster-vars` ConfigMap landing through Flux's
`postBuild.substituteFrom`.

## Smoke test — ADK agent (Vertex AI / Gemini 2.5 Flash via Workload Identity)

```bash
# 1. Confirm the agent is registered
curl -sS --max-time 10 http://$ADK_IP/list-apps

# 2. Create a session
curl -sS --max-time 30 -X POST \
  http://$ADK_IP/apps/capital_agent/users/me/sessions/s1 \
  -H 'Content-Type: application/json' -d '{}'

# 3. Run a prompt
curl -sS --max-time 60 -X POST http://$ADK_IP/run \
  -H 'Content-Type: application/json' \
  -d '{
    "appName": "capital_agent",
    "userId": "me",
    "sessionId": "s1",
    "newMessage": {
      "role": "user",
      "parts": [{"text": "What is the capital of France?"}]
    }
  }' | jq
```

Expected event sequence:

1. `functionCall: get_capital_city({"country": "France"})`
2. `functionResponse: {"result": "Paris"}`
3. `text: "The capital of France is Paris."`

## Other prompts worth running for the demo

```bash
PROMPT() {
  curl -sS --max-time 60 -X POST http://$ADK_IP/run \
    -H 'Content-Type: application/json' \
    -d "{\"appName\":\"capital_agent\",\"userId\":\"me\",\"sessionId\":\"s1\",\"newMessage\":{\"role\":\"user\",\"parts\":[{\"text\":\"$1\"}]}}" \
    | jq -r '.[].content.parts[].text // empty'
}

PROMPT "And what about Germany?"                           # session memory + tool routing
PROMPT "What is the capital of Atlantis?"                   # graceful unknown
PROMPT "Tell me a one-line joke about Kubernetes."          # off-domain → guardrail
```

## Watch the autoscaler do real work

```bash
hey -z 60s -c 50 http://$PODINFO_IP:9898/

# In another terminal:
kubectl -n podinfo get hpa -w   # replicas climb 1 → 10
kubectl get nodes -w            # cluster autoscaler adds workload nodes
```

The custom dashboard tile *"HPA — current vs. desired (podinfo)"* lights
up while this runs (`pulumi stack output dashboard_url --stack lumitorch/dev`).

## Console URLs (project-scoped)

```bash
PROJECT=pulumi-development
REGION=europe-west1
CLUSTER=gke-workshop

cat <<EOF
Cluster overview        → https://console.cloud.google.com/kubernetes/clusters/details/$REGION/$CLUSTER?project=$PROJECT
Node pools              → https://console.cloud.google.com/kubernetes/clusters/details/$REGION/$CLUSTER/nodes?project=$PROJECT
Workloads               → https://console.cloud.google.com/kubernetes/workload?project=$PROJECT
Security posture        → https://console.cloud.google.com/kubernetes/clusters/details/$REGION/$CLUSTER/security?project=$PROJECT
Dataplane V2 obs        → https://console.cloud.google.com/kubernetes/clusters/details/$REGION/$CLUSTER/observability/dataplanev2?project=$PROJECT
Backup plans            → https://console.cloud.google.com/kubernetes/backups/plans?project=$PROJECT
Cloud Trace (ADK spans) → https://console.cloud.google.com/traces/list?project=$PROJECT
ADK logs                → https://console.cloud.google.com/logs/query;query=resource.type%3D%22k8s_container%22%20resource.labels.namespace_name%3D%22adk%22?project=$PROJECT
adk-vertex GSA          → https://console.cloud.google.com/iam-admin/serviceaccounts/details/adk-vertex@$PROJECT.iam.gserviceaccount.com?project=$PROJECT
EOF
```

## Teardown

```bash
pulumi destroy --stack lumitorch/dev
```

`retainOnDelete: true` on both Helm releases + `deleteUnreachable: true`
on the kubernetes Provider keep destroy clean. If a cached OAuth token
expired between `up` and `destroy` (typical after >1h), drop the
offending kubernetes resources from state and rerun:

```bash
pulumi stack --show-urns --stack lumitorch/dev | grep flux
pulumi state delete '<paste-urn>' --force --stack lumitorch/dev
pulumi destroy --stack lumitorch/dev
```
