import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

// Step 5: the dashboard rides in as a ConfigMap labeled `grafana_dashboard:
// "1"` -- step 2's `grafana.sidecar.dashboards` watches for exactly that
// label across all namespaces (`searchNamespace: ALL`), so Grafana picks it
// up with no manual import.

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

const dashboardJson = {
    "title": "Observability as Code -- Sample App",
    "uid": "obs-as-code-sample-app",
    "schemaVersion": 39,
    "panels": [
        {
            "id": 1,
            "title": "Request latency (p95)",
            "type": "timeseries",
            "gridPos": {
                "h": 8,
                "w": 12,
                "x": 0,
                "y": 0
            },
            "fieldConfig": {
                "defaults": { "unit": "s" },
                "overrides": []
            },
            "datasource": {
                "type": "prometheus",
                "uid": "$datasource"
            },
            "targets": [
                {
                    "expr": "histogram_quantile(0.95, sum(rate(http_server_request_duration_seconds_bucket{job=\"observability-sample-app\"}[5m])) by (le))",
                    "refId": "A"
                }
            ]
        },
        {
            "id": 2,
            "title": "Traces (Tempo)",
            "type": "traces",
            "gridPos": {
                "h": 8,
                "w": 12,
                "x": 12,
                "y": 0
            },
            "datasource": {
                "type": "tempo",
                "uid": "$tempo_datasource"
            },
            "targets": [
                {
                    "queryType": "traceql",
                    "query": "{ .service.name = \"observability-sample-app\" }",
                    "refId": "A"
                }
            ]
        }
    ],
    "templating": {
        "list": [
            {
                "name": "datasource",
                "type": "datasource",
                "query": "prometheus"
            },
            {
                "name": "tempo_datasource",
                "type": "datasource",
                "query": "tempo"
            }
        ]
    }
};

const dashboard = new k8s.core.v1.ConfigMap("sample-app-dashboard", {
    metadata: {
        namespace: monitoringNamespace,
        labels: { grafana_dashboard: "1" },
    },
    data: {
        "sample-app-dashboard.json": JSON.stringify(dashboardJson),
    },
}, { provider });

export const dashboardConfigMapName = dashboard.metadata.name;
