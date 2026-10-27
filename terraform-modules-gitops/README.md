# Keep your Terraform modules, change the pipeline: Terraform modules in Pulumi with push-to-deploy and drift detection

A 90-minute hands-on workshop for platform and DevOps engineers who run Terraform today. You keep a community Terraform VPC module and change what runs around it: the module becomes a Pulumi resource in a TypeScript program, a git push deploys it with short-lived AWS credentials, and a change made in the AWS console shows up as drift.

> In 90 minutes you take a community Terraform VPC module, run it from a Pulumi TypeScript program next to a native Pulumi resource, deploy it from a git push with short-lived AWS credentials, and detect a console change as drift.
>
> The workshop page is not published yet.

## Sessions and speakers

| Session | Date | Length |
|---|---|---|
| Not yet announced | Not yet announced | 90 min (25 min talk, 55 min hands-on, 10 min wrap-up) |

- Speakers: not yet announced.

## What attendees learn

1. Add a Terraform registry module to a Pulumi program with `pulumi package add hcl module`, pinned to a version, and read its outputs in TypeScript.
2. Wire a native `aws.ec2.SecurityGroup` to the module's VPC output, so the module and the native resource live in one stack state.
3. Replace AWS access keys with short-lived credentials: a Pulumi ESC environment that uses the `aws-login` provider with OIDC.
4. Deploy from git with Pulumi Cloud: a push to `main` runs the update, and a pull request gets a preview.
5. Detect a console change with `pulumi refresh --preview-only --expect-no-changes` and reconcile it with `pulumi up --refresh`.

## Layout

Each numbered folder from `01` to `06` is the whole participant project (`tf-modules-gitops`) as it looks at the end of that step. A participant who falls behind copies the next folder forward. The scripts in `00`, `07` and `08` run from inside the project directory.

```
terraform-modules-gitops/
├── README.md                  this file
├── AGENTS.md                  conventions for agents (and humans) editing this folder
├── .gitignore                 keeps node_modules, generated SDKs, build output and working docs out
├── .shellcheckrc              shellcheck settings for the scripts
├── 00-preflight/
│   └── preflight.sh           checks CLI versions, Node, AWS CLI, Pulumi Cloud login, AWS credentials
├── 01-new-project/            step 1: empty TypeScript project, aws:region us-west-2, versions pinned
├── 02-add-module/             step 2: adds the hcl package for terraform-aws-modules/vpc/aws 6.7.3
├── 03-use-module/             step 3: the VPC module in index.ts, public subnets only, no NAT gateway
├── 04-native-resources/       step 4: native SecurityGroup and SSM parameter wired to the module output
├── 05-esc-credentials/        step 5: ESC environment (aws-login, OIDC) attached to the stack
│   ├── aws-oidc.env.yaml      the environment definition, role ARN filled in by create-env.sh
│   └── create-env.sh          creates <org>/tf-modules-gitops/aws-oidc from that file
├── 06-push-to-deploy/         step 6: the tag change you push to main, plus the Deployments settings
│   ├── aws-oidc.env.yaml      same environment definition as in 05
│   ├── create-env.sh          same script as in 05
│   └── deployment-settings/   optional separate project: the Deployments settings as code
├── 07-drift/
│   ├── lib.sh                 shared helper: runs aws through the ESC environment when ESC_ENV is set
│   ├── make-drift.sh          adds a tag to the security group outside Pulumi (the console change, scripted)
│   └── detect-drift.sh        preview-only refresh that exits non-zero on drift
└── 08-teardown/
    └── teardown.sh            destroys the stack, removes it, checks us-west-2 for leftovers
```

The slides follow on this branch in `slides/`.

## Prerequisites

Participants:

- An AWS account where you can create an OIDC identity provider and IAM roles, and the AWS CLI. Steps 3 and 4 use the AWS credentials already in your shell; from step 5 on, ESC supplies them.
- A Pulumi Cloud account on the Free tier or above, and `pulumi login` to Pulumi Cloud (not a local backend).
- A GitHub account, and permission to install the Pulumi GitHub app on one repository. Use a private repository: the stack config in it holds your public IP.
- Pulumi CLI 3.272.0 or newer (`pulumi env setup aws` needs 3.261.0 or newer), Node.js 24, git.

Presenter, in addition:

- A Pulumi Cloud organization on a Pro or Enterprise trial. Scheduled drift detection is not part of the Free tier.
- An AWS sandbox account that already has the Pulumi OIDC identity provider (`api.pulumi.com/oidc`), so the demo skips creating one.
- The pre-built repository (a copy of `06-push-to-deploy`, already on GitHub with the app installed) as a fallback for steps 6 and 7, and a recording of both steps as a backup.

Tested versions, all pinned in the project files:

| Piece | Version |
|---|---|
| Pulumi CLI | 3.272.0 |
| `@pulumi/pulumi` | 3.272.0 |
| `@pulumi/aws` | 7.51.1 |
| Pulumi `hcl` package | 0.18.4 (the version `pulumi package add` wrote into `Pulumi.yaml`) |
| Terraform module `terraform-aws-modules/vpc/aws` | 6.7.3 |
| Node.js | 24.22.1 |
| TypeScript | 5.9.3 (`^5.0.0` in the `pulumi new typescript` template, pinned here) |
| `@types/node` | 24.19.2 |
| `@pulumi/pulumiservice` (optional settings project) | 1.5.0 |

