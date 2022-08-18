using System.Collections.Generic;
using Pulumi;
using Pulumi.Aws.Eks.Inputs;
using Ec2 = Pulumi.Aws.Ec2;
using Iam = Pulumi.Aws.Iam;
using Eks = Pulumi.Aws.Eks;
using CoreV1 = Pulumi.Kubernetes.Core.V1;
using AppsV1 = Pulumi.Kubernetes.Apps.V1;
using Pulumi.Kubernetes.Types.Inputs.Apps.V1;
using Pulumi.Kubernetes.Types.Inputs.Core.V1;
using Pulumi.Kubernetes.Types.Inputs.Meta.V1;

class MyStack : Stack
{
    private Output<string> GenerateKubeconfig(Output<string> clusterEndpoint, Output<string> certData,
        Output<string> clusterName)
    {
        return Output.Format($@"{{
        ""apiVersion"": ""v1"",
        ""clusters"": [{{
            ""cluster"": {{
                ""server"": ""{clusterEndpoint}"",
                ""certificate-authority-data"": ""{certData}""
            }},
            ""name"": ""kubernetes"",
        }}],
        ""contexts"": [{{
            ""context"": {{
                ""cluster"": ""kubernetes"",
                ""user"": ""aws"",
            }},
            ""name"": ""aws"",
        }}],
        ""current-context"": ""aws"",
        ""kind"": ""Config"",
        ""users"": [{{
            ""name"": ""aws"",
            ""user"": {{
                ""exec"": {{
                    ""apiVersion"": ""client.authentication.k8s.io/v1alpha1"",
                    ""command"": ""aws-iam-authenticator"",
                    ""args"": [
                        ""token"",
                        ""-i"",
                        ""{clusterName}"",
                    ],
                }},
            }},
        }}],
    }}");
    }

    public MyStack()
    {
        // Read back the default VPC and public subnets, which we will use.
        var vpc = Output.Create(Ec2.GetVpc.InvokeAsync(new Ec2.GetVpcArgs {Default = true}));
        var vpcId = vpc.Apply(vpc => vpc.Id);
        var subnet = vpcId.Apply(id => Ec2.GetSubnetIds.InvokeAsync(new Ec2.GetSubnetIdsArgs {VpcId = id}));
        var subnetIds = subnet.Apply(s => s.Ids);

        // Create an IAM role that can be used by our service's task.
        var eksRole = new Iam.Role("eks-iam-eksRole", new Iam.RoleArgs
        {
            AssumeRolePolicy = @"{
""Version"": ""2008-10-17"",
""Statement"": [{
    ""Sid"": """",
    ""Effect"": ""Allow"",
    ""Principal"": {
        ""Service"": ""eks.amazonaws.com""
    },
    ""Action"": ""sts:AssumeRole""
}]
}"
        });

        var eksPolicies = new Dictionary<string, string>
        {
            {"service-policy", "arn:aws:iam::aws:policy/AmazonEKSServicePolicy"},
            {"cluster-policy", "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"}
        };

        foreach (var (name, policy) in eksPolicies)
        {
            var taskExecAttach = new Iam.RolePolicyAttachment($"rpa-{name}",
                new Iam.RolePolicyAttachmentArgs
                {
                    Role = eksRole.Name,
                    PolicyArn = policy,
                });
        }

        // Create an IAM role that can be used by our service's task.
        var nodeGroupRole = new Iam.Role("nodegroup-iam-role", new Iam.RoleArgs
        {
            AssumeRolePolicy = @"{
""Version"": ""2008-10-17"",
""Statement"": [{
    ""Sid"": """",
    ""Effect"": ""Allow"",
    ""Principal"": {
        ""Service"": ""ec2.amazonaws.com""
    },
    ""Action"": ""sts:AssumeRole""
}]
}"
        });

        var nodeGroupPolicies = new Dictionary<string, string>
        {
            { "worker", "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy" },
            { "cni", "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy" },
            { "registry", "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly" }
        };
        foreach (var (name, policy) in nodeGroupPolicies)
        {
            var taskExecAttach = new Iam.RolePolicyAttachment($"ngpa-{name}",
                new Iam.RolePolicyAttachmentArgs
                {
                    Role = nodeGroupRole.Name,
                    PolicyArn = policy,
                });
        }

        var clusterSg = new Ec2.SecurityGroup("cluster-sg", new Ec2.SecurityGroupArgs
        {
            VpcId = vpcId,
            Egress =
            {
                new Ec2.Inputs.SecurityGroupEgressArgs
                {
                    Protocol = "-1",
                    FromPort = 0,
                    ToPort = 0,
                    CidrBlocks = {"0.0.0.0/0"}
                }
            },
            Ingress =
            {
                new Ec2.Inputs.SecurityGroupIngressArgs
                {
                    Protocol = "tcp",
                    FromPort = 80,
                    ToPort = 80,
                    CidrBlocks = {"0.0.0.0/0"}
                }
            }
        });

        var cluster = new Eks.Cluster("eks-cluster", new Eks.ClusterArgs
        {
            RoleArn = eksRole.Arn,
            VpcConfig = new ClusterVpcConfigArgs
            {
                PublicAccessCidrs =
                {
                    "0.0.0.0/0",
                },
                SecurityGroupIds =
                {
                    clusterSg.Id,
                },
                SubnetIds = subnetIds,
            },
        });

        var nodeGroup = new Eks.NodeGroup("node-group", new Eks.NodeGroupArgs
        {
            ClusterName = cluster.Name,
            NodeGroupName = "demo-eks-nodegroup",
            NodeRoleArn = nodeGroupRole.Arn,
            SubnetIds = subnetIds,
            ScalingConfig = new NodeGroupScalingConfigArgs
            {
                DesiredSize = 2,
                MaxSize = 2,
                MinSize = 2
            },
        });

        this.Kubeconfig = GenerateKubeconfig(cluster.Endpoint,
            cluster.CertificateAuthority.Apply(x => x.Data),
            cluster.Name);

        var k8sProvider = new K8s.Provider("k8s-provider", new K8s.ProviderArgs
        {
            KubeConfig = this.Kubeconfig
        });
    }

    [Output] public Output<string> Kubeconfig { get; set; }
}

