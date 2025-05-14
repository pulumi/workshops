import {talos} from "@ediri/talos-go-component";


const talosCluster = new talos.TalosCluster("talos-cluster", {
    clusterName: "example-cluster",
    countControlPlane: 3,
    countWorker: 1,
    region: "lon1",
    size: "s-2vcpu-4gb",
    version: "v1.9.5",
})

export const kubeconfig = talosCluster.kubeconfig
