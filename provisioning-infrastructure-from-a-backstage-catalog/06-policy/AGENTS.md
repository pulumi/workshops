<!-- FOR AI AGENTS - Human readability is a side effect, not a goal -->
<!-- Scope: 06-policy/ only. Root cause, not band-aid. -->

# 06-policy: Pulumi Policies guardrail for step 6

## What this is

A Pulumi Policies pack (`backstage-demo-guardrails`) with one mandatory rule:
every `aws.s3.Bucket` must carry a non-empty `tags.team`. It is the
enforcement half of step 6 -- the scaffolder action from
`03-scaffolder-action` still only knows how to create a bucket and a bucket
policy; this pack is what makes an untagged catalog request actually fail.

Files:

- `PulumiPolicy.yaml` -- pack manifest (`runtime: nodejs`).
- `index.ts` -- the `PolicyPack` and its one `ResourceValidationPolicy`.
- `test/rules-test.ts` -- exercises the policy directly (no live stack
  needed): a bucket with no tags, tags but no `team` key, a blank `team`
  value, and a populated `team` value.
- `package.json` / `tsconfig.json` -- standard TypeScript policy pack
  scaffolding, dependency versions confirmed against the npm registry
  2026-09-30 (`npm view @pulumi/policy version` -> `1.21.0`).

## Naming and API, confirmed 2026-09-30

- The product is **Pulumi Policies**, confirmed at
  https://www.pulumi.com/docs/discovery-governance/concepts/policy-as-code/.
  Never "CrossGuard" -- that name still turns up in some older Pulumi blog
  posts (e.g. the 2023 "Using Pulumi Securely" post links text reading
  "CrossGuard" to the current `/docs/discovery-governance/policy/` URL), but
  the docs use "Pulumi Policies" throughout as of this read. Blog copy lags
  docs; follow the docs.
- Pulumi Policies organizes rules in three layers, per that same page:
  **policies** (individual rules) -> **policy packs** (versioned collections
  you publish together) -> **policy groups** (what binds a pack to specific
  stacks or cloud accounts in Pulumi Cloud).
- `PolicyPack`, `ResourceValidationPolicy`, and `validateResourceOfType` are
  current `@pulumi/policy` APIs, confirmed from Pulumi's own reference
  example (read 2026-09-30):
  https://github.com/pulumi/docs/blob/master/static/programs/unit-test-policy-typescript/index.ts
- The `aws:s3/bucket:Bucket` type token is confirmed from the literal
  `static __pulumiType = 'aws:s3/bucket:Bucket'` constant in the compiled
  `@pulumi/aws` package installed locally in this workshop's
  `04-esc-oidc/bootstrap/node_modules/@pulumi/aws/s3/bucket.js` (read
  2026-09-30) -- not guessed from the shorter `aws:s3:Bucket` form that
  appears in YAML/JSON program examples, which is a display alias for the
  same fully-qualified token.
- CLI commands, confirmed current at
  https://www.pulumi.com/docs/iac/cli/commands/pulumi_policy_new/,
  .../pulumi_policy_publish/, and .../pulumi_policy_enable/ (all read
  2026-09-30):
  - `pulumi policy new [template|url]`
  - `pulumi policy publish [org-name]`
  - `pulumi policy enable <org-name>/<policy-pack-name> <latest|version> [--policy-group <group>]`
    -- omitting `--policy-group` targets the org's default policy group.

## How a presenter ships this pack

```bash
cd 06-policy
npm install
npx tsc --noEmit        # typecheck
npm test                # typecheck + run the policy against the four cases above

pulumi policy publish <your-pulumi-org>
pulumi policy enable <your-pulumi-org>/backstage-demo-guardrails latest
```

The last command with no `--policy-group` enables the pack on the org's
default preventative policy group (see below), which is deliberate: it
needs no per-stack setup at all.

## How this actually gets enforced against an Automation-API-driven stack

The workshop plan's original framing was "bound to this project." That is not quite
how Pulumi Cloud's policy groups work, and the correction matters for
getting the demo right, so here is what the docs actually say (read
2026-09-30, https://www.pulumi.com/docs/discovery-governance/concepts/policy-as-code/policy-groups/):

- Policy groups bind to **stacks** (or cloud accounts for audit groups), not
  to projects. A project is just a namespace stacks live under; it is not
  itself a unit a policy group can attach to.
- **Preventative** policy groups "apply to Pulumi stacks and run before any
  resource is deployed. They act as guardrails during `pulumi preview` and
  `pulumi up`... a policy set to mandatory enforcement stops a non-compliant
  change before it reaches your cloud provider."
- Every organization has a default preventative group,
  `default-policy-group`, and critically: **"Every stack in the
  organization"** joins it, automatically, including new stacks as they are
  created. `pulumi policy enable` targets this default group whenever
  `--policy-group` is omitted.

Put together: whatever stack name `03-scaffolder-action`'s Automation API
program uses for a catalog request (fixed name for this demo, or one stack
per request in a real deployment), that stack is a stack in the org the
moment it exists, so it is already a member of `default-policy-group`. No
separate registration step is needed to cover it, and none would survive a
scheme where Backstage creates a new stack per request anyway, since a
custom, hand-populated policy group would need each new stack added to it
explicitly. **Recommended design: publish this pack and enable it on the
default policy group, not a demo-specific one.** If the workshop later wants
a narrower blast radius (only the demo project's stack, not every stack in
the org), the alternative is a dedicated policy group with the specific
stack(s) attached explicitly, either via the REST API's `addStack`
(https://www.pulumi.com/docs/reference/cloud-rest-api/policy-groups/) or the
`PolicyGroupStackAttachment` resource in the `pulumiservice` Pulumi
provider -- but that requires knowing the stack name(s) up front and adding
each one, which the default-group path avoids entirely.

**Does this reach an Automation-API-driven update, with no code change in
the scaffolder action?** The policy-groups doc describes enforcement by
operation type ("during `pulumi preview` and `pulumi up`"), not by
invocation surface, and Automation API's `stack.up()` runs that same
`pulumi up` operation through the Pulumi engine -- it is a programmatic
caller of the same operation, not a different one. I could not find a
sentence in the policy docs that names "Automation API" explicitly, so
treat that specific phrase-level confirmation as unverified. But Pulumi's
own engineering blog states the underlying claim directly (read 2026-09-30,
https://www.pulumi.com/blog/agent-sprawl-iac-platform-is-the-answer/):
"[Pulumi Policies] is... policy as code, written in a real programming
language, evaluated deterministically at preview and update time... An
agent running through Pulumi hits those gates whether it 'wants' to or not,
because the gates live in the pipeline and not in the prompt." That is a
first-party, on-the-record statement that policy enforcement is
invocation-surface-independent, which directly backs this design. So: the
mechanism is verified from the docs (enforcement is by operation, not
caller); the specific words "Automation API" attached to that mechanism
come from a blog post rather than the reference docs -- solid, but named
here as a slightly weaker source than the policy-groups reference page
itself.

## What was not run

`pulumi policy publish` / `pulumi policy enable` were not run for real: doing
so would publish a policy pack to a live Pulumi Cloud org and change
enforcement for real stacks, which is not something to do from an unattended
build pass. Verification here is limited to typechecking the pack and
running its policy logic directly against mock resource args (see below).
