# AGENTS.md — platform-engineering-golden-path

Guidance for coding agents (and humans) working in this workshop folder of
`pulumi/workshops`.

## What this folder is

The demo code for "Building a Golden Path: Self-Service Infrastructure
Platforms with Pulumi." This delivery is demo code only, built from
[the workshop brief](https://workprentice.ai/documents/6a6664fd-9cd7-4c00-b1b4-032f6911fa88);
slides come in a follow-on pull request. See `README.md` for the layout and
how to run the demo.

The presenter's own working documents — the runbook, the rehearsal checklist,
the fact-check log, the open questions — stay off this repo; `.gitignore`
keeps every `*.md` out except `README.md` and `AGENTS.md` files. If you write
a new working document, it is ignored by default; that is deliberate, do not
force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders in this repo.
- Facts about Pulumi components, the IDP Private Registry and `pulumi
  package` come from the docs listed under "Sources" in `README.md`. If a doc
  is unclear, say so in the pull request rather than guessing.
- Canonical names: Pulumi Neo (or Neo), Pulumi ESC, Pulumi Cloud, Pulumi IaC,
  Pulumi console (lowercase console). Never "Copilot", "Pulumi Service",
  "Insights", "CrossGuard".
- Conventional Commits, scoped to this folder, e.g.
  `feat(platform-engineering-golden-path): …`,
  `docs(platform-engineering-golden-path): …`.
- Do not commit credentials, `node_modules/`, `dist/`, `.state/`, recordings.

## Known gap: this build could not run a live deploy or a live publish

This session had no AWS credentials and no Pulumi Cloud organization
available, so two things the brief's acceptance checklist calls for were not
executed and their results are not described here or on any slide built from
this folder:

- **`pulumi up` / `pulumi destroy`** on either `02-consume` or
  `03-breaking-change` (brief acceptance items 1 and 2). Everything short of
  actual resource creation was run and is recorded in "Demo code" below.
- **`pulumi package publish`** to the IDP Private Registry (brief step 3).
  The exact command is in `README.md`; it was not executed. The local-path
  `packages:` fallback used throughout this folder resolves components the
  same way a published-and-added component would, without a registry.

Both gaps are called out in the pull request. Re-run the commands below with
real AWS credentials and a Pulumi Cloud Pro/Enterprise org before the first
live delivery, and update this section once that run has happened.

## Overlap with existing workshop material

`golden-paths-infrastructure-components-and-templates/solution/01-component-microservice`
already defines a very similar `ComponentResource` (ECR + `aws.ecs.Cluster` +
`awsx.ecs.FargateService` + `awsx.lb.ApplicationLoadBalancer` + tags),
consumed by `idp-component-policies`. That existing pair publishes via a
git-URL `pulumi package add`, not the IDP Private Registry, and neither
folder teaches versioning or a breaking change. This folder follows the same
component-authoring pattern deliberately, and its two genuine additions are
the registry publish/discovery flow and the versioning-and-breaking-change
scenario, which do not exist anywhere else in this repo as of this build.

## Demo code

Three TypeScript/YAML projects. The exact verification commands that must
pass, and the results recorded from this build (2026-09-22, Pulumi CLI
3.263.0, Node.js 22.23.2, npm 10.9.8):

**`01-component/`** (the platform team's component, v1.0.0):
- `npm install` — clean.
- `npx tsc --noEmit` — clean, no errors.
- `pulumi package get-schema .` — succeeds; produces a schema naming
  `ComplianceWebService` with inputs `serviceName`, `image`, `port` and
  output `url`.

**`02-consume/`** (the consuming team's program, against v1):
- `pulumi login "file://$HOME/.pulumi-state"` then `pulumi stack init dev` —
  succeeds against a local file backend.
- `pulumi preview` — resolves the component's schema against the consumer's
  YAML properties without error, then fails at
  `pulumi:providers:aws default_7_47_0: No valid credential sources found`.
  This is the expected result with no AWS credentials in this session; it is
  not a defect in the demo. Re-run with real AWS credentials before the
  first live delivery.
- `pulumi up` / `pulumi destroy` — not run (no AWS credentials this session).

**`03-breaking-change/component-v2/`** (the platform team's v2, renamed
`serviceName` to `name`):
- `npm install` — clean.
- `npx tsc --noEmit` — clean, no errors.
- `pulumi preview` against `03-breaking-change/Pulumi.yaml` (the original v1
  consumer, unmodified, pointed at `component-v2`) fails with:
  `compliance-web-service:index:ComplianceWebService is not assignable from
  {serviceName: string, image: string, port: number} ... Missing required
  property 'name'`. This is the clean, explainable breaking-change error the
  brief calls for, and it is reproducible with no AWS credentials at all,
  since Pulumi validates a YAML program's properties against the component's
  schema before any provider call.
- `pulumi preview` after `cp Pulumi.fixed.yaml Pulumi.yaml` (the consumer
  updated to use `name`) clears schema validation and reaches the same AWS
  credential error as `02-consume`'s preview, confirming the fix is
  structurally correct.
- Restore `Pulumi.yaml` to the `serviceName`/v1-consumer state afterward so
  the breaking-change demo stays reproducible; do not leave `Pulumi.fixed.yaml`
  copied over `Pulumi.yaml` in the committed tree.

**Repo-root check:**
- `make lint` from the repo root — run after any markdown edit in this
  folder; capture its output as evidence in the pull request.
