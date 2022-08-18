# Deploying a Kubernetes Cluster

In this lab, you will deploy a Kubernetes cluster in EKS.

> This lab assumes you have a project set up. If you don't yet, please [complete this lab first](../lab-01/01-creating-a-new-project.md).

## Step 1 &mdash; Install the AWS EKS Package

From your project's root directory, install the packages:

```bash
npm install @pulumi/eks
```

Next, add these imports your `index.ts` file:

```typescript
import * as eks from "@pulumi/eks"
```

> :white_check_mark: After this change, your `index.ts` should [look like this](./code/step1.ts).

## Step 2 &mdash; Create the Cluster

Add the following to your `index.ts` to create the EKS cluster using the
default VPC and default node group.

See for more details and examples:
- [API Docs](https://www.pulumi.com/docs/reference/pkg/nodejs/pulumi/eks/index.html)
- [Examples](https://www.pulumi.com/docs/reference/pkg/nodejs/pulumi/eks/index.html)

```typescript
const cluster = new eks.Cluster("eks", {
    deployDashboard: false,
});
```

> :white_check_mark: After this change, your `index.ts` should [look like this](./code/step2.ts).

## Step 3 &mdash; Get the Cluster kubeconfig

We'll need to the cluster's kubeconfig to interact with the cluster.

We can retrieve it from the cluster by adding the following to your `index.ts`:

```typescript
export const kubeconfig = cluster.kubeconfig;
```

> :white_check_mark: After this change, your `index.ts` should [look like this](./code/step3.ts).

## Step 4 &mdash; Deploy Everything

```bash
pulumi up
```

This will show you a preview and, after selecting `yes`, the application will be deployed:

```
Updating (dev):
    Type                                   Name                                   Status
    pulumi:pulumi:Stack                    iac-workshop-cluster-dev
+   └─ eks:index:Cluster                   eks                                    created
+      ├─ eks:index:ServiceRole            eks-eksRole                            created
+      │  ├─ aws:iam:Role                  eks-eksRole-role                       created
+      │  ├─ aws:iam:RolePolicyAttachment  eks-eksRole-4b490823                   created
+      │  └─ aws:iam:RolePolicyAttachment  eks-eksRole-90eb1c99                   created
+      ├─ eks:index:ServiceRole            eks-instanceRole                       created
+      │  ├─ aws:iam:Role                  eks-instanceRole-role                  created
+      │  ├─ aws:iam:RolePolicyAttachment  eks-instanceRole-03516f97              created
+      │  ├─ aws:iam:RolePolicyAttachment  eks-instanceRole-3eb088f2              created
+      │  └─ aws:iam:RolePolicyAttachment  eks-instanceRole-e1b295bd              created
+      ├─ pulumi-nodejs:dynamic:Resource   eks-cfnStackName                       created
+      ├─ aws:ec2:SecurityGroup            eks-eksClusterSecurityGroup            created
+      ├─ aws:iam:InstanceProfile          eks-instanceProfile                    created
+      ├─ aws:eks:Cluster                  eks-eksCluster                         created
+      ├─ aws:ec2:SecurityGroupRule        eks-eksClusterInternetEgressRule       created
+      ├─ aws:ec2:SecurityGroup            eks-nodeSecurityGroup                  created
+      ├─ aws:ec2:SecurityGroupRule        eks-eksClusterIngressRule              created
+      ├─ aws:ec2:SecurityGroupRule        eks-eksNodeIngressRule                 created
+      ├─ aws:ec2:SecurityGroupRule        eks-eksNodeInternetEgressRule          created
+      ├─ aws:ec2:SecurityGroupRule        eks-eksExtApiServerClusterIngressRule  created
+      ├─ aws:ec2:SecurityGroupRule        eks-eksNodeClusterIngressRule          created
+      ├─ aws:ec2:LaunchConfiguration      eks-nodeLaunchConfiguration            created
+      ├─ pulumi-nodejs:dynamic:Resource   eks-vpc-cni                            created
+      ├─ pulumi:providers:kubernetes      eks-eks-k8s                            created
+      ├─ kubernetes:core:ConfigMap        eks-nodeAccess                         created
+      ├─ aws:cloudformation:Stack         eks-nodes                              created
+      └─ pulumi:providers:kubernetes      eks-provider                           created

Outputs:
	kubeconfig: "{\"apiVersion\": \"v1\", \"clusters\": ...}" 

Resources:
    + 28 created

Duration: 14m40s
```

## Step 5 &mdash; Testing Cluster Access

Extract the kubeconfig from the stack output and point the `KUBECONFIG`
environment variable at your cluster configuration file:

```bash
pulumi stack output kubeconfig > kubeconfig.json
export KUBECONFIG=$PWD/kubeconfig.json
```

To test out connectivity, run `kubectl cluster-info`. You should see information similar to this:

```
Kubernetes master is running at https://E7CD24CD6FADEBA48CA1DE87B4E6A260.gr7.us-west-2.eks.amazonaws.com
CoreDNS is running at https://E7CD24CD6FADEBA48CA1DE87B4E6A260.gr7.us-west-2.eks.amazonaws.com/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
```

Check the nodes and pods:

```bash
kubectl get nodes -o wide --show-labels
kubectl get pods -A -o wide
```

## Next Steps

Congratulations! :tada: You've deployed a Kubernetes EKS cluster.

Next, check out the [next lab](../lab-05/README.md) to deploy and work with container based applications.

Note: you'll need to make a note of the stack's Pulumi path to reference it in
the next lab.

This is a string in the format: `<organization_or_user>/<projectName>/<stackName>`.

You can find the full string by running and extracting the path:

```bash
pulumi stack ls

NAME  LAST UPDATE     RESOURCE COUNT  URL
dev*  45 minutes ago  15              https://app.pulumi.com/joeduffy/iac-workshop-cluster/dev
```

The stack reference string is `joeduffy/iac-workshop-cluster/dev` from the output
above.

## Destroy Everything

After completing the next steps and destroying that stack, now destroy the
resources and the stack for the cluster:

```bash
pulumi destroy
pulumi stack rm
```
