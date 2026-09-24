# 04-propose-change

Runs the agent's proposed change against a scratch copy of `01-base-stack`
and previews it. This step never applies anything.

## How to work here

- `prompt.txt` is the natural-language ask given to the agent client; say
  it or paste it, do not paraphrase it on a slide.
- `logs-bucket.patch` is the change the agent is expected to propose: an
  access-logs bucket for the artifact bucket, plus `aws.s3.BucketLogging`
  wiring the two together. It is a real unified diff against
  `01-base-stack/index.ts`, verified to `git apply` cleanly and to pass
  `npx tsc --noEmit` after applying.
- `propose.sh` copies `01-base-stack` into `.scratch/` (gitignored),
  applies the patch there, type-checks, then runs `pulumi preview --diff`
  against a throwaway local backend under `.scratch/pulumi-state`. It never
  touches the real `01-base-stack` directory or a real Pulumi Cloud stack.
- Without real AWS credentials, `pulumi preview` here fails at credential
  resolution — the same wall `01-base-stack` hits on its own. That is the
  expected, verified result in this build; with credentials it produces a
  real diff (`+ 1 to create` for the access-logs bucket resources and an
  update to the artifact bucket).
- Shellcheck clean (`.shellcheckrc` at the folder root of this workshop).
