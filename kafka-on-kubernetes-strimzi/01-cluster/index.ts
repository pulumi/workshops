import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as command from "@pulumi/command";
import * as path from "path";

const config = new pulumi.Config();
const clusterName = config.get("clusterName") ?? "kafka-workshop";
// Pinned: verified against the Strimzi releases page and `helm show chart` on 2026-10-04.
const strimziVersion = config.get("strimziVersion") ?? "1.2.0";
const namespace = config.get("namespace") ?? "kafka";
// Offline verification only: render manifests instead of talking to a cluster.
const renderDir = config.get("renderYamlToDirectory");

const here = __dirname;
const stateDir = path.join(here, ".state");
const kubeconfigPath = path.join(stateDir, "kubeconfig");

// 1. The kind cluster: three workers, the kubeconfig goes to .state/kubeconfig.
//    kind has no Pulumi provider, so a local.Command drives it. `create` prints the
//    kubeconfig on stdout, which feeds the Kubernetes provider below.
const cluster = new command.local.Command("kind-cluster", {
    create: `mkdir -p "${stateDir}" && ` +
        `(kind get clusters | grep -qx "${clusterName}" || ` +
        `kind create cluster --name "${clusterName}" --config "${here}/kind-config.yaml" ` +
        `--kubeconfig "${kubeconfigPath}" --wait 180s >&2) && ` +
        `kind get kubeconfig --name "${clusterName}" | tee "${kubeconfigPath}"`,
    delete: `kind delete cluster --name "${clusterName}" && rm -f "${kubeconfigPath}"`,
    // Re-create only when the name changes, never on a stdout diff.
    triggers: [clusterName],
});

const kubeconfig = pulumi.secret(cluster.stdout);

// A provider is either a live cluster (kubeconfig) or a render target, never both.
const provider = renderDir
    ? new k8s.Provider("k8s", { renderYamlToDirectory: renderDir })
    : new k8s.Provider("k8s", { kubeconfig }, { dependsOn: [cluster] });

const ns = new k8s.core.v1.Namespace("kafka-ns", {
    metadata: { name: namespace },
}, { provider });

// 2. The Strimzi Cluster Operator. The chart is published as an OCI artifact only.
const operator = new k8s.helm.v4.Chart("strimzi-operator", {
    chart: "oci://quay.io/strimzi-helm/strimzi-kafka-operator",
    version: strimziVersion,
    namespace: ns.metadata.name,
    values: {
        // Watch only the kafka namespace.
        watchNamespaces: [namespace],
    },
}, { provider });

export const clusterNameOut = clusterName;
export const kubeconfigFile = kubeconfigPath;
export { kubeconfig };
export const kafkaNamespace = ns.metadata.name;
export const operatorVersion = strimziVersion;
export const operatorChart = operator.urn;
