import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

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
            image: "nginx:1.19.10",
            ports: [{ containerPort: 80 }],
          },
        ],
      },
    },
  },
});


const nginxService = new k8s.core.v1.Service("nginx-service", {
  metadata: { name: "nginx-service" },
  spec: {
    selector: { app: "nginx" },
    type: "LoadBalancer",
    ports: [{ port: 80, targetPort: 80 }],
  },
});


export const url = pulumi.interpolate`http://${nginxService.status.loadBalancer.ingress[0].hostname}`;