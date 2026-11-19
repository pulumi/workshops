import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as k8s from "@pulumi/kubernetes";

const org = pulumi.getOrganization();
const cluster = new pulumi.StackReference(`${org}/pki-02-eks-cluster/dev`);
const kubeconfig = cluster.requireOutput("kubeconfig");

// Set renderYamlToDirectory to write manifests instead of talking to a cluster (offline check).
const renderYamlToDirectory = new pulumi.Config().get("renderYamlToDirectory");
const provider = new k8s.Provider("eks", renderYamlToDirectory
    ? { renderYamlToDirectory }
    : { kubeconfig: kubeconfig.apply(k => typeof k === "string" ? k : JSON.stringify(k)) });
const ca = new pulumi.StackReference(`${org}/pki-03-private-ca/dev`);
const subordinateCaArn = ca.requireOutput("subordinateCaArn") as pulumi.Output<string>;

const config = new pulumi.Config();
const alarmEmail = config.require("alarmEmail");
// Alarm when fewer than this many days remain.
const alarmThresholdDays = config.getNumber("alarmThresholdDays") ?? 30;

// An ACM certificate signed by the private CA. ACM publishes DaysToExpiry about twice a day,
// so the alarm reacts on that cadence, not in real time.
const acmCertificate = new aws.acm.Certificate("demo-acm", {
    domainName: "demo.internal.example",
    certificateAuthorityArn: subordinateCaArn,
});

const topic = new aws.sns.Topic("cert-expiry");
new aws.sns.TopicSubscription("cert-expiry-email", {
    topic: topic.arn,
    protocol: "email",
    endpoint: alarmEmail,
});

new aws.cloudwatch.MetricAlarm("cert-days-to-expiry", {
    namespace: "AWS/CertificateManager",
    metricName: "DaysToExpiry",
    dimensions: { CertificateArn: acmCertificate.arn },
    statistic: "Minimum",
    period: 86400,
    evaluationPeriods: 1,
    comparisonOperator: "LessThanThreshold",
    threshold: alarmThresholdDays,
    treatMissingData: "notBreaching",
    alarmActions: [topic.arn],
});

const monitoring = new k8s.helm.v3.Release("kube-prometheus-stack", {
    name: "kube-prometheus-stack",
    chart: "kube-prometheus-stack",
    version: "92.11.0",
    namespace: "monitoring",
    createNamespace: true,
    repositoryOpts: { repo: "https://prometheus-community.github.io/helm-charts" },
    values: {
        grafana: { enabled: false },
        alertmanager: { enabled: false },
        prometheus: {
            prometheusSpec: {
                // Pick up ServiceMonitors and rules from every namespace, not only this release.
                serviceMonitorSelectorNilUsesHelmValues: false,
                ruleSelectorNilUsesHelmValues: false,
            },
        },
    },
}, { provider });

// cert-manager serves its metrics on the controller service; this ServiceMonitor scrapes them.
new k8s.apiextensions.CustomResource("cert-manager-servicemonitor", {
    apiVersion: "monitoring.coreos.com/v1",
    kind: "ServiceMonitor",
    metadata: { name: "cert-manager", namespace: "cert-manager" },
    spec: {
        selector: { matchLabels: { "app.kubernetes.io/name": "cert-manager", "app.kubernetes.io/component": "controller" } },
        endpoints: [{ port: "tcp-prometheus-servicemonitor" }],
    },
}, { provider, dependsOn: [monitoring] });

new k8s.apiextensions.CustomResource("cert-expiry-rule", {
    apiVersion: "monitoring.coreos.com/v1",
    kind: "PrometheusRule",
    metadata: { name: "cert-expiry", namespace: "monitoring" },
    spec: {
        groups: [{
            name: "certificates",
            rules: [{
                alert: "CertificateExpiresSoon",
                expr: "certmanager_certificate_expiration_timestamp_seconds - time() < 3600",
                for: "5m",
                labels: { severity: "warning" },
                annotations: { summary: "Certificate {{ $labels.name }} expires in less than one hour" },
            }],
        }],
    },
}, { provider, dependsOn: [monitoring] });

export const acmCertificateArn = acmCertificate.arn;
export const alarmTopicArn = topic.arn;
