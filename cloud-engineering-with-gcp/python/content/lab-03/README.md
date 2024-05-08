# Build and deploy a Container on Google Cloud Run using Python

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

## Step 2 &mdash; Add our Docker Image Files

We need to add some files in order to create our Docker image.

First, create a sub-directory of our project to hold our Docker image files:

```bash
mkdir docker
```

Create a file `docker/Dockerfile` with the following contents:

```dockerfile
FROM nginx:mainline-alpine
RUN rm /etc/nginx/conf.d/*
ADD hello.conf /etc/nginx/conf.d/
ADD index.html /usr/share/nginx/html/
```

Create a file `docker/hello.conf` with the following contents:

```text
server {
    listen 80;

    root /usr/share/nginx/html;
    try_files /index.html =404;

    expires -1;
}
```

Create a file `docker/index.html` with the following contents:

```html
<html>

<head>
  <meta charset="UTF-8">
  <title>Hello, Pulumi!</title>
</head>

<body>
  <p>Hello, CloudRun!</p>
  <p>Made with ❤️ with <a href="https://pulumi.com">Pulumi</a> and Python</p>
  <p>Hosted with ❤️ by GCP!</p>
</body>
</html>
```

## Step 3 &mdash; Create an Artifact Registry and Docker Image

Before we add anything to our Pulumi program, let's make sure we configure the Docker CLI to push to Google CLoud. We can do this by running the following command:

```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

In addition to the GCP provider, we'll also need to install the [Pulumi Docker provider](https://www.pulumi.com/registry/packages/docker/) so we can build our image. We can do this using `pip3`.

Add the following to your `requirements.txt`:

```text
pulumi_gcp>=6.0.0,<7.0.0
pulumi_docker>=4.0.0,<5.0.0
```

Install your dependencies using pip:

```bash
pip3 install -r requirements.txt
```

Next, we need to import the GCP and Docker provider SDKs.

Add the following to the top of your `__main__.py` along with your other imports:

```python
import pulumi_gcp as gcp
import pulumi_docker as docker
```

First, we'll need to define a Google Artifact Registry repository to hold our Docker image. Add the following to your `__main__.py`:

```python
repo_id = "pulumi-workshop"
repo = gcp.artifactregistry.Repository(
    "repo",
    gcp.artifactregistry.RepositoryArgs(
        format="DOCKER",
        location="us-central1",
        repository_id=repo_id,
    ),
)
```

Next, we'll need to build our Docker image. Add the following to your `__main.py__`:

```python
project = pulumi.Config("gcp").require("project")
image_tag = pulumi.Output.concat(
    repo.location,
    "-docker.pkg.dev/",
    project,
    "/",
    repo_id,
    "/my-first-gcp-cloudrun-app:latest",
)

image = docker.Image(
    "image",
    image_name=image_tag,
    build=docker.DockerBuild(
        context="docker",
        env={
            # Forces Docker to build an AMD image on ARM machines as Google
            # Cloud Run only supports AMD64 images:
            "DOCKER_DEFAULT_PLATFORM": "linux/amd64",
        },
    ),
)
```

<details>
<summary>🕵️ Code Check. Expand to see the full `__main.py__` contents so far </summary>

At this stage, your `__main__.py` file should match the following code:

```python
"""A Python Pulumi program"""

import pulumi
import pulumi_gcp as gcp
import pulumi_docker as docker

repo_id = "pulumi-workshop"
repo = gcp.artifactregistry.Repository(
    "repo",
    gcp.artifactregistry.RepositoryArgs(
        format="DOCKER",
        location="us-central1",
        repository_id=repo_id,
    ),
)

project = pulumi.Config("gcp").require("project")
image_tag = pulumi.Output.concat(
    repo.location,
    "-docker.pkg.dev/",
    project,
    "/",
    repo_id,
    "/my-first-gcp-cloudrun-app:latest",
)

image = docker.Image(
    "image",
    image_name=image_tag,
    build=docker.DockerBuild(
        context="docker",
        env={
            # Forces Docker to build an AMD image on ARM machines as Google
            # Cloud Run only supports AMD64 images:
            "DOCKER_DEFAULT_PLATFORM": "linux/amd64",
        },
    ),
)
```

</details>

## Step 4 &mdash; Configure your CloudRun Service

Now we've built our Docker image, we'll need to configure CloudRun to run it.

1. Deploy current changes as it may take a bit of time:

    ```bash
    pulumi up
    ```

2. Add the following code to your `__main__.py`:

    ```python
    service = gcp.cloudrun.Service(
        "temp-app",
        name="temp-app",
        location=repo.location,
        template=gcp.cloudrun.ServiceTemplateArgs(
            spec=gcp.cloudrun.ServiceTemplateSpecArgs(
                containers=[
                    gcp.cloudrun.ServiceTemplateSpecContainerArgs(
                        image=image.base_image_name,
                        ports=[
                            gcp.cloudrun.ServiceTemplateSpecContainerPortArgs(
                                container_port=80,
                            ),
                        ],
                        # resources=gcp.cloudrun.ServiceTemplateSpecContainerResourcesArgs(
                        #     requests={"memory": "64Mi", "cpu": "200m"},
                        #     limits={"memory": "265Mi", "cpu": "1000m"},
                        # ),
                    ),
                ],
                container_concurrency=3,
            ),
        ),
    )
    ```

<details>
    <summary>🕵️ Code Check. Expand to see the full `__main.py__` contents so far </summary>
At this stage, your `__main__.py` file should match the following code:

```python
"""A Python Pulumi program"""

