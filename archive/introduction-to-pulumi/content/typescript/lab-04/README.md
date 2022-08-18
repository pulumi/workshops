# Lab 04 - Using Loops

We've created some resources, now let's see how we can use loops and conditionals to create more resources

## Step 1 - Define an array

We want to create multiple docker containers. We could define another container resource, but we can also loop through a list and create many containers.

We want to run many containers, so we'll need to define a unique port for each one to run on. We can do this by defining an array of objects.

Update your Pulumi program to add this object. Add the following before your container resource:


```typescript
const ports = [
  { name: "dev", port: 3000 },
  { name: "stg", port: 5000 },
  { name: "prd", port: 8000 },
];
```

> Your Pulumi program should now look like this:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

const config = new pulumi.Config();
const port = config.requireNumber("port")

const imageName = "my-first-app"
const stack = pulumi.getStack();

const image = new docker.Image(imageName, {
    build: './app',
    imageName: `${imageName}:${stack}`,
    skipPush: true,
})

const ports = [
  { name: "dev", port: 3000 },
  { name: "stg", port: 5000 },
  { name: "prd", port: 8000 },
];

const container = new docker.Container("my-first-app", {
    image: image.baseImageName,
    envs: [
        "LISTEN_PORT="+port,
    ],
    ports: [{
        internal: port,
        external: port,
    }]
})
```

## Step 2 - Loop through the array

We can now define our running containers, by reading the array and grabbing the name, and the port from the object. We'll no longer need to retrieve the port configuration from the Pulumi config, so let's remove that.

Remove the following from your Pulumi program:

```typescript
const config = new pulumi.Config();
const port = config.requireNumber("port")
```

And then update your container resource to provision your containers from your ports config. Replace the `const container =` resource with the following:

```typescript
const containers = ports.map(
    (config) => {
        let container = new docker.Container(config.name, {
            image: image.baseImageName,
            envs: [ "LISTEN_PORT=" + config.port],
            ports: [{
                internal: config.port,
                external: config.port
            }]
        })
    }
)
```

> Your Pulumi program should now look like this:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

const imageName = "my-first-app";
const stack = pulumi.getStack();

const image = new docker.Image(imageName, {
  build: "./app/typescript",
  imageName: `${imageName}:${stack}`,
  skipPush: true,
});

const ports = [
  { name: "dev", port: 3000 },
  { name: "stg", port: 5000 },
  { name: "prd", port: 8000 },
];

const containers = ports.map(
    (config) => {
        let container = new docker.Container(config.name, {
            image: image.baseImageName,
            envs: [ "LISTEN_PORT=" + config.port],
            ports: [{
                internal: config.port,
                external: config.port
            }]
        })
    }
)

```

## Step 3 - Provision multiple containers

Now we've updated our Pulumi application to loop through our array, we can rerun our Pulumi up and get multiple containers:

```bash
pulumi up
```
