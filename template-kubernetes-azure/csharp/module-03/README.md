# Deploying and Changing Infrastructure

In this module, we'll deploy our cluster, remove some unused resources, and deploy Kubernetes resources on top of our cluster.

## Step 1 &mdash; Deploying the Template

To deploy the template, we run the following command:

```bash
pulumi up
```

Pulumi will then show us a preview of what it intends to deploy. Confirm the preview and deploy the cluster. Notice that if we're using the Pulumi service as our backend (the default unless you took steps on your own to use a different backend), Pulumi provides a link to the Pulumi service where we can watch our deploy. Click the link and explore the Pulumi service if you aren't familiar since the deploy will take a few minutes.

Once the cluster is deployed, we can use the `kubeconfig` stack output, write it to the file, and then use it to perform actions with `kubectl`:

```bash
pulumi stack output kubeconfig > kubeconfig.yml
KUBECONFIG=kubeconfig.yml kubectl get pods --all-namespaces
```

This will list all the pods running in the `kube-system` namespace that are installed by default on our managed cluster.

## Step 2 &mdash; Changing Resources

Once Pulumi has finished deploying the template, let's remove the unused network resources. Delete all the `VirtualNetwork` and `Subnet` resources from your program. Also delete the `networkName` output from your program by removing it from the `return` statement at the end. When that's done run the following command again:

```bash
pulumi up
```

Notice how Pulumi detects that our previously deployed resources are no longer a part of our Pulumi program. This illustrates the *declarative* nature of Pulumi programs: We only need to say what we want our desired state to be (no network resources, everything else unchanged) and Pulumi figures out that needs to be done (delete the previously deployed network services). This is powerful stuff!

## Step 3 &mdash;Adding a Deployment to Our Cluster

Now that we have just the needed infrastructure, let's add some Kubernetes resources to our cluster. The first thing we need to do is install the [Pulumi Kubernetes provider](https://www.pulumi.com/registry/packages/kubernetes/):

```bash
dotnet package add Pulumi.Kubernetes
```

Note that we add Pulumi providers to our program just like we would in any other .NET program.

Back in our program, we need to first declare the provider and tell it to use the `kubeconfig` from our AKS cluster. Because we are declaring a cluster and then deploying Kubernetes resources on top of it, we need to explicitly declare the Kubernetes provider. This way, all of our resources can exist in the same Pulumi program with their dependencies tracked. This will come in handy at the end of this workshop when we tear down all our resources with a single Pulumi command.

Add the following to your `Program.cs`:

```csharp
var provider = new Provider("k8s", new ProviderArgs {
  KubeConfig = decoded
});
```

Now we can deploy Kubernetes resources on top of our cluster. Specifically, we'll add NGINX as a Kubernetes deployment, and then add a service to allow us to access NGINX from outside of our Kubernetes cluster.

Add the following to your `Program.cs`:

```csharp
var appLabels = new InputMap<string> {
  {"app", "nginx"}
};

var deployment = new Pulumi.Kubernetes.Apps.V1.Deployment("nginx", new DeploymentArgs {
    Spec = new DeploymentSpecArgs {
      Selector = new LabelSelectorArgs {
        MatchLabels = appLabels,
      },
      Replicas = 1,
      Template = new PodTemplateSpecArgs {
        Metadata = new ObjectMetaArgs {
          Labels = appLabels,
        },
        Spec = new PodSpecArgs {
          Containers = new ContainerArgs {
            Name = "nginx",
            Image = "nginx",
            Ports = {
              new ContainerPortArgs {
                ContainerPortValue = 80,
              },
            }
          }
        },
      }
    }
  },
  new CustomResourceOptions {
    Provider = provider,
  }
);
```

Note how we provide the `CustomResourceOptions` parameter and tell the resource to use the provider we declared earlier. All Pulumi resources support this parameter. For details on all the options available for Pulumi resources, check out [Resource Options](https://www.pulumi.com/docs/intro/concepts/resources/options/) in the Pulumi docs.

Let's deploy our changes:

```bash
pulumi up -y
```

Once that's complete, let's verify our pods are running:

```bash
KUBECONFIG=kubeconfig.yml kubectl get pods
```

You should see a single NGINX pod running in our AKS cluster.

Let's make a simple change by expanding the number of replicas in our NGINX deployment. Change the following line in our `Deployment` resource to deploy 3 replicas of NGINX:

```csharp
Replicas = 3,
```

Deploy the changes:

```bash
pulumi up -y
```

And query the cluster again:

```bash
KUBECONFIG=kubeconfig.yml kubectl get pods
```

We should now see 3 pods running NGINX.

## Step 4 &mdash; Adding a Service to our Cluster

Now that we have our NGINX pods up and running, let's add a Kubernetes service so we can access NGINX from outside of our cluster. Add the following to your `Program.cs`:

```csharp
var frontend = new Service("nginx", new ServiceArgs {
    Metadata = new ObjectMetaArgs {
        Labels = deployment.Spec.Apply(spec =>
            spec.Template.Metadata.Labels
        ),
    },
    Spec = new ServiceSpecArgs {
        Type = "LoadBalancer",
        Selector = appLabels,
        Ports = new ServicePortArgs {
            Port = 80,
            TargetPort = 80,
            Protocol = "TCP",
        },
    }
}, new CustomResourceOptions {
    Provider = provider,
});

var ip = frontend.Status.Apply(status => {
    var ingress = status.LoadBalancer.Ingress[0];
    return ingress.Ip ?? ingress.Hostname;
});
```

Also add the following as an entry in the Dictionary in the `return` statement at the end of your program to add NGINX's IP address as a stack output:

```csharp
["ip"] = ip
```

Deploy the changes:

```bash
pulumi up -y
```

The `-y` flag above automatically confirms the preview. This is ok to use in tutorials or non-production scenarios, but in production scenarios you'll probably want to avoid using the flag and carefully examine what the Pulumi preview is telling you it plans to do.

At this point, our service should be up and running. Verify by running the following command:

```bash
curl http://$(pulumi stack output ip)
```

You should see the HTML markup for the default NGINX index page. We've now learned how to create an AKS cluster, deploy services on top of it, and make changes to our infrastructure!

## Step 5 &mdash; Cleaning Up

Now that we're done with our stack, let's clean it up. Run the following command:

```bash
pulumi destroy
```

Confirm that you want to tear down the stack. Optionally, you can remove the stack (and because this is the only stack in the Pulumi project, the project will also be removed):

```bash
pulumi stack rm dev
```

That's it!
