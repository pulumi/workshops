# Observability as Code: OpenTelemetry, Prometheus and Grafana on Kubernetes with Pulumi

A workshop that builds a full observability stack on Kubernetes with Pulumi,
step by step: a local cluster, Prometheus + Grafana + Tempo, an OpenTelemetry
Collector pipeline, an instrumented sample app, a dashboard and an alert rule
-- ending with a live trace waterfall and a moving latency graph in Grafana.

No date is scheduled for this workshop yet. It was queued from demand
signals: 19 observability sessions at KubeCon NA 2026, 279 at AWS re:Invent,
34 at Microsoft Ignite, 28 at PlatformCon, recurring CNCF blog coverage, and
internal Pulumi telemetry showing GCP monitoring-related usage up 36.0% and
40.4% year over year.

## What attendees learn

1. How Prometheus, Grafana and OpenTelemetry fit together, and where each
   one's job starts and stops.
2. How to stand up that stack on Kubernetes with Pulumi IaC, including
   `kubernetes.helm.v3.Release` for chart-based components and plain
   Kubernetes resources for the parts that are not a chart.
3. How to wire an application's traces and metrics into that stack with the
   OpenTelemetry Collector as the single ingestion point.
4. How to turn a running system into a dashboard and an alert, so the stack
   pays for itself the moment something breaks.

## Target platform

Built against a local **kind** cluster (TypeScript), not a managed cloud
Kubernetes service. Reasoning: zero cost, no cloud account required, and the
lowest setup friction for attendees, which is what a workshop needs. `kind`
is also the primary path the workshop brief names; a GKE Autopilot variant
would be the natural cloud alternative if a future run needs one, but it is
not built here.

## Open questions

From the brief:

- Which managed Kubernetes service to target for attendees without a local
  Docker setup -- **answered above**: this build targets `kind` and does not
  include a managed-cloud variant.

From this build:

- Whether a trace backend (Tempo) is actually in scope. The brief's step 7
  end state calls for "a live trace waterfall" in Grafana, but
  `kube-prometheus-stack` (the only chart step 4 names) ships no trace
  store. This build adds `grafana/tempo` to close that gap (see
  `02-metrics-stack`). The alternative is to narrow step 7's end state to
  metrics only and drop Tempo, the dashboard's trace panel, and the
  `otlp`/Tempo exporter branch of the Collector pipeline in `03-collector`.

## Confidence

Medium. The individual pieces (Helm charts, the Collector, OTel's Node SDK,
the Prometheus Operator CRDs) are each well-documented and pinned to
verified versions below, but the full chain has not run end to end on a live
cluster in this environment (see Verification).

## Layout

```
observability-as-code-otel-prometheus-grafana/
├── README.md              this file
├── AGENTS.md              conventions for agents (and humans) editing this folder
├── 01-cluster/            kind cluster + monitoring/demo namespaces (@pulumi/command + @pulumi/kubernetes)
├── 02-metrics-stack/      kube-prometheus-stack + Tempo via helm.v3.Release (see its AGENTS.md)
├── 03-collector/          OpenTelemetry Collector pipeline, plain k8s resources, no Helm
├── 04-sample-app/         instrumented Express app (app/) + build-and-load.sh + its Pulumi deployment
├── 05-dashboard/          Grafana dashboard ConfigMap (metrics panel + Tempo trace panel)
├── 06-alert-rule/         PrometheusRule alerting on sample-app latency
└── 07-load-and-observe/   port-forward.sh + generate-load.sh, no Pulumi project
```

Each numbered folder is its own Pulumi project (`Pulumi.yaml`) with a `dev`
stack, except `07-load-and-observe`, which is bash only. A downstream
project reads its cluster/collector via `pulumi.StackReference`, configured
with `clusterStackRef` (and `collectorStackRef` in `04-sample-app`) pointed
at the upstream stack's `organization/<project>/dev` name.

Tempo lives in `02-metrics-stack` alongside kube-prometheus-stack, not in
`03-collector`, because both need `helm.v3.Release` -- which cannot be
previewed or rendered offline (see `02-metrics-stack/AGENTS.md`) -- while
`03-collector` deliberately stays Helm-free so the workshop's highest-risk
artifact, the Collector's pipeline config, can be rendered and read back
before ever touching a cluster.

## Running it

```bash
cd 01-cluster && npm install && pulumi up
cd ../02-metrics-stack && npm install \
  && pulumi config set --secret grafanaAdminPassword <password> && pulumi up
cd ../03-collector && npm install && pulumi up
cd ../04-sample-app && ./build-and-load.sh && npm install && pulumi up
cd ../05-dashboard && npm install && pulumi up
cd ../06-alert-rule && npm install && pulumi up
cd ../07-load-and-observe && ./port-forward.sh &  # then in another shell:
./generate-load.sh
```

