"""Pure rule functions: (resource type, props) -> list of violation messages.

Kept free of the policy SDK so they can be unit tested with plain dicts.
Props use the camelCase names the engine passes to a policy pack.
"""
import json
from typing import Any, Dict, List

GCP_IAM_MEMBER_TYPES = {
    "gcp:bigquery/datasetIamMember:DatasetIamMember",
    "gcp:secretmanager/secretIamMember:SecretIamMember",
    "gcp:serviceaccount/iAMMember:IAMMember",
    "gcp:projects/iAMMember:IAMMember",
}
PROJECT_MEMBER_TYPE = "gcp:projects/iAMMember:IAMMember"
AWS_ROLE_POLICY_TYPE = "aws:iam/rolePolicy:RolePolicy"
PUBLIC_MEMBERS = {"allUsers", "allAuthenticatedUsers"}


def no_public_members(resource_type: str, props: Dict[str, Any]) -> List[str]:
    if resource_type in GCP_IAM_MEMBER_TYPES and props.get("member") in PUBLIC_MEMBERS:
        return [f"{props['member']} must not be granted {props.get('role')}: public principals are never least privilege."]
    return []


def no_project_level_service_account_binding(resource_type: str, props: Dict[str, Any]) -> List[str]:
    if resource_type != PROJECT_MEMBER_TYPE:
        return []
    member = props.get("member") or ""
    if member.startswith("serviceAccount:"):
        return [
            f"{member} is bound to {props.get('role')} on the whole project. "
            "Bind the role on the dataset, secret or service account that needs it instead."
        ]
    return []


def no_basic_roles(resource_type: str, props: Dict[str, Any]) -> List[str]:
    if resource_type not in GCP_IAM_MEMBER_TYPES:
        return []
    role = props.get("role")
    if role in {"roles/owner", "roles/editor"}:
        return [f"{role} is a basic role that grants far more than any single task needs."]
    return []


def no_wildcard_aws_actions(resource_type: str, props: Dict[str, Any]) -> List[str]:
    if resource_type != AWS_ROLE_POLICY_TYPE:
        return []
    raw = props.get("policy")
    doc = json.loads(raw) if isinstance(raw, str) else (raw or {})
    statements = doc.get("Statement", [])
    if isinstance(statements, dict):
        statements = [statements]
    out: List[str] = []
    for st in statements:
        if st.get("Effect") != "Allow":
            continue
        actions = st.get("Action", [])
        actions = [actions] if isinstance(actions, str) else actions
        if any(a == "*" or a.endswith(":*") for a in actions):
            out.append(f"Wildcard action {actions} in an Allow statement. List the exact actions the role needs.")
    return out


ALL_RULES = {
    "gcp-no-public-members": ("Disallows allUsers and allAuthenticatedUsers on any IAM member resource.", no_public_members),
    "gcp-no-project-level-service-account-binding": ("Disallows project-level bindings for service accounts.", no_project_level_service_account_binding),
    "gcp-no-basic-roles": ("Disallows roles/owner and roles/editor.", no_basic_roles),
    "aws-no-wildcard-actions": ("Disallows wildcard actions in inline role policies.", no_wildcard_aws_actions),
}
