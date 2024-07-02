# Component Resources

The second tool in our arsenal is a Pulumi concept called a ComponentResource.

A component resource is a logical grouping of resources. Components usually instantiate a set of related resources in their constructor, aggregate them as children, and create a larger, useful abstraction that encapsulates their implementation details.

In this exercise, we're going to build a ComponentResource that will allow us to create a Kubernetes cluster on Civo Cloud.

## Exercises

Each of these exercises can be completed for any language. If you need hints or the solutions, check in the README.md for each language.

### 1. Preview! Preview! Preview

We ran `pulumi up` in the first part of this workshop because creating a network is pretty much instantaneous. For this workshop, creating a cluster can take a couple of minutes. So instead of using `pulumi up` to ensure our dependencies are good, we're going to use `pulumi preview` to validate them without actually creating the cluster.

If you're missing your Pulumi token, ensure you:

1. `pulumi login`

If you have opted not to use Pulumi SaaS, you can use `pulumi login --local`

If you're missing your Civo token, ensure you:

1. [Get your token here](https://www.civo.com/account/security)
2. `pulumi config set --secret civo:token`

### 1. Create an Empty `Cluster` ComponentResource

**Comment out all the resource code that currently exists.** We'll just use it for reference as we expand our ComponentResource.

We've got to start somewhere 😃

Run `pulumi preview` to see what you get.

### 2. Add a Civo `KubernetesCluster` Resource

Let's add this as the "default" behavior when instantiating our ComponentResource, as these are "mandatory" resources.

This resource has some dependencies and some required properties:

- Network
- Firewall
- Pools
- Applications
- Node Pool Size & Type

### 3. Allow for the `KubernetesCluster` to Deploy Workloads

We want to use "helper functions / methods" on our `Cluster` ComponentResource to allow adding our `nginx` deployment.

### 4. Allow Exposing Workloads as a Service

Support `ClusterIP` and `NodePort` services.

### 5. Add a Convenience Method that Returns the Kubeconfig

Sometimes it's nice to provide an escape hatch for your developers, especially as you iterate and build on your platform developer experience.
