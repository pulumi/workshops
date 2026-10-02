# A component resource module shell 
# See comments below for help

import pulumi_aws as aws

from pulumi import Alias, ComponentResource, ResourceOptions, Input, ROOT_STACK_RESOURCE 


class WebserverArgs:
    def __init__(self,
                vpc_id: Input[str],
                subnet_id: Input[str],
                size: str,
                message: str
                ):

        # Set the class args
        self.vpc_id = vpc_id
        self.subnet_id = subnet_id
        self.size = size
        self.message = message


class Webserver(ComponentResource):
    def __init__(self,
                 name: str,
                 args: WebserverArgs,
                 opts: ResourceOptions = None):

        # Leave this line. You can modify 'custom:resource:Webserver' if you want
        super().__init__('custom:resource:Webserver', name, {}, opts)

        if args.size == "medium":
            instance_type = aws.ec2.InstanceType.T3_MEDIUM
        elif args.size == "large":
            instance_type = aws.ec2.InstanceType.T3_LARGE
        else:
            instance_type = aws.ec2.InstanceType.T3_MICRO 

        ami = aws.ec2.get_ami(most_recent=True,
                  owners=["137112412989"],
                  filters=[aws.ec2.GetAmiFilterArgs(name="name", values=["amzn2-ami-hvm-*"])])

        group = aws.ec2.SecurityGroup('web-secgrp',
            description='Enable HTTP access',
            vpc_id=args.vpc_id,
            ingress=[aws.ec2.SecurityGroupIngressArgs(
                protocol='tcp',
                from_port=80,
                to_port=80,
                cidr_blocks=['0.0.0.0/0'],
            )],
            opts=ResourceOptions(
                parent=self,
                aliases=[Alias(parent=ROOT_STACK_RESOURCE)]
            ))

        user_data = f"""
        #!/bin/bash
        echo "{args.message}" > index.html
        nohup python -m SimpleHTTPServer 80 &
        """

        server_name = f"{name}-web-server"
        server = aws.ec2.Instance(server_name,
            subnet_id=args.subnet_id,
            tags={"Name":server_name},
            instance_type=instance_type,
            vpc_security_group_ids=[group.id],
            user_data=user_data,
            associate_public_ip_address=True,
            ami=ami.id,
            opts=ResourceOptions(
                parent=self,
                aliases=[Alias(parent=ROOT_STACK_RESOURCE)]
            ))

        self.server_ip = server.public_ip
        # End with this. It is used for display purposes.
        self.register_outputs({})
