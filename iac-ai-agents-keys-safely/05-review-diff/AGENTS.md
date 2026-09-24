# 05-review-diff

Runs the two reviewer checks from the brief's learning outcome 4 against
the agent's proposed diff, and prints a checklist for the group discussion.

## How to work here

- `review-diff.sh <patch-file>` is a mechanical first pass, not a
  substitute for the discussion in the README's step 5. It flags what to
  look at: whether every added resource traces to the stated ask, and
  whether anything touches IAM, security groups, public access, or a
  wildcard.
- Run it against the real proposal: `./review-diff.sh
  ../04-propose-change/logs-bucket.patch`.
- Keep the two checks' patterns honest and simple. A false positive here
  is a teaching moment (the script does not replace judgment); a false
  negative is a bug — if you widen the patterns, re-run against
  `logs-bucket.patch` and confirm it still reports clean.
- Shellcheck clean (`.shellcheckrc` at the folder root of this workshop).
