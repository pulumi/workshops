using System.Collections.Generic;
using Pulumi;

class MyStack : Stack
{
    public MyStack()
    {
        var vpc = Output.Create(Pulumi.Aws.Ec2.GetVpc.InvokeAsync(new Pulumi.Aws.Ec2.GetVpcArgs {Default = true}));
        var vpcId = vpc.Apply(vpc => vpc.Id);
        var subnet = vpcId.Apply(id => Pulumi.Aws.Ec2.GetSubnetIds.InvokeAsync(new Pulumi.Aws.Ec2.GetSubnetIdsArgs {VpcId = id}));
        var subnetIds = subnet.Apply(s => s.Ids);

        var ami = Output.Create(Pulumi.Aws.GetAmi.InvokeAsync(new Pulumi.Aws.GetAmiArgs
        {
            MostRecent = true,
            Owners = {"137112412989"},
            Filters = {new Pulumi.Aws.Inputs.GetAmiFiltersArgs
            {
                Name = "name", Values = {"amzn-ami-hvm-*"}
            }}
        }));

        var group = new Pulumi.Aws.Ec2.SecurityGroup("web-secgrp", new Pulumi.Aws.Ec2.SecurityGroupArgs
        {
            Description = "Enable HTTP access",
            Egress =
            {
                new Pulumi.Aws.Ec2.Inputs.SecurityGroupEgressArgs
                {
                    Protocol = "-1",
                    FromPort = 0,
                    ToPort = 0,
                    CidrBlocks = {"0.0.0.0/0"}
                },
            },
            Ingress =
            {
                new Pulumi.Aws.Ec2.Inputs.SecurityGroupIngressArgs
                {
                    Protocol = "tcp",
                    FromPort = 80,
                    ToPort = 80,
                    CidrBlocks = {"0.0.0.0/0"}
                },
                new Pulumi.Aws.Ec2.Inputs.SecurityGroupIngressArgs
                {
                    Protocol = "icmp",
                    FromPort = 8,
                    ToPort = 80,
                    CidrBlocks = {"0.0.0.0/0"}
                }
            }
        });

        var loadbalancer = new Pulumi.Aws.LB.LoadBalancer("external-loadbalancer", new Pulumi.Aws.LB.LoadBalancerArgs
        {
            Internal = false,
            SecurityGroups =
            {
                group.Id
            },
            Subnets = subnetIds,
            LoadBalancerType = "application",
        });
        this.Url = loadbalancer.DnsName;

        var targetGroup = new Pulumi.Aws.LB.TargetGroup("target-group", new Pulumi.Aws.LB.TargetGroupArgs
        {
            Port = 80,
            Protocol = "HTTP",
            TargetType = "ip",
            VpcId = vpcId,
        });

        var listener = new Pulumi.Aws.LB.Listener("listener", new Pulumi.Aws.LB.ListenerArgs
        {
            LoadBalancerArn = loadbalancer.Arn,
            Port = 80,
            DefaultActions =
            {
                new Pulumi.Aws.LB.Inputs.ListenerDefaultActionsArgs
                {
                    Type = "forward",
                    TargetGroupArn = targetGroup.Arn,
                }
            }
        });

        var userData = @"
#!/bin/bash
echo ""Hello, World!"" > index.html
nohup python -m SimpleHTTPServer 80 &
";

        var azs = Pulumi.Aws.GetAvailabilityZones.InvokeAsync(new Pulumi.Aws.GetAvailabilityZonesArgs()).Result;
        foreach (var az in azs.Names)
        {
            var server = new Pulumi.Aws.Ec2.Instance($"web-server-{az}", new Pulumi.Aws.Ec2.InstanceArgs
            {
                InstanceType = "t2.micro",
                VpcSecurityGroupIds = {group.Id},
                UserData = userData,
                Ami = ami.Apply(a => a.Id),
                AvailabilityZone = az,
            });

            var attachment = new Pulumi.Aws.LB.TargetGroupAttachment($"web-server-{az}", new Pulumi.Aws.LB.TargetGroupAttachmentArgs
            {
                Port = 80,
                TargetGroupArn = targetGroup.Arn,
                TargetId = server.PrivateIp,
            });
        }
    }

    [Output] public Output<string> Url { get; set; }
}
