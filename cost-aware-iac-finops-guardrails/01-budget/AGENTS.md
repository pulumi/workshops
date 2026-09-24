# cost-aware-iac-budget

Step 1: an `aws.budgets.Budget` with a monthly limit and an 80%-of-limit
alert, so the spending ceiling and the alert threshold exist as code instead
of console clicks.

## Design notes

- `budget_type` and `time_unit` are the only fields the live registry schema
  (`pulumi-aws` v7.48.0, read 2026-09-24) actually requires. `limit_amount`
  and the `notifications` block are set anyway because an unlimited,
  unalerted budget would not demonstrate the workshop's point — this is a
  deliberate choice, not a schema requirement, and is called out in the root
  README's sources section.
- `alertEmail` defaults to a `TODO(presenter)` placeholder. AWS Budgets email
  subscriptions need a confirmation click before they deliver, which cannot
  happen on this build machine; the presenter must set a real, confirmable
  address before the live session (`pulumi config set alertEmail <address>`).
- Threshold uses `notification_type=ACTUAL` rather than `FORECASTED` so the
  demo's alert condition is about money already spent, which is easier to
  reason about live than a forecast.

## Verification

`python3 -m py_compile __main__.py` passes. `pulumi preview` (via
`pulumi login --local`, no stack deployed) was run without AWS credentials
configured on this build machine; it stopped at the provider's credential
check, which is the expected result here — it confirms the program is
well-formed, not that the budget can actually be created. Creating the
budget, receiving the alert for real, and confirming clean teardown (AWS
Budgets does not soft-delete) all require a live AWS account and are listed
as unverified in the pull request.
