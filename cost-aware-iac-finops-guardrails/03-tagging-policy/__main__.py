"""Pulumi Policies pack: require a CostCenter tag on every EC2 instance.

Step 3 of the "Cost-aware infrastructure as code" workshop. Run with
`pulumi preview --policy-pack ../03-tagging-policy` from
`02-untagged-instance/` to see the violation, and from `04-tagged-instance/`
to see it pass.

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

from rules import REQUIRED_TAG, missing_required_tag

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


cost_center_tag_required = ResourceValidationPolicy(
    name="cost-center-tag-required",
    description="Requires a CostCenter tag on every EC2 instance for cost allocation.",
    enforcement_level=EnforcementLevel.MANDATORY,
    validate=validate_cost_center_tag,
)

PolicyPack(
    name="cost-aware-iac-tagging-policy",
    policies=[cost_center_tag_required],
)
