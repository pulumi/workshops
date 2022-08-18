# Deploying Containers to Elastic Container Service (ECS)

In this lab, you will deploy a containerized application to an AWS ECS cluster.

> This lab assumes you have a project set up and configured to use AWS. If you don't yet, please complete parts [1](../lab-01/01-creating-a-new-project.md) 
> and [2](../lab-01/02-configuring-aws.md) of lab-01.

## Step 1 &mdash; Create an ECS Cluster

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
...
const cluster = new awsx.ecs.Cluster("cluster");
```

> :white_check_mark: After these changes, your `index.ts` should [look like this](./code/step1.ts).

## Step 2 &mdash; Create a Load-Balanced Container Service

Next, allocate the application load balancer (ALB) and listen for HTTP traffic port 80. Make sure to pass along the ECS cluster's security groups:

```typescript
...
const alb = new awsx.elasticloadbalancingv2.ApplicationLoadBalancer(
    "app-lb", { external: true, securityGroups: cluster.securityGroups });
const atg = alb.createTargetGroup(
    "app-tg", { port: 80, deregistrationDelay: 0 });
const web = atg.createListener("web", { port: 80 });
```

Now declare the ECS service that will use "Fargate," meaning you don't need to manage the servers behind your ECS cluster. It will run the `"nginx"` image from the Docker Hub.

```typescript
...
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

> :white_check_mark: After these changes, your `index.ts` should [look like this](./code/step2.ts).

## Step 3 &mdash; Provision the Cluster and Service

Deploy the program to stand up your initial cluster and service:

```bash
pulumi up
```

This will output the status and resulting load balancer URL:

```
Updating (dev):

     Type                                          Name                           Status
 +   pulumi:pulumi:Stack                           iac-workshop-dev               created
 +   ├─ awsx:x:ecs:Cluster                         cluster                        created
 +   │  ├─ aws:ecs:Cluster                         cluster                        created
 +   │  └─ awsx:x:ec2:SecurityGroup                cluster                        created
 +   │     ├─ awsx:x:ec2:IngressSecurityGroupRule  cluster-containers             created
 +   │     │  └─ aws:ec2:SecurityGroupRule         cluster-containers             created
 +   │     ├─ awsx:x:ec2:EgressSecurityGroupRule   cluster-egress                 created
 +   │     │  └─ aws:ec2:SecurityGroupRule         cluster-egress                 created
 +   │     ├─ awsx:x:ec2:IngressSecurityGroupRule  cluster-ssh                    created
 +   │     │  └─ aws:ec2:SecurityGroupRule         cluster-ssh                    created
 +   │     └─ aws:ec2:SecurityGroup                cluster                        created
 +   ├─ awsx:x:ec2:Vpc                             default-vpc-eb926d81           created
 +   │  ├─ awsx:x:ec2:Subnet                       default-vpc-eb926d81-public-0  created
 +   │  └─ awsx:x:ec2:Subnet                       default-vpc-eb926d81-public-1  created
 +   ├─ awsx:x:ecs:FargateService                  app-svc                        created
 +   │  └─ aws:ecs:Service                         app-svc                        created
 +   ├─ awsx:x:ecs:FargateTaskDefinition           app-svc                        created
 +   │  ├─ aws:cloudwatch:LogGroup                 app-svc                        created
 +   │  ├─ aws:iam:Role                            app-svc-execution              created
 +   │  ├─ aws:iam:Role                            app-svc-task                   created
 +   │  ├─ aws:iam:RolePolicyAttachment            app-svc-execution-9a42f520     created
 +   │  ├─ aws:iam:RolePolicyAttachment            app-svc-task-fd1a00e5          created
 +   │  ├─ aws:iam:RolePolicyAttachment            app-svc-task-32be53a2          created
 +   │  └─ aws:ecs:TaskDefinition                  app-svc                        created
 +   └─ aws:lb:ApplicationLoadBalancer             app-lb                         created
 +      ├─ awsx:lb:ApplicationTargetGroup          app-tg                         created
 +      │  └─ aws:lb:TargetGroup                   app-tg                         created
 +      ├─ awsx:lb:ApplicationListener             web                            created
 +      │  ├─ awsx:x:ec2:EgressSecurityGroupRule   web-external-0-egress          created
 +      │  │  └─ aws:ec2:SecurityGroupRule         web-external-0-egress          created
 +      │  ├─ awsx:x:ec2:IngressSecurityGroupRule  web-external-0-ingress         created
 +      │  │  └─ aws:ec2:SecurityGroupRule         web-external-0-ingress         created
 +      │  └─ aws:lb:Listener                      web                            created
 +      └─ aws:lb:LoadBalancer                     app-lb                         created

Outputs:
    url: "http://app-lb-b196bcc-1885880269.eu-central-1.elb.amazonaws.com"

Resources:
    + 34 created

Duration: 3m55s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/dev/updates/1
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

## Step 4 &mdash; Build and Publish a Private Container Image

Add a few new files. First, `app/site/index.html`:

```html
<html>
    <head>
        <meta charset="UTF-8">
        <title>Hello, Pulumi!</title>
    </head>
    <body>
        <p>Hello, containers!</p>
        <p>Made with ❤️ with <a href="https://pulumi.com">Pulumi</a></p>
    </body>
