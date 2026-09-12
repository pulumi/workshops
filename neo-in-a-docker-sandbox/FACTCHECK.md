# Fact check of the deck

Every technical claim on a slide or in its speaker notes, checked against the
source on September 12, 2026. Slide numbers refer to `slides/slides.md` in
deck order (52 slides). Status: **ok** (matches the source), **fixed** (the
slide or the demo was corrected; see Corrections), **source code** (verified in
the product's source rather than its docs), **own artifact** (a fact about
files in this folder, checked against the file).

## Sources read

| Key | Source |
|---|---|
| CLI | https://www.pulumi.com/docs/ai/neo/pulumi-cli/ |
| NEO | https://www.pulumi.com/docs/ai/neo/ |
| PERM | https://www.pulumi.com/docs/ai/neo/permissions/ |
| TASKS | https://www.pulumi.com/docs/ai/neo/tasks/ |
| EDITORS | https://www.pulumi.com/docs/ai/neo/editors/ |
| SKILLS | https://www.pulumi.com/docs/ai/skills/ |
| REF | https://www.pulumi.com/docs/iac/cli/commands/pulumi_neo/ and `pulumi neo --help` (3.260.0 in the image, 3.256.0 locally, same flags) |
| BLOG | https://www.pulumi.com/blog/pulumi-neo-cli/ (May 20, 2026) |
| SRC | pulumi/pulumi `pkg/cmd/pulumi/neo/` (`neo.go`, `tools/shell.go`, `tools/filesystem.go`, `tools/pulumi.go`) |
| ESC | https://www.pulumi.com/docs/esc/ |
| ESC-AWS | https://www.pulumi.com/docs/esc/guides/configuring-oidc/aws/ |
| DS | https://docs.docker.com/ai/sandboxes/ (overview) |
| DS-AGENTS | https://docs.docker.com/ai/sandboxes/agents/ and `sbx run --help` (CLI reference in docker/docs `data/sbx_cli/sbx_run.yaml`) |
| DS-SHELL | https://docs.docker.com/ai/sandboxes/agents/shell/ |
| DS-TPL | https://docs.docker.com/ai/sandboxes/customize/templates/ |
| DS-KITS | https://docs.docker.com/ai/sandboxes/customize/kits/ |
| DS-KITREF | https://docs.docker.com/ai/sandboxes/customize/kit-reference/ |
| DS-CRED | https://docs.docker.com/ai/sandboxes/configuration/credentials/ |
| DS-ISO | https://docs.docker.com/ai/sandboxes/security/isolation/ |
| DS-DEF | https://docs.docker.com/ai/sandboxes/security/defaults/ |
| DS-ARCH | https://docs.docker.com/ai/sandboxes/architecture/ |
| DS-REL | https://docs.docker.com/ai/sandboxes/release-notes/ (0.42.0, 0.42.1) |
| DS-CLI | docker/docs `data/sbx_cli/*.yaml` (`sbx rm`, `sbx policy log`, `sbx secret set`, `sbx exec`) |
| KIT | https://github.com/dirien/infrastructure-sandbox-kit (README, `kit/spec.yaml`, `sandbox-kit/spec.yaml`, `template/Dockerfile`, `docs/credentials.md`, `docs/network.md`, `scripts/`) at v0.9.0 |
| EVENT | https://www.pulumi.com/events/neo-in-a-docker-sandbox/ |
| REPO | this folder: `neo-kit/`, `00-esc/`, `02-app/`, `01-sandbox/`, `03-guardrails/`, `DEMO.md`; the guard test suite and the `docker run` test of the entrypoint inside `ghcr.io/dirien/infrastructure-sandbox:v0.9.0` |

Product names on every slide follow the Pulumi terminology page: Pulumi Neo
(or Neo), Pulumi ESC, Pulumi Cloud, Pulumi IaC, Pulumi console. No slide uses
Copilot, Pulumi Service or Insights.

## Corrections

1. **Slide 47 and `00-esc/index.ts`: the OIDC subject.** The slide said the
   trust policy pins the subject to the `neo-workshop` environments, and the
   bootstrap used `pulumi:environments:org:<org>:env:neo-workshop/*`. ESC-AWS
   says a Pulumi IaC stack that imports an environment presents the literal
   subject `pulumi:environments:org:<org>:env:<yaml>`, so that pattern would
   have failed the demo's `pulumi up`. The demo was fixed, not the slide's
   intent: the trust policy now uses the documented default
   `pulumi:environments:org:<org>:env:*` and the slide says "Audience
   aws:<org>, subject env:*". Pinning one environment needs
   `subjectAttributes` (ESC-AWS, "Subject claim customization"); open
   question 18.
