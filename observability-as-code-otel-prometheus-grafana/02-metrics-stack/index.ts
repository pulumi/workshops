import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

// Step 2 of "Observability as code": the metrics and traces backends.
// kube-prometheus-stack (chart 91.8.1, verified against the prometheus-community
// repo 2026-09-28) ships Prometheus + Alertmanager + Grafana with a
// ServiceMonitor/PrometheusRule CRD-driven discovery model, which is why this
// folder groups the trace backend (Tempo) in with it rather than with the
// Collector in step 3: both charts need `helm.v3.Release`, and Release cannot
// be previewed or rendered offline (see AGENTS.md), so keeping step 3
// Helm-free keeps the workshop's highest-risk artifact -- the Collector
// pipeline config -- readable and checkable without a live cluster.

const config = new pulumi.Config();
const clusterStack = new pulumi.StackReference(config.require("clusterStackRef"));
const monitoringNamespace = clusterStack.getOutput("monitoringNamespaceName");

const provider = new k8s.Provider("kind", {
    kubeconfig: clusterStack.getOutput("rawKubeconfig"),
});

const grafanaAdminPassword = config.requireSecret("grafanaAdminPassword");

// Both selector flags must be `false`, or Prometheus only watches
// ServiceMonitors/PrometheusRules this Helm release itself created (the
// default `...SelectorNilUsesHelmValues: true`), which silently drops step 3's
// ServiceMonitor and step 6's PrometheusRule.
const kubePrometheusStack = new k8s.helm.v3.Release("kube-prometheus-stack", {
    chart: "kube-prometheus-stack",
    version: "91.9.0",
    namespace: monitoringNamespace,
    repositoryOpts: {
        repo: "https://prometheus-community.github.io/helm-charts",
    },
    values: {
        grafana: {
            adminPassword: grafanaAdminPassword,
            sidecar: {
                dashboards: {
                    enabled: true,
                    label: "grafana_dashboard",
                    labelValue: "1",
                    searchNamespace: "ALL",
                },
                datasources: {
                    enabled: true,
                    label: "grafana_datasource",
                    labelValue: "1",
                },
            },
        },
        prometheus: {
            prometheusSpec: {
                retention: "10d",
                serviceMonitorSelectorNilUsesHelmValues: false,
                ruleSelectorNilUsesHelmValues: false,
            },
        },
    },
}, { provider });

const tempo = new k8s.helm.v3.Release("tempo", {
    chart: "tempo",
    version: "1.24.4",
    namespace: monitoringNamespace,
    repositoryOpts: {
        repo: "https://grafana.github.io/helm-charts",
    },
}, { provider });

// The chart names its Service after the release name ("tempo"); Grafana's
// sidecar reads this ConfigMap's `grafana_datasource: "1"` label the same way
// it reads step 5's dashboard ConfigMap.
const tempoDataSource = new k8s.core.v1.ConfigMap("tempo-datasource", {
    metadata: {
        namespace: monitoringNamespace,
        labels: { grafana_datasource: "1" },
    },
    data: {
        "tempo-datasource.yaml": `apiVersion: 1
datasources:
  - name: Tempo
    type: tempo
    access: proxy
    url: http://tempo:3200
    isDefault: false
`,
    },
}, { provider, dependsOn: tempo });

export const monitoringNamespaceOut = monitoringNamespace;
export const grafanaServiceName = pulumi.interpolate`${kubePrometheusStack.status.name}-grafana`;
export const tempoServiceName = pulumi.interpolate`${tempo.status.name}`;
