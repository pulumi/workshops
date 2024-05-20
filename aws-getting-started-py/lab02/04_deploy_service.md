# 3.4 Deploy a Fargate Service

To create a Fargate service, we need to add an IAM Role and a Task Definition and Service. the ECS Cluster will run
the [`nginx` image](https://hub.docker.com/_/nginx) from Docker Hub.

## Step 1 &mdash; Create an ECS Task Execution Role

First, we need to add a new import at the top of our file. We'll use this when defining our ECS task's [execution role](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_execution_IAM_role.html).

Add the following to the top of your `__main__.py` file, near the other imports:

```python
import json
```

Now let's define our IAM execution role and attach a policy. Add the following to your `__main.py__`:

```python
role = aws.iam.Role(
    "task-exec-role",
    assume_role_policy=json.dumps({
        "Version": "2008-10-17",
        "Statement": [{
            "Sid": "",
            "Effect": "Allow",
            "Principal": {
                "Service": "ecs-tasks.amazonaws.com"
            },
            "Action": "sts:AssumeRole",
        }]
    }),
)

aws.iam.RolePolicyAttachment(
    "task-exec-policy",
    role=role.name,
    policy_arn="arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
)
```

## Step 2 &mdash; Create an ECS Task Definition

Now we define a task definition for our ECS service and add the DNS name of the ALB we defined earlier so we can get the public URL for our service.

Add the following to your `__main__.py`:

```python
task_definition = aws.ecs.TaskDefinition(
    "app-task",
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

service = aws.ecs.Service(
    "app-svc",
    cluster=cluster.arn,
    desired_count=1,
    launch_type="FARGATE",
    task_definition=task_definition.arn,
    network_configuration={
        "assign_public_ip": "true",
        "subnets": vpc.private_subnet_ids,
        "security_groups": [group.id]
    },
    load_balancers=[{
        "target_group_arn": target_group.arn,
        "container_name": "my-app",
        "container_port": 80
    }],
    opts=pulumi.ResourceOptions(depends_on=[listener])
)

pulumi.export("url", pulumi.Output.concat(
    "http://", alb.dns_name))
```

<details>
<summary> ✅ Code check </summary>
After these changes, your `__main__.py` should look like this

```python
import pulumi as pulumi
import pulumi_aws as aws
import pulumi_awsx as awsx

import json

cluster = aws.ecs.Cluster("cluster")

vpc = awsx.ec2.Vpc("my-vpc")

group = aws.ec2.SecurityGroup(
    "web-secgrp",
    vpc_id=vpc.vpc_id,
    description="Enable HTTP access",
    ingress=[aws.ec2.SecurityGroupIngressArgs(
        protocol="tcp",
        from_port=80,
        to_port=80,
        cidr_blocks=["0.0.0.0/0"],
    )],
    egress=[aws.ec2.SecurityGroupEgressArgs(
        protocol="-1",
        from_port=0,
        to_port=0,
        cidr_blocks=["0.0.0.0/0"],
    )],
)

alb = aws.lb.LoadBalancer(
    "app-lb",
    security_groups=[group.id],
    subnets=vpc.public_subnet_ids,
)

target_group = aws.lb.TargetGroup(
    "app-tg",
    port=80,
    protocol="HTTP",
    target_type="ip",
    vpc_id=vpc.vpc_id,
)

listener = aws.lb.Listener(
    "web",
    load_balancer_arn=alb.arn,
    port=80,
    default_actions=[aws.lb.ListenerDefaultActionArgs(
        type="forward",
        target_group_arn=target_group.arn,
    )],
)

role = aws.iam.Role(
    "task-exec-role",
    assume_role_policy=json.dumps({
        "Version": "2008-10-17",
        "Statement": [{
            "Sid": "",
            "Effect": "Allow",
            "Principal": {
                "Service": "ecs-tasks.amazonaws.com"
            },
            "Action": "sts:AssumeRole",
        }]
    }),
)

aws.iam.RolePolicyAttachment(
    "task-exec-policy",
    role=role.name,
    policy_arn="arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
)

# Spin up a load balanced service running our container image.
task_definition = aws.ecs.TaskDefinition(
    "app-task",
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

aws.ecs.Service(
    "app-svc",
    cluster=cluster.arn,
    desired_count=1,
    launch_type="FARGATE",
    task_definition=task_definition.arn,
    network_configuration=aws.ecs.ServiceNetworkConfigurationArgs(
        assign_public_ip=True,
        subnets=vpc.private_subnet_ids,
        security_groups=[group.id],
    ),
    load_balancers=[aws.ecs.ServiceLoadBalancerArgs(
        target_group_arn=target_group.arn,
        container_name="my-app",
        container_port=80,
    )],
    opts=pulumi.ResourceOptions(
        depends_on=[listener]
    ),
)

pulumi.export("url", pulumi.Output.concat(
    "http://", alb.dns_name))
```

</details>

## Step 3 &mdash; Provision the Cluster and Service

Deploy the program to stand up your initial cluster and service:

```bash
pulumi up
```

You can now curl the resulting endpoint:

```bash
curl $(pulumi stack output url)
```

And you'll see the Nginx default homepage:

```html
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...
```

## Step 4 &mdash; Update the Service

Update the desired container count from `1` to `3`:

```python
...
    desiredCount: 3,
...
```

<details>
<summary> ✅ Code check </summary>
After this change, your `__main__.py` should look like this:

```python
# TODO
```

</details>

Next update the stack:

```bash
pulumi up
```

After the command completes, you should be able to view the NGINX default index page by running the following command:

```bash
curl $(pulumi stack output url)
```

## Step 4 &mdash; Cleaning Up

Now that we're done we can destroy the resources we created and the stack itself:

```bash
pulumi destroy
pulumi stack rm dev
```
