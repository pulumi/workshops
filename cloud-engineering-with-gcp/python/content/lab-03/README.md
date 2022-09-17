# Build and Deploy a Container on Google Cloud Run

In our last lab, we deployed some static HTML files to a Google Cloud Storage bucket. In the third lab of this workshop, we're going create a Docker image to run our website on NGINX and deploy it to run on [Google Cloud Run](https://cloud.google.com/run/).

## Step 1 &mdash; Create a Docker Image

We'll use the [Pulumi Docker provider](https://www.pulumi.com/registry/packages/docker/) to build a Docker image we can push to Google Container Registry (GCR).

Before we add anything to our project, let's make sure we configure the Docker CLI to push to GCR. We can do that by running the following command:

```bash
gcloud auth configure-docker
```

We'll also need to install the [Pulumi Command provider](https://www.pulumi.com/registry/packages/command/) so we can build our image. We can do this using `pip`. Add the following line to the bottom of your `requirements.txt`:

```text
pulumi_command>=0.0.0,<1.0.0
```

Install your dependencies using pip:

```bash
pip install -r requirements.txt
```

> If you'd like to do all of this from the command line in a single command, run the following:
>
> ```bash
> echo "pulumi_command>=0.0.0,<1.0.0 >> requirements.txt && pip install -r requirements.txt`
> ```

Next, we need to import the Command provider's SDK. Add the following to the top of your `__main__.py` along with your other imports:

```python
import pulumi_command as command
```

Add the following to your `__main.py__` to build the Docker image:

```python
image_tag = pulumi.Output.concat(
    "gcr.io/",
    pulumi.Config("gcp").require("project"),
    "/my-first-gcp-app",
    ":latest"
)

docker_build = command.local.Command(
    "docker-build",
    create=pulumi.Output.concat(
        "docker build --platform linux/amd64 -t ", image_tag, " wwwroot 2>&1"),
    delete=pulumi.Output.concat("docker image rm ", image_tag, " || true"),
)

docker_push = command.local.Command(
    "docker-push",
    create=pulumi.Output.concat("docker push ", image_tag),
    opts=pulumi.ResourceOptions(
        depends_on=docker_build,
    ),
)
```

At this stage, your `__main__.py` file should look like this:

```python
"""A Python Pulumi program"""

import os

import pulumi
import pulumi_gcp as gcp
import pulumi_command as command

bucket = gcp.storage.Bucket(
    "website",
    location="US"
)

acl = gcp.storage.DefaultObjectAccessControl(
    'website',
    bucket=bucket.name,
    role="READER",
    entity="allUsers"
)

for file in ["404.html", "index.html"]:
    filepath = os.path.join("wwwroot", file)
    gcp.storage.BucketObject(
        file,
        bucket=bucket.name,
        name=file,
        source=pulumi.FileAsset(filepath),
        opts=pulumi.ResourceOptions(depends_on=[acl])
    )

static_site_url = pulumi.Output.concat(
    "https://storage.googleapis.com/", bucket.name, "/index.html")

pulumi.export("static_url", static_site_url)

image_tag = pulumi.Output.concat(
    "gcr.io/",
    pulumi.Config("gcp").require("project"),
    "/my-first-gcp-app",
    ":latest"
)

docker_build = command.local.Command(
    "docker-build",
    create=pulumi.Output.concat(
        "docker build --platform linux/amd64 -t ", image_tag, " wwwroot 2>&1"),
    delete=pulumi.Output.concat("docker image rm ", image_tag, " || true"),
)

