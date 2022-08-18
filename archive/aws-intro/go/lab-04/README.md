# Deploying a Kubernetes Cluster

In this lab, you will deploy a Kubernetes cluster in EKS.

> This lab assumes you have a project set up. If you don't yet, please [complete this lab first](../lab-01/01-creating-a-new-project.md).

## Step 1 &mdash; Install the Pulumi and AWS Package

From your project's root directory, install the packages:

```
GO111MODULE=on go get github.com/pulumi/pulumi github.com/pulumi/pulumi-aws
```

Next, add these imports to your `main.go` file and create the `main` function:

```go
package main

import (
    "fmt"
	"github.com/pulumi/pulumi-aws/sdk/go/aws/iam"
	"github.com/pulumi/pulumi/sdk/go/pulumi"
)

func main() {
}
```

> :white_check_mark: After this change, your `main.go` should [look like this](./code/step1.go).

## Step 2 &mdash; Create the Cluster and Node IAM Roles

We need to create IAM roles for the cluster to work with EKS, and for the node
groups to join the cluster.

Start with the cluster service role by adding this to your `main.go` file in
the `main` function:

```go
func main() {
    pulumi.Run(func(ctx *pulumi.Context) error {
        eksRole, err := iam.NewRole(ctx, "eks-iam-eksRole", &iam.RoleArgs{
            AssumeRolePolicy: pulumi.String(`{
		    "Version": "2008-10-17",
		    "Statement": [{
		        "Sid": "",
		        "Effect": "Allow",
		        "Principal": {
		            "Service": "eks.amazonaws.com"
		        },
		        "Action": "sts:AssumeRole"
		    }]
		}`),
        })
        if err != nil {
            return err
        }
        eksPolicies := []string{
            "arn:aws:iam::aws:policy/AmazonEKSServicePolicy",
            "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy",
        }
        for i, eksPolicy := range eksPolicies {
            _, err := iam.NewRolePolicyAttachment(ctx, fmt.Sprintf("rpa-%d", i), &iam.RolePolicyAttachmentArgs{
                PolicyArn: pulumi.String(eksPolicy),
                Role:      eksRole.Name,
            })
            if err != nil {
                return err
            }
        }
    }
}
```


Next, let's create the nodegroup role by appending this to the `main` function:

