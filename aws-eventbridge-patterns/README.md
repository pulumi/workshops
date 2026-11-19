# Event routing as code on AWS: an EventBridge bus component with a dead-letter queue, archive and policy guardrail

A 90-minute workshop for platform and application engineers on AWS (intermediate level). About 35 minutes of slides, about 50 minutes of live demo, 5 minutes of Q&A. The presenter builds an Amazon EventBridge bus step by step with Pulumi IaC in TypeScript, packages it as a component, and then tests it and guards it with a policy pack.

By the end you have a tested, policy-checked EventBridge bus that never silently drops an event, deployed from a component you can hand to other teams.

## What attendees learn

The outcomes are the spine of the deck and of the demo:

1. Route events from a custom bus to a Lambda function and an SQS queue through two rules with different patterns, and show which rule matched.
2. Package the bus, rules, targets and dead-letter queue (DLQ) as one component, and consume it with about five lines of code.
3. Make a target fail on purpose and find the failed event in the DLQ.
4. Write a unit test that fails when a target has no DLQ, and a Pulumi Policies rule that blocks the same mistake at preview.
5. Archive events and replay them, and explain what that costs.

## Layout

```
aws-eventbridge-patterns/
├── 01-credentials/           ESC environment template for OIDC credentials
├── 02-bus-and-rule/          custom bus, one rule, Lambda target, send-event and tail-logs scripts
├── 03-sqs-and-transformer/   second rule to SQS with an input transformer
├── 04-dlq-and-retry/         dead-letter queue, retry policy, break-on-purpose switch
├── 05-component/             the EventRouter component and a five-line consumer
├── 06-unit-test/             component plus a Mocha test for "every target has a DLQ"
├── 07-policy/                Pulumi Policies pack that blocks targets without a DLQ
├── 08-archive-replay/        component with a one-day archive, seed and replay scripts
├── 09-schedule/              EventBridge Scheduler heartbeat into the bus
└── 10-teardown/              check-clean.sh, lists anything left after destroy
```

Folders are numbered in demo order. Steps 02 to 06, 08 and 09 are full snapshots of one Pulumi project (`aws-eventbridge-patterns`) that all use the stack `dev`. Run `pulumi up` in the next folder and Pulumi updates the stack from the previous step. `07-policy` is a separate policy pack and has no stack. The slides are added in `slides/` on this branch.

## Prerequisites

