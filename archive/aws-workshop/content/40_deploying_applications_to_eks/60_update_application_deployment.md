+++
title = "Update Application Version"
chapter = false
weight = 60
+++

Next, you'll make two changes to the application:

* Scale out to 3 replicas, instead of just 1.
* Update the version of your application by changing its container image tag

Note that the application says `Hello Kubernetes bootcamp! | Running on: app-dep-9p399mj2-6c7cdd7d79-7w7vj | v=1`. After deploying, this will change.

First update your deployment's configuration's replica count:

```
  replicas=3,
```

And then update its image to:

```
  image="jocatalin/kubernetes-bootcamp:v2",
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

const appLabels = { app: "eks-demo-apps" };
const deployment = new k8s.apps.v1.Deployment("eks-demo-apps-dep", {
    metadata: { namespace: ns.metadata.name },
    spec: {
        selector: { matchLabels: appLabels },
        replicas: 3,
        template: {
            metadata: { labels: appLabels },
            spec: {
                containers: [{
                    name: "eks-demo-apps",
                    image: "jocatalin/kubernetes-bootcamp:v2",
                }],
            },
        },
    },
}, { provider });

const service = new k8s.core.v1.Service("eks-demo-apps-svc", {
    metadata: { namespace: ns.metadata.name },
    spec: {
        selector: appLabels,
        ports: [{ port: 80, targetPort: 8080 }],
        type: "LoadBalancer",
    },
}, { provider });

const address = service.status.loadBalancer.ingress[0].hostname;
const port = service.spec.ports[0].port;
export const url = pulumi.interpolate`http://${address}:${port}`;

```

Deploy the changes:

```bash
pulumi up
```

This will show you a preview and, after selecting `yes`, the application will be deployed:

```
Updating (dev):

     Type                           Name               Status      Info
     pulumi:pulumi:Stack            eks-demo-apps-dev              
 ~   └─ kubernetes:apps:Deployment  eks-demo-apps-dep  updated     [diff: ~spec]

Outputs:
    url: "http://ae7c37b7c510511eab4540a6f2211784-521581596.us-west-2.elb.amazonaws.com:80"

Resources:
    ~ 1 updated
    4 unchanged

Duration: 29s

Permalink: https://app.pulumi.com/workshops/eks-demo-apps/dev/updates/2
```

Query the pods again using your chosen namespace from earlier:

```bash
kubectl get pods --namespace eks-demo-apps
```

Check that there are now three:

```
NAME                                READY   STATUS    RESTARTS   AGE
app-dep-9p399mj2-69c7fd4657-79wcp   1/1     Running   0          3m19s
app-dep-9p399mj2-69c7fd4657-dlx4p   1/1     Running   0          3m16s
app-dep-9p399mj2-69c7fd4657-mrvtt   1/1     Running   0          3m30s
```

Finally, curl the endpoint again:

```bash
curl $(pulumi stack output url)
```

And verify that the output now ends in `v=2`, instead of `v=1` (the result of the new container image):

```
Hello Kubernetes bootcamp! | Running on: app-dep-8r1febnu-6cd57d964-c76rx | v=2
```

If you'd like, do it a few more times, and observe that traffic will be load balanced across the three pods:

```bash
for i in {0..10}; do curl $(pulumi stack output url); done
```
