import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const org = pulumi.getOrganization();
const cluster = new pulumi.StackReference(`${org}/pki-02-eks-cluster/dev`);
const kubeconfig = cluster.requireOutput("kubeconfig");

// Set renderYamlToDirectory to write manifests instead of talking to a cluster (offline check).
const renderYamlToDirectory = new pulumi.Config().get("renderYamlToDirectory");
const provider = new k8s.Provider("eks", renderYamlToDirectory
    ? { renderYamlToDirectory }
    : { kubeconfig: kubeconfig.apply(k => typeof k === "string" ? k : JSON.stringify(k)) });
const issuers = new pulumi.StackReference(`${org}/pki-04-cert-manager-pca-issuer/dev`);
const clusterIssuerName = issuers.requireOutput("clusterIssuerName") as pulumi.Output<string>;

// A two hour certificate that renews after one hour, so the audience sees a renewal within the session.
// cert-manager requires duration > renewBefore, a minimum duration of 1h and a minimum renewBefore of 5m.
const certificate = new k8s.apiextensions.CustomResource("demo-internal", {
    apiVersion: "cert-manager.io/v1",
    kind: "Certificate",
    metadata: { name: "demo-internal", namespace: "default" },
    spec: {
        secretName: "demo-internal-tls",
        commonName: "demo.internal.example",
        dnsNames: ["demo.internal.example"],
        duration: "2h",
        renewBefore: "1h",
        issuerRef: {
            group: "awspca.cert-manager.io",
            kind: "AWSPCAClusterIssuer",
            name: clusterIssuerName,
        },
    },
}, { provider });

export const certificateName = certificate.metadata.name;
export const secretName = "demo-internal-tls";
