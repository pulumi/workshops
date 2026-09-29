"""Pulumi program for 02-foundry-platform.

Provisions the Azure AI Foundry management-plane resources that this
workshop's agent (03-agent) and tool connection (04-tool-connection) build on
top of: a resource group, an AIServices account (the Foundry resource kind),
a Foundry project as a child of that account, and a gpt-4o-class model
deployment on the account.

Resource property names below (`custom_sub_domain_name`,
`allow_project_management`, the Account/Project/Deployment constructor
shapes) come from research read 2026-09-29 and were confirmed against the
installed `pulumi-azure-native==3.28.0` package: `pulumi preview` (run
2026-09-29, no live Azure credentials) constructed every resource here
without a Python `TypeError` for an unexpected keyword argument, which is
what a bad property name on this SDK's strictly-typed constructors raises
immediately, before any network call. Preview then failed on `az`
executable not found, which is the credential-resolution step that comes
after construction — see this folder's AGENTS.md and the pull request
description for the exact command and output.
"""

import pulumi
import pulumi_azure_native as azure_native

DEFAULT_LOCATION = "eastus2"
DEFAULT_ACCOUNT_SKU = "S0"
DEFAULT_DEPLOYMENT_SKU = "GlobalStandard"
DEFAULT_DEPLOYMENT_CAPACITY = 10
MODEL_FORMAT = "OpenAI"
MODEL_NAME = "gpt-4o"
MODEL_VERSION = "2024-11-20"


def build_project_endpoint(account_name_value: str, project_name_value: str) -> str:
    """Build the Foundry data-plane project endpoint URL.

    This is a different host than the account's management-plane
    `endpoint` output, and the provider does not hand it back as a single
    field, so it is assembled here from the resolved account and project
    names.
    """
    return (
        f"https://{account_name_value}.services.ai.azure.com"
        f"/api/projects/{project_name_value}"
    )


config = pulumi.Config()
stack_name = pulumi.get_stack()

# `azure_native.config.location` reflects `pulumi config set
# azure-native:location <region>`; fall back to a region where Azure AI
# Foundry + gpt-4o-class deployments are commonly available if that provider
# config is unset. Never hardcode the location on individual resources.
location = azure_native.config.location or DEFAULT_LOCATION

# Cognitive Services / Foundry account names become part of a DNS name
# (`<account_name>.services.ai.azure.com`), so they must be globally unique.
# Override with `pulumi config set accountName <your-unique-name>` if the
# default below collides with an existing account.
account_name = config.get("accountName") or f"itops-foundry-{stack_name}"
project_name = config.get("projectName") or "itops-agent-project"
deployment_name = config.get("deploymentName") or "gpt-4o"

resource_group = azure_native.resources.ResourceGroup(
    "foundry-rg",
    location=location,
)

account = azure_native.cognitiveservices.Account(
    "foundry-account",
    resource_group_name=resource_group.name,
    account_name=account_name,
    location=location,
    kind="AIServices",
    sku=azure_native.cognitiveservices.SkuArgs(name=DEFAULT_ACCOUNT_SKU),
    identity=azure_native.cognitiveservices.IdentityArgs(type="SystemAssigned"),
    properties=azure_native.cognitiveservices.AccountPropertiesArgs(
        custom_sub_domain_name=account_name,
        allow_project_management=True,
        public_network_access="Enabled",
    ),
    opts=pulumi.ResourceOptions(parent=resource_group),
)

project = azure_native.cognitiveservices.Project(
    "foundry-project",
    resource_group_name=resource_group.name,
    account_name=account.name,
    project_name=project_name,
    location=location,
    identity=azure_native.cognitiveservices.IdentityArgs(type="SystemAssigned"),
    properties=azure_native.cognitiveservices.ProjectPropertiesArgs(
        display_name="IT Ops Managed Agent",
        description="Workshop project for the IT-ops managed agent demo.",
    ),
    opts=pulumi.ResourceOptions(parent=account, depends_on=[account]),
)

deployment = azure_native.cognitiveservices.Deployment(
    "foundry-deployment",
    resource_group_name=resource_group.name,
    account_name=account.name,
    deployment_name=deployment_name,
    sku=azure_native.cognitiveservices.SkuArgs(
        name=DEFAULT_DEPLOYMENT_SKU,
        capacity=DEFAULT_DEPLOYMENT_CAPACITY,
    ),
    properties=azure_native.cognitiveservices.DeploymentPropertiesArgs(
        model=azure_native.cognitiveservices.DeploymentModelArgs(
            format=MODEL_FORMAT,
            name=MODEL_NAME,
            version=MODEL_VERSION,
        ),
        version_upgrade_option="OnceNewDefaultVersionAvailable",
    ),
    opts=pulumi.ResourceOptions(parent=account, depends_on=[account]),
)

# Never create a resource inside .apply(); this only formats a string from
# already-resolved Outputs, per pulumi-best-practices.
project_endpoint = pulumi.Output.all(account.name, project.name).apply(
    lambda args: build_project_endpoint(args[0], args[1])
)

pulumi.export("resource_group_name", resource_group.name)
pulumi.export("account_name", account.name)
pulumi.export("account_endpoint", account.endpoint)
pulumi.export("project_name", project.name)
pulumi.export("project_endpoint", project_endpoint)
pulumi.export("deployment_name", deployment.name)
