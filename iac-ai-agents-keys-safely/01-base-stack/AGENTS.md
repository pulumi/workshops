# iac-ai-agents-keys-safely-base

Pulumi TypeScript project: a VPC with one subnet and a versioned, non-public
S3 bucket for artifact storage, `us-east-1`. This is the baseline the agent
in later steps is asked to change; it is never touched by an agent itself.

## How to work here

- Stack: `dev` (config in `Pulumi.dev.yaml`). `aws:region` is pinned to
  `us-east-1` per the brief; do not change it or set a region on a provider
  or resource.
- AWS credentials come from the environment (`AWS_ACCESS_KEY_ID` /
  `AWS_SECRET_ACCESS_KEY` / `AWS_SESSION_TOKEN`, or a profile via
  `AWS_PROFILE`) supplied out of band. Do not add a static key to any file
  in this folder.
- The artifact bucket (`workshop-artifacts`) carries `protect: true`. Do not
  remove that, and do not add it to any resource created later in this
  workshop — 08-teardown handles unprotect + empty + destroy in that order.
- Tag every resource with `workshop: iac-ai-agents-keys-safely` and
  `managed-by: pulumi`.
- Always run `pulumi preview` before `pulumi up`.
- `npm install` before the first `pulumi preview`; `npx tsc --noEmit` must
  pass before committing a change to `index.ts`.
