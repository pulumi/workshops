# 06-blocked-apply

Attempts `pulumi up` with the agent's Stack-Read-only token, to demonstrate
outcome 3 from the brief: an unauthorized apply that is correctly blocked.

## How to work here

- `try-apply.sh` is expected to fail (non-zero exit is success for this
  script). It requires the same `PULUMI_ACCESS_TOKEN` set up in
  `../03-agent-client/AGENTS.md`; this build did not have Pulumi Cloud
  credentials to exercise it end to end (see the PR description).
- The exact CLI error text for a permission-denied `pulumi up` is not
  documented anywhere; do not put invented error text on a slide. Capture
  the real text the first time this runs against a live account and use
  that.
- Point at the audit log after a blocked attempt: it should show an
  `auth-failure-stack-permission` event, not a `Stack Update` event
  (https://www.pulumi.com/docs/administration/concepts/audit-logs/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops,
  read 2026-09-24). Audit logs require Essentials or above.
- Shellcheck clean (`.shellcheckrc` at the folder root of this workshop).
