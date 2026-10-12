# Access governance as code: BigQuery, Secret Manager and service-account bindings without console clicks

A 60 to 90 minute hands-on workshop. Participants model least-privilege IAM on Google Cloud and AWS as Pulumi IaC, read the diff of an access change before it applies, and watch a policy pack block an over-broad binding.

> Console-click IAM leaves no diff and no audit trail. Here the same access model lives in code, is reviewed in `pulumi preview`, and is checked by a policy pack before anything changes. Workshop page: to be announced.

## Sessions and speakers

| Session | Date | Speakers |
| --- | --- | --- |
| To be announced | To be announced | To be announced |

## What attendees learn

1. Model a least-privilege IAM policy as Pulumi code across two clouds.
2. Diff a proposed IAM change before it applies, and explain why that matters for audit.
3. Detect and block an over-broad binding (a service account with project-level access it does not need) with policy as code.
4. Name the resource types involved and which system each one governs (dataset, secret, service account).

## Layout

```text
.
├── AGENTS.md                   rules for working in this folder
├── README.md                   this file
├── .gitignore                  ignores working docs, venvs, build output
├── .shellcheckrc               shellcheck settings for the scripts
├── 01-gcp/                     demo steps 1 to 3 (and the widened binding of step 6)
│   ├── .gitignore              ignores venv and caches
│   ├── Pulumi.dev.yaml.example config to copy for the dev stack
│   ├── Pulumi.yaml             project file (Python)
│   ├── __main__.py             dataset, secret, service account and one binding each
│   └── requirements.txt        pinned pulumi-gcp
├── 02-aws/                     demo step 4
│   ├── .gitignore              ignores venv and caches
│   ├── Pulumi.dev.yaml.example config to copy for the dev stack
│   ├── Pulumi.yaml             project file (Python)
│   ├── __main__.py             IAM role and inline policy for one action set
│   └── requirements.txt        pinned pulumi-aws
├── 03-policy/                  demo step 5, the policy pack
│   ├── .gitignore              ignores venv and caches
│   ├── PulumiPolicy.yaml       policy pack project file (Python)
│   ├── __main__.py             registers the rules as a policy pack
│   ├── requirements.txt        pinned pulumi-policy and pytest
│   ├── rules.py                the rule functions (plain Python, no SDK)
│   └── test_rules.py           unit tests for the rules
├── 04-widen/                   demo step 6
│   └── widen.sh                widens one binding and runs the update with the policy pack
└── 05-teardown/                demo step 7
    └── destroy.sh              destroys both stacks and lists leftover service accounts
```

## Prerequisites

Participants:

- A Google Cloud project and an AWS account, both with billing enabled.
- The Pulumi CLI (tested with 3.267.0) and a Pulumi Cloud login.
- Python 3.11 or newer, the `gcloud` CLI and the AWS CLI, each authenticated.
- Basic IAM vocabulary: roles, principals, bindings.

Presenter, beforehand:

- Run the whole demo once in your own projects and tear it down.
- Pick the principals: a group for `viewerMember` and a service account for `secretReaderMember` that exist in the GCP project.
- Pick an AWS account ID for `trustedAccountId`.

## Run the slides

Slides follow on this branch under `slides/`.

## Run the demo

Set up once. Each stack uses the dev stack name.

```bash
cd 01-gcp
python3 -m venv venv && venv/bin/pip install -r requirements.txt
pulumi stack init dev
pulumi config set gcp:project <your-project-id>
pulumi config set gcp:region us-central1
pulumi config set viewerMember group:<a-group>@<your-domain>
pulumi config set secretReaderMember serviceAccount:<existing-sa>@<your-project-id>.iam.gserviceaccount.com
cd ../02-aws
python3 -m venv venv && venv/bin/pip install -r requirements.txt
pulumi stack init dev
pulumi config set aws:region us-east-1
pulumi config set trustedAccountId <aws-account-id>
pulumi config set bucketName <any-bucket-name>
cd ../03-policy
python3 -m venv venv && venv/bin/pip install -r requirements.txt && venv/bin/pytest
```

Steps 1 to 3 use one program and a `step` config value. After each `pulumi up`, check the binding with the proving command.

```bash
cd 01-gcp
pulumi config set step 1 && pulumi preview && pulumi up
bq show --format=prettyjson access_demo | grep -A3 dataViewer
pulumi config set step 2 && pulumi preview && pulumi up
gcloud secrets get-iam-policy access-demo-secret
pulumi config set step 3 && pulumi preview && pulumi up
gcloud iam service-accounts get-iam-policy access-demo-runner@<your-project-id>.iam.gserviceaccount.com
```

Expected end states: one `roles/bigquery.dataViewer` binding on the dataset; one `roles/secretmanager.secretAccessor` binding on the secret; one `roles/iam.serviceAccountTokenCreator` binding on the service account and no project-level role for it.

Step 4, the AWS mirror:

```bash
cd 02-aws
pulumi preview && pulumi up
aws iam get-role-policy --role-name "$(pulumi stack output roleName)" --policy-name "$(pulumi stack output policyName)"
```

Expected end state: a role whose inline policy allows `s3:ListBucket` on one bucket and `s3:GetObject` on its objects. Nothing else.

Step 5, the policy pack, attached to a preview. The diff is the output of `pulumi preview`:

```bash
cd 01-gcp
pulumi preview --policy-pack ../03-policy
```

Expected end state: the preview lists the changes and the pack reports no violations.

Step 6, widen one binding. The script sets `widen=true` and runs `pulumi up --policy-pack ../03-policy`:

```bash
./04-widen/widen.sh
```

Expected end state: the update fails with two mandatory violations on `sa-project-owner`, and nothing is applied. Between runs, reset with `cd 01-gcp && pulumi config set widen false`.

Step 7, teardown:

```bash
./05-teardown/destroy.sh
```

Expected end state: both stacks are empty and the final `gcloud` listing prints nothing. GCP keeps a deleted service account recoverable for 30 days, so check that none remain active.

Cost: IAM bindings, a secret and an empty dataset cost next to nothing. The demo loads no data into BigQuery, which avoids storage and query charges. Check current Secret Manager pricing for your project.

## Notes on the code

- Casing: `gcp.bigquery.DatasetIamMember` and `gcp.secretmanager.SecretIamMember` use "Iam"; `gcp.serviceaccount.IAMMember` and `gcp.projects.IAMMember` use "IAM".
- The policy pack is hand-written Python. The authoring docs show an RDS example, not IAM, so the rules here are original. See [Pulumi Policies authoring](https://www.pulumi.com/docs/insights/policy/policy-packs/authoring/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops).

## Sources

All read 2026-10-02.

- [Authoring a policy pack](https://www.pulumi.com/docs/insights/policy/policy-packs/authoring/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops): Python pack layout, `pulumi policy new aws-python`, `pulumi_policy` API.
- [gcp.bigquery.DatasetIamMember](https://www.pulumi.com/registry/packages/gcp/api-docs/bigquery/datasetiammember/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
- [gcp.secretmanager.SecretIamMember](https://www.pulumi.com/registry/packages/gcp/api-docs/secretmanager/secretiammember/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
- [gcp.serviceaccount.IAMMember](https://www.pulumi.com/registry/packages/gcp/api-docs/serviceaccount/iammember/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
