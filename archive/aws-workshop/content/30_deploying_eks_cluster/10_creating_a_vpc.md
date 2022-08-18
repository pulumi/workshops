+++
title = "Creating an Amazon VPC"
chapter = false
weight = 10
+++

Start by adding the Pulumi AWSX import to your `index.ts` file:

```typescript
import * as awsx from "@pulumi/awsx";
```

Then add the following to your `index.ts` to create a vpc. The vpc will be made of 2 private and 2 public subnets. The
private subnets will be routed to the internet via nat gateways.

See for more details and examples:  
- [API Docs](https://www.pulumi.com/docs/reference/pkg/nodejs/pulumi/awsx/index.html)  
- [Examples](https://www.pulumi.com/docs/reference/pkg/nodejs/pulumi/awsx/index.html)

```typescript
const vpc = new awsx.ec2.Vpc("workshop-vpc", {});
```

We will be able to use this vpc in which to deploy our Amazon EKS cluster.

{{% notice info %}}
The `index.ts` file should now have the following contents:
{{% /notice %}}
```typescript
import * as awsx from "@pulumi/awsx";

const vpc = new awsx.ec2.Vpc("workshop-vpc", {});

```

To provision the vpc, run:

```bash
pulumi up
```

After confirming, you will see output like the following:

```bash
Updating (dev):
     Type                                    Name                          Status
 +   pulumi:pulumi:Stack                     eks-infrastructure-dev        created
 +   └─ awsx:x:ec2:Vpc                       workshop-vpc                  created
 +      ├─ awsx:x:ec2:Subnet                 workshop-vpc-private-1        created
 +      │  ├─ aws:ec2:Subnet                 workshop-vpc-private-1        created
 +      │  ├─ aws:ec2:RouteTable             workshop-vpc-private-1        created
 +      │  ├─ aws:ec2:RouteTableAssociation  workshop-vpc-private-1        created
 +      │  └─ aws:ec2:Route                  workshop-vpc-private-1-nat-1  created
 +      ├─ awsx:x:ec2:Subnet                 workshop-vpc-private-0        created
 +      │  ├─ aws:ec2:Subnet                 workshop-vpc-private-0        created
 +      │  ├─ aws:ec2:RouteTable             workshop-vpc-private-0        created
 +      │  ├─ aws:ec2:RouteTableAssociation  workshop-vpc-private-0        created
 +      │  └─ aws:ec2:Route                  workshop-vpc-private-0-nat-0  created
 +      ├─ awsx:x:ec2:InternetGateway        workshop-vpc                  created
 +      │  └─ aws:ec2:InternetGateway        workshop-vpc                  created
 +      ├─ awsx:x:ec2:Subnet                 workshop-vpc-public-0         created
 +      │  ├─ aws:ec2:RouteTable             workshop-vpc-public-0         created
 +      │  ├─ aws:ec2:Subnet                 workshop-vpc-public-0         created
 +      │  ├─ aws:ec2:Route                  workshop-vpc-public-0-ig      created
 +      │  └─ aws:ec2:RouteTableAssociation  workshop-vpc-public-0         created
 +      ├─ awsx:x:ec2:NatGateway             workshop-vpc-0                created
 +      │  ├─ aws:ec2:Eip                    workshop-vpc-0                created
 +      │  └─ aws:ec2:NatGateway             workshop-vpc-0                created
 +      ├─ awsx:x:ec2:Subnet                 workshop-vpc-public-1         created
 +      │  ├─ aws:ec2:Subnet                 workshop-vpc-public-1         created
 +      │  ├─ aws:ec2:RouteTable             workshop-vpc-public-1         created
 +      │  ├─ aws:ec2:RouteTableAssociation  workshop-vpc-public-1         created
 +      │  └─ aws:ec2:Route                  workshop-vpc-public-1-ig      created
 +      ├─ awsx:x:ec2:NatGateway             workshop-vpc-1                created
 +      │  ├─ aws:ec2:Eip                    workshop-vpc-1                created
 +      │  └─ aws:ec2:NatGateway             workshop-vpc-1                created
 +      └─ aws:ec2:Vpc                       workshop-vpc                  created

Resources:
    + 31 created

Duration: 2m50s

Permalink: https://app.pulumi.com/workshops/eks-infrastructure/dev/updates/1
```
