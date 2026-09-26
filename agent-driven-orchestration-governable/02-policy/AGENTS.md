# AGENTS.md — 02-policy

What `require-approval-flag` actually inspects, and why it differs from the
brief's literal description.

## The gap

The brief (§4, step 2) describes the rule as inspecting stack configuration
directly: "inspects stack configuration for `demo:approved = true`". Pulumi
Policies validate resources (`validateResource`) or a stack's resource list
(`validateStack`); there is no documented mechanism, as of the docs read for
this build (2026-09-26), for a policy to read `pulumi.Config` values
directly. `StackValidationArgs` exposes `args.resources` (filterable by
`.type`/`.props`) and `args.stackTags`, not a stack-outputs or stack-config
accessor. See the PR description for sources.

## The workshop's substitute

`01-fleet/workerFleet.ts` carries the approval flag onto a `random.RandomId`
change-marker resource's `keepers` (`{ approved, action, replicaCount }`).
This rule reads `keepers.approved` off that resource with
`validateResourceOfType(random.RandomId, …)`, skipping any `RandomId` that
has no `approved` keeper (the per-worker identity resources).

Say this out loud when presenting: the marker is a workshop stand-in for
wherever a real approval would actually live — a change-management ticket, a
ChatOps `/approve`, a break-glass token — not a suggestion that config you
set yourself is a real approval gate. The teaching point survives the
substitution: the policy still blocks an unapproved change and still allows
an approved one, gated the same way a real external-approval check would be.

## Test

`npx tsc --noEmit` must pass. `npx tsc && node bin/test/rules-test.js` must
print `passed=<n> failed=0`.
