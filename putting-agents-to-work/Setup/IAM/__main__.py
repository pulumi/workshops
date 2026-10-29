"""OIDC trust and IAM roles for the agent workflow.

Creates three roles, each assumable only from one Pulumi ESC environment:

    infra-agents/read         -> infra-agent-read         (read-only)
    infra-agents/dev-deploy   -> infra-agent-dev-deploy   (writes infra-dev-*)
    infra-agents/prod-deploy  -> infra-agent-prod-deploy  (writes infra-prod-*)

A person deploys this program with their own admin credentials. Agents never
change it (see AGENTS.md and .claude/settings.json).

Trust policy format follows Pulumi's "Configuring OpenID Connect for AWS"
guide: issuer https://api.pulumi.com/oidc, audience `aws:<org>`, and default
subject `pulumi:environments:org:<org>:env:<project>/<environment>`.
"""

import json

import pulumi
import pulumi_aws as aws

cfg = pulumi.Config()
org = cfg.require("pulumiOrg")
esc_project = cfg.get("escProject") or "infra-agents"
existing_provider_arn = cfg.get("existingOidcProviderArn") or ""
STACKS = ("dev", "prod")

account_id = aws.get_caller_identity().account_id
OIDC_HOST = "api.pulumi.com/oidc"
TAGS = {"app": "feedback-api", "managed-by": "pulumi"}

# --- Identity provider ------------------------------------------------------
if existing_provider_arn:
    provider_arn = pulumi.Output.from_input(existing_provider_arn)
else:
    provider = aws.iam.OpenIdConnectProvider(
        "pulumi-oidc",
        url=f"https://{OIDC_HOST}",
        client_id_lists=[f"aws:{org}"],
        tags=TAGS,
    )
    provider_arn = provider.arn
    

def trust_policy(env_name: str) -> pulumi.Output[str]:
    """Only tokens minted by exactly this ESC environment can assume the role."""
    return provider_arn.apply(
        lambda arn: json.dumps(
            {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": {"Federated": arn},
                        "Action": "sts:AssumeRoleWithWebIdentity",
                        "Condition": {
                            "StringEquals": {
                                f"{OIDC_HOST}:aud": f"aws:{org}",
                                f"{OIDC_HOST}:sub": f"pulumi:environments:org:{org}:env:{esc_project}/{env_name}",
                            }
                        },
                    }
                ],
            }
        )
    )


def arns(stack: str) -> dict[str, list[str] | str]:
    p = f"feedback-{stack}-"
    return {
        "tables": [f"arn:aws:dynamodb:*:{account_id}:table/{p}*", f"arn:aws:dynamodb:*:{account_id}:table/{p}*/*"],
        "function": f"arn:aws:lambda:*:{account_id}:function:{p}*",
        "logs": [
            f"arn:aws:logs:*:{account_id}:log-group:/aws/lambda/{p}*",
            f"arn:aws:logs:*:{account_id}:log-group:/aws/lambda/{p}*:*",
        ],
        "exec_role": f"arn:aws:iam::{account_id}:role/{p}exec",
    }


