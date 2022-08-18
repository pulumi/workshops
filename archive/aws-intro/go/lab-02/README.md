# Provisioning EC2 Virtual Machines

In this lab, you'll first create a single EC2 virtual machine (VM). Afterwards, you'll scale that out to a VM per availability 
zone in your region, and then add a load balancer to spread load across the entire fleet.

> This lab assumes you have a project set up and configured to use AWS. If you don't yet, please complete parts [1](../lab-01/01-creating-a-new-project.md) 
>and [2](../lab-01/02-configuring-aws.md) of lab-01.

## Step 1 &mdash;  Declare the VM

Import the AWS package in an empty `main.go` file:

```go
import (
	"github.com/pulumi/pulumi-aws/sdk/go/aws"
	"github.com/pulumi/pulumi-aws/sdk/go/aws/ec2"
	"github.com/pulumi/pulumi/sdk/go/pulumi"
)
```

Now dynamically query the Amazon Linux machine image. Doing this in code avoids needing to hard-code the machine image (a.k.a., its AMI):

```go
// Get the ID for the latest Amazon Linux AMI.
mostRecent := true
ami, err := aws.GetAmi(ctx, &aws.GetAmiArgs{
    Filters: []aws.GetAmiFilter{
        {
            Name:   "name",
            Values: []string{"amzn-ami-hvm-*-x86_64-ebs"},
        },
    },
    Owners:     []string{"137112412989"},
    MostRecent: &mostRecent,
})
if err != nil {
    return err
}
```

Next, create an AWS security group. This enables `ping` over ICMP and HTTP traffic on port 80:

```go
group, err := ec2.NewSecurityGroup(ctx, "web-secgrp", &ec2.SecurityGroupArgs{
    Ingress: ec2.SecurityGroupIngressArray{
        ec2.SecurityGroupIngressArgs{
            Protocol:   pulumi.String("tcp"),
            FromPort:   pulumi.Int(80),
            ToPort:     pulumi.Int(80),
            CidrBlocks: pulumi.StringArray{pulumi.String("0.0.0.0/0")},
        },
        ec2.SecurityGroupIngressArgs{
            Protocol:   pulumi.String("icmp"),
            FromPort:   pulumi.Int(8),
            ToPort:     pulumi.Int(80),
            CidrBlocks: pulumi.StringArray{pulumi.String("0.0.0.0/0")},
        },
    },
})
if err != nil {
    return err
}
```

Create the server. Notice it has a startup script that spins up a simple Python webserver:

```go
// Create a simple web server using the startup script for the instance.
srv, err := ec2.NewInstance(ctx, "web-server-www", &ec2.InstanceArgs{
    Tags:                pulumi.Map{"Name": pulumi.String("web-server-www")},
    InstanceType:        pulumi.String("t2.micro"),
    VpcSecurityGroupIds: pulumi.StringArray{group.ID()},
    Ami:                 pulumi.String(ami.Id),
    UserData: pulumi.String(`#!/bin/bash
echo "Hello, World!" > index.html
nohup python -m SimpleHTTPServer 80 &`),
})
```

> For most real-world applications, you would want to create a dedicated image for your application, rather than embedding the script in your code like this.

Finally export the VM's resulting IP address and hostname:

```go
ctx.Export("publicIp", srv.PublicIp)
ctx.Export("publicHostName", srv.PublicDns)
```

> :white_check_mark: After this change, your `main.go` should [look like this](./code/step1.go).

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
    hostname: "ec2-52-57-250-206.eu-central-1.compute.amazonaws.com"
    ip      : "52.57.250.206"

Resources:
    + 3 created

Duration: 40s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/dev/updates/1
```

To verify that our server is accepting requests properly, curl either the hostname or IP address:

```bash
curl $(pulumi stack output publicIp)
```

Either way you should see a response from the Python webserver:

```
Hello, World!
```

## Step 3 – Create Multiple Virtual Machines

Now you will create multiple VM instances, each running the same Python webserver, across all AWS availability zones in
your region. Replace the part of your code that creates the webserver and exports the resulting IP address and hostname with the following:

```go
...
ips = []
hostnames = []
for az in aws.get_availability_zones().names:
    server = aws.ec2.Instance(f'web-server-{az}',
      instance_type="t2.micro",
      security_groups=[group.name],
      ami=ami.id,
      availability_zone=az,
      user_data="""#!/bin/bash
echo \"Hello, World -- from {}!\" > index.html
nohup python -m SimpleHTTPServer 80 &
""".format(az),
      tags={
          "Name": "web-server",
      },
    )
    ips.append(server.public_ip)
    hostnames.append(server.public_dns)
