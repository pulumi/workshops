# 2.3 Create a VPC, ECS Cluster, & Load Balancer

## Step 1 &mdash; Create a VPC

First, we'll create a VPC to host our ECS cluster. We'll use the AWSx provider to do this. The AWSx provider contains higher-level constructs called [component resources](https://www.pulumi.com/docs/intro/concepts/resources/components/) that allow us to create production-ready infrastructure without needing to declare every individual resource.

Add the following to your `__main__.py`:

```python
vpc = awsx.ec2.Vpc("my-vpc")
```

<details>
<summary> ✅ Code check </summary>
After this change, your `__main__.py` should look like this:

```python
import pulumi as pulumi
import pulumi_aws as aws
import pulumi_awsx as awsx

vpc = awsx.ec2.Vpc("my-vpc")
```

</details>

To see how Pulumi components help us ship infrastructure faster with fewer lines of code, run `pulumi preview` to see all the resources that will be created. Notice how, with a single line of code and the default options, we have a complete, functional VPC, deployed across 3 AZs, with public and private subnets. To explore the options available in the VPC component, as well as the other components available in AWSx, see the [AWSx API docs](https://www.pulumi.com/registry/packages/awsx/api-docs/) in the Pulumi Registry.

## Step 2 &mdash; Create an ECS Cluster

Now we will add the ECS cluster itself.

Add the following to your `__main__.py`:

```python
cluster = aws.ecs.Cluster("cluster")
```

<details>
<summary> ✅ Code check </summary>
After this change, your `__main__.py` should look like this:

```python
import pulumi as pulumi
import pulumi_aws as aws
import pulumi_awsx as awsx

vpc = awsx.ec2.Vpc("my-vpc")

cluster = aws.ecs.Cluster("cluster")
```

</details>

## Step 3 &mdash; Add Load Balancer Resources

Next, we will add an application load balancer (ALB) to the public subnet of our VPC and listen for HTTP traffic port 80, plus some associated resources.

Add the following to your `__main__.py`:

```python
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
```

<details>
<summary> ✅ Code check </summary>
After this change, your `__main__.py` should look like this:

```python
import pulumi as pulumi
import pulumi_aws as aws
import pulumi_awsx as awsx

vpc = awsx.ec2.Vpc("my-vpc")

cluster = aws.ecs.Cluster("cluster")

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
```

</details>

Run your program to deploy the infrastructure we've declared so far:

```bash
pulumi up
```

In the next step, we'll define a Fargate service and deploy a container.

## Next Step

[Deploy the Service](./04_deploy_service.md)
