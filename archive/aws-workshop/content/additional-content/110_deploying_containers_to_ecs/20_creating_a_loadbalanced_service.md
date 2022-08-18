+++
title = "Creating an ECS Loadbalanced Service"
chapter = false
weight = 10
+++

Next, allocate the application load balancer (ALB) and listen for HTTP traffic port 80. Make sure to pass along the ECS
cluster's security groups:

```typescript
const alb = new awsx.elasticloadbalancingv2.ApplicationLoadBalancer(
    "app-lb", { external: true, securityGroups: cluster.securityGroups });
const atg = alb.createTargetGroup(
    "app-tg", { port: 80, deregistrationDelay: 0 });
const web = atg.createListener("web", { port: 80 });
```

Now declare the ECS service that will use "Fargate," meaning you don't need to manage the servers behind your ECS cluster.
It will run the `"nginx"` image from the Docker Hub.

```typescript
const appService = new awsx.ecs.FargateService("app-svc", {
    cluster,
    taskDefinitionArgs: {
        container: {
            image: "nginx",
            portMappings: [ web ],
        },
    },
    desiredCount: 1,
});

export const url = pulumi.interpolate`${web.endpoint.hostname}`;
```

{{% notice info %}}
The `index.ts` file should now have the following contents:
{{% /notice %}}
```typescript
import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";

const cluster = new awsx.ecs.Cluster("cluster");

const alb = new awsx.elasticloadbalancingv2.ApplicationLoadBalancer(
    "app-lb", { external: true, securityGroups: cluster.securityGroups });
const atg = alb.createTargetGroup(
    "app-tg", { port: 80, deregistrationDelay: 0 });
const web = atg.createListener("web", { port: 80 });

const appService = new awsx.ecs.FargateService("app-svc", {
    cluster,
    taskDefinitionArgs: {
        container: {
            image: "nginx",
            portMappings: [ web ],
        },
    },
    desiredCount: 1,
});

export const url = pulumi.interpolate`${web.endpoint.hostname}`;
```

To provision the ECS Cluster, run:

```bash
pulumi up
```

After confirming, you will see output like the following:

```
Updating (dev):
     Type                                             Name                        Status
     pulumi:pulumi:Stack                              ecs-workshop-dev
 +   ├─ aws:lb:ApplicationLoadBalancer                app-lb                      created
 +   │  ├─ awsx:lb:ApplicationTargetGroup             app-tg                      created
 +   │  │  ├─ awsx:lb:ApplicationListener             web                         created
 +   │  │  │  ├─ awsx:x:ec2:IngressSecurityGroupRule  web-external-0-ingress      created
 +   │  │  │  │  └─ aws:ec2:SecurityGroupRule         web-external-0-ingress      created
 +   │  │  │  ├─ awsx:x:ec2:EgressSecurityGroupRule   web-external-0-egress       created
 +   │  │  │  │  └─ aws:ec2:SecurityGroupRule         web-external-0-egress       created
 +   │  │  │  └─ aws:lb:Listener                      web                         created
 +   │  │  └─ aws:lb:TargetGroup                      app-tg                      created
 +   │  └─ aws:lb:LoadBalancer                        app-lb                      created
 +   ├─ awsx:x:ecs:FargateTaskDefinition              app-svc                     created
 +   │  ├─ aws:iam:Role                               app-svc-execution           created
 +   │  ├─ aws:cloudwatch:LogGroup                    app-svc                     created
 +   │  ├─ aws:iam:Role                               app-svc-task                created
 +   │  ├─ aws:iam:RolePolicyAttachment               app-svc-execution-9a42f520  created
 +   │  ├─ aws:iam:RolePolicyAttachment               app-svc-task-32be53a2       created
 +   │  ├─ aws:iam:RolePolicyAttachment               app-svc-task-fd1a00e5       created
 +   │  └─ aws:ecs:TaskDefinition                     app-svc                     created
 +   └─ awsx:x:ecs:FargateService                     app-svc                     created
 +      └─ aws:ecs:Service                            app-svc                     created

Outputs:
  + url: "app-lb-fd7bd4b-538931589.us-west-2.elb.amazonaws.com"

Resources:
    + 20 created
    14 unchanged

Duration: 3m20s

Permalink: https://app.pulumi.com/workshops/ecs-workshop/dev/updates/2
```

You can now curl the resulting endpoint:

```bash
curl $(pulumi stack output url)
```

And you'll see the Nginx default homepage:

```
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...
```
