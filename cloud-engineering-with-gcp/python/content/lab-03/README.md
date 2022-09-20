# Build and Deploy a Container on Google Cloud Run

In our last lab, we deployed some static HTML files to a Google Cloud Storage bucket. In the third lab of this workshop, we will create a Docker image to run our website on NGINX and deploy it to run on [Google Cloud Run](https://cloud.google.com/run/).

## Step 1 &mdash; Initialize Your Project

First, we'll initialize a Pulumi project as we did in [Creating a New Project](../lab-01/README.md).

Create a new directory and change into it:

```bash
mkdir my-first-gcp-cloudrun-app
cd my-first-gcp-cloudrun-app
```

Initialize your Pulumi project:

```bash
pulumi new python -y
```

And initialize your virtualenv:

```bash
source venv/bin/activate
```

## Step 2 &mdash; Create a Docker Image

Before we add anything to our project, let's make sure we configure the Docker CLI to push to GCR. We can do this by running the following command:

```bash
gcloud auth configure-docker
```

In addition to the GCP provider, we'll also need to install the [Pulumi Command provider](https://www.pulumi.com/registry/packages/command/) so we can build our image. We can do this using `pip`.

Add the following to your `requirements.txt`:

```text
pulumi_gcp>=6.0.0,<7.0.0
pulumi_command>=0.5.0,<1.0.0
```

Install your dependencies using pip:

```bash
pip install -r requirements.txt
```

Next, we need to import the GCP and Command providers.

Add the following to the top of your `__main__.py` along with your other imports:

```python
import pulumi_gcp as gcp
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

import pulumi
import pulumi_gcp as gcp
import pulumi_command as command


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

## Step 3 &mdash; Configure your CloudRun Service

Now we've built our Docker image, we'll need to configure CloudRun to run it.

Add the following code to your `__main__.py`:

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

import pulumi
import pulumi_gcp as gcp
import pulumi_command as command


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

## Step 4 &mdash; Set up public access

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

## Step 5 &mdash; Export the Bucket URL

Our final step is to build our container URL. Add the following to the end of your `__main__.py`:

```python
pulumi.export("container_url", service.statuses[0].url)
```

At this point, your `__main__.py` should look like this:

```python
"""A Python Pulumi program"""

import pulumi
import pulumi_gcp as gcp
import pulumi_command as command


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

pulumi.export("container_url", service.statuses[0].url)
```

## Step 6 &mdash; Run `pulumi up`

Now we've defined our infrastructure, we use the Pulumi CLI to create the resources.

Run the following command from your project directory:

```bash
pulumi up
```

Once Pulumi has finished creating your resources, we can check that our website is up and running:

```bash
curl $(pulumi stack output container_url)
```

The final version of your code should match [`__main__.py`](__main__.py).

## Step 7 &mdash; Cleaning up

Now that we've demonstrated creating a static site using Pulumi, it's time to tear down our infrastructure now that we no longer need it.

Run the following command at the command line:

```bash
pulumi destroy
```

You will be presented with a preview indicating that all resources in the stack will be destroyed by continuing. Select `yes` to continue and your infrastructure will be deleted.

If you'd like to remove your now-empty stack completely, you can optionally run the following command and confirm when asked if you're sure:

```bash
pulumi stack rm dev
```

That's it!
