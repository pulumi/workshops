# Lab 02 &mdash; Create & Run some Kubernetes Resources

In this lab, we'll use the standard Pulumi interface to provision a hypothetical "Production Grade" application to Kubernetes. We'll create a Pulumi ComponentResource to do this.

## Step 1 &mdash; Create your Component

Create a new file called `app.py`. We'll create our Pulumi Component in here.

First, let's initialize our app by creating a `ProductionApp` class:


```python
import pulumi

class ProductionApp(pulumi.ComponentResource):
    def __init__(
        self, name: str, args: ProductionAppArgs, opts: pulumi.ResourceOptions = None
    ):
        super().__init__("productionapp:index:ProductionApp", name, {}, opts)
```

We'll also need a `ProductionAppArgs` class, which holds our configuration options and gets passed to our `ProductionApp`:

```python
class ProductionAppArgs:
    def __init__(self, image: pulumi.Input[str], port: pulumi.Input[int]):
        self.image = image
        self.port = port
```

The only parts of our production app we're making configurable are the image we're deploying and the port it listens on. The rest of our application is going to be defined by us, the experts on our platform.

> At this stage, your `app.py` file should look like this:

```python
import pulumi

class ProductionAppArgs:
    def __init__(self, image: pulumi.Input[str], port: pulumi.Input[int]):
        self.image = image
        self.port = port


class ProductionApp(pulumi.ComponentResource):
    def __init__(
        self, name: str, args: ProductionAppArgs, opts: pulumi.ResourceOptions = None
    ):
        super().__init__("productionapp:index:ProductionApp", name, {}, opts)
```

## Step 2 &mdash; Import the Kubernetes Library

We'll need to install the Pulumi Kubernetes library in order to provision applications to our Kubernetes cluster. We'll need to install this inside our `virtualenv`, so let's activate it:

```bash
source venv/bin/activate
```

And then, install our Kubernetes SDK:

```bash
pip3 install pulumi_kubernetes
```

## Step 3 &mdash; Add a Namespace

We want to add a namespace to store our application in, with the same name our component is instatiated with. Add the following to your `app.py`:

```python
import pulumi_kubernetes as k8s

# existing code

class ProductionApp(pulumi.ComponentResource):
    def __init__(
        self, name: str, args: ProductionAppArgs, opts: pulumi.ResourceOptions = None
    ):
        super().__init__("productionapp:index:ProductionApp", name, {}, opts)

# existing code

        app_labels = {"name": name}

        namespace = k8s.core.v1.Namespace(
            name,
            opts=pulumi.ResourceOptions(
                parent=self,
            ),
            metadata=k8s.meta.v1.ObjectMetaArgs(
                name=name,
            ),
        )

```

Notice how we're setting the name of the namespace explicitly, so we don't use Pulumi's autonaming, this makes it easier to find our namespace

## Step 4 &mdash; Add a Deployment & Service

We now need to round out our Kubernetes application with a Service and Deployment.

Add the following to your `app.py`:

```python
        svc = k8s.core.v1.Service(
            name,
            opts=pulumi.ResourceOptions(
                parent=namespace,
            ),
            metadata=k8s.meta.v1.ObjectMetaArgs(
                labels=app_labels, namespace=namespace.metadata.name
            ),
            spec=k8s.core.v1.ServiceSpecArgs(
                ports=[
                    k8s.core.v1.ServicePortArgs(
                        port=80,
                        target_port="http",
                    )
                ],
                type="LoadBalancer",
                selector=app_labels,
            ),
        )

        deployment = k8s.apps.v1.Deployment(
            name,
            opts=pulumi.ResourceOptions(
                parent=namespace,
            ),
            metadata=k8s.meta.v1.ObjectMetaArgs(
                namespace=namespace.metadata.name, labels=app_labels
            ),
            spec=k8s.apps.v1.DeploymentSpecArgs(
                replicas=3,
                selector=k8s.meta.v1.LabelSelectorArgs(match_labels=app_labels),
                template=k8s.core.v1.PodTemplateSpecArgs(
                    metadata=k8s.meta.v1.ObjectMetaArgs(labels=app_labels),
                    spec=k8s.core.v1.PodSpecArgs(
                        containers=[
                            k8s.core.v1.ContainerArgs(
                                name=name,
                                image=args.image,
                                ports=[
                                    k8s.core.v1.ContainerPortArgs(
                                        name="http", container_port=args.port
                                    )
                                ],
                            )
                        ]
                    ),
                ),
            ),
        )
```

We pass our image argument to this component so we can leave it up to the user which image they want to deploy.

