import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const stackRef = new pulumi.StackReference("k8s-cluster", {
  name: `${pulumi.getOrganization()}/k8s-better-together-eks-cluster/dev`
});

const kubeconfig = stackRef.getOutput("kubeconfig");

const k8sProvider = new k8s.Provider("k8s-provider", {
  kubeconfig: kubeconfig,
});

new k8s.apps.v1.Deployment("nginx-deployment", {
  metadata: {
    name: "nginx-deployment",
    labels: { app: "nginx" },
  },
  spec: {
    replicas: 1,
    selector: { matchLabels: { app: "nginx" } },
    template: {
      metadata: { labels: { app: "nginx" } },
      spec: {
        containers: [
          {
            name: "nginx",
            image: "nginx:1.27.2",
            ports: [{ containerPort: 80 }],
          },
        ],
      },
    },
  },
}, { provider: k8sProvider });

const nginxService = new k8s.core.v1.Service("nginx-service", {
  metadata: { name: "nginx-service" },
  spec: {
    selector: { app: "nginx" },
    type: "LoadBalancer",
    ports: [{ port: 80, targetPort: 80 }],
  },
}, { provider: k8sProvider });

export const url = pulumi.interpolate`http://${nginxService.status.loadBalancer.ingress[0].hostname}`;