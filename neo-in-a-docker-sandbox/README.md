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
├── AGENTS.md            conventions for agents (and humans) editing this folder
├── 01-sandbox/          host-side scripts: preflight, up (start/attach), boundaries, reset, record
│   └── region-kit/      one-file mixin kit: the regional AWS endpoints this demo needs
├── 02-app/              the demo Pulumi project (one S3 bucket) that Neo hardens live
├── 03-guardrails/       scripts that trip the guardrails on purpose (protected destroy preview, egress)
├── 04-policy/           Pulumi policy pack (CrossGuard): the demo bucket may not be opened to the public
└── slides/              Slidev deck (@pulumi/slidev-theme), speaker notes on every content slide
```

The numbered folders follow the demo flow: the sandbox (`01`), the task
(`02`), the guardrails (`03`) and the policy pack (`04`). The sandbox
itself comes from the published
[infrastructure-sandbox-kit](https://github.com/dirien/infrastructure-sandbox-kit);
nothing is built for the demo.

## Prerequisites

- A [Pulumi Cloud](https://app.pulumi.com/signup) account in an organization
  with Pulumi Neo enabled, and a personal access token. `pulumi login` on the
  host; the token is stored for all sandboxes once (`sbx secret set pulumi`).
- [Docker Sandboxes](https://docs.docker.com/ai/sandboxes/install/): the `sbx`
  CLI **≥ 0.42.0** (macOS 14+ on Apple silicon, Windows 11, or Ubuntu 24.04+
  with KVM). 0.42.0 is where `sbx run <kit-ref>` landed, which the demo uses.
  Docker Desktop is not required by `sbx`; it is only needed to build custom
  template images, and this workshop uses the published sandbox kit
  `ghcr.io/dirien/infrastructure-sandbox-kit:v0.10.0` and its template image
  `ghcr.io/dirien/infrastructure-sandbox:v0.10.0` (Pulumi CLI 3.260.0 with
  `pulumi neo`, Terraform, OpenTofu, AWS/Azure/gcloud CLIs) as-is.
- The Pulumi CLI (≥ 3.256.0; the demo runs 3.260.0 inside the sandbox) on the
  host for the bootstrap and the reset.
- A Pulumi ESC environment that hands out AWS credentials, which you almost
  certainly already have. The demo stack imports it, so no AWS key lives on the
  laptop or in the sandbox. If you need to create one, follow
  [Configuring OIDC for AWS](https://www.pulumi.com/docs/esc/environments/configuring-oidc/aws/).
  The demo itself creates one S3 bucket.
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

The demo is four beats in about eleven minutes: one secret and one kit give you
a shell in the sandbox, `boundaries.sh` shows what Neo can and cannot reach,
Neo hardens the bucket for real (preview → approve → up), and then `protect:
true` refuses to delete it. Set it up once, then run steps 2 and 3 as often as
you like:

```bash
# 0. once: point the demo stack at the ESC environment you already have
cd 02-app && npm install
pulumi stack init <org>/dev
pulumi config env add <your-project>/<your-env> --stack dev --yes    # AWS credentials come from here
pulumi up                                     # creates the protected demo bucket
cd ..

# 1. once: the Pulumi token for all sandboxes and GHCR as a kit source; then check the host
sbx settings set kit.allowedSources '["docker.io/","ghcr.io/dirien/"]'
sbx secret set pulumi
01-sandbox/preflight.sh

# 1b. once: publish the policy pack and switch it on (mandatory; blocks a public bucket)
cd 04-policy && npm install
pulumi policy publish <org>
pulumi policy enable <org>/neo-workshop-guardrails latest    # default group: every stack in the org
cd ..

# 2. start the sandbox from the published kit (first run pulls the image and asks you to approve the pulumi credential binding)
01-sandbox/up.sh                              # a shell in the VM: pulumi whoami -v, then pulumi neo

# 3. between runs
01-sandbox/reset.sh                           # remove sandbox, restore index.ts, reconcile the stack
01-sandbox/reset.sh --destroy                 # after the last session: unprotect + destroy the bucket
```

Everything the demo shows is scripted so it can be replayed: `01-sandbox/boundaries.sh`
prints what Neo can and cannot touch, `03-guardrails/try-destroy.sh` (a
destroy preview the protected bucket refuses) and
`03-guardrails/try-egress.sh` trip the guardrails on purpose, the policy pack in
[`04-policy/`](04-policy) refuses a public bucket on every `pulumi preview` and
`pulumi up`, and
`01-sandbox/record.sh` records the whole happy path with asciinema as the
on-stage fallback.

### The kit in one paragraph

The demo uses the published sandbox kit from
[dirien/infrastructure-sandbox-kit](https://github.com/dirien/infrastructure-sandbox-kit),
`ghcr.io/dirien/infrastructure-sandbox-kit:v0.10.0`. It names the template
image `ghcr.io/dirien/infrastructure-sandbox:v0.10.0`, where the IaC tools are
baked in and verified by checksum or signature, and it declares the Pulumi
Cloud token as a proxy-managed credential (the VM only ever sees
`PULUMI_ACCESS_TOKEN=proxy-managed`) plus a default-deny egress allow-list.
You store the token once with `sbx secret set pulumi`; it is global, so every
sandbox created afterwards whose kit declares `pulumi` gets it. Inside, the
v0.10.0 kit opens a shell, and the Pulumi CLI works as usual: `pulumi whoami`,
`pulumi preview`, `pulumi neo`. Neo's approval and permission modes are its own
flags (`--approval-mode`, `--permission-mode`); deletes stop at Neo's approval
prompt and at `protect: true` on the bucket, and the policy pack in
[`04-policy/`](04-policy) refuses a public bucket on every preview and update.

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
