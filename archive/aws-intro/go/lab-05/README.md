# Deploying Containers to a Kubernetes Cluster

In this lab, you will deploy a containerized application to a Kubernetes cluster.

> This lab assumes you have a project set up and a Kubernetes cluster up and running.
> If you don't have a cluster yet, please [complete this lab first](../lab-04/README.md).

## Step 1 &mdash; Use a Kubernetes Cluster

Configure the use of a [StackReference][stack-refs] to the Kubernetes cluster
stack to extract and use the kubeconfig. This can be found in the [last
section](../lab-04/README.md#next-steps) of the previous lab.

[stack-refs]: https://www.pulumi.com/docs/intro/concepts/organizing-stacks-projects/#inter-stack-dependencies

From your project's root directory, install the packages.

```
GO111MODULE=on go get github.com/pulumi/pulumi github.com/pulumi/pulumi-kubernetes
```

Next, add these imports to your `main.go` file and create the `main` function:

```go
package main

import (
	"github.com/pulumi/pulumi-kubernetes/sdk/go/kubernetes/providers"
	"github.com/pulumi/pulumi/sdk/go/pulumi"
	"github.com/pulumi/pulumi/sdk/go/pulumi/config"
)

func main() {
}
```

Create a StackReference to the Kubernetes cluster stack in the `main` function
using the config `clusterStackRef` stack setting.

```go
func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		c := config.New(ctx, "")
		stackRef := c.Require("clusterStackRef")
		infra, err := pulumi.NewStackReference(ctx, stackRef, nil)
	})
}
```

Next, we need to declare a new Kubernetes provider based on the kubeconfig created in 
the cluster stack. To do this, add this to your `main` function.

```go
...
    kubeconfig := infra.GetOutput(pulumi.String("kubeconfig")).ApplyString(
        func(in interface{}) string {
            kc, err := json.Marshal(in)
            if err != nil {
                panic(err)
            }
            return string(kc)
        },
    )
    k8sProvider, err := providers.NewProvider(ctx, "k8sprovider", &providers.ProviderArgs{
        Kubeconfig: kubeconfig,
    })
    if err != nil {
        return err
    }
```

> :white_check_mark: After this change, your `main.go` should [look like this](./code/step1.go).

## Step 2 &mdash; Declare Your Application's Namespace Object

First, add these imports to your `main.go` file:

```go
import(
    ...
	corev1 "github.com/pulumi/pulumi-kubernetes/sdk/go/kubernetes/core/v1"
	metav1 "github.com/pulumi/pulumi-kubernetes/sdk/go/kubernetes/meta/v1"
)
```

Next, declare a [namespace object](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/). This will scope your objects to a name of your choosing, so that in this workshop you won't accidentally interfere with other participants.

Append this to your `main` function, replacing `joe-duffy` with your own name and referencing the provider:

```go
namespace, err := corev1.NewNamespace(ctx, "app-ns", &corev1.NamespaceArgs{
    Metadata: &metav1.ObjectMetaArgs{
        Name: pulumi.String("joe-duffy"),
    },
}, pulumi.Provider(k8sProvider))
if err != nil {
    return err
}
```

> :white_check_mark: After this change, your `main.go` should [look like this](./code/step2.go).

## Step 3 &mdash; Declare Your Application's Deployment Object

First, add this import to your `main.go` file:

```go
import(
    ...
	appsv1 "github.com/pulumi/pulumi-kubernetes/sdk/go/kubernetes/apps/v1"
)
```

You'll now declare a [deployment object](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/), which deploys a specific set of containers to the cluster and scales them. In this case, you'll deploy the pre-built `gcr.io/google-samples/kubernetes-bootcamp:v1` container image with only a single replica.

Append this to your `main` function:

```go
appLabels := pulumi.StringMap{
    "app": pulumi.String("iac-workshop"),
}
_, err = appsv1.NewDeployment(ctx, "app-dep", &appsv1.DeploymentArgs{
    Metadata: &metav1.ObjectMetaArgs{
        Namespace: namespace.Metadata.Elem().Name(),
    },
    Spec: appsv1.DeploymentSpecArgs{
        Selector: &metav1.LabelSelectorArgs{
            MatchLabels: appLabels,
        },
        Replicas: pulumi.Int(3),
        Template: &corev1.PodTemplateSpecArgs{
            Metadata: &metav1.ObjectMetaArgs{
                Labels: appLabels,
            },
            Spec: &corev1.PodSpecArgs{
                Containers: corev1.ContainerArray{
                    corev1.ContainerArgs{
                        Name:  pulumi.String("iac-workshop"),
                        Image: pulumi.String("jocatalin/kubernetes-bootcamp:v2"),
                    }},
            },
        },
    },
}, pulumi.Provider(k8sProvider))
if err != nil {
    return err
}
```

> :white_check_mark: After this change, your `main.go` should [look like this](./code/step3.go).

## Step 4 &mdash; Declare Your Application's Service Object

Next, you'll declare a [service object](https://kubernetes.io/docs/concepts/services-networking/service/), which enables networking and load balancing across your deployment replicas.

Append this to your `main` function:

```go
service, err := corev1.NewService(ctx, "app-service", &corev1.ServiceArgs{
    Metadata: &metav1.ObjectMetaArgs{
        Namespace: namespace.Metadata.Elem().Name(),
        Labels:    appLabels,
    },
    Spec: &corev1.ServiceSpecArgs{
        Ports: corev1.ServicePortArray{
            corev1.ServicePortArgs{
                Port:       pulumi.Int(80),
                TargetPort: pulumi.Int(8080),
            },
        },
        Selector: appLabels,
        Type:     pulumi.String("LoadBalancer"),
    },
}, pulumi.Provider(k8sProvider))
if err != nil {
    return err
}
```

Afterwards, add these lines to export the resulting, dynamically assigned endpoint for the resulting load balancer:

```go
ctx.Export("url", service.Status.ApplyT(func(status *corev1.ServiceStatus) *string {
    ingress := status.LoadBalancer.Ingress[0]
    if ingress.Hostname != nil {
        return ingress.Hostname
    }
    return ingress.Ip
}))
```

> :white_check_mark: After these changes, your `main.go` should [look like this](./code/step4.go).

## Step 5 &mdash; Deploy Everything

First, add the `StackReference` to the cluster stack, which is used to get the kubeconfig
from its stack output.

> This can be found in the [last section](../lab-04/README.md#next-steps) of the previous lab.

```bash
pulumi config set iac-workshop-apps:clusterStackRef joeduffy/iac-workshop-cluster/dev
```

Deploy Everything:

```bash
pulumi up
```

This will show you a preview and, after selecting `yes`, the application will be deployed:

```
Updating (dev):

     Type                             Name                                    Status
 +   pulumi:pulumi:Stack              iac-workshop-apps-dev                   created
 +   ├─ pulumi:providers:kubernetes   k8s-provider                            created
 +   ├─ kubernetes:core:Namespace     app-ns                                  created
 +   ├─ kubernetes:core:Service       app-service                             created
 +   └─ kubernetes:apps:Deployment    app-dep                                 created

Outputs:
    url: "http://ae7c37b7c510511eab4540a6f2211784-521581596.us-west-2.elb.amazonaws.com:80"

Resources:
    + 7 created

Duration: 32s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop-apps/dev/updates/1
```

List the pods in your namespace, again replacing `joe-duffy` with the namespace you chose earlier:

```bash
kubectl get pods --namespace joe-duffy
```

And you should see a single replica:

```
NAME                                READY   STATUS    RESTARTS   AGE
app-dep-8r1febnu-66bffbf565-vx9kv   1/1     Running   0          0m15s
```

Curl the resulting endpoint to view the application:

```bash
curl $(pulumi stack output url)
```

You should see something like the following:

```
Hello Kubernetes bootcamp! | Running on: app-dep-8r1febnu-66bffbf565-vx9kv | v=1
```

> Kubernetes does not wait until the AWS load balancer is fully initialized, so it may take a few minutes before it becomes available.

## Step 6 &mdash; Update Your Application Configuration

Next, you'll make two changes to the application:

* Scale out to 3 replicas, instead of just 1.

Update your deployment's configuration's replica count and image:

```
...
        Replicas: pulumi.Int(3),
...
		Image: pulumi.String("jocatalin/kubernetes-bootcamp:v2"),
...
```

> :white_check_mark: After this change, your `main.go` should [look like this](./code/step6.go).

Deploy your updates:

```bash
pulumi up
```

This will show you that the deployment has changed:

```
Previewing update (dev):

     Type                           Name              Plan       Info
     pulumi:pulumi:Stack            iac-workshop-apps-dev
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
    [urn=urn:pulumi:dev::iac-workshop-apps::pulumi:pulumi:Stack::iac-workshop-apps-dev]
    ~ kubernetes:apps/v1:Deployment: (update)
        [id=joe-duffy/app-dep-8r1febnu]
        [urn=urn:pulumi:dev::iac-workshop-apps::kubernetes:apps/v1:Deployment::app-dep]
        [provider=urn:pulumi:dev::iac-workshop-apps::pulumi:providers:kubernetes::default_1_2_3::c2145624-bf5a-4e9e-97c6-199096da4c67]
      ~ spec: {
          ~ replicas: 1 => 3
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
     pulumi:pulumi:Stack            iac-workshop-apps-dev
 ~   └─ kubernetes:apps:Deployment  app-dep           updated     [diff: ~spec]

Outputs:
    url: "http://ae33950ecf82111e9962d024411cd1af-422878052.eu-central-1.elb.amazonaws.com:80"

Resources:
    ~ 1 updated
    3 unchanged

Duration: 16s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop-apps/dev/updates/2
```

Query the pods again using your chosen namespace from earlier:

```bash
kubectl get pods --namespace joe-duffy
```

Check that there are now three:

```
NAME                               READY   STATUS    RESTARTS   AGE
app-dep-8r1febnu-6cd57d964-c76rx   1/1     Running   0          8m45s
app-dep-8r1febnu-6cd57d964-rdpn6   1/1     Running   0          8m35s
app-dep-8r1febnu-6cd57d964-tj6m4   1/1     Running   0          8m56s
```

Finally, curl the endpoint again:

```bash
curl $(pulumi stack output url)
```

If you'd like, do it a few more times, and observe that traffic will be load balanced across the three pods:

```bash
for i in {0..10}; do curl $(pulumi stack output url); done
```

## Step 8 &mdash; Destroy Everything

Finally, destroy the resources and the stack itself:

```
pulumi destroy
pulumi stack rm
```

## Next Steps

Congratulations! :tada: You've deployed a Kubernetes application to an existing EKS cluster, scaled it out, and performed a rolling update of the container image it is running.

Next, view the [suggested next steps](../../../../README.md#next-steps) after completing all labs.
