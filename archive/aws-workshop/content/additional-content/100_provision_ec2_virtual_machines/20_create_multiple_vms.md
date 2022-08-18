+++
title = "Creating Multiple VMs"
chapter = false
weight = 20
+++

Now you will create multiple VM instances, each running the same Python webserver, across all AWS availability zones in
your region. Replace the part of your code that creates the webserver and exports the resulting IP address and hostname with the following:

```typescript
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
}
```

{{% notice info %}}
The `index.ts` file should now have the following contents - please note the wrapping with the async function!:
{{% /notice %}}
```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export = async () => {
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
    }
    return {
        ips: ips,
        hostnames: hostnames,
    };
}
```

Now run a command to update your stack with the new resource definitions:

```bash
pulumi up
```

You will see output like the following:

```
Updating (dev):

     Type                 Name                   Status
     pulumi:pulumi:Stack  iac-workshop-dev
 +   ├─ aws:ec2:Instance  web-server-us-west-2a  created
 +   ├─ aws:ec2:Instance  web-server-us-west-2b  created
 +   ├─ aws:ec2:Instance  web-server-us-west-2c  created
 -   └─ aws:ec2:Instance  web-server             deleted

Outputs:
  + hostnames     : [
  +     [0]: "ec2-18-197-184-46.us-west-2.compute.amazonaws.com"
  +     [1]: "ec2-18-196-225-191.us-west-2.compute.amazonaws.com"
  +     [2]: "ec2-35-158-83-62.us-west-2.compute.amazonaws.com"
    ]
  + ips           : [
  +     [0]: "18.197.184.46"
  +     [1]: "18.196.225.191"
  +     [2]: "35.158.83.62"
    ]
  - publicHostname: "ec2-52-57-250-206.us-west-2.compute.amazonaws.com"
  - publicIp      : "52.57.250.206"

Resources:
    + 3 created
    - 1 deleted
    4 changes. 2 unchanged

Duration: 1m2s

Permalink: https://app.pulumi.com/workshops/ec2-workshop/dev/updates/2
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
Hello, World -- from us-west-2a!
Hello, World -- from us-west-2b!
Hello, World -- from us-west-2c!
```
