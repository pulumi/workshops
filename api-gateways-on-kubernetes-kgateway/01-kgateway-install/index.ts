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
// "read" or "diff" step, so Pulumi cannot detect drift (someone deleting the
// cluster by hand outside of `pulumi destroy`, for instance). The
// `triggers` below cover the one drift case that matters for this
// workshop: editing `kind.yaml` between runs.
const clusterName = "api-gateways-workshop-demo";

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
    create: `kind create cluster --config kind.yaml --name ${clusterName} --wait 120s`,
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
// kind, and no docker/kubectl installed (this build workstation). It is
// never combined with `context` on the same provider: exactly one of the
// two sourcing modes is active per run.
const config = new pulumi.Config();
const renderYamlToDirectory = config.get("renderYamlToDirectory");
const provider = renderYamlToDirectory
    ? new k8s.Provider("k8s", { renderYamlToDirectory })
    : new k8s.Provider("k8s", { context: kubeconfigContext }, { dependsOn: [cluster] });

// kgateway's own controller and CRDs live in this namespace throughout the
// workshop; the workshop's own resources (Gateway, HTTPRoutes, backends)
// live in a separate `gateway-demo` namespace created in `03-gateway`, kept
// apart from the controller's system namespace.
const controllerNamespace = "kgateway-system";
const namespaceRes = new k8s.core.v1.Namespace("kgateway-system", {
    metadata: { name: controllerNamespace },
}, { provider });

// Upstream Gateway API CRDs, standard channel. kgateway 2.4.x is
// conformant to the Gateway API spec for the standard channel, and both
// HTTPRoute path and header matching (used in `05-path-routing` and
// `06-header-routing`) are core/GA fields of that channel, not
// experimental-only -- the experimental channel is not needed here.
// https://kgateway.dev/docs/envoy/latest/quickstart/ (read 2026-09-28)
// https://kgateway.dev/docs/envoy/latest/reference/versions/ (read 2026-09-28)
// https://www.pulumi.com/registry/packages/kubernetes/api-docs/yaml/v2/configfile/ (read 2026-09-28)
const gatewayApiCrds = new k8s.yaml.v2.ConfigFile("gateway-api-crds", {
    file: "https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.6.1/standard-install.yaml",
}, { provider });

// kgateway ships its own CRDs (distinct from the upstream Gateway API CRDs
// above) in a separate chart, installed before the controller chart per the
// official quickstart's own install order. Both charts are OCI artifacts;
// `chart: "oci://..."` plus `version` is the documented form for an OCI
// chart reference on `helm.v4.Chart`.
// https://kgateway.dev/docs/envoy/latest/quickstart/ (read 2026-09-28)
// https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/ (read 2026-09-28)
const kgatewayCrdsChart = new k8s.helm.v4.Chart("kgateway-crds", {
    chart: "oci://cr.kgateway.dev/kgateway-dev/charts/kgateway-crds",
    version: "2.4.5",
    namespace: namespaceRes.metadata.name,
    values: {
        controller: { image: { pullPolicy: "Always" } },
    },
}, { provider, dependsOn: [gatewayApiCrds] });

const kgatewayChart = new k8s.helm.v4.Chart("kgateway", {
    chart: "oci://cr.kgateway.dev/kgateway-dev/charts/kgateway",
    version: "2.4.5",
    namespace: namespaceRes.metadata.name,
    values: {
        controller: { image: { pullPolicy: "Always" } },
    },
}, { provider, dependsOn: [kgatewayCrdsChart] });

// `02-gatewayclass` and later projects read these via `pulumi.StackReference`
// rather than hardcoding the cluster name or namespace a second time.
export { kubeconfigContext, clusterName };
export const namespace = namespaceRes.metadata.name;
