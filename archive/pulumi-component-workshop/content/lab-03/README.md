# Lab 03 &mdash; Complete your Production App

In lab 02, we built the boilerplate for a production application component.

In lab 3, we'll add more services to our production application component.

## Step 1 &mdash; Add a Kubernetes Deployment

In your existing `app.py`, add the following:

```python
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
                           ),
                       ],
                   ),
               ],
           ),
       ),
   )

```

> At this stage, your `app.py` file should look like this:

```python
"""A Python Pulumi program"""

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

        deployment = k8s.apps.v1.Deployment(
            name,
            opts=pulumi.ResourceOptions(
                parent=namespace,
            ),
            metadata=k8s.meta.v1.ObjectMetaArgs(
                namespace=namespace.metadata.name,
                labels=app_labels
            ),
            spec=k8s.apps.v1.DeploymentSpecArgs(
                replicas=3,
                selector=k8s.meta.v1.LabelSelectorArgs(
                    match_labels=app_labels
                ),
                template=k8s.core.v1.PodTemplateSpecArgs(
                    metadata=k8s.meta.v1.ObjectMetaArgs(labels= app_labels),
                    spec=k8s.core.v1.PodSpecArgs(
                        containers=[
                            k8s.core.v1.ContainerArgs(
                                name=name,
                                image=args.image,
                                ports=[
                                    k8s.core.v1.ContainerPortArgs(
                                        name="http",
                                        container_port=args.port,
                                    )
                                ],
                            ),
                        ],
                    ),
                ),
            ),
        )
```

You can run `pulumi up` at this stage to see the difference, if you wish.

## Step 2 &mdash; Add a Service

The final part of our production application is a Kubernetes service. Add the following to your `app.py`:

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
```

This completes adding the resources for our application, but now we need to export the _output_ from our service.

## Step 3 &mdash; Register Outputs

We now need to register our outputs in our component. This allows us to pass outputs from resources _within_ our component up to our component we expose.

First, we need to let our component know what we're going to output. In this case, we'll output our url.

At the place in your code where you define your Component, add the following code:

```python
class ProductionApp(pulumi.ComponentResource):
    url: pulumi.Output[str] # <---- Add this line here

    def __init__(
        self, name: str, args: ProductionAppArgs, opts: pulumi.ResourceOptions = None
    ):
```

Then, at the bottom of your code, output the url inside a `register_outputs` call:

```python
self.url = svc.status.apply(lambda s: s.load_balancer.ingress[0].ip)

self.register_outputs({"url": self.url})
```

> At this stage, your `app.py` file should look like this:

```python
"""A Python Pulumi program"""

import pulumi
import pulumi_kubernetes as k8s


class ProductionAppArgs:
    def __init__(self, image: pulumi.Input[str], port: pulumi.Input[int]):
        self.image = image
        self.port = port


class ProductionApp(pulumi.ComponentResource):
    url: pulumi.Output[str]

    def __init__(
        self, name: str, args: ProductionAppArgs, opts: pulumi.ResourceOptions = None
    ):
        super().__init__("productionapp:index:ProductionApp", name, {}, opts)

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
                                        name="http",
                                        container_port=args.port,
                                    )
                                ],
                            ),
                        ],
                    ),
                ),
            ),
        )

        svc = k8s.core.v1.Service(
            name,
            opts=pulumi.ResourceOptions(
                parent=namespace,
            ),
            metadata=k8s.meta.v1.ObjectMetaArgs(
                labels=app_labels,
                namespace=namespace.metadata.name,
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

        self.url = svc.status.apply(lambda s: s.load_balancer.ingress[0].ip)

        self.register_outputs({"url": self.url})
```

We've registered our output with our component, so in our `__main__.py` we can now export it. Update your `__main__.py` to look like this:

```python
from app import ProductionApp, ProductionAppArgs
import pulumi

example = ProductionApp("lbriggs", ProductionAppArgs(image="gcr.io/kuar-demo/kuard-amd64:blue", port=8080))

pulumi.export("url", example.url)
```

Now, let's provision our application!

## Step 4 &mdash; Run `pulumi up`

Run `pulumi up` and you should see something like this:

```
Previewing update (dev)

View Live: https://app.pulumi.com/jaxxstorm/production-app/dev/previews/ddcb219a-825d-4412-89f0-702b4e2bc7be

     Type                                    Name                    Plan
     pulumi:pulumi:Stack                     production-app-dev
     └─ productionapp:index:ProductionApp    lbriggs
        └─ kubernetes:core/v1:Namespace      lbriggs
 +         ├─ kubernetes:core/v1:Service     lbriggs                 create
 +         └─ kubernetes:apps/v1:Deployment  lbriggs                 create

Outputs:
  + url: output<string>

Resources:
    + 2 to create
    3 unchanged
```

Once you hit `yes` you'll see the app provision!

