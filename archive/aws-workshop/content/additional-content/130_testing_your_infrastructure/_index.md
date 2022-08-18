+++
title = "Testing Your Infrastructure"
chapter = true
weight = 130
+++

# Testing Your Infrastructure Deployments

{{% notice warning %}}<p> You are responsible for the cost of the AWS services used while running this workshop in your AWS account.</p> {{% /notice %}}

This lab will walk you through an example of `property testing`, using Pulumi.

We are going to build a sample Pulumi program provisions an Amazon EKS cluster. The test ensures two properties of the EKS cluster:

Running Kubernetes version 1.16.
Provisioned inside a private VPC, rather than the default one.

{{% children showhidden="false" %}}
