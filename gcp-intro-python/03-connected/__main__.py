"""Deploy a Flask app on Cloud Run that reads from a GCS bucket"""

import pulumi
import pulumi_gcp as gcp
import pulumi_docker as docker

project = gcp.config.project or pulumi.Config("gcp").require("project")

# ====== STORAGE ======
bucket = gcp.storage.Bucket("my-bucket", location="US")

with open("text.txt", "r") as f:
    content = f.read()

obj = gcp.storage.BucketObject("my-text-file",
    bucket=bucket.name,
    content=content
)

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

# ====== CONTAINER IMAGE ======
repo = gcp.artifactregistry.Repository("app-repo",
    format="DOCKER",
    repository_id="gcp-intro-python",
    location="us-central1",
)

image_name = pulumi.Output.concat(
    repo.location,
    "-docker.pkg.dev/",
    project,
    "/",
    repo.repository_id,
    "/app:latest"
)

image = docker.Image("app-image",
    image_name=image_name,
    build=docker.DockerBuildArgs(
        context=".",
        dockerfile="Dockerfile",
        platform="linux/amd64",
    ),
)

# ====== CLOUD RUN SERVICE ======
service = gcp.cloudrun.Service("flask-app",
    location="us-central1",
    template={
        "spec": {
            "service_account_name": sa.email,
            "containers": [{
                "image": image.repo_digest,
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
