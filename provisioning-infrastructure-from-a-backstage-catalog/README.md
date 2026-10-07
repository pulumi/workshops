# Provisioning real infrastructure from a Backstage catalog with Pulumi

A workshop for platform engineers and SREs who run or are evaluating Backstage
as their developer portal and now own the question of what happens after a
developer clicks "Create."

> The developer portal is supposed to be the front door to infrastructure, but
> for most teams "Create" in the catalog still opens a ticket, not a resource.
> This workshop wires a Backstage software template straight into the Pulumi
> Automation API, so a one-click catalog request becomes a real, tagged,
> policy-checked AWS resource with full history in Pulumi Cloud, no static
> credential and no ticket in between.
>
> — Workshop page: not yet announced.

## Sessions and speakers

Not yet scheduled. Speakers are to be announced.

## What attendees learn

1. What a Backstage custom scaffolder action is and where its handler code
   runs relative to the catalog request.
2. How to write an inline Pulumi Automation API program in TypeScript that
   creates or updates a stack programmatically, with no Pulumi CLI invocation
   visible to the end user.
3. How to configure a Pulumi ESC environment that issues short-lived AWS
   credentials via OIDC, and consume them from the Automation API program
   instead of a static access key.
4. How to trigger that action from a Backstage software template and observe
   the created stack, its resources and its history in Pulumi Cloud.
5. What a Pulumi Policies check adds at this point in the flow, and what
   happens when a requested resource violates one.

## Layout

```
provisioning-infrastructure-from-a-backstage-catalog/
├── README.md              this file
├── AGENTS.md              conventions for agents (and humans) editing this folder
├── .gitignore
├── .shellcheckrc
├── 01-backstage-host/     Docker Compose Backstage (+ Postgres) on one EC2 host, seeded with the template's catalog entry
├── 02-template/           template.yaml: one bucket-name field, one step calling the custom scaffolder action
├── 03-scaffolder-action/  the createTemplateAction + its inline Pulumi Automation API program (aws.s3.Bucket)
├── 04-esc-oidc/           Pulumi ESC environment issuing short-lived AWS credentials via aws-login OIDC, plus its one-time bootstrap
├── 05-pulumi-cloud/       walkthrough only: the portal-created stack as seen in Pulumi Cloud
├── 06-policy/             Pulumi Policies pack requiring a `team` tag on the bucket
└── 07-teardown/           destroy the demo stacks, remove their records, stop the host
```

The numbered folders follow the demo flow in order: standing up the portal
(`01`), the template a developer sees (`02`), the code that runs when they
click "Create" (`03`), the credentials it uses (`04`), where the result shows
up (`05`), the guardrail that can block it (`06`), and cleanup (`07`).

## Prerequisites

For participants:

