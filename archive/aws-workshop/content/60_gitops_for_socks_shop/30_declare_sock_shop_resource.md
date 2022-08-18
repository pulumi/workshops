+++
title = "Declare a Sock Shop Custom Resource"
chapter = false
weight = 30
+++

Let's look up the namespace in which ArgoCD has been deployed by using the StackReference registered before:

```typescript
const argoCDNamespace = argoStackRef.getOutput("argoNamespace");
```

Now, let's register an Argo Application in the Kubernetes API using a CustomResource:

```typescript
const sockshop = new k8s.apiextensions.CustomResource(
    "sock-shop",
    {
        apiVersion: "argoproj.io/v1alpha1",
        kind: "Application",
        metadata: {
            namespace: argoCDNamespace, // the ns where argocd is deployed
            name: name, // name of app in ArgoCd
        },
        spec: {
            destination: {
                namespace: ns.metadata.name,
                server: "https://kubernetes.default.svc",
            },
            project: "default",
            source: {
                path: "sock-shop",
                repoURL: "https://github.com/argoproj/argocd-example-apps",
                targetRevision: "HEAD",
            },
            syncPolicy: {
                automated: {}
            }
        }
    },
    {provider: provider}
);

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
const argoStackRef = new pulumi.StackReference(pulumiConfig.require("argoCDStackRef"))

// Get the kubeconfig from the cluster stack output.
const kubeconfig = clusterStackRef.getOutput("kubeconfig");
const argoCDNamespace = argoStackRef.getOutput("argoNamespace");

// Create the k8s provider with the kubeconfig.
const provider = new k8s.Provider("k8sProvider", {kubeconfig});

// Declare a Namespace in which to deploy argocd
const name = "sock-shop"
const ns = new k8s.core.v1.Namespace("sock-shop-ns", {
    metadata: { name: name },
}, { provider });

const sockshop = new k8s.apiextensions.CustomResource(
    "sock-shop",
    {
        apiVersion: "argoproj.io/v1alpha1",
        kind: "Application",
        metadata: {
            namespace: argoCDNamespace, // the ns where argocd is deployed
            name: name, // name of app in ArgoCd
        },
        spec: {
            destination: {
                namespace: ns.metadata.name,
                server: "https://kubernetes.default.svc",
            },
            project: "default",
            source: {
                path: "sock-shop",
                repoURL: "https://github.com/argoproj/argocd-example-apps",
                targetRevision: "HEAD",
            },
            syncPolicy: {
                automated: {}
            }
        }
    },
    {provider: provider}
);
```
