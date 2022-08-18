# Deploying a Kubernetes Cluster

In this lab, you will deploy a Kubernetes cluster in EKS.

> This lab assumes you have a project set up. If you don't yet, please [complete this lab first](../lab-01/01-creating-a-new-project.md).

## Step 1 &mdash; Install the Pulumi and AWS Packages

From your project's root directory, install the packages:

```bash
pip3 install pulumi pulumi-aws
```

Next, add these imports and variable to your `__main__.py` file:

```python
from pulumi import Output
import pulumi_aws as aws
import json, hashlib
h = hashlib.new('sha1')
```

> :white_check_mark: After this change, your `__main__.py` should [look like this](./code/step1.py).

## Step 2 &mdash; Create the Cluster and Node IAM Roles

We need to create IAM roles for the cluster to work with EKS, and for the node
groups to join the cluster.

Start with the cluster service role by adding this to your `__main__.py` file:

```python
# Create the EKS Service Role and the correct role attachments
service_role = aws.iam.Role("eks-service-role",
    assume_role_policy=json.dumps({
        "Version": "2012-10-17",
        "Statement": [{
            "Sid": "",
            "Effect": "Allow",
            "Principal": {
                "Service": "eks.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }]
    })
)

service_role_managed_policy_arns = [
    "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy",
    "arn:aws:iam::aws:policy/AmazonEKSServicePolicy"
]

for policy in service_role_managed_policy_arns:
    h.update(policy.encode('utf-8'))
    role_policy_attachment = aws.iam.RolePolicyAttachment(f"eks-service-role-{h.hexdigest()[0:8]}",
        policy_arn=policy,
        role=service_role.name
    )
```

Next, let's create the nodegroup role:

```python
# Create the EKS NodeGroup Role and the correct role attachments
node_group_role = aws.iam.Role("eks-nodegroup-role",
    assume_role_policy=json.dumps({
       "Version": "2012-10-17",
       "Statement": [{
           "Sid": "",
           "Effect": "Allow",
           "Principal": {
               "Service": "ec2.amazonaws.com"
           },
           "Action": "sts:AssumeRole"
       }]
    })
)

nodegroup_role_managed_policy_arns = [
    "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
    "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
]

for policy in nodegroup_role_managed_policy_arns:
    h.update(policy.encode('utf-8'))
    role_policy_attachment = aws.iam.RolePolicyAttachment(f"eks-nodegroup-role-{h.hexdigest()[0:8]}",
        policy_arn=policy,
        role=node_group_role.name
    )
```

> :white_check_mark: After this change, your `__main__.py` should [look like this](./code/step2.py).

## Step 3 &mdash; Configure the Networking

We'll need to provide a VPC for the cluster to use, with the appropriate
security groups. The security groups will be configured to allow external
internet access, and HTTP ingress for a container application in the next lab.

```python
# Get the VPC and subnets to launch the EKS cluster into
default_vpc = aws.ec2.get_vpc(default="true")
default_vpc_subnets = aws.ec2.get_subnet_ids(vpc_id=default_vpc.id)

# Create the Security Group that allows access to the cluster pods
sg = aws.ec2.SecurityGroup("eks-cluster-security-group",
    vpc_id=default_vpc.id,
    revoke_rules_on_delete="true",
    ingress=[{
       'cidr_blocks' : ["0.0.0.0/0"],
       'from_port' : '80',
       'to_port' : '80',
       'protocol' : 'tcp',
    }]
)

sg_rule = aws.ec2.SecurityGroupRule("eks-cluster-security-group-egress-rule",
    type="egress",
    from_port=0,
    to_port=0,
    protocol="-1",
    cidr_blocks=["0.0.0.0/0"],
    security_group_id=sg.id
)
```

> :white_check_mark: After this change, your `__main__.py` should [look like this](./code/step3.py).

## Step 4 &mdash; Create the Cluster

Add the following to your `__main__.py` to define the EKS cluster to create,
using its IAM role and networking setup.

```
cluster = aws.eks.Cluster("eks-cluster",
    role_arn=service_role.arn,
    vpc_config={
      "security_group_ids": [sg.id],
      "subnet_ids": default_vpc_subnets.ids,
      "endpointPrivateAccess": "false",
      "endpointPublicAccess": "true",
      "publicAccessCidrs": ["0.0.0.0/0"],
    },
)
```

> :white_check_mark: After this change, your `__main__.py` should [look like this](./code/step4.py).

## Step 5 &mdash; Create the NodeGroup

Add the following to your `__main__.py` to define the nodegroup to create, and 
attach to the cluster using its IAM role and networking setup.

```python
node_group = aws.eks.NodeGroup("eks-node-group",
    cluster_name=cluster.name,
    node_role_arn=node_group_role.arn,
    subnet_ids=default_vpc_subnets.ids,
    scaling_config = {
       "desired_size": 2,
       "max_size": 2,
       "min_size": 1,
    },
)
```

> :white_check_mark: After this change, your `__main__.py` should [look like this](./code/step5.py).

## Step 6 &mdash; Generate the kubeconfig

We'll need to create a kubeconfig per the [EKS guides](https://docs.aws.amazon.com/eks/latest/userguide/create-kubeconfig.html )
that uses the cluster's properties.

```python
def generateKubeconfig(endpoint, cert_data, cluster_name):
    return {
        "apiVersion": "v1",
        "clusters": [{
            "cluster": {
                "server": f"{endpoint}",
                "certificate-authority-data": f"{cert_data}"
            },
            "name": "kubernetes",
        }],
        "contexts": [{
            "context": {
                "cluster": "kubernetes",
                "user": "aws",
            },
            "name": "aws",
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
                        f"{cluster_name}",
                    ],
                },
            },
        }],
    }

# Create the KubeConfig Structure as per https://docs.aws.amazon.com/eks/latest/userguide/create-kubeconfig.html
kubeconfig = Output.all(cluster.endpoint, cluster.certificate_authority["data"], cluster.name).apply(lambda args: generateKubeconfig(args[0], args[1], args[2]))

export("kubeconfig", kubeconfig)
```

> :white_check_mark: After this change, your `__main__.py` should [look like this](./code/step6.py).

## Step 7 &mdash; Deploy Everything

```bash
pulumi up
```

This will show you a preview and, after selecting `yes`, the application will be deployed:

```
Updating (dev):

     Type                             Name                                    Status
 +   pulumi:pulumi:Stack              python-testing-dev                      created
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

## Destroy Everything

After completing the next steps and destroying that stack, now destroy
the resources and the stack for the cluster:

```
pulumi destroy
pulumi stack rm
```
