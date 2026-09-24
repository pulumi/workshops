# 08-teardown

Human-driven teardown of `01-base-stack`, on the host, with real AWS
credentials and a Stack-Write token — the same shape as
`07-approve-and-apply`.

## How to work here

- `destroy.sh` reads `artifactBucketName` and (if present)
  `accessLogsBucketName` from the stack's outputs, unprotects all
  resources, empties both buckets (including every version and delete
  marker — the artifact bucket has versioning enabled, so a plain empty is
  not enough), then runs `pulumi destroy`.
- Not run end to end in this build: no AWS account. Verified: the script's
  logic was reviewed against a real stack's outputs shape and against the
  AWS CLI's `list-object-versions` / `delete-objects` pair, which is the
  documented way to empty a versioned bucket.
- Shellcheck clean (`.shellcheckrc` at the folder root of this workshop).
