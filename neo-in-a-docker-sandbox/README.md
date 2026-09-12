# Neo in a Docker Sandbox: Using Pulumi's Coding Agent for All Things Infra Safely and Securely

A 60-minute joint workshop from Pulumi and Docker. Pulumi Neo, the coding agent
for all things infra, runs inside a Docker Sandbox: a sealed microVM with no
host filesystem, no credentials and no network beyond an allow-list, and the
cloud credentials it does get are short-lived ones minted by Pulumi ESC.

> Coding agents changed how software gets written, but almost nobody lets one
> near their infrastructure. The reason is simple: an agent that breaks your
> laptop is annoying, while an agent that breaks production comes with a
> postmortem. This joint session from Docker and Pulumi is about letting the
> agent in anyway, safely.
>
> — [Workshop page](https://www.pulumi.com/events/neo-in-a-docker-sandbox/)

## Sessions and speakers

| Session | Date | Length |
|---|---|---|
| Americas | September 16, 2026 | 60 min |
| EMEA | October 14, 2026 | 60 min |

- **Adam Gordon Bell**, Community Engineer, Pulumi
- **Engin Diri**, Principal Solutions Architect, Pulumi
- **Mike Coleman**, Staff Solutions Architect, Docker

Pulumi owns the deck and the demo. Mike covers the Docker Sandboxes part (see
[What we expect from the Docker segment](#what-we-expect-from-the-docker-segment)).

## What attendees learn

The four outcomes promised on the event page are the spine of the deck:

1. What changes when a coding agent's target is your cloud instead of your codebase.
2. What's inside a Docker Sandbox, and how to set up the perfect one for your projects.
3. How Docker Sandboxes give Neo a sealed workspace where it can work without supervision.
4. How Pulumi ESC replaces static API keys with short-lived credentials for AWS, Azure, or Google Cloud.

## Layout

```
neo-in-a-docker-sandbox/
├── README.md            this file
├── DEMO.md              the 15-minute runbook: every command, expected output, what to say, reset
├── AGENTS.md            conventions for agents (and humans) editing this folder
├── OPEN-QUESTIONS.md    what could not be verified or decided here, and who unblocks it
├── 00-esc/              ONE-TIME bootstrap: AWS IAM OIDC trust + role + the Pulumi ESC environment
├── 01-sandbox/          host-side scripts: preflight, up (start/attach), boundaries, reset, record
├── 02-app/              the demo Pulumi project (one S3 bucket) that Neo hardens live
├── 03-guardrails/       scripts that trip the guardrails on purpose (destroy, egress) + lift/re-arm
├── neo-kit/             the Docker Sandboxes kit that runs `pulumi neo` as the sandbox agent
└── slides/              Slidev deck (@pulumi/slidev-theme), speaker notes on every content slide
```

The numbered folders follow the demo flow: credentials first (`00`), then the
sandbox (`01`), then the task (`02`), then the guardrails (`03`).

## Prerequisites

- A [Pulumi Cloud](https://app.pulumi.com/signup) account in an organization
  with Pulumi Neo enabled, and a personal access token. `pulumi login` on the
  host; the token is bound to the sandbox proxy once (`sbx secret set -g pulumi`).
- [Docker Sandboxes](https://docs.docker.com/ai/sandboxes/install/): the `sbx`
  CLI **≥ 0.42.0** (macOS 14+ on Apple silicon, Windows 11, or Ubuntu 24.04+
  with KVM). 0.42.0 is where `sbx run <kit-ref>` and kit arguments landed, both
  of which the kit uses. Docker Desktop is not required by `sbx`; it is only
  needed to build custom template images, and this workshop uses the published
  `ghcr.io/dirien/infrastructure-sandbox:v0.9.0` image (Pulumi CLI 3.260.0 with
  `pulumi neo`, Terraform, OpenTofu, AWS/Azure/gcloud CLIs) as-is.
- The Pulumi CLI (≥ 3.256.0; the demo runs 3.260.0 inside the sandbox) on the
  host for the bootstrap and the reset.
- An AWS account you can create an IAM OIDC provider and a role in (once, for
  `00-esc`). The demo itself creates one S3 bucket.
- Node.js ≥ 20 and npm for the slides.
- Optional: [asciinema](https://asciinema.org/) for the fallback recording.

## Run the slides

```bash
cd slides
npm install              # @pulumi/slidev-theme comes from the public npm registry
npm run dev              # http://localhost:3030, presenter view at /presenter
npm run build            # static site in dist/
npm run export           # slides-export.pdf (first time: npx playwright install chromium)
```

The deck follows the layout and density of the
[GKE workshop deck](../getting-started-with-kubernetes-google-cloud/slides)
(same separator and content patterns, `style.css` overlay, speaker notes in
HTML comments after each slide). Press `o` for the overview, `p` for presenter
mode with notes.

## Run the demo

Step-by-step with timings and expected output: [DEMO.md](DEMO.md). The short version:

```bash
# 0. once: the OIDC trust, the role and the ESC environment (your AWS creds + pulumi login on the host)
cd 00-esc && npm install
pulumi stack init <org>/bootstrap && pulumi config set pulumiOrg <org>
pulumi up                                     # outputs: roleArn, escEnvironmentPath, tryIt
pulumi env run <org>/neo-workshop/aws-oidc -- aws sts get-caller-identity   # short-lived creds work

# 0. once: the baseline stack (the bucket Neo will harden)
cd ../02-app && npm install
pulumi stack init <org>/dev && pulumi up      # Pulumi.dev.yaml imports the ESC environment

# 1. bind the Pulumi token to the sandbox proxy, then check the host
sbx secret set -g pulumi
01-sandbox/preflight.sh

# 2. start Neo in the sandbox (first run pulls the image and asks you to approve the pulumi credential binding)
01-sandbox/up.sh

# 3. between runs
01-sandbox/reset.sh                           # remove sandbox, restore index.ts, reconcile the stack
01-sandbox/reset.sh --destroy                 # after the last session: unprotect + destroy the bucket
```

Everything the demo shows is scripted so it can be replayed: `01-sandbox/boundaries.sh`
prints what Neo can and cannot touch, `03-guardrails/try-destroy.sh` and
`03-guardrails/try-egress.sh` trip the guardrails on purpose, and
`01-sandbox/record.sh` records the whole happy path with asciinema as the
on-stage fallback.

### The kit in one paragraph

[`neo-kit/`](neo-kit) is a `kind: sandbox` Docker Sandboxes kit. It points at
the published infrastructure-sandbox image, declares the Pulumi Cloud token as
a proxy-managed credential (the container only ever sees
`PULUMI_ACCESS_TOKEN=proxy-managed`), carries a default-deny egress allow-list
(Pulumi Cloud, AWS S3/STS in the demo region, package registries, GitHub), and
starts `pulumi neo` through a small entrypoint that prints the sandbox
boundaries first. A PATH-shim guard blocks destructive `pulumi`, `aws`,
`terraform` and `tofu` commands and logs the attempts; Neo runs shell tool calls
through `sh -c`, so they resolve through the shims. Approval and permission
modes are kit arguments (`--kit-arg approvalMode=balanced`) or per-session
environment overrides (`--env NEO_SANDBOX_PERMISSION_MODE=read-only`). Details
and the "not verified yet" list in [neo-kit/README.md](neo-kit/README.md).

### What we expect from the Docker segment

Mike Coleman owns a clearly marked 10-minute slot in the deck (section
"Docker Sandboxes", one title slide plus three placeholder slides, each
marked `<!-- MIKE: replace -->` in `slides/slides.md`). What the Pulumi half
of the deck assumes he covers, because the demo leans on it:

- **microVM isolation**: each sandbox is its own VM with its own kernel,
  filesystem, Docker Engine and network; the host is not reachable beyond the
  mounted workspace (direct mount, clone mode, mountless).
- **Kits**: the `spec.yaml` grammar (v2): `sandbox.image`/`entrypoint`,
  `permissions.network`, `credentials`, `setup.install/startup/files`,
  `agentInstructions`; mixin vs sandbox kits; loading from a directory, git or an
  OCI registry.
- **Secret injection**: `sbx secret set`, the host-side credential proxy that
  injects headers on declared domains only, sentinel values inside the VM,
  credential bindings for third-party kits, `sbx policy log`.

If he covers something else, the Pulumi slides in section 4 ("The kit") and the
demo slides stay valid; they only reference these three ideas.

## Open questions

Everything that could not be verified or decided while preparing this folder
(host-only checks, credentials, Mike's input, unclear docs) is in
[OPEN-QUESTIONS.md](OPEN-QUESTIONS.md). The most important one: the runbook was
written and each piece was tested in isolation, but a full end-to-end run with
`sbx` needs a host with virtualization and your credentials.

## Sources

Facts in the deck come from these pages, read on September 12, 2026:

- Workshop page: https://www.pulumi.com/events/neo-in-a-docker-sandbox/
- Pulumi Neo in the CLI: https://www.pulumi.com/docs/ai/neo/pulumi-cli/ and
  the launch post https://www.pulumi.com/blog/pulumi-neo-cli/
- Neo's permissions model: https://www.pulumi.com/docs/ai/neo/permissions/
- Neo tasks (approval modes, Plan Mode): https://www.pulumi.com/docs/ai/neo/tasks/
- Neo handoff skill: https://www.pulumi.com/docs/ai/skills/
- `pulumi neo` command reference: https://www.pulumi.com/docs/iac/cli/commands/pulumi_neo/
- Pulumi ESC AWS OIDC: https://www.pulumi.com/docs/esc/environments/configuring-oidc/aws/
- Docker Sandboxes: https://docs.docker.com/ai/sandboxes/ (architecture,
  isolation, kits, kit spec reference, credentials, shell agent, release notes)
- The kit this builds on: https://github.com/dirien/infrastructure-sandbox-kit