Finally, we'll want to export the load balancer our application uses. The load balancer is created by the Kubernetes cluster, and we won't know its
value until the service has finished provisioning. For this reason, we'll use pulumi's `apply()` function to grab it:

```python
pulumi.export("url", svc.status.apply(lambda s: s.load_balancer.ingress[0].ip))
```

> At this stage, your `app.py` file should look like this

```python
import pulumi
import pulumi_kubernetes as k8s


class ProductionAppArgs:
    def __init__(self, image: pulumi.Input[str], port: pulumi.Input[int]):
        self.image = image
        self.port = port


class ProductionApp(pulumi.ComponentResource):
    def __init__(
        self, name: str, args: ProductionAppArgs, opts: pulumi.ResourceOptions = None
    ):
        super().__init__("productionapp:index:ProductionApp", name, {}, opts)

        # Make labels consistent across all resources
        app_labels = {"name": name}

        namespace = k8s.core.v1.Namespace(
            name,
            opts=pulumi.ResourceOptions(
                parent=self,
            ),
            metadata=k8s.meta.v1.ObjectMetaArgs(
                name=name,
            ),
        )

        svc = k8s.core.v1.Service(
            name,
            opts=pulumi.ResourceOptions(
                parent=namespace,
            ),
            metadata=k8s.meta.v1.ObjectMetaArgs(
                labels=app_labels, namespace=namespace.metadata.name
            ),
            spec=k8s.core.v1.ServiceSpecArgs(
                ports=[
                    k8s.core.v1.ServicePortArgs(
                        port=8080,
                        target_port="http",
                    )
                ],
                type="LoadBalancer",
                selector=app_labels,
            ),
        )

        deployment = k8s.apps.v1.Deployment(
            name,
            opts=pulumi.ResourceOptions(
                parent=namespace,
            ),
            metadata=k8s.meta.v1.ObjectMetaArgs(
                namespace=namespace.metadata.name, labels=app_labels
            ),
            spec=k8s.apps.v1.DeploymentSpecArgs(
                replicas=3,
                selector=k8s.meta.v1.LabelSelectorArgs(match_labels=app_labels),
                template=k8s.core.v1.PodTemplateSpecArgs(
                    metadata=k8s.meta.v1.ObjectMetaArgs(labels=app_labels),
                    spec=k8s.core.v1.PodSpecArgs(
                        containers=[
                            k8s.core.v1.ContainerArgs(
                                name=name,
                                image=args.image,
                                ports=[
                                    k8s.core.v1.ContainerPortArgs(
                                        name="http", container_port=args.port
                                    )
                                ],
                            )
                        ]
                    ),
                ),
            ),
        )

        pulumi.export("url", svc.status.apply(lambda s: s.load_balancer.ingress[0].ip))

```

## Step 5 &mdash; Import your Production App and Deploy.

Now we've defined what a "Production App" is, let's import it into our Pulumi program, and deploy it. In your `__main__.py` this time, add the following:


```python
"""A Python Pulumi program"""

from app import ProductionAppArgs, ProductionApp


kuard = ProductionApp("<your name here>", ProductionAppArgs(image="gcr.io/kuar-demo/kuard-amd64:blue", port=8080))
```

You should now be able to run `pulumi up` and see that you're going to create a "Production Ready" Kubernetes application:

```bash
pulumi up
Previewing update (dev)

View Live: https://app.pulumi.com/jaxxstorm/deployment-platyform/dev/previews/82c1c15e-59be-4c41-90f7-211913d729b2

     Type                                    Name                      Plan       
 +   pulumi:pulumi:Stack                     deployment-platyform-dev  create     
 +   └─ productionapp:index:ProductionApp    lbriggs                   create     
 +      └─ kubernetes:core/v1:Namespace      lbriggs                   create     
 +         ├─ kubernetes:core/v1:Service     lbriggs                   create     
 +         └─ kubernetes:apps/v1:Deployment  lbriggs                   create     
 
Resources:
    + 5 to create

Do you want to perform this update?  [Use arrows to move, enter to select, type to filter]
  yes
> no
  details

```

Hit "yes" and make sure it works!

You should be able to verify using it's been by checking the namespace you've created:

```bash
kubectl get pods -n <your name here>
```

The output should look like this:

```bash
kubectl get pods -n lbriggs
NAME                                READY   STATUS    RESTARTS   AGE
lbriggs-4qe5xxgd-68d447c598-cj7h4   1/1     Running   0          3m6s
lbriggs-4qe5xxgd-68d447c598-fp5pt   1/1     Running   0          3m6s
lbriggs-4qe5xxgd-68d447c598-ljr7b   1/1     Running   0          3m6s
```

# Next Steps

* [Build a Webapp](../lab-03/README.md)


