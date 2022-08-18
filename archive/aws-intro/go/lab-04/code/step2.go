package main

import (
	"fmt"

	"github.com/pulumi/pulumi-aws/sdk/go/aws/iam"
	"github.com/pulumi/pulumi/sdk/go/pulumi"
)

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

		return nil
	})
}
