# Deploy a Container

In our last lab, we deployed some static HTML files to a Google Cloud Storage bucket. In the third lab of this workshop, we're going create a Docker image to run our website on NGINX and deploy it to run on [Google Cloud Run](https://cloud.google.com/run/).

## Step 1 &mdash; Create a Docker Image

We'll use the [Pulumi Docker provider](https://www.pulumi.com/registry/packages/docker/) to build a Docker image we can push to Google Container Registry (GCR).

Before we add anything to our project, let's make sure we're configured to push to GCR. We can do that by running the following command:

```bash
gcloud auth configure-docker
```

We'll also need to install the Docker provider so we can build our image. We can do this using `pip`. Add the following line to the bottom of your `requirements.txt`:

```text
pulumi_docker>=3.0.0,<4.0.0
```

Install your dependencies using pip:

```bash
pip install -r requirements.txt
```

> If you'd like to do all of this from the command line in a single command, run the following:
>
> ```bash
> echo "pulumi_docker>=3.0.0,<4.0.0" >> requirements.txt && pip install -r requirements.txt`
> ```

Add the following to your `__main.py__` to build the Docker image:

```python
image_name = "my-first-gcp-app"
image = docker.Image(
    "example",
    image_name=pulumi.Output.concat(
        "gcr.io/",
        gcp.config.project,
        "/",
        image_name,
        ":latest"
    ),
    build="../wwwroot"
)
```

At this stage, your `index.ts` file should look like this:

```python
# TODO
```

## Step 2 &mdash; Configure your CloudRun Service

Now we've built our Docker image, we'll need to configure CloudRun to run it. Add the following to your `__main__` file:

```python
container = gcp.cloudrun.Service(
    "temp-app",
    name="temp-app",
    location="us-central-1",
    template=gcp.cloudrun.ServiceTemplateArgs(
        spec=gcp.cloudrun.ServiceTemplateSpecArgs(
            containers=[
                gcp.cloudrun.ServiceTemplateSpecContainerArgs(
                    image=image.image_name,
                    ports=[
                        gcp.cloudrun.ServiceTemplateSpecContainerPortArgs(
                            container_port=80
                        )
                    ],
                    resources=gcp.cloudrun.ServiceTemplateSpecContainerResourcesArgs(
                        requests={"memory": "64Mi", "cpu": "200m"},
                        limits={"memory": "265Mi", "cpu": "1000m"}
                    )
                )
            ],
            container_concurrency=80
        )
    )
)
```

At this stage, your `__main__` file should look like this:

```python
# TODO
```

## Step 3 &mdash; Set up public access

We'll now need to set up an `IamMember` permission to allow anyone to view this Cloud Run image.

Add the following to the end of your `__main__.py`:

```python
iam = gcp.cloudrun.IamMember(
    "example",
    gcp.cloudrun.IamMemberArgs(
        service=container.name,
        location="us-central-1",
        role="roles/run.invoker",
        member="allUsers"
    )
)
```

## Step 4 &mdash; Export the Bucket URL

Our final step is to build our container URL.

```python

```

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
