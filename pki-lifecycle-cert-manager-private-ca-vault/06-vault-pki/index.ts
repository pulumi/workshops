import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as vault from "@pulumi/vault";

const org = pulumi.getOrganization();
const cluster = new pulumi.StackReference(`${org}/pki-02-eks-cluster/dev`);
const kubeconfig = cluster.requireOutput("kubeconfig");

// Set renderYamlToDirectory to write manifests instead of talking to a cluster (offline check).
const renderYamlToDirectory = new pulumi.Config().get("renderYamlToDirectory");
const provider = new k8s.Provider("eks", renderYamlToDirectory
    ? { renderYamlToDirectory }
    : { kubeconfig: kubeconfig.apply(k => typeof k === "string" ? k : JSON.stringify(k)) });
const config = new pulumi.Config();
// Dev mode root token. Set it once with: pulumi config set --secret vaultToken <token>
// (or let the ESC environment provide it). Dev mode is for the workshop only: in-memory, unsealed, not for production.
const vaultToken = config.requireSecret("vaultToken");
// Phase 2 switch: the Vault provider needs a reachable Vault, see port-forward.sh.
const vaultConfigure = config.getBoolean("vaultConfigure") ?? false;

const vaultRelease = new k8s.helm.v3.Release("vault", {
    name: "vault",
    chart: "vault",
    version: "0.34.1",
    namespace: "vault",
    createNamespace: true,
    repositoryOpts: { repo: "https://helm.releases.hashicorp.com" },
    values: {
        injector: { enabled: false },
        server: {
            dev: { enabled: true, devRootToken: vaultToken },
        },
    },
}, { provider });

export const vaultServiceAddress = "http://vault.vault.svc.cluster.local:8200";

if (vaultConfigure) {
    // Reached through `kubectl port-forward` (port-forward.sh), so the provider runs on the laptop.
    const vaultProvider = new vault.Provider("vault", {
        address: "http://127.0.0.1:8200",
        token: vaultToken,
        skipChildToken: true,
    }, { dependsOn: [vaultRelease] });

    const pki = new vault.Mount("pki", {
        path: "pki",
        type: "pki",
        description: "Workshop PKI",
        defaultLeaseTtlSeconds: 3600,
        maxLeaseTtlSeconds: 86400 * 365,
    }, { provider: vaultProvider });

    const rootCert = new vault.pkisecret.SecretBackendRootCert("root", {
        backend: pki.path,
        type: "internal",
        commonName: "Workshop Vault Root CA",
        ttl: "8760h",
        keyType: "rsa",
        keyBits: 4096,
        format: "pem",
        issuerName: "workshop-root",
    }, { provider: vaultProvider });

    const role = new vault.pkisecret.SecretBackendRole("internal", {
        backend: pki.path,
        name: "internal",
        allowedDomains: ["internal.example"],
        allowSubdomains: true,
        maxTtl: "7200",
        keyType: "rsa",
        keyBits: 2048,
    }, { provider: vaultProvider, dependsOn: [rootCert] });

    // cert-manager authenticates to Vault with a token held in a Secret (the simple option the docs show first).
    const tokenSecret = new k8s.core.v1.Secret("vault-token", {
        metadata: { name: "vault-token", namespace: "default" },
        stringData: { token: vaultToken },
    }, { provider });

    const issuer = new k8s.apiextensions.CustomResource("vault-issuer", {
        apiVersion: "cert-manager.io/v1",
        kind: "Issuer",
        metadata: { name: "vault-pki", namespace: "default" },
        spec: {
            vault: {
                server: vaultServiceAddress,
                path: pulumi.interpolate`${pki.path}/sign/${role.name}`,
                auth: { tokenSecretRef: { name: tokenSecret.metadata.name, key: "token" } },
            },
        },
    }, { provider });

    new k8s.apiextensions.CustomResource("demo-vault", {
        apiVersion: "cert-manager.io/v1",
        kind: "Certificate",
        metadata: { name: "demo-vault", namespace: "default" },
        spec: {
            secretName: "demo-vault-tls",
            commonName: "demo.internal.example",
            dnsNames: ["demo.internal.example"],
            duration: "2h",
            renewBefore: "1h",
            issuerRef: { group: "cert-manager.io", kind: "Issuer", name: issuer.metadata.name },
        },
    }, { provider });
}
