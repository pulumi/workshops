+++
title = "Declare an Application Deployment Object"
chapter = false
weight = 30
+++

You'll now declare a [deployment object](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/), which deploys a specific set of containers to the cluster and scales them. In this case, you'll deploy the pre-built `gcr.io/google-samples/kubernetes-bootcamp:v1` container image with only a single replica.

Append this to your `index.ts` file:

```typescript
const appLabels = { app: "eks-demo-apps" };
const deployment = new k8s.apps.v1.Deployment("eks-demo-apps-dep", {
    metadata: { namespace: ns.metadata.name },
    spec: {
        selector: { matchLabels: appLabels },
        replicas: 1,
        template: {
            metadata: { labels: appLabels },
            spec: {
                containers: [{
                    name: "eks-demo-apps",
                    image: "gcr.io/google-samples/kubernetes-bootcamp:v1",
                }],
            },
        },
    },
}, {provider});
```

{{% notice info %}}
The `index.ts` file should now have the following contents:
{{% /notice %}}
```typescript
import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const pulumiConfig = new pulumi.Config();

// Existing Pulumi stack reference in the format:
// <organization>/<project>/<stack> e.g. "myUser/myProject/dev"
const clusterStackRef = new pulumi.StackReference(pulumiConfig.require("clusterStackRef"));

// Get the kubeconfig from the cluster stack output.
const kubeconfig = clusterStackRef.getOutput("kubeconfig");

// Create the k8s provider with the kubeconfig.
const provider = new k8s.Provider("k8sProvider", { kubeconfig });

const ns = new k8s.core.v1.Namespace("app-ns", {
    metadata: { name: "eks-demo-apps" },
}, {provider});

const appLabels = { app: "eks-demo-apps" };
const deployment = new k8s.apps.v1.Deployment("eks-demo-apps-dep", {
    metadata: { namespace: ns.metadata.name },
    spec: {
        selector: { matchLabels: appLabels },
        replicas: 1,
        template: {
            metadata: { labels: appLabels },
            spec: {
                containers: [{
                    name: "eks-demo-apps",
                    image: "gcr.io/google-samples/kubernetes-bootcamp:v1",
                }],
            },
        },
    },
}, { provider });
```
