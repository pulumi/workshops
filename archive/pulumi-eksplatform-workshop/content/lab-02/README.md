# Deploying to Kubernetes

In this lab, we'll install the Pulumi Kubernetes provider and provision some resources to Kubernetes.

## Step 1 &mdash; Install the Provider

Pulumi providers are install using the node.js package manager, NPM.

Install the Kubernetes provider like so:

```bash
npm install @pulumi/kubernetes
```

This installs both the Pulumi plugin, and Kubernetes SDK.

## Step 2 &mdash; Create a Namespace

We'll now need to import the Kubernetes package. In your `index.ts`, add the following line to the top of the file:

```typescript
import * as k8s from "@pulumi/kubernetes";

const config = new pulumi.Config();
const name = config.require("appName")
```

You can now use this library to provision a namespace. Add the following below this to create a namespace:

```typescript
const ns = new k8s.core.v1.Namespace(name, {
    metadata: {
        name: name,
    }
})
```

Notice, we're explicitly setting the name of the namespace using the metadata.

## Step 3 &mdash; Create a Deployment

Next, we need to create a namespace that runs inside that namespace. Update your `index.ts` to add the following:

```typescript
const labels = {
    "production-app": name,
}

const deployment = new k8s.apps.v1.Deployment(name, {
    metadata: {
        namespace: ns.metadata.name,
    },
    spec: {
        replicas: 1,
        selector: {
            matchLabels: labels
        },
        template: {
            metadata: {
                labels: labels
            },
            spec: {
                containers: [{
                    name: name,
                    image: "gcr.io/kuar-demo/kuard-amd64:blue",
                    ports: [{ name: "http", containerPort: 8080 }]
                }]
            }
        },
    }
})
```

We're hardcoding several values here like the image we're deploying - we'll come back and revist this later.

## Step 4 &mdash; Create a Service

Finally, let's deploy our service, which exposes this deployment so it can be accessed:

```typescript
const service = new k8s.core.v1.Service(name, {
    metadata: { labels: labels, namespace: ns.metadata.name },
    spec: { ports: [{ port: 8080, targetPort: "http" }], type: "LoadBalancer", selector: labels }
})
```

Notice for this example, we're using `Type: LoadBalancer` which will provision an ELB for us, to make life simpler.

> At this stage, your full `index.ts` should look like this:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const config = new pulumi.Config();
const name = config.require("appName")

const ns = new k8s.core.v1.Namespace(name, {
    metadata: {
        name: name,
    }
})

const labels = {
    "production-app": name,
}

const deployment = new k8s.apps.v1.Deployment(name, {
    metadata: {
        namespace: ns.metadata.name,
    },
    spec: {
        replicas: 1,
        selector: {
            matchLabels: labels
        },
        template: {
            metadata: {
                labels: labels
            },
            spec: {
                containers: [{
                    name: name,
                    image: "gcr.io/kuar-demo/kuard-amd64:blue",
                    ports: [{ name: "http", containerPort: 8080 }]
                }]
            }
        },
    }
})

const service = new k8s.core.v1.Service(name, {
    metadata: { labels: labels, namespace: ns.metadata.name },
    spec: { ports: [{ port: 8080, targetPort: "http" }], type: "LoadBalancer", selector: labels }
})
```

## Step 5 &mdash; Deploy

Now you've put this together, we're ready to deploy our infrastructure, using the `pulumi` CLI:

Before we do that, we need to set our name using Pulumi's config:

```
pulumi config set appName <your-name-here>
```

```bash
pulumi up
```

You should see your Kubernetes resources in the output:

```bash
Previewing update (dev)

View Live: https://app.pulumi.com/jaxxstorm/production-app/dev/previews/efa64360-e629-4458-bf34-955795a99082

     Type                              Name                Plan
 +   pulumi:pulumi:Stack               production-app-dev  create
 +   ├─ kubernetes:core/v1:Namespace   productionapp       create
 +   ├─ kubernetes:core/v1:Service     productionapp       create
 +   └─ kubernetes:apps/v1:Deployment  productionapp       create

Resources:
    + 4 to create

Do you want to perform this update?  [Use arrows to move, enter to select, type to filter]
  yes
> no
  details
```

Hit "yes" and allow Pulumi to create resources. 

You can now verify they've been created using the `kubectl` command:

```bash
kubectl get ns productionapp
NAME            STATUS   AGE
productionapp   Active   4m42s

kubectl get service -n productionapp
NAME                     TYPE           CLUSTER-IP      EXTERNAL-IP                                                               PORT(S)          AGE
productionapp-v31djllm   LoadBalancer   10.100.66.113   ac22716a65c014c88a9fa2e09aad748a-1697858844.us-west-2.elb.amazonaws.com   8080:31201/TCP   5m47s
```

## Step 6 &mdash; Destroy

Before you continue, destroy your deployed infrastructure using `pulumi destroy -y`

# Next Steps

* [Create a Component](../lab-02/README.md)
