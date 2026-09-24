# Access Governance as Code: BigQuery, Secret Manager and Service-Account Bindings Without Console Clicks

A 60-90 minute workshop on modeling least-privilege IAM policy as Pulumi
code across AWS and Google Cloud, instead of granting access through console
clicks, with a policy check that catches an over-broad binding before it
ever applies.

> Cloud platform and security teams already provision access by clicking
> through a console, one role at a time, with no diff and no record of why
> a binding exists. This workshop builds the same access model as code
> instead: three narrowly-scoped GCP bindings and their AWS mirror, then a
> policy pack that stops an over-broad binding cold, in `pulumi preview`,
> before it ever reaches the cloud.
>
> — No event page exists yet for this workshop; see "Status" below.

## Status

This workshop has not been scheduled. It comes from the topic backlog
(`policy-access-governance-as-code`), built on two pieces of evidence: an
internal, aggregate-only signal that usage of the three GCP IAM resource
types below grew markedly over one reporting period, and a second,
independent signal of conference interest in policy-and-security sessions.
No named customer or account informed this brief, and none appears here.
Nobody has scheduled a delivery and no CFP was found for it, so it may ship
first as a Pulumi-run webinar or blog series rather than a conference
session. There is no confirmed session, no speaker list, and no workshop
page to link to - all three are placeholders until someone schedules this.

## What attendees learn

1. How to model a least-privilege GCP binding as code: one dataset, one
   secret, one service account, each with exactly the role its one intended
   principal needs, not a project-wide grant.
2. How the same pattern carries to AWS: a role and a policy scoped to one
   action set, mirroring the GCP bindings.
3. How `pulumi preview` shows the diff of a proposed IAM change before it
   applies, the same way it does for any other resource.
4. How a Pulumi policy pack catches an over-broad binding - a service
   account handed project-level Owner - and blocks `pulumi up` with a clear
   violation message, before the mistake ever reaches the cloud.

## Layout

```
policy-access-governance-as-code/
├── README.md                    this file
├── AGENTS.md                    conventions for agents (and humans) editing this folder
├── .gitignore                   ignores presenter docs, keeps README/AGENTS.md/slides.md
├── .shellcheckrc                shellcheck config shared by every .sh script below
├── 01-bigquery-dataset/         Pulumi Python: an empty dataset + one DatasetIamMember binding
├── 02-secret/                   Pulumi Python: a secret + one SecretIamMember binding
├── 03-service-account/          Pulumi Python: a service account + one IAMMember binding
│   └── AGENTS.md                the IAMMember/IamMember casing trap, explained
├── 04-aws-role/                 Pulumi Python: the AWS mirror - an iam.Role + scoped iam.RolePolicy
├── 05-policy-pack/              Pulumi policy pack (Python) + pytest suite for its rules
├── 06-over-broad-binding/       one patch that widens 03's binding to project-level Owner
│   └── AGENTS.md                apply/preview/revert sequence for the demo
└── 07-teardown/                 teardown.sh + verify-clean.sh (checks for soft-deleted service accounts)
```

## Prerequisites

**Participants:**

- A GCP project and an AWS account, both with billing enabled.
- Pulumi CLI 3.263.0 or later.
- Python 3.11 or later (this workshop pins provider SDKs that require 3.9+;
  built and tested here on 3.12).
- Basic IAM vocabulary: roles, principals, bindings.

**Presenter, before delivery:**

- Confirm the `pulumi_policy` package name and the `pulumi policy new`
  scaffolding command still match current docs - both were re-confirmed on
  2026-09-24 (see Sources), but this area of the docs moves.
- The IAM policy rule in `05-policy-pack/rules.py` is hand-authored: there is
  no ready-made IAM example on pulumi.com to crib from, only an S3 one for
  a different workshop (`aws-policy-as-code`). Run through steps 5 and 6
  yourself against real GCP/AWS credentials before the live session; this
  build could not, for lack of credentials (see Verification below).
- Re-run `pulumi preview` on each project close to delivery day - the
  registry pages for these resource types were last read 2026-09-24 and
  provider versions move.

## Run the slides

The deck for this workshop has not been built yet. It will live in
`slides/slides.md` on this same branch once built; run it with `npx slidev
slides/slides.md` from the workshop's root folder once that file exists.

## Run the demo

One-time setup, before the session:

```sh
# For each of 01-bigquery-dataset, 02-secret, 03-service-account, 04-aws-role:
cd 0N-*/
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
pulumi stack init dev
deactivate && cd ..

# The policy pack:
cd 05-policy-pack
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
deactivate && cd ..
```

During the session, in order:

```sh
# Step 1 - dataset + least-privilege binding
cd 01-bigquery-dataset && source venv/bin/activate
pulumi preview   # show the diff before it applies
pulumi up --yes  # verify in the GCP console: one binding, roles/bigquery.dataViewer
deactivate && cd ..

# Step 2 - secret + least-privilege binding
cd 02-secret && source venv/bin/activate
pulumi preview
pulumi up --yes  # verify: the secret is readable only by the intended principal
deactivate && cd ..

# Step 3 - service account + least-privilege binding
cd 03-service-account && source venv/bin/activate
pulumi preview
pulumi up --yes  # verify: the service account has only its one role, not project-level access
deactivate && cd ..

# Step 4 - the AWS mirror
cd 04-aws-role && source venv/bin/activate
pulumi preview
pulumi up --yes  # verify in the AWS console: the inline policy has no wildcard action or resource
deactivate && cd ..

# Step 5 - preview with the policy pack running (still compliant, so this passes)
cd 03-service-account && source venv/bin/activate
pulumi preview --policy-pack ../05-policy-pack

# Step 6 - widen the binding on purpose, and watch the policy pack catch it
git apply ../06-over-broad-binding/widen-service-account-to-project-owner.patch
pulumi preview --policy-pack ../05-policy-pack   # this must stop with a violation, not apply
git apply -R ../06-over-broad-binding/widen-service-account-to-project-owner.patch
deactivate && cd ..
```

