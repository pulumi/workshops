# Deploy the infrastructure

Before we start refactoring, we need to deploy our initial Pulumi project.

In `workspace/project` you'll see a Pulumi project consisting of some Azure network resources, an AKS cluster and a Kubernetes workload.

Make note of a few things here:

- `Pulumi.yaml`: the `Pulumi.yaml` file project name is `refactor-workshop`. The project name will remain static throughout our refactoring.
- `Pulumi.dev.yaml`: We'll be creating a Pulumi stack for you to work with. Check the `dev.yaml` file and check to ensure the subnets configuration here works with your Azure account

## Deploy the infrastructure

Make sure you have the correct stack selected:

```bash
pulumi stack select dev
```

Then provision your infrastructure, like so:

```bash
pulumi up
```

This ends lab 1. You now have some infrastructure deployed, let's start refactoring in place


# Next Steps

* [Refactor in Place](../lab-02/README.md)

