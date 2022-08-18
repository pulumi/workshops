from pulumi import export
import pulumi_aws as aws

ami = aws.ec2.get_ami(
    most_recent="true",
    owners=["137112412989"],
    filters=[{"name":"name","values":["amzn-ami-hvm-*-x86_64-ebs"]}])

group = aws.ec2.SecurityGroup(
    "web-secgrp",
    description='Enable HTTP access',
    ingress=[
        { 'protocol': 'icmp', 'from_port': 8, 'to_port': 0, 'cidr_blocks': ['0.0.0.0/0'] },
        { 'protocol': 'tcp', 'from_port': 80, 'to_port': 80, 'cidr_blocks': ['0.0.0.0/0'] },
    ],
    egress=[
        { 'protocol': 'tcp', 'from_port': 80, 'to_port': 80, 'cidr_blocks': ['0.0.0.0/0'] },
    ]
)

default_vpc = aws.ec2.get_vpc(default="true")
default_vpc_subnets = aws.ec2.get_subnet_ids(vpc_id=default_vpc.id)

lb = aws.lb.LoadBalancer("external-loadbalancer",
    internal="false",
    security_groups=[group.id],
    subnets=default_vpc_subnets.ids,
    load_balancer_type="application",
)

target_group = aws.lb.TargetGroup("target-group",
    port=80,
    protocol="HTTP",
    target_type="ip",
    vpc_id=default_vpc.id
)

listener = aws.lb.Listener("listener",
   load_balancer_arn=lb.arn,
   port=80,
   default_actions=[{
       "type": "forward",
       "target_group_arn": target_group.arn
   }]
)

ips = []
hostnames = []
for az in aws.get_availability_zones().names:
    server = aws.ec2.Instance(f'web-server-{az}',
      instance_type="t2.micro",
      vpc_security_group_ids=[group.id],
      ami=ami.id,
      user_data="""#!/bin/bash
echo \"Hello, World -- from {}!\" > index.html
nohup python -m SimpleHTTPServer 80 &
""".format(az),
      availability_zone=az,
      tags={
          "Name": "web-server",
      },
    )
    ips.append(server.public_ip)
    hostnames.append(server.public_dns)

    attachment = aws.lb.TargetGroupAttachment(f'web-server-{az}',
        target_group_arn=target_group.arn,
        target_id=server.private_ip,
        port=80,
    )

export('ips', ips)
export('hostnames', hostnames)
export("url", lb.dns_name)