- An AWS account where you can create S3 buckets, IAM roles and an IAM OIDC identity provider (about \$1 in total, see [Cost](#teardown-and-cost)).
- Node.js 20 or later and npm.
- The Pulumi CLI, v3.265.0 (this folder was checked against that exact version).
- A Pulumi Cloud account and organization, logged in with `pulumi login`.
- Enough TypeScript to read a short function.

For the presenter, in addition:

- Docker and Docker Compose, to run `01-backstage-host` on one EC2 host (t3.medium, us-east-1).
- The OIDC identity provider and IAM role from `04-esc-oidc/bootstrap`, created before the session.
- A fallback ESC environment holding a pre-minted short-lived credential, in case live OIDC fails.

## Run the slides

The slides are added in a follow-up commit on this branch; there is nothing to run yet.

## Run the demo

Set up once, before the session:

```bash
# Backstage host (step 1). Needs Docker.
cd 01-backstage-host && ./setup.sh && docker compose up --build -d && cd ..

# OIDC trust for ESC (step 4). Replace PULUMI_ORG in index.ts first; see 04-esc-oidc/AGENTS.md.
cd 04-esc-oidc/bootstrap && npm install && pulumi stack init dev && pulumi config set aws:region us-east-1 && pulumi up && cd ../..
pulumi env init <org>/backstage-s3-bucket/backstage-demo
pulumi env edit --file 04-esc-oidc/environment.yaml <org>/backstage-s3-bucket/backstage-demo

# Action dependencies and policy pack (steps 3 and 6)
cd 03-scaffolder-action && npm install && cd ..
cd 06-policy && npm install && cd ..
```

The scaffolder action reads four optional environment variables from the Backstage backend process:

| Variable | Used in step | Effect |
|---|---|---|
| `PULUMI_ESC_ENVIRONMENT` | 4 | `<org>/backstage-s3-bucket/backstage-demo`; links the ESC environment to each stack so AWS credentials are short-lived |
| `PULUMI_POLICY_PACK_PATH` | 6 | Absolute path to `06-policy`; runs the pack on every `up()` |
| `WORKSHOP_TEAM` | 6 | Value of the `team` tag (default `platform`) |
| `WORKSHOP_OMIT_TEAM_TAG` | 6 | `true` leaves the tag off, which the policy pack blocks |

Per step, with the end state and a proof command:

1. Backstage is up. Open `http://<host>:7007`, browse the catalog, open Create. Proof: `curl -fsS http://<host>:7007/api/catalog/entities | head -c 200`.
2. The template renders and Create fails because the action is not registered yet. Proof: the task log in Backstage names the missing action `pulumi:s3-bucket`.
3. Register the module in the Backstage backend (see `03-scaffolder-action/AGENTS.md`) and click Create. A real bucket, bucket policy and tags exist. Proof: `aws s3api get-bucket-tagging --bucket <name>`.
4. Remove static AWS keys from the host, set `PULUMI_ESC_ENVIRONMENT`, restart Backstage, click Create again. Same result with no long-lived credential. Proof: `env | grep -c AWS_ACCESS_KEY_ID` prints `0` inside the backend container.
5. Show the stack in Pulumi Cloud. Proof: `05-pulumi-cloud/show-history.sh <org> <bucket-name>`.
6. Set `PULUMI_POLICY_PACK_PATH` and `WORKSHOP_OMIT_TEAM_TAG=true`, restart, click Create. The update is blocked and Backstage shows `s3-bucket-require-team-tag`. Proof: the same violation prints offline with `PREVIEW_OMIT_TEAM=true PULUMI_POLICY_PACK_PATH=$PWD/../06-policy npx tsx test/preview.ts` from `03-scaffolder-action`.
7. Teardown, below.

Between runs, reset with `07-teardown/teardown.sh` (per-bucket stacks only) and unset `WORKSHOP_OMIT_TEAM_TAG`.

### Teardown and cost

```bash
cd 07-teardown
./teardown.sh          # destroys each bucket stack and removes its record
./teardown.sh --full   # also destroys the bootstrap stack; then stop or terminate the EC2 host
```

Expected cost is under \$1: a t3.medium for about two hours (about \$0.10), one bucket per run, and IAM objects at no charge.

## Checks that ran offline

No AWS credentials, Docker or live Backstage were available, so the live steps are not verified here. These ran against Pulumi CLI v3.265.0 with a local file backend and dummy credentials:

- `npx tsc --noEmit` in `03-scaffolder-action`, `04-esc-oidc/bootstrap` and `06-policy`.
- `npx tsx test/rules-test.ts` in `06-policy`: 4 passed.
- `npx tsx test/preview.ts` in `03-scaffolder-action`: 3 resources to create; with the policy pack and no `team` tag the preview fails with the `s3-bucket-require-team-tag` violation.
- `pulumi preview` in `04-esc-oidc/bootstrap`: 4 resources to create.
- `shellcheck` on every `.sh` file; YAML parse of every YAML file.

## Sources

Read on 2026-10-06 unless noted. The first read of each page was 2026-09-30.

- Pulumi Automation API: https://www.pulumi.com/docs/iac/concepts/automation-api/
- Pulumi ESC `aws-login` provider: https://www.pulumi.com/docs/esc/providers/login/aws-login/
- Configuring OIDC for AWS: https://www.pulumi.com/docs/esc/guides/configuring-oidc/aws/
- Pulumi Policies: https://www.pulumi.com/docs/discovery-governance/concepts/policy-as-code/
- State and backends: https://www.pulumi.com/docs/iac/concepts/state-and-backends/
- Registry, `aws.s3.BucketV2` (deprecated in favor of `aws.s3.Bucket`): https://www.pulumi.com/registry/packages/aws/api-docs/s3/bucketv2/
- Registry, `aws.s3.Bucket`: https://www.pulumi.com/registry/packages/aws/api-docs/s3/bucket/
- Registry, `aws.s3.BucketPolicy`: https://www.pulumi.com/registry/packages/aws/api-docs/s3/bucketpolicy/
- Registry, `aws.iam.OpenIdConnectProvider`: https://www.pulumi.com/registry/packages/aws/api-docs/iam/openidconnectprovider/
- Registry, `aws.iam.Role`: https://www.pulumi.com/registry/packages/aws/api-docs/iam/role/
- Pulumi v3.265.0 release: https://github.com/pulumi/pulumi/releases/tag/v3.265.0
- Backstage custom scaffolder actions: https://backstage.io/docs/features/software-templates/writing-custom-actions/
- Backstage software templates: https://backstage.io/docs/features/software-templates/writing-templates/
- Backstage Docker deployment: https://backstage.io/docs/deployment/docker
- Backstage catalog descriptor format: https://backstage.io/docs/features/software-catalog/descriptor-format
- Backstage guest auth provider: https://backstage.io/docs/auth/guest/provider
- CLI commands (`pulumi policy`, `pulumi stack`, `pulumi console`): `--help` output of v3.265.0, 2026-10-06.
