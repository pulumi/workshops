import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as command from "@pulumi/command";
import * as path from "path";

const config = new pulumi.Config();
const clusterName = config.get("clusterName") ?? "gpu-batch";
// Pinned: Volcano chart 1.15.3 (app version 1.15.3, released 2026-09-30), read on 2026-10-04.
const volcanoVersion = config.get("volcanoVersion") ?? "1.15.3";
const volcanoRepo = "https://volcano-sh.github.io/helm-charts";
// kind has no GPUs. Each of the two workers advertises this many fake `example.com/gpu`
// units, so gang scheduling and queues behave exactly as they would with real GPUs.
const gpusPerWorker = config.getNumber("gpusPerWorker") ?? 4;
const gpuResource = "example.com/gpu";
// Offline verification only: render manifests instead of talking to a cluster.
const renderDir = config.get("renderYamlToDirectory");

const here = __dirname;
const stateDir = path.join(here, ".state");
const kubeconfigPath = path.join(stateDir, "kubeconfig");

// 1. The kind cluster: one control plane, two workers. kind has no Pulumi provider, so a
//    local.Command drives it. `create` prints the kubeconfig on stdout, which feeds the
//    Kubernetes provider below.
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

// 2. Advertise fake GPUs on the workers by patching node status. Changing gpusPerWorker
//    re-runs the command, which is how 03-jobs/grow-gpus.sh adds capacity.
const workers = [`${clusterName}-worker`, `${clusterName}-worker2`];
const patch = JSON.stringify([{ op: "add", path: `/status/capacity/${gpuResource.replace("/", "~1")}`, value: String(gpusPerWorker) }]);
const gpus = new command.local.Command("advertise-gpus", {
    create: workers.map(n =>
        `kubectl --kubeconfig "${kubeconfigPath}" patch node ${n} --subresource=status --type=json -p '${patch}'`).join(" && "),
    triggers: [gpusPerWorker],
}, { dependsOn: [cluster] });

// A provider is either a live cluster (kubeconfig) or a render target, never both.
const provider = renderDir
    ? new k8s.Provider("k8s", { renderYamlToDirectory: renderDir })
    : new k8s.Provider("k8s", { kubeconfig }, { dependsOn: [cluster] });

const ns = new k8s.core.v1.Namespace("volcano-ns", {
    metadata: { name: "volcano-system" },
}, { provider });

// 3. The Volcano scheduler, controllers and admission webhooks from the official chart.
const volcano = new k8s.helm.v4.Chart("volcano", {
    chart: "volcano",
    version: volcanoVersion,
    namespace: ns.metadata.name,
    repositoryOpts: { repo: volcanoRepo },
}, { provider, dependsOn: [gpus] });

export const clusterNameOut = clusterName;
export const kubeconfigFile = kubeconfigPath;
export { kubeconfig };
export const volcanoNamespace = ns.metadata.name;
export const volcanoChartVersion = volcanoVersion;
export const volcanoChart = volcano.urn;
export const gpusPerWorkerOut = gpusPerWorker;
