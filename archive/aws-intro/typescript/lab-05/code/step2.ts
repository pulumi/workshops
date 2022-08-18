import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

let pulumiConfig = new pulumi.Config();

// Existing Pulumi stack reference in the format:
// <organization>/<project>/<stack> e.g. "myUser/myProject/dev"
const clusterStackRef = new pulumi.StackReference(pulumiConfig.require("clusterStackRef"));

// Get the kubeconfig from the cluster stack output.
const kubeconfig = clusterStackRef.getOutput("kubeconfig").apply(JSON.stringify);

// Create the k8s provider with the kubeconfig.
const provider = new k8s.Provider("k8sProvider", {kubeconfig});

const ns = new k8s.core.v1.Namespace("app-ns", {
    metadata: { name: "joe-duffy" },
}, {provider});
