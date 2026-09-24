"""Pure validation logic for the tagging and instance-size guardrail policies.

Kept separate from __main__.py so both rules' passing and failing cases can
be exercised offline in test_policy.py, without needing pulumi_policy on the
import path. This folder is self-contained (each numbered folder in this
workshop is its own Pulumi/policy project), so the tagging rule is
duplicated from 03-tagging-policy/rules.py rather than shared across
folders.
"""

REQUIRED_TAG = "CostCenter"

# Everything up to t3.large is allowed; anything not in this set is blocked.
# A set rather than an ordering keeps the rule (and its test) simple: it
# does not need to reason about the AWS instance-type naming scheme.
ALLOWED_INSTANCE_TYPES = frozenset(
    {"t3.nano", "t3.micro", "t3.small", "t3.medium", "t3.large"}
)


def missing_required_tag(tags: dict | None) -> bool:
    """Return True when `tags` does not carry the required CostCenter tag."""
    tags = tags or {}
    return REQUIRED_TAG not in tags


def instance_type_too_large(instance_type: str) -> bool:
    """Return True when `instance_type` is not on the allowed size list."""
    return instance_type not in ALLOWED_INSTANCE_TYPES
