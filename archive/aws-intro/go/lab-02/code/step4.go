package main

import (
	"fmt"

	"github.com/pulumi/pulumi-aws/sdk/go/aws"
	"github.com/pulumi/pulumi-aws/sdk/go/aws/ec2"
	"github.com/pulumi/pulumi-aws/sdk/go/aws/lb"
	"github.com/pulumi/pulumi/sdk/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		t := true
		vpc, err := ec2.LookupVpc(ctx, &ec2.LookupVpcArgs{Default: &t})
		if err != nil {
			return err
		}
		subnet, err := ec2.GetSubnetIds(ctx, &ec2.GetSubnetIdsArgs{VpcId: vpc.Id})
		if err != nil {
			return err
		}

		mostRecent := true
		ami, err := aws.GetAmi(ctx, &aws.GetAmiArgs{
			Filters: []aws.GetAmiFilter{
				{
					Name:   "name",
					Values: []string{"amzn-ami-hvm-*-x86_64-ebs"},
				},
			},
			Owners:     []string{"137112412989"},
			MostRecent: &mostRecent,
		})
		if err != nil {
			return err
		}

		group, err := ec2.NewSecurityGroup(ctx, "web-secgrp", &ec2.SecurityGroupArgs{
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
				ec2.SecurityGroupIngressArgs{
					Protocol:   pulumi.String("icmp"),
					FromPort:   pulumi.Int(8),
					ToPort:     pulumi.Int(80),
					CidrBlocks: pulumi.StringArray{pulumi.String("0.0.0.0/0")},
				},
			},
		})
		if err != nil {
			return err
		}

		loadBalancer, err := lb.NewLoadBalancer(ctx, "external-loadbalancer", &lb.LoadBalancerArgs{
			Internal:         pulumi.Bool(false),
			SecurityGroups:   pulumi.StringArray{group.ID().ToStringOutput()},
			Subnets:          toPulumiStringArray(subnet.Ids),
			LoadBalancerType: pulumi.String("application"),
		})
		if err != nil {
			return err
		}

		targetGroup, err := lb.NewTargetGroup(ctx, "target-group", &lb.TargetGroupArgs{
			Port:       pulumi.Int(80),
			Protocol:   pulumi.String("HTTP"),
			TargetType: pulumi.String("ip"),
			VpcId:      pulumi.String(vpc.Id),
		})
		if err != nil {
			return err
		}

		_, err = lb.NewListener(ctx, "listener", &lb.ListenerArgs{
			LoadBalancerArn: loadBalancer.Arn,
			Port:            pulumi.Int(80),
			DefaultActions: lb.ListenerDefaultActionArray{
				lb.ListenerDefaultActionArgs{
					Type:           pulumi.String("forward"),
					TargetGroupArn: targetGroup.Arn,
				},
			},
		})
		if err != nil {
			return err
		}

		azs, err := aws.GetAvailabilityZones(ctx, nil)
		if err != nil {
			return err
		}

		for _, az := range azs.Names {
			srv, err := ec2.NewInstance(ctx, fmt.Sprintf("web-server-%s", az), &ec2.InstanceArgs{
				Tags:                pulumi.Map{"Name": pulumi.String("web-server-www")},
				InstanceType:        pulumi.String("t2.micro"), // t2.micro is available in the AWS free tier.
				VpcSecurityGroupIds: pulumi.StringArray{group.ID()},
				Ami:                 pulumi.String(ami.Id),
				AvailabilityZone:    pulumi.String(az),
				UserData: pulumi.String(fmt.Sprintf(`#!/bin/bash
echo "Hello, World -- from %s!" > index.html
nohup python -m SimpleHTTPServer 80 &`, az)),
			})
			if err != nil {
				return err
			}

			_, err = lb.NewTargetGroupAttachment(ctx, fmt.Sprintf("web-server-%s", az), &lb.TargetGroupAttachmentArgs{
				Port:           pulumi.Int(80),
				TargetGroupArn: targetGroup.Arn,
				TargetId:       srv.PrivateIp,
			})
		}

		ctx.Export("url", loadBalancer.DnsName)
		return nil
	})
}

func toPulumiStringArray(a []string) pulumi.StringArrayInput {
	var res []pulumi.StringInput
	for _, s := range a {
		res = append(res, pulumi.String(s))
	}
	return pulumi.StringArray(res)
}
