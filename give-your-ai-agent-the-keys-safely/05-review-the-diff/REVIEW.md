# Reviewing the diff

This is a worked review of `../04-propose-change/proposed.diff` against `01-base-stack/index.ts`. It runs two checks that matter specifically because the diff is agent-authored. A diff from a person on the team would still get read closely, but these two questions are ones a reviewer has to ask differently when the author is an agent.

## Check 1: did it keep the file's own conventions? FAILS

Every existing resource in `01-base-stack/index.ts` carries the shared `tags` const. The VPC and the subnet pass `tags` directly, and the `artifacts` bucket spreads it (`...tags`) alongside its own `purpose` key. Look at the new `logs` bucket in `proposed.diff`: it has no `tags` argument at all.

This compiles. It previews cleanly. It would apply cleanly. Nothing mechanical catches it: there is no lint rule and no policy in this workshop that requires every resource to carry `tags`, so `pulumi preview` has nothing to flag. But it silently breaks the tagging convention the rest of the file follows, and that convention is not decorative. The `workshop` and `managed-by` tags are what cost allocation and ownership tooling key off downstream. A bucket with neither is invisible to both.

A human editing this same file would very likely have copied the pattern by habit: you are already looking at three resources that all take a `tags` argument when you add a fourth. An agent does not do that automatically. It did exactly what the prompt asked for, a bucket and an export, and nothing the prompt did not ask for.

Verdict: request changes. Add `tags: { ...tags, purpose: "access-logs" }` (or at minimum plain `tags`) to the `logs` bucket, matching the pattern already in the file.

## Check 2: did it ask for more than the task needed? PASSES, but verify it

Walk through what the diff actually requests: a plain `aws.s3.Bucket` with a `bucketPrefix` and nothing else. No bucket policy. No public-access-block override. No ACL argument. An `aws.s3.Bucket` with none of those set defaults to private.

So this check passes. But the point of running it is not that this particular diff happened to come back narrowly scoped. It is that a reviewer has to look for this on every agent diff, explicitly, rather than assume it. Nothing about how the agent got here guarantees the next diff will be this clean. The scoped MCP connection in `03-scoped-access` keeps the agent from applying anything itself, but it puts no limit on what the agent can propose. A diff that added a bucket policy with a wildcard principal, or flipped `blockPublicAccess` off, would preview and apply exactly as cleanly as this one did. Checking for it is a habit to run every time, not a box to tick once and stop looking.

## What each outcome would mean here

- **Approve**: only correct once check 1 is fixed. Approving the diff as it stands in `proposed.diff` would ship a resource that quietly breaks this stack's tagging convention. That is a mistake, not a judgment call.
- **Request changes**: the right call right now. The ask itself is sound, check 2 already passes, and the fix is one argument. Ship it once the `logs` bucket carries the same tags as everything else in the file.
- **Reject**: would be wrong here. Reject is for a change that is wrong in kind: the wrong resource, the wrong approach, something that should not exist at all. This diff is a correctly-scoped bucket missing one argument. Rejecting it outright would be an overreaction to a one-line fix.
