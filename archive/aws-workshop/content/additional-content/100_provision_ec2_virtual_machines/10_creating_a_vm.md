+++
title = "Creating a VM"
chapter = false
weight = 10
+++

Import the AWS package to your empty `index.ts` file:

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
    instanceType: "t3.micro",
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

{{% notice info %}}
The `index.ts` file should now have the following contents:
{{% /notice %}}
```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const ami = aws.getAmi({
    filters: [{ name: "name", values: ["amzn-ami-hvm-*-x86_64-ebs"] }],
    owners: [ "137112412989" ],
    mostRecent: true,
}).then(ami => ami.id);

const sg = new aws.ec2.SecurityGroup("web-secgrp", {
    ingress: [
        { protocol: "icmp", fromPort: 8, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
    ],
});

const server = new aws.ec2.Instance("web-server", {
    instanceType: "t3.micro",
    securityGroups: [ sg.name ],
    ami: ami,
    userData: "#!/bin/bash\n"+
        "echo 'Hello, World!' > index.html\n" +
        "nohup python -m SimpleHTTPServer 80 &",
    tags: { "Name": "web-server" },
});

export const ip = server.publicIp;
export const hostname = server.publicDns;
```

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
    hostname: "ec2-52-57-250-206.us-west-2.compute.amazonaws.com"
    ip      : "52.57.250.206"

Resources:
    + 3 created

Duration: 40s

Permalink: https://app.pulumi.com/workshops/ec2-workshop/dev/updates/1
```

To verify that our server is accepting requests properly, curl either the hostname or IP address. 

```bash
curl $(pulumi stack output hostname)
```

Either way you should see a response from the Python webserver:

```
Hello, World!
```

{{% notice info %}}
The time for the machine to be provisioned in AWS can be a little slow, so initial requests to the endpoint may return "connection refused"
{{% /notice %}}
