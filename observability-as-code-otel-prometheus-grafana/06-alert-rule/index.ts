import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

// Step 6: a PrometheusRule, evaluated because step 2 set
// `ruleSelectorNilUsesHelmValues: false` (see 02-metrics-stack/AGENTS.md).
// The `spec` here is a literal Kubernetes object, at the top level of the
// CustomResource args -- never nested under an `otherFields` wrapper, which
// silently produces a CustomResource with no visible spec.

const config = new pulumi.Config();
const clusterStack = new pulumi.StackReference(config.require("clusterStackRef"));
const monitoringNamespace = clusterStack.getOutput("monitoringNamespaceName");

// `renderYamlToDirectory` and `kubeconfig`/`context` are mutually exclusive on
// this provider, so this project can be verified offline (rendered manifests,
// read back and grepped) without a reachable cluster. Set the config value
// only to exercise that path; leave it unset for a real `pulumi up`.
const renderYamlToDirectory = config.get("renderYamlToDirectory");
const provider = renderYamlToDirectory
    ? new k8s.Provider("kind", { renderYamlToDirectory })
    : new k8s.Provider("kind", { kubeconfig: clusterStack.getOutput("rawKubeconfig") });

const rule = new k8s.apiextensions.CustomResource("sample-app-latency", {
    apiVersion: "monitoring.coreos.com/v1",
    kind: "PrometheusRule",
    metadata: { namespace: monitoringNamespace, labels: { grafana_alert: "1" } },
    spec: {
        groups: [{
            name: "observability-sample-app.rules",
            rules: [{
                alert: "SampleAppHighLatency",
                expr: 'histogram_quantile(0.95, sum(rate(http_server_request_duration_seconds_bucket{job="observability-sample-app"}[5m])) by (le)) > 0.2',
                for: "1m",
                labels: { severity: "warning" },
                annotations: {
                    summary: "observability-sample-app p95 latency above 200ms",
                    description: "p95 request latency has exceeded 200ms for over a minute.",
                },
            }],
        }],
    },
}, { provider });

export const alertRuleName = rule.metadata.name;