</html>
```

And next, `app/Dockerfile`:

```
FROM nginx
COPY site /usr/share/nginx/html
```

Now, you will change the image from `"nginx"` to a custom build of a local `Dockerfile` published to a private ECR registry. Add a build step right before the Fargate service definition:

```typescript
...
const containerImage = awsx.ecs.Image.fromPath("app-img", "./app");
...
```

And replace the image name `"nginx"` with a reference to the resulting built image:

```typescript
...
            image: containerImage,
...
```

> :white_check_mark: After these changes, your `index.ts` should [look like this](./code/step4.ts).

## Step 5 &mdash; Update the Service

Now, also update the desired container count from `1` to `3`:

```
...
    desiredCount: 3,
...
```

> :white_check_mark: After this change, your `index.ts` should [look like this](./code/step5.ts).

Next update the stack:

```bash
pulumi up
```

The output should look something like this:

```
Updating (dev):

     Type                                 Name              Status      Info
     pulumi:pulumi:Stack                  iac-workshop-dev
     ├─ awsx:x:ecs:FargateTaskDefinition  app-svc
 +   │  ├─ aws:ecr:Repository             app-img           created
 +   │  ├─ aws:ecr:LifecyclePolicy        app-img           created
 +-  │  └─ aws:ecs:TaskDefinition         app-svc           replaced     [diff: ~containerDefinitions]
     └─ awsx:x:ecs:FargateService         app-svc
 ~      └─ aws:ecs:Service                app-svc           updated      [diff: ~desiredCount,~taskDefinition]

Outputs:
    url: "http://app-lb-b196bcc-1885880269.eu-central-1.elb.amazonaws.com"

Resources:
    + 2 created
    ~ 1 updated
    +-1 replaced
    4 changes. 32 unchanged

Duration: 8m8s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/dev/updates/2
```

Now curl the endpoint again to see the newly updated content:

```bash
curl $(pulumi stack output url)
```

The result will contain the updated HTML:

```
<html>
    <head><meta charset="UTF-8">
        <title>Hello, Pulumi!</title>
    </head>
    <body>
        <p>Hello, containers!</p>
        <p>Made with ❤️ with <a href="https://pulumi.com">Pulumi</a></p>
    </body>
</html>
```

## Step 6 &mdash; Destroy Everything

Finally, destroy the resources and the stack itself:

```
pulumi destroy
pulumi stack rm
```

## Next Steps

Congratulations! :tada: You've created an ECS "Fargate" cluster, created a load balanced service within it, and built and deployed a custom Docker container image to your scaled-out service.

Next, choose amongst these labs:

* [Deploying Containers to Elastic Container Service (ECS) "Fargate"](../lab-03/README.md)
* [Deploying Containers to a Kubernetes Cluster](../lab-04/README.md)
* [Using AWS Lambda for Serverless Application Patterns](../lab-05/README.md)

Or view the [suggested next steps](../../../../README.md#next-steps) after completing all labs.
