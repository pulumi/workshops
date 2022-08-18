+++
title = "Creating a Namespace"
chapter = false
weight = 20
+++

Next, declare a [namespace object](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/). This will scope your objects to a name of your choosing, so that in this workshop you won't accidentally interfere with other participants.

Append this to your `index.ts` file, replacing `eks-infrastructure` with your own name and referencing the Provider created in the previous step:

```typescript
const ns = new k8s.core.v1.Namespace("app-ns", {
    metadata: { name: "eks-demo-apps" },
}, { provider });
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

const ns = new k8s.core.v1.Namespace("eks-demo-apps-ns", {
    metadata: { name: "eks-demo-apps" },
}, { provider });
```
