+++
title = "Build and Publish A Custom Container"
chapter = false
weight = 30
+++

Add a few new files. First, create a site directory structure:
 
```bash
mkdir -p app/site
```

Then create a `index.html` file in `app/site`:

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

Now, you will change the image from `"nginx"` to a custom build of a local `Dockerfile` published to a private ECR registry. 
Add a build step right before the Fargate service definition:

```typescript
const containerImage = awsx.ecs.Image.fromPath("app-img", "./app");
```

And replace the image name `"nginx"` with a reference to the resulting built image:

```typescript
    image: containerImage,
```

Lastly, let's update the desired count of our service:

```typescript
    desiredCount: 3,
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

const containerImage = awsx.ecs.Image.fromPath("app-img", "./app");
const appService = new awsx.ecs.FargateService("app-svc", {
    cluster,
    taskDefinitionArgs: {
        container: {
            image: containerImage,
            portMappings: [ web ],
        },
    },
    desiredCount: 3,
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
     Type                                  Name              Status       Info
     pulumi:pulumi:Stack                   ecs-workshop-dev
     ├─ awsx:x:ecs:FargateTaskDefinition   app-svc
 +   │  ├─ aws:ecr:Repository              app-img           created
 +   │  ├─ aws:ecr:LifecyclePolicy         app-img           created
 +-  │  └─ aws:ecs:TaskDefinition          app-svc           replaced     [diff: ~containerDefinitions]
     ├─ aws:lb:ApplicationLoadBalancer     app-lb
     │  └─ awsx:lb:ApplicationTargetGroup  app-tg
 ~   │     └─ aws:lb:TargetGroup           app-tg            updated      [diff: ~deregistrationDelay]
     └─ awsx:x:ecs:FargateService          app-svc
 ~      └─ aws:ecs:Service                 app-svc           updated      [diff: ~taskDefinition]

Outputs:
    url: "app-lb-fd7bd4b-538931589.us-west-2.elb.amazonaws.com"

Resources:
    + 2 created
    ~ 2 updated
    +-1 replaced
    5 changes. 31 unchanged

Duration: 2m26s

Permalink: https://app.pulumi.com/workshops/ecs-workshop/dev/updates/3
```

You can now curl the resulting endpoint:

```bash
curl $(pulumi stack output url)
```

And you'll see the application as follows:

```
▶ curl $(pulumi stack output url)
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
