+++
title = "Creating a Namespace"
chapter = false
weight = 20
+++

Next, declare a [namespace object](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/).
This will allow scoping the deployment of the ArcoCD components to that namespace.

To do this, we need to create a stack reference to the project where we created the eks infrastructure so we can get the
Kubeconfig and be able to build the correct kubernetes provider. We are going to make the stack reference name configurable:

```typescript
import * as pulumi from "@pulumi/pulumi";

const pulumiConfig = new pulumi.Config();

// Existing Pulumi stack reference in the format:
// <organization>/<project>/<stack> e.g. "myUser/myProject/dev"
const clusterStackRef = new pulumi.StackReference(pulumiConfig.require("clusterStackRef"));
```

Now we can get the kubeconfig from the eks cluster for use in our provider. Append this to your `index.ts` file:

```typescript
const provider = new k8s.Provider("k8s", { kubeconfig: eks.getOutput("kubeconfig") });
```

Now we can create the namespace using the provider we just created. Append this to your `index.ts` file:

```typescript
const name = "argocd"
const ns = new k8s.core.v1.Namespace("argocd-ns", {
    metadata: { name: name },
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

const provider = new k8s.Provider("k8s", { kubeconfig: clusterStackRef.getOutput("kubeconfig") });

const name = "argocd"
const ns = new k8s.core.v1.Namespace("argocd-ns", {
    metadata: { name: name },
}, { provider });
```
