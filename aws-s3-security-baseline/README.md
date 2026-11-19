# Automating the S3 security baseline as code

A 90-minute workshop (30 min slides, 50 min demo, 10 min Q&A) for platform and cloud engineers. Participants leave knowing how to package the S3 security baseline into one reusable Pulumi component, and how to block buckets that skip it before they deploy.

Date, event page and speakers are not set yet.

## What the demo shows

1. A bare `aws.s3.Bucket` carries none of the baseline.
2. A Pulumi policy pack finds it at preview time and lists six violations.
3. A `SecureBucket` component creates the bucket and its six companion resources, and the same pack passes.
4. A bare bucket added next to it is the only thing the pack blocks.
5. Deploy, then read every control back from AWS.

The six companion resources: public access block, ownership controls (`BucketOwnerEnforced`), default encryption, versioning, lifecycle rules, and a TLS-only bucket policy.

## Layout

```text
aws-s3-security-baseline/
├── README.md
├── AGENTS.md
├── lib.sh                    shared settings for the step scripts
├── 01-new-project/           step 1: empty Pulumi program, stack dev, eu-central-1
├── 02-esc-environment/       step 2: ESC environment (OIDC) and the script that creates it
├── 03-verify-credentials/    step 3: aws sts get-caller-identity through pulumi env run
├── 04-bare-bucket/           step 4: one bare bucket, never deployed
├── 05-policy-pack/policy/    step 5: the policy pack (3 policies, all mandatory)
├── 06-secure-bucket/         steps 6 and 7: the SecureBucket component and its use
├── 08-mixed-stack/           step 8: SecureBucket plus a bare bucket
├── 09-deploy/                step 9: pulumi up through ESC
├── 10-verify-controls/       step 10: read every control back from AWS
├── 11-policy-group/          step 11 (optional): publish the pack, enforce it via a policy group
└── 12-teardown/              step 12: destroy, remove, confirm
```

Folders 01, 04, 06 and 08 are complete Pulumi projects with the same project name (`s3-baseline`) and stack (`dev`), so a presenter can jump to any checkpoint. Steps 6 and 7 share `06-secure-bucket/`: step 6 writes `secureBucket.ts`, step 7 uses it in `index.ts`. In each of these folders run `npm install` first.

## Prerequisites

- Pulumi CLI 3.268.0 (`pulumi env setup` needs 3.261 or newer and is experimental), Node.js 22 or newer, npm, AWS CLI v2.
- A Pulumi Cloud account and organization. Export it: `export ORG=<your-org>`.
- An AWS account you may create S3 buckets in. Region: `eu-central-1`.
- Credentials come from Pulumi ESC through OIDC, not from static keys. Create the trust and role with `pulumi env setup aws --policy AdministratorAccess`, or bring a role of your own and pass it as `ROLE_ARN`.

Pinned versions: `@pulumi/pulumi` 3.268.0, `@pulumi/aws` 7.50.0, `@pulumi/policy` 1.21.0.

## Run the demo

```bash
export ORG=<your-org>

# Step 1
cd 01-new-project && npm install && pulumi stack init dev && pulumi preview   # only the stack

# Steps 2 and 3
ROLE_ARN=arn:aws:iam::<account>:role/<role> ./02-esc-environment/create-environment.sh
./03-verify-credentials/verify-identity.sh

# Steps 4 and 5
cd ../04-bare-bucket && npm install && pulumi stack init dev
pulumi preview --policy-pack ../05-policy-pack/policy      # six s3-bucket-has-baseline violations

# Steps 6 and 7
cd ../06-secure-bucket && npm install && pulumi stack init dev
pulumi preview                                              # stack, component, bucket and six companions
pulumi preview --policy-pack ../05-policy-pack/policy       # passes

# Step 8
cd ../08-mixed-stack && npm install && pulumi stack init dev
pulumi preview --policy-pack ../05-policy-pack/policy       # fails only for the bare bucket

# Steps 9 to 12
./09-deploy/deploy.sh
./10-verify-controls/verify-controls.sh
./11-policy-group/publish-policy.sh                         # optional
./12-teardown/teardown.sh
```

Run `pulumi stack init dev` once per checkpoint, using the ESC environment for credentials (`pulumi env run $ORG/s3-baseline/aws -- pulumi preview ...`). Previews of the checkpoints do not call AWS for the resources, but the AWS provider still needs credentials.

## Cost

Frankfurt (`eu-central-1`) S3 Standard prices from the AWS price list: $0.0054 per 1,000 PUT requests, $0.0043 per 10,000 GET requests, $0.0245 per GB-month. The demo stores a few bytes and makes a handful of requests, so it costs less than one cent per participant. It uses no KMS key and no data transfer out. No AWS resources exist until step 9; step 12 removes them.

## What has been verified

Checked offline with a local state backend and dummy AWS credentials (provider validation switched off):

- `tsc --noEmit` passes in all five TypeScript projects.
- `pulumi preview` creates 1 resource in 01 (the stack), 2 in 04, 9 in 06 and 10 in 08.
- With the pack: 04 reports six `s3-bucket-has-baseline` violations (one per missing companion), 06 passes, 08 reports six violations for the bare bucket only.
- The stack policy sees the dependency from each companion to its bucket at preview time, so the shared-parent fallback is not needed. It was also checked on its own.
- `shellcheck` passes on all scripts.

Not run, because they need an AWS account and a Pulumi Cloud organization: steps 2, 3, 9, 10, 11 and 12, and whether the lifecycle rule accepts the empty `filter: {}` (if not, use `filter: { prefix: "" }`).

## Sources

Read on 2026-10-12:

- https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/aws-login/
- https://www.pulumi.com/docs/iac/cli/commands/pulumi_env_run/
- https://www.pulumi.com/docs/iac/cli/commands/pulumi_env_setup/
- https://www.pulumi.com/docs/iac/cli/commands/pulumi_policy_enable/
- `pulumi policy group --help`, `pulumi up --help` (CLI 3.268.0)
- npm registry: `@pulumi/pulumi`, `@pulumi/aws`, `@pulumi/policy`
