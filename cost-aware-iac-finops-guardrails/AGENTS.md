# cost-aware-iac-finops-guardrails

Demo code and (eventually) slides for the "Cost-aware infrastructure as code" workshop: an AWS budget, a mandatory cost-allocation tag, and a Pulumi Policies guardrail against oversized instances — all enforced before anything deploys.

## Rules

- Stay in this folder. Do not edit any other workshop's folder in this repository.
- Facts about Pulumi products and APIs come from pulumi.com/docs, read during the run that touched them, never from memory. Each README/AGENTS.md source citation carries the date it was read.
- Canonical Pulumi names: **Pulumi Neo** (or Neo), **Pulumi ESC**, **Pulumi Cloud**, **Pulumi Policies** (the product; the concept is "policy as code", the bundle is a "policy pack"), **Pulumi IaC**, **pulumi console** (lowercase). Never "CrossGuard" as a product name — current docs redirect that term to Pulumi Policies; see the root README's Sources.
- Conventional Commits scoped to this folder's slug, `cost-aware-iac-finops-guardrails`.
- Never commit credentials, `venv/`/`.venv/`, `__pycache__/`, Pulumi stack state, or working documents (`*.md` other than `README.md`, `AGENTS.md`, and `slides/slides.md` once it exists — see `.gitignore`). Never force-add an ignored file.
- Every numbered folder is a self-contained Pulumi (or policy-pack) project with its own `requirements.txt`/venv. Nothing is imported across folders, including between `03-tagging-policy` and `05-size-guardrail`'s near-identical tagging rule — each folder must run standalone.

## Areas and verification

- **`01-budget/`** — `aws.budgets.Budget`. Verify with `python3 -m py_compile __main__.py` and `pulumi preview`. Confirming the budget actually exists and the alert fires needs a live AWS account with a confirmed email subscriber; unverified on this build machine.
- **`02-untagged-instance/`** and **`04-tagged-instance/`** — `aws.ec2.Instance`, config-supplied `amiId` (not a live `aws.ec2.get_ami` lookup — see `02-untagged-instance/AGENTS.md` for why). Verify with `py_compile` and `pulumi preview`.
- **`03-tagging-policy/`** and **`05-size-guardrail/`** — Python policy packs (`ResourceValidationPolicy`). The validation logic lives in `rules.py`, tested offline in `test_policy.py` (`python -m unittest test_policy.py`) — that is the real verification of the rule. **`pulumi preview --policy-pack`** against an `aws.ec2.Instance` cannot be trusted as verification on a machine without live AWS credentials: the AWS provider's `Configure` call fails before the resource registers, so the policy never actually evaluates it, and the CLI still prints a green "✅ pack-name" line with no violation. See each policy folder's `AGENTS.md` for this finding in detail. Do not report that a preview "showed the violation" unless a real, non-empty violation block naming the policy and the resource is in the captured output.

## Cost note

Every resource here is short-lived and inexpensive: one `t3.micro` instance for the length of a demo run, and a budget (AWS Budgets' first two budgets per account are free). Tear down after every run regardless — see the root README's teardown step. AWS Budgets does not soft-delete; `pulumi destroy` on `01-budget` is the only way to remove it, and that removal has not been verified against a live account.