```go
...
    // Create the EC2 NodeGroup Role
    nodeGroupRole, err := iam.NewRole(ctx, "nodegroup-iam-role", &iam.RoleArgs{
        AssumeRolePolicy: pulumi.String(`{
        "Version": "2012-10-17",
        "Statement": [{
            "Sid": "",
            "Effect": "Allow",
            "Principal": {
                "Service": "ec2.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }]
    }`),
    })
    if err != nil {
        return err
    }
    nodeGroupPolicies := []string{
        "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
        "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
        "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
    }
    for i, nodeGroupPolicy := range nodeGroupPolicies {
        _, err := iam.NewRolePolicyAttachment(ctx, fmt.Sprintf("ngpa-%d", i), &iam.RolePolicyAttachmentArgs{
            Role:      nodeGroupRole.Name,
            PolicyArn: pulumi.String(nodeGroupPolicy),
        })
        if err != nil {
            return err
        }
    }
```

> :white_check_mark: After this change, your `main.go` should [look like this](./code/step2.go).

## Step 3 &mdash; Configure the Networking

We'll need to provide a VPC for the cluster to use, with the appropriate
security groups. The security groups will be configured to allow external
internet access, and HTTP ingress for a container application in the next lab.

First, add this import to your `main.go` file:

```go
"github.com/pulumi/pulumi-aws/sdk/go/aws/ec2"
```

Next, append this to the `main` function:

```go
...
    // Read back the default VPC and public subnets, which we will use.
    t := true
    vpc, err := ec2.LookupVpc(ctx, &ec2.LookupVpcArgs{Default: &t})
    if err != nil {
        return err
    }
    subnet, err := ec2.GetSubnetIds(ctx, &ec2.GetSubnetIdsArgs{VpcId: vpc.Id})
    if err != nil {
        return err
    }
    // Create a Security Group that we can use to actually connect to our cluster
    clusterSg, err := ec2.NewSecurityGroup(ctx, "cluster-sg", &ec2.SecurityGroupArgs{
        VpcId: pulumi.String(vpc.Id),
        Egress: ec2.SecurityGroupEgressArray{
            ec2.SecurityGroupEgressArgs{
                Protocol:   pulumi.String("-1"),
                FromPort:   pulumi.Int(0),
                ToPort:     pulumi.Int(0),
                CidrBlocks: pulumi.StringArray{pulumi.String("0.0.0.0/0")},
            },
        },
        Ingress: ec2.SecurityGroupIngressArray{
            ec2.SecurityGroupIngressArgs{
                Protocol:   pulumi.String("tcp"),
                FromPort:   pulumi.Int(80),
                ToPort:     pulumi.Int(80),
                CidrBlocks: pulumi.StringArray{pulumi.String("0.0.0.0/0")},
            },
        },
    })
    if err != nil {
        return err
    }
```

> :white_check_mark: After this change, your `main.go` should [look like this](./code/step3.go).

## Step 4 &mdash; Create the Cluster

First, add this import to your `main.go` file:

```go
"github.com/pulumi/pulumi-aws/sdk/go/aws/eks"
```

Now lets add a helper function to work with Pulumi `StringArrays` by adding
this to your `main.go`

```go
func toPulumiStringArray(a []string) pulumi.StringArrayInput {
	var res []pulumi.StringInput
	for _, s := range a {
		res = append(res, pulumi.String(s))
	}
	return pulumi.StringArray(res)
}
```

Next, add the following to your `main` function to define the EKS cluster to create,
using its IAM role and networking setup.

```go
...
    // Create EKS Cluster
    eksCluster, err := eks.NewCluster(ctx, "eks-cluster", &eks.ClusterArgs{
        RoleArn: pulumi.StringInput(eksRole.Arn),
        VpcConfig: &eks.ClusterVpcConfigArgs{
            PublicAccessCidrs: pulumi.StringArray{
                pulumi.String("0.0.0.0/0"),
            },
            SecurityGroupIds: pulumi.StringArray{
                clusterSg.ID().ToStringOutput(),
            },
            SubnetIds: toPulumiStringArray(subnet.Ids),
        },
    })
    if err != nil {
        return err
    }
```

> :white_check_mark: After this change, your `main.go` should [look like this](./code/step4.go).

## Step 5 &mdash; Create the NodeGroup

Add the following to your `main` function to define the nodegroup to create, and 
attach to the cluster using its IAM role and networking setup.

```go
...
    // Create the NodeGroup.
    _, err = eks.NewNodeGroup(ctx, "node-group-2", &eks.NodeGroupArgs{
        ClusterName:   eksCluster.Name,
        NodeGroupName: pulumi.String("demo-eks-nodegroup-2"),
        NodeRoleArn:   pulumi.StringInput(nodeGroupRole.Arn),
        SubnetIds:     toPulumiStringArray(subnet.Ids),
        ScalingConfig: &eks.NodeGroupScalingConfigArgs{
            DesiredSize: pulumi.Int(2),
            MaxSize:     pulumi.Int(2),
            MinSize:     pulumi.Int(1),
        },
    })
    if err != nil {
        return err
    }
```

> :white_check_mark: After this change, your `main.go` should [look like this](./code/step5.go).

## Step 6 &mdash; Generate the kubeconfig

We'll need to create a kubeconfig per the [EKS guides](https://docs.aws.amazon.com/eks/latest/userguide/create-kubeconfig.html )
that uses the cluster's properties.

First, we'll add a helper function to generate the kubeconfig by adding the
following to your `main.go`:

```go
// Create the KubeConfig Structure as per https://docs.aws.amazon.com/eks/latest/userguide/create-kubeconfig.html
func generateKubeconfig(clusterEndpoint pulumi.StringOutput, certData pulumi.StringOutput, clusterName pulumi.StringOutput) pulumi.Output {
	data := pulumi.Sprintf(`{
        "apiVersion": "v1",
        "clusters": [{
            "cluster": {
                "server": "%s",
                "certificate-authority-data": "%s"
            },
            "name": "kubernetes"
        }],
        "contexts": [{
            "context": {
                "cluster": "kubernetes",
                "user": "aws"
            },
            "name": "aws"
        }],
        "current-context": "aws",
        "kind": "Config",
        "users": [{
            "name": "aws",
            "user": {
                "exec": {
                    "apiVersion": "client.authentication.k8s.io/v1alpha1",
                    "command": "aws-iam-authenticator",
                    "args": [
                        "token",
                        "-i",
                        "%s"
                    ]
                }
            }
        }]
    }`, clusterEndpoint, certData, clusterName)

	return data.ApplyT(func(in interface{}) map[string]interface{} {
		d := []byte(in.(string))
		var kc map[string]interface{}
		if err := json.Unmarshal(d, &kc); err != nil {
			panic(err)
		}
		return kc
	}).(pulumi.Output)
}
```

Next, add the following to your `main` function to create and export the
kubeconfig.

```go
...
    ctx.Export("kubeconfig", generateKubeconfig(eksCluster.Endpoint,
        eksCluster.CertificateAuthority.Data().Elem(), eksCluster.Name))

    return nil
```

> :white_check_mark: After this change, your `main.go` should [look like this](./code/step6.go).

## Step 7 &mdash; Deploy Everything

First, get the vendored modules.

If working within your `$GOPATH`:

```bash
go mod init
```

If **not** working within your `$GOPATH`:

```bash
go mod init <module_path>     // e.g. github.com/joe-duffy/iac-workshop-apps
```

Deploy everything:

```bash
pulumi up
```

This will show you a preview and, after selecting `yes`, the application will be deployed:

```
Updating (dev):

     Type                             Name                                    Status
 +   pulumi:pulumi:Stack              iac-workshop-cluster                    created
 +   ├─ aws:iam:Role                  eks-nodegroup-role                      created
 +   ├─ aws:iam:Role                  eks-service-role                        created
 +   ├─ aws:iam:RolePolicyAttachment  eks-service-role-4b490823               created
 +   ├─ aws:iam:RolePolicyAttachment  eks-service-role-c05aa93d               created
 +   ├─ aws:iam:RolePolicyAttachment  eks-nodegroup-role-5924e9b1             created
 +   ├─ aws:iam:RolePolicyAttachment  eks-nodegroup-role-defaaaa0             created
 +   ├─ aws:iam:RolePolicyAttachment  eks-nodegroup-role-f878e9dc             created
 +   ├─ aws:ec2:SecurityGroup         eks-cluster-security-group              created
 +   ├─ aws:ec2:SecurityGroupRule     eks-cluster-security-group-egress-rule  created
 +   ├─ aws:eks:Cluster               eks-cluster                             created
 +   ├─ aws:eks:NodeGroup             eks-node-group                          created
 +   ├─ pulumi:providers:kubernetes   k8s-provider                            created

Outputs:
	kubeconfig: "{\"apiVersion\": \"v1\", \"clusters\": ...}" 

Resources:
    + 16 created

Duration: 12m50s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop-cluster/dev/updates/1
```

## Step 8 &mdash; Testing Cluster Access

Extract the kubeconfig from the stack output and point the `KUBECONFIG`
environment variable at your cluster configuration file:

```bash
pulumi stack output kubeconfig > kubeconfig.json
export KUBECONFIG=$PWD/kubeconfig.json
```

To test out connectivity, run `kubectl cluster-info`. You should see information similar to this:

```
Kubernetes master is running at https://abcxyz123.gr7.eu-central-1.eks.amazonaws.com
CoreDNS is running at https://abcxyz123.gr7.eu-central-1.eks.amazonaws.com/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
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
