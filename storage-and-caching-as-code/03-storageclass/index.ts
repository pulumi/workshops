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

const className = config.get("storageClassName") ?? "longhorn-workshop";

const longhornWorkshop = new k8s.storage.v1.StorageClass("longhorn-workshop", {
    metadata: {
        name: className,
        // Explicitly not the default class, so other workloads are untouched.
        annotations: { "storageclass.kubernetes.io/is-default-class": "false" },
    },
    provisioner: "driver.longhorn.io",
    allowVolumeExpansion: true,
    reclaimPolicy: "Delete",
    volumeBindingMode: "Immediate",
    parameters: {
        // Two copies of every volume, on two different nodes.
        numberOfReplicas: "2",
        staleReplicaTimeout: "30",
        fsType: "ext4",
    },
}, opts);

export const storageClassName = longhornWorkshop.metadata.name;
export const replicas = longhornWorkshop.parameters.apply(p => p?.numberOfReplicas);
