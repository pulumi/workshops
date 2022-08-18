from pulumi import export
import pulumi_aws as aws

cluster = aws.ecs.Cluster("cluster")

default_vpc = aws.ec2.get_vpc(default="true")
default_vpc_subnets = aws.ec2.get_subnet_ids(vpc_id=default_vpc.id)

group = aws.ec2.SecurityGroup(
    "web-secgrp",
    vpc_id=default_vpc.id,
    description='Enable HTTP access',
    ingress=[
        { 'protocol': 'icmp', 'from_port': 8, 'to_port': 0, 'cidr_blocks': ['0.0.0.0/0'] },
        { 'protocol': 'tcp', 'from_port': 80, 'to_port': 80, 'cidr_blocks': ['0.0.0.0/0'] }
    ],
    egress=[
        { 'protocol': "-1", 'from_port': 0, 'to_port': 0, 'cidr_blocks': ['0.0.0.0/0'] }
    ])

alb = aws.lb.LoadBalancer("app-lb",
  internal="false",
  security_groups=[group.id],
  subnets=default_vpc_subnets.ids,
  load_balancer_type="application",
)

atg = aws.lb.TargetGroup("app-tg",
  port=80,
  protocol="HTTP",
  target_type="ip",
  vpc_id=default_vpc.id
)

wl = aws.lb.Listener("web",
  load_balancer_arn=alb.arn,
  port=80,
  default_actions=[{
      "type": "forward",
      "target_group_arn": atg.arn
  }]
)
