# Step 5 — the portal-created stack in Pulumi Cloud

No new code in this step. It is a walkthrough of the stack that step 3's scaffolder
action already created, proving it is a first-class Pulumi Cloud stack and not a
side channel the portal keeps to itself.

## What to show

The Automation API program in `../03-scaffolder-action/src/pulumi/s3BucketProgram.ts`
runs under project `backstage-s3-bucket`, with one stack per bucket name typed into
the Backstage form (`stackName: bucketName` in `createS3BucketAction.ts`). Once a
participant has clicked "Create" at least once, that stack exists in Pulumi Cloud
at:

```text
https://app.pulumi.com/<your-pulumi-org>/backstage-s3-bucket/<bucket-name>
```

Open it and point out, in order:

1. **Resources tab** — the `aws:s3:Bucket` and `aws:s3:BucketPolicy` the action
   created, with the `workshop: provisioning-infrastructure-from-a-backstage-catalog`
   tag from the inline program visible on the bucket.
2. **Updates/history tab** — one update, triggered at the timestamp the participant
   clicked "Create," attributed to whatever identity the Backstage host's Automation
   API process ran as (the ESC-issued OIDC role from step 4, not a person).
3. **Outputs** — `bucketName` and `bucketArn`, the same two values
   `createS3BucketAction.ts` registers with `ctx.output(...)` for Backstage to show
   back to the requester.

The point to land: this is the exact same stack view a `pulumi up` run from a laptop
would produce. The Automation API drove the same engine against the same backend;
nothing about going through a portal changed what Pulumi records.

## CLI fallback

If screen-sharing the console is impractical, the same information is one command
away for whoever is logged in and has the stack selected:

```bash
pulumi stack select backstage-s3-bucket/<bucket-name>
pulumi stack output --json
pulumi console
```

`pulumi console` (confirmed via `pulumi console --help` on the CLI installed for
this build, v3.263.0 — flag surface has been stable across recent releases) opens
the browser directly to the page above, so it doubles as a live link during the
session without anyone typing the org/project/stack path by hand.

## What was not verified in this build

Nothing here was exercised end to end: doing so needs a live Pulumi Cloud org, a
logged-in CLI session, and a stack that step 3's action actually created, none of
which are available on this build workstation. The console URL shape
(`app.pulumi.com/<org>/<project>/<stack>`) and the `pulumi console` / `pulumi stack
output` commands are standard, long-stable Pulumi Cloud surfaces; `pulumi console
--help` was run and its output is quoted in the PR, but the browser page itself was
never opened.