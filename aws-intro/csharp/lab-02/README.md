# Provisioning EC2 Virtual Machines

In this lab, you'll first create a single EC2 virtual machine (VM). Afterwards, you'll scale that out to a VM per availability 
zone in your region, and then add a load balancer to spread load across the entire fleet.

> This lab assumes you have a project set up and configured to use AWS. If you don't yet, please complete parts [1](../lab-01/01-creating-a-new-project.md) 
>and [2](../lab-01/02-configuring-aws.md) of lab-01.

## Step 1 &mdash;  Declare the VM

Import the AWS package in an empty `MyStack.cs` file:

```cs
using Pulumi;
```

Now dynamically query the Amazon Linux machine image. Doing this in code avoids needing to hard-code the machine image (a.k.a., its AMI):

```cs
var ami = Output.Create(Pulumi.Aws.Invokes.GetAmi(new Pulumi.Aws.GetAmiArgs
{
    MostRecent = true,
    Owners = {"137112412989"},
    Filters = {new Pulumi.Aws.Inputs.GetAmiFiltersArgs
    {
        Name = "name", Values = {"amzn-ami-hvm-*"}
    }}
}));
```

Next, create an AWS security group. This enables `ping` over ICMP and HTTP traffic on port 80:

```cs
var group = new Pulumi.Aws.Ec2.SecurityGroup("web-secgrp", new Pulumi.Aws.Ec2.SecurityGroupArgs
{
    Description = "Enable HTTP access",
    Ingress =
    {
        new Pulumi.Aws.Ec2.Inputs.SecurityGroupIngressArgs
        {
            Protocol = "tcp",
            FromPort = 80,
            ToPort = 80,
            CidrBlocks = {"0.0.0.0/0"}
        },
        new Pulumi.Aws.Ec2.Inputs.SecurityGroupIngressArgs
        {
            Protocol = "icmp",
            FromPort = 8,
            ToPort = 80,
            CidrBlocks = {"0.0.0.0/0"}
        }
    }
});
```

Create the server. Notice it has a startup script that spins up a simple Python webserver:

```cs
var userData = @"
#!/bin/bash
echo ""Hello, World!"" > index.html
nohup python -m SimpleHTTPServer 80 &
";

var server = new Pulumi.Aws.Ec2.Instance("web-server-www", new Pulumi.Aws.Ec2.InstanceArgs
{
    InstanceType = "t2.micro",
    VpcSecurityGroupIds = {group.Id},
    UserData = userData,
    Ami = ami.Apply(a => a.Id)
});
```

> For most real-world applications, you would want to create a dedicated image for your application, rather than embedding the script in your code like this.

Add some properties to be able to get the output information:

```cs
[Output] public Output<string> PublicIp { get; set; }
[Output] public Output<string> PublicDns { get; set; }
```

Finally export the VM's resulting IP address and hostname:

```cs
this.PublicIp = server.PublicIp;
this.PublicDns = server.PublicDns;
```

> :white_check_mark: After this change, your `MyStack.cs` should [look like this](./code/step1.cs).

## Step 2 &mdash; Provision the VM and Access It

To provision the VM, ensure we have all of the dependencies installed by running:

```bash
$ dep ensure
```

then we can instruct Pulumi to run:

```bash
pulumi up
```

After confirming, you will see output like the following:

```
Updating (dev):

     Type                      Name              Status
 +   pulumi:pulumi:Stack       iac-workshop-dev  created
 +   ├─ aws:ec2:SecurityGroup  web-secgrp        created
 +   └─ aws:ec2:Instance       web-server-www    created

Outputs:
    PublicDns: "ec2-52-57-250-206.eu-central-1.compute.amazonaws.com"
    PublicIp: "52.57.250.206"

Resources:
    + 3 created

Duration: 40s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/dev/updates/1
```

To verify that our server is accepting requests properly, curl either the hostname or IP address:

```bash
curl $(pulumi stack output PublicIp)
```

Either way you should see a response from the Python webserver:

```
Hello, World!
```

## Step 3 – Create Multiple Virtual Machines

Now you will create multiple VM instances, each running the same Python webserver, across all AWS availability zones in
your region. Replace the part of your code that creates the webserver and exports the resulting IP address and hostname with the following:

```cs
...
var azs = Pulumi.Aws.GetAvailabilityZones.InvokeAsync(new Pulumi.Aws.GetAvailabilityZonesArgs()).Result;
var hostnames = new List<Input<string>>();
var ips = new List<Input<string>>();
foreach (var az in azs.Names)
{
    var server = new Pulumi.Aws.Ec2.Instance($"web-server-{az}", new Pulumi.Aws.Ec2.InstanceArgs
    {
        InstanceType = "t2.micro",
        VpcSecurityGroupIds = {group.Id},
        UserData = userData,
        Ami = ami.Apply(a => a.Id),
        AvailabilityZone = az,
    });

    hostnames.Add(server.PublicDns);
    ips.Add(server.PublicIp);
}
```

