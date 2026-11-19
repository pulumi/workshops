import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as command from "@pulumi/command";

const config = new pulumi.Config();

export const clusterName = config.get("clusterName") ?? "cnpg-demo";
const nodeImage =
    config.get("nodeImage") ??
    "kindest/node:v1.37.0@sha256:a1ed56cfb0e7b93589bdf97c8cd566405a265939e3620fc4f5de89adff580ae5";
const renderToDirectory = config.get("renderToDirectory");

export const kubeconfigContext = `kind-${clusterName}`;

const CERT_MANAGER_NAMESPACE = "cert-manager";
const CNPG_SYSTEM_NAMESPACE = "cnpg-system";
const APP_NAMESPACE = "cnpg-demo";

let provider: k8s.Provider;

if (renderToDirectory) {
    // Presenter dry-run / offline verification: render manifests to a local
    // directory instead of touching a live cluster. No kind cluster, and no
    // command.local.Command, is created in this mode.
    provider = new k8s.Provider("k8s", {
        renderYamlToDirectory: renderToDirectory,
    });
} else {
    const kindCluster = new command.local.Command("kind-cluster", {
        create: `kind create cluster --name ${clusterName} --image ${nodeImage} --wait 90s`,
        delete: `kind delete cluster --name ${clusterName}`,
    });

    provider = new k8s.Provider(
        "k8s",
        {
            context: kubeconfigContext,
        },
        { dependsOn: [kindCluster] },
    );
}

const certManagerNs = new k8s.core.v1.Namespace(
    "cert-manager",
    { metadata: { name: CERT_MANAGER_NAMESPACE } },
    { provider },
);

const cnpgSystemNs = new k8s.core.v1.Namespace(
    "cnpg-system",
    { metadata: { name: CNPG_SYSTEM_NAMESPACE } },
    { provider },
);

const cnpgDemoNs = new k8s.core.v1.Namespace(
    "cnpg-demo",
    { metadata: { name: APP_NAMESPACE } },
    { provider },
);

// cert-manager. The Barman Cloud Plugin depends on cert-manager's CRDs
// (Certificate, Issuer) to mint its gRPC TLS material, so cert-manager's own
// CRDs must be installed here. Confirmed against
// deploy/charts/cert-manager/values.yaml at tag v1.21.2
// (github.com/cert-manager/cert-manager, fetched 2026-09-29): the deprecated
// top-level `installCRDs` boolean was replaced by `crds.enabled` / `crds.keep`,
// so CRD installation is enabled with `crds.enabled: true`.
const certManagerChart = new k8s.helm.v4.Chart(
    "cert-manager",
    {
        chart: "cert-manager",
        version: "1.21.2",
        repositoryOpts: {
            repo: "https://charts.jetstack.io",
        },
        namespace: CERT_MANAGER_NAMESPACE,
        values: {
            crds: {
                enabled: true,
            },
        },
    },
    { provider, dependsOn: [certManagerNs] },
);

// CloudNativePG operator. Chart defaults are sufficient for the workshop; the
// chart's optional Grafana dashboard subchart
// (monitoring.grafanaDashboard.create) defaults to false and is left untouched.
const cnpgOperatorChart = new k8s.helm.v4.Chart(
    "cnpg-operator",
    {
        chart: "cloudnative-pg",
        version: "0.29.1",
        repositoryOpts: {
            repo: "https://cloudnative-pg.github.io/charts",
        },
        namespace: CNPG_SYSTEM_NAMESPACE,
    },
    { provider, dependsOn: [cnpgSystemNs] },
);

// Barman Cloud Plugin. Must land in the same namespace as the CNPG operator
// (per the chart's own README) and requires cert-manager to already be ready:
// by default it creates its own self-signed Issuer plus client/server
// Certificates (certificate.createIssuer / createClientCertificate /
// createServerCertificate all default to true in
// charts/plugin-barman-cloud/values.yaml at tag plugin-barman-cloud-v0.8.0,
// fetched 2026-09-29), so no values beyond namespace are required.
const barmanPluginChart = new k8s.helm.v4.Chart(
    "barman-cloud-plugin",
    {
        chart: "plugin-barman-cloud",
        version: "0.8.0",
        repositoryOpts: {
            repo: "https://cloudnative-pg.github.io/charts",
        },
        namespace: CNPG_SYSTEM_NAMESPACE,
    },
    { provider, dependsOn: [certManagerChart, cnpgOperatorChart] },
);

export const certManagerNamespace = certManagerNs.metadata.name;
export const cnpgSystemNamespace = cnpgSystemNs.metadata.name;
export const appNamespace = cnpgDemoNs.metadata.name;
