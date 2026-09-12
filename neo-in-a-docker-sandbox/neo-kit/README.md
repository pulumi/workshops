# Neo sandbox kit (`neo-kit/`)

A `kind: sandbox` Docker Sandboxes kit that runs **Pulumi Neo** (`pulumi neo`)
as the agent inside the infrastructure sandbox instead of Claude Code. It reuses
the prebuilt image published by
[dirien/infrastructure-sandbox-kit](https://github.com/dirien/infrastructure-sandbox-kit)
(`ghcr.io/dirien/infrastructure-sandbox:v0.9.0`: Pulumi CLI 3.260.0 with
`pulumi neo`, Terraform, OpenTofu, kubectl/Helm, AWS/Azure/gcloud CLIs), the same
Pulumi credential injection and the same egress allow-list as that kit's
`sandbox-kit/spec.yaml`, and adds:

- an entrypoint that prints the sandbox boundaries and execs `pulumi neo` with
  the approval and permission modes you chose;
- a PATH-shim **guard** that blocks destructive `pulumi`, `aws`, `terraform` and
  `tofu` commands, whoever types them (Neo runs shell tool calls through `sh -c`,
  so they resolve through the shims);
- two kit arguments, `approvalMode` and `permissionMode`, with safe defaults.

It lives in the [Neo in a Docker Sandbox](..) workshop folder and works on its
own. The kit is loaded from this directory; the upstream kit repo is untouched.

## Run it

```bash
# one-time on the host: bind the Pulumi token
sbx secret set -g pulumi

# from this folder (local kits are allowed by default); workspace = a directory with a Pulumi.yaml
cd neo-in-a-docker-sandbox
sbx run --name neo-demo ./neo-kit ./02-app

# or straight from git, after allowing the source once
sbx settings set kit.allowedSources '["docker.io/","github.com/pulumi/"]'
sbx run --name neo-demo "git+https://github.com/pulumi/workshops.git#dir=neo-in-a-docker-sandbox/neo-kit" ./02-app
```

`sbx` ≥ 0.42.0 is required: the kit reference goes in the agent position
(`sbx run <kit-ref> [PATH]`), and kit arguments landed in 0.42.0. The first run
asks you to approve the `pulumi` credential binding (the kit declares which
domain gets the token; you approve it once).

Modes:

```bash
# at create time, through kit arguments
sbx run --name neo-demo ./neo-kit ./my-project --kit-arg approvalMode=balanced
sbx run --name neo-demo ./neo-kit ./my-project --kit-arg permissionMode=read-only

# for one session, when re-attaching to an existing sandbox
sbx run --name neo-demo --env NEO_SANDBOX_PERMISSION_MODE=read-only
sbx run --name neo-demo --env NEO_SANDBOX_APPROVAL_MODE=auto

# anything after -- is appended to the pulumi neo command line
sbx run --name neo-demo -- "what's in this stack?"
```

`manual` (the console's *Review* mode) prompts before every tool call, `balanced`
auto-approves low-risk calls and still asks before `pulumi up`, `auto` never
asks. `read-only` blocks Pulumi Cloud writes while keeping reads, previews, code
edits and pull requests. Plan mode is toggled inside the TUI with Shift+Tab
before the first message. See the
[Neo CLI docs](https://www.pulumi.com/docs/ai/neo/pulumi-cli/) and the
[permissions model](https://www.pulumi.com/docs/ai/neo/permissions/).

## What Neo can and cannot touch

| | Where the boundary is enforced |
|---|---|
| Host filesystem | Only the workspace you pass is mounted (hypervisor + virtiofs). Use `--clone` to keep even that read-only. |
| Pulumi Cloud token | Never in the VM. `PULUMI_ACCESS_TOKEN=proxy-managed`; the host proxy injects `Authorization: token …` on `api.pulumi.com` only. |
| Cloud credentials | None in the VM. Stacks import a Pulumi ESC environment that mints short-lived OIDC credentials at `pulumi up` time. |
| Network | Default-deny; the kit's `permissions.network.allow` is the whole reachable set. `sbx policy log <sandbox>` on the host shows every allowed and blocked request. |
| Pulumi Cloud writes | Neo runs as your Pulumi user (RBAC); `--permission-mode read-only` removes writes; `pulumi up` needs approval in `manual` and `balanced`. |
| Resource deletion | The guard shims block `pulumi destroy`, `stack rm`, `state delete`, `aws … delete-*`, `terraform destroy`, … ; `protect: true` on resources makes the engine refuse too. |

The guard is a seatbelt against accidents, not a security boundary: the agent
has sudo inside the VM. Everything above the last row is enforced outside the VM
or by Pulumi Cloud.

## The guard

`files/home/.local/share/neo-sandbox/`:

| File | Role |
|---|---|
| `neo-sandbox.sh` | entrypoint: PATH, project discovery, banner, `exec pulumi neo …` |
| `guard.sh` | called by the shims; matches the argument line against `destructive.patterns`, logs and blocks with exit 2, otherwise execs the real binary |
| `destructive.patterns` | `tool|regex` per line (`*` = any tool) |
| `install-shims.sh` | writes `~/.local/bin/{pulumi,aws,terraform,tofu,neo-sandbox}` and puts `~/.local/bin` first on PATH in `~/.profile`/`~/.bashrc`; runs at create and on every start |

Blocked attempts are appended to `~/.local/state/neo-sandbox/guard.log`. To lift
the guard for one sandbox (for example to run `pulumi destroy` at the end of a
demo), a human creates the allow file from the host:

```bash
sbx exec neo-demo sh -c 'mkdir -p ~/.config/neo-sandbox && touch ~/.config/neo-sandbox/allow-destructive'
sbx exec -it neo-demo bash -lc 'cd /path/to/project && pulumi destroy'
sbx exec neo-demo rm -f /home/agent/.config/neo-sandbox/allow-destructive
```

Test the guard without a sandbox (the same test the CI lint job runs):

```bash
bash neo-kit/test/guard-test.sh
```

## How this differs from the Claude Code kits

| | infrastructure-sandbox-kit `kit/` + `sandbox-kit/` (Claude Code) | this `neo-kit/` (Pulumi Neo) |
|---|---|---|
| Agent | Claude Code, from the image | `pulumi neo`, via the entrypoint |
| Guardrails | Claude Code hooks (PreToolUse guard, PostToolUse secret scan) from `dirien/my-claude-apm-setup` | PATH shims (Neo has no hook system); same idea, enforced for any process that resolves tools through PATH |
| MCP | the `pulumi` MCP server registered for Claude | not needed: Neo ships the Pulumi skills and registry knowledge and gets integrations from Pulumi Cloud |
| Agent instructions | `CLAUDE.md` profile + `kits-memory/` | `AGENTS.md` profile (see caveat below) plus the project's own `AGENTS.md` |

Caveat on `agentInstructions`: sbx writes the profile file next to the
workspace, and Neo's filesystem tool is restricted to the workspace (plus
`/tmp`), so Neo may not see the kit's `AGENTS.md`. Put instructions Neo must
read in an `AGENTS.md` inside the project.

## Not verified yet

Kits are experimental and `sbx` is a host tool, so these need a run on a real
host (they are listed in [`../OPEN-QUESTIONS.md`](../OPEN-QUESTIONS.md)):

- whether `sbx run … -- <args>` is appended to a custom entrypoint (the wrapper
  accepts extra arguments either way);
- whether `sbx run --env` on re-attach overrides a kit-argument value baked at
  create time;
- Neo's SSE event stream to `api.pulumi.com` through the injecting proxy over a
  long session (0.42.1 fixed an HTTP/2 framing bug in the proxy; Neo reconnects
  with `Last-Event-ID` on transient drops).