2. **Slide 14: "Reads never prompt, in any mode."** PERM says the console's
   approval gates cover `pulumi preview`, `pulumi up` and pull requests and not
   bare reads, but REF says the CLI's `manual` mode "prompts on every call".
   The slide now says "Console gates: preview, up, pull request" and the notes
   carry the difference; the demo notes keep "even file reads ask" (CLI).
3. **Slide 45: `{ "Status": "Enabled" }`.** The AWS CLI reference page was
   fetched but the output example could not be read from it, so the output
   block was removed from the slide; the expectation stays in DEMO.md and the
   notes.
4. **Slide 30: the pattern lines.** One regex on the slide was a shortened
   rewrite; all four lines are now verbatim from `destructive.patterns`.
5. **Slide 41: expected outputs.** The paraphrased outputs of
   `boundaries.sh` (proxy log columns, error texts) have not been observed on
   a host; the block now lists the seven checks by the command each runs.

## Claims by slide

### Part 1: why this matters (slides 1 to 7)

| Slide | Claim | Source | Status |
|---|---|---|---|
| 1 | Title, subtitle, three speakers and their titles | EVENT | ok |
| 4 | Part durations 5/5/10/10/10/15/3/2 | README timing table (own) | own artifact |
| 5, 6 | "An agent that breaks your laptop is annoying, an agent that breaks production comes with a postmortem"; "letting the agent in anyway, safely" | EVENT abstract | ok |
| 6 | `pulumi destroy` deletes resources; there is no undo | Pulumi CLI semantics; framing from the abstract | ok (framing) |
| 7 | The four learning outcomes | EVENT "What you'll learn" | ok, verbatim in the notes |

### Part 2: infra is not a codebase (slides 8 to 10)

| Slide | Claim | Source | Status |
|---|---|---|---|
| 9 | Review unit is a preview against live state; deletes are permanent; tests run in real accounts | Framing; `pulumi preview` semantics (NEO: "run pulumi preview to validate a change… show the resource diff") | ok (framing) |
| 10 | Who: your Pulumi user, RBAC; "never has more access than you do, only less" | PERM, NEO | ok |
| 10 | What: permission mode; `protect: true` | PERM; Pulumi resource option `protect` (used in `02-app/index.ts`) | ok |
| 10 | When: approval mode, Plan Mode | PERM, TASKS | ok |
| 10 | Where: microVM, one mounted folder, allow-list | DS-ISO, DS-DEF | ok |
| 10 | With what: ESC credentials, one hour | ESC-AWS (`duration: 1h`), `00-esc` | ok |
| 10 | What if: guard, proxy log, audit trail | REPO (guard), DS-CLI (`sbx policy log`), PERM (audit through Pulumi Cloud) | ok |

### Part 3: Neo in the CLI (slides 11 to 21)

