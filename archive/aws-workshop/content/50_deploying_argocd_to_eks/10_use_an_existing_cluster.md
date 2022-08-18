+++
title = "Use an Existing Kubernetes Cluster"
chapter = false
weight = 10
+++

Configure the use of a [StackReference][stack-refs] to the Kubernetes cluster
stack to extract and use the kubeconfig. This can be found in the previous lab.

Let's start by adding these imports to your `index.ts` file:

```typescript
import * as k8s from "@pulumi/kubernetes";
```

Create a StackReference to the Kubernetes cluster stack using the config
`clusterStackRef` stack setting.

```typescript
const pulumiConfig = new pulumi.Config();

// Existing Pulumi stack reference in the format:
// <organization>/<project>/<stack> e.g. "myUser/myProject/dev"
const clusterStackRef = new pulumi.StackReference(pulumiConfig.require("clusterStackRef"));
```

Next, we need to declare a new Kubernetes provider based on the kubeconfig created in
the cluster stack. To do this, add this to your `index.ts` file

```typescript
// Get the kubeconfig from the cluster stack output.
const kubeconfig = clusterStackRef.getOutput("kubeconfig");

// Create the k8s provider with the kubeconfig.
const provider = new k8s.Provider("k8sProvider", { kubeconfig });
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
const provider = new k8s.Provider("k8sProvider", {kubeconfig});
```

[stack-refs]: https://www.pulumi.com/docs/intro/concepts/organizing-stacks-projects/#inter-stack-dependencies
