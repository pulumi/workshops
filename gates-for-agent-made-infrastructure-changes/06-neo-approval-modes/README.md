# Step 6: Neo approval modes

Run the same request three times from the Pulumi Cloud console, on the stack `agent-gates`. Paste `task-prompt.txt` as the prompt.

| Run | Setting | What you should see (permissions page, read 2026-10-23) |
| --- | --- | --- |
| 1 | Approval mode Review | Neo pauses before `pulumi preview`, before `pulumi up` and before opening a pull request. |
| 2 | Approval mode Balanced | Neo pauses only before `pulumi up`. |
| 3 | Permission mode read-only | Neo reads and previews, and triggers no Pulumi Cloud writes. It can still open ESC environments and reach what they unlock. |

Approval mode controls when Neo asks. Permission mode controls what Neo can change. They are independent.

The open approval ruleset from step 4 still applies: Neo acts with your Pulumi permissions, so without an active access grant it cannot open `agent-gates/aws-prod` either.

`neo-cli.sh` runs the same request from a terminal. In the CLI and API the Review mode is named `manual`.

Not verified when this was written: no Neo task was run. Record what you see in your own run.