| Slide | Claim | Source | Status |
|---|---|---|---|
| 12 | Neo lives in Pulumi Cloud: tasks, automations, pull requests, code reviews | NEO | ok |
| 12 | Ships the Pulumi Agent Skills catalog built in | SKILLS, NEO | ok |
| 12 | Integrations: GitHub, Slack, Datadog, PagerDuty (notes add Linear, Atlassian) | CLI ("GitHub, Slack, and the rest of the integration catalog"), NEO, BLOG | ok |
| 12 | Over 4,500 organizations before the CLI launch | BLOG | ok |
| 12 | In the terminal since May 2026 | BLOG date May 20, 2026 | ok |
| 12 notes | Scaffolding, migrating, investigating, operationalizing | BLOG | ok |
| 13 | Inherits authenticated CLIs, environment variables, kubeconfigs, the project | CLI, BLOG, NEO | ok |
| 13 | Tool calls run on your machine | REF (`--help`: "Filesystem and shell tool calls from the agent run on this machine") | ok |
| 13 | The reasoning stays in Pulumi Cloud / same backend | REF ("instead of in the cloud agent container"), BLOG ("Both reach the same Neo backend") | ok |
| 13 notes | Investigate a failed preview, change the program, read live stack state; interactive; asynchronous work in Pulumi Cloud Neo | CLI, BLOG | ok |
| 14 | `manual` prompts on every tool call; console name Review | REF flag help; CLI, PERM | ok |
| 14 | `balanced` asks only before `pulumi up`; `auto` never | PERM | ok |
| 14 | Console gates: preview, up, pull request | PERM | fixed (see Corrections 2) |
| 14 notes | Neo investigates autonomously without a prompt per read | PERM "What triggers an approval prompt" | ok |
| 15 | `default` = full RBAC; `read-only` = no Pulumi Cloud writes, keeps reads, previews, code, PRs | PERM, REF | ok |
| 15 | Two independent axes; org admins set defaults, users override per task | PERM | ok |
| 16 | Plan Mode: Shift+Tab before the first message; plan, iterate, explicit approval; task-level, composes with any mode | CLI, TASKS, PERM | ok |
| 16 notes | Best for multi-stack operations and unfamiliar infra | TASKS | ok |
| 17 | Read-only is scoped to Pulumi Cloud, not the cloud account; Neo can still open ESC environments; boundary is RBAC plus ESC access; prefer read-only cloud roles; docs quote | PERM (verbatim) | ok |
| 18 | `--approval-mode`, `--permission-mode`, `--print`, `--debug-update`, `resume` | REF | ok |
| 18 | Editors host Neo over ACP (Zed, JetBrains, VS Code, Cursor) | EDITORS, NEO | ok |
| 18 notes | `--print` rejects `manual` and defaults to `auto` | SRC `neo.go` | source code |
| 18 notes | `resume` does not re-execute historical tool calls | `pulumi neo resume --help` | ok |
| 18 notes | Full flag list incl. `--debug-preview`, `--disable-integrations`, `--org`, `--cwd`, `-s` | REF | ok |
| 19 | Neo's tools see the working directory (plus `/tmp`) | SRC `tools/shell.go`, `tools/filesystem.go`, `neo.go` (`extraRoots`) | source code |
| 19 | The kit's profile file lands outside the workspace | DS-KITS example tree (`AGENTS.md` next to the workspace directory) | ok, by example only |
| 19 | The docs do not promise AGENTS.md auto-loading | Absent from CLI, NEO, TASKS, PERM, SKILLS, EDITORS, BLOG | ok (absence); open question 9 |
| 19 | The demo project carries an AGENTS.md | `02-app/AGENTS.md` | own artifact |
| 20 | `pulumi-neo-handoff` packages goal, repo pointers, summary; returns a task URL; clients list; runs `pulumi neo` underneath | SKILLS, CLI, BLOG | ok |
| 20 notes | Install commands (`/plugin install pulumi-delegation`, `npx skills add …`) | SKILLS | ok |
| 21 | Runs as your Pulumi user via `pulumi login`; same RBAC and audit | CLI, PERM | ok |
| 21 | RBAC evaluated at execution time | PERM | ok |
| 21 | VCS writes as the shared Pulumi GitHub App | PERM (GitHub.com row) | ok |
| 21 | ESC secrets a task reads can reach the model; task events scanned and redacted; "defense in depth rather than a guarantee" | PERM | ok |
| 21 notes | Per-task role assumption on Enterprise and Business Critical | PERM | ok |

### Part 4: the kit (slides 22 to 33)

