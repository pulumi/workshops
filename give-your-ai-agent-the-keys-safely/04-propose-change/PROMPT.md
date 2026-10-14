# Prompt given to the agent

This step runs the agent through the scoped, read-plus-preview MCP connection built in `03-scoped-access`. The guard's allow-list carries `pulumi-registry-get-resource`, `pulumi-registry-list-resources`, `pulumi-cli-preview`, `pulumi-cli-stack-output`, and `pulumi-cli-refresh`. `pulumi-cli-up` is not on that list, so the agent can read state and preview, but it has no way to apply anything.

The instruction given to the agent, verbatim:

> Add a second S3 bucket to the base stack (01-base-stack) for storing access logs from the artifacts bucket. Export its name alongside the existing outputs. Do not change anything else in the file.

What comes back is `proposed.diff` in this folder, not a change to the live stack. `AGENT-SESSION.md` walks through how the agent gets there. `../05-review-the-diff/REVIEW.md` is the checklist a human runs against it before anyone applies it.