We need to change the output parameters:

```csharp
[Output] public Output<ImmutableArray<string>> PublicIps { get; set; }
[Output] public Output<ImmutableArray<string>> PublicDns { get; set; }
```

and now we can set the parameters as follows:

```csharp
this.PublicIps = Output.All(ips.ToImmutableArray());
this.PublicDns = Output.All(hostnames.ToImmutableArray());
```

> :white_check_mark: After this change, your `MyStack.cs` should [look like this](./code/step3.cs).

Now run a command to update your stack with the new resource definitions:

```bash
pulumi up
```

You will see output like the following:

```
Updating (dev):

     Type                 Name                      Status
     pulumi:pulumi:Stack  iac-workshop-dev
 +   ├─ aws:ec2:Instance  web-server-eu-central-1a  created
 +   ├─ aws:ec2:Instance  web-server-eu-central-1b  created
 +   ├─ aws:ec2:Instance  web-server-eu-central-1c  created
 -   └─ aws:ec2:Instance  web-server                deleted

Outputs:
  + PublicDns     : [
  +     [0]: "ec2-18-197-184-46.eu-central-1.compute.amazonaws.com"
  +     [1]: "ec2-18-196-225-191.eu-central-1.compute.amazonaws.com"
  +     [2]: "ec2-35-158-83-62.eu-central-1.compute.amazonaws.com"
    ]
  + PublicIps           : [
  +     [0]: "18.197.184.46"
  +     [1]: "18.196.225.191"
  +     [2]: "35.158.83.62"
    ]
  - PublicDns: "ec2-52-57-250-206.eu-central-1.compute.amazonaws.com"
  - PublicIps      : "52.57.250.206"

Resources:
    + 3 created
    - 1 deleted
    4 changes. 2 unchanged

Duration: 1m2s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/dev/updates/2
```

Notice that your original server was deleted and new ones created in its place, because its name changed.

To test the changes, curl any of the resulting IP addresses or hostnames:

```bash
for i in {0..2}; do curl $(pulumi stack output PublicDns | jq -r ".[${i}]"); done
```

> The count of servers depends on the number of AZs in your region. Adjust the `{0..2}` accordingly.

> The `pulumi stack output` command emits JSON serialized data &mdash; hence the use of the `jq` tool to extract a 
>specific index. If you don't have `jq`, don't worry; simply copy-and-paste the hostname or IP address from the console output and `curl` that.

```
Hello, World!
Hello, World!
Hello, World!
```

## Step 4 &mdash; Create a Load Balancer

Needing to loop over the webservers isn't very realistic. You will now create a load balancer over them to distribute load evenly.

We need to add an egress rule to our security group. Whenever you add a listener to your load balancer or update the health check port for a
target group used by the load balancer to route requests, you must verify that the security groups associated with the load balancer allow 
traffic on the new port in both directions.

```csharp
...
var group = new Pulumi.Aws.Ec2.SecurityGroup("web-secgrp", new Pulumi.Aws.Ec2.SecurityGroupArgs
{
    Description = "Enable HTTP access",
    Egress =
    {
        new Pulumi.Aws.Ec2.Inputs.SecurityGroupEgressArgs
        {
            Protocol = "-1",
            FromPort = 0,
            ToPort = 0,
            CidrBlocks = {"0.0.0.0/0"}
        },
    },
    Ingress =
    {
        new Pulumi.Aws.Ec2.Inputs.SecurityGroupIngressArgs
        {
            Protocol = "tcp",
            FromPort = 80,
            ToPort = 80,
            CidrBlocks = {"0.0.0.0/0"}
        },
        new Pulumi.Aws.Ec2.Inputs.SecurityGroupIngressArgs
        {
            Protocol = "icmp",
            FromPort = 8,
            ToPort = 80,
            CidrBlocks = {"0.0.0.0/0"}
        }
    }
});
...
```

This is required to ensure the security group ingress rules don't conflict with the load balancer's.

Now right after the security group creation, and before the VM creation block, add the load balancer creation steps:

