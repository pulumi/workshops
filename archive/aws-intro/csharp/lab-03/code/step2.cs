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
                new Pulumi.Aws.LB.Inputs.ListenerDefaultActionArgs
                {
                    Type = "forward",
                    TargetGroupArn = webTg.Arn,
                }
            }
        });
    }
}
