# Access governance as code: working in this folder

This folder holds the demo code for the workshop. Slides are added under `slides/`.

## Rules

- Stay inside this folder. Never edit another workshop's folder.
- Product facts come from pulumi.com/docs and the Pulumi registry, read at build time. If a doc is unclear, write it down as an open question.
- Use the canonical names: Pulumi IaC, Pulumi Cloud, Pulumi ESC, Pulumi Neo, Pulumi Policies, Pulumi console.
- Commit with Conventional Commits scoped to `policy-access-governance-as-code`, for example `feat(policy-access-governance-as-code): ...`.
- Never commit credentials, `Pulumi.<stack>.yaml` files with real values, `venv/`, `node_modules/`, `dist/`, state or recordings. `*.md` is ignored except `README.md`, `AGENTS.md` and `slides/slides.md`; never force-add an ignored file.
- Every command on a slide must be a command the demo runs, with the same flags.
- Resource type casing differs: `DatasetIamMember` and `SecretIamMember` use "Iam", `serviceaccount.IAMMember` and `projects.IAMMember` use "IAM". Do not "fix" it.

## Verify

| Area | Command |
| --- | --- |
| Policy rules | `cd 03-policy && python -m venv venv && venv/bin/pip install -r requirements.txt && venv/bin/pytest` |
| GCP and AWS programs | `python -m py_compile 01-gcp/__main__.py 02-aws/__main__.py` |
| Shell scripts | `shellcheck 04-widen/widen.sh 05-teardown/destroy.sh` |
| Layout in README | Compare the tree in README.md with `find . -type f` |
