"""Unit tests for the policy pack's rule functions, following the pytest
pattern shown on pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/
(read 2026-09-24): call the plain function directly with constructed
arguments rather than running the pack through Pulumi Cloud.

Every resource type token below was confirmed against the installed
pulumi-gcp==9.36.1 / pulumi-aws==7.48.0 SDKs (see rules.py's module
docstring), not guessed from the API-docs URL casing.
"""

import json

from rules import (
    aws_role_policy_violation,
    gcp_binding_violation,
)

DATASET_IAM_MEMBER = "gcp:bigquery/datasetIamMember:DatasetIamMember"
SECRET_IAM_MEMBER = "gcp:secretmanager/secretIamMember:SecretIamMember"
SERVICE_ACCOUNT_IAM_MEMBER = "gcp:serviceAccount/iAMMember:IAMMember"
PROJECT_IAM_MEMBER = "gcp:projects/iAMMember:IAMMember"
PROJECT_IAM_BINDING = "gcp:projects/iAMBinding:IAMBinding"


class TestGcpBindingViolation:
    def test_dataset_viewer_binding_passes(self):
        """Step 1's actual binding: dataViewer on DatasetIamMember."""
        assert gcp_binding_violation(DATASET_IAM_MEMBER, "roles/bigquery.dataViewer") is None

    def test_secret_accessor_binding_passes(self):
        """Step 2's actual binding: secretAccessor on SecretIamMember."""
        assert gcp_binding_violation(SECRET_IAM_MEMBER, "roles/secretmanager.secretAccessor") is None

    def test_service_account_user_binding_passes(self):
        """Step 3's actual binding: serviceAccountUser on the SA IAMMember."""
        assert gcp_binding_violation(SERVICE_ACCOUNT_IAM_MEMBER, "roles/iam.serviceAccountUser") is None

    def test_project_level_iam_member_is_blocked(self):
        """Step 6's widening: a project.IAMMember at all, any role."""
        violation = gcp_binding_violation(PROJECT_IAM_MEMBER, "roles/owner")
        assert violation is not None
        assert "project scope" in violation

    def test_project_level_iam_binding_is_blocked(self):
        violation = gcp_binding_violation(PROJECT_IAM_BINDING, "roles/editor")
        assert violation is not None
        assert "project scope" in violation

    def test_owner_role_on_resource_scoped_binding_is_blocked(self):
        """Even scoped to one service account, roles/owner is too broad."""
        violation = gcp_binding_violation(SERVICE_ACCOUNT_IAM_MEMBER, "roles/owner")
        assert violation is not None
        assert "broad role" in violation

    def test_editor_role_on_resource_scoped_binding_is_blocked(self):
        violation = gcp_binding_violation(DATASET_IAM_MEMBER, "roles/editor")
        assert violation is not None

    def test_wildcard_role_is_blocked(self):
        violation = gcp_binding_violation(SECRET_IAM_MEMBER, "roles/*")
        assert violation is not None

    def test_unrelated_resource_type_is_ignored(self):
        """A resource type this policy does not govern never reports."""
        assert gcp_binding_violation("gcp:storage/bucket:Bucket", "roles/owner") is None


class TestAwsRolePolicyViolation:
    def test_scoped_s3_read_policy_passes(self):
        """Step 4's actual policy: GetObject/ListBucket on one bucket ARN."""
        document = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": ["s3:GetObject", "s3:ListBucket"],
                    "Resource": [
                        "arn:aws:s3:::policy-access-governance-demo",
                        "arn:aws:s3:::policy-access-governance-demo/*",
                    ],
                }
            ],
        }
        assert aws_role_policy_violation(document) is None

    def test_wildcard_action_is_blocked(self):
        document = {
            "Version": "2012-10-17",
            "Statement": [{"Effect": "Allow", "Action": "*", "Resource": "arn:aws:s3:::demo/*"}],
        }
        violation = aws_role_policy_violation(document)
        assert violation is not None
        assert "Action" in violation

    def test_wildcard_resource_is_blocked(self):
        document = {
            "Version": "2012-10-17",
            "Statement": [{"Effect": "Allow", "Action": "s3:GetObject", "Resource": "*"}],
        }
        violation = aws_role_policy_violation(document)
        assert violation is not None
        assert "Resource" in violation

    def test_wildcard_in_action_list_is_blocked(self):
        document = {
            "Version": "2012-10-17",
            "Statement": [{"Effect": "Allow", "Action": ["s3:GetObject", "*"], "Resource": "arn:aws:s3:::demo/*"}],
        }
        assert aws_role_policy_violation(document) is not None

    def test_deny_statement_with_wildcard_is_ignored(self):
        """Only Allow statements are checked; a Deny with '*' is a guardrail, not a grant."""
        document = {
            "Version": "2012-10-17",
            "Statement": [{"Effect": "Deny", "Action": "*", "Resource": "*"}],
        }
        assert aws_role_policy_violation(document) is None

    def test_policy_as_json_string_from_json_dumps(self):
        """04-aws-role/__main__.py passes `policy=json.dumps(...)`; the
        __main__.py validator json.loads it before calling this function -
        confirm the round trip here too."""
        document = json.loads(
            json.dumps(
                {
                    "Version": "2012-10-17",
                    "Statement": [{"Effect": "Allow", "Action": "*", "Resource": "*"}],
                }
            )
        )
        assert aws_role_policy_violation(document) is not None
