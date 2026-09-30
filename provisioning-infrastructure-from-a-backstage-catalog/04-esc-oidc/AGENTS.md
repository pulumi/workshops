<!-- FOR AI AGENTS - Human readability is a side effect, not a goal -->
<!-- Scope: 04-esc-oidc/ only. Root AGENTS.md (../../AGENTS.md) governs the rest of this monorepo. -->

# AGENTS.md — 04-esc-oidc

## What this step is

Step 4 of "Provisioning real infrastructure from a Backstage catalog with
Pulumi". Brief (verbatim): configure a Pulumi ESC environment using the
`aws-login` OIDC provider so the Automation API program in
`../03-scaffolder-action` consumes `AWS_ACCESS_KEY_ID` /
`AWS_SECRET_ACCESS_KEY` / `AWS_SESSION_TOKEN` minted for a one-hour session,
and remove any static AWS key from the Backstage host. End state: the same
"Create" flow succeeds with no long-lived credential anywhere on the host.

Two pieces, run at two different times:

- `bootstrap/` — a Pulumi TypeScript program a presenter runs **once**,
  before the workshop, against their own AWS account. It is infrastructure
  *for* the demo, not part of the demo's live flow.
- `environment.yaml` — the actual ESC environment definition, loaded once
  via `pulumi env init` / `pulumi env edit`, then read every time the
  Backstage backend process starts (see "Wiring" below).

## Running the bootstrap once

```bash
cd bootstrap
npm install
npx tsc --noEmit        # typecheck before touching real AWS
```

Then replace the two placeholders before `pulumi up`:

- `PULUMI_ORG` in `index.ts` — your real Pulumi organization name (used to
  build both the OIDC audience `aws:<org>` and the trust policy's `sub`
  condition).
- Nothing else needs replacing in `index.ts` itself; `ESC_PROJECT` /
  `ESC_ENVIRONMENT` already match the names used below and in
  `environment.yaml`.

```bash
pulumi stack init dev
pulumi up
pulumi stack output roleArn
```

That last command's output is the value `environment.yaml` needs for
`roleArn`.

## Creating the ESC environment

```bash
pulumi env init <your-pulumi-org>/backstage-s3-bucket/backstage-demo
pulumi env edit --file ../environment.yaml <your-pulumi-org>/backstage-s3-bucket/backstage-demo
```

(project name `backstage-s3-bucket` matches `PULUMI_PROJECT_NAME` in
`../03-scaffolder-action/src/pulumi/s3BucketProgram.ts`, so the ESC
environment's subject claim — `env:backstage-s3-bucket/backstage-demo` —
lines up with the trust policy the bootstrap program wrote.)

Before replacing `<role-arn-from-bootstrap-stack-output>` in
`environment.yaml`, edit the file on disk, not `pulumi env edit` with a
placeholder still in it — the placeholder is not a valid ARN and `aws-login`
will reject it at resolve time.

Validate with:

```bash
pulumi env open <your-pulumi-org>/backstage-s3-bucket/backstage-demo
```

## Wiring: how these credentials actually reach the Automation API program

This is the part of the brief most likely to be assumed rather than
checked, so it is stated plainly here.

The Backstage backend process (whatever starts `03-scaffolder-action`'s
plugin) should itself be launched as:

```bash
pulumi env run <your-pulumi-org>/backstage-s3-bucket/backstage-demo -- <backstage start command>
```

`pulumi env run` resolves the environment and injects
`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_SESSION_TOKEN` into the
child process's environment *before* that process starts. So by the time
the scaffolder action handler calls `LocalWorkspace.createOrSelectStack(...)`
and Automation API's inline program runs `new aws.iam...` / `new
aws.s3.Bucket(...)`, those three variables are already ambient in the
process — Automation API does not need its own ESC integration, a
`Pulumi.<stack>.yaml` `environment:` stanza, or any extra provider
configuration in `s3BucketProgram.ts`. The `@pulumi/aws` provider (like the
AWS CLI and every AWS SDK) reads `AWS_ACCESS_KEY_ID` /
`AWS_SECRET_ACCESS_KEY` / `AWS_SESSION_TOKEN` from the process environment
by default, which is exactly the "standard AWS environment variables" the
`aws-login` doc says its outputs are meant to be consumed through.

**Confirmed vs. inferred:** the `aws-login` doc
(https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/aws-login/,
read 2026-09-30) explicitly states its `environmentVariables` output is
"consumed by ... the AWS SDKs" generically, and separately documents
`pulumi env run <env> -- <command>` as the way to inject an environment's
variables into a child process's environment (this half is standard `pulumi
env run` behavior, not specific to `aws-login`, and is documented on the ESC
CLI reference rather than the `aws-login` page itself). The doc does not
show a Backstage-specific or Automation-API-specific example of this
pattern — that combination (`pulumi env run` wrapping a long-lived backend
process that later calls Automation API in-process) is this workshop's own
design, not a pattern lifted verbatim from a Pulumi doc. It is consistent
with everything the doc states about how `aws-login`'s outputs are meant to
be consumed, but flag it as this workshop's construction, not a quoted
recipe.

One-hour session length (`duration: 1h`) has a sharper consequence than it
first looks like, worth stating precisely rather than glossing over:
`pulumi env run <env> -- <cmd>` resolves the environment once, at the
moment it starts `<cmd>`, and injects that one resolution into `<cmd>`'s
process environment. It does not, and cannot, update that process's
environment again later — no operating system gives a parent process a way
to reach back into a child's already-running environment and change it.
That is true regardless of ESC; it is how process environments work
everywhere.

So wrapping a long-lived Backstage backend in `pulumi env run` mints one
AWS session at backend startup, and that session is what every scaffolder
action handler uses for as long as the backend keeps running — up to the
`duration: 1h` limit, after which AWS starts rejecting the stale
credentials with an expiration error. For a single workshop session this is
a non-issue: bootstrap, environment setup, and the live demo comfortably
fit inside an hour, and the backend is normally started fresh for the
session anyway. It stops being a non-issue the moment this pattern is
reused for anything that runs longer than that: a Backstage deployment left
running for a full day needs the process restarted (a fresh `pulumi env
run` invocation) at least once an hour to keep working, or a different
integration entirely — such as the scaffolder action calling `pulumi env
open`/the ESC SDK itself immediately before each Automation API run,
instead of relying on ambient env vars set once at process start. That
redesign is out of scope here; flagging it is not.

Either way, do not capture the three `AWS_*` values once into a static
`.env` file and load *that* into Backstage: that would silently recreate
the long-lived-credential problem this step exists to remove, and would
outlive even the hour `pulumi env run` is naturally limited to.

## Verification actually performed (2026-09-30)

- `npm install && npx tsc --noEmit` in `bootstrap/` — see PR description for
  the real pass/fail result of this run.
- `environment.yaml` parsed as valid YAML with Python's `yaml.safe_load` —
  see PR description.
- `pulumi preview` / `pulumi up` against real AWS were **not** run. Doing so
  needs real AWS credentials capable of creating IAM/OIDC resources, and
  running it for real would provision a real `OpenIdConnectProvider` and
  `Role` in whatever AWS account those credentials belong to — not
  appropriate to do from this environment. This is a harder requirement
  than step 3's bucket-creation program: that program can be exercised
  against dummy/mocked credentials because Pulumi's AWS provider does not
  validate credentials during `preview` for simple resource shapes, but
  `bootstrap/`'s program does not need real AWS access to typecheck either
  — the distinction the brief draws (preview vs. up both needing real
  credentials here) applies to actually resolving whether the OIDC trust
  relationship is well-formed against AWS, which only real `up` can confirm.
