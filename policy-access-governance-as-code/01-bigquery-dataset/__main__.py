"""Step 1 - an empty BigQuery dataset with a single least-privilege binding.

Resources, in order:

1. A `gcp.bigquery.Dataset`, empty on purpose: this demo shows the access
   model, not a data pipeline, and an empty dataset keeps the estimated cost
   of the whole workshop close to zero (see the root README's teardown
   section).
2. A `gcp.bigquery.DatasetIamMember` granting exactly one principal
   `roles/bigquery.dataViewer` on this one dataset. `DatasetIamMember` is
   additive (it adds one member to one role without touching any other
   binding already on the dataset), unlike `DatasetIamPolicy` which replaces
   the whole policy - additive is the right choice for a workshop step that
   is meant to be composed with others, not to own the dataset's entire
   access surface.
   Source: pulumi.com/registry/packages/gcp/api-docs/bigquery/datasetiammember/
   (read 2026-09-24, Google Cloud v9.36.1).

End state (brief step 1): `pulumi up` produces a dataset with exactly one,
narrowly-scoped binding - verify in the GCP console that the dataset's
permissions tab shows only this one role for this one principal, nothing at
project level.
"""

import pulumi
import pulumi_gcp as gcp

config = pulumi.Config()
principal = config.require("principal")

DATASET_ID = "policy_access_governance_demo"

dataset = gcp.bigquery.Dataset(
    "demo-dataset",
    dataset_id=DATASET_ID,
    description="Empty dataset for the access-governance-as-code workshop demo.",
    labels={"workshop": "policy-access-governance-as-code"},
)

reader_binding = gcp.bigquery.DatasetIamMember(
    "dataset-reader",
    dataset_id=dataset.dataset_id,
    role="roles/bigquery.dataViewer",
    member=principal,
)

pulumi.export("datasetId", dataset.dataset_id)
pulumi.export("boundPrincipal", principal)
pulumi.export("boundRole", reader_binding.role)
