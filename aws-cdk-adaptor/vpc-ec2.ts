import * as pulumi from "@pulumi/pulumi";
import * as aws from '@pulumi/aws';
import * as pulumicdk from '@pulumi/cdk';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

const app = new pulumicdk.App('app', (scope: pulumicdk.App) => {
    
    //// CDK Adaptor Resources ////
    
    const stack = new pulumicdk.Stack(scope, 'vpc-stack');

    const vpc = new ec2.Vpc(stack, 'MainVPC', {
        maxAzs: 2,
        natGateways: 1,
    });

    const securityGroup = new ec2.SecurityGroup(stack, 'WebServerSG', {
        vpc,
        description: 'Allow HTTP access to EC2 instances',
        allowAllOutbound: true,
    });

    securityGroup.addIngressRule(
        ec2.Peer.anyIpv4(),
        ec2.Port.tcp(80),
        'Allow HTTP access from anywhere'
    );

    //// Pulumi-Created Resources ////

    const userData = `
    #!/bin/bash
    sudo yum update -y
    sudo yum upgrade -y
    sudo amazon-linux-extras install nginx1 -y
    sudo systemctl enable nginx
    sudo systemctl start nginx`;

    const ami = aws.ec2.getAmiOutput({
        filters: [{ name: "name", values: ["amzn2-ami-hvm-*"] }],
        owners: ["amazon"],
        mostRecent: true,
    });

    const instance = new aws.ec2.Instance("webserver-www", {
        instanceType: "t2.micro",
        ami: ami.id,
        userData: userData,
        subnetId: stack.asOutput(vpc.publicSubnets[0].subnetId),
        vpcSecurityGroupIds: [stack.asOutput(securityGroup.securityGroupId)],
    }, { parent: scope });

    return {
        publicIp: instance.publicIp,
    };
})

export const publicIp = pulumi.interpolate`http://${app.outputs['publicIp']}`