```

> :white_check_mark: After this change, your `main.go` should [look like this](./code/step3.go).

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
  + hostnames     : [
  +     [0]: "ec2-18-197-184-46.eu-central-1.compute.amazonaws.com"
  +     [1]: "ec2-18-196-225-191.eu-central-1.compute.amazonaws.com"
  +     [2]: "ec2-35-158-83-62.eu-central-1.compute.amazonaws.com"
    ]
  + ips           : [
  +     [0]: "18.197.184.46"
  +     [1]: "18.196.225.191"
  +     [2]: "35.158.83.62"
    ]
  - hostname: "ec2-52-57-250-206.eu-central-1.compute.amazonaws.com"
  - ip      : "52.57.250.206"

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
for i in {0..2}; do curl $(pulumi stack output hostnames | jq -r ".[${i}]"); done
```

> The count of servers depends on the number of AZs in your region. Adjust the `{0..2}` accordingly.

> The `pulumi stack output` command emits JSON serialized data &mdash; hence the use of the `jq` tool to extract a 
>specific index. If you don't have `jq`, don't worry; simply copy-and-paste the hostname or IP address from the console output and `curl` that.

Note that the webserver number is included in its response:

```
Hello, World -- from eu-central-1a!
Hello, World -- from eu-central-1b!
Hello, World -- from eu-central-1c!
```

## Step 4 &mdash; Create a Load Balancer

Needing to loop over the webservers isn't very realistic. You will now create a load balancer over them to distribute load evenly.

We need to add an egress rule to our security group. Whenever you add a listener to your load balancer or update the health check port for a
target group used by the load balancer to route requests, you must verify that the security groups associated with the load balancer allow 
traffic on the new port in both directions.

```go
...
group, err := ec2.NewSecurityGroup(ctx, "web-secgrp", &ec2.SecurityGroupArgs{
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
        ec2.SecurityGroupIngressArgs{
            Protocol:   pulumi.String("icmp"),
            FromPort:   pulumi.Int(8),
            ToPort:     pulumi.Int(80),
            CidrBlocks: pulumi.StringArray{pulumi.String("0.0.0.0/0")},
        },
    },
})
if err != nil {
    return err
}
...
```

This is required to ensure the security group ingress rules don't conflict with the load balancer's.

Now right after the security group creation, and before the VM creation block, add the load balancer creation steps:

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
...
```

And then replace the VM creation block with the following:

```go
...
for _, az := range azs.Names {
    srv, err := ec2.NewInstance(ctx, fmt.Sprintf("web-server-%s", az), &ec2.InstanceArgs{
        Tags:                pulumi.Map{"Name": pulumi.String("web-server-www")},
        InstanceType:        pulumi.String("t2.micro"), // t2.micro is available in the AWS free tier.
        VpcSecurityGroupIds: pulumi.StringArray{group.ID()},
        Ami:                 pulumi.String(ami.Id),
        AvailabilityZone:    pulumi.String(az),
        UserData: pulumi.String(fmt.Sprintf(`#!/bin/bash
echo "Hello, World -- from %s!" > index.html
nohup python -m SimpleHTTPServer 80 &`, az)),
    })
    if err != nil {
        return err
    }

    _, err = lb.NewTargetGroupAttachment(ctx, fmt.Sprintf("web-server-%s", az), &lb.TargetGroupAttachmentArgs{
        Port:           pulumi.Int(80),
        TargetGroupArn: targetGroup.Arn,
        TargetId:       srv.PrivateIp,
    })
}

ctx.Export("url", loadBalancer.DnsName)
```

> :white_check_mark: After this change, your `main.go` should [look like this](./code/step4.go).

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
  + url      : "web-traffic-09348bc-723263075.eu-central-1.elb.amazonaws.com"

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
Hello, World -- from eu-central-1b!
Hello, World -- from eu-central-1c!
Hello, World -- from eu-central-1a!
Hello, World -- from eu-central-1b!
Hello, World -- from eu-central-1b!
Hello, World -- from eu-central-1a!
Hello, World -- from eu-central-1c!
Hello, World -- from eu-central-1a!
Hello, World -- from eu-central-1c!
Hello, World -- from eu-central-1b!
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

Or view the [suggested next steps](../../../../README.md#next-steps) after completing all labs.
