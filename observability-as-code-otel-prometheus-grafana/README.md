# Observability as Code: OpenTelemetry, Prometheus and Grafana on Kubernetes with Pulumi

A 90-minute hands-on workshop. You build a self-hosted observability stack on
Kubernetes with Pulumi IaC: kube-prometheus-stack, an OpenTelemetry Collector,
an instrumented sample app, a dashboard and an alert rule. It ends with a live
trace waterfall and a moving latency graph in Grafana. Everything runs on a
local kind cluster and costs $0.

> Platform teams already run Prometheus and Grafana, and are now being asked
> to add OpenTelemetry. This workshop builds the whole pipeline as code, so the
> dashboard, the alert and the Collector config are reviewed, versioned and
> reproducible like any other infrastructure.
>
> — Workshop page: to be announced

## Sessions and speakers

| Session | Date | Length |
|---|---|---|
| To be scheduled | To be scheduled | 90 min |

Speakers to be confirmed.

## What attendees learn

1. How Prometheus, Grafana and OpenTelemetry fit together, and where each
   one's job starts and stops.
2. How to stand up that stack on Kubernetes with Pulumi IaC, using
   `kubernetes.helm.v3.Release` for chart-based components and plain
   Kubernetes resources for the parts that are not a chart.
3. How to send an application's traces and metrics through the OpenTelemetry
   Collector as the single ingestion point.
4. How to turn a running system into a dashboard and an alert, both defined
   in Pulumi.

## Layout

Each project folder also has a `package-lock.json` and a `tsconfig.json`; they
are left out below.

```
observability-as-code-otel-prometheus-grafana/
├── README.md                      this file
├── AGENTS.md                      conventions for agents (and humans) editing this folder
├── .gitignore                     keeps working documents, node_modules and exports out of commits
├── .shellcheckrc                  shellcheck settings for every script in this folder
├── 01-cluster/                    step 1: kind cluster and the monitoring and demo namespaces
│   ├── .gitignore                 ignores node_modules and local state
│   ├── Pulumi.yaml                project definition
│   ├── Pulumi.dev.yaml            stack config (clusterName)
│   ├── index.ts                   kind cluster via @pulumi/command, then two namespaces
│   ├── kind.yaml                  kind cluster config, node image pinned
│   ├── package.json               dependencies
│   └── precache-images.sh         pulls and loads every workshop image into the kind node
├── 02-metrics-stack/              step 2: kube-prometheus-stack and Tempo
│   ├── .gitignore                 ignores node_modules and local state
│   ├── AGENTS.md                  rules for the two Helm releases
│   ├── Pulumi.yaml                project definition
│   ├── Pulumi.dev.yaml            stack config (clusterStackRef)
│   ├── index.ts                   two helm.v3.Release resources and the Tempo datasource ConfigMap
│   └── package.json               dependencies
├── 03-collector/                  step 3: OpenTelemetry Collector
│   ├── .gitignore                 ignores node_modules and local state
│   ├── Pulumi.yaml                project definition
│   ├── diff-against-fallback.sh   diffs the running Collector config against the known-good copy
│   ├── fallback/
│   │   └── collector.yaml         known-good Collector config, same as the ConfigMap in index.ts
│   ├── index.ts                   ConfigMap, Deployment, Service and ServiceMonitor
│   └── package.json               dependencies
├── 04-sample-app/                 step 4: instrumented sample app
│   ├── .gitignore                 ignores node_modules and local state
│   ├── AGENTS.md                  rules for the app and its image
│   ├── Pulumi.yaml                project definition
│   ├── app/
│   │   ├── .gitignore             ignores node_modules
│   │   ├── Dockerfile             image for the Express app
│   │   ├── index.js               Express routes with synthetic latency and errors
│   │   ├── package.json           app dependencies, OpenTelemetry SDK pinned
│   │   └── tracing.js             OpenTelemetry SDK setup, loaded with node --require
│   ├── build-and-load.sh          builds the image and loads it into kind
│   ├── index.ts                   Deployment and Service for the app
│   └── package.json               dependencies
├── 05-dashboard/                  step 5: Grafana dashboard as a ConfigMap
│   ├── .gitignore                 ignores node_modules and local state
│   ├── Pulumi.yaml                project definition
│   ├── index.ts                   ConfigMap carrying the grafana_dashboard label
│   └── package.json               dependencies
├── 06-alert-rule/                 step 6: PrometheusRule with one alert
│   ├── .gitignore                 ignores node_modules and local state
│   ├── Pulumi.yaml                project definition
│   ├── index.ts                   PrometheusRule custom resource
│   └── package.json               dependencies
└── 07-load-and-observe/           step 7: load and port-forwards
    ├── generate-load.sh           port-forwards the app and sends requests in a loop
    └── port-forward.sh            port-forwards Grafana and Prometheus
```

