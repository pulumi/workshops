"""Run with: python3 policy/test_rules.py"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from rules import (
    check_lambda_cost,
    check_no_iam,
    check_public_permission,
    check_required_tags,
    check_table_present,
    check_table_protection,
    is_protected_stack,
    stack_from_urn,
)

GOOD_TABLE = {"deletionProtectionEnabled": True, "pointInTimeRecovery": {"enabled": True}}
GOOD_TAGS = {"app": "feedback-api", "environment": "dev", "managed-by": "pulumi"}

# 1. Protect data (prod only)
PROD_URN = "urn:pulumi:prod::feedback-api::aws:dynamodb/table:Table::feedback-prod-entries"
DEV_URN = "urn:pulumi:dev::feedback-api::aws:dynamodb/table:Table::feedback-dev-entries"
assert stack_from_urn(PROD_URN) == "prod"
assert is_protected_stack(PROD_URN)
assert not is_protected_stack(DEV_URN)
assert not is_protected_stack("not-a-urn")
assert check_table_protection(GOOD_TABLE, True) == []
assert len(check_table_protection(GOOD_TABLE, False)) == 1
assert len(check_table_protection({**GOOD_TABLE, "deletionProtectionEnabled": False}, True)) == 1
assert len(check_table_protection({**GOOD_TABLE, "pointInTimeRecovery": {"enabled": False}}, True)) == 1
assert len(check_table_protection({}, False)) == 3
assert check_table_present(["aws:lambda/function:Function", "aws:dynamodb/table:Table"]) == []
assert check_table_present(["aws:lambda/function:Function"]) != []

# 2. No new identities
assert check_no_iam("aws:iam/role:Role") != []
assert check_no_iam("aws:iam/rolePolicyAttachment:RolePolicyAttachment") != []
assert check_no_iam("aws:lambda/function:Function") == []

# 3. No new exposure
assert check_public_permission({"principal": "*", "action": "lambda:InvokeFunctionUrl", "functionUrlAuthType": "NONE"}) == []
assert check_public_permission({"principal": "*", "action": "lambda:InvokeFunction", "invokedViaFunctionUrl": True}) == []
assert check_public_permission({"principal": "*", "action": "lambda:InvokeFunction"}) != []
assert check_public_permission({"principal": "s3.amazonaws.com", "action": "lambda:InvokeFunction"}) == []

# 4. Cost
assert check_lambda_cost({"memorySize": 256, "timeout": 10}) == []
assert check_lambda_cost({}) == []
assert len(check_lambda_cost({"memorySize": 3008, "timeout": 60})) == 2

# 5. Ownership
assert check_required_tags({"tags": GOOD_TAGS}) == []
assert "managed-by" in check_required_tags({"tags": {"app": "x", "environment": "dev"}})[0]

print("ok: policy rules")
