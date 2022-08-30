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
