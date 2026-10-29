"""feedback-api: Lambda function URL -> Lambda -> DynamoDB.

    POST /           {"message": "..."}  -> stores an entry, returns {"id": ...}
    GET  /?id=<id>                       -> returns that entry
    GET  /                               -> service info (stack, version)

Conventions (AGENTS.md): names from naming.name(), tags from naming.tags(),
stack-specific values from config. The execution role is created by iam/ and
passed in as config; this program never creates IAM roles.
"""

import pulumi
import pulumi_aws as aws

from feedback_api import naming

cfg = pulumi.Config()
exec_role_arn = cfg.require("execRoleArn")
app_version = cfg.get("appVersion") or "1.0.0"
memory_size = cfg.get_int("memorySize") or 256
timeout = cfg.get_int("timeout") or 10
log_retention_days = cfg.get_int("logRetentionDays") or 7
public_url = cfg.get_bool("publicUrl")
public_url = True if public_url is None else public_url
protect_data = cfg.get_bool("protectData") or False

# --- Storage -------------------------------------------------------------------
# Changing hash_key (or the table's name) REPLACES the table, which deletes every
# stored entry. AGENTS.md requires agents to stop and ask when a preview shows that.
table = aws.dynamodb.Table(
    naming.name("entries"),
    billing_mode="PAY_PER_REQUEST",
    hash_key="id",
    attributes=[{"name": "id", "type": "S"}],
    point_in_time_recovery={"enabled": True},
    deletion_protection_enabled=protect_data,
    tags=naming.tags(),
    opts=pulumi.ResourceOptions(protect=protect_data),
)

# --- Logs ----------------------------------------------------------------------
function_name = naming.name("fn")
log_group = aws.cloudwatch.LogGroup(
    naming.name("logs"),
    name=f"/aws/lambda/{function_name}",
    retention_in_days=log_retention_days,
    tags=naming.tags(),
)

# --- Function ------------------------------------------------------------------
fn = aws.lambda_.Function(
    function_name,
    name=function_name,
    role=exec_role_arn,
    runtime=aws.lambda_.Runtime.PYTHON3D12,
    handler="handler.handler",
    code=pulumi.FileArchive("./app"),
    memory_size=memory_size,
    timeout=timeout,
    environment={
        "variables": {
            "TABLE_NAME": table.name,
            "APP_VERSION": app_version,
            "STACK": naming.stack(),
        }
    },
    logging_config={"log_format": "Text", "log_group": log_group.name},
    tags=naming.tags(),
)

# --- Function URL --------------------------------------------------------------
auth_type = "NONE" if public_url else "AWS_IAM"
url = aws.lambda_.FunctionUrl(
    naming.name("url"),
    function_name=fn.name,
    authorization_type=auth_type,
)

if public_url:
    # A public function URL needs both permissions: InvokeFunctionUrl for the
    # URL, and InvokeFunction restricted to calls that arrive via the URL.
    aws.lambda_.Permission(
        naming.name("url-public"),
        function=fn.name,
        action="lambda:InvokeFunctionUrl",
        principal="*",
        function_url_auth_type="NONE",
    )
    aws.lambda_.Permission(
        naming.name("url-invoke"),
        function=fn.name,
        action="lambda:InvokeFunction",
        principal="*",
        invoked_via_function_url=True,
    )

pulumi.export("url", url.function_url)
pulumi.export("auth_type", auth_type)
pulumi.export("function_name", fn.name)
pulumi.export("table_name", table.name)
pulumi.export("log_group_name", log_group.name)
