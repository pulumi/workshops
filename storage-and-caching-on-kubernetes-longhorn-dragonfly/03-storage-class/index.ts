import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

// kubeconfigContext comes from 01-cluster directly; chartNamespace from
// 02-longhorn is read purely to give this project an explicit
// StackReference dependency on the Longhorn chart actually being deployed
// before this StorageClass is applied against a live cluster (the
// provisioner `driver.longhorn.io` only works once Longhorn's CSI driver
// pods are running).
const config = new pulumi.Config();
const clusterStackRefName = config.get("clusterStackRef") || "<org>/storage-caching-cluster/dev";
const longhornStackRefName = config.get("longhornStackRef") || "<org>/storage-caching-longhorn/dev";
const clusterStackRef = new pulumi.StackReference(clusterStackRefName);
const longhornStackRef = new pulumi.StackReference(longhornStackRefName);
const kubeconfigContext = clusterStackRef.getOutput("kubeconfigContext");
const longhornChartNamespace = longhornStackRef.getOutput("chartNamespace");

const renderYamlToDirectory = config.get("renderYamlToDirectory");
const provider = renderYamlToDirectory
    ? new k8s.Provider("k8s", { renderYamlToDirectory })
    : new k8s.Provider("k8s", { context: kubeconfigContext });

// Pulumi cannot express a dependency on a resource in another stack --
// each numbered folder here is its own `pulumi up`, run in order, and
// `longhornChartNamespace` above exists only to fail this project's own
// preview/up loudly if 02-longhorn's stack has no such output (for
// instance, it was never deployed), rather than to build an in-graph
// dependency edge.
const storageClass = new k8s.storage.v1.StorageClass("longhorn-workshop", {
    metadata: {
        name: "longhorn-workshop",
        // Deliberately NOT annotated
        // `storageclass.kubernetes.io/is-default-class: "true"` -- this
        // class is additive, not a replacement for whatever the cluster's
        // own default is. 02-longhorn's chart values keep the chart's own
        // bundled StorageClass from claiming that role too.
    },
    provisioner: "driver.longhorn.io",
    allowVolumeExpansion: true,
    reclaimPolicy: "Delete",
    volumeBindingMode: "Immediate",
    parameters: {
        numberOfReplicas: "3",
        staleReplicaTimeout: "30",
        fromBackup: "",
        fsType: "ext4",
    },
}, { provider });

// Force this project to actually read the value (and thus fail its own
// preview/up if 02-longhorn's stack never exported it), without pretending
// it forms a Pulumi dependency edge across stacks.
longhornChartNamespace.apply((ns) => ns);

export const storageClassName = storageClass.metadata.name;
