# Deploying Containers to Elastic Container Service (ECS)

In this lab, you will deploy a containerized application to an AWS ECS cluster.

## Step 1 &mdash; Create an ECS Cluster

Import the AWS and Pulumi packages in an empty `__main__.py` file:

```python
from pulumi import export
import pulumi_aws as aws
```

And now create a new ECS cluster. You will use the default values, so doing so is very concise:

```python
...
cluster = aws.ecs.Cluster("cluster")
```

> :white_check_mark: After these changes, your `__main__.py` should [look like this](./code/step1.py).

## Step 2 &mdash; Create a Load-Balanced Container Service

Next, allocate the application load balancer (ALB) and listen for HTTP traffic port 80. In order to do this, we need to find the
default VPC and the subnet groups for it:

```python
...
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
        { 'protocol': 'tcp', 'from_port': 80, 'to_port': 80, 'cidr_blocks': ['0.0.0.0/0'] }
    ])

alb = aws.lb.LoadBalancer("app-lb",
    internal="false",
    security_groups=[group.id],
    subnets=default_vpc_subnets.ids,
    load_balancer_type="application",
)

atg = aws.lb.TargetGroup("app-tg",
    port=80,
    deregistration_delay=0,
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
```

> :white_check_mark: After these changes, your `__main__.py` should [look like this](./code/step2.py).

## Step 3 &mdash; Create ECS FargateService

In order to create a Fargate service, we need to add an IAM Role and a Task Definition and Service. the ECS Cluster will run
the `"nginx"` image from the Docker Hub.

Firstly, we need to add a new import at the top of our file

```python
import json
```

```python
...
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
    }))

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
    __opts__=ResourceOptions(depends_on=[wl])
)

export("url", alb.dns_name)
```

> :white_check_mark: After these changes, your `__main__.py` should [look like this](./code/step3.py).

## Step 4 &mdash; Provision the Cluster and Service

Deploy the program to stand up your initial cluster and service:

```bash
pulumi up
```

This will output the status and resulting load balancer URL:

```
Updating (dev):

     Type                             Name                Status
 +   pulumi:pulumi:Stack              python-testing-dev  created
 +   ├─ aws:ecs:Cluster               cluster             created
 +   ├─ aws:ec2:SecurityGroup         web-secgrp          created
 +   ├─ aws:iam:Role                  task-exec-role      created
 +   ├─ aws:lb:TargetGroup            app-tg              created
 +   ├─ aws:ecs:TaskDefinition        app-task            created
 +   ├─ aws:iam:RolePolicyAttachment  task-exec-policy    created
 +   ├─ aws:lb:LoadBalancer           app-lb              created
 +   ├─ aws:lb:Listener               web                 created
 +   └─ aws:ecs:Service               app-svc             created

Outputs:
    url: "app-lb-b8fc703-1737790569.us-west-2.elb.amazonaws.com"

Resources:
    + 10 created

Duration: 2m50s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/dev/updates/1
```

You can now curl the resulting endpoint:

```bash
curl $(pulumi stack output url)
```

And you'll see the Nginx default homepage:

```
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...
```

## Step 5 &mdash; Update the Service

Now, also update the desired container count from `1` to `3`:

```
...
    desiredCount: 3,
...
```

> :white_check_mark: After this change, your `__main__.py` should [look like this](./code/step5.py).

Next update the stack:

```bash
pulumi up
```

The output should look something like this:

```
Updating (dev):

     Type                 Name                Status      Info
     pulumi:pulumi:Stack  python-testing-dev
 ~   └─ aws:ecs:Service   app-svc             updated     [diff: ~desiredCount]

Outputs:
    url: "app-lb-b8fc703-1737790569.us-west-2.elb.amazonaws.com"

Resources:
    ~ 1 updated
    9 unchanged

Duration: 14s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/dev/updates/2
```

## Step 6 &mdash; Destroy Everything

Finally, destroy the resources and the stack itself:

```
pulumi destroy
pulumi stack rm
```
