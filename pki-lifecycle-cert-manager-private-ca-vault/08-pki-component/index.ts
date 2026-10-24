import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { PkiCertificate } from "./pki-certificate";

const org = pulumi.getOrganization();
const cluster = new pulumi.StackReference(`${org}/pki-02-eks-cluster/dev`);
const kubeconfig = cluster.requireOutput("kubeconfig");

// Set renderYamlToDirectory to write manifests instead of talking to a cluster (offline check).
const renderYamlToDirectory = new pulumi.Config().get("renderYamlToDirectory");
const provider = new k8s.Provider("eks", renderYamlToDirectory
    ? { renderYamlToDirectory }
    : { kubeconfig: kubeconfig.apply(k => typeof k === "string" ? k : JSON.stringify(k)) });
const pca = new pulumi.StackReference(`${org}/pki-04-cert-manager-pca-issuer/dev`);
const monitoring = new pulumi.StackReference(`${org}/pki-07-renewal-and-monitoring/dev`);

// Same component, two issuers: the AWS Private CA cluster issuer and the Vault issuer from step 06.
const checkout = new PkiCertificate("checkout", {
    dnsName: "checkout.internal.example",
    issuerGroup: "awspca.cert-manager.io",
    issuerKind: "AWSPCAClusterIssuer",
    issuerName: pca.requireOutput("clusterIssuerName") as pulumi.Output<string>,
    acmCertificateArn: monitoring.requireOutput("acmCertificateArn") as pulumi.Output<string>,
    alarmTopicArn: monitoring.requireOutput("alarmTopicArn") as pulumi.Output<string>,
}, { providers: [provider] });

const payments = new PkiCertificate("payments", {
    dnsName: "payments.internal.example",
    issuerGroup: "cert-manager.io",
    issuerKind: "Issuer",
    issuerName: "vault-pki",
}, { providers: [provider] });

export const checkoutSecret = checkout.secretName;
export const paymentsSecret = payments.secretName;
