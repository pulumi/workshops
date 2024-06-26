import pulumi
import pulumi_gcp as gcp

gcp_config = pulumi.Config("gcp")
gcp_project = gcp_config.require("project")
region = "europe-west2"
function_code = pulumi.FileArchive("src/")
project_var = gcp.projects.get_project(filter=f"name:{gcp_project}")
                                       
cloud_function_bucket = gcp.storage.Bucket("cloudFunctionBucket",
    name=f"cloud-function-{project_var.projects[0].project_id}",
    location=region,
    project=project_var.projects[0].project_id,
    force_destroy=True,
    uniform_bucket_level_access=True)
input_bucket = gcp.storage.Bucket("inputBucket",
    name=f"input-{project_var.projects[0].project_id}",
    location=region,
    project=project_var.projects[0].project_id,
    force_destroy=True,
    uniform_bucket_level_access=True)
function_source_zip = gcp.storage.BucketObject("functionSourceZip",
    name="src-code.zip",
    bucket=cloud_function_bucket.name,
    source=function_code,
    content_type="application/zip",
    opts = pulumi.ResourceOptions(depends_on=[cloud_function_bucket]))
account = gcp.serviceaccount.Account("account",
    account_id="pulumi-workshop",
    project=project_var.projects[0].project_id,
    display_name="Test Service Account")
invoking = gcp.projects.IAMMember("invoking",
    project=project_var.projects[0].project_id,
    role="roles/run.invoker",
    member=account.email.apply(lambda email: f"serviceAccount:{email}"),
    opts = pulumi.ResourceOptions(depends_on=[account]))
event_receiving = gcp.projects.IAMMember("eventReceiving",
    project=project_var.projects[0].project_id,
    role="roles/eventarc.eventReceiver",
    member=account.email.apply(lambda email: f"serviceAccount:{email}"),
    opts = pulumi.ResourceOptions(depends_on=[account]))
cloud_function = gcp.cloudfunctionsv2.Function("cloudFunction",
    name="cloud-function-trigger-using-pulumi-gen2",
    location=region,
    description="Cloud function gen2 trigger using Pulumi",
    project=project_var.projects[0].project_id,
    build_config=gcp.cloudfunctionsv2.FunctionBuildConfigArgs(
        runtime="python39",
        entry_point="fileUpload",
        environment_variables={
            "BUILD_CONFIG_TEST": "build_test",
        },
        source=gcp.cloudfunctionsv2.FunctionBuildConfigSourceArgs(
            storage_source=gcp.cloudfunctionsv2.FunctionBuildConfigSourceStorageSourceArgs(
                bucket=cloud_function_bucket.name,
                object=function_source_zip.name,
            ),
        ),
    ),
    service_config=gcp.cloudfunctionsv2.FunctionServiceConfigArgs(
        max_instance_count=3,
        min_instance_count=1,
        available_memory="256M",
        timeout_seconds=60,
        environment_variables={
            "SERVICE_CONFIG_TEST": "config_test",
        },
        ingress_settings="ALLOW_INTERNAL_ONLY",
        all_traffic_on_latest_revision=True,
        service_account_email=account.email,
    ),
    event_trigger=gcp.cloudfunctionsv2.FunctionEventTriggerArgs(
        trigger_region=region,
        event_type="google.cloud.storage.object.v1.finalized",
        retry_policy="RETRY_POLICY_RETRY",
        service_account_email=account.email,
        event_filters=[gcp.cloudfunctionsv2.FunctionEventTriggerEventFilterArgs(
            attribute="bucket",
            value=input_bucket.name,
        )],
    ),
    opts = pulumi.ResourceOptions(depends_on=[
            input_bucket,
            function_source_zip,
            account,
            invoking,
            event_receiving,
        ]))
pulumi.export("function_url", cloud_function.url)
