# Provisioning EC2 Virtual Machines

In this lab, you'll first create a single EC2 virtual machine (VM). Afterwards, you'll scale that out to a VM per availability 
zone in your region, and then add a load balancer to spread load across the entire fleet.

> This lab assumes you have a project set up and configured to use AWS. If you don't yet, please complete parts [1](../lab-01/01-creating-a-new-project.md) 
>and [2](../lab-01/02-configuring-aws.md) of lab-01.

## Step 1 &mdash;  Declare the VM

Import the AWS package in an empty `index.ts` file:

```typescript
import * as aws from "@pulumi/aws";
```

Now dynamically query the Amazon Linux machine image. Doing this in code avoids needing to hard-code the machine image (a.k.a., its AMI):

```typescript
const ami = aws.getAmi({
    filters: [{ name: "name", values: ["amzn-ami-hvm-*-x86_64-ebs"] }],
    owners: [ "137112412989" ],
    mostRecent: true,
}).then(ami => ami.id);
```

Next, create an AWS security group. This enables `ping` over ICMP and HTTP traffic on port 80:

```typescript
const sg = new aws.ec2.SecurityGroup("web-secgrp", {
    ingress: [
        { protocol: "icmp", fromPort: 8, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
    ],
});
```

Create the server. Notice it has a startup script that spins up a simple Python webserver:

```typescript
const server = new aws.ec2.Instance("web-server", {
    instanceType: "t2.micro",
    securityGroups: [ sg.name ],
    ami: ami,
    userData: "#!/bin/bash\n"+
        "echo 'Hello, World!' > index.html\n" +
        "nohup python -m SimpleHTTPServer 80 &",
    tags: { "Name": "web-server" },
});
```

> For most real-world applications, you would want to create a dedicated image for your application, rather than embedding the script in your code like this.

Finally export the VM's resulting IP address and hostname:

```typescript
export const ip = server.publicIp;
export const hostname = server.publicDns;
```

> :white_check_mark: After this change, your `index.ts` should [look like this](./code/step1.ts).

## Step 2 &mdash; Provision the VM and Access It

To provision the VM, run:

```bash
pulumi up
```

After confirming, you will see output like the following:

```
Updating (dev):

     Type                      Name              Status
 +   pulumi:pulumi:Stack       iac-workshop-dev  created
 +   ├─ aws:ec2:SecurityGroup  web-secgrp        created
 +   └─ aws:ec2:Instance       web-server        created

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
curl $(pulumi stack output hostname)
```

Either way you should see a response from the Python webserver:

```
Hello, World!
```

## Step 3 – Create Multiple Virtual Machines

Now you will create multiple VM instances, each running the same Python webserver, across all AWS availability zones in
your region. Replace the part of your code that creates the webserver and exports the resulting IP address and hostname with the following:

```typescript
...
export const ips: any[] = [];
export const hostnames: any[] = [];
for (const az of aws.getAvailabilityZones().names) {
    const server = new aws.ec2.Instance(`web-server-${az}`, {
        instanceType: "t2.micro",
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
}
```

> :white_check_mark: After this change, your `index.ts` should [look like this](./code/step3.ts).

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
  - publicHostname: "ec2-52-57-250-206.eu-central-1.compute.amazonaws.com"
  - publicIp      : "52.57.250.206"

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

> The `pulumi stack output` command emits JSON serialized data &mdash; hence the use of the `jq` tool to extract a specific index. If you don't have `jq`, don't worry; simply copy-and-paste the hostname or IP address from the console output and `curl` that.

Note that the webserver number is included in its response:

```
Hello, World -- from eu-central-1a!
Hello, World -- from eu-central-1b!
Hello, World -- from eu-central-1c!
```

## Step 4 &mdash; Create a Load Balancer

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
...
const sg = new aws.ec2.SecurityGroup("web-secgrp", {
    ingress: [
        { protocol: "icmp", fromPort: 8, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
    ],
});
...
```

This is required to ensure the security group ingress rules don't conflict with the load balancer's.

Now right after the security group creation, and before the VM creation block, add the load balancer creation:

```typescript
...
const alb = new awsx.lb.ApplicationLoadBalancer("web-traffic", {
    external: true,
    securityGroups: [ sg.id ],
});
const listener = alb.createListener("web-listener", { port: 80 });
...
```

And then replace the VM creation block with the following:

```typescript
...
export const ips: any[] = [];
export const hostnames: any[] = [];
for (const az of aws.getAvailabilityZones().names) {
    const server = new aws.ec2.Instance(`web-server-${az}`, {
        instanceType: "t2.micro",
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

> :white_check_mark: After this change, your `index.ts` should [look like this](./code/step4.ts).

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
 +      │  ├─ awsx:lb:TargetGroupAttachment        web-target-eu-central-1a         created
 +      │  │  └─ aws:lb:TargetGroupAttachment      web-target-eu-central-1a         created
 +      │  ├─ awsx:lb:TargetGroupAttachment        web-target-eu-central-1b         created
 +      │  │  └─ aws:lb:TargetGroupAttachment      web-target-eu-central-1b         created
 +      │  ├─ awsx:lb:TargetGroupAttachment        web-target-eu-central-1c         created
 +      │  │  └─ aws:lb:TargetGroupAttachment      web-target-eu-central-1c         created
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
    + 20 created
    ~ 1 updated
    21 changes. 4 unchanged

Duration: 2m33s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/dev/updates/3
```

Now we can curl the load balancer:

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
* [Deploying Containers to a Kubernetes Cluster](../lab-04/README.md)
* [Using AWS Lambda for Serverless Application Patterns](../lab-05/README.md)

Or view the [suggested next steps](../../../../README.md#next-steps) after completing all labs.