## Run the slides

The deck is added on this branch after the demo. This section will carry its commands then.

## Run the demo

Set `WORKSHOP` to the path of this folder, check the tools once, then run the steps in order. Each step names its end state and the command that proves it. Region is `us-west-2` throughout.

```bash
# 0. once: tools, logins, AWS credentials
export WORKSHOP="$PWD"   # run from this folder
"$WORKSHOP"/00-preflight/preflight.sh
```

**Step 1: new project.** End state: an empty TypeScript project with the region set, and `@pulumi/aws` pinned. Compare with `01-new-project/`.

```bash
mkdir tf-modules-gitops && cd tf-modules-gitops
pulumi new typescript --name tf-modules-gitops --stack dev --yes
npm install --save-exact @pulumi/aws@7.51.1
pulumi config set aws:region us-west-2
pulumi preview        # proves it: one resource, the stack
```

**Step 2: add the Terraform module as a package.** End state: `Pulumi.yaml` has a `packages` entry for the module and the generated SDK `@pulumi/vpc-aws` exists locally.

```bash
pulumi package add hcl module terraform-aws-modules/vpc/aws 6.7.3
grep -A6 '^packages:' Pulumi.yaml    # source pulumi/pulumi/hcl, version 0.18.4, module, 6.7.3
ls sdks/vpc-aws
```

The generated `sdks/` folder is not committed (the project `.gitignore` lists it; it is about 70 MB with its own `node_modules`). A fresh checkout gets it back with `pulumi install`, which reads `Pulumi.yaml`.

**Step 3: use the module.** End state: a VPC with two public subnets in `us-west-2`, all created by the module. Copy `index.ts` from `03-use-module/`.

```bash
pulumi up
pulumi stack            # the module's resources are listed under one vpc-aws:index:Module component
aws ec2 describe-vpcs --region us-west-2 --filters Name=tag:Project,Values=tf-modules-gitops
```

**Step 4: add native resources.** End state: a security group and an SSM parameter in the module's VPC, in the same stack. Copy `index.ts` and `Pulumi.dev.yaml` from `04-native-resources/`.

```bash
pulumi config set allowedCidr "$(curl -s https://checkip.amazonaws.com)/32"
pulumi preview --diff   # the security group and the parameter depend on the module's vpcId output
pulumi up
```

**Step 5: short-lived credentials from ESC.** End state: `pulumi up` works in a shell with no AWS key. Two ways to get the environment; pick one.

```bash
# Path A (experimental): creates the identity provider, the IAM role and the ESC environment for you
pulumi env setup aws --policy AdministratorAccess
# Path B: create the identity provider and role in the AWS console (see the ESC OIDC guide for AWS),
# then create the environment from the definition in this folder
"$WORKSHOP"/05-esc-credentials/create-env.sh <pulumi-org> arn:aws:iam::<account-id>:role/<role-name>
# then, in either path: attach the environment to the stack
pulumi config env add tf-modules-gitops/aws-oidc
pulumi env run <pulumi-org>/tf-modules-gitops/aws-oidc -- aws sts get-caller-identity   # the role, not your user
```

`AdministratorAccess` is the policy the Pulumi docs call out for Deployments. In a shared sandbox, scope the role down. Path A names the environment it creates; if that name is not `tf-modules-gitops/aws-oidc`, use the name it printed in the `environment:` block of `Pulumi.dev.yaml`. Then open a new shell without `AWS_*` variables and run `pulumi up`: it still works.

**Step 6: push to deploy.** End state: a commit to `main` deploys the stack without a local `pulumi up`, and a pull request gets a preview.

1. Create a private GitHub repository and push the project (with `Pulumi.dev.yaml`).
2. In Pulumi Cloud, install the GitHub app: Settings > Version control > Add account > GitHub. You need admin rights in both the GitHub and the Pulumi organization.
3. On the stack, open Settings > Deploy. Set the source to GitHub, pick the repository and branch `main`, and turn on "Run previews for pull requests" and "Run updates for pushed commits". Or do the same in code with the `deployment-settings/` project (set `repository` in its stack config first, then `pulumi up` there).
4. The deployment reads `environment:` from `Pulumi.dev.yaml`, so the ESC credentials from step 5 apply without further settings.
5. Make the change in `06-push-to-deploy/index.ts` (the `DeployedBy` tag on the security group), commit it on a branch, and open a pull request: the preview runs. Merge it: the update runs.

```bash
git checkout -b add-deploy-tag
git commit -am "Tag the security group"
git push -u origin add-deploy-tag      # open the pull request, then merge it
pulumi stack history                    # the update came from the push, not from your machine
```

**Step 7: detect drift.** End state: `pulumi refresh --preview-only --expect-no-changes` exits non-zero after a change outside Pulumi, and `pulumi up --refresh` brings the cloud back to the code.

