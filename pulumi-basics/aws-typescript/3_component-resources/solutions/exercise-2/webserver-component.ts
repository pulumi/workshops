import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { ComponentResource, ComponentResourceOptions, Input, Output } from "@pulumi/pulumi";

export interface WebserverArgs {
    vpcId: Input<string>;
    subnetId: Input<string>;
    size: string;
    message: string;
};

export class Webserver extends ComponentResource {
    public readonly serverIp: Output<string>;

    // Must have a constructor that defines the parameters and namespace - "custom:x:Webserver" in this case.
    constructor(name: string, args: WebserverArgs, opts?: ComponentResourceOptions) {
        super("custom:x:Webserver", name, args, opts);

        /////
        // Declare the children resources (i.e. security group, instance) be sure to include a resource option of "parent:this".
        /////

        // Create an EC2 instance running a simple web server.
        // Get the id for the latest Amazon Linux AMI
        const ami = aws.ec2.getAmi({
            filters: [
                { name: "name", values: ["amzn-ami-hvm-*-x86_64-ebs"] },
            ],
            owners: ["137112412989"], // Amazon
            mostRecent: true,
        }).then(result => result.id);
        
        // create a new security group for port 80
        const group = new aws.ec2.SecurityGroup(`${name}-secgrp`, {
            vpcId: args.vpcId,
            ingress: [
                { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
            ],
        }, {parent: this,
            aliases: [{ parent: pulumi.rootStackResource }]
        });
        
        // create a simple web server using the startup script for the instance
        const userData =
        `#!/bin/bash
        echo "${args.message}" > index.html
        nohup python -m SimpleHTTPServer 80 &`;
        
        let instanceType: aws.ec2.InstanceType = aws.ec2.InstanceType.T3_Micro;
        if (args.size === "large") {
            instanceType = aws.ec2.InstanceType.T3_Medium;
        } else if (args.size === "medium") {
            instanceType = aws.ec2.InstanceType.T3_Small
        }
        
        const serverName = `${name}-web-server`;
        const server = new aws.ec2.Instance(serverName, {
            subnetId: args.subnetId,
            tags: { "Name": serverName },
            instanceType: instanceType,
            vpcSecurityGroupIds: [ group.id ], // reference the group object above
            ami: ami,
            userData: userData,              // start a simple web server
            associatePublicIpAddress: true,
        }, {parent: this,
            aliases: [{ parent: pulumi.rootStackResource }]
        });

        this.serverIp = server.publicIp;

        // End with this. It is used for display purposes.
        this.registerOutputs();
    };
};
