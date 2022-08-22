# Lab 2: Resources, Resource Providers, and Language Hosts

Let's talk about resources, resource providers, and language hosts. Learn more on the [Learn pathway]() if you're walking through this workshop alone!

## Verify your application

The application we'll be running on our infrastructure is in the [pulumi/tutorial-pulumi-fundamentals repo](https://github.com/pulumi/tutorial-pulumi-fundamentals) in the `app/` directory. Examine the Dockerfiles in each directory.

<details>
<summary><b>Question:</b> What's the Dockerfile in the `backend` directory doing?</summary>

<br/>
<b>Answer:</b> This Dockerfile copies the REST backend into the Docker filesystem, installs the dependencies, and builds the image. Note that port 3000 must be open on your host machine.
</details>
<br/>

## Build your Docker Image with Pulumi

Install the Docker provider:

```bash
cd ../
npm install @pulumi/docker
```

Our main program file is `index.ts`. Add the following code below the imports:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

const stack = pulumi.getStack();

const backendImageName = "backend";
const backend = new docker.RemoteImage(`${backendImageName}`, {
    name: "pulumi/tutorial-pulumi-fundamentals-backend:latest",
});
```

Now, run the following command:

```bash
pulumi up
```

<details>
<summary><b>Question:</b> Explore the output. What do you think it means?</summary>

<br/>
<b>Answer:</b> Pulumi builds a Docker image for you with a preview.
</details>

If you're following along live, now we'll talk about _inputs_ and _outputs_. If you're reading this later and need a review, check out the [relevant part of the Learn pathway]()!

Now that we've provisioned our first piece of infrastructure, let's add the other pieces of our application.

## Add the frontend client and MongoDB

Our application includes a frontend client and MongoDB. Let's add them to the program:

```typescript
// build our frontend image!
const frontendImageName = "frontend";
const frontend = new docker.RemoteImage(`${frontendImageName}`, {
    name: "pulumi/tutorial-pulumi-fundamentals-frontend:latest",
});

// build our mongodb image!
const mongoImage = new docker.RemoteImage("mongo", {
    name: "pulumi/tutorial-pulumi-fundamentals-database-local:latest",
});
```

We build the frontend client and the populated MongoDB database image the same way we built the backend.

Compare your program now to this complete program before we move forward:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

const stack = pulumi.getStack();

const backendImageName = "backend";
const backend = new docker.RemoteImage(`${backendImageName}`, {
    name: "pulumi/tutorial-pulumi-fundamentals-backend:latest",
});

// build our frontend image!
const frontendImageName = "frontend";
const frontend = new docker.RemoteImage(`${frontendImageName}`, {
    name: "pulumi/tutorial-pulumi-fundamentals-frontend:latest",
});

// build our mongodb image!
const mongoImage = new docker.RemoteImage("mongo", {
    name: "pulumi/tutorial-pulumi-fundamentals-database-local:latest",
});
```

If your code looks the same, great! Otherwise, update yours to match this code.

Now, run `pulumi up` to build all of the images that we'll need.

<details>
<summary><b>Question:</b> Do you think you need to run this command in stages?</summary>

<br/>
<b>Answer:</b> Nope! You can write the entire program and then run it. We're only doing a step-by-step process here to make learning easier.
</details>

Let's head to [lab 3](../lab-3/).