Between runs (resetting to a clean starting point without a full teardown):
just re-apply and re-revert the step 6 patch as shown above; steps 1-4 do
not need to be recreated between rehearsals unless you also ran `pulumi
destroy`.

## Teardown and estimated cost

```sh
GCP_PROJECT=your-gcp-project-id ./07-teardown/teardown.sh
```

This destroys all four stacks and then runs `07-teardown/verify-clean.sh`,
which checks for a leftover dataset, secret, AWS role, and - the one thing
`pulumi destroy` cannot fully undo - a soft-deleted service account. GCP
soft-deletes service accounts for 30 days by default, so a repeat delivery
that reuses the same account ID will need to wait out that window or choose
a new ID; this is a fact worth stating out loud at the end of the demo, not
just in this README.

**Estimated cost:** minimal. Every resource in this workshop is IAM
metadata - a dataset shell, a secret's access policy, a service account
binding, an IAM role - none of which carries a meaningful direct cost on
its own. The one thing that could turn this into a real cost is BigQuery
storage or query spend if the dataset held data; this demo deliberately
uses an empty dataset, so that risk does not apply.

## Verification

Run this session, with real outcomes:

- `pip install -r requirements.txt` + `python -m py_compile __main__.py`
  (via `ast.parse`) for all four Pulumi projects and the policy pack:
  passed, no syntax errors.
- `05-policy-pack/tests/test_rules.py`: 15 tests, 15 passed, 0 failed
  (`pytest tests/ -v`, Python 3.12.13, pytest 9.1.1).
- `06-over-broad-binding/widen-service-account-to-project-owner.patch`:
  `git apply --check` passes, the patched file parses cleanly, and
  `git apply -R` reverts it with no residual diff.
- `shellcheck` on `07-teardown/teardown.sh` and `07-teardown/verify-clean.sh`
  using this folder's `.shellcheckrc`: see the pull request description for
  the exact result.
- `bash scripts/lint.sh` at the repo root (this workstation has no `make`,
  so the `Makefile`'s `lint` target could not be invoked directly): see the
  pull request description for the warnings it reported.

Not run in this environment, for lack of GCP and AWS credentials:

- `pulumi preview`/`pulumi up`/`pulumi destroy` against real GCP and AWS
  accounts, for any of the four Pulumi projects or the policy pack.
- The live policy-pack block itself (step 6): the rule logic is
  unit-tested against stub resource arguments, but never exercised through
  an actual `pulumi preview` against a real over-broad binding.
- GCP-console and AWS-console verification of each step's end state.
- `07-teardown/teardown.sh` and `07-teardown/verify-clean.sh` against real
  cloud state.

A presenter must run all of the above at least once, end to end, before
delivering this workshop live - this is the brief's own acceptance
requirement, and it cannot be satisfied without cloud credentials this
environment does not have.

## Sources

| Source | Read |
|---|---|
| [Workshop brief: Access governance as code](https://workprentice.ai/documents/a421ffd0-3cc5-4840-8625-fa65d9eb8c16) | 2026-09-24 |
| [Write a policy pack](https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) | 2026-09-24 |
| [gcp.bigquery.DatasetIamMember](https://www.pulumi.com/registry/packages/gcp/api-docs/bigquery/datasetiammember/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) (GCP provider v9.36.1) | 2026-09-24 |
| [gcp.secretmanager.SecretIamMember](https://www.pulumi.com/registry/packages/gcp/api-docs/secretmanager/secretiammember/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) (GCP provider v9.36.1) | 2026-09-24 |
| [gcp.secretmanager.Secret](https://www.pulumi.com/registry/packages/gcp/api-docs/secretmanager/secret/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) (GCP provider v9.36.1) | 2026-09-24 |
| [gcp.serviceaccount.IAMMember](https://www.pulumi.com/registry/packages/gcp/api-docs/serviceaccount/iammember/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) (GCP provider v9.36.1) | 2026-09-24 |
| [gcp.projects.IAMMember](https://www.pulumi.com/registry/packages/gcp/api-docs/projects/iammember/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) (GCP provider v9.36.1) | 2026-09-24 |
| [aws.iam.Role](https://www.pulumi.com/registry/packages/aws/api-docs/iam/role/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) (AWS provider v7.48.0) | 2026-09-24 |
| [aws.iam.RolePolicy](https://www.pulumi.com/registry/packages/aws/api-docs/iam/rolepolicy/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) (AWS provider v7.48.0) | 2026-09-24 |
| [Pulumi CLI download and install](https://www.pulumi.com/docs/iac/download-install/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) (confirms CLI 3.264.0 as current; this workshop pins the 3.263.0 already on the build workstation) | 2026-09-24 |
| PyPI: `pulumi` 3.264.0, `pulumi-gcp` 9.37.0, `pulumi-aws` 7.48.0, `pulumi-policy` 1.21.0 | 2026-09-24 |
| Exact Pulumi resource type tokens (`gcp:bigquery/datasetIamMember:DatasetIamMember`, `gcp:secretmanager/secretIamMember:SecretIamMember`, `gcp:serviceAccount/iAMMember:IAMMember`, `gcp:projects/iAMMember:IAMMember`, `aws:iam/role:Role`, `aws:iam/rolePolicy:RolePolicy`), confirmed by installing `pulumi-gcp` and `pulumi-aws` and reading the generated SDK source | 2026-09-24 |