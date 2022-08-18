using Pulumi;

class MyStack : Stack
{
    public MyStack()
    {
        var cluster = new Pulumi.Aws.Ecs.Cluster("app-cluster");

        // Read back the default VPC and public subnets, which we will use.
        var vpc = Output.Create(Pulumi.Aws.Ec2.GetVpc.InvokeAsync(new Pulumi.Aws.Ec2.GetVpcArgs { Default = true }));
        var vpcId = vpc.Apply(vpc => vpc.Id);
        var subnet = vpcId.Apply(id => Pulumi.Aws.Ec2.GetSubnetIds.InvokeAsync(new Pulumi.Aws.Ec2.GetSubnetIdsArgs { VpcId = id }));
        var subnetIds = subnet.Apply(s => s.Ids);

        // Create a SecurityGroup that permits HTTP ingress and unrestricted egress.
        var webSg = new Pulumi.Aws.Ec2.SecurityGroup("web-sg", new Pulumi.Aws.Ec2.SecurityGroupArgs
        {
            VpcId = vpcId,
            Egress =
            {
                new Pulumi.Aws.Ec2.Inputs.SecurityGroupEgressArgs
                {
                    Protocol = "-1",
                    FromPort = 0,
                    ToPort = 0,
                    CidrBlocks = {"0.0.0.0/0"}
                }
            },
            Ingress =
            {
                new Pulumi.Aws.Ec2.Inputs.SecurityGroupIngressArgs
                {
                    Protocol = "tcp",
                    FromPort = 80,
                    ToPort = 80,
                    CidrBlocks = {"0.0.0.0/0"}
                }
            }
        });

        // Create a load balancer to listen for HTTP traffic on port 80.
        var webLb = new Pulumi.Aws.LB.LoadBalancer("web-lb", new Pulumi.Aws.LB.LoadBalancerArgs
        {
            Subnets = subnetIds,
            SecurityGroups = { webSg.Id }
        });
        var webTg = new Pulumi.Aws.LB.TargetGroup("web-tg", new Pulumi.Aws.LB.TargetGroupArgs
        {
            Port = 80,
            Protocol = "HTTP",
            TargetType = "ip",
            VpcId = vpcId
        });
        var webListener = new Pulumi.Aws.LB.Listener("web-listener", new Pulumi.Aws.LB.ListenerArgs
        {
            LoadBalancerArn = webLb.Arn,
            Port = 80,
            DefaultActions =
            {
                new Pulumi.Aws.LB.Inputs.ListenerDefaultActionsArgs
                {
                    Type = "forward",
                    TargetGroupArn = webTg.Arn,
                }
            }
        });

        // Create an IAM role that can be used by our service's task.
        var taskExecRole = new Pulumi.Aws.Iam.Role("task-exec-role", new Pulumi.Aws.Iam.RoleArgs
        {
            AssumeRolePolicy = @"{
""Version"": ""2008-10-17"",
""Statement"": [{
    ""Sid"": """",
    ""Effect"": ""Allow"",
    ""Principal"": {
        ""Service"": ""ecs-tasks.amazonaws.com""
    },
    ""Action"": ""sts:AssumeRole""
}]
}"
        });
        var taskExecAttach = new Pulumi.Aws.Iam.RolePolicyAttachment("task-exec-policy", new Pulumi.Aws.Iam.RolePolicyAttachmentArgs
        {
            Role = taskExecRole.Name,
            PolicyArn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
        });

        // Spin up a load balanced service running our container image.
        var appTask = new Pulumi.Aws.Ecs.TaskDefinition("app-task", new Pulumi.Aws.Ecs.TaskDefinitionArgs
        {
            Family = "fargate-task-definition",
            Cpu = "256",
            Memory = "512",
            NetworkMode = "awsvpc",
            RequiresCompatibilities = { "FARGATE" },
            ExecutionRoleArn = taskExecRole.Arn,
            ContainerDefinitions = @"[{
""name"": ""my-app"",
""image"": ""nginx"",
""portMappings"": [{
    ""containerPort"": 80,
    ""hostPort"": 80,
    ""protocol"": ""tcp""
}]
}]",
        });
        var appSvc = new Pulumi.Aws.Ecs.Service("app-svc", new Pulumi.Aws.Ecs.ServiceArgs
        {
            Cluster = cluster.Arn,
            DesiredCount = 1,
            LaunchType = "FARGATE",
            TaskDefinition = appTask.Arn,
            NetworkConfiguration = new Pulumi.Aws.Ecs.Inputs.ServiceNetworkConfigurationArgs
            {
                AssignPublicIp = true,
                Subnets = subnetIds,
                SecurityGroups = { webSg.Id }
            },
            LoadBalancers =
            {
                new Pulumi.Aws.Ecs.Inputs.ServiceLoadBalancerArgs
                {
                    TargetGroupArn = webTg.Arn,
                    ContainerName = "my-app",
                    ContainerPort = 80
                }
            }
        }, new CustomResourceOptions { DependsOn = { webListener } });

        // Export the resulting web address.
        this.Url = Output.Format($"http://{webLb.DnsName}");
    }

    [Output] public Output<string> Url { get; set; }
}
