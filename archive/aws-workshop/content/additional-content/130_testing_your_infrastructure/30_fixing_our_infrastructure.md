+++
title = "Fix Our Test-Failing Infrastructure"
chapter = false
weight = 30
+++

To fix the first problem, we need to pass the Kubernetes version explicitly when creating our cluster. That’s as simple as passing a new argument:

```typescript
version: "1.16",
```

{{% notice info %}}
The `index.ts` file should now have the following contents:
{{% /notice %}}
```typescript
import * as eks from "@pulumi/eks";

// Create a basic EKS cluster.
const cluster = new eks.Cluster("my-cluster", {
    desiredCapacity: 2,
    minSize: 1,
    maxSize: 2,
    storageClasses: "gp2",
    deployDashboard: false,
    version: "1.16",
});
```

If we rerun `pulumi up --policy-pack tests`, we’ll see that the preview now passes:

```
Previewing update (dev):
...

Policy Packs run:
    Name                Version
    tests-pack (tests)  (local)

Do you want to perform this update?
  yes
> no
  details
```

Let's go ahead and choose `yes` to deploy the infrastructure. After the update complete, the tests run again to inspect the actual resources. Predictably, the VPC test fails now:

```
Diagnostics:
  pulumi:pulumi:Stack (prop-testing-dev):
    error: update failed

Policy Violations:
    [mandatory]  tests-pack v0.0.1  eks-test (prop-testing-dev: pulumi:pulumi:Stack)
    EKS integration tests.
    EKS Cluster 'my-cluster-eksCluster-515c7f9' should not use the default VPC
```

Now we need to fix up our tests by creating a custom VPC and deploying our EKS Cluster into that VPC. We will do this by using 
the `awsx` package that is installed when creating a new `pulumi aws-typescript` application:

```typescript
const vpc = new awsx.ec2.Vpc("my-vpc", {});
```

We need to assign this VPC to the EKS cluster:

```typescript
    vpcId: vpc.id,
    subnetIds: vpc.publicSubnetIds,
```

{{% notice info %}}
The `index.ts` file should now have the following contents:
{{% /notice %}}
```typescript
import * as eks from "@pulumi/eks";
import * as awsx from "@pulumi/awsx";

const vpc = new awsx.ec2.Vpc("my-vpc");

// Create a basic EKS cluster.
const cluster = new eks.Cluster("my-cluster", {
    desiredCapacity: 2,
    minSize: 1,
    maxSize: 2,
    storageClasses: "gp2",
    deployDashboard: false,
    version: "1.16",
    vpcId: vpc.id,
    subnetIds: vpc.publicSubnetIds,
});
```

If we run `pulumi up --policy-pack tests -y`, we’ll see that all the tests now pass after the VPC is created and the cluster is replaced:

```
Resources:
    + 30 created
    ~ 2 updated
    +-14 replaced
    46 changes. 13 unchanged

Policy Packs run:
    Name                Version
    tests-pack (tests)  (local)

Permalink: https://app.pulumi.com/workshops/prop-testing/dev/updates/4
```

We have just successfully created an EKS cluster with tests to ensure it is fit for purpose.