| Slide | Claim | Source | Status |
|---|---|---|---|
| 23 | Built-in agents: Claude Code, Codex, Copilot, Cursor, Devin, Docker Agent, Droid, Gemini, Kiro, OpenCode; shell is agent-less | DS-AGENTS, DS-SHELL | ok |
| 23 | `pulumi neo` is not a built-in agent | DS-AGENTS (absent) | ok |
| 23 | Templates customize an existing agent's environment; kits define a new agent | DS-TPL ("don't create new agent runtimes… To define a new agent from scratch, see Kits") | ok |
| 24 | Way 1: `sbx run shell`, install the agent manually, run it | DS-SHELL | ok; the one command on a slide not run in DEMO.md, shown as the alternative the brief asked for |
| 24 | Way 2: a sandbox kit defines the agent; pinned CLIs, proxy-managed token, allow-list, guard; loads from a directory, git or OCI | DS-KITS, DS-KITREF, `neo-kit/spec.yaml` | ok |
| 24 | One command starts it | DEMO.md step 1 | ok |
| 27 | Image `ghcr.io/dirien/infrastructure-sandbox:v0.9.0`, multi-arch, from `docker/sandbox-templates:claude-code-docker` | KIT `sandbox-kit/spec.yaml`, `template/Dockerfile` | ok |
| 27 | Pulumi 3.260.0 with `pulumi neo` | KIT v0.9.0 pins; verified by running `pulumi version` and `pulumi neo --help` in the image | ok |
| 27 | Terraform 1.16.0, OpenTofu 1.12.6, kubectl 1.37.0, Helm 4.2.4, AWS CLI 2.36.34, Azure CLI, gcloud; language servers | KIT v0.9.0 pins; `terraform`, `tofu`, `aws --version` run in the image | ok |
| 27 | Checksums or signatures on every core tool | KIT README hardening table | ok |
| 27 | Three ways in (mixin, template plus mixin, sandbox kit) | KIT README | ok |
| 27 | Repo tree | KIT layout section; this folder | ok |
| 28 | The `credentials:` block | `neo-kit/spec.yaml` minus `format` and `required` | own artifact |
| 28 | A kit declares, the host binds; kits cannot read host env or files | DS-KITREF "Credentials" | ok |
| 28 | `PULUMI_ACCESS_TOKEN=proxy-managed` inside; proxy rewrites the header on `api.pulumi.com` only | DS-KITREF (`proxyManaged`, `inject`), DS-CRED, KIT README | ok |
| 28 | Enough for `pulumi login`, `neo`, `up`, `env` | KIT README (login, up, env); `pulumi neo` uses the same `pulumi login` (CLI) | ok |
| 28 notes | First-run binding approval; `~/.config/sbx/credentials.yaml` | DS-CRED "Credential bindings" | ok |
| 28 notes | AWS signs with the key (SigV4), so a key would live in the VM | KIT `docs/credentials.md`, README | ok |
| 29 | Allow-list excerpt | `neo-kit/spec.yaml` (41 hosts) | own artifact |
| 29 | Default-deny; all outbound TCP through a host proxy; UDP and ICMP blocked; policy-aware DNS | DS-DEF, DS-ISO | ok |
| 29 | Exact hosts, `host:port`, `*.host` enforced; `**.host` and CIDR pending | DS-KITREF network table | ok |
| 29 | `sbx policy log` shows hosts, matching rule, proxy type, request count | DS-CLI `sbx policy log` | ok |
| 29 notes | Org governance: only org allow rules grant access; kit deny rules still apply | DS-KITS | ok |
| 30 | Claude kit: PreToolUse guard and PostToolUse secret scan | KIT README, `scripts/apply-agent-config.sh`, the hook scripts | ok |
| 30 | Neo runs shell tool calls through `sh -c` | SRC `tools/shell.go` (`ShellInvocation`) | source code |
| 30 | Shims front pulumi, aws, terraform, tofu; match, log, exit 2, else exec; `guard.log` | `neo-kit/files/.../guard.sh`, `install-shims.sh`; guard test suite; run in the image | own artifact |
| 30 | The four pattern lines | `destructive.patterns` verbatim | fixed (Corrections 4) |
| 31 | The agent has sudo inside the VM; the hypervisor boundary is the isolation control | DS-ISO | ok |
| 31 | Hypervisor, allow-list and proxy sit outside the VM | DS-ISO, DS-ARCH | ok |
| 31 | RBAC and `protect: true` sit in Pulumi Cloud / the engine | PERM; Pulumi `protect` option | ok |
| 31 | A human lifts the guard with one file | `guard.sh` (`allow-destructive`) | own artifact |
| 32 | The Claude kit registers the `pulumi` MCP server (`mcp.ai.pulumi.com`) | KIT README, `.mcp.json` of the APM setup | ok |
| 32 | Docker routes agents through one host-side MCP gateway; org MCP policies enforced there | DS-ARCH "MCP gateway" | ok |
| 32 | Neo ships skills and registry knowledge; external MCP from Pulumi Cloud | SKILLS, NEO ("Pulumi MCP server", integrations) | ok |
| 32 | MCP integration credentials never exposed to the model; `--disable-integrations`; CLI integrations run as `pulumi env run` | PERM, REF | ok |
| 25 | The eight spec lines | `neo-kit/spec.yaml` (214 lines total) trimmed | own artifact |
| 25 | `kind: sandbox` defines a full agent; a mixin extends one | DS-KITS, DS-KITREF | ok |
| 25 | Entrypoint execs `pulumi neo` with the modes from kit arguments | `neo-sandbox.sh`; kit args are a 0.42 feature (DS-KITS, DS-REL) | own artifact / ok |
| 25 notes | Base image requirements (UID 1000 `agent`, passwordless sudo, proxy variables across sudo) | DS-KITREF "Sandbox block" | ok |
| 26 | `sbx secret set -g pulumi`; `sbx run --name neo-demo ./neo-kit ./02-app` | DEMO.md (before the session; step 1 via `01-sandbox/up.sh`) | ok |
| 26 | Sandbox kit reference in the agent position since 0.42.0; `--kit` for mixins | DS-KITS "Using kits", DS-REL 0.42.0 | ok |
| 26 | First run pulls the image and asks to approve the credential binding | DS-CRED (first-run approval), DEMO.md | ok |
| 26 | Re-attach with `sbx run --name neo-demo` | DS-CLI `sbx run` ("re-attach to an existing sandbox by name"); `01-sandbox/up.sh` | ok |
| 26 | `sbx rm -f neo-demo` removes the VM and its scoped secrets | DS-CLI `sbx rm`, DS-REL 0.42.0; DEMO.md | ok |
| 26 notes | `--env` on re-attach applies to the agent session | DS-CLI `sbx run --env` | ok; precedence over kit args is open question 3 |
| 33 | The six rows | Rows 1 to 4: DS-ISO, DS-CRED, ESC-AWS, DS-DEF; rows 5 and 6: PERM, guard, `protect` | ok |

