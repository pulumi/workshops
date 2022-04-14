import * as pulumi from "@pulumi/pulumi";
import * as civo from "@pulumi/civo";
import * as kubernetes from "@pulumi/kubernetes";

const network = new civo.Network("network-two", {
  label: "pulumi-workshop",
});

const firewall = new civo.Firewall("firewall-two", {
  networkId: network.id,
});

const cluster = new civo.KubernetesCluster("cluster", {
  name: "cluster",
  networkId: network.id,
  firewallId: firewall.id,
  applications: "metrics-server,-Traefik-v2-nodeport",
  pools: {
    nodeCount: 2,
    size: "g4s.kube.xsmall",
  },
});

const provider = new kubernetes.Provider("provider", {
  kubeconfig: cluster.kubeconfig,
});

const deployment = new kubernetes.apps.v1.Deployment(
  "nginx",
  {
    spec: {
      replicas: 3,
      selector: { matchLabels: { app: "nginx" } },
      template: {
        metadata: {
          labels: { app: "nginx" },
        },
        spec: {
          containers: [
            {
              name: "nginx",
              image: "nginx:1.14.2",
              ports: [{ containerPort: 80 }],
            },
          ],
        },
      },
    },
  },
  {
    provider,
  }
);

const service = new kubernetes.core.v1.Service(
  "nginx",
  {
    spec: {
      type: "NodePort",
      selector: { app: "nginx" },
      ports: [{ protocol: "TCP", port: 80 }],
    },
  },
  {
    provider,
  }
);

export const nginxUrl = pulumi
  .all([cluster.masterIp, service.spec.ports[0].nodePort])
  .apply(([clusterIp, nodePort]) => `http://${clusterIp}:${nodePort}`);
export const kubeconfig = cluster.kubeconfig;
