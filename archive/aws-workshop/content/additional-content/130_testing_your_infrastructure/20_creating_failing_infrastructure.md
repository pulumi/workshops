+++
title = "Creating Test Failing Infrastructure"
chapter = false
weight = 20
+++

Run the following command to install the pulumi-eks package:

```bash
npm install @pulumi/eks
```

The package will be added to `node_modules`, `package.json`, and `package-lock.json`. In keeping with our TDD theme, let’s
start with the tests failing to begin with (we are using the default VPC and not specifying a version). To our `index.ts`, we
will add the following cluster declaration

```typescript
import * as eks from "@pulumi/eks";

// Create a basic EKS cluster.
const cluster = new eks.Cluster("my-cluster", {
    desiredCapacity: 2,
    minSize: 1,
    maxSize: 2,
    storageClasses: "gp2",
    deployDashboard: false,
});
```

To run our tests, we need to run the deployment with `pulumi up` but also pass an extra parameter to point to the `tests` policies.
As expected, the result shows a test failure at the bottom:

```bash
$ pulumi up --policy-pack tests
```

You will see similar information printed out as follows:

```
Diagnostics:
  pulumi:pulumi:Stack (prop-testing-dev):
    error: preview failed

Policy Violations:
    [mandatory]  tests-pack v0.0.1  eks-test (prop-testing-dev: pulumi:pulumi:Stack)
    EKS integration tests.
    Expected EKS Cluster 'my-cluster-eksCluster-89c1d7d' version to be '1.16' but found 'undefined'
```

Note that only one test failed: the VPC test requires the actual deployment to run to retrieve a VPC ID because ID is 
unknown during the preview (the VPC does not exist yet).