# --- Lambda execution roles (one per stack) ---------------------------------------
exec_roles = {}
for stack in STACKS:
    a = arns(stack)
    role = aws.iam.Role(
        f"feedback-{stack}-exec",
        name=f"feedback-{stack}-exec",
        assume_role_policy=json.dumps({
            "Version": "2012-10-17",
            "Statement": [{"Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}],
        }),
        tags={**TAGS, "environment": stack},
    )
    aws.iam.RolePolicy(
        f"feedback-{stack}-exec-access",
        role=role.id,
        policy=json.dumps({
            "Version": "2012-10-17",
            "Statement": [
                {"Effect": "Allow", "Action": ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:Query"], "Resource": a["tables"]},
                {"Effect": "Allow", "Action": ["logs:CreateLogStream", "logs:PutLogEvents"], "Resource": a["logs"]},
            ],
        }),
    )
    exec_roles[stack] = role

# --- Read role ----------------------------------------------------------------------
# ReadOnlyAccess covers previews and log reads. Note it can also read data, such
# as DynamoDB items; for production, swap in a narrower custom policy.
read_role = aws.iam.Role(
    "feedback-agent-read",
    name="feedback-agent-read",
    assume_role_policy=trust_policy("read-only"),
    max_session_duration=3600,
    tags={**TAGS, "purpose": "agent-read"},
)
aws.iam.RolePolicyAttachment(
    "feedback-agent-read-readonly", role=read_role.name, policy_arn="arn:aws:iam::aws:policy/ReadOnlyAccess"
)
aws.iam.RolePolicy(
    "feedback-agent-read-smoke-test",
    role=read_role.id,
    policy=json.dumps({
        "Version": "2012-10-17",
        "Statement": [{
            # Only used when publicUrl=false (AWS_IAM auth) so the smoke test can call the URL.
            "Effect": "Allow",
            "Action": ["lambda:InvokeFunctionUrl", "lambda:InvokeFunction"],
            "Resource": [arns(s)["function"] for s in STACKS],
        }],
    }),
)


# --- Deploy roles (one per stack) ---------------------------------------------------
deploy_roles = {}
for stack in STACKS:
    a = arns(stack)
    role = aws.iam.Role(
        f"feedback-agent-{stack}-deploy",
        name=f"feedback-agent-{stack}-deploy",
        assume_role_policy=trust_policy(f"{stack}-deploy"),
        max_session_duration=3600,
        tags={**TAGS, "purpose": f"feedback-agent-{stack}-deploy"},
    )
    # Reads everywhere, so `pulumi up` can refresh and diff. Same data-read caveat as above.
    aws.iam.RolePolicyAttachment(
        f"feedback-agent-{stack}-deploy-readonly", role=role.name, policy_arn="arn:aws:iam::aws:policy/ReadOnlyAccess"
    )
    aws.iam.RolePolicy(
        f"feedback-agent-{stack}-deploy-write",
        role=role.id,
        policy=json.dumps({
            "Version": "2012-10-17",
            "Statement": [
                {"Sid": "ThisStacksTables", "Effect": "Allow", "Action": "dynamodb:*", "Resource": a["tables"]},
                {"Sid": "ThisStacksFunction", "Effect": "Allow", "Action": "lambda:*", "Resource": a["function"]},
                {"Sid": "ThisStacksLogs", "Effect": "Allow", "Action": "logs:*", "Resource": a["logs"]},
                {
                    # The only IAM write this role has: hand this stack's execution
                    # role to Lambda. It can't create, change, or pass any other role.
                    "Sid": "UseThisStacksExecRole",
                    "Effect": "Allow",
                    "Action": "iam:PassRole",
                    "Resource": a["exec_role"],
                    "Condition": {"StringEquals": {"iam:PassedToService": "lambda.amazonaws.com"}},
                },
                {
                    # Deleting data is never an agent's job. An explicit Deny wins over
                    # every Allow, so this holds through Pulumi, the AWS CLI, or any SDK.
                    # Tearing down a table is done by a person with admin credentials.
                    "Sid": "NeverDeleteTables",
                    "Effect": "Deny",
                    "Action": ["dynamodb:DeleteTable", "dynamodb:DeleteBackup"],
                    "Resource": "arn:aws:dynamodb:*:*:table/feedback-prod-*",                    
                },
            ],
        }),
    )
    deploy_roles[stack] = role

pulumi.export("oidc_provider_arn", provider_arn)
pulumi.export("read_role_arn", read_role.arn)
for stack in STACKS:
    pulumi.export(f"{stack}_deploy_role_arn", deploy_roles[stack].arn)
    pulumi.export(f"{stack}_exec_role_arn", exec_roles[stack].arn)