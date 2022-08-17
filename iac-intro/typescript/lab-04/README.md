# Lab 04 - Outputs & Stack References

We've created some resources, now let's see how we can use outputs outside of Pulumi

## Step 1 - Export the values from `my-first-app`

In stack 1, modify your program to add an exported value:


```typescript
export const containerId = container.id
```

Your Pulumi program should now look like this:

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

export const containerId = container.id
```

Run `pulumi up` to make sure the stack gets updated, and the value is exported.

## Step 2 - Look at your running Docker container.

You can now use this output value using the `pulumi stack output` command:

```bash
pulumi stack output containerId
44dde1c3ec15ed9bc372f7d513265cd4847f56223395983caed3188c2db214c8
```

Which also means you can use them in scripts, like so:

```bash
docker stats --no-stream $(pulumi stack output containerId)
CONTAINER ID        NAME                   CPU %               MEM USAGE / LIMIT   MEM %               NET I/O             BLOCK I/O           PIDS
44dde1c3ec15        my-first-app-0d221af   0.00%               0B / 0B             0.00%               1.02kB / 796B       0B / 0B             0
```

## Step 3 - Create a "prod" stack

We're now going to use the `pulumi stack` command to understand how stacks work. Let's list our existing stacks using: `pulumi stack ls`

We currently only have 1 stack. Let's add a new one!

```bash
pulumi stack init prod
```

Now we have created a pulumi `prod` stack, let's try rerun our `pulumi up`:

```
Diagnostics:
  pulumi:pulumi:Stack (my-first-app-prod):
    error: Missing required configuration variable 'my-first-app:port'
        please set a value using the command `pulumi config set my-first-app:port <value>`
```

Our configuration error is back! This is because when we configure values in pulumi, they are specific to a stack. So, let's set a port for our prod stack:

```
pulumi comnfig set port 5000
```

Make sure you use a different port to your `dev` stack!

Now, run `pulumi up` again. You should get a whole new image and container, this time running on port 5000!

## Step 4 - Create a second stack

In a new directory, create a second stack called `use-docker-id`

```bash
mkdir use-docker-id
cd use-docker-id
pulumi new typescript
```

Use the defaults, and ensure you use the `dev` stack.

## Step 5 - Configure your stack reference

Now we need to add a stack reference in use-docker-id


```typescript
import * as pulumi from "@pulumi/pulumi";

// set some config
const config = new pulumi.Config();

// get the current stack we're in as a reference
const stack = pulumi.getStack();

// get our current organization
const org = config.require("org");

// build the stack reference
const stackRef = new pulumi.StackReference(`${org}/my-first-app/${stack}`);

export const containerId = stackRef.getOutput('containerId');
```

Run `pulumi up`. You'll see the value gets exported from this stack now too.

These exported values are incredibly useful when using Pulumi stacks

Congratulations, you've now finished the introduction to Pulumi walkthrough!
