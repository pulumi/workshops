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
