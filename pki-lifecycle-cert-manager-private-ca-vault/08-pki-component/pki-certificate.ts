import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as k8s from "@pulumi/kubernetes";

export interface PkiCertificateArgs {
    dnsName: pulumi.Input<string>;
    issuerName: pulumi.Input<string>;
    issuerKind: pulumi.Input<string>;
    issuerGroup: pulumi.Input<string>;
    namespace?: pulumi.Input<string>;
    duration?: pulumi.Input<string>;
    renewBefore?: pulumi.Input<string>;
    // Alert when fewer than this many seconds remain (Prometheus).
    alertSecondsBeforeExpiry?: pulumi.Input<number>;
    // Optional CloudWatch alarm on an ACM certificate.
    acmCertificateArn?: pulumi.Input<string>;
    alarmTopicArn?: pulumi.Input<string>;
}

// One certificate, issued by the chosen issuer, with its expiry alerts attached.
export class PkiCertificate extends pulumi.ComponentResource {
    public readonly secretName: pulumi.Output<string>;
    public readonly certificateName: pulumi.Output<string>;

    constructor(name: string, args: PkiCertificateArgs, opts?: pulumi.ComponentResourceOptions) {
        super("pki:index:PkiCertificate", name, {}, opts);

        const namespace = args.namespace ?? "default";
        const secretName = `${name}-tls`;

        const certificate = new k8s.apiextensions.CustomResource(`${name}-cert`, {
            apiVersion: "cert-manager.io/v1",
            kind: "Certificate",
            metadata: { name, namespace },
            spec: {
                secretName,
                dnsNames: [args.dnsName],
                duration: args.duration ?? "2h",
                renewBefore: args.renewBefore ?? "1h",
                issuerRef: { group: args.issuerGroup, kind: args.issuerKind, name: args.issuerName },
            },
        }, { parent: this });

        new k8s.apiextensions.CustomResource(`${name}-rule`, {
            apiVersion: "monitoring.coreos.com/v1",
            kind: "PrometheusRule",
            metadata: { name: `${name}-expiry`, namespace: "monitoring" },
            spec: {
                groups: [{
                    name: `${name}-certificate`,
                    rules: [{
                        alert: "PkiCertificateExpiresSoon",
                        expr: pulumi.interpolate`certmanager_certificate_expiration_timestamp_seconds{name="${name}"} - time() < ${args.alertSecondsBeforeExpiry ?? 3600}`,
                        for: "5m",
                        labels: { severity: "warning" },
                    }],
                }],
            },
        }, { parent: this, dependsOn: [certificate] });

        if (args.acmCertificateArn && args.alarmTopicArn) {
            new aws.cloudwatch.MetricAlarm(`${name}-days-to-expiry`, {
                namespace: "AWS/CertificateManager",
                metricName: "DaysToExpiry",
                dimensions: { CertificateArn: args.acmCertificateArn },
                statistic: "Minimum",
                period: 86400,
                evaluationPeriods: 1,
                comparisonOperator: "LessThanThreshold",
                threshold: 30,
                alarmActions: [args.alarmTopicArn],
            }, { parent: this });
        }

        this.secretName = pulumi.output(secretName);
        this.certificateName = certificate.metadata.name;
        this.registerOutputs({ secretName: this.secretName, certificateName: this.certificateName });
    }
}