```csharp
...
var vpc = Output.Create(Pulumi.Aws.Ec2.GetVpc.InvokeAsync(new Pulumi.Aws.Ec2.GetVpcArgs {Default = true}));
var vpcId = vpc.Apply(vpc => vpc.Id);
var subnet = vpcId.Apply(id => Pulumi.Aws.Ec2.GetSubnetIds.InvokeAsync(new Pulumi.Aws.Ec2.GetSubnetIdsArgs {VpcId = id}));
var subnetIds = subnet.Apply(s => s.Ids);

var loadbalancer = new Pulumi.Aws.LB.LoadBalancer("external-loadbalancer", new Pulumi.Aws.LB.LoadBalancerArgs
{
    Internal = false,
    SecurityGroups =
    {
        group.Id
    },
    Subnets = subnetIds,
    LoadBalancerType = "application",
});

var targetGroup = new Pulumi.Aws.LB.TargetGroup("target-group", new Pulumi.Aws.LB.TargetGroupArgs
{
    Port = 80,
    Protocol = "HTTP",
    TargetType = "ip",
    VpcId = vpcId,
});

var listener = new Pulumi.Aws.LB.Listener("listener", new Pulumi.Aws.LB.ListenerArgs
{
    LoadBalancerArn = loadbalancer.Arn,
    Port = 80,
    DefaultActions =
    {
        new Pulumi.Aws.LB.Inputs.ListenerDefaultActionsArgs
        {
            Type = "forward",
            TargetGroupArn = targetGroup.Arn,
        }
    }
});
...
```

And then replace the VM creation block with the following:

```csharp
...
var hostNames = Pulumi.Aws.GetAvailabilityZones.InvokeAsync(new Pulumi.Aws.GetAvailabilityZonesArgs()).Result;
foreach (var az in hostNames.Names)
{
    if (az == "us-west-2d")
    {
        continue;
    }
    var server = new Pulumi.Aws.Ec2.Instance($"web-server-{az}", new Pulumi.Aws.Ec2.InstanceArgs
    {
        InstanceType = "t2.micro",
        VpcSecurityGroupIds = {group.Id},
        UserData = userData,
        Ami = ami.Apply(a => a.Id),
        AvailabilityZone = az,
    });
    
    var attachment = new Pulumi.Aws.LB.TargetGroupAttachment($"web-server-{az}", new Pulumi.Aws.LB.TargetGroupAttachmentArgs
    {
        Port = 80,
        TargetGroupArn = targetGroup.Arn,
        TargetId = server.PrivateIp,
    });
}
```

Change the Output parameter as follows:

```csharp
[Output] public Output<string> Url { get; set; }
```

Then assign the loadbalancer DNS Name:

```csharp
this.Url = loadbalancer.DnsName;
```

> :white_check_mark: After this change, your `MyStack.cs` should [look like this](./code/step4.cs).

Deploy these updates:

```bash
pulumi up
```

This should result in a fairly large update and, if all goes well, the load balancer's resulting endpoint URL:

```
Updating (dev):

     Type                             Name                      Status
     pulumi:pulumi:Stack              iac-workshop-dev          created
~    ├─ aws:ec2:SecurityGroup         web-secgrp                updated     [diff: ~ingress, ~egress]
 +   ├─ aws:lb:TargetGroup            target-group              created
 +   ├─ aws:lb:LoadBalancer           external-loadbalancer     created
 +   ├─ aws:lb:TargetGroupAttachment  web-server-eu-central-1b  created
 +   ├─ aws:lb:TargetGroupAttachment  web-server-eu-central-1c  created
 +   ├─ aws:lb:TargetGroupAttachment  web-server-eu-central-1a  created
 +   └─ aws:lb:Listener               listener                  created

Outputs:
    hostnames: [
        [0]: "ec2-18-197-184-46.eu-central-1.compute.amazonaws.com"
        [1]: "ec2-18-196-225-191.eu-central-1.compute.amazonaws.com"
        [2]: "ec2-35-158-83-62.eu-central-1.compute.amazonaws.com"
    ]
    ips      : [
        [0]: "18.197.184.46"
        [1]: "18.196.225.191"
        [2]: "35.158.83.62"
  + Url      : "web-traffic-09348bc-723263075.eu-central-1.elb.amazonaws.com"

Resources:
    + 6 created
    ~ 1 updated
    7 changes. 4 unchanged

Duration: 2m33s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/dev/updates/3
```

It may take a little while for the instances to register in the loadbalancer, but we can curl the load balancer:

```bash
for i in {0..10}; do curl $(pulumi stack output url); done
```

Observe that the resulting text changes based on where the request is routed:

```
Hello, World!
Hello, World!
Hello, World!
Hello, World!
Hello, World!
Hello, World!
Hello, World!
Hello, World!
Hello, World!
Hello, World!
```

## Step 5 &mdash; Destroy Everything

Finally, destroy the resources and the stack itself:

```
pulumi destroy
pulumi stack rm
```

## Next Steps

Congratulations! :tada: You have stood up an EC2 VM, scaled it out across multiple availability zones, and configured a
load balancer to spread traffic across all of your instances.

Next, choose amongst these labs:

* [Deploying Containers to Elastic Container Service (ECS) "Fargate"](../lab-03/README.md)
* [Deploying Containers to a Kubernetes Cluster](../lab-04/README.md)
* [Using AWS Lambda for Serverless Application Patterns](../lab-05/README.md)

Or view the [suggested next steps](../../../../README.md#next-steps) after completing all labs.
