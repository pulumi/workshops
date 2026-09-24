# 03-service-account

## The casing trap

This step's resource is `gcp.serviceaccount.IAMMember` — **`IAMMember`, not
`IamMember`**. It breaks the casing pattern set by `gcp.bigquery.DatasetIamMember`
(step 1) and `gcp.secretmanager.SecretIamMember` (step 2): those two spell it
`IamMember`, this one spells it `IAMMember`. Confirmed exact casing live on
the registry on 2026-09-24 — this is not a typo in this workshop's code, it
is how the GCP provider actually names the type. `IamMember` will fail to
import.

Call this out explicitly to participants in the demo (slide outline item 7):
it is a real trap anyone typing this from memory or from an LLM completion
will hit, and it is worth a beat of stage time.

## Working here

- `member` (singular) takes exactly one principal string
  (`user:jane@example.com`, `serviceAccount:...@...iam.gserviceaccount.com`,
  etc.), matching `DatasetIamMember` and `SecretIamMember`'s own `member`
  argument in steps 1 and 2 — the naming is consistent even though the type
  name is not.
- Do not add a second `IAMMember` resource here granting a project-level
  role. That is deliberately step 6's job (`06-over-broad-binding/`), which
  patches this file to demonstrate the policy pack in `05-policy-pack/`
  blocking it. Keep this file least-privilege; the widening lives in the
  patch, not here.
