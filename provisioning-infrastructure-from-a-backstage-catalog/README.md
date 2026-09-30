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

Not yet scheduled. The board card for this workshop tracks `Event page`,
`Sessions` and `Speakers` as `unknown`; update this section once a session is
booked rather than inventing a date here.

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

- A Pulumi Cloud organization and a personal access token (`pulumi login`).
  The demo's stacks are Pulumi Cloud stacks; nothing here needs a Pulumi Cloud
  Neo entitlement.
- An AWS account you are willing to create a handful of S3 buckets and one IAM
  role in, and permission to create an OIDC identity provider for the
  `04-esc-oidc/bootstrap` step.
- Docker and Docker Compose, to run `01-backstage-host`.
- Node.js ≥ 20 and npm, for the scaffolder action, the ESC bootstrap and the
  policy pack (each is its own TypeScript project with its own
  `package.json`).
- The Pulumi CLI. Pinned in the brief at v3.265.0; this build was verified
  against the workstation's installed v3.263.0, so confirm the CLI version
  behaves the same before presenting, or upgrade to v3.265.0 first.

## Run the demo

```bash
# 1. Stand up Backstage (one time per workshop run)
cd 01-backstage-host
./setup.sh                    # scaffolds the Backstage app and builds it
docker compose up --build     # Backstage on :7007, seeded with the catalog entry
cd ..

# 2. Bootstrap the ESC OIDC role (one time, before the workshop, against your own AWS account)
cd 04-esc-oidc/bootstrap
npm install
npx tsc --noEmit
pulumi up                     # creates the IAM role + OIDC provider; see AGENTS.md for the two placeholders to replace first
cd ../..
pulumi env init <org>/<project>/backstage-demo   # then `pulumi env edit` with 04-esc-oidc/environment.yaml's contents

# 3. Install the scaffolder action's dependencies and add it to the Backstage backend
cd 03-scaffolder-action
npm install
npx tsc --noEmit
cd ..

# 4. Publish and enable the policy pack (one time)
cd 06-policy
npm install
npx tsc --noEmit
pulumi policy publish <org>
pulumi policy enable <org>/backstage-demo-guardrails latest
cd ..

# 5. In the Backstage UI: open the "s3-bucket-pulumi" template, enter a bucket
#    name, click Create. Watch the action's logs show `pulumi up` running
#    in-process. Then open the stack in Pulumi Cloud (05-pulumi-cloud) to show
#    its resources and history, and retry with no `team` tag to show the
#    policy pack blocking the request (06-policy).

# 6. Tear down
cd 07-teardown
./teardown.sh                 # destroys every per-bucket demo stack
./teardown.sh --full          # also destroys the bootstrap stack and stops Backstage
```

## Sources

Facts in this demo come from these pages, read on 2026-09-30 unless noted:

- Backstage getting started: https://backstage.io/docs/getting-started/
- Backstage Docker deployment: https://backstage.io/docs/deployment/docker
- Backstage software catalog descriptor format: https://backstage.io/docs/features/software-catalog/descriptor-format
- Backstage guest auth provider: https://backstage.io/docs/auth/guest/provider
- Backstage software templates, writing templates: https://backstage.io/docs/features/software-templates/writing-templates/
- Backstage custom scaffolder actions: https://backstage.io/docs/features/software-templates/writing-custom-actions/
- Pulumi registry, `aws.s3.BucketV2` (confirmed deprecated in favor of `aws.s3.Bucket`): https://www.pulumi.com/registry/packages/aws/api-docs/s3/bucketv2/
- Pulumi registry, `aws.s3.Bucket`: https://www.pulumi.com/registry/packages/aws/api-docs/s3/bucket/
- Pulumi ESC `aws-login` OIDC provider: https://www.pulumi.com/docs/esc/providers/login/aws-login/
- Pulumi Policies (policy as code): https://www.pulumi.com/docs/discovery-governance/concepts/policy-as-code/
- Pulumi CLI `pulumi policy`/`pulumi console`/`pulumi stack`/`pulumi destroy` command reference: read from the installed CLI's own `--help` output (v3.263.0), 2026-09-30.

Read 2026-09-29 as part of the workshop brief: the original brief document
(linked from the board card that tracks this workshop) and its own source
list, including the Guidewire engineering write-up that motivates the opening.
