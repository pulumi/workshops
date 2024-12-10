import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const stackRef = new pulumi.StackReference("k8s-cluster", {
  name: `${pulumi.getOrganization()}/k8s-better-together-eks-cluster/dev`
});

const kubeconfig = stackRef.getOutput("kubeconfig");

const k8sProvider = new k8s.Provider("k8s-provider", {
  kubeconfig: kubeconfig,
});

new k8s.yaml.ConfigFile("nginx-deployment", {
  file: "yaml/nginx-deployment.yaml"
}, {
  provider: k8sProvider
});

const service = new k8s.yaml.ConfigFile("nginx-service", {
  file: "yaml/nginx-service.yaml"
}, {
  provider: k8sProvider
});

// TODO: Get this working:
//export const url = pulumi.interpolate`http://${service.getResourceProperty("v1/Service", "nginx-service-yaml", "status").loadBalancer.ingress[0].hostname}`;