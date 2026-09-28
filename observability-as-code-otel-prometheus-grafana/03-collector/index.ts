import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

// Step 3 of "Observability as code": the Collector pipeline. This is the
// workshop's most common failure mode (a receiver/exporter typo breaks the
// whole pipeline silently), so it is kept Helm-free on purpose: plain
// Kubernetes resources can be rendered offline with `renderYamlToDirectory`
// and read back before ever touching a cluster, unlike the
// `helm.v3.Release` resources in step 2 (see that folder's AGENTS.md).
//
// Config values verified 2026-09-28 against
// https://opentelemetry.io/docs/collector/configuration/ and the
// prometheusexporter/debugexporter/otlpexporter READMEs in
// open-telemetry/opentelemetry-collector(-contrib).

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

const collectorImage = "otel/opentelemetry-collector-contrib:0.161.0";
const labels = { app: "otel-collector" };

const collectorConfig = new k8s.core.v1.ConfigMap("otel-collector-config", {
    metadata: { namespace: monitoringNamespace, labels },
    data: {
        "collector.yaml": `receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch: {}

exporters:
  prometheus:
    endpoint: 0.0.0.0:8889
  otlp:
    endpoint: tempo.monitoring.svc.cluster.local:4317
    tls:
      insecure: true
  debug:
    verbosity: detailed

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp, debug]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheus, debug]
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [debug]
`,
    },
}, { provider });

const deployment = new k8s.apps.v1.Deployment("otel-collector", {
    metadata: { namespace: monitoringNamespace, labels },
    spec: {
        replicas: 1,
        selector: { matchLabels: labels },
        template: {
            metadata: { labels },
            spec: {
                containers: [{
                    name: "otel-collector",
                    image: collectorImage,
                    args: ["--config=/etc/otel/collector.yaml"],
                    ports: [
                        { name: "otlp-grpc", containerPort: 4317 },
                        { name: "otlp-http", containerPort: 4318 },
                        { name: "prom-metrics", containerPort: 8889 },
                    ],
                    volumeMounts: [{ name: "config", mountPath: "/etc/otel" }],
                }],
                volumes: [{
                    name: "config",
                    configMap: { name: collectorConfig.metadata.name },
                }],
            },
        },
    },
}, { provider });

const service = new k8s.core.v1.Service("otel-collector", {
    metadata: { namespace: monitoringNamespace, labels },
    spec: {
        selector: labels,
        ports: [
            { name: "otlp-grpc", port: 4317, targetPort: "otlp-grpc" },
            { name: "otlp-http", port: 4318, targetPort: "otlp-http" },
            { name: "prom-metrics", port: 8889, targetPort: "prom-metrics" },
        ],
    },
}, { provider });

// serviceMonitorSelectorNilUsesHelmValues: false (step 2) is what makes
// Prometheus pick this up even though it was not created by that Helm release.
const serviceMonitor = new k8s.apiextensions.CustomResource("otel-collector", {
    apiVersion: "monitoring.coreos.com/v1",
    kind: "ServiceMonitor",
    metadata: { namespace: monitoringNamespace, labels },
    spec: {
        selector: { matchLabels: labels },
        endpoints: [{ port: "prom-metrics", interval: "15s" }],
    },
}, { provider, dependsOn: service });

export const otlpGrpcEndpoint = pulumi.interpolate`${service.metadata.name}.${monitoringNamespace}.svc.cluster.local:4317`;
export const otlpHttpEndpoint = pulumi.interpolate`${service.metadata.name}.${monitoringNamespace}.svc.cluster.local:4318`;