### Part 5: Docker Sandboxes placeholders (slides 34 to 37)

| Slide | Claim | Source | Status |
|---|---|---|---|
| 35 | Own kernel, filesystem, Docker Engine, network; only the workspace is shared; clone mode read-only at `/run/sandbox/source`; sandboxes cannot talk to each other; `sbx rm` deletes everything | DS-ISO, DS-ARCH | ok |
| 36 | One `spec.yaml`; mixin vs sandbox kits; load from directory, git, OCI; `kit.allowedSources`; installs run as root | DS-KITS, DS-KITREF | ok |
| 37 | `sbx secret set` stores in the OS keychain; sentinel in the VM; header injected on the declared domain; bindings for third-party kits; `--ref`, `--command`; OAuth sentinels and `passthrough` | DS-CRED, DS-KITREF | ok |

### Part 6: demo (slides 38 to 45)

| Slide | Claim | Source | Status |
|---|---|---|---|
| 39 | Six steps with 2 / 2 / 5 / 2.5 / 2 / 1.5 minutes | DEMO.md timing table (targets, not measured; open question 1) | own artifact |
| 40 | `01-sandbox/up.sh` = `sbx run --name neo-demo ./neo-kit ./02-app` | `01-sandbox/up.sh`, DEMO.md | ok |
| 40 | Install step is a no-op on this image | `neo-kit/spec.yaml` (sentinel in KIT `scripts/provision.sh`) | ok |
| 40 | The entrypoint prints the boundaries, then the TUI starts | `neo-sandbox.sh`; banner observed in the image test | own artifact |
| 40 notes | Banner contents | image test output | own artifact |
| 41 | The seven checks | `01-sandbox/boundaries.sh` | own artifact; outputs not observed on a host (Corrections 5) |
| 42 | The prompt | DEMO.md step 3 | ok |
| 42 | Preview runs in the VM with ESC credentials | ESC (stack import), `02-app/Pulumi.dev.yaml` | ok |
| 42 notes | Expected resources `aws.s3.BucketVersioning`, `BucketServerSideEncryptionConfiguration`, `BucketPublicAccessBlock` | `@pulumi/aws` 7.46.0 in `02-app/node_modules` | ok |
| 43 | `01-sandbox/up.sh --env NEO_SANDBOX_PERMISSION_MODE=read-only -- "…"` | DEMO.md step 4 | ok |
| 43 | The deploy is refused in read-only mode | PERM ("removes the ability to trigger writes in Pulumi Cloud") | ok; whether a shelled-out `pulumi up` is also refused is open question 11 |
| 44 | The guard message | Observed in the image test | ok |
| 44 | Three layers | Slides 26, 27 sources | ok |
| 45 | The commands | DEMO.md step 6 | ok |

