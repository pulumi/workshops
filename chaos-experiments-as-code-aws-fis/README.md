# Chaos experiments as code with Pulumi IaC and AWS Fault Injection Service

> In 90 minutes you define a chaos experiment as a Pulumi resource with a stop condition, run it against a live ECS service on AWS, and block any experiment that has no stop condition before it deploys. Event page not yet announced.

## Sessions and speakers

Date, venue and speakers are not yet announced.

## What attendees learn

- Write an `aws.fis.ExperimentTemplate` in a Pulumi TypeScript program with one target, one stop-task action and one CloudWatch alarm stop condition, and deploy it with `pulumi up`.
- Log in to AWS through a Pulumi ESC environment with OIDC, so no access keys are stored.
- Wrap the experiment pattern in a Pulumi component (`ComponentResource`) and reuse it.
- Block an experiment template without a stop condition with a mandatory Pulumi Policies policy pack before it deploys.

## Layout

The numbered folders follow the demo flow. Steps 2 to 6 are one Pulumi project (`chaos-fis`, stack `dev`): each folder is the full program at that step, so you run `pulumi up` folder after folder against the same stack.

```text
chaos-experiments-as-code-aws-fis/
├── README.md                 # this file
├── AGENTS.md                 # rules for agents working in this folder
├── .gitignore                # ignores build output, state and working documents
├── .shellcheckrc             # shellcheck settings for the scripts
├── lib.sh                    # shared helpers sourced by the step scripts
├── 01-esc-oidc/              # step 1: ESC environment with OIDC login, proof of auth
│   ├── setup.sh              # creates the ESC environment and the stack (run once)
│   ├── esc/aws-oidc.yaml     # ESC environment definition
│   ├── esc/trust-policy.json # IAM trust policy for the role ESC assumes
│   ├── index.ts              # exports the AWS account id
│   ├── package.json          # dependencies, pinned
│   ├── package-lock.json     # lock file
│   ├── tsconfig.json         # TypeScript settings
│   ├── Pulumi.yaml           # project file
│   └── Pulumi.dev.yaml       # stack config, imports the ESC environment
├── 02-target-service/        # step 2: ECS Fargate service behind an ALB (same project files as step 1)
├── 03-steady-state-alarm/    # step 3: adds the HealthyHostCount alarm (same project files)
├── 04-first-experiment/      # step 4: adds the FIS role and the stop-one-task template (same project files)
├── 05-chaos-component/       # step 5: ChaosExperiment component, two instances (same project files)
│   └── chaos-experiment.ts   # the ChaosExperiment component
├── 06-policy-gate/           # step 6: policy pack and a template that violates it
│   ├── policy-pack/          # Pulumi Policies pack
│   │   ├── PulumiPolicy.yaml # pack runtime
│   │   ├── index.ts          # mandatory policy: stop condition required
│   │   ├── package.json      # dependencies, pinned
│   │   ├── package-lock.json # lock file
│   │   └── tsconfig.json     # TypeScript settings
│   └── program/              # step 5 plus the no-stop-condition template (same project files, plus chaos-experiment.ts)
├── 07-stop-one-task/         # step 7: first run
│   ├── traffic.sh            # request loop that counts failed requests
│   └── run.sh                # starts the experiment and waits for it to end
├── 08-stop-all-tasks/        # step 8: second run, stopped by the alarm
│   ├── run.sh                # starts the experiment and waits for it to end
│   └── alarm-history.sh      # shows the alarm state changes
└── 09-teardown/              # step 9: cleanup
    ├── teardown.sh           # destroys the stack and removes it
    └── check.sh              # lists anything left behind
```

## Prerequisites

Participants:

- An AWS account where you can create ECS, ELB, IAM, CloudWatch and FIS resources, in `us-east-1`.
- A Pulumi Cloud account and the Pulumi CLI 3.272.0 or newer.
- Node.js 22 or newer and npm.
- The AWS CLI v2, used by the run scripts and the end-state checks.

Presenter, in addition:

- An IAM role that trusts `api.pulumi.com/oidc` for your Pulumi organization (`01-esc-oidc/esc/trust-policy.json`) with permissions for the resources above.
- Rehearse the whole flow once in a scratch account. Step 8 depends on how fast Fargate replaces tasks, and that has not been measured yet.

## Run the slides

The slides follow on this branch in `slides/` and are built from the demo flow below.

## Run the demo

Once only:

```bash
export PULUMI_ORG=<your-org>
export AWS_ROLE_ARN=<role-arn>
cd 01-esc-oidc
./setup.sh
npm install
pulumi up
```

Then, for each of steps 2 to 6, change into the folder, run `npm install` once (the dependencies are identical, so you can reuse `node_modules`) and run `pulumi up`. Each step has an end state:

| Step | End state |
| --- | --- |
| 1 | `pulumi up` works with no stored keys; `pulumi whoami -v` shows your Pulumi Cloud login |
| 2 | `curl -s -o /dev/null -w '%{http_code}' "$(pulumi stack output albUrl)"` prints 200 and `aws elbv2 describe-target-health` shows two healthy targets |
| 3 | `aws cloudwatch describe-alarms --alarm-names chaos-fis-healthy-hosts --query 'MetricAlarms[0].StateValue'` prints `OK` |
| 4 | `aws fis list-experiment-templates` shows the template |
| 5 | `pulumi preview` shows no replace and two templates exist |
| 6 | `pulumi preview --policy-pack ../policy-pack` fails and names the policy and the resource; after the one-line fix in `program/index.ts` it passes |

In step 6, run the commands from `06-policy-gate/program` and deploy the fixed program with `pulumi up --policy-pack ../policy-pack`.

Steps 7 to 9 read the stack outputs of the step 6 program (set `PROGRAM_DIR` to use another folder). In a second terminal run `07-stop-one-task/traffic.sh`, then `07-stop-one-task/run.sh`. The experiment completes and traffic keeps returning 200. Next run `08-stop-all-tasks/run.sh`. The experiment ends as stopped with the stop condition as the reason, and `08-stop-all-tasks/alarm-history.sh` shows the alarm going to `ALARM`.

Between runs: wait until the service is back at two healthy targets before starting an experiment again.

Teardown: `09-teardown/teardown.sh`, then `09-teardown/check.sh`. Every list should be empty.

Estimated cost for a 90-minute run: under 3 USD (one ALB, two small Fargate tasks, a few FIS action minutes). This is an estimate and has not been measured.

## Sources

Read on 2026-10-23:

- https://www.pulumi.com/registry/packages/aws/api-docs/fis/experimenttemplate/
- https://www.pulumi.com/docs/esc/environments/configuring-oidc/aws/
- https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/aws-login/
- https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/
- https://www.pulumi.com/docs/iac/concepts/resources/options/aliases/
- https://docs.aws.amazon.com/fis/latest/userguide/fis-actions-reference.html
- https://docs.aws.amazon.com/fis/latest/userguide/stop-conditions.html
- Package versions from npm; image tag `nginx:1.31.2-alpine` from Docker Hub and the Amazon ECR public gallery.
