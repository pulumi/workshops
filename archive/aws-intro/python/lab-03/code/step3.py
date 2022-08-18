from pulumi import export, ResourceOptions
import pulumi_aws as aws
import json

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
    security_groups=[group.id],
    subnets=default_vpc_subnets.ids,
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

role = aws.iam.Role("task-exec-role",
    assume_role_policy=json.dumps({
        "Version": "2008-10-17",
        "Statement": [{
            "Sid": "",
            "Effect": "Allow",
            "Principal": {
                "Service": "ecs-tasks.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }]
    })
)

rpa = aws.iam.RolePolicyAttachment("task-exec-policy",
    role=role.name,
    policy_arn="arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
)

task_definition = aws.ecs.TaskDefinition("app-task",
    family="fargate-task-definition",
    cpu="256",
    memory="512",
    network_mode="awsvpc",
    requires_compatibilities=["FARGATE"],
    execution_role_arn=role.arn,
    container_definitions=json.dumps([{
        "name": "my-app",
        "image": "nginx",
        "portMappings": [{
            "containerPort": 80,
            "hostPort": 80,
            "protocol": "tcp"
        }]
    }])
)

service = aws.ecs.Service("app-svc",
    cluster=cluster.arn,
    desired_count=1,
    launch_type="FARGATE",
    task_definition=task_definition.arn,
    network_configuration={
        "assign_public_ip": "true",
        "subnets": default_vpc_subnets.ids,
        "security_groups": [group.id]
    },
    load_balancers=[{
        "target_group_arn": atg.arn,
        "container_name": "my-app",
        "container_port": 80
    }],
    opts=ResourceOptions(depends_on=[wl])
)

export("url", alb.dns_name)
