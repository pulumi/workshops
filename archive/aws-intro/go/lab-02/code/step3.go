package main

import (
	"fmt"

	"github.com/pulumi/pulumi-aws/sdk/go/aws"
	"github.com/pulumi/pulumi-aws/sdk/go/aws/ec2"
	"github.com/pulumi/pulumi/sdk/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
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

		azs, err := aws.GetAvailabilityZones(ctx, nil)
		if err != nil {
			return err
		}

		var ips pulumi.StringArray
		var hostnames pulumi.StringArray
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

			ips = append(ips, srv.PublicIp)
			hostnames = append(hostnames, srv.PublicDns)
		}

		ctx.Export("ips", ips)
		ctx.Export("hostnames", hostnames)
		return nil
	})
}
