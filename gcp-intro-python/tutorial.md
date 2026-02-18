# GCP Python Workshop with Pulumi

This workshop guides you through deploying infrastructure on Google Cloud using Pulumi and Python.
You'll learn how to:

- Create and manage GCS buckets
- Deploy a Flask application as a Cloud Run service
- Build and push Docker images to Artifact Registry

**Estimated time**: 45 minutes

## Prerequisites

Before starting this workshop, ensure you have:

```text
- Pulumi CLI installed
- uv installed (Python package manager)
- gcloud CLI installed and authenticated
- Docker installed and running
- Python 3.10+ installed
- GCP account with a project and billing enabled
- gcloud auth application-default login completed
- Docker configured for Artifact Registry
```

## Part 1: Storage Bucket

### Create a New Pulumi Project

First, let's create a new Pulumi project using the GCP Python template:

```bash
mkdir gcp-intro-python && cd gcp-intro-python
pulumi new gcp-python
# Enter project details when prompted
# Name: gcp-intro-python
# Description: Infrastructure as Code on GCP with Python
# Stack: dev
# Toolchain: uv
```

This creates a basic Pulumi project with a GCS bucket already set up.

### Examine the Project Structure

Take a moment to look at the files created:

- `__main__.py`: The main Pulumi program
- `Pulumi.yaml`: Project configuration
- `pyproject.toml`: Python dependencies

### Set Your GCP Project

```bash
pulumi config set gcp:project pulumi-gcp-workshop
```

### Create a Text File

Let's create a text file that we'll upload to our bucket:

```bash
echo 'Hello from Pulumi on GCP!' > text.txt
```

### Update the Pulumi Program

Replace the contents of `__main__.py` with:

```python
"""A Google Cloud Python Pulumi program"""

import pulumi
from pulumi_gcp import storage

# Create a GCP resource (Storage Bucket)
bucket = storage.Bucket('my-bucket', location="US")

# Read a local file — because this is just Python!
with open("text.txt", "r") as f:
    content = f.read()

# Upload the file to our bucket
obj = storage.BucketObject("my-text-file",
    bucket=bucket.name,
    content=content
)

# Export the bucket name and a direct URL to the object
pulumi.export('bucket_name', bucket.url)
pulumi.export('object_url', pulumi.Output.concat(bucket.url, "/", obj.name))
```

Notice how we're just using Python's built-in `open()` to read a file. This is the power of using a real programming language for infrastructure — you can use all the tools you already know.

### Deploy the Stack

```bash
pulumi up
```

Review the changes and confirm the deployment.

### Verify

```bash
# Print the bucket URL
pulumi stack output bucket_name

# Download and display the file content
gsutil cp $(pulumi stack output object_url) -
```

You should see "Hello from Pulumi on GCP!" in the output.

### A Note on Auto-Naming

You might have noticed the bucket and object names have random suffixes like `my-bucket-adecc6a`. Pulumi **auto-names** resources by default to avoid naming collisions — this lets you create multiple stacks (dev, staging, prod) from the same code without conflicts.

But sometimes you want predictable names. Pulumi lets you configure auto-naming behavior at the project level. Add this to your `Pulumi.yaml`:

```yaml
config:
  pulumi:autonaming:
    value:
      providers:
        gcp:
          resources:
            "gcp:storage/bucketObject:BucketObject":
              mode: verbatim
```

This tells Pulumi to use exact names for bucket objects only, while keeping auto-naming for resources like buckets (where GCS requires global uniqueness). Now we can simplify our exports — update `__main__.py`:

```python
# Export the bucket name
pulumi.export('bucket_name', bucket.url)
```

And redeploy:

```bash
pulumi up
```

You'll see Pulumi replace the old object with one named exactly `my-text-file` — no random suffix. Now you can access the object with a predictable path:

```bash
gsutil cp $(pulumi stack output bucket_name)/my-text-file -
```

