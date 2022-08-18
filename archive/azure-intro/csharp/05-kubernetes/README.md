# Deploying Containers to a Kubernetes Cluster

In this lab, you will deploy a containerized application to a Kubernetes cluster.

> This lab assumes you have a project set up. If you don't yet, please [complete this step of Lab 1 first](../01-iac/01-creating-a-new-project.md).

> :white_check_mark: Your initial `MyStack.cs` should [look like this](../01-iac/code/01-creating-a-new-project/step3.cs).

## Step 1 &mdash; Configure Access to a Cluster

Cloud providers like Azure, Google Cloud, AWS offer managed Kubernetes cluster hosting. This makes it easier to create and manage new clusters compared to doing so by hand. In this lab, you will deploy a load-balanced, containzerized application to an existing Kubernetes cluster.

If you are participating in an interactive workshop, you will most likely be given access to an existing Kubernetes cluster. Save the `kubeconfig` file you were given to `~/iac-workshop/kubeconfig`.

> If you do not have a cluster, you can create an Azure AKS one by following the steps [here](https://github.com/pulumi/examples/tree/master/azure-cs-aks).

Point the `KUBECONFIG` environment variable at your cluster configuration file:

```bash
export KUBECONFIG=~/iac-workshop/kubeconfig
```

To test out connectivity, run `kubectl cluster-info`. You should see information similar to this (example for Azure AKS):

```
Kubernetes master is running at https://blaaks-3bebaff2.hcp.westeurope.azmk8s.io:443
CoreDNS is running at https://blaaks-3bebaff2.hcp.westeurope.azmk8s.io:443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
Metrics-server is running at https://blaaks-3bebaff2.hcp.westeurope.azmk8s.io:443/api/v1/namespaces/kube-system/services/https:metrics-server:/proxy
```

## Step 2 &mdash; Install the Kubernetes Package

From your project's root directory, install the Kubernetes package:

```
dotnet add package Pulumi.Kubernetes --version 1.5.3-preview
```

Next, add these using statement to your `MyStack.cs` file:

```csharp
using K8s = Pulumi.Kubernetes;
```

> :white_check_mark: After this change, your `MyStack.cs` should [look like this](./code/step2.cs).

## Step 3 &mdash; Declare Your Application's Namespace Object

First, declare a [namespace object](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/). This will scope your objects to a name of your choosing, so that in this workshop you won't accidentally interfere with other participants.

Append this to your `MyStack` constructor, replacing `my-name` with your own name:

```csharp
var ns = new K8s.Core.V1.Namespace("app-ns", new K8s.Types.Inputs.Core.V1.NamespaceArgs
{
    Metadata = new K8s.Types.Inputs.Meta.V1.ObjectMetaArgs { Name = "my-name" }
});
```

> :white_check_mark: After this change, your `MyStack.cs` should [look like this](./code/step3.cs).

## Step 4 &mdash; Declare Your Application's Deployment Object

You'll now declare a [deployment object](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/), which deploys a specific set of containers to the cluster and scales them. In this case, you'll deploy the pre-built `gcr.io/google-samples/kubernetes-bootcamp:v1` container image with only a single replica.

Append this to your `MyStack` constructor:

```csharp
...
var deployment = new K8s.Apps.V1.Deployment("app-dep", new K8s.Types.Inputs.Apps.V1.DeploymentArgs
{
    Metadata = new K8s.Types.Inputs.Meta.V1.ObjectMetaArgs { Namespace = ns.Metadata.Apply(m => m.Name) },
    Spec = new K8s.Types.Inputs.Apps.V1.DeploymentSpecArgs
    {
        Selector = new K8s.Types.Inputs.Meta.V1.LabelSelectorArgs { MatchLabels = appLabels },
        Replicas = 1,
        Template = new K8s.Types.Inputs.Core.V1.PodTemplateSpecArgs
        {
            Metadata = new K8s.Types.Inputs.Meta.V1.ObjectMetaArgs { Labels = appLabels },
            Spec = new K8s.Types.Inputs.Core.V1.PodSpecArgs
            {
                Containers =
                {
                    new K8s.Types.Inputs.Core.V1.ContainerArgs
                    {
                        Name = "iac-workshop",
                        Image = "gcr.io/google-samples/kubernetes-bootcamp:v1"
                    }
                }
            }
        }
    }
});
```

> :white_check_mark: After this change, your `MyStack.cs` should [look like this](./code/step4.cs).

## Step 5 &mdash; Declare Your Application's Service Object

Next, you'll declare a [service object](https://kubernetes.io/docs/concepts/services-networking/service/), which enables networking and load balancing across your deployment replicas.

Append this to your `MyStack` constructor:

```csharp
...
var service = new K8s.Core.V1.Service("app-svc", new K8s.Types.Inputs.Core.V1.ServiceArgs
{
    Metadata = new K8s.Types.Inputs.Meta.V1.ObjectMetaArgs { Namespace = ns.Metadata.Apply(m => m.Name) },
    Spec = new K8s.Types.Inputs.Core.V1.ServiceSpecArgs
    {
        Selector = appLabels,
        Ports = { new K8s.Types.Inputs.Core.V1.ServicePortArgs { Port = 80, TargetPort = 8080 }},
        Type = "LoadBalancer"
    }
});
```

Afterwards, add these lines to export the resulting, dynamically assigned endpoint for the load balancer:

```csharp
...
var address = service.Status
    .Apply(s => s.LoadBalancer)
    .Apply(lb => lb.Ingress)
    .GetAt(0)
    .Apply(i => i.Ip);

this.Url = Output.Format($"http://{address}");
```

Where `Url` is a property of `MyStack`:

```csharp
[Output]
public Output<string> Url { get; set; }
```

> :white_check_mark: After these changes, your `MyStack.cs` should [look like this](./code/step5.cs).

## Step 6 &mdash; Deploy Everything

```bash
pulumi up
```

This will show you a preview and, after selecting `yes`, the application will be deployed:

```
Updating (dev):

     Type                           Name              Status
 +   pulumi:pulumi:Stack            iac-workshop-dev  created
 +   ├─ kubernetes:core:Namespace   app-ns            created
 +   ├─ kubernetes:core:Service     app-svc           created
 +   └─ kubernetes:apps:Deployment  app-dep           created

Outputs:
    Url: "http://23.97.174.181"

Resources:
    + 4 created

Duration: 4m12s

Permalink: https://app.pulumi.com/myuser/iac-workshop/dev/updates/1
```

List the pods in your namespace, again replacing `my-name` with the namespace you chose earlier:

```bash
kubectl get pods --namespace my-name
```

And you should see a single replica:

```
NAME                                READY   STATUS    RESTARTS   AGE
app-dep-8r1febnu-66bffbf565-vx9kv   1/1     Running   0          0m15s
```

Curl the resulting endpoint to view the application:

```bash
curl $(pulumi stack output Url)
```

You should see something like the following:

```
Hello Kubernetes bootcamp! | Running on: app-dep-8r1febnu-66bffbf565-vx9kv | v=1
```

## Step 7 &mdash; Update Your Application Configuration

Next, you'll make two changes to the application:

* Scale out to 3 replicas, instead of just 1.
* Update the version of your application by changing its container image tag.

First update your deployment's configuration's replica count:

```
...
        Replicas = 3,
...
```

And then update its image to:

```
...
                    Image = "jocatalin/kubernetes-bootcamp:v2"
...
```

> :white_check_mark: After this change, your `MyStack.cs` should [look like this](./code/step7.cs).

Deploy your updates:

```bash
pulumi up
```

This will show you that the deployment has changed:

```
Previewing update (dev):

     Type                           Name              Plan       Info
     pulumi:pulumi:Stack            iac-workshop-dev
 ~   └─ kubernetes:apps:Deployment  app-dep           update     [diff: ~spec]

Resources:
    ~ 1 to update
    3 unchanged

Do you want to perform this update?
  yes
> no
  details
```

Selecting `details` will reveal the two changed made above:

```
  pulumi:pulumi:Stack: (same)
    [urn=urn:pulumi:dev::iac-workshop::pulumi:pulumi:Stack::iac-workshop-dev]
    ~ kubernetes:apps/v1:Deployment: (update)
        [id=myuser/app-dep-8r1febnu]
        [urn=urn:pulumi:dev::iac-workshop::kubernetes:apps/v1:Deployment::app-dep]
        [provider=urn:pulumi:dev::iac-workshop::pulumi:providers:kubernetes::default_1_2_3::c2145624-bf5a-4e9e-97c6-199096da4c67]
      ~ spec: {
          ~ replicas: 1 => 3
          ~ template: {
              ~ spec: {
                  ~ containers: [
                      ~ [0]: {
                              ~ image: "gcr.io/google-samples/kubernetes-bootcamp:v1" => "jocatalin/kubernetes-bootcamp:v2"
                            }
                    ]
                }
            }
        }

Do you want to perform this update?
  yes
> no
  details
```

And selecting `yes` will apply them:

```
Updating (dev):

     Type                           Name              Status      Info
     pulumi:pulumi:Stack            iac-workshop-dev
 ~   └─ kubernetes:apps:Deployment  app-dep           updated     [diff: ~spec]

Outputs:
    url: "http://23.97.174.181"

Resources:
    ~ 1 updated
    3 unchanged

Duration: 16s

Permalink: https://app.pulumi.com/myuser/iac-workshop/dev/updates/2
```

Query the pods again using your chosen namespace from earlier:

```bash
kubectl get pods --namespace my-name
```

Check that there are now three:

```
NAME                               READY   STATUS    RESTARTS   AGE
app-dep-8r1febnu-6cd57d964-c76rx   1/1     Running   0          1m45s
app-dep-8r1febnu-6cd57d964-rdpn6   1/1     Running   0          1m35s
app-dep-8r1febnu-6cd57d964-tj6m4   1/1     Running   0          1m56s
```

Finally, curl the endpoint again:

```bash
curl $(pulumi stack output Url)
```

And verify that the output now ends in `v=2`, instead of `v=1` (the result of the new container image):

```
Hello Kubernetes bootcamp! | Running on: app-dep-8r1febnu-6cd57d964-c76rx | v=2
```

If you'd like, do it a few more times, and observe that traffic will be load balanced across the three pods:

```bash
for i in {0..10}; do curl $(pulumi stack output Url); done
```

## Step 8 &mdash; Destroy Everything

Finally, destroy the resources and the stack itself:

```
pulumi destroy
pulumi stack rm
```

## Next Steps

Congratulations! :tada: You've deployed a Kubernetes application to an existing AKS cluster, scaled it out, and performed a rolling update of the container image it is running.

Next, choose amongst these labs:

* [Deploying Serverless Applications with Azure Functions](../02-serverless/README.md)
* [Deploying Containers to Azure Container Instances](../03-aci/README.md)
* [Provisioning Virtual Machines](../04-vms/README.md)

Or view the [suggested next steps](/#next-steps) after completing all labs.
