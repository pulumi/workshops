# Provisioning EC2 Virtual Machines

In this lab, you'll first create a single EC2 virtual machine (VM). Afterwards, you'll scale that out to a VM per availability 
zone in your region, and then add a load balancer to spread load across the entire fleet.

> This lab assumes you have a project set up and configured to use AWS. If you don't yet, please complete parts [1](../lab-01/01-creating-a-new-project.md) 
>and [2](../lab-01/02-configuring-aws.md) of lab-01.

## Step 1 &mdash;  Declare the VM

Import the AWS package in an empty `__main__.py` file:

```python
from pulumi import export
import pulumi_aws as aws
```

Now dynamically query the Amazon Linux machine image. Doing this in code avoids needing to hard-code the machine image (a.k.a., its AMI):

```python
ami = aws.ec2.get_ami(
    most_recent="true",
    owners=["137112412989"],
    filters=[{"name":"name","values":["amzn-ami-hvm-*-x86_64-ebs"]}])
```

Next, create an AWS security group. This enables `ping` over ICMP and HTTP traffic on port 80:

```python
group = aws.ec2.SecurityGroup(
    "web-secgrp",
    description='Enable HTTP access',
    ingress=[
        { 'protocol': 'icmp', 'from_port': 8, 'to_port': 0, 'cidr_blocks': ['0.0.0.0/0'] },
        { 'protocol': 'tcp', 'from_port': 80, 'to_port': 80, 'cidr_blocks': ['0.0.0.0/0'] }
])
```

Create the server. Notice it has a startup script that spins up a simple Python webserver:

```python
server = aws.ec2.Instance(
    'web-server',
    instance_type="t2.micro",
    vpc_security_group_ids=[group.id],
    ami=ami.id,
    user_data="""
#!/bin/bash
echo "Hello, World!" > index.html
nohup python -m SimpleHTTPServer 80 &
    """,
    tags={
        "Name": "web-server",
    },
)
```

> For most real-world applications, you would want to create a dedicated image for your application, rather than embedding the script in your code like this.

Finally export the VM's resulting IP address and hostname:

```python
export('ip', server.public_ip)
export('hostname', server.public_dns)
```

> :white_check_mark: After this change, your `__main__.py` should [look like this](./code/step1.py).

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

```python
# ...
ips = []
hostnames = []
for az in aws.get_availability_zones().names:
    server = aws.ec2.Instance(f'web-server-{az}',
      instance_type="t2.micro",
      vpc_security_group_ids=[group.id],
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

> :white_check_mark: After this change, your `__main__.py` should [look like this](./code/step3.py).

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

> The `pulumi stack output` command emits JSON serialized data &mdash; hence the use of the `jq` tool to extract a specific index. If you don't have `jq`, don't worry; simply copy-and-paste the hostname or IP address from the console output and `curl` that.

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

```python
# ...
group = aws.ec2.SecurityGroup(
    "web-secgrp",
    description='Enable HTTP access',
    ingress=[
        { 'protocol': 'icmp', 'from_port': 8, 'to_port': 0, 'cidr_blocks': ['0.0.0.0/0'] },
        { 'protocol': 'tcp', 'from_port': 80, 'to_port': 80, 'cidr_blocks': ['0.0.0.0/0'] },
    ],
    egress=[
        { 'protocol': 'tcp', 'from_port': 80, 'to_port': 80, 'cidr_blocks': ['0.0.0.0/0'] },
    ]
)
# ...
```

This is required to ensure the security group ingress rules don't conflict with the load balancer's.

Now right after the security group creation, and before the VM creation block, add the load balancer creation steps:

```python
# ...
default_vpc = aws.ec2.get_vpc(default="true")
default_vpc_subnets = aws.ec2.get_subnet_ids(vpc_id=default_vpc.id)

lb = aws.lb.LoadBalancer("external-loadbalancer",
    internal="false",
    security_groups=[group.id],
    subnets=default_vpc_subnets.ids,
    load_balancer_type="application",
)

target_group = aws.lb.TargetGroup("target-group",
    port=80,
    protocol="HTTP",
    target_type="ip",
    vpc_id=default_vpc.id
)

listener = aws.lb.Listener("listener",
   load_balancer_arn=lb.arn,
   port=80,
   default_actions=[{
       "type": "forward",
       "target_group_arn": target_group.arn
   }]
)
# ...
```

And then replace the VM creation block with the following:

```python
# ...
ips = []
hostnames = []
for az in aws.get_availability_zones().names:
    server = aws.ec2.Instance(f'web-server-{az}',
      instance_type="t2.micro",
      vpc_security_group_ids=[group.id],
      ami=ami.id,
      user_data="""#!/bin/bash
echo \"Hello, World -- from {}!\" > index.html
nohup python -m SimpleHTTPServer 80 &
""".format(az),
      availability_zone=az,
      tags={
          "Name": "web-server",
      },
    )
    ips.append(server.public_ip)
    hostnames.append(server.public_dns)

    attachment = aws.lb.TargetGroupAttachment(f'web-server-{az}',
        target_group_arn=target_group.arn,
        target_id=server.private_ip,
        port=80,
    )

export('ips', ips)
export('hostnames', hostnames)
export("url", lb.dns_name)
```

> :white_check_mark: After this change, your `__main__.py` should [look like this](./code/step4.py).

Deploy these updates:

```bash
pulumi up
```

This should result in a fairly large update and, if all goes well, the load balancer's resulting endpoint URL:

```
Updating (dev):

     Type                             Name                      Status
     pulumi:pulumi:Stack              python-testing-dev        created
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
