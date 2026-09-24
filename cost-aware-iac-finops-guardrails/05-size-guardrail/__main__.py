"""Pulumi Policies pack: CostCenter tagging plus an instance-size guardrail.

Step 5 of the "Cost-aware infrastructure as code" workshop. Adds a second,
independent rule to step 3's tagging policy: no `aws.ec2.Instance` may
exceed `t3.large`. Run with
`pulumi preview --policy-pack ../05-size-guardrail` from
`04-tagged-instance/` after `pulumi config set instanceType t3.2xlarge` to
see the size violation, then reset the config to see both rules pass.

Pattern confirmed at
https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/
"""

from pulumi_policy import (
    EnforcementLevel,
    PolicyPack,
    ReportViolation,
    ResourceValidationArgs,
    ResourceValidationPolicy,
)

from rules import (
    ALLOWED_INSTANCE_TYPES,
    REQUIRED_TAG,
    instance_type_too_large,
    missing_required_tag,
)

EC2_INSTANCE_TYPE_TOKEN = "aws:ec2/instance:Instance"


def validate_cost_center_tag(args: ResourceValidationArgs, report_violation: ReportViolation) -> None:
    if args.resource_type != EC2_INSTANCE_TYPE_TOKEN:
        return
    tags = args.props.get("tags")
    if missing_required_tag(tags):
        report_violation(
            f"EC2 instance '{args.resource_name}' is missing the required "
            f"'{REQUIRED_TAG}' tag. Add it so the cost this instance drives "
            f"can be attributed to a budget."
        )


def validate_instance_size(args: ResourceValidationArgs, report_violation: ReportViolation) -> None:
    if args.resource_type != EC2_INSTANCE_TYPE_TOKEN:
        return
    instance_type = args.props.get("instanceType")
    if instance_type and instance_type_too_large(instance_type):
        allowed = ", ".join(sorted(ALLOWED_INSTANCE_TYPES))
        report_violation(
            f"EC2 instance '{args.resource_name}' requests instance type "
            f"'{instance_type}', which exceeds this workshop's size "
            f"guardrail. Allowed types: {allowed}."
        )


cost_center_tag_required = ResourceValidationPolicy(
    name="cost-center-tag-required",
    description="Requires a CostCenter tag on every EC2 instance for cost allocation.",
    enforcement_level=EnforcementLevel.MANDATORY,
    validate=validate_cost_center_tag,
)

instance_size_guardrail = ResourceValidationPolicy(
    name="instance-size-guardrail",
    description="Blocks EC2 instances larger than t3.large to cap per-instance spend.",
    enforcement_level=EnforcementLevel.MANDATORY,
    validate=validate_instance_size,
)

PolicyPack(
    name="cost-aware-iac-size-guardrail",
    policies=[cost_center_tag_required, instance_size_guardrail],
)
