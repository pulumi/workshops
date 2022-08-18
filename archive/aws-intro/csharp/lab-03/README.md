# Deploying Containers to Elastic Container Service (ECS)

In this lab, you will deploy a containerized application to an AWS ECS cluster.

> This lab assumes you have a project set up and configured to use AWS. If you don't yet, please complete parts [1](../lab-01/01-creating-a-new-project.md)
> and [2](../lab-01/02-configuring-aws.md) of lab-01.

## Step 1 &mdash; Create an ECS Cluster

Import the Pulumi packages in an empty `MyStack.cs` file:

```csharp
using Pulumi;
```

And now create a new ECS cluster. You will use the default values, so doing so is very concise:

```csharp
...
// Create an ECS cluster to run a container-based service.
var cluster = new Pulumi.Aws.Ecs.Cluster("app-cluster");
```

> :white_check_mark: After these changes, your `MyStack.cs` should [look like this](./code/step1.cs).

## Step 2 &mdash; Create a Load-Balanced Container Service

Next, allocate the application load balancer (ALB) and listen for HTTP traffic port 80. In order to do this, we need to find the
default VPC and the subnet groups for it:

```csharp
...
// Read back the default VPC and public subnets, which we will use.
var vpc = Output.Create(Pulumi.Aws.Ec2.GetVpc.InvokeAsync(new Pulumi.Aws.Ec2.GetVpcArgs {Default = true}));
var vpcId = vpc.Apply(vpc => vpc.Id);
var subnet = vpcId.Apply(id => Pulumi.Aws.Ec2.GetSubnetIds.InvokeAsync(new Pulumi.Aws.Ec2.GetSubnetIdsArgs {VpcId = id}));
var subnetIds = subnet.Apply(s => s.Ids);

// Create a SecurityGroup that permits HTTP ingress and unrestricted egress.
var webSg = new Pulumi.Aws.Ec2.SecurityGroup("web-sg", new Pulumi.Aws.Ec2.SecurityGroupArgs
{
    VpcId = vpcId,
    Egress =
    {
        new Pulumi.Aws.Ec2.Inputs.SecurityGroupEgressArgs
        {
            Protocol = "-1",
            FromPort = 0,
            ToPort = 0,
            CidrBlocks = {"0.0.0.0/0"}
        }
    },
    Ingress =
    {
        new Pulumi.Aws.Ec2.Inputs.SecurityGroupIngressArgs
        {
            Protocol = "tcp",
            FromPort = 80,
            ToPort = 80,
            CidrBlocks = {"0.0.0.0/0"}
        }
    }
});

// Create a load balancer to listen for HTTP traffic on port 80.
var webLb = new Pulumi.Aws.LB.LoadBalancer("web-lb", new Pulumi.Aws.LB.LoadBalancerArgs
{
    Subnets = subnetIds,
    SecurityGroups = {webSg.Id}
});
var webTg = new Pulumi.Aws.LB.TargetGroup("web-tg", new Pulumi.Aws.LB.TargetGroupArgs
{
    Port = 80,
    Protocol = "HTTP",
    TargetType = "ip",
    VpcId = vpcId
});
var webListener = new Pulumi.Aws.LB.Listener("web-listener", new Pulumi.Aws.LB.ListenerArgs
{
    LoadBalancerArn = webLb.Arn,
    Port = 80,
    DefaultActions =
    {
        new Pulumi.Aws.LB.Inputs.ListenerDefaultActionArgs
        {
            Type = "forward",
            TargetGroupArn = webTg.Arn,
        }
    }
});
```

> :white_check_mark: After these changes, your `MyStack.cs` should [look like this](./code/step2.cs).

## Step 3 &mdash; Create ECS FargateService

In order to create a Fargate service, we need to add an IAM Role and a Task Definition and Service. the ECS Cluster will run
the `"nginx"` image from the Docker Hub.

Firstly, we need to add a new import at the top of our file

```csharp
// Create an IAM role that can be used by our service's task.
var taskExecRole = new Pulumi.Aws.Iam.Role("task-exec-role", new Pulumi.Aws.Iam.RoleArgs
{
    AssumeRolePolicy = @"{
""Version"": ""2008-10-17"",
""Statement"": [{
    ""Sid"": """",
    ""Effect"": ""Allow"",
    ""Principal"": {
        ""Service"": ""ecs-tasks.amazonaws.com""
    },
    ""Action"": ""sts:AssumeRole""
}]
}"
});
var taskExecAttach = new Pulumi.Aws.Iam.RolePolicyAttachment("task-exec-policy", new Pulumi.Aws.Iam.RolePolicyAttachmentArgs
{
    Role = taskExecRole.Name,
    PolicyArn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
});

// Spin up a load balanced service running our container image.
var appTask = new Pulumi.Aws.Ecs.TaskDefinition("app-task", new Pulumi.Aws.Ecs.TaskDefinitionArgs
{
    Family = "fargate-task-definition",
    Cpu = "256",
    Memory = "512",
    NetworkMode = "awsvpc",
    RequiresCompatibilities = {"FARGATE"},
    ExecutionRoleArn = taskExecRole.Arn,
    ContainerDefinitions = @"[{
""name"": ""my-app"",
""image"": ""nginx"",
""portMappings"": [{
    ""containerPort"": 80,
    ""hostPort"": 80,
    ""protocol"": ""tcp""
}]
}]",
});
var appSvc = new Pulumi.Aws.Ecs.Service("app-svc", new Pulumi.Aws.Ecs.ServiceArgs
{
    Cluster = cluster.Arn,
    DesiredCount = 3,
    LaunchType = "FARGATE",
    TaskDefinition = appTask.Arn,
    NetworkConfiguration = new Pulumi.Aws.Ecs.Inputs.ServiceNetworkConfigurationArgs
    {
        AssignPublicIp = true,
        Subnets = subnetIds,
        SecurityGroups = {webSg.Id}
    },
    LoadBalancers =
    {
        new Pulumi.Aws.Ecs.Inputs.ServiceLoadBalancerArgs
        {
            TargetGroupArn = webTg.Arn,
            ContainerName = "my-app",
            ContainerPort = 80
        }
    }
}, new CustomResourceOptions {DependsOn = {webListener}});

```

We need to create an Output parameter to pass our url back to the Pulumi console:

```csharp
[Output] public Output<string> Url { get; set; }
```

Then we can set the URL as an output:

```csharp
// Export the resulting web address.
this.Url = Output.Format($"http://{webLb.DnsName}");
```

> :white_check_mark: After these changes, your `MyStack.cs` should [look like this](./code/step3.cs).

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
    Url: "app-lb-b8fc703-1737790569.us-west-2.elb.amazonaws.com"

Resources:
    + 10 created

Duration: 2m50s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/dev/updates/1
```

You can now curl the resulting endpoint:

```bash
curl $(pulumi stack output Url)
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
    DesiredCount = 3,
...
```

> :white_check_mark: After this change, your `MyStack.cs` should [look like this](./code/step5.cs).

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
    Url: "app-lb-b8fc703-1737790569.us-west-2.elb.amazonaws.com"

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

Congratulations! :tada: You've created an ECS "Fargate" cluster, created a load balanced service within it, and a Docker container image to your scaled-out service.

Next, view the [suggested next steps](../../../../README.md#next-steps) after completing all labs.
