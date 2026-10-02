import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

// One Provider per project. Online it talks to the kind cluster through its
// kubeconfig context. Offline (preview without a cluster) set
// `renderYamlToDirectory` and it writes manifests instead. The provider rejects
// both settings together, so exactly one of them is ever passed.
const config = new pulumi.Config();
const renderDir = config.get("renderYamlToDirectory");
const provider = new k8s.Provider(
    "k8s",
    renderDir
        ? { renderYamlToDirectory: renderDir }
        : { context: config.get("kubeContext") ?? "kind-storage-workshop" },
);
const opts: pulumi.CustomResourceOptions = { provider };

// Chart version pinned to the 1.13.0 release that the Longhorn install docs show
// (https://longhorn.io/docs/latest/deploy/install/install-with-helm/).
const longhornChartVersion = "1.13.0";

const longhorn = new k8s.helm.v3.Release("longhorn", {
    name: "longhorn",
    chart: "longhorn",
    version: longhornChartVersion,
    repositoryOpts: { repo: "https://charts.longhorn.io" },
    namespace: "longhorn-system",
    createNamespace: true,
    // Longhorn pulls several images and starts a manager on every node.
    timeout: 900,
    values: {
        persistence: {
            // Do not let Longhorn take over the cluster's default StorageClass.
            // Step 3 adds an explicit, non-default class instead.
            defaultClass: false,
        },
        defaultSettings: {
            // Longhorn refuses to uninstall unless this setting is true.
            // https://longhorn.io/docs/latest/deploy/uninstall/
            deletingConfirmationFlag: true,
        },
    },
}, opts);

export const releaseName = longhorn.name;
export const releaseNamespace = longhorn.namespace;
export const chartVersion = longhorn.version;
