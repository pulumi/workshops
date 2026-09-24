<!-- FOR AI AGENTS - Human readability is a side effect, not a goal -->
<!-- Last updated: 2026-09-24 -->

# AGENTS.md - policy-access-governance-as-code

Scope: this folder only. Nearest AGENTS.md wins (see the repo root's, and
`03-service-account/AGENTS.md` and `06-over-broad-binding/AGENTS.md` for
folder-specific notes).

## What this is

Demo code for "Access governance as code: BigQuery, Secret Manager and
service-account bindings without console clicks", a 60-90 minute workshop.
Seven numbered folders: steps 1-4 are independent Pulumi Python projects
(no cross-stack references between them), step 5 is a Pulumi policy pack
(also Python), step 6 is a single patch file with no Pulumi project of its
own, and step 7 is teardown scripts. The workshop's real payload is the
sequence, not any one resource: three narrowly-scoped GCP bindings, one AWS
mirror, then a policy pack that lets one of them go wrong on purpose and
catches it before `pulumi up` applies.

## Fact sources

Product facts (resource type names, exact casing, arguments, SDK versions,
the `pulumi_policy` package name and its `ResourceValidationPolicy` API
shape) come from pulumi.com/registry and pulumi.com/docs, read the day noted
in the root README's `## Sources` table and in each `__main__.py`'s
docstring. Never rely on training-data memory for these, especially the
`gcp.serviceaccount.IAMMember` / `gcp.projects.IAMMember` casing (see
`03-service-account/AGENTS.md`) - it is exactly the kind of thing memory
gets wrong. Re-read the docs before changing any resource's arguments, and
update the Sources table's read date when you do.

## Naming discipline

Say "Pulumi policy as code" or "policy pack" in prose, never "CrossGuard" as
a product name - even though the source brief's own wording uses it. Pulumi
Neo, Pulumi ESC, Pulumi Cloud, Pulumi IaC, pulumi console (lowercase).

## Layout rule

Numbered step folders get no README of their own - only the root has one.
A folder gets its own AGENTS.md only when it has a rule an agent (or a
presenter) would otherwise miss: `03-service-account/` for the casing trap,
`06-over-broad-binding/` for the patch/apply/revert sequence. Every other
step folder is self-explanatory from its `__main__.py` docstring alone.

## Testing discipline

`05-policy-pack/tests/test_rules.py` is a real pytest suite against the rule
functions in `rules.py`, run directly (no Pulumi Cloud, no cloud
credentials needed) - see the root README's verification section for the
exact command and the real pass count from this run. Do not describe a test
as passing without having run it this session.

## Credentials and cost

No GCP project or AWS account was available while building this. Every
`pulumi preview`/`pulumi up`/`pulumi destroy` against real cloud credentials,
the live policy-pack block, and the GCP-console/AWS-console verification
steps in the brief's acceptance checklist are unverified here - the root
README names each one explicitly rather than describing them as passing.
Never commit credentials, a `venv/`, `.pulumi/`, or stack state to this
folder.
