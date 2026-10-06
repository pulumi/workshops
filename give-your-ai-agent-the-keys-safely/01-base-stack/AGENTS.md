# give-your-ai-agent-the-keys-safely-base-stack

Pulumi TypeScript project: a VPC (`aws.ec2.Vpc`), one public subnet
(`aws.ec2.Subnet`), and an S3 bucket for build artifacts (`aws.s3.Bucket`,
logical name `artifacts`) in `index.ts`. This is the demo target of the
"Give your AI agent the keys, safely" workshop.

## How to work here

- This file is the human-authored baseline, not agent output. The
  workshop's AI agent proposes a change to it later (04-propose-change)
  through the scoped, read-plus-propose MCP connection set up in
  02-mcp-server and 03-scoped-access. The agent never edits this file
  directly; every change is a diff reviewed in 05-review-the-diff and only
  applied to the real stack in 07-approve-and-apply.
- No resource here sets `protect: true`. That is deliberate, unlike the
  reference workshop's `02-app` bucket: this workshop's brief ends with a
  full `pulumi destroy` in 08-teardown, so nothing in this stack should
  resist deletion.
- The artifacts bucket uses `aws.s3.Bucket`, not `aws.s3.BucketV2`. The
  Pulumi registry marks `aws.s3.BucketV2` deprecated in favor of
  `aws.s3.Bucket` (checked 2026-09-30), so `Bucket` is the current resource
  to reach for here, not a legacy holdover.
- Config: `namePrefix` (optional, defaults to `agent-keys-safely-`)
  controls the prefix on the artifacts bucket's name.
- Tag every new resource with the shared `tags` const (`workshop`,
  `managed-by`), following the pattern each resource in this file already
  uses: either spreading `tags` directly, or `...tags` plus its own
  `purpose`.
- Always run `pulumi preview` before `pulumi up`.
- `npm install` has already been run once in this build to confirm the
  stack compiles (`npx tsc --noEmit`, clean). `node_modules/` is gitignored;
  run `npm install` again after a fresh checkout.
