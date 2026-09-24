# 07-approve-and-apply

A human, holding a Stack-Write token, applies the reviewed patch. This is
the only script in the workshop that changes real infrastructure — it
requires real AWS credentials and a real Pulumi Cloud stack, which this
build does not have (see the PR description).

## How to work here

- `approve-and-apply.sh` applies `../04-propose-change/logs-bucket.patch`
  to the real `01-base-stack/index.ts` and type-checks it, then prints the
  `pulumi up` command for the human to run themselves — it does not call
  `pulumi up` on its own, since that is the human decision this step
  exists to make visible.
- Verified in this build: the patch applies cleanly against the real
  `01-base-stack` layout, and `npx tsc --noEmit` passes on the result.
  `pulumi up` and the resulting `pulumi stack output accessLogsBucketName`
  were not run — no AWS credentials in this build environment.
- Shellcheck clean (`.shellcheckrc` at the folder root of this workshop).
