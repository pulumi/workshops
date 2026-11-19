import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as k8s from "@pulumi/kubernetes";

const org = pulumi.getOrganization();
const cluster = new pulumi.StackReference(`${org}/pki-02-eks-cluster/dev`);
const ca = new pulumi.StackReference(`${org}/pki-03-private-ca/dev`);

const kubeconfig = cluster.requireOutput("kubeconfig");
const oidcProviderArn = cluster.requireOutput("oidcProviderArn") as pulumi.Output<string>;
const oidcProviderUrl = cluster.requireOutput("oidcProviderUrl") as pulumi.Output<string>;
const subordinateCaArn = ca.requireOutput("subordinateCaArn") as pulumi.Output<string>;

// Set renderYamlToDirectory to write manifests instead of talking to a cluster (offline check).
const renderYamlToDirectory = new pulumi.Config().get("renderYamlToDirectory");
const provider = new k8s.Provider("eks", renderYamlToDirectory
    ? { renderYamlToDirectory }
    : { kubeconfig: kubeconfig.apply(k => typeof k === "string" ? k : JSON.stringify(k)) });

const certManager = new k8s.helm.v3.Release("cert-manager", {
    name: "cert-manager",
    chart: "cert-manager",
    version: "v1.21.2",
    namespace: "cert-manager",
    createNamespace: true,
    repositoryOpts: { repo: "https://charts.jetstack.io" },
    values: {
        crds: { enabled: true },
        // The ServiceMonitor comes with kube-prometheus-stack in step 07.
        prometheus: { servicemonitor: { enabled: false } },
    },
}, { provider });

// IRSA: the issuer service account assumes this role through the cluster OIDC provider.
const issuerNamespace = "aws-privateca-issuer";
const issuerServiceAccount = "aws-privateca-issuer";

const assumeRole = aws.iam.getPolicyDocumentOutput({
    statements: [{
        effect: "Allow",
        actions: ["sts:AssumeRoleWithWebIdentity"],
        principals: [{ type: "Federated", identifiers: [oidcProviderArn] }],
        conditions: [
            {
                test: "StringEquals",
                variable: pulumi.interpolate`${oidcProviderUrl}:sub`,
                values: [`system:serviceaccount:${issuerNamespace}:${issuerServiceAccount}`],
            },
            {
                test: "StringEquals",
                variable: pulumi.interpolate`${oidcProviderUrl}:aud`,
                values: ["sts.amazonaws.com"],
            },
        ],
    }],
});

const issuerRole = new aws.iam.Role("pca-issuer", {
    assumeRolePolicy: assumeRole.json,
});

new aws.iam.RolePolicy("pca-issuer", {
    role: issuerRole.id,
    policy: aws.iam.getPolicyDocumentOutput({
        statements: [{
            effect: "Allow",
            actions: [
                "acm-pca:IssueCertificate",
                "acm-pca:GetCertificate",
                "acm-pca:DescribeCertificateAuthority",
            ],
            resources: [subordinateCaArn],
        }],
    }).json,
});

const pcaIssuer = new k8s.helm.v3.Release("aws-privateca-issuer", {
    name: "aws-privateca-issuer",
    chart: "aws-privateca-issuer",
    version: "v1.11.0",
    namespace: issuerNamespace,
    createNamespace: true,
    repositoryOpts: { repo: "https://cert-manager.github.io/aws-privateca-issuer" },
    values: {
        serviceAccount: {
            create: true,
            name: issuerServiceAccount,
            annotations: { "eks.amazonaws.com/role-arn": issuerRole.arn },
        },
    },
}, { provider, dependsOn: [certManager] });

const clusterIssuer = new k8s.apiextensions.CustomResource("pca-cluster-issuer", {
    apiVersion: "awspca.cert-manager.io/v1beta1",
    kind: "AWSPCAClusterIssuer",
    metadata: { name: "aws-pca" },
    spec: {
        arn: subordinateCaArn,
        region: new pulumi.Config("aws").require("region"),
    },
}, { provider, dependsOn: [pcaIssuer] });

export const clusterIssuerName = clusterIssuer.metadata.name;
export const issuerRoleArn = issuerRole.arn;
