import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import * as pulumi from "@pulumi/pulumi";
import * as command from "@pulumi/command";
import * as k8s from "@pulumi/kubernetes";

// kind has no Pulumi provider: there is no `kind.Cluster` resource to
// declare. This project models the cluster's lifecycle explicitly with
// `@pulumi/command`'s `local.Command`, running `kind create cluster` on
// create and `kind delete cluster` on delete, so `pulumi destroy` genuinely
// removes the cluster rather than leaving it running underneath a stack
// that claims to be gone.
//
// This is a deliberate, demo-only shortcut: `local.Command` has no real
// "read" or "diff" step, so Pulumi cannot detect drift (someone deleting
// the cluster by hand outside of `pulumi destroy`, for instance). The
// `triggers` below cover the one drift case that matters for this
// workshop: editing `kind.yaml` between runs.
const clusterName = "pg-workshop-demo";

const kindConfigPath = path.join(__dirname, "kind.yaml");
const kindConfigContent = fs.readFileSync(kindConfigPath, "utf-8");
const kindConfigHash = crypto
    .createHash("sha256")
    .update(kindConfigContent)
    .digest("hex");

// A demo re-run assumes teardown happened first (see `07-teardown`); a
// duplicate-name `kind create cluster` fails loudly rather than silently
// reusing whatever cluster is already there, which is the right failure
// mode for a workshop where the cluster's actual contents matter.
const cluster = new command.local.Command("kind-cluster", {
    create: `kind create cluster --config kind.yaml --name ${clusterName} --wait 90s`,
    delete: `kind delete cluster --name ${clusterName}`,
    dir: __dirname,
    triggers: [kindConfigHash, clusterName],
});

// kind names every cluster's kubeconfig context `kind-<name>` and writes it
// straight into `~/.kube/config` (kind's own default location; no
// `--kubeconfig` flag is passed anywhere in this workshop, so nothing
// overrides it). This is the base project that creates the cluster, so the
// provider below is built from this context string directly rather than a
// `pulumi.StackReference` -- there is no upstream stack to read it from.
const kubeconfigContext = `kind-${clusterName}`;

// `renderYamlToDirectory` lets `npx tsc --noEmit` and a config-driven
// `pulumi preview` run offline in an environment with no live cluster, no
// kind, and no docker/kubectl installed (this sandbox). It is never
// combined with `context` on the same provider: exactly one of the two
// sourcing modes is active per run.
const config = new pulumi.Config();
const renderYamlToDirectory = config.get("renderYamlToDirectory");
const provider = renderYamlToDirectory
    ? new k8s.Provider("k8s", { renderYamlToDirectory })
    : new k8s.Provider("k8s", { context: kubeconfigContext }, { dependsOn: [cluster] });

// cert-manager must exist, with its webhook Running, before the Barman
// Cloud plugin chart below: the plugin's CNPG-I gRPC endpoint is exposed
// through a cert-manager-issued TLS certificate (Certificate/Issuer CRs
// created by the plugin chart itself). Namespace created explicitly so the
// Helm release never has to guess at namespace-creation semantics.
// https://cloudnative-pg.io/plugin-barman-cloud/docs/installation/ (read 2026-09-27)
const certManagerNamespace = new k8s.core.v1.Namespace("cert-manager", {
    metadata: { name: "cert-manager" },
}, { provider });

// v1.21.2 is cert-manager's current release (read 2026-09-27, charts.jetstack.io).
// `crds.enabled: true` is the v4 Helm value name for the legacy
// `--set installCRDs=true` flag; the plugin's Certificate/Issuer CRDs and
// the operator's own CRDs both depend on cert-manager's CRDs existing.
const certManagerChart = new k8s.helm.v4.Chart("cert-manager", {
    chart: "cert-manager",
    version: "v1.21.2",
    namespace: certManagerNamespace.metadata.name,
    repositoryOpts: { repo: "https://charts.jetstack.io" },
    values: {
        crds: { enabled: true },
    },
}, { provider });

// The CNPG operator itself. Namespace created explicitly for the same
// reason as cert-manager's above.
const cnpgNamespace = new k8s.core.v1.Namespace("cnpg-system", {
    metadata: { name: "cnpg-system" },
}, { provider });

// Chart version 0.29.1 -> operator appVersion 1.30.1 (read 2026-09-23,
// cloudnative-pg.github.io/charts), which requires kubeVersion >=1.29.0-0 --
// satisfied by the kind node image pinned in kind.yaml (Kubernetes 1.37.0).
const cnpgOperatorChart = new k8s.helm.v4.Chart("cnpg-operator", {
    chart: "cloudnative-pg",
    version: "0.29.1",
    namespace: cnpgNamespace.metadata.name,
    repositoryOpts: { repo: "https://cloudnative-pg.github.io/charts" },
}, { provider });

// Barman Cloud plugin (CNPG-I): the brief's `spec.backup.barmanObjectStore`
// field has been deprecated since operator v1.26, so this is the current,
// supported backup path -- an out-of-tree plugin rather than a built-in
// operator feature. Chart version 0.8.0 -> plugin appVersion v0.15.0 (read
// 2026-09-27, cloudnative-pg.github.io/charts, same repo as the operator).
//
// The plugin MUST be installed into the operator's own namespace
// (cnpg-system): this is a documented, non-optional requirement, not a
// convenience choice -- the plugin registers itself with the operator over
// a Unix domain socket mounted from a shared hostPath/emptyDir that both
// pods expect to find under the operator's namespace.
// https://cloudnative-pg.io/plugin-barman-cloud/docs/installation/ (read 2026-09-27)
//
// `dependsOn` both cert-manager (its CRDs/webhook must exist for the
// plugin's own Certificate/Issuer resources to admit) and the CNPG operator
// (its CRDs and the plugin-registration mechanism must exist first).
const barmanCloudPluginChart = new k8s.helm.v4.Chart("plugin-barman-cloud", {
    chart: "plugin-barman-cloud",
    version: "0.8.0",
    namespace: cnpgNamespace.metadata.name,
    repositoryOpts: { repo: "https://cloudnative-pg.github.io/charts" },
}, { provider, dependsOn: [certManagerChart, cnpgOperatorChart] });

// `02-postgres-cluster` and later projects read these via
// `pulumi.StackReference` rather than hardcoding the cluster name or
// namespace a second time.
export { kubeconfigContext, clusterName };
export const operatorNamespace = "cnpg-system";
