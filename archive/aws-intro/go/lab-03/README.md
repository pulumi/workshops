# Deploying Containers to Elastic Container Service (ECS)

In this lab, you will deploy a containerized application to an AWS ECS cluster.

> This lab assumes you have a project set up and configured to use AWS. If you don't yet, please complete parts [1](../lab-01/01-creating-a-new-project.md) 
> and [2](../lab-01/02-configuring-aws.md) of lab-01.

## Step 1 &mdash; Create an ECS Cluster

Import the AWS and Pulumi packages in an empty `main.go` file:

```go
import (
    "github.com/pulumi/pulumi-aws/sdk/go/aws/ec2"
    "github.com/pulumi/pulumi-aws/sdk/go/aws/ecs"
    "github.com/pulumi/pulumi-aws/sdk/go/aws/lb"
    "github.com/pulumi/pulumi-aws/sdk/go/aws/iam"
    "github.com/pulumi/pulumi/sdk/go/pulumi"
)
```

And now create a new ECS cluster. You will use the default values, so doing so is very concise:

```go
...
// Create an ECS cluster to run a container-based service.
cluster, err := ecs.NewCluster(ctx, "app-cluster", nil)
if err != nil {
    return err
}
```

> :white_check_mark: After these changes, your `main.go` should [look like this](./code/step1.go).

## Step 2 &mdash; Create a Load-Balanced Container Service

Next, allocate the application load balancer (ALB) and listen for HTTP traffic port 80. In order to do this, we need to find the
default VPC and the subnet groups for it:

```go
...
t := true
vpc, err := ec2.LookupVpc(ctx, &ec2.LookupVpcArgs{Default: &t})
if err != nil {
    return err
}
subnet, err := ec2.GetSubnetIds(ctx, &ec2.GetSubnetIdsArgs{VpcId: vpc.Id})
if err != nil {
    return err
}

// Create a SecurityGroup that permits HTTP ingress and unrestricted egress.
webSg, err := ec2.NewSecurityGroup(ctx, "web-sg", &ec2.SecurityGroupArgs{
    VpcId: pulumi.String(vpc.Id),
    Egress: ec2.SecurityGroupEgressArray{
        ec2.SecurityGroupEgressArgs{
            Protocol:   pulumi.String("-1"),
            FromPort:   pulumi.Int(0),
            ToPort:     pulumi.Int(0),
            CidrBlocks: pulumi.StringArray{pulumi.String("0.0.0.0/0")},
        },
    },
    Ingress: ec2.SecurityGroupIngressArray{
        ec2.SecurityGroupIngressArgs{
            Protocol:   pulumi.String("tcp"),
            FromPort:   pulumi.Int(80),
            ToPort:     pulumi.Int(80),
            CidrBlocks: pulumi.StringArray{pulumi.String("0.0.0.0/0")},
        },
    },
})
if err != nil {
    return err
}

loadBalancer, err := lb.NewLoadBalancer(ctx, "external-loadbalancer", &lb.LoadBalancerArgs{
    Internal:         pulumi.Bool(false),
    SecurityGroups:   pulumi.StringArray{group.ID().ToStringOutput()},
    Subnets:          toPulumiStringArray(subnet.Ids),
    LoadBalancerType: pulumi.String("application"),
})
if err != nil {
    return err
}

targetGroup, err := lb.NewTargetGroup(ctx, "target-group", &lb.TargetGroupArgs{
    Port:       pulumi.Int(80),
    Protocol:   pulumi.String("HTTP"),
    TargetType: pulumi.String("ip"),
    VpcId:      pulumi.String(vpc.Id),
})
if err != nil {
    return err
}

listener, err := lb.NewListener(ctx, "listener", &lb.ListenerArgs{
    LoadBalancerArn: loadBalancer.Arn,
    Port:            pulumi.Int(80),
    DefaultActions: lb.ListenerDefaultActionArray{
        lb.ListenerDefaultActionArgs{
            Type:           pulumi.String("forward"),
            TargetGroupArn: targetGroup.Arn,
        },
    },
})
if err != nil {
    return err
}
```

> :white_check_mark: After these changes, your `main.go` should [look like this](./code/step2.go).

## Step 3 &mdash; Create ECS FargateService

In order to create a Fargate service, we need to add an IAM Role and a Task Definition and Service. the ECS Cluster will run
the `"nginx"` image from the Docker Hub.

Firstly, we need to add a new import at the top of our file

```go
// Create an IAM role that can be used by our service's task.
taskExecRole, err := iam.NewRole(ctx, "task-exec-role", &iam.RoleArgs{
    AssumeRolePolicy: pulumi.String(`{
"Version": "2008-10-17",
"Statement": [{
    "Sid": "",
    "Effect": "Allow",
    "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
    },
    "Action": "sts:AssumeRole"
}]
}`),
})
if err != nil {
    return err
}
_, err = iam.NewRolePolicyAttachment(ctx, "task-exec-policy", &iam.RolePolicyAttachmentArgs{
    Role:      taskExecRole.Name,
    PolicyArn: pulumi.String("arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"),
})
if err != nil {
    return err
}

// Spin up a load balanced service running NGINX.
appTask, err := ecs.NewTaskDefinition(ctx, "app-task", &ecs.TaskDefinitionArgs{
    Family:                  pulumi.String("fargate-task-definition"),
    Cpu:                     pulumi.String("256"),
    Memory:                  pulumi.String("512"),
    NetworkMode:             pulumi.String("awsvpc"),
    RequiresCompatibilities: pulumi.StringArray{pulumi.String("FARGATE")},
    ExecutionRoleArn:        taskExecRole.Arn,
    ContainerDefinitions: pulumi.String(`[{
"name": "my-app",
"image": "nginx",
"portMappings": [{
    "containerPort": 80,
    "hostPort": 80,
    "protocol": "tcp"
    }]
}]`),
})
if err != nil {
    return err
}
_, err = ecs.NewService(ctx, "app-svc", &ecs.ServiceArgs{
    Cluster:        cluster.Arn,
    DesiredCount:   pulumi.Int(1),
    LaunchType:     pulumi.String("FARGATE"),
    TaskDefinition: appTask.Arn,
    NetworkConfiguration: &ecs.ServiceNetworkConfigurationArgs{
        AssignPublicIp: pulumi.Bool(true),
        Subnets:        toPulumiStringArray(subnet.Ids),
        SecurityGroups: pulumi.StringArray{webSg.ID().ToStringOutput()},
    },
    LoadBalancers: ecs.ServiceLoadBalancerArray{
        ecs.ServiceLoadBalancerArgs{
            TargetGroupArn: webTg.Arn,
            ContainerName:  pulumi.String("my-app"),
            ContainerPort:  pulumi.Int(80),
        },
    },
}, pulumi.DependsOn([]pulumi.Resource{listener}))

ctx.Export("url", loadBalancer.DnsName)
```

> :white_check_mark: After these changes, your `main.go` should [look like this](./code/step3.go).

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
    DesiredCount:   pulumi.Int(3),
...
```

> :white_check_mark: After this change, your `main.go` should [look like this](./code/step5.go).

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

## Next Steps

Congratulations! :tada: You've created an ECS "Fargate" cluster, created a load balanced service within it, and a  Docker container image to your scaled-out service.

Next, view the [suggested next steps](../../../../README.md#next-steps) after completing all labs.