- An AWS account with permission to create IAM roles, Lambda functions, SQS queues and EventBridge resources in `eu-central-1`, or a sandbox account from the presenter.
- A [Pulumi Cloud](https://app.pulumi.com) account. The free tier is enough; no policy groups are needed because the pack runs locally.
- Pulumi CLI 3.268.0 and the Pulumi ESC commands in it (`pulumi env`). ESC CLI 0.26.0 works too.
- Node.js 22 and npm.
- AWS CLI 2 (2.37.10 was the current version when the brief was written) and `jq`.
- An editor.

Pinned in every `package.json` and lockfile: `@pulumi/pulumi` 3.268.0, `@pulumi/aws` 7.49.0, `@pulumi/policy` 1.21.0, Mocha 12.0.3, tsx 4.23.15, TypeScript 5.9.3. The Lambda runtime is `nodejs22.x` with inline code.

The demo creates an EventBridge bus, rules, an archive, Lambda, SQS queues, a Scheduler schedule, IAM roles and a CloudWatch log group. Expect well under 1 USD per participant for fewer than 100 events (see Sources for the rates). Destroy everything at the end (step 10).

## Run the slides

The deck is added on this branch by the slides run. Until then this folder has the demo only.

## Run the demo

Every command that talks to AWS runs through `pulumi env run`, so no AWS keys are stored on disk. Replace `<org>` with your Pulumi organization.

```bash
# 1. credentials: create the ESC environment, then check it works
pulumi env setup aws                  # experimental: creates the OIDC provider and role, or bring your own role
pulumi env init <org>/aws-eventbridge-patterns/dev
pulumi env edit <org>/aws-eventbridge-patterns/dev --file 01-credentials/environment.yaml   # put your roleArn in the file first
pulumi env run <org>/aws-eventbridge-patterns/dev -- aws sts get-caller-identity

# 2. bus, one rule, Lambda target
cd 02-bus-and-rule && npm install && pulumi stack init dev   # first time only
pulumi up                             # the stack links the ESC environment from Pulumi.dev.yaml; wait 30 s for IAM
pulumi env run <org>/aws-eventbridge-patterns/dev -- ./send-event.sh order.created
pulumi env run <org>/aws-eventbridge-patterns/dev -- ./tail-logs.sh   # the Lambda log shows the event

# 3. second rule to SQS with an input transformer
cd ../03-sqs-and-transformer && npm install && pulumi stack select dev && pulumi up
pulumi env run <org>/aws-eventbridge-patterns/dev -- ../02-bus-and-rule/send-event.sh order.cancelled
pulumi env run <org>/aws-eventbridge-patterns/dev -- ./read-queue.sh cancelledQueueUrl   # transformed message; order.created is not here

# 4. DLQ and retry policy, then break the Lambda permission on purpose
cd ../04-dlq-and-retry && npm install && pulumi stack select dev && pulumi up
pulumi config set breakLambdaPermission true && pulumi up
pulumi env run <org>/aws-eventbridge-patterns/dev -- ../02-bus-and-rule/send-event.sh order.created
pulumi env run <org>/aws-eventbridge-patterns/dev -- ../03-sqs-and-transformer/read-queue.sh dlqUrl   # about a minute later: the failed event and its error attributes
pulumi config rm breakLambdaPermission && pulumi up

# 5. the same thing as a component (preview first: nothing should be replaced)
cd ../05-component && npm install && pulumi stack select dev && pulumi preview && pulumi up

# 6. unit test: passes for the component, fails for a plain EventTarget
cd ../06-unit-test && npm install
npm test                              # passes
PLAIN_TARGET=1 npm test               # fails: event targets without deadLetterConfig: plain-target

# 7. policy pack: local pack, no policy group needed
cd ../07-policy && npm install && cd ../06-unit-test
pulumi stack select dev && pulumi up                             # step 6 code on the stack
pulumi preview --policy-pack ../07-policy                      # passes
pulumi config set addPlainTarget true
pulumi preview --policy-pack ../07-policy                      # blocked by eventbridge-target-has-dlq
pulumi config rm addPlainTarget

# 8. archive and replay (archive needs about 10 minutes of events before the replay)
cd ../08-archive-replay && npm install && pulumi stack select dev && pulumi up
pulumi env run <org>/aws-eventbridge-patterns/dev -- ./seed-archive.sh
# wait 10 minutes, then:
pulumi env run <org>/aws-eventbridge-patterns/dev -- ./replay.sh
pulumi env run <org>/aws-eventbridge-patterns/dev -- ../02-bus-and-rule/tail-logs.sh   # replayed events

# 9. Scheduler heartbeat every five minutes
cd ../09-schedule && npm install && pulumi stack select dev && pulumi up
pulumi env run <org>/aws-eventbridge-patterns/dev -- ../02-bus-and-rule/tail-logs.sh   # a heartbeat every 5 minutes

# 10. teardown
pulumi destroy
cd ../10-teardown && pulumi env run <org>/aws-eventbridge-patterns/dev -- ./check-clean.sh   # needs the environment, so run it before the next line
pulumi env rm <org>/aws-eventbridge-patterns/dev                # and delete the OIDC role if you created one
```

The archive only receives events after it exists, so a presenter who wants a replay with no wait deploys `08-archive-replay` to a second stack called `seed` at least ten minutes before the session, sends events there with `STACK=seed`, and replays from it. The scripts read `STACK` and default to `dev`. A replay only goes to the bus the archive belongs to.

`replay.sh` uses the AWS CLI because the Pulumi AWS provider has no replay resource. Replay sends events into the rule named in the script; the rule `orders-created-rule` is the one from step 2.

Step 5 moves resources from the top level of the stack into the component. `eventRouter.ts` gives each child an alias with the old parent, so `pulumi preview` shows no replacement. Check it before `pulumi up`. The same file is copied into 05, 06, 08 and 09 and must stay identical.

## Sources

Facts in the demo come from these pages, read on October 7 and 8, 2026:

- Pulumi components: https://www.pulumi.com/docs/iac/concepts/components/
- Build a component: https://www.pulumi.com/docs/iac/guides/building-extending/components/build-a-component/
- Unit testing: https://www.pulumi.com/docs/iac/guides/testing/unit/
- Policy as code: https://www.pulumi.com/docs/discovery-governance/concepts/policy-as-code/
- Write a policy pack: https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/
- ESC, configure OIDC for AWS: https://www.pulumi.com/docs/esc/guides/configuring-oidc/aws/
- ESC aws-login provider: https://www.pulumi.com/docs/esc/providers/login/aws-login/
- Pulumi AWS registry (EventBus, EventRule, EventTarget, EventArchive, Schedule): https://www.pulumi.com/registry/packages/aws/
- EventBridge retry policy: https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-rule-retry-policy.html
- EventBridge dead-letter queues: https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-rule-dlq.html
- EventBridge archive and replay: https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-archive.html
- AWS CLI start-replay: https://docs.aws.amazon.com/cli/latest/reference/events/start-replay.html
- EventBridge pricing: https://aws.amazon.com/eventbridge/pricing/ (EventBridge rates only; Lambda, SQS and CloudWatch Logs rates were not read)
