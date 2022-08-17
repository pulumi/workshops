# Lab 02 &mdash; Refactor into a Component

In our previous lab, we deployed our application using Pulumi. Now, let's refactor this code into a reusable component.


## Step 1 &mdash; Create your Component

Create a new file called `app.ts`. We'll create our Pulumi Component in here.

First, let's initialize our app by creating a `ProductionApp` class:

```typescript
import * as pulumi from "@pulumi/pulumi"


export class ProductionApp extends pulumi.ComponentResource{

    constructor(name: string, args: ProductionAppArgs, opts?: pulumi.ComponentResourceOptions) {
        super("productionapp:application", name, {}, opts);

    }

}
```

We'll also need a `ProductionAppArgs` interface, which defines the shape of our ProductionApp. Let's make the image we pass to our Production application configurable:

```typescript
export interface ProductionAppArgs{
    image: string
}
```

> At this stage, your `app.ts` file should look like this:

```typescript
import * as pulumi from "@pulumi/pulumi"

export interface ProductionAppArgs{
    image: string
}

export class ProductionApp extends pulumi.ComponentResource{

    constructor(name: string, args: ProductionAppArgs, opts?: pulumi.ComponentResourceOptions) {
        super("productionapp:application", name, {}, opts);

    }

}
```

## Step 2 &mdash; Add a namespace

The Kubernetes resources we deployed in our last lab make up our production application. Let's define those applications in our ComponentResource, instead of in the main Pulumi program.

In your `app.ts` update your code so that you're importing the Kubernetes library and add the members we're going to need:

```typescript
import * as pulumi from "@pulumi/pulumi"
import * as k8s from "@pulumi/kubernetes"

export interface ProductionAppArgs{
    image: string
}

export class ProductionApp extends pulumi.ComponentResource{

    namespace: k8s.core.v1.Namespace
    deployment: k8s.apps.v1.Deployment
    service: k8s.core.v1.Service

    constructor(name: string, args: ProductionAppArgs, opts?: pulumi.ComponentResourceOptions) {
        super("productionapp:application", name, {}, opts);

    }

}
```

We can now populate these members in kuch the same way as we did in our previous lab. Like before, let's create our namespace first - add the following underneath the `super` function:

```typescript
let appLabels = {
            "app.kubernetes.io/instance": name,
            "app.kubernetes.io/application": "productionapp"
        }

        this.namespace = new k8s.core.v1.Namespace(name, {
            metadata: {
                name: name,
                labels: appLabels
            }
        })
```
# Step 3 &mdash; Add a Deployment

As before, we need a deployment to run our application. Add the following to the `super` function in your ComponentResource

```typescript
this.deployment = new k8s.apps.v1.Deployment(name, {
            metadata: {
                namespace: this.namespace.metadata.name,
            },
            spec: {
                replicas: 1,
                selector: {
                    matchLabels: appLabels
                },
                template: {
                    metadata: {
                        labels: appLabels
                    },
                    spec: {
                        containers: [{
                            name: name,
                            image: args.image,
                            ports: [{ name: "http", containerPort: 8080 }]
                        }]
                    }
                },
            }
        })
```

Notice this time, we're taking our image from the `args` interface instead of hardcoding it.

## Step 4 &mdash; Add a Service

The last step is to readd our service.

Add the following to your `app.ts`:

```typescript
this.service = new k8s.core.v1.Service(name, {
            metadata: { labels: appLabels, namespace: this.namespace.metadata.name },
            spec: { ports: [{ port: 8080, targetPort: "http" }], type: "LoadBalancer", selector: appLabels }
        })
```

Finally, make sure we notify the Component we have finished creating all our resources, by using the `registerOutputs` method:

```typescript
this.registerOutputs
```

> Note: At this stage, your `app.ts` should look like this:

```typescript
import * as pulumi from "@pulumi/pulumi"
import * as k8s from "@pulumi/kubernetes"

export interface ProductionAppArgs{
    image: string
}

export class ProductionApp extends pulumi.ComponentResource{

    namespace: k8s.core.v1.Namespace
    deployment: k8s.apps.v1.Deployment
    service: k8s.core.v1.Service

    constructor(name: string, args: ProductionAppArgs, opts?: pulumi.ComponentResourceOptions) {
        super("productionapp:application", name, {}, opts);

        let appLabels = {
            "app.kubernetes.io/instance": name,
            "app.kubernetes.io/application": "productionapp"
        }

        this.namespace = new k8s.core.v1.Namespace(name, {
            metadata: {
                name: name,
                labels: appLabels
            }
        })

        this.deployment = new k8s.apps.v1.Deployment(name, {
            metadata: {
                namespace: this.namespace.metadata.name,
            },
            spec: {
                replicas: 1,
                selector: {
                    matchLabels: appLabels
                },
                template: {
                    metadata: {
                        labels: appLabels
                    },
                    spec: {
                        containers: [{
                            name: name,
                            image: args.image,
                            ports: [{ name: "http", containerPort: 8080 }]
                        }]
                    }
                },
            }
        })

        this.service = new k8s.core.v1.Service(name, {
            metadata: { labels: appLabels, namespace: this.namespace.metadata.name },
            spec: { ports: [{ port: 8080, targetPort: "http" }], type: "LoadBalancer", selector: appLabels }
        })

        this.registerOutputs

    }

}
```

## Step 5 &mdash; Import your new Component

At this stage, you've created a component - a reusable instance of infrastructure code. You could package this up and share it with others using NPM, but for the time being we'll skip that step and import it directly.

Update your `index.ts` - remove all the old code and delete it.

Next, import your `ProductionApp` like so:

```typescript
import * as app from "./app"

const name = <your-name-here>

const application = new app.ProductionApp(name, {
    image: "gcr.io/kuar-demo/kuard-amd64:blue",
})
```

Now, we can redeploy our production application:

```bash
Created stack 'dev'
Previewing update (dev)

View Live: https://app.pulumi.com/jaxxstorm/production-app/dev/previews/a21a4ce6-baec-4dd7-a241-401feacb98f4

     Type                              Name                Plan       
 +   pulumi:pulumi:Stack               production-app-dev  create     
 +   ├─ productionapp:application      kuard               create     
 +   ├─ kubernetes:core/v1:Namespace   kuard               create     
 +   ├─ kubernetes:core/v1:Service     kuard               create     
 +   └─ kubernetes:apps/v1:Deployment  kuard               create     
 
Resources:
    + 5 to create
```