Each `pulumi up` needs `clusterStackRef` (and `collectorStackRef` for
`04-sample-app`) set to the actual `organization/<project>/dev` stack name
created for the upstream folder; the checked-in `Pulumi.dev.yaml` files use
the placeholder `organization`.

## Pins (verified 2026-09-28)

| Component | Pin | Source |
|---|---|---|
| kube-prometheus-stack chart | 91.8.1 (appVersion v0.94.1) | `helm search repo prometheus-community/kube-prometheus-stack --versions` |
| grafana/tempo chart | 1.24.4 (appVersion 2.9.0) | `helm search repo grafana/tempo --versions` |
| OpenTelemetry Collector Contrib image | `otel/opentelemetry-collector-contrib:0.161.0` | https://github.com/open-telemetry/opentelemetry-collector-releases/releases (GitHub release tag `v0.161.0`; the Docker Hub tag string itself was not independently re-checked against Docker Hub -- confirm before a live run) |
| kind | v0.33.0, node image `kindest/node:v1.37.0@sha256:a1ed56cfb0e7b93589bdf97c8cd566405a265939e3620fc4f5de89adff580ae5` | https://github.com/kubernetes-sigs/kind/releases |
| @pulumi/pulumi | ^3.265.0 | npm registry |
| @pulumi/kubernetes | ^4.34.2 | npm registry |
| @pulumi/command | ^1.2.1 | npm registry |
| typescript | ^5.9.0 (matching the reference workshop's pin) | `neo-in-a-docker-sandbox/02-app/package.json` |
| @opentelemetry/sdk-node, auto-instrumentations-node, exporter-trace-otlp-grpc, exporter-metrics-otlp-grpc | 0.222.0 / 0.80.0 / 0.222.0 / 0.222.0 | npm registry |
| express | ^5.2.1 | npm registry |
| node base image | `node:22-alpine` | Docker Hub (exact digest not pinned; verify before a live run) |

## Sources (all read 2026-09-28)

- https://opentelemetry.io/docs/collector/configuration/
- https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector-contrib/main/exporter/prometheusexporter/README.md
- https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector/main/exporter/debugexporter/README.md
- https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector/main/exporter/otlpexporter/README.md
- https://opentelemetry.io/docs/languages/sdk-configuration/general/
- https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/
- https://grafana.com/docs/tempo/latest/setup/helm-chart/
- https://grafana.com/docs/grafana/latest/datasources/tempo/configure-tempo-data-source/
- https://prometheus-operator.dev/docs/api-reference/api/ (PrometheusRule, ServiceMonitor)
- https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v3/release/
- https://www.pulumi.com/registry/packages/kubernetes/api-docs/apiextensions/customresource/
- https://www.pulumi.com/registry/packages/kubernetes/api-docs/provider/ (`renderYamlToDirectory`)
- https://www.pulumi.com/docs/iac/concepts/stacks/#stackreferences
- https://github.com/kubernetes-sigs/kind/releases
- https://github.com/open-telemetry/opentelemetry-collector-releases/releases

## Verification

Run in this environment:

- `npx tsc --noEmit` passed in all six TypeScript projects (`01-cluster`,
  `02-metrics-stack`, `03-collector`, `04-sample-app`, `05-dashboard`,
  `06-alert-rule`).
- `helm template` against the exact chart versions and values `index.ts`
  passes in `02-metrics-stack`, for both kube-prometheus-stack and Tempo.
- Offline manifest rendering (`renderYamlToDirectory`) for `03-collector`,
  `04-sample-app`, `05-dashboard` and `06-alert-rule`, reading the rendered
  YAML back to confirm the Collector pipeline, the ServiceMonitor, the
  dashboard ConfigMap and the PrometheusRule's `spec` (top level, not
  wrapped) all come out as intended.
- `shellcheck` against `.shellcheckrc` for every `.sh` file.

Could not run here (no Docker, kind, or kubectl in this environment):

- Any end-to-end run on a real kind cluster: `pulumi preview`/`up` for the
  two `helm.v3.Release` resources, pods reaching `Running`, the Collector
  receiving spans, the dashboard appearing in Grafana, the alert rule on the
  Prometheus Alerts page, the trace waterfall, and the 60-minute build
  budget.
- Building and `kind load`-ing the sample app image.
- A simulated presenter failure (fallback ConfigMap / pre-cached images
  against dropped Wi-Fi) and a verified clean teardown.
- The slide deck, its export, and speaker time budgets -- that is a
  separate build on this same branch.
