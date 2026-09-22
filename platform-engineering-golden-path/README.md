# Building a Golden Path: Self-Service Infrastructure Platforms with Pulumi

A 90–120 minute workshop for platform engineers and infrastructure leads
building internal developer platforms. It builds a reusable Pulumi component
(a "golden path") that a consuming team can discover and instantiate without
reading its internals, and it shows what happens to that consuming team when
the component takes a breaking change.

> Every team hand-rolling its own infrastructure, inconsistently, is the
> problem a platform team exists to solve. A Pulumi component is the
> mechanism: a small, opinionated interface with the guardrails — tags,
> logging, IAM — already wired in behind it.

## Sessions and speakers

No session is scheduled yet. This workshop has no confirmed event, date or
speaker as of this writing (2026-09-22); update this table once one is
booked.

## What attendees learn

1. Design a Pulumi component that encapsulates a common infrastructure
   pattern (a "compliant web service") behind a small, opinionated interface.
2. Publish that component so a consuming team can discover and instantiate it
   without reading its internals.
3. Instantiate the component as a consuming team would, and see what
   guardrails it enforces on their behalf (naming, tagging, logging, IAM).
4. Version the component and reason about how a breaking change propagates to
   consumers.

## Layout

```
platform-engineering-golden-path/
├── README.md            this file
├── AGENTS.md             conventions for agents (and humans) editing this folder
├── 01-component/         the platform team's compliance-web-service component (v1.0.0)
├── 02-consume/           the consuming team's 12-line program that instantiates it
└── 03-breaking-change/   component-v2 (a renamed input) and the consumer failing, then fixed
```

Slides are not part of this delivery; see `AGENTS.md` for what this folder
does and does not contain yet.

## Prerequisites

- The [Pulumi CLI](https://www.pulumi.com/docs/iac/download-install/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
  **≥ 3.263.0** (the version this demo was built and verified against).
- **Node.js ≥ 22** and npm, for `01-component`'s and `03-breaking-change/component-v2`'s
  TypeScript.
- An AWS account with permissions to create ECS, ALB, IAM and CloudWatch
  resources, and AWS credentials configured for the Pulumi
  [AWS provider](https://www.pulumi.com/registry/packages/aws/installation-configuration/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
  (only needed for the live `pulumi up`/`pulumi destroy` steps; every other
  step in this demo runs without cloud credentials).
- A [Pulumi Cloud](https://app.pulumi.com/signup?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
  organization on the Pro or Enterprise plan, for the live IDP Private
  Registry publish step (step 1b below). Every other step uses a local
  file-backend login and needs no Pulumi Cloud account.

## Run the demo

The demo is five beats: the platform team authors and typechecks the
component (once), publishes it so it is discoverable by name (once, and only
with a Pulumi Cloud org — otherwise use the local-path fallback), a consuming
team instantiates it in a handful of lines, the platform team ships a
breaking v2, and the same consumer program fails clearly until it is updated.
Steps 2–5 are the ones to run live and repeat in rehearsal:

```bash
# 1. once: author and typecheck the component (platform team)
cd 01-component && npm install
npx tsc --noEmit                              # confirms the component compiles
pulumi package get-schema .                   # confirms it is discoverable and well-formed
cd ..

# 1b. once, ONLY with a Pulumi Cloud Pro/Enterprise org: publish to the IDP Private Registry
cd 01-component
git init && git add -A && git commit -m "compliance-web-service v1.0.0"   # a git-visible repo is required
git tag v1.0.0
pulumi package publish github.com/<your-org>/compliance-web-service@1.0.0 # not run this session, see AGENTS.md
cd ..
# Fallback used for every check in this README instead of a real publish:
# `packages: { compliance-web-service: ../01-component }` in a consumer's Pulumi.yaml,
# which resolves the same way pulumi package add does but needs no registry or network.

# 2. repeatable: consume the component as another team would (12 lines of YAML, no internals visible)
cd 02-consume
pulumi login "file://$HOME/.pulumi-state"     # or your own Pulumi Cloud org
pulumi stack init dev
pulumi preview                                 # schema resolves cleanly; stops at AWS credential validation without cloud creds
pulumi up                                      # creates the compliant service (needs AWS credentials)
cd ..

# 3. once: the platform team ships a breaking v2 (serviceName renamed to name)
cd 03-breaking-change/component-v2 && npm install && npx tsc --noEmit && cd ..

# 4. repeatable: the original v1 consumer program fails clearly against v2, unmodified
pulumi stack init dev                          # first run only
pulumi preview                                 # fails: "Missing required property 'name'"

# 5. repeatable: the same consumer, updated for v2, clears validation
cp Pulumi.fixed.yaml Pulumi.yaml
pulumi preview                                 # schema resolves; stops at AWS credential validation, same as step 2
cd ..

# 6. teardown, in this order, after any pulumi up above
cd 03-breaking-change && pulumi destroy && cd ..
cd 02-consume && pulumi destroy && cd ..
```

`03-breaking-change/Pulumi.yaml` is deliberately left pointed at
`component-v2` with the old `serviceName` property, so `pulumi preview`
reproduces the breaking-change failure on demand; `Pulumi.fixed.yaml` in the
same folder is the corrected version for step 5.

## Sources

Facts in this demo come from these pages, read on 2026-09-22:

- [Pulumi component concepts](https://www.pulumi.com/docs/iac/concepts/components/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
- [Authoring a source-based component package](https://www.pulumi.com/docs/iac/guides/building-extending/packages/source-based-plugin/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
- [`PulumiPlugin.yaml` reference](https://www.pulumi.com/docs/reference/pulumiplugin-yaml/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
- [IDP Private Registry concepts](https://www.pulumi.com/docs/idp/concepts/private-registry/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
- [`pulumi package publish` reference](https://www.pulumi.com/docs/iac/cli/commands/pulumi_package_publish/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
- [`pulumi package add` reference](https://www.pulumi.com/docs/iac/cli/commands/pulumi_package_add/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
- [`awsx.ecs.FargateService` API docs](https://www.pulumi.com/registry/packages/awsx/api-docs/ecs/fargateservice/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) (v3.9.0)
- [Pulumi CLI install](https://www.pulumi.com/docs/iac/download-install/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) (3.263.0)
- [AWS provider installation and configuration](https://www.pulumi.com/registry/packages/aws/installation-configuration/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
