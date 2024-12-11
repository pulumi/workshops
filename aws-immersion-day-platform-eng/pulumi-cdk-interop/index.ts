import * as pulumi from "@pulumi/pulumi";
import * as pulumi_aws from '@pulumi/aws';
import * as pulumicdk from '@pulumi/cdk';
import * as cdk_ec2 from 'aws-cdk-lib/aws-ec2';

const app = new pulumicdk.App('app', (scope: pulumicdk.App) => {
    
    const stack = new pulumicdk.Stack(scope, 'vpc-stack');

    //// CDK Construct AWS Resources ////

    const vpc = new cdk_ec2.Vpc(stack, 'MainVPC', {
        maxAzs: 2,
        natGateways: 1,
    });

    const securityGroup = new cdk_ec2.SecurityGroup(stack, 'WebServerSG', {
        vpc,
        description: 'Allow HTTP access to cdk_ec2 instances',
        allowAllOutbound: true,
    });

    securityGroup.addIngressRule(
        cdk_ec2.Peer.anyIpv4(),
        cdk_ec2.Port.tcp(80),
        'Allow HTTP access from anywhere'
    );

    //// Pulumi Package AWS Resources ////

    const ami = pulumi_aws.ec2.getAmiOutput({
        filters: [{ name: "name", values: ["amzn2-ami-hvm-*"] }],
        owners: ["amazon"],
        mostRecent: true,
    });

    const instance = new pulumi_aws.ec2.Instance("webserver-www", {
        instanceType: "t2.micro",
        ami: ami.id,
        subnetId: stack.asOutput(vpc.publicSubnets[0].subnetId),
        vpcSecurityGroupIds: [stack.asOutput(securityGroup.securityGroupId)],
    }, { parent: scope });

    return {
        publicIp: instance.publicIp,
    };
})

export const publicIp = pulumi.interpolate`http://${app.outputs['publicIp']}`