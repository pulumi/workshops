import * as path from "path";
import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as command from "@pulumi/command";

// A local kind cluster (CPU-only) plus the Volcano batch scheduler, installed
// from its official Helm chart. Every other project in this workshop assumes
// a cluster reachable at kubeconfig context "kind-<CLUSTER_NAME>", so the
// name is a plain shared constant repeated in each project rather than
// passed downstream through a StackReference -- it keeps every numbered
// folder independently runnable and independently offline-renderable.
export const CLUSTER_NAME = "gpu-batch-demo";
export const VOLCANO_NAMESPACE = "volcano-system";

const config = new pulumi.Config();

// Offline/CI rendering: `pulumi config set renderYamlToDirectory <dir>`
// writes the Helm release's manifests to disk instead of touching a real
// cluster. Useful to validate this program without kind or Docker installed.
const renderDir = config.get("renderYamlToDirectory");

// Chart version intentionally left unpinned here: this run could not confirm
// the Helm chart's own version number (as opposed to the v1.15.2 app/release
// version) from the chart repo index -- see README "Sources". Pin it with
// `helm search repo volcano-sh/volcano --versions` before a real delivery,
// then set it via `pulumi config set volcanoChartVersion <version>`.
const volcanoChartVersion = config.get("volcanoChartVersion");

const kindConfigPath = path.join(__dirname, "kind-config.yaml");

const cluster = new command.local.Command("kind-cluster", {
    create: `kind create cluster --name ${CLUSTER_NAME} --config ${kindConfigPath} --wait 120s`,
    delete: `kind delete cluster --name ${CLUSTER_NAME}`,
});

const k8sProvider = new k8s.Provider(
    "k8s",
    renderDir
        ? { renderYamlToDirectory: renderDir }
        : { context: `kind-${CLUSTER_NAME}` },
    { dependsOn: [cluster] },
);

const volcanoSystem = new k8s.core.v1.Namespace(
    "volcano-system",
    { metadata: { name: VOLCANO_NAMESPACE } },
    { provider: k8sProvider },
);

const volcano = new k8s.helm.v4.Chart(
    "volcano",
    {
        chart: "volcano",
        version: volcanoChartVersion,
        namespace: VOLCANO_NAMESPACE,
        repositoryOpts: { repo: "https://volcano-sh.github.io/helm-charts" },
    },
    { provider: k8sProvider, dependsOn: [volcanoSystem] },
);

export const kubeconfigContext = `kind-${CLUSTER_NAME}`;
export const volcanoNamespace = VOLCANO_NAMESPACE;
export const volcanoRelease = volcano.urn;
