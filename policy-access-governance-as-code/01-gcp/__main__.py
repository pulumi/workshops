"""Least-privilege access on Google Cloud, one step at a time.

`step` controls how far the stack has been built:
  1  BigQuery dataset + one dataset-level binding
  2  + Secret Manager secret + one secret-level binding
  3  + service account + one binding on that service account
`widen=true` adds the over-broad project-level Owner binding used in the
policy demo (step 6). It is off by default.
"""
import pulumi
import pulumi_gcp as gcp

config = pulumi.Config()
step = config.require_int("step")
viewer_member = config.require("viewerMember")
widen = config.get_bool("widen") or False

# Step 1: a dataset and exactly one narrowly scoped binding.
if step >= 1:
    dataset = gcp.bigquery.Dataset(
        "demo-dataset",
        dataset_id="access_demo",
        location="US",
        description="Empty dataset for the access-governance demo",
        delete_contents_on_destroy=True,
    )
    # Type token: gcp:bigquery/datasetIamMember:DatasetIamMember ("Iam")
    gcp.bigquery.DatasetIamMember(
        "dataset-viewer",
        dataset_id=dataset.dataset_id,
        role="roles/bigquery.dataViewer",
        member=viewer_member,
    )
    pulumi.export("datasetId", dataset.dataset_id)

# Step 2: a secret that only the intended principal can read.
if step >= 2:
    secret_reader_member = config.require("secretReaderMember")
    secret = gcp.secretmanager.Secret(
        "demo-secret",
        secret_id="access-demo-secret",
        replication={"auto": {}},
    )
    # Type token: gcp:secretmanager/secretIamMember:SecretIamMember ("Iam")
    gcp.secretmanager.SecretIamMember(
        "secret-accessor",
        secret_id=secret.secret_id,
        role="roles/secretmanager.secretAccessor",
        member=secret_reader_member,
    )
    pulumi.export("secretId", secret.secret_id)

# Step 3: a service account and one binding on the service account itself.
if step >= 3:
    sa = gcp.serviceaccount.Account(
        "demo-sa",
        account_id="access-demo-runner",
        display_name="Access governance demo runner",
    )
    # Type token: gcp:serviceaccount/iAMMember:IAMMember ("IAM": different casing
    # from the two resources above).
    gcp.serviceaccount.IAMMember(
        "sa-token-creator",
        service_account_id=sa.name,
        role="roles/iam.serviceAccountTokenCreator",
        member=viewer_member,
    )
    pulumi.export("serviceAccountEmail", sa.email)

    # Step 6 (policy demo): project-level Owner for the service account.
    if widen:
        gcp.projects.IAMMember(
            "sa-project-owner",
            project=gcp.config.project,
            role="roles/owner",
            member=sa.member,
        )