```bash
# in the AWS console: add any tag to the security group. Or script it:
bash "$WORKSHOP"/07-drift/make-drift.sh
bash "$WORKSHOP"/07-drift/detect-drift.sh    # prints the diff, exits non-zero
pulumi up --refresh                 # reconciles
```

Set `ESC_ENV=<org>/tf-modules-gitops/aws-oidc` before the scripts if your shell has no AWS credentials. The presenter also shows Stack > Settings > Schedules > Drift, with auto-remediation, on the Pro trial. Auto-remediation runs `pulumi up --refresh`.

**Step 8: teardown.** End state: no VPC, security group or parameter in `us-west-2`.

```bash
bash "$WORKSHOP"/08-teardown/teardown.sh      # pulumi destroy, pulumi stack rm, then the checks
```

Then remove what the script does not: the Deployments settings (Settings > Deploy, or `pulumi destroy` in `deployment-settings/`), the environment (`pulumi env rm <org>/tf-modules-gitops/aws-oidc`), the IAM role, and the identity provider if you created it for this workshop.

### Cost

The stack has no NAT gateway and no public IPv4 address, so it should cost nothing while it runs. Confirm it on the AWS bill after the dry run; the AWS VPC pricing page does not say in words that VPCs, subnets and internet gateways are free, and it lists $0.005 per hour for an in-use public IPv4 address. Pulumi Deployments is on the Free tier within 500 workflow minutes.

### What is proven and what is not

This folder was built on a machine with no Pulumi Cloud login and no AWS credentials. What ran there:

- `npx tsc --noEmit` passes for steps 02 to 06 and for `deployment-settings/`.
- `pulumi install` from a clean copy of `06-push-to-deploy` regenerates `sdks/vpc-aws` and installs the dependencies.
- `pulumi preview` of steps 03, 04 and 06 against a local backend, with dummy credentials and the AWS provider's credential checks switched off, resolves the real module from the Terraform registry (the package installs OpenTofu) and plans 13 resources for step 03 and 15 for steps 04 and 06.
- `shellcheck` passes for every script.

What did not run, and has to run in a real Pulumi Cloud organization and AWS account before delivery: `pulumi up`, ESC (`pulumi env setup aws`, the `environment:` block), the GitHub app and Deployments, drift, and teardown.

Open question 1: does a deployment that uses the `hcl` package succeed in the Pulumi Deployments executor? The package docs do not mention Deployments. Step 6 is the test. Not yet answered. If it fails, the fallbacks are a custom executor image that carries OpenTofu (Settings > Deploy > Advanced settings > Use a custom executor image; the `deployment-settings/` project takes it as the `executorImage` config value; private ECR is not supported for these images), or running steps 6 and 7 against a native-only stack.

Open question 2: does the Deployments executor regenerate the ignored `sdks/vpc-aws` folder when it installs dependencies? The module docs recommend `pulumi install` on a fresh checkout, but do not say what a deployment does. Step 6 is the test. If it does not, add `pulumi install` as a pre-run command in the deployment settings.

## Sources

Facts in this folder come from these pages and package registries, read on October 27, 2026:

- [KubeCon + CloudNativeCon North America 2026, keynote 1360829](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/?id=1360829): "We Have GitOps at Home: How Meta Went from Terraform on Cron to GitOps for AI Infra", November 11, 2026
- [Terraform modules in Pulumi](https://www.pulumi.com/docs/integrations/terraform/modules/)
- [hcl package](https://www.pulumi.com/registry/packages/hcl/)
- [aws.ec2.SecurityGroup](https://www.pulumi.com/registry/packages/aws/api-docs/ec2/securitygroup/)
- [aws.ssm.Parameter](https://www.pulumi.com/registry/packages/aws/api-docs/ssm/parameter/)
- [pulumiservice.DeploymentSettings](https://www.pulumi.com/registry/packages/pulumiservice/api-docs/deploymentsettings/)
- [ESC aws-login provider](https://www.pulumi.com/docs/esc/providers/login/aws-login/)
- [Configuring OIDC for AWS](https://www.pulumi.com/docs/esc/guides/configuring-oidc/aws/)
- [Use ESC with Pulumi IaC](https://www.pulumi.com/docs/esc/integrations/infrastructure/pulumi-iac/)
- [Deployment settings](https://www.pulumi.com/docs/deployments/concepts/settings/) and [source settings](https://www.pulumi.com/docs/deployments/concepts/settings/source/)
- [Review stacks](https://www.pulumi.com/docs/deployments/concepts/review-stacks/)
- [Drift detection in Deployments](https://www.pulumi.com/docs/deployments/concepts/drift/) and [drift in stack management](https://www.pulumi.com/docs/iac/operations/stack-management/drift/)
- [Pulumi pricing](https://www.pulumi.com/pricing/) and [Amazon VPC pricing](https://aws.amazon.com/vpc/pricing/)
- Versions: GitHub releases of `pulumi/pulumi` and `pulumi/pulumi-hcl`, npm, registry.terraform.io, nodejs.org
