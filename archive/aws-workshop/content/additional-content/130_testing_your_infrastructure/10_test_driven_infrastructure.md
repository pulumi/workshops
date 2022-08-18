+++
title = "Test-Driving Our Infrastructure"
chapter = false
weight = 10
+++

## Step 1 &mdash; Scaffolding Our Test Application

In true spirit of test-driven development (TDD), let’s start with the tests themselves. We are going to edit `tests/index.ts` and
add our test code. Let's replace the PolicyPack code with the following:

```typescript
const stackPolicy: policy.StackValidationPolicy = {
    name: "eks-test",
    description: "EKS integration tests.",
    enforcementLevel: "mandatory",
    validateStack: async (args, reportViolation) => {
        const clusterResources = args.resources.filter(r => r.isType(aws.eks.Cluster));
        if (clusterResources.length !== 1) {
            reportViolation(`Expected one EKS Cluster but found ${clusterResources.length}`);
            return;
        }

        const cluster = clusterResources[0].asType(aws.eks.Cluster)!;

        // TODO 1: validate the cluster version

        // TODO 2: validate the cluster VPC
    },
}

const tests = new policy.PolicyPack("tests-pack", {
    policies: [stackPolicy],
});
```

{{% notice info %}}
The `index.ts` file should now have the following contents:
{{% /notice %}}
```typescript
import * as aws from "@pulumi/aws";
import * as policy from "@pulumi/policy";
import * as pulumi from "@pulumi/pulumi";

const stackPolicy: policy.StackValidationPolicy = {
    name: "eks-test",
    description: "EKS integration tests.",
    enforcementLevel: "mandatory",
    validateStack: async (args, reportViolation) => {
        const clusterResources = args.resources.filter(r => r.isType(aws.eks.Cluster));
        if (clusterResources.length !== 1) {
            reportViolation(`Expected one EKS Cluster but found ${clusterResources.length}`);
            return;
        }

        const cluster = clusterResources[0].asType(aws.eks.Cluster)!;

        // TODO 1: validate the cluster version

        // TODO 2: validate the cluster VPC
    },
}

const tests = new policy.PolicyPack("tests-pack", {
    policies: [stackPolicy],
});
```
 
This code creates a single [stack policy](https://pulumi.com/docs/guides/crossguard/core-concepts/#stack-validation-policy) to
describe the properties of the EKS cluster. The first implicit property is the fact that there is an EKS cluster in the stack at all. 
If the cluster is not found, or several clusters are found, the test reports a violation (failure).

## Step 2 &mdash; Validating the Cluster Version

We can replace the `TODO 1` code with the assertion against the version property, as follows:

```typescript
if (cluster.version !== "1.16") {
    reportViolation(
        `Expected EKS Cluster '${cluster.name}' version to be '1.16' but found '${cluster.version}'`);
}
```

## Step 3 &mdash; Validating the Cluster VPC

We can replace the `TODO 2` code with the assertion against the vpc property, as follows:

```typescript
const vpcId = cluster.vpcConfig.vpcId;
if (!vpcId) {
    // 'isDryRun==true' means the test are running in preview.
    // If so, the VPC might not exist yet even though it's defined in the program.
    // We shouldn't fail the test then to avoid false negatives.
    if (!pulumi.runtime.isDryRun()) {
        reportViolation(`EKS Cluster '${cluster.name}' has unknown VPC`);
    }
    return;
}

const ec2 = new aws.sdk.EC2({region: aws.config.region});
const response = await ec2.describeVpcs().promise();
const defaultVpc = response.Vpcs?.find(vpc => vpc.IsDefault);
if (!defaultVpc) {
    reportViolation("Default VPC not found");
    return;
}

if (defaultVpc.VpcId === vpcId) {
    reportViolation(`EKS Cluster '${cluster.name}' should not use the default VPC`);
}
```

First, we are checking that there is a non-empty VPC assigned to the cluster. Then we use the AWS SDK to retrieve the default VPC
and we compare to ensure that the default VPC ID is not assigned to the cluster.

{{% notice info %}}
The `index.ts` file should now have the following contents:
{{% /notice %}}
```typescript
import * as aws from "@pulumi/aws";
import * as policy from "@pulumi/policy";
import * as pulumi from "@pulumi/pulumi";

const stackPolicy: policy.StackValidationPolicy = {
    name: "eks-test",
    description: "EKS integration tests.",
    enforcementLevel: "mandatory",
    validateStack: async (args, reportViolation) => {
        const clusterResources = args.resources.filter(r => r.isType(aws.eks.Cluster));
        if (clusterResources.length !== 1) {
            reportViolation(`Expected one EKS Cluster but found ${clusterResources.length}`);
            return;
        }

        const cluster = clusterResources[0].asType(aws.eks.Cluster)!;

        if (cluster.version !== "1.16") {
            reportViolation(
                `Expected EKS Cluster '${cluster.name}' version to be '1.16' but found '${cluster.version}'`);
        }

        const vpcId = cluster.vpcConfig.vpcId;
        if (!vpcId) {
            // 'isDryRun==true' means the test are running in preview.
            // If so, the VPC might not exist yet even though it's defined in the program.
            // We shouldn't fail the test then to avoid false negatives.
            if (!pulumi.runtime.isDryRun()) {
                reportViolation(`EKS Cluster '${cluster.name}' has unknown VPC`);
            }
            return;
        }
        
        const ec2 = new aws.sdk.EC2({region: aws.config.region});
        const response = await ec2.describeVpcs().promise();
        const defaultVpc = response.Vpcs?.find(vpc => vpc.IsDefault);
        if (!defaultVpc) {
            reportViolation("Default VPC not found");
            return;
        }
        
        if (defaultVpc.VpcId === vpcId) {
            reportViolation(`EKS Cluster '${cluster.name}' should not use the default VPC`);
        }
    },
}

const tests = new policy.PolicyPack("tests-pack", {
    policies: [stackPolicy],
});
```