> **Tip**: `verbatim` mode is great for workshops and personal projects. In production, auto-naming (the default) prevents collisions when multiple stacks share the same project. You can also use custom patterns like `${project}-${stack}-${name}` for organizational naming standards.

## Part 2: Flask App on Cloud Run

Now let's build something more interesting — a Flask web application deployed to Cloud Run via a Docker container.

### Create the Flask Application

Create `app.py`:

```python
import os
from flask import Flask, send_file

app = Flask(__name__)

@app.route("/")
def serve_file():
    return send_file("text.txt", mimetype="text/plain")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
```

### Create the Dockerfile

Create `Dockerfile`:

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements-app.txt .
RUN pip install -r requirements-app.txt

COPY app.py .
COPY text.txt .

EXPOSE 8080

CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
```

Notice how much simpler this is than the AWS Lambda version — no special base image, no Lambda handler adapter. It's just a regular Python app that Cloud Run serves directly.

### Add App Dependencies

Create `requirements-app.txt` for the Docker container (this is separate from `pyproject.toml`, which manages the Pulumi dependencies):

```text
flask
gunicorn
```

### Add the Docker Provider

Install the Pulumi Docker provider:

```bash
uv add pulumi-docker-build
```

### Configure Docker for Artifact Registry

```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### Update the Pulumi Program for Cloud Run

Replace `__main__.py` with:

```python
"""Deploy a Flask app to Google Cloud Run using Pulumi"""

import pulumi
import pulumi_gcp as gcp
import pulumi_docker_build as docker_build

project = gcp.config.project or pulumi.Config("gcp").require("project")

# ====== STORAGE (from part 1) ======
bucket = gcp.storage.Bucket("my-bucket", location="US")

with open("text.txt", "r") as f:
    content = f.read()

obj = gcp.storage.BucketObject("my-text-file",
    bucket=bucket.name,
    content=content
)

# ====== CONTAINER IMAGE ======
# Create an Artifact Registry repository to store the Docker image
repo = gcp.artifactregistry.Repository("app-repo",
    format="DOCKER",
    repository_id="gcp-intro-python",
    location="us-central1",
)

# Build and push the Docker image to Artifact Registry
image_name = pulumi.Output.concat(
    repo.location,
    "-docker.pkg.dev/",
    project,
    "/",
    repo.repository_id,
    "/app"
)

image = docker_build.Image("app-image",
    tags=[pulumi.Output.concat(image_name, ":latest")],
    context=docker_build.BuildContextArgs(location="."),
    dockerfile=docker_build.DockerfileArgs(location="./Dockerfile"),
    platforms=[docker_build.Platform.LINUX_AMD64],
    push=True,
)

# ====== CLOUD RUN SERVICE ======
service = gcp.cloudrun.Service("flask-app",
    location="us-central1",
    template={
        "spec": {
            "containers": [{
                "image": pulumi.Output.concat(image_name, "@", image.digest),
                "ports": [{"container_port": 8080}],
                "resources": {
                    "limits": {"memory": "512Mi", "cpu": "1"},
                },
            }],
        },
    },
)

# Allow unauthenticated access
gcp.cloudrun.IamMember("public-access",
    service=service.name,
    location=service.location,
    role="roles/run.invoker",
    member="allUsers",
)

# ====== OUTPUTS ======
pulumi.export("bucket_name", bucket.url)
pulumi.export("service_url", service.statuses[0].url)
```

Compare this to the AWS version: no Lambda role, no IAM policy, no API Gateway, no integration, no route, no stage, no Lambda permission. Cloud Run gives you a URL for free.

### Deploy to Cloud Run

```bash
pulumi up
```

This will:

1. Create the Artifact Registry repository
2. Build the Docker image locally
3. Push the image to Artifact Registry
4. Create the Cloud Run service
5. Set up public access

### Test It

```bash
curl $(pulumi stack output service_url)
```

