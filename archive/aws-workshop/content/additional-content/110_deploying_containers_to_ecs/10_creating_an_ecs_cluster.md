+++
title = "Creating an AWS ECS Cluster"
chapter = false
weight = 10
+++

Install the AWSX package, if you haven't already:

```bash
npm install @pulumi/awsx
```

Import the AWSX and Pulumi packages in an empty `index.ts` file:

```typescript
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";
```

And now create a new ECS cluster. You will use the default values, so doing so is very concise:

```typescript
const cluster = new awsx.ecs.Cluster("cluster");
```

{{% notice info %}}
The `index.ts` file should now have the following contents:
{{% /notice %}}
```typescript
import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";

const cluster = new awsx.ecs.Cluster("cluster");

```

To provision the ECS Cluster, run:

```bash
pulumi up
```

After confirming, you will see output like the following:

```
Updating (dev):

     Type                                          Name                  Status
 +   pulumi:pulumi:Stack                           ecs-workshop-dev      created
 +   ├─ awsx:x:ecs:Cluster                         cluster               created
 +   │  ├─ awsx:x:ec2:SecurityGroup                cluster               created
 +   │  │  ├─ awsx:x:ec2:EgressSecurityGroupRule   cluster-egress        created
 +   │  │  │  └─ aws:ec2:SecurityGroupRule         cluster-egress        created
 +   │  │  ├─ awsx:x:ec2:IngressSecurityGroupRule  cluster-containers    created
 +   │  │  │  └─ aws:ec2:SecurityGroupRule         cluster-containers    created
 +   │  │  ├─ awsx:x:ec2:IngressSecurityGroupRule  cluster-ssh           created
 +   │  │  │  └─ aws:ec2:SecurityGroupRule         cluster-ssh           created
 +   │  │  └─ aws:ec2:SecurityGroup                cluster               created
 +   │  └─ aws:ecs:Cluster                         cluster               created
 +   └─ awsx:x:ec2:Vpc                             default-vpc           created
 +      ├─ awsx:x:ec2:Subnet                       default-vpc-public-0  created
 +      └─ awsx:x:ec2:Subnet                       default-vpc-public-1  created

Resources:
    + 14 created

Duration: 40s

Permalink: https://app.pulumi.com/workshops/ecs-workshop/dev/updates/1
```

