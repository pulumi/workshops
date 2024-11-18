import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const stackRef = new pulumi.StackReference("k8s-cluster", {
  name: `${pulumi.getOrganization()}/k8s-better-together-eks-cluster/dev`
});

const kubeconfig = stackRef.getOutput("kubeconfig");

const k8sProvider = new k8s.Provider("k8s-provider", {
  kubeconfig: kubeconfig,
});

const wordpress = new k8s.helm.v4.Chart("wordpress", {
  chart: "oci://registry-1.docker.io/bitnamicharts/wordpress",
  values: {
    // The EBC CSI driver creates the gp2 storage class by default, so we need
    // to tell the Helm chart to use this class:
    global: {
      storageClass: "gp2"
    }
  }
}, {
  provider: k8sProvider
});

