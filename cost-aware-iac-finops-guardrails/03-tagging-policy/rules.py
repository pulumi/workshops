"""Pure validation logic for the CostCenter tagging policy.

Kept separate from __main__.py so the passing and failing cases can be
exercised offline in test_policy.py, without needing pulumi_policy (or a
live Pulumi program) on the import path.
"""

REQUIRED_TAG = "CostCenter"


def missing_required_tag(tags: dict | None) -> bool:
    """Return True when `tags` does not carry the required CostCenter tag."""
    tags = tags or {}
    return REQUIRED_TAG not in tags