The deck (`slides/`) follows on this branch.

## Prerequisites

Participants need Docker, kind v0.33.0, kubectl, Helm (optional, for debugging),
Node.js 22, the Pulumi CLI, and a Pulumi Cloud account or `pulumi login --local`.

The presenter additionally pre-caches every image (`01-cluster/precache-images.sh`)
and keeps `03-collector/fallback/collector.yaml` ready for the Collector step.

## Run the slides

The deck is added on this branch after the demo code.

## Run the demo

Step 1 creates the kind cluster. Right after it, once and while you have a
network, pre-load the images so a venue Wi-Fi failure cannot block later steps:

```bash
cd 01-cluster && npm install && pulumi up
./precache-images.sh
```

Then the remaining steps. Each project's stack config
needs `clusterStackRef` set to `organization/observability-cluster/dev`
(`organization` is your Pulumi org); `04-sample-app` also needs
`collectorStackRef` pointing at the `observability-collector` stack.

```bash
cd ../02-metrics-stack && npm install \
  && pulumi config set --secret grafanaAdminPassword <password> && pulumi up
cd ../03-collector && npm install && pulumi up
cd ../04-sample-app && ./build-and-load.sh && npm install && pulumi up
cd ../05-dashboard && npm install && pulumi up
cd ../06-alert-rule && npm install && pulumi up
cd ../07-load-and-observe && ./port-forward.sh &
./generate-load.sh
```

Open Grafana at http://localhost:3000 (user `admin`, the password you set) and
Prometheus at http://localhost:9090/alerts.

Between runs, destroy the stacks in reverse order (`pulumi destroy` in 06, 05,
04, 03, 02, 01). If the Collector step breaks, run
`03-collector/diff-against-fallback.sh`.

## Teardown and cost

```bash
pulumi destroy        # in each project, 06 down to 01
kind delete cluster --name observability-workshop
```

Cost is $0: a local kind cluster, no cloud account and no region.

## Metric names the dashboard and alert depend on

The sample app uses the OpenTelemetry Node SDK with HTTP auto-instrumentation.
Through the Collector's Prometheus exporter, the request histogram arrives as
`http_server_request_duration_seconds_bucket` (unit seconds), and the Collector
puts the app's `service.name` in the `job` label. Steps 5 and 6 query
`http_server_request_duration_seconds_bucket{job="observability-sample-app"}`.
The ServiceMonitor sets `honorLabels: true`, otherwise Prometheus renames that
`job` label to `exported_job`.

## Pins

Read on 2026-10-03.

| Component | Pin |
|---|---|
| kube-prometheus-stack chart | 91.9.0 (appVersion v0.94.1, Prometheus v3.15.0) |
| grafana/tempo chart | 1.24.4 (appVersion 2.9.0) |
| OpenTelemetry Collector Contrib image | `otel/opentelemetry-collector-contrib:0.162.0` |
| @pulumi/kubernetes, @pulumi/pulumi | ^4.34.2, ^3.265.0 |
| OpenTelemetry JS | sdk-node 0.222.0, auto-instrumentations-node 0.80.0, exporters 0.222.0 |
| kind | v0.33.0, node image pinned in `01-cluster/kind.yaml` |

## Open questions

- Tempo is not in the brief's step list. It is added so step 7 can show a trace
  waterfall in Grafana. Confirm that is wanted.
- Target platform: this build uses a local kind cluster, which keeps cost at
  $0 and avoids cloud-account setup. No managed Kubernetes variant is built.

## Sources

Read on 2026-09-28 unless noted:

- https://opentelemetry.io/docs/collector/configuration/
- https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector-contrib/main/exporter/prometheusexporter/README.md
- https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/
- https://grafana.com/docs/tempo/latest/setup/helm-chart/
- https://prometheus-operator.dev/docs/api-reference/api/
- https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v3/release/
- https://www.pulumi.com/registry/packages/kubernetes/api-docs/apiextensions/customresource/
- https://www.pulumi.com/docs/iac/concepts/stacks/#stackreferences
- Chart, image and package versions: `helm search repo`, npm registry and the
  collector releases page, read 2026-10-03.