import pulumi
import pulumi_gcp as gcp
import pulumi_docker as docker

repo_id = "pulumi-workshop"
repo = gcp.artifactregistry.Repository(
    "repo",
    gcp.artifactregistry.RepositoryArgs(
        format="DOCKER",
        location="us-central1",
        repository_id=repo_id,
    ),
)

project = pulumi.Config("gcp").require("project")
image_tag = pulumi.Output.concat(
    repo.location,
    "-docker.pkg.dev/",
    project,
    "/",
    repo_id,
    "/my-first-gcp-cloudrun-app:latest",
)

image = docker.Image(
    "image",
    image_name=image_tag,
    build=docker.DockerBuild(
        context="docker",
        env={
            # Forces Docker to build an AMD image on ARM machines as Google
            # Cloud Run only supports AMD64 images:
            "DOCKER_DEFAULT_PLATFORM": "linux/amd64",
        },
    ),
)

service = gcp.cloudrun.Service(
    "temp-app",
    name="temp-app",
    location=repo.location,
    template=gcp.cloudrun.ServiceTemplateArgs(
        spec=gcp.cloudrun.ServiceTemplateSpecArgs(
            containers=[
                gcp.cloudrun.ServiceTemplateSpecContainerArgs(
                    image=image.base_image_name,
                    ports=[
                        gcp.cloudrun.ServiceTemplateSpecContainerPortArgs(
                            container_port=80,
                        ),
                    ],
                    # resources=gcp.cloudrun.ServiceTemplateSpecContainerResourcesArgs(
                    #     requests={"memory": "64Mi", "cpu": "200m"},
                    #     limits={"memory": "265Mi", "cpu": "1000m"},
                    # ),
                ),
            ],
            container_concurrency=3,
        ),
    ),
)
```

</details>

## Step 5 &mdash; Set up public access

We'll now need to set up an `IamMember` permission to allow anyone to view this Cloud Run image.

Add the following to the end of your `__main__.py`:

```python
gcp.cloudrun.IamMember(
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

## Step 6 &mdash; Export the Container Service URL

Our final step is to build our container URL. Add the following to the end of your `__main__.py`:

```python
pulumi.export("cloud_run_service_url", service.statuses[0].url)
```

<details>
<summary>🕵️ Code Check. Expand to see the full `__main.py__` contents so far </summary>

At this stage, your `__main__.py` file should match the following code:

```python
"""A Python Pulumi program"""

import pulumi
import pulumi_gcp as gcp
import pulumi_docker as docker

repo_id = "pulumi-workshop"
repo = gcp.artifactregistry.Repository(
    "repo",
    gcp.artifactregistry.RepositoryArgs(
        format="DOCKER",
        location="us-central1",
        repository_id=repo_id,
    ),
)

project = pulumi.Config("gcp").require("project")
image_tag = pulumi.Output.concat(
    repo.location,
    "-docker.pkg.dev/",
    project,
    "/",
    repo_id,
    "/my-first-gcp-cloudrun-app:latest",
)

image = docker.Image(
    "image",
    image_name=image_tag,
    build=docker.DockerBuild(
        context="docker",
        env={
            # Forces Docker to build an AMD image on ARM machines as Google
            # Cloud Run only supports AMD64 images:
            "DOCKER_DEFAULT_PLATFORM": "linux/amd64",
        },
    ),
)

service = gcp.cloudrun.Service(
    "temp-app",
    name="temp-app",
    location=repo.location,
    template=gcp.cloudrun.ServiceTemplateArgs(
        spec=gcp.cloudrun.ServiceTemplateSpecArgs(
            containers=[
                gcp.cloudrun.ServiceTemplateSpecContainerArgs(
                    image=image.base_image_name,
                    ports=[
                        gcp.cloudrun.ServiceTemplateSpecContainerPortArgs(
                            container_port=80,
                        ),
                    ],
                    resources=gcp.cloudrun.ServiceTemplateSpecContainerResourcesArgs(
                        requests={"memory": "64Mi", "cpu": "200m"},
                        limits={"memory": "265Mi", "cpu": "1000m"},
                    ),
                ),
            ],
            container_concurrency=80,
        ),
    ),
)

gcp.cloudrun.IamMember(
    "example",
    gcp.cloudrun.IamMemberArgs(
        location=service.location,
        project=service.project,
        service=service.name,
        role="roles/run.invoker",
        member="allUsers"
    )
)

pulumi.export("cloud_run_service_url", service.statuses[0].url)
```

</details>

## Step 6 &mdash; Run `pulumi up`

Now we've defined our infrastructure, we use the Pulumi CLI to create the resources.

Run the following command from your project directory:

```bash
pulumi up
```

Once Pulumi has finished creating your resources, we can check that our website is up and running:

```bash
curl $(pulumi stack output cloud_run_service_url)
```

## Step 7 &mdash; Cleaning up

Now that we've demonstrated creating a containerized application using Pulumi, it's time to tear down our infrastructure now that we no longer need it.

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
