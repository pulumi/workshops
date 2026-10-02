import pulumi
import pulumi_aws as aws
import pulumi_awsx as awsx

config = pulumi.Config()
base_name = config.get("base_name") or f"{pulumi.get_organization()}-{pulumi.get_stack()}".lower()

vpc = awsx.ec2.Vpc(base_name)

ami = aws.ec2.get_ami(most_recent=True,
                  owners=["137112412989"],
                  filters=[aws.ec2.GetAmiFilterArgs(name="name", values=["amzn2-ami-hvm-*"])])

group = aws.ec2.SecurityGroup('web-secgrp',
    description='Enable HTTP access',
    vpc_id=vpc.vpc_id,
    ingress=[aws.ec2.SecurityGroupIngressArgs(
        protocol='tcp',
        from_port=80,
        to_port=80,
        cidr_blocks=['0.0.0.0/0'],
    )])

user_data = """
#!/bin/bash
echo "Hello, World!" > index.html
nohup python -m SimpleHTTPServer 80 &
"""

server_name = f"{base_name}-web-server"
server = aws.ec2.Instance(server_name,
    subnet_id=vpc.public_subnet_ids[0],
    tags={"Name":server_name},
    instance_type=aws.ec2.InstanceType.T3_MICRO,
    vpc_security_group_ids=[group.id],
    user_data=user_data,
    associate_public_ip_address=True,
    ami=ami.id)

pulumi.export('url', pulumi.Output.concat("http://",server.public_ip))