### Part 7 and wrap-up (slides 46 to 52)

| Slide | Claim | Source | Status |
|---|---|---|---|
| 47 | The environment YAML | `00-esc/index.ts` output, matching the ESC-AWS example (`fn::open::aws-login`, `oidc`, `duration: 1h`, `roleArn`, `sessionName`) | ok |
| 47 | AWS trusts `api.pulumi.com/oidc`; audience `aws:<org>`; subject `env:*` | ESC-AWS | fixed (Corrections 1) |
| 47 | Opening the environment mints STS credentials (`pulumi up`, `pulumi env open`, `pulumi env run`) | ESC-AWS (`pulumi env open` validation), ESC ("Use ESC with Pulumi IaC", "Run commands with pulumi env run") | ok |
| 47 | `Pulumi.dev.yaml` imports it | `02-app/Pulumi.dev.yaml`; ESC "Use ESC with Pulumi IaC" | ok |
| 48 | One-hour credentials; least-privilege S3 policy | `00-esc/index.ts`; ESC-AWS | ok |
| 48 | Who can open an environment is Pulumi RBAC; open approvals cover Neo | PERM ("environment:open", "ESC open approvals") | ok |
| 48 notes | Login providers for Azure and Google Cloud; secrets from Vault, 1Password, Secrets Manager | ESC index ("Login providers… AWS, Azure, GCP, GitHub, and more"; "Secrets Integrations") | ok |
| 49 | Recap lines | Sources above | ok |
| 50 | The five URLs | Checked when the QR codes were generated | ok |
| 51 | "Sign up to follow along" | EVENT | ok; which plans include Neo is open question 19 |
| 52 | Names and titles | EVENT | ok |

## Unverified

Nothing unverified remains on a slide. These items live only in notes, DEMO.md
or OPEN-QUESTIONS.md:

- Expected terminal output of `01-sandbox/boundaries.sh`, `sbx policy log`
  columns, and the AWS API answer in step 6 (open questions 1, 3).
- Whether `sbx run … -- <args>` reaches the kit's entrypoint and whether
  `--env` on re-attach overrides kit-argument values (open question 3).
- Whether Neo in read-only mode also refuses a `pulumi up` typed through its
  shell tool (open question 11).
- Whether `pulumi neo` loads a project's AGENTS.md unprompted (open question 9).
- The exact subject claim format with `subjectAttributes` (open question 18).

## Commands on slides

Every `sbx` and `pulumi` command shown on a slide appears in DEMO.md or in a
script DEMO.md runs, with the same flags:

| Slide | Command | Where it runs |
|---|---|---|
| 26, 37 | `sbx secret set -g pulumi` | DEMO.md "Before the session" |
| 26, 40 | `sbx run --name neo-demo ./neo-kit ./02-app` | `01-sandbox/up.sh` (DEMO.md step 1) |
| 26 | `sbx run --name neo-demo` | `01-sandbox/up.sh` re-attach (DEMO.md steps 4 and 5) |
| 26 | `sbx rm -f neo-demo` | DEMO.md "If something breaks", `01-sandbox/reset.sh` |
| 29, 41 | `sbx policy log neo-demo` | `01-sandbox/boundaries.sh` (DEMO.md step 2) |
| 41 | `pulumi whoami -v`, `pulumi destroy --yes` | `01-sandbox/boundaries.sh` |
| 43 | `01-sandbox/up.sh --env NEO_SANDBOX_PERMISSION_MODE=read-only -- "…"` | DEMO.md step 4 |
| 44 | `pulumi destroy --yes` (blocked) | DEMO.md step 5, `03-guardrails/try-destroy.sh` |
| 45 | `git --no-pager diff --stat -- index.ts`, `pulumi env run … -- aws s3api get-bucket-versioning --bucket "$(pulumi stack output bucketName)"` | DEMO.md step 6 |
| 18 | `--approval-mode`, `--permission-mode` (set by the kit), `resume` (DEMO.md "If something breaks"); `--print` and `--debug-update` are listed from REF and not exercised by the demo | reference only |
| 24 | `sbx run shell` | not run in the demo; DS-SHELL documents it, the brief asks to show it as way 1 |
