+++
title = "Loadbalancing the VMs"
chapter = false
weight = 30
+++

Needing to loop over the webservers isn't very realistic. You will now create a load balancer over them to distribute load evenly.

Now install the AWSX package, a collection of helpers that makes things like configuring load balancing easier:

```bash
npm install @pulumi/awsx
```

And import this package at the top of your program:

```typescript
import * as awsx from "@pulumi/awsx";
```

Delete the port 80 `ingress` rule from your security group, leaving behind only the ICMP rule:

```typescript
const sg = new aws.ec2.SecurityGroup("web-secgrp", {
    ingress: [
        { protocol: "icmp", fromPort: 8, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
    ],
});
```

This is required to ensure the security group ingress rules don't conflict with the load balancer's.

Now right after the security group creation, and before the VM creation block, add the load balancer creation:

```typescript
const alb = new awsx.lb.ApplicationLoadBalancer("web-traffic", {
    external: true,
    securityGroups: [ sg.id ],
});
const listener = alb.createListener("web-listener", { port: 80 });
```

And then replace the VM creation block with the following:

```typescript
export const ips: any[] = [];
export const hostnames: any[] = [];
for (const az of aws.getAvailabilityZones().names) {
    const server = new aws.ec2.Instance(`web-server-${az}`, {
        instanceType: "t3.micro",
        securityGroups: [ sg.name ],
        ami: ami,
        availabilityZone: az,
        userData: "#!/bin/bash\n"+
            `echo 'Hello, World -- from ${az}!' > index.html\n` +
            "nohup python -m SimpleHTTPServer 80 &",
        tags: { "Name": "web-server" },
    });
    ips.push(server.publicIp);
    hostnames.push(server.publicDns);

    alb.attachTarget(`web-target-${az}`, server);
}

export const url = listener.endpoint.hostname;
```

{{% notice info %}}
The `index.ts` file should now have the following contents:
{{% /notice %}}
```typescript
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

export = async () => {
    const ami = aws.getAmi({
        filters: [{ name: "name", values: ["amzn-ami-hvm-*-x86_64-ebs"] }],
        owners: [ "137112412989" ],
        mostRecent: true,
    }).then(ami => ami.id);

    const sg = new aws.ec2.SecurityGroup("web-secgrp", {
        ingress: [
            { protocol: "icmp", fromPort: 8, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
        ],
    });

    const alb = new awsx.lb.ApplicationLoadBalancer("web-traffic", {
        external: true,
        securityGroups: [ sg.id ],
    });
    const listener = alb.createListener("web-listener", { port: 80 });

    const ips: any[] = [];
    const hostnames: any[] = [];
    const azs = await aws.getAvailabilityZones()
    for (const az of azs.names) {
        const server = new aws.ec2.Instance(`web-server-${az}`, {
            instanceType: "t3.micro",
            securityGroups: [ sg.name ],
            ami: ami,
            availabilityZone: az,
            userData: "#!/bin/bash\n"+
                `echo 'Hello, World -- from ${az}!' > index.html\n` +
                "nohup python -m SimpleHTTPServer 80 &",
            tags: { "Name": "web-server" },
        });
        ips.push(server.publicIp);
        hostnames.push(server.publicDns);

	    alb.attachTarget(`web-target-${az}`, server);
    }
    return {
	    url: listener.endpoint.hostname,
    };
}



```

Deploy these updates:

```bash
pulumi up
```

This should result in a fairly large update and, if all goes well, the load balancer's resulting endpoint URL:

```
Updating (dev):

     Type                                          Name                             Status      Info
     pulumi:pulumi:Stack                           iac-workshop-dev
 ~   ├─ aws:ec2:SecurityGroup                      web-secgrp                       updated     [diff: ~ingress]
 +   ├─ awsx:x:ec2:Vpc                             default-vpc-eb926d81             created
 +   │  ├─ awsx:x:ec2:Subnet                       default-vpc-eb926d81-public-0    created
 +   │  └─ awsx:x:ec2:Subnet                       default-vpc-eb926d81-public-1    created
 +   └─ aws:lb:ApplicationLoadBalancer             web-traffic                      created
 +      ├─ awsx:lb:ApplicationTargetGroup          web-listener                     created
 +      │  ├─ awsx:lb:TargetGroupAttachment        web-target-us-west-2a            created
 +      │  │  └─ aws:lb:TargetGroupAttachment      web-target-us-west-2a            created
 +      │  ├─ awsx:lb:TargetGroupAttachment        web-target-us-west-2b            created
 +      │  │  └─ aws:lb:TargetGroupAttachment      web-target-us-west-2b            created
 +      │  ├─ awsx:lb:TargetGroupAttachment        web-target-us-west-2c            created
 +      │  │  └─ aws:lb:TargetGroupAttachment      web-target-us-west-2c            created
 +      │  └─ aws:lb:TargetGroup                   web-listener                     created
 +      ├─ awsx:x:ec2:SecurityGroup                web-traffic-0                    created
 +      ├─ awsx:lb:ApplicationListener             web-listener                     created
 +      │  ├─ awsx:x:ec2:IngressSecurityGroupRule  web-listener-external-0-ingress  created
 +      │  │  └─ aws:ec2:SecurityGroupRule         web-listener-external-0-ingress  created
 +      │  ├─ awsx:x:ec2:EgressSecurityGroupRule   web-listener-external-0-egress   created
 +      │  │  └─ aws:ec2:SecurityGroupRule         web-listener-external-0-egress   created
 +      │  └─ aws:lb:Listener                      web-listener                     created
 +      └─ aws:lb:LoadBalancer                     web-traffic                      created

Outputs:
    hostnames: [
        [0]: "ec2-18-197-184-46.us-west-2.compute.amazonaws.com"
        [1]: "ec2-18-196-225-191.us-west-2.compute.amazonaws.com"
        [2]: "ec2-35-158-83-62.us-west-2.compute.amazonaws.com"
    ]
    ips      : [
        [0]: "18.197.184.46"
        [1]: "18.196.225.191"
        [2]: "35.158.83.62"
  + url      : "web-traffic-09348bc-723263075.us-west-2.elb.amazonaws.com"

Resources:
    + 20 created
    ~ 1 updated
    21 changes. 4 unchanged

Duration: 2m33s

Permalink: https://app.pulumi.com/workshops/iac-workshop/dev/updates/3
```

Now we can curl the load balancer:

```bash
for i in {0..10}; do curl $(pulumi stack output url); done
```

Observe that the resulting text changes based on where the request is routed:

```
Hello, World -- from us-west-2b!
Hello, World -- from us-west-2c!
Hello, World -- from us-west-2a!
Hello, World -- from us-west-2b!
Hello, World -- from us-west-2b!
Hello, World -- from us-west-2a!
Hello, World -- from us-west-2c!
Hello, World -- from us-west-2a!
Hello, World -- from us-west-2c!
Hello, World -- from us-west-2b!
```
