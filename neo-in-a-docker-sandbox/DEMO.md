# Demo runbook: Neo in a Docker Sandbox (15 minutes)

Everything below runs on the presenter's laptop (the **host**) unless the
command is shown inside the sandbox. Two terminals side by side: **T1** holds
the Neo TUI (inside the sandbox), **T2** runs host commands (`sbx exec`,
`sbx policy log`, the scripts). Font size 18+, dark terminal, both terminals
started in this folder:

```bash
cd neo-in-a-docker-sandbox
```

Timing targets (measured on your own host before the session; see
`OPEN-QUESTIONS.md` #1):

| # | Step | Target | Cumulative |
|---|---|---|---|
| 1 | Start the sandbox, read the banner | 2:00 | 2:00 |
| 2 | What Neo can and can't touch | 2:00 | 4:00 |
| 3 | A real task: harden the bucket (preview → approve → up) | 5:00 | 9:00 |
| 4 | Approval and permission modes | 2:30 | 11:30 |
| 5 | A guardrail catches a destructive command | 2:00 | 13:30 |
| 6 | The change landed | 1:30 | 15:00 |

If step 3 runs long, drop the network part of step 5 (`try-egress.sh`) and say
it instead; the proxy log in step 2 already showed it.

---

## Before the session (day before, then again 30 minutes before)

```bash
01-sandbox/preflight.sh
```

Expected: every line `ok`, ending in `N ok, 0 to fix`. Fix anything it lists
(bind the token with `sbx secret set -g pulumi`, `pulumi login`, run the
`00-esc` bootstrap, `pulumi up` the baseline stack; see README).

Then warm everything up and put it back into a clean state:

```bash
01-sandbox/up.sh            # first run: pulls the image (minutes), asks to approve the `pulumi` credential binding → yes
                            # the banner appears, then the Neo TUI. Type: exit  (or Ctrl-C) to leave.
01-sandbox/reset.sh         # removes the sandbox, restores 02-app/index.ts, reconciles the stack
```

Expected at the end of `reset.sh`: `pulumi up` reports `Resources: 2 unchanged`
(stack + bucket) and the script prints `clean`.

Also open in a browser, on a second screen: the Pulumi Cloud console (Neo →
Tasks, and the `dev` stack of `neo-workshop-app`), and the AWS console S3 page.

Baseline check (what the audience should NOT see later): the bucket has no
versioning, no encryption configuration, no public access block:

```bash
cd 02-app
pulumi env run <org>/neo-workshop/aws-oidc -- aws s3api get-bucket-versioning --bucket "$(pulumi stack output bucketName)"
# {}  (empty: versioning never enabled)
cd ..
```

---

## 1. Start the sandbox (2:00)

**T1**

```bash
01-sandbox/up.sh
```

Expected output (host, then the banner from inside the VM, then the TUI):

```
▶ creating sandbox 'neo-demo' from ./neo-kit with workspace ./02-app
  kit: …/neo-in-a-docker-sandbox/neo-kit
[sbx creates the microVM, applies the kit: install step is a no-op on this image, shims installed]

┌─ Neo in a Docker Sandbox ─────────────────────────────────────────────
│ agent       pulumi neo  (Pulumi CLI v3.260.0)
│ identity    <you>  orgs: <org>   — via 'pulumi login' through the credential proxy
│ token       PULUMI_ACCESS_TOKEN=proxy-managed  (placeholder only; the real token stays on the host)
│ cloud creds none; stacks get short-lived AWS creds from Pulumi ESC at run time
│ egress      default-deny; only the kit's allow-list is reachable (sbx policy log <sandbox> on the host)
│ guard       on: destructive pulumi/aws/terraform/tofu commands are blocked
│ modes       approval=manual  permission=default   (NEO_SANDBOX_* or sbx run --env …)
│ project     /…/neo-in-a-docker-sandbox/02-app
└───────────────────────────────────────────────────────────────────────
```

then the `pulumi neo` welcome banner and the prompt.

**Say:** "This is a microVM, not a container. Its own kernel, its own Docker
daemon, its own network. The only thing from my laptop in there is this one
project directory. Read the banner with me: Neo runs as *me* in Pulumi Cloud,
but the token never entered the VM; there are no cloud credentials in there at
all; egress is an allow-list; and there is a guard in front of the dangerous
commands. Approval mode is manual, so Neo asks before every tool call."

If the banner says `identity could not reach api.pulumi.com`: the token is not
bound or the binding was declined. Fix on the host: `sbx secret set -g pulumi`,
then `sbx rm -f neo-demo && 01-sandbox/up.sh`.

## 2. What Neo can and can't touch (2:00)

**T2**

```bash
01-sandbox/boundaries.sh
```

Expected (abridged):

```
▶ 1. Identity: Neo runs as your Pulumi user, through the credential proxy
User: <you>
Organizations: <org>, …
Backend URL: https://api.pulumi.com
▶ 2. The token never enters the VM
PULUMI_ACCESS_TOKEN=proxy-managed
▶ 3. No cloud credentials in the VM (ESC mints them at pulumi up time)
(no AWS_/GOOGLE_/AZURE_ variables)
(no ~/.aws)
▶ 4. Filesystem: only the workspace is mounted
/…/neo-in-a-docker-sandbox/02-app
ls: cannot access '/…/neo-in-a-docker-sandbox': …      ← the parent folder is not there
ls: cannot access '/Users': …
▶ 5. Network: default-deny; an unlisted host is unreachable
curl: (56) … 403 …                                       ← ifconfig.me blocked by the proxy
api.pulumi.com -> HTTP 200
▶ 6. Host-side proxy log
HOST              RULE / ACTION           PROXY     COUNT
api.pulumi.com    allow (kit)             forward   …
ifconfig.me       blocked (no rule)       forward   1
▶ 7. Guard: destructive commands are refused before they run
guard: blocked a destructive command
  pulumi destroy --yes
exit=2
```

**Say:** "Six checks, all from outside the VM with `sbx exec`. The interesting
one is the proxy log: the host decides what leaves the sandbox, and it knows
which rule matched. Neo cannot phone home to a host we did not list, and it
cannot read a credential that was never put in there."

## 3. A real task (5:00)

**T1**, type into Neo:

```
Harden the S3 bucket in index.ts: enable versioning, default SSE-S3 encryption,
block all public access, and tag the new resources with owner=neo. Use the
@pulumi/aws v7 sub-resources. Run pulumi preview and show me the diff before
deploying anything.
```

Expected sequence in the TUI (manual approval mode):

1. Neo reads `index.ts` and `AGENTS.md` (filesystem tool calls; each asks for
   approval: answer `y`). Optional: say "yes to reads" and switch to balanced
   later.
2. Neo edits `index.ts`, adding three resources:
   `aws.s3.BucketVersioning`, `aws.s3.BucketServerSideEncryptionConfiguration`,
   `aws.s3.BucketPublicAccessBlock`.
3. Neo asks to run `pulumi preview` → approve. Expected preview:

   ```
   +  aws:s3:BucketVersioning                       demo-versioning   create
   +  aws:s3:BucketServerSideEncryptionConfiguration demo-encryption   create
   +  aws:s3:BucketPublicAccessBlock                demo-public-access create
   Resources: + 3 to create, 2 unchanged
   ```

   ESC minted the AWS credentials for that preview inside the VM; the proxy
   log will show `sts.eu-central-1.amazonaws.com` and `s3.eu-central-1.amazonaws.com`.
4. Neo summarizes the diff and waits. Type: `deploy it`.
5. Neo asks to run `pulumi up` → approve. Expected: `Resources: + 3 created,
   2 unchanged`, with the update URL in Pulumi Cloud.

**Say while it runs:** "Every tool call is a prompt because approval mode is
manual, the strictest one. Neo is editing a real TypeScript program and running
the real CLI, inside the VM, against a real AWS account, with credentials that
did not exist a minute ago and will expire in an hour. Notice what it is not
doing: it is not reading a key file, it is not pasting secrets, and the preview
was not a mock."

Show the update in the Pulumi Cloud console (T2: click the URL).

## 4. Approval and permission modes (2:30)

Leave the Neo session (`exit` or Ctrl-C; the sandbox keeps running). Re-attach
in read-only mode with a first prompt:

**T1**

```bash
01-sandbox/up.sh --env NEO_SANDBOX_PERMISSION_MODE=read-only -- \
  "Add a lifecycle rule that expires noncurrent object versions after 30 days, preview it, and deploy it."
```

Expected: banner shows `modes  approval=manual  permission=read-only`. Neo
edits the file and can run the preview, but the deployment is refused: read-only
removes Neo's ability to trigger writes in Pulumi Cloud, while reads, previews,
code edits and pull requests keep working. Neo reports that it cannot deploy in
read-only mode and stops.

**Say:** "Two independent axes. *Permission mode* is what Neo may change:
default means my RBAC, read-only means no Pulumi Cloud writes. *Approval mode*
is when it pauses: manual asks on every tool call, balanced auto-approves
low-risk calls and still asks before `pulumi up`, auto never asks. And there is
Plan Mode, Shift+Tab before the first message, where Neo agrees a plan with you
before touching anything. Read-only is scoped to Pulumi Cloud, not to the cloud
account: that boundary is set with RBAC and with which ESC environments the
user can open."

Leave the session. (Neo left a lifecycle rule in `index.ts` that was never
deployed; that is fine, `reset.sh` restores the file.)

## 5. A guardrail catches a destructive command (2:00)

Re-attach in default mode and ask for something the guard should stop:

**T1**

```bash
01-sandbox/up.sh --env NEO_SANDBOX_PERMISSION_MODE=default -- \
  "We are done with this environment. Tear the whole stack down."
```

Expected: Neo proposes `pulumi destroy` (shell tool) → approve it on purpose →
the guard answers instead of Pulumi:

```
guard: blocked a destructive command
  pulumi destroy --yes
  matched: ^(destroy|down)([[:space:]]|$)
Nothing was executed. …
```

Neo reports the refusal. Then, from the host:

**T2**

```bash
03-guardrails/try-destroy.sh          # the same thing without Neo: exit=2, guard log with both attempts
03-guardrails/try-egress.sh           # optional: an unlisted AWS region endpoint is blocked; proxy log shows it
```

**Say:** "Three layers, from soft to hard. The guard is a seatbelt in the VM:
it stops accidents, and it logs. Below it, Pulumi refuses to delete a protected
resource even if the guard were gone. And below that, the hypervisor, the
egress allow-list and the credential proxy are outside the VM, where an agent
with root cannot reach them."

## 6. The change landed (1:30)

**T2**

```bash
cd 02-app
git --no-pager diff --stat -- index.ts                     # what Neo changed (3 resources)
pulumi env run <org>/neo-workshop/aws-oidc -- aws s3api get-bucket-versioning --bucket "$(pulumi stack output bucketName)"
pulumi env run <org>/neo-workshop/aws-oidc -- aws s3api get-public-access-block --bucket "$(pulumi stack output bucketName)"
cd ..
```

Expected:

```
{ "Status": "Enabled" }
{ "PublicAccessBlockConfiguration": { "BlockPublicAcls": true, … } }
```

Show the bucket in the AWS console (Properties → Bucket Versioning: Enabled)
and the update in Pulumi Cloud.

**Say:** "That is the whole loop: a real change, in real code, in a real
account, reviewed at every step, with nothing on the laptop an agent could
have leaked. The `pulumi env run` I just used is the same ESC environment the
sandbox used: no static key anywhere in this demo."

---

## Reset (between runs, ~1 minute)

```bash
01-sandbox/reset.sh
```

Does, on the host: `sbx rm -f neo-demo`, `git checkout -- 02-app/index.ts`,
`pulumi up --yes` (removes the three resources Neo added; the protected bucket
stays). Expected last lines: `Resources: - 3 deleted, 2 unchanged` then `clean`.

After the last session:

```bash
01-sandbox/reset.sh --destroy       # unprotect + destroy the bucket; then optionally: cd 02-app && pulumi stack rm dev
cd 00-esc && pulumi destroy         # removes the role and the ESC environment (and the OIDC provider if it created one)
```

## Fallback: the recording

Record once on your host, from a clean state, doing steps 1 to 6 exactly as
above:

```bash
01-sandbox/record.sh
```

On stage, if the live demo dies:

```bash
asciinema play 01-sandbox/recordings/<file>.cast     # space pauses, . steps one frame
```

Narrate over it with the same "Say" lines.

## If something breaks

| Symptom | Fix |
|---|---|
| `sbx run` refuses the kit path | use `./neo-kit` (relative paths must start with `./`); `sbx settings get kit.allowLocalKits` must be true |
| Binding prompt for `pulumi` credential declined / banner shows `could not reach api.pulumi.com` | `sbx secret set -g pulumi`, then `sbx rm -f neo-demo` and start again; approve the binding |
| Neo TUI: "PULUMI_ACCESS_TOKEN must be set" | same as above; the placeholder is missing, the kit's credential was withheld |
| Preview fails with `no credentials` / `ExpiredToken` | the stack must select `<org>/dev` (`pulumi stack select`) so `Pulumi.dev.yaml`'s `environment:` resolves; check `pulumi env open <org>/neo-workshop/aws-oidc` on the host |
| Preview fails with a blocked host | `sbx policy log neo-demo`, add the host to `neo-kit/spec.yaml` `permissions.network.allow`, `sbx rm -f neo-demo`, start again |
| The event stream drops mid-task | `pulumi neo resume <task-id>` inside the sandbox (`sbx exec -it -w …/02-app neo-demo bash -lc 'pulumi neo resume <id>'`); the task id is in the console URL Neo printed |
| `--env` override on re-attach has no effect | recreate with the mode baked in: `sbx rm -f neo-demo && sbx run --name neo-demo ./neo-kit ./02-app --kit-arg permissionMode=read-only` |
| Guard did not block | inside the sandbox `which pulumi` must print `/home/agent/.local/bin/pulumi`; re-run `bash ~/.local/share/neo-sandbox/install-shims.sh` |
| Live demo is dead | play the recording (above) |
