import * as k8s from "@pulumi/kubernetes";
import * as kx from "@pulumi/kubernetesx";

const appLabels = { app: "nginx" };
const deployment = new kx.Deployment("nginx", {
  spec: {
    selector: { matchLabels: appLabels },
    template: {
      spec: {
        containers: [
          {
            image: "nginx",
          },
        ],
      },
    },
  },
}).createService({
  ports: [{ port: 80 }],
});

export const name = deployment.metadata.name;
