"""Policy as code for the access-governance-as-code workshop demo.

The baseline stack (steps 1-4) passes every rule below: one narrowly-scoped
binding per resource, no project-level grant, no wildcard action or
resource. The rules only fire when someone (a human or an agent) widens a
binding past that scope - which is exactly what step 6
(`06-over-broad-binding/`) does on purpose, to give step 5's `pulumi preview`
and `pulumi up` something real to catch.

Python policy packs do not have a `validate_resource_of_type` helper the way
`@pulumi/policy`'s TypeScript API does (confirmed on
pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/, read
2026-09-24) - the brief's step 5 named that pattern from the TypeScript side
of the docs. The Python pattern shown on the same page is a single
`validate` function per `ResourceValidationPolicy` that checks
`args.resource_type` itself, which is what the two policies below do.

Source: pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/
(read 2026-09-24) - `EnforcementLevel`, `PolicyPack`, `ReportViolation`,
`ResourceValidationArgs`, `ResourceValidationPolicy` all come from
`pulumi_policy` (PyPI package confirmed live 2026-09-24, version 1.21.0;
this resolves the brief's open question about the Python package name).
"""

from pulumi_policy import (
    EnforcementLevel,
    PolicyPack,
    ReportViolation,
    ResourceValidationArgs,
    ResourceValidationPolicy,
)

from rules import (
    PROJECT_SCOPED_IAM_TYPES,
    RESOURCE_SCOPED_IAM_TYPES,
    aws_role_policy_violation,
    gcp_binding_violation,
)

GCP_IAM_TYPES = PROJECT_SCOPED_IAM_TYPES | RESOURCE_SCOPED_IAM_TYPES


def validate_gcp_binding_scope(
    args: ResourceValidationArgs, report_violation: ReportViolation
) -> None:
    if args.resource_type not in GCP_IAM_TYPES:
        return
    role = args.props.get("role")
    violation = gcp_binding_violation(args.resource_type, role)
    if violation:
        report_violation(violation)


def validate_aws_role_policy_scope(
    args: ResourceValidationArgs, report_violation: ReportViolation
) -> None:
    if args.resource_type != "aws:iam/rolePolicy:RolePolicy":
        return
    raw_policy = args.props.get("policy")
    if not raw_policy:
        return
    import json

    try:
        document = json.loads(raw_policy) if isinstance(raw_policy, str) else raw_policy
    except (TypeError, ValueError):
        return
    violation = aws_role_policy_violation(document)
    if violation:
        report_violation(violation)


gcp_binding_scope = ResourceValidationPolicy(
    name="gcp-iam-binding-stays-scoped",
    description=(
        "GCP IAM bindings in this workshop must be scoped to one resource "
        "with a narrow role: no gcp.projects.IAMMember/IAMBinding/IAMPolicy, "
        "and no roles/owner or roles/editor on a resource-scoped binding."
    ),
    enforcement_level=EnforcementLevel.MANDATORY,
    validate=validate_gcp_binding_scope,
)

aws_role_policy_scope = ResourceValidationPolicy(
    name="aws-role-policy-no-wildcard",
    description=(
        "AWS inline role policies must not grant a wildcard Action or "
        "Resource."
    ),
    enforcement_level=EnforcementLevel.MANDATORY,
    validate=validate_aws_role_policy_scope,
)

PolicyPack(
    name="access-governance-guardrails",
    policies=[
        gcp_binding_scope,
        aws_role_policy_scope,
    ],
)