docker_push = command.local.Command(
    "docker-push",
    create=pulumi.Output.concat("docker push ", image_tag),
    opts=pulumi.ResourceOptions(
        depends_on=docker_build,
    ),
)
```

## Step 2 &mdash; Configure your CloudRun Service

Now we've built our Docker image, we'll need to configure CloudRun to run it.

Add the following code to your `__main__.py` file:

```python
service = gcp.cloudrun.Service(
    "temp-app",
    name="temp-app",
    location="us-central1",
    template=gcp.cloudrun.ServiceTemplateArgs(
        spec=gcp.cloudrun.ServiceTemplateSpecArgs(
            containers=[
                gcp.cloudrun.ServiceTemplateSpecContainerArgs(
                    image=image_tag,
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
    ),
    opts=pulumi.ResourceOptions(depends_on=docker_push)
)
```

At this stage, your `__main__.py` file should match this code:

```python
"""A Python Pulumi program"""

import os

import pulumi
import pulumi_gcp as gcp
import pulumi_command as command

bucket = gcp.storage.Bucket(
    "website",
    location="US"
)

acl = gcp.storage.DefaultObjectAccessControl(
    'website',
    bucket=bucket.name,
    role="READER",
    entity="allUsers"
)

for file in ["404.html", "index.html"]:
    filepath = os.path.join("wwwroot", file)
    gcp.storage.BucketObject(
        file,
        bucket=bucket.name,
        name=file,
        source=pulumi.FileAsset(filepath),
        opts=pulumi.ResourceOptions(depends_on=[acl])
    )

static_site_url = pulumi.Output.concat(
    "https://storage.googleapis.com/", bucket.name, "/index.html")

pulumi.export("static_url", static_site_url)

image_tag = pulumi.Output.concat(
    "gcr.io/",
    pulumi.Config("gcp").require("project"),
    "/my-first-gcp-app",
    ":latest"
)

docker_build = command.local.Command(
    "docker-build",
    create=pulumi.Output.concat(
        "docker build --platform linux/amd64 -t ", image_tag, " wwwroot 2>&1"),
    delete=pulumi.Output.concat("docker image rm ", image_tag, " || true"),
)

docker_push = command.local.Command(
    "docker-push",
    create=pulumi.Output.concat("docker push ", image_tag),
    opts=pulumi.ResourceOptions(
        depends_on=docker_build,
    ),
)

service = gcp.cloudrun.Service(
    "temp-app",
    name="temp-app",
    location="us-central1",
    template=gcp.cloudrun.ServiceTemplateArgs(
        spec=gcp.cloudrun.ServiceTemplateSpecArgs(
            containers=[
                gcp.cloudrun.ServiceTemplateSpecContainerArgs(
                    image=image_tag,
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
    ),
    opts=pulumi.ResourceOptions(depends_on=docker_push)
)
```

## Step 3 &mdash; Set up public access

We'll now need to set up an `IamMember` permission to allow anyone to view this Cloud Run image.

Add the following to the end of your `__main__.py`:

```python
iam = gcp.cloudrun.IamMember(
    "example",
    gcp.cloudrun.IamMemberArgs(
        location=service.location,
        project=service.project,
        service=service.name,
        role="roles/run.invoker",
        member="allUsers"
    )
)
```

## Step 4 &mdash; Export the Bucket URL

Our final step is to build our container URL. Add the following to the end of your `__main__.py`:

```python
pulumi.export("container_url", service.statuses[0].url)
```

## Step 5 &mdash; Run `pulumi up`

Now we've defined our infrastructure, we use the pulumi CLI to create the resources.

Run `pulumi up` within your project directory.

```bash
pulumi up
```

Once Pulumi has finished creating your resources, we can check that our website is up and running:

```bash
curl $(pulumi stack output container_url)
```

The final version of your code should match [`__main__.py`](__main__.py).

## Step 6 &mdash; Cleaning up

Whenever you're working on learning with Pulumi, it's always a good idea to clean up any resources you've created so you don't get charged.

Let's clean up.

Run the `pulumi destroy` command to remove all of the resources:

```bash
$ pulumi destroy
Previewing destroy (dev)

View Live: https://app.pulumi.com/<org>/<project>/<stack>/previews/<build-id>

...
Do you want to perform this destroy? yes
Destroying (dev)

View Live: https://app.pulumi.com/<org>/<project>/<stack>/updates/<update-id>

...

The resources in the stack have been deleted, but the history and configuration associated with the stack are still maintained.
If you want to remove the stack completely, run 'pulumi stack rm dev'.
```

Now your resources should all be deleted! That last comment you see in the output notes that the stack and all of the configuration and history will stay in your dashboard on the Pulumi Service ([app.pulumi.com](https://app.pulumi.com/)).

If you want to completely remove the project and its history, run `pulumi stack rm dev`.
