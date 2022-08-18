# Deploy a Container

In our last lab, we deployed some static HTML files to a Google Cloud Storage bucket. Unfortunately, our test application didn't work properly, so in this example, we're going to deploy it using Google's Cloud Run.

## Step 1 &mdash; Create a Docker Image

We'll use Pulumi's Docker provider to build a Docker Image we can push to GCR.

Before we add anything to our project, let's make sure we're configured to push to gcr. We can do that by running the following command:

```
gcloud auth configure-docker
```

We'll also need to install the docker provider, so we can build our image. You can do this using `npm`:

```
npm install @pulumi/docker
```

Next, Add the following to your existing project to build the Docker Image:

```typescript
const imageName = "my-first-gcp-app";
const image = new docker.Image("example", {
  imageName: pulumi.interpolate`gcr.io/${gcp.config.project}/${imageName}:latest`,
  build: {
    context: "../wwwroot",
  },
});
```

> At this stage, your `index.ts` file should look like this:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/gcp";
import * as docker from "@pulumi/docker";

const bucket = new gcp.storage.Bucket("website", {
  location: "US",
});

const acl = new gcp.storage.DefaultObjectAccessControl("website", {
  bucket: bucket.name,
  role: "READER",
  entity: "allUsers",
});

["index.html", "404.html"].map(
  (name) =>
    new gcp.storage.BucketObject(name, {
      bucket: bucket.name,
      name: name,
      source: new pulumi.asset.FileAsset(`../wwwroot/${name}`),
      
    }, { dependsOn: accessControl })
);

const imageName = "my-first-gcp-app";
const image = new docker.Image("example", {
  imageName: pulumi.interpolate`gcr.io/${gcp.config.project}/${imageName}:latest`,
  build: {
    context: "../wwwroot",
  },
});
```

## Step 2 &mdash; Configure your CloudRun Service

Now we've built our Docker image, we'll need to configure CloudRun to run it. Add the following to your `index.ts` file:

```typescript
const container = new gcp.cloudrun.Service("temp-app", {
  name: "temp-app",
  location: "us-central1",
  template: {
    spec: {
      containers: [
        {
          image: image.imageName,
          ports: [{
            containerPort: 80,
          }],
          resources: {
            requests: {
              memory: "64Mi",
              cpu: "200m",
            },
            limits: {
              memory: "256Mi",
              cpu: "1000m",
            },
          },
        },
      ],
      containerConcurrency: 80,
    },
  },
});
```

> At this stage, your `index.ts` file should look like this:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/gcp";
import * as docker from "@pulumi/docker";

const bucket = new gcp.storage.Bucket("website", {
  location: "US",
});

const acl = new gcp.storage.DefaultObjectAccessControl("website", {
  bucket: bucket.name,
  role: "READER",
  entity: "allUsers",
});

["index.html", "404.html"].map(
  (name) =>
    new gcp.storage.BucketObject(name, {
      bucket: bucket.name,
      name: name,
      source: new pulumi.asset.FileAsset(`../wwwroot/${name}`),
      
    }, { dependsOn: accessControl })
);

const imageName = "my-first-gcp-app";
const image = new docker.Image("example", {
  imageName: pulumi.interpolate`gcr.io/${gcp.config.project}/${imageName}:latest`,
  build: {
    context: "./wwwroot",
  },
});

const container = new gcp.cloudrun.Service("temp-app", {
  name: "temp-app",
  location: "us-central1",
  template: {
    spec: {
      containers: [
        {
          image: image.imageName,
          ports: [{
            containerPort: 80,
          }],
          resources: {
            requests: {
              memory: "64Mi",
              cpu: "200m",
            },
            limits: {
              memory: "256Mi",
              cpu: "1000m",
            },
          },
        },
      ],
      containerConcurrency: 80,
    },
  },
});
```

## Step 3 &mdash; Set up public access

We'll now need to set up an `IamMember` permission to allow anyone to view this CloudRun image. Add the following to the end of your project:

```typescript
// Open the service to public unrestricted access
const iam = new gcp.cloudrun.IamMember("example", {
    service: container.name,
    location: "us-central1",
    role: "roles/run.invoker",
    member: "allUsers",
});
```

## Step 4 &mdash; Export the Bucket URL

Our final step is to build our container URL.

```typescript
// Export the URL
export const containerUrl = container.statuses[0].url
```

## Step 5 &mdash; Run `pulumi up`

Now we've defined our infrastructure, we use the pulumi CLI to create the resources.

Run `pulumi up` within your project directory. You should see something like this:

```
pulumi up
Updating (dev)

View Live: https://app.pulumi.com/jaxxstorm/gcp-typescript-cloudrun/dev/updates/3

     Type                       Name                         Status      Info
 +   pulumi:pulumi:Stack        gcp-typescript-cloudrun-dev  created     3 messages
 +   ├─ docker:image:Image      example                      created     1 warning
 +   ├─ gcp:cloudrun:Service    temp-app                     created
 +   └─ gcp:cloudrun:IamMember  example                      created
```

You can examine the details of the resources that will be created. When you're happy, move the arrow to `yes` and watch as Pulumi creates your resources!