You should see "Hello from Pulumi on GCP!" served by your Flask app running on Cloud Run.

### Add a New Route (Live Demo)

Here's the fun part — add a new route to `app.py`:

```python
@app.route("/health")
def health():
    return {"status": "ok"}
```

Now redeploy:

```bash
pulumi up
```

The image rebuilds, Cloud Run updates, and your new route is live. No infrastructure changes needed — it's the same container, same service, just new code.

## Part 3: Connect Cloud Run to the Bucket

Right now the Flask app serves a file baked into the Docker image. Let's make it read from the GCS bucket instead — the way a real app would. This means we need to set up IAM so the container has permission to access the bucket.

### Create a Service Account

First, we need a dedicated identity for the Cloud Run service. Add this to `__main__.py` after the storage section:

```python
# ====== SERVICE ACCOUNT ======
# Create a dedicated service account for Cloud Run
sa = gcp.serviceaccount.Account("cloud-run-sa",
    account_id="cloud-run-app",
    display_name="Cloud Run App Service Account",
)

# Grant it read access to our bucket
gcp.storage.BucketIAMMember("bucket-reader",
    bucket=bucket.name,
    role="roles/storage.objectViewer",
    member=pulumi.Output.concat("serviceAccount:", sa.email),
)
```

### Update the Cloud Run Service

Update the Cloud Run service to use the service account and pass the bucket details as environment variables:

```python
# ====== CLOUD RUN SERVICE ======
service = gcp.cloudrun.Service("flask-app",
    location="us-central1",
    template={
        "spec": {
            "service_account_name": sa.email,
            "containers": [{
                "image": pulumi.Output.concat(image_name, "@", image.digest),
                "ports": [{"container_port": 8080}],
                "resources": {
                    "limits": {"memory": "512Mi", "cpu": "1"},
                },
                "envs": [
                    {"name": "BUCKET_NAME", "value": bucket.name},
                    {"name": "OBJECT_NAME", "value": obj.name},
                ],
            }],
        },
    },
)
```

Notice how `bucket.name` and `obj.name` are Pulumi outputs — Pulumi resolves them at deploy time and passes the actual values as environment variables. The container doesn't need to know anything about Pulumi.

### Update the Flask App

Replace `app.py` to read from GCS instead of a local file:

```python
import os
from flask import Flask
from google.cloud import storage

app = Flask(__name__)

@app.route("/")
def serve_file():
    bucket_name = os.environ["BUCKET_NAME"]
    object_name = os.environ["OBJECT_NAME"]

    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(object_name)

    return blob.download_as_text(), 200, {"Content-Type": "text/plain"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
```

### Update the Docker Container

Add `google-cloud-storage` to `requirements-app.txt`:

```text
flask
gunicorn
google-cloud-storage
```

And remove the local `text.txt` from the Dockerfile — the app reads from GCS now:

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements-app.txt .
RUN pip install -r requirements-app.txt

COPY app.py .

EXPOSE 8080

CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
```

### Deploy the Connected App

```bash
pulumi up
```

### Verify the Connection

```bash
curl $(pulumi stack output service_url)
```

Same output — but now it's coming from the GCS bucket, not a file baked into the container image. To prove it, change `text.txt` and redeploy:

```bash
echo 'Updated content from GCS!' > text.txt
pulumi up
```

The container image doesn't change this time — only the bucket object updates. Hit the URL again and you'll see the new content.

## Cleanup

When you're done, tear everything down:

```bash
pulumi destroy
```

## Key Takeaways

- **Same language, same tools**: Your app code and infrastructure code are both Python
- **Cloud Run is simpler than Lambda**: No API Gateway, no special handlers, just a container with a URL
- **IAM ties it together**: Service accounts and IAM bindings connect services securely
- **Pulumi diffs state**: It only changes what's different, just like `git diff`
- **Code is easy to abstract**: Wrap common patterns into functions or packages for your team
