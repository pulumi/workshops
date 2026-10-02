import json

import rules

SA = "serviceAccount:access-demo-runner@p.iam.gserviceaccount.com"


def test_project_level_binding_for_service_account_is_flagged():
    props = {"member": SA, "role": "roles/owner", "project": "p"}
    assert rules.no_project_level_service_account_binding(rules.PROJECT_MEMBER_TYPE, props)
    assert rules.no_basic_roles(rules.PROJECT_MEMBER_TYPE, props)


def test_narrow_bindings_pass():
    for rtype, props in [
        ("gcp:bigquery/datasetIamMember:DatasetIamMember", {"member": "group:g@example.com", "role": "roles/bigquery.dataViewer"}),
        ("gcp:secretmanager/secretIamMember:SecretIamMember", {"member": SA, "role": "roles/secretmanager.secretAccessor"}),
        ("gcp:serviceaccount/iAMMember:IAMMember", {"member": "group:g@example.com", "role": "roles/iam.serviceAccountTokenCreator"}),
    ]:
        for _, fn in rules.ALL_RULES.values():
            assert fn(rtype, props) == []


def test_public_member_is_flagged():
    props = {"member": "allUsers", "role": "roles/bigquery.dataViewer"}
    assert rules.no_public_members("gcp:bigquery/datasetIamMember:DatasetIamMember", props)


def test_aws_wildcard_flagged_and_exact_actions_pass():
    bad = json.dumps({"Statement": [{"Effect": "Allow", "Action": "*", "Resource": "*"}]})
    good = json.dumps({"Statement": [{"Effect": "Allow", "Action": ["s3:GetObject"], "Resource": "arn:aws:s3:::b/*"}]})
    assert rules.no_wildcard_aws_actions(rules.AWS_ROLE_POLICY_TYPE, {"policy": bad})
    assert rules.no_wildcard_aws_actions(rules.AWS_ROLE_POLICY_TYPE, {"policy": good}) == []
