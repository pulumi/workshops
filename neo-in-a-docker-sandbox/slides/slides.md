---
theme: "@pulumi/slidev-theme"
title: "Neo in a Docker Sandbox"
info: |
  Neo in a Docker Sandbox: Using Pulumi's Coding Agent for All Things Infra Safely and Securely.
  Adam Gordon Bell, Engin Diri (Pulumi) and Mike Coleman (Docker).

  Repo: https://github.com/pulumi/workshops/tree/main/neo-in-a-docker-sandbox
transition: slide-left
mdc: true
canvasWidth: 1920
aspectRatio: 16/9
highlighter: shiki
lineNumbers: false
layout: cover
defaults:
  layout: default
---

<div class="absolute inset-0 flex flex-col justify-center items-start px-20">
  <h1 class="!text-[5.4rem] !leading-[1.02] !font-semibold !tracking-tight !mb-6 !max-w-[95%]">
    Neo in a Docker Sandbox
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Using Pulumi's coding agent for all things infra, safely and securely
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Adam Gordon Bell · Community Engineer, Pulumi<br/>
    Engin Diri · Principal Solutions Architect, Pulumi<br/>
    Mike Coleman · Staff Solutions Architect, Docker
  </p>
</div>

<!--
30s. Suggested speaker: Adam. Read the title, one line per speaker. The
argument starts on slide 5. Arc of the hour: why infra is different, Neo's
controls, the kit, Docker Sandboxes with Mike, the demo, ESC, wrap-up.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
~20s. Two beats: housekeeping, then the agenda.
-->

---

# Housekeeping

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>Chat tab: be chatty</li>
  <li>Q&amp;A tab: questions, answered as we go</li>
  <li>Handouts tab: slides, runbook, scripts</li>
  <li>Recorded; the link comes by email</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
~30s. This is a show-only workshop: attendees watch, then take the repo home.
One folder in pulumi/workshops (neo-in-a-docker-sandbox) holds the kit, the
15-minute runbook (DEMO.md), every script and these slides. Nobody needs to
take notes; the recording link lands in the follow-up email.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.5rem] !leading-relaxed space-y-4">
  <li>Why infra is different <span class="text-[var(--p-fg-muted)]">· 10 min</span></li>
  <li>Pulumi Neo in the CLI <span class="text-[var(--p-fg-muted)]">· 10 min</span></li>
  <li>The infrastructure sandbox kit <span class="text-[var(--p-fg-muted)]">· 10 min</span></li>
  <li>Docker Sandboxes, with Mike <span class="text-[var(--p-fg-muted)]">· 10 min</span></li>
  <li>The demo <span class="text-[var(--p-fg-muted)]">· 15 min</span></li>
  <li>Pulumi ESC, wrap-up, Q&amp;A <span class="text-[var(--p-fg-muted)]">· 5 min</span></li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.6; }
</style>

<!--
~30s. Eight parts, folded into six lines: why this matters (5) and infra vs
codebase (5) are the first line; ESC (3) and wrap-up (2) are the last. Full
table: intro 5, infra vs codebase 5, Neo CLI 10, kit 10, Docker Sandboxes 10,
demo 15, ESC 3, wrap-up 2. Say the part names, not the minutes. The demo sits
in the middle; everything before it sets up what you will see.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[5.5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">An agent that breaks your laptop is annoying.</h1>
</div>

<!--
Part 1 divider. ~5s pause; the next slide finishes the sentence. Both lines
are from the workshop abstract on the event page.
-->

---

# An agent that breaks production comes with a postmortem

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted">
    <div class="gpu-caption gpu-caption--muted">On your laptop</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li><code>git checkout</code> undoes a bad edit</li>
      <li><code>rm -rf</code> costs an afternoon</li>
      <li>Secrets leak to your own disk</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary">
    <div class="gpu-caption gpu-caption--accent">In your cloud</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li><code>pulumi destroy</code> deletes customer data</li>
      <li>A leaked key is an incident</li>
      <li>There is no undo button</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
~90s. Suggested speaker: Adam. Coding agents changed how software gets
written, and almost nobody lets one near their infrastructure. The reason is
that the failure modes are not symmetric: the left card is the world people
know from coding agents, the right card is why platform teams say no. Do not
argue the point; the audience is here because they agree. Land the close from
the abstract: this session is about letting the agent in anyway, safely. We
put it in a sealed workspace with an identity that has limits and credentials
that expire.
-->

---

# You leave with four answers

<div class="zoom-content">

<ul class="!mt-8 !text-[1.5rem] !leading-relaxed space-y-5">
  <li>What changes when the target is infra</li>
  <li>What is inside a Docker Sandbox</li>
  <li>How a sandbox seals Neo's workspace</li>
  <li>How Pulumi ESC replaces static keys</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.7; }
</style>

<!--
~45s. These are the four promises on the event page, verbatim: (1) what
changes when a coding agent's target is your cloud instead of your codebase;
(2) what's inside a Docker Sandbox, and how to set up the perfect one for your
projects; (3) how Docker Sandboxes give Neo a sealed workspace where it can
work without supervision; (4) how Pulumi ESC replaces static API keys with
short-lived credentials for AWS, Azure, or Google Cloud. Map them out loud:
1 is the next part, 2 and 3 are the kit and Mike's part, 4 is the ESC part
after the demo.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Infra is not a codebase.</h1>
</div>

<!--
Part 2 divider. ~3s. Five minutes: what is different, then what that does to
the controls.
-->

---

# The credential is the blast radius

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted">
    <div class="gpu-caption gpu-caption--muted">A codebase</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Review a diff</li>
      <li>Revert with one command</li>
      <li>Tests run on fakes</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary">
    <div class="gpu-caption gpu-caption--accent">Your cloud</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Review a preview against live state</li>
      <li>Deletes are permanent</li>
      <li>Tests run in real accounts</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
~2 min. Suggested speaker: Engin. Walk the pairs: the unit of review is a
diff versus a preview against live state; mistakes are local and reversible
versus shared and often permanent (deletes, data, DNS); tests run on fakes
versus against real accounts with real credentials. Two more differences that
did not fit the slide: in a codebase secrets are an anti-pattern and the agent
rarely needs one, in your cloud secrets are the raw material and the agent
cannot work without cloud access; and the blast radius is one repo versus
everything the credential can reach. That is the thesis of the hour: with
infra, the credential is the blast radius, so the credential is what we
design.
-->

---

# Six questions decide what an agent can do

<div class="zoom-content">

<ul class="!mt-6 !text-[1.35rem] !leading-relaxed space-y-3">
  <li><strong>Who:</strong> your Pulumi user, your RBAC</li>
  <li><strong>What:</strong> permission mode, <code>protect: true</code></li>
  <li><strong>When:</strong> approval mode, Plan Mode</li>
  <li><strong>Where:</strong> a microVM with an allow-list</li>
  <li><strong>With what:</strong> ESC credentials, one hour</li>
  <li><strong>What if:</strong> a guard, a proxy log, audit</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
</style>

<!--
~2 min. Six questions, six answers, and every answer comes back in the next
45 minutes. Who: pulumi neo runs as your Pulumi user, and Neo never has more
access than you do, only less. What: permission mode default or read-only,
plus protect: true on resources. When: approval mode manual, balanced or
auto, and Plan Mode before Neo starts. Where: a Docker Sandbox microVM with
one mounted folder, a default-deny egress allow-list and its own Docker
daemon. With what: no key in the VM; Pulumi ESC mints one-hour OIDC
credentials at pulumi up time. What if: a guard in front of destructive
commands, a proxy log on the host, an audit trail in Pulumi Cloud. Rows 1 to
3 are the Neo part, row 4 is the kit and Mike's part, row 5 is ESC, row 6 is
step 5 of the demo.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Pulumi Neo in the terminal.</h1>
</div>

<!--
Part 3 divider. ~3s. Ten minutes on pulumi neo: what it inherits, approval
mode, permission mode, Plan Mode, the read-only fine print, the flags,
instructions, handoff, identity. Sources: the Neo CLI docs page, the
permissions model page, the tasks page, the agent skills page, the launch
post.
-->

---

# Neo is Pulumi's infrastructure agent

<div class="grid grid-cols-2 gap-10 mt-4">
  <div>
    <ul class="!mt-2 !text-[1.3rem] !leading-relaxed space-y-3">
      <li>Lives in Pulumi Cloud: tasks, automations, PRs</li>
      <li>Ships the Pulumi Agent Skills catalog</li>
      <li>Integrations: GitHub, Slack, Datadog, PagerDuty</li>
      <li>4,500+ organizations before the CLI launch</li>
      <li>In the terminal since May 2026</li>
    </ul>
  </div>
  <div class="neo-wrap">
    <img src="/pulumi-neo.png" alt="pulumi neo in a terminal" />
  </div>
</div>

<style scoped>
.neo-wrap { display: flex; align-items: center; justify-content: center; }
.neo-wrap img { max-width: 100%; max-height: 30rem; height: auto; border-radius: 12px; border: 1px solid var(--p-border); }
</style>

<!--
~60s. Context for people who have not used Neo. Neo delegates real
infrastructure work: scaffolding, migrating, investigating, operationalizing.
It lives in Pulumi Cloud with tasks, automations, pull requests and code
reviews, and its integrations catalog covers GitHub, Slack, Datadog,
PagerDuty, Linear and Atlassian. It is an Agent Skills client and ships the
Pulumi Agent Skills catalog built in, loading a skill when a task calls for
it. The launch post "Neo, Now in the Terminal" (May 20, 2026) says over 4,500
organizations had used Neo through Pulumi Cloud before the CLI. The screenshot
is pulumi neo in a terminal.
-->

---

# `pulumi neo` inherits your local setup

<div class="zoom-content">

<ul class="!mt-6 !text-[1.35rem] !leading-relaxed space-y-3">
  <li>Your authenticated CLIs</li>
  <li>Your environment variables and kubeconfigs</li>
  <li>The project you are editing</li>
  <li>Tool calls run on your machine</li>
  <li>The reasoning stays in Pulumi Cloud</li>
</ul>

<aside class="info-card">
  <div class="info-card__label">The feature and the risk</div>
  <p>Whatever the terminal reaches, Neo reaches.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
~75s. The docs phrase: "Running locally means Neo inherits your setup: the
CLIs you've authenticated, the environment variables and kubeconfigs you've
configured, and the project you're editing." Filesystem and shell tool calls
run on this machine, in the working directory you select; the reasoning stays
in the Neo backend. Typical asks: investigate a failed preview, change the
program and verify against a fresh preview, read live stack state. It is
interactive by design; for long asynchronous work the docs still point at
Pulumi Cloud Neo, and both reach the same backend. Then flip it: whatever the
terminal can reach, Neo can reach. That is the surface we put a wall around,
and it is why the sandbox exists.
-->

---

# Approval mode decides when Neo pauses

<div class="zoom-content">

<ul class="!mt-6 !text-[1.35rem] !leading-relaxed space-y-3">
  <li><code>manual</code>: asks before every tool call</li>
  <li>The console calls <code>manual</code> Review</li>
  <li><code>balanced</code>: asks only before <code>pulumi up</code></li>
  <li><code>auto</code>: never asks</li>
  <li>Console gates: preview, up, pull request</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
</style>

<!--
~75s. From the permissions model page: approval mode, also called task mode,
governs when Neo pauses. In the console, Review mode requires approval before
running pulumi preview, running pulumi up, and opening a pull request;
Balanced only before pulumi up; Auto never. In the CLI and the API the
strictest mode is named manual, and the CLI flag help says manual prompts on
every call while balanced auto-approves low-risk calls; the local tool loop
is what prompts, so in the demo even file reads ask. What the console's
approval gates do not cover: by design Neo investigates autonomously, reading
state, opening ESC environments and reaching accounts without a prompt per
read, to avoid approval fatigue. The demo runs manual.
-->

---

# Permission mode decides what Neo may change

<div class="zoom-content">

<ul class="!mt-6 !text-[1.35rem] !leading-relaxed space-y-3">
  <li><code>default</code>: your full RBAC</li>
  <li><code>read-only</code>: no Pulumi Cloud writes</li>
  <li><code>read-only</code> keeps reads, previews, edits, PRs</li>
  <li>Independent of approval mode</li>
  <li>Org admins set defaults, you override</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
</style>

<!--
~60s. Permission mode is scope. default ("Use my permissions") grants your
full role-based capabilities. read-only removes the ability to trigger writes
in Pulumi Cloud while keeping read, preview, code and pull request abilities.
The docs say plainly: "Neo has two independent axes of control. Do not
conflate them." Org-level defaults set the starting point for new tasks and a
user can override them per task; the CLI flags are --approval-mode and
--permission-mode. Step 4 of the demo switches to read-only.
-->

---

# Plan Mode: agree on a plan, then act

<div class="zoom-content">

<ul class="!mt-6 !text-[1.35rem] !leading-relaxed space-y-3">
  <li>Shift+Tab before the first message</li>
  <li>Neo studies the infra and dependencies</li>
  <li>Writes a plan, you challenge it</li>
  <li>Acts only after explicit approval</li>
  <li>Task-level: composes with any mode</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
</style>

<!--
~45s. From the tasks page and the CLI page: Plan Mode is an optional
pre-execution phase. Neo examines the existing infrastructure and
dependencies, creates a grounded plan explaining what it will do and why,
iterates conversationally so you can challenge assumptions, and waits for
explicit approval before proceeding. In the CLI you toggle it with Shift+Tab
before sending the first message; it is task-level, so it composes with any
permission or approval mode. Best for complex multi-stack operations and
unfamiliar infrastructure.
-->

---

# Read-only stops Pulumi Cloud writes, not cloud access

<div class="zoom-content">

<ul class="!mt-6 !text-[1.35rem] !leading-relaxed space-y-3">
  <li>Neo can still open ESC environments</li>
  <li>And reach the accounts they unlock</li>
  <li>The boundary: RBAC plus ESC access</li>
  <li>Prefer read-only cloud roles in ESC</li>
  <li>Docs: "no Pulumi Cloud mutations"</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
</style>

<!--
~60s. The paragraph every security reviewer should read, from the permissions
model page: "Read-only is scoped to Pulumi Cloud, not to your cloud accounts.
Read-only mode blocks writes in Pulumi Cloud and instructs Neo not to make
modifications, but it does not technically prevent Neo from opening ESC
environments or reaching the cloud accounts those environments unlock. Treat
read-only as 'no Pulumi Cloud mutations,' not 'no side effects anywhere.'" To
constrain what Neo can reach, scope the acting user's RBAC and the ESC
environments they can open, and prefer read-only cloud roles in ESC
environments. This is why the sandbox and ESC exist: the cloud-side boundary
is the role ESC hands out and the network the VM can reach.
-->

---

# Two flags set the modes, resume recovers a session

<div class="zoom-content">

<ul class="!mt-6 !text-[1.35rem] !leading-relaxed space-y-3">
  <li><code>--approval-mode</code> manual, balanced, auto</li>
  <li><code>--permission-mode</code> default, read-only</li>
  <li><code>--print</code> runs one prompt for scripts</li>
  <li><code>--debug-update</code> investigates a failed update</li>
  <li><code>resume</code> reattaches after a dropped session</li>
  <li>Editors host Neo over ACP</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
</style>

<!--
~60s. From the pulumi neo command reference (Pulumi CLI 3.260.0, the version
in the sandbox image). Flags: --approval-mode (default manual),
--permission-mode (default default), -s/--stack, --cwd, -p/--print,
--debug-update[=version], --debug-preview[=id], --disable-integrations,
--org. --print has no UI, so manual is rejected and the default becomes auto;
it exists for scripts and other agents. pulumi neo resume <task-id> re-renders
the chat and reattaches the local tool loop; historical tool calls are not
re-executed. pulumi neo acp runs Neo as an Agent Client Protocol agent for
Zed, JetBrains, VS Code and Cursor. The demo uses the two mode flags through
the kit, and resume is the recovery step in the runbook.
-->

---

# Put instructions in the project, not the kit

<div class="zoom-content">

<ul class="!mt-6 !text-[1.35rem] !leading-relaxed space-y-3">
  <li>Ship <code>AGENTS.md</code> next to <code>Pulumi.yaml</code></li>
  <li>Neo's tools see the working directory</li>
  <li>The kit's profile file lands outside it</li>
  <li>The docs do not promise auto-loading</li>
  <li>Our demo project carries one</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
</style>

<!--
~45s. Our recommendation, stated carefully. Neo's filesystem and shell tools
are restricted to the working directory plus /tmp (pulumi/pulumi,
pkg/cmd/pulumi/neo/tools), so a project-level AGENTS.md is inside the
boundary. Docker writes a sandbox kit's agentInstructions file next to the
workspace, outside that boundary, so the kit's AGENTS.md is probably invisible
to Neo. None of the Neo pages read for this deck say AGENTS.md is loaded
automatically, so we do not claim it; the demo project (02-app/AGENTS.md)
carries stack names, the ESC environment and what never to run. Open question
9 in the repo.
-->

---

# Other agents hand work off to Neo

<div class="zoom-content">

<ul class="!mt-6 !text-[1.35rem] !leading-relaxed space-y-3">
  <li>The <code>pulumi-neo-handoff</code> skill</li>
  <li>Packages goal, repo pointers, summary</li>
  <li>Returns a Neo task URL</li>
  <li>Claude Code, Codex, Cursor, Copilot, Gemini, Junie</li>
  <li>Runs <code>pulumi neo</code> underneath</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
</style>

<!--
~45s. From the agent skills page and the CLI page. The pulumi-neo-handoff
skill, in the pulumi-delegation plugin, packages the goal, repository
pointers and a compacted conversation summary into a new Pulumi Neo task and
returns a task URL. Supported clients: Claude Code, OpenAI Codex, Cursor,
GitHub Copilot, Google Gemini, JetBrains Junie, and Neo itself. Install:
"/plugin install pulumi-delegation" in Claude Code, or "npx skills add
pulumi/agent-skills/delegation --skill '*'" for any agent that supports
skills. The CLI page: the handoff skill lets other agents start a Neo task
using pulumi neo under the hood.
-->

---

# Neo acts as you, never as more

<div class="zoom-content">

<ul class="!mt-6 !text-[1.35rem] !leading-relaxed space-y-3">
  <li>Runs as your Pulumi user</li>
  <li>Same RBAC, same audit log</li>
  <li>Permissions re-checked at execution time</li>
  <li>Git writes use the Pulumi GitHub App</li>
  <li>Secrets in task events get redacted</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
</style>

<!--
~60s. From the permissions model page. The core invariant: "Neo acts on
behalf of the user invoking it, and Neo can only do what that user could do
themselves." pulumi neo uses your existing pulumi login and the RBAC of your
Pulumi user; identity, RBAC and audit run through Pulumi Cloud. Neo has no
identity of its own; on Enterprise and Business Critical a task can assume a
single role you already hold, which narrows access. RBAC is evaluated at
execution time, so a running task loses access the moment you do. Version
control writes are the exception: pull requests, pushes and comments come
from the shared Pulumi GitHub App. ESC secrets a task reads can reach the
model; Neo is instructed never to run pulumi env open or --show-secrets, and
task events are scanned for credential patterns and redacted, which the docs
call defense in depth rather than a guarantee.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The infrastructure sandbox kit.</h1>
</div>

<!--
Part 4 divider. ~3s. Ten minutes: the image, the credential proxy, the
network rules, the guard, MCP, how the Neo agent is defined, how to start it,
and the boundaries it draws. Sources: github.com/dirien/infrastructure-sandbox-kit
and neo-kit/ in the workshop folder.
-->

---

# One image, every IaC tool pinned

<div class="grid grid-cols-2 gap-10 mt-4">
  <div>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-2">
      <li><code>ghcr.io/dirien/infrastructure-sandbox:v0.9.0</code></li>
      <li>Pulumi 3.260.0 with <code>pulumi neo</code></li>
      <li>Terraform, OpenTofu, kubectl, Helm</li>
      <li>AWS, Azure and Google Cloud CLIs</li>
      <li>Checksums or signatures on every core tool</li>
    </ul>
  </div>
  <div class="big-code code-sm">

```text
infrastructure-sandbox-kit/
├── kit/spec.yaml          # mixin
├── sandbox-kit/spec.yaml  # one-flag bundle
├── template/Dockerfile    # the baked image
├── scripts/               # pinned provisioning
└── docs/                  # credentials, network
neo-in-a-docker-sandbox/
└── neo-kit/spec.yaml      # runs pulumi neo
```

  </div>
</div>

<!--
~75s. The kit started as a Claude Code sandbox for IaC work. The template
image is multi-arch, built from docker/sandbox-templates:claude-code-docker,
and pins Pulumi CLI 3.260.0 (with pulumi neo and ESC via pulumi env),
Terraform 1.16.0, OpenTofu 1.12.6, kubectl 1.37.0, Helm 4.2.4, AWS CLI
2.36.34, plus Azure CLI and gcloud from GPG-signed apt repos, and Go, Node.js,
Python and Java with language servers. Every core tool is pinned and verified
by checksum or signature; the kit README has the table. Three ways in: a
mixin on the stock Claude agent, the template plus the mixin, or one sandbox
kit that names the image. The workshop adds neo-kit: same image and rules,
pulumi neo as the agent.
-->

---

# The token never enters the VM

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code">

```yaml
credentials:
  - service: pulumi
    apiKey:
      name: PULUMI_ACCESS_TOKEN
      proxyManaged: true
      inject:
        - domain: api.pulumi.com
          header: Authorization
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.25rem] !leading-relaxed space-y-3">
      <li>The kit declares, the host binds</li>
      <li>Inside: <code>PULUMI_ACCESS_TOKEN=proxy-managed</code></li>
      <li>The proxy rewrites the header on <code>api.pulumi.com</code></li>
      <li>Enough for login, neo, up, env</li>
    </ul>
  </div>
</div>

<!--
~90s. The block is neo-kit/spec.yaml minus two lines (format: "token %s",
required: true). Mental model from the Docker credentials docs: a kit
declares which credential it needs and where the proxy injects it; a kit
cannot read host environment variables or files; the user binds the value
once with sbx secret set -g pulumi; for third-party v2 kits sbx asks you to
approve a credential binding on first run and records it in
~/.config/sbx/credentials.yaml. proxyManaged: true is the line that puts the
sentinel in the VM; the host-side proxy rewrites the Authorization header on
requests to api.pulumi.com only. That is enough for pulumi login, pulumi
neo, pulumi up and pulumi env, and the real token never enters the VM. Cloud
credentials are deliberately not in this block: AWS signs requests with the
key (SigV4), so a key would have to live in the VM. ESC mints it short-lived
instead; that is the part after the demo.
-->

---

# Egress is default-deny

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code">

```yaml
permissions:
  network:
    allow:
      - api.pulumi.com
      - get.pulumi.com
      - registry.npmjs.org
      - sts.eu-central-1.amazonaws.com
      - "*.s3.eu-central-1.amazonaws.com"
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.25rem] !leading-relaxed space-y-3">
      <li>All outbound TCP through a host proxy</li>
      <li>UDP and ICMP are blocked</li>
      <li>Only listed hosts and regions resolve</li>
      <li><code>sbx policy log neo-demo</code> shows every request</li>
    </ul>
  </div>
</div>

<!--
~90s. The list is abridged from neo-kit/spec.yaml (41 hosts: Pulumi, the
Terraform and OpenTofu registries, kubectl and Helm downloads, the cloud CLI
installers and apt repos, GitHub, npm, PyPI, the Go proxy, AWS STS and S3 in
eu-central-1, the other clouds' identity endpoints). Docker's default posture:
all outbound TCP is blocked unless a rule allows it, direct UDP and ICMP are
blocked at the network layer, DNS goes through a policy-aware resolver. In a
kit's list, exact hosts, host:port and single-label *.host patterns are
enforced; **.host and CIDR parse but enforcement is pending. Regional AWS
endpoints are explicit on purpose. sbx policy log <sandbox> on the host shows
every request with the rule it matched; that is the discovery loop for new
hosts, and step 2 of the demo. Organization governance (paid) can override:
only org allow rules grant access, kit deny rules still apply.
-->

---

# Neo has no hooks, so PATH is the hook

<div class="grid grid-cols-2 gap-10 mt-4">
  <div>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Claude kit: PreToolUse and PostToolUse hooks</li>
      <li>Neo runs shell tools through <code>sh -c</code></li>
      <li>Shims front <code>pulumi</code>, <code>aws</code>, <code>terraform</code>, <code>tofu</code></li>
      <li>Match, log, exit 2; otherwise exec</li>
      <li>Blocked attempts land in <code>guard.log</code></li>
    </ul>
  </div>
  <div class="big-code code-sm">

```text
pulumi|^(destroy|down)([[:space:]]|$)
pulumi|^state[[:space:]]+(delete|unprotect)([[:space:]]|$)
aws|(^|[[:space:]])s3[[:space:]]+(rb|rm)([[:space:]]|$)
terraform|^(destroy|taint|force-unlock)([[:space:]]|$)
```

  </div>
</div>

<!--
~90s. What the Claude Code kit already did: hooks from
dirien/my-claude-apm-setup wired into ~/.claude/settings.json on every start;
a PreToolUse guard that blocks destructive shell commands (rm -rf /, git push
--force, mkfs and friends) and a PostToolUse hook that scans edits for
hardcoded secrets and formats files. Neo has no hook system, but it executes
shell tool calls with sh -c (pulumi/pulumi, pkg/cmd/pulumi/neo/tools/shell.go),
so PATH is where the guard goes: ~/.local/bin/{pulumi,aws,terraform,tofu} are
shims that match the argument line against destructive.patterns, log to
~/.local/state/neo-sandbox/guard.log and exit 2, otherwise exec the real
binary. The four lines on the slide are real lines from destructive.patterns;
the full list (17 patterns for pulumi, aws, terraform and tofu) is in
neo-kit/files.
-->

---

# A guard stops accidents, boundaries stop adversaries

<div class="zoom-content">

<ul class="!mt-6 !text-[1.35rem] !leading-relaxed space-y-3">
  <li>The agent has sudo inside the VM</li>
  <li>Any in-VM guard can be bypassed</li>
  <li>Hypervisor, allow-list and proxy sit outside</li>
  <li>RBAC and <code>protect: true</code> sit in Pulumi Cloud</li>
  <li>A human lifts the guard with one file</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
</style>

<!--
~60s. Say this out loud, because without it the guard looks like a demo
trick. The Docker isolation page: the agent runs as a non-root user with sudo
inside the VM, and the hypervisor boundary is the isolation control, not
in-VM privilege separation. So the guard catches accidents; the boundaries
that hold against a determined agent are the hypervisor, the egress
allow-list and the credential proxy outside the VM, plus Pulumi RBAC and
protect: true on the resource. A human lifts the guard for one sandbox by
creating ~/.config/neo-sandbox/allow-destructive; the workshop scripts do
teardown on the host instead.
-->

---

# Neo brings its own MCP

<div class="zoom-content">

<ul class="!mt-6 !text-[1.35rem] !leading-relaxed space-y-3">
  <li>Claude kit registers the <code>pulumi</code> MCP server</li>
  <li>Neo ships skills and registry knowledge</li>
  <li>External MCP comes from Pulumi Cloud</li>
  <li>Integration credentials never reach the model</li>
  <li><code>--disable-integrations</code> turns them off</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
</style>

<!--
~45s. The kit's MCP story is a Claude Code feature: on every start it
registers the hosted pulumi MCP server (mcp.ai.pulumi.com) at user scope for
registry lookups, resource schemas, code validation and Neo tasks from
Claude; Docker routes supported agents through one host-side MCP gateway
where org MCP policies are enforced. For Neo the equivalent lives in Pulumi
Cloud: it ships the Pulumi Agent Skills catalog and registry knowledge, gets
external MCP integrations from the org's integrations page, MCP integration
credentials are never exposed to the model, and --disable-integrations turns
them off per task. CLI integrations run as pulumi env run against an ESC
environment, as you.
-->

---

# Twenty lines make Neo a sandbox agent

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code code-xs">

```yaml
kind: sandbox
sandbox:
  image: ghcr.io/dirien/infrastructure-sandbox:v0.9.0
  entrypoint: [bash, /home/agent/.local/share/neo-sandbox/neo-sandbox.sh]
credentials:
  - service: pulumi
    apiKey:
      proxyManaged: true
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-2">
      <li><code>kind: sandbox</code> defines a full agent</li>
      <li>The image is the Claude kit's image</li>
      <li>The entrypoint execs <code>pulumi neo</code></li>
      <li>Modes come in as kit arguments</li>
      <li>Same credential, same allow-list</li>
    </ul>
  </div>
</div>

<!--
~90s. The eight lines are neo-kit/spec.yaml trimmed to the lines that define
the agent: kind: sandbox (a mixin would only extend an agent), the image the
Claude kit builds, the entrypoint, and the proxy-managed Pulumi credential.
The whole file is about 200 lines with the allow-list and comments. The
entrypoint script does four things: put the shims first on PATH, find the
Pulumi.yaml in the workspace, print the boundaries banner, then exec pulumi
neo --approval-mode … --permission-mode … with the modes from the kit
arguments (approvalMode, permissionMode, both with defaults) or from a
session override. The base image requirements from the kit spec reference:
a non-root agent user with UID 1000 and passwordless sudo, /home/agent, and
the proxy variables preserved across sudo; the sandbox templates already do
this.
-->

---

# One command starts Neo in the sandbox

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code">

```bash
sbx secret set -g pulumi                  # once
sbx run --name neo-demo ./neo-kit ./02-app
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.25rem] !leading-relaxed space-y-3">
      <li>First run pulls the image</li>
      <li>Then approves the credential binding</li>
      <li>Re-attach: <code>sbx run --name neo-demo</code></li>
      <li>Cleanup: <code>sbx rm -f neo-demo</code></li>
    </ul>
  </div>
</div>

<!--
~60s. Both commands are in DEMO.md: the token is bound once, and
01-sandbox/up.sh expands to sbx run --name neo-demo ./neo-kit ./02-app. Since
sbx 0.42.0 a sandbox kit reference goes in the agent position; the older
--kit form for sandbox kits is deprecated (--kit is for mixins). The first
run pulls ghcr.io/dirien/infrastructure-sandbox:v0.9.0 and asks you to
approve the pulumi credential binding the kit declares. Re-attaching with
sbx run --name neo-demo reuses the VM; --env NEO_SANDBOX_PERMISSION_MODE=read-only
on re-attach changes the session's mode (step 4 of the demo); sbx rm -f
neo-demo removes the VM and the secrets scoped to it.
-->

---

# Six boundaries, six enforcers

<div class="boundaries mt-6">
  <table>
    <thead><tr><th>Neo wants…</th><th>Enforced by</th></tr></thead>
    <tbody>
      <tr><td>the host filesystem</td><td>hypervisor; only the workspace is mounted</td></tr>
      <tr><td>the Pulumi token</td><td>credential proxy; sentinel in the VM</td></tr>
      <tr><td>cloud credentials</td><td>none in the VM; ESC mints 1h creds</td></tr>
      <tr><td>the internet</td><td>default-deny allow-list; proxy log</td></tr>
      <tr><td>to change Pulumi Cloud</td><td>your RBAC; permission mode; approvals</td></tr>
      <tr><td>to delete things</td><td>guard shims; <code>protect: true</code></td></tr>
    </tbody>
  </table>
</div>

<style scoped>
.boundaries table { width: 100%; border-collapse: collapse; font-size: 1.3rem; line-height: 1.45; }
.boundaries th { text-align: left; color: var(--p-primary); font-family: var(--slidev-font-mono); font-size: 1rem; text-transform: uppercase; letter-spacing: 0.06em; padding: 0.5rem 0.8rem; border-bottom: 1.5px solid var(--p-border); }
.boundaries td { padding: 0.6rem 0.8rem; border-bottom: 1px solid var(--p-border); vertical-align: top; }
</style>

<!--
~60s. The table the demo proves row by row. Rows 1 to 4 are enforced outside
the VM (Mike's part explains why that holds), rows 5 and 6 by Pulumi Cloud
and the kit. Last Pulumi slide before the Docker segment; hand over to Mike
with "so why can we trust rows 1 to 4".
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Docker Sandboxes.</h1>
</div>

<!--
MIKE: replace. Part 5 divider, 10 minutes owned by Mike Coleman, Staff
Solutions Architect at Docker. The three slides that follow are placeholders
drafted from the public Docker Sandboxes docs (architecture, isolation, kits,
credentials). Replace them freely; the Pulumi slides only assume these three
ideas were covered: microVM isolation, kits, secret injection.
-->

---

<!-- MIKE: replace -->

# A sandbox is a microVM with its own kernel

<div class="gpu-caption gpu-caption--muted !mb-4">Placeholder for Mike Coleman (Docker)</div>

<div class="zoom-content">

<ul class="!mt-2 !text-[1.3rem] !leading-relaxed space-y-3">
  <li>Own kernel, filesystem, Docker Engine, network</li>
  <li>Host files: only the mounted workspace</li>
  <li>Clone mode mounts the repo read-only</li>
  <li>Sandboxes cannot talk to each other</li>
  <li><code>sbx rm</code> deletes everything inside</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
MIKE: replace. ~3 min. Drafted from docs.docker.com/ai/sandboxes/security/isolation
(the five isolation layers: hypervisor, network, Docker Engine, workspace,
credential proxy) and the architecture page. Every sandbox is a lightweight
microVM with its own Linux kernel; host processes and files outside the
mounted workspace are not reachable. Each sandbox has its own isolated
network; all outbound TCP goes through a policy-enforcing proxy on the host,
direct UDP and ICMP are blocked. A separate Docker Engine runs inside the VM,
so docker build and compose up never touch the host daemon. Workspace modes:
mountless, direct mount, or --clone with the host repo read-only at
/run/sandbox/source and a private clone for the agent. The docs also say to
review agent-edited files in a direct mount like an untrusted pull request.
-->

---

<!-- MIKE: replace -->

# A kit declares the whole sandbox in one file

<div class="gpu-caption gpu-caption--muted !mb-4">Placeholder for Mike Coleman (Docker)</div>

<div class="zoom-content">

<ul class="!mt-2 !text-[1.3rem] !leading-relaxed space-y-3">
  <li><code>spec.yaml</code>: tools, environment, credentials, network, files</li>
  <li><code>kind: mixin</code> extends an agent</li>
  <li><code>kind: sandbox</code> defines one: image and entrypoint</li>
  <li>Load from a directory, git or OCI</li>
  <li>Sources are allow-listed; installs run as root</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
MIKE: replace. ~3 min. Drafted from the kits page and the kit spec reference
(schema v2). A kit packages tools to install, environment variables,
credentials to inject, network allow and deny rules, files to drop in,
startup commands and agent instructions. Mixin kits extend an existing agent
and stack with --kit; sandbox kits define a full agent with a sandbox block
(image, entrypoint, command). Kits load from a local directory or ZIP, a Git
URL or an OCI registry, and sbx kit validate, inspect, pack, push, pull, sign
and verify manage them. Kit sources are restricted by kit.allowedSources
because install commands run with root privileges inside the sandbox. Kits
are experimental; the format can change.
-->

---

<!-- MIKE: replace -->

# Secrets stay on the host

<div class="gpu-caption gpu-caption--muted !mb-4">Placeholder for Mike Coleman (Docker)</div>

<div class="zoom-content">

<ul class="!mt-2 !text-[1.3rem] !leading-relaxed space-y-3">
  <li><code>sbx secret set -g pulumi</code> stores it once</li>
  <li>The VM sees a sentinel value</li>
  <li>The proxy injects the real header</li>
  <li>Only on the declared domain</li>
  <li>Bindings approve third-party kits</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
MIKE: replace. ~3 min. Drafted from the credentials page. sbx secret set
stores the value in the OS keychain; the sandbox only ever sees a sentinel
such as proxy-managed; the forward proxy matches the declared domain and
rewrites the header before the request leaves the host. Dynamic sources:
--ref for 1Password references or AWS Secrets Manager ARNs, --command for a
shell command, resolved on the host and cached. OAuth agents get sentinel
tokens too, unless the kit sets passthrough: true. Third-party v2 kits need
an approved credential binding per service and domain. The line the demo
comes back to: credential values are never stored inside the VM; they are not
available as environment variables or files inside the sandbox unless you
explicitly set them. Hand back to Engin for the demo.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Neo in a Docker Sandbox.</h1>
</div>

<!--
Part 6 divider. 15 minutes. Suggested speaker: Engin, with Adam on the second
terminal. Switch to the terminals now; the next seven slides are the map and
one slide per step, to flip back to while the terminal is thinking. The
runbook with every command and expected output is DEMO.md.
-->

---

# Six steps, fifteen minutes

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card"><div class="gpu-caption gpu-caption--muted">1 · 2 min</div><p>One command starts the sandbox</p></div>
  <div class="gpu-card gpu-card--muted step-card"><div class="gpu-caption gpu-caption--muted">2 · 2 min</div><p>Neo sees the workspace and nothing else</p></div>
  <div class="gpu-card gpu-card--primary step-card"><div class="gpu-caption gpu-caption--accent">3 · 5 min</div><p>Neo hardens the bucket, we approve</p></div>
  <div class="gpu-card gpu-card--muted step-card"><div class="gpu-caption gpu-caption--muted">4 · 2.5 min</div><p>Read-only lets Neo plan, not deploy</p></div>
  <div class="gpu-card gpu-card--accent step-card"><div class="gpu-caption gpu-caption--accent">5 · 2 min</div><p>The guard answers instead of Pulumi</p></div>
  <div class="gpu-card gpu-card--muted step-card"><div class="gpu-caption gpu-caption--muted">6 · 1.5 min</div><p>The change is in the account</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
</style>

<!--
~20s. Say the six steps and one rule: every command in the demo is in the
repo, so anyone can replay it. If the live demo dies, the recording plays the
same six steps (DEMO.md, "Fallback").
-->

---

# 1 · One command starts the sandbox

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code">

```bash
01-sandbox/up.sh
# = sbx run --name neo-demo ./neo-kit ./02-app
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.25rem] !leading-relaxed space-y-3">
      <li>Image pull and binding approval, first run only</li>
      <li>The install step is a no-op here</li>
      <li>The entrypoint prints the boundaries</li>
      <li>Then the Neo TUI starts</li>
    </ul>
  </div>
</div>

<!--
Step 1, 2 min. What appears: the host line "creating sandbox 'neo-demo'
from ./neo-kit with workspace ./02-app", sbx creating the microVM and
applying the kit, then the banner from inside the VM: agent (pulumi neo,
Pulumi CLI v3.260.0), identity (your user and orgs, via pulumi login through
the credential proxy), token (PULUMI_ACCESS_TOKEN=proxy-managed), cloud creds
(none; ESC mints them at run time), egress (default-deny, allow-list only),
guard (on), modes (approval=manual, permission=default), project (the 02-app
path). Then the pulumi neo welcome and the prompt. Read the banner with the
audience: Neo is me in Pulumi Cloud, the token is not here, no cloud
credentials, egress is a list, a guard sits in front of the dangerous
commands, and manual mode means Neo asks before every tool call. If the
banner says it could not reach api.pulumi.com, the token is not bound:
sbx secret set -g pulumi, sbx rm -f neo-demo, start again.
-->

---

# 2 · Neo sees the workspace and nothing else

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code">

```text
01-sandbox/boundaries.sh
▶ 1. Identity     pulumi whoami -v
▶ 2. Token        $PULUMI_ACCESS_TOKEN
▶ 3. Cloud creds  env, ~/.aws
▶ 4. Filesystem   ls outside the workspace
▶ 5. Network      curl an unlisted host
▶ 6. Proxy log    sbx policy log neo-demo
▶ 7. Guard        pulumi destroy --yes
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.25rem] !leading-relaxed space-y-3">
      <li>Seven checks, all from the host</li>
      <li>The proxy log names the matching rule</li>
      <li>Every blocked row: a host or a leak</li>
    </ul>
  </div>
</div>

<!--
Step 2, 2 min. Run 01-sandbox/boundaries.sh in the second terminal; it uses
sbx exec on the running sandbox. Narrate the seven blocks: pulumi whoami -v
shows your user through the proxy; the token variable holds the placeholder;
no AWS_, GOOGLE_ or AZURE_ variables and no ~/.aws; only the 02-app path is
mounted, the parent folder and /Users are absent; curl to ifconfig.me fails
while api.pulumi.com answers 200; sbx policy log neo-demo on the host lists
every host with the rule it matched; pulumi destroy --yes is refused by the
guard with exit 2. The question this answers: what could the agent
exfiltrate? Nothing it does not have, and it does not have much. Try it on
your own kit: every blocked row is a host to add or a leak you just
prevented.
-->

---

# 3 · Neo hardens the bucket, we approve each step

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code">

```text
Harden the S3 bucket in index.ts: enable versioning,
default SSE-S3 encryption, block all public access,
and tag the new resources with owner=neo. Use the
@pulumi/aws v7 sub-resources. Run pulumi preview
and show me the diff before deploying anything.
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.25rem] !leading-relaxed space-y-3">
      <li>Manual mode: every tool call asks</li>
      <li>Preview runs in the VM with ESC credentials</li>
      <li>Type <em>deploy it</em>, approve <code>pulumi up</code></li>
      <li>The update URL points at Pulumi Cloud</li>
    </ul>
  </div>
</div>

<!--
Step 3, 5 min. The longest step; keep talking while Neo works. Expected
sequence: Neo reads index.ts and AGENTS.md (each read asks in manual mode),
edits index.ts adding aws.s3.BucketVersioning,
aws.s3.BucketServerSideEncryptionConfiguration and
aws.s3.BucketPublicAccessBlock, asks to run pulumi preview; the preview shows
three creates and two unchanged. ESC minted the AWS credentials for that
preview inside the VM; the proxy log shows STS and S3 in eu-central-1. Type
"deploy it", approve pulumi up: three created, two unchanged, update URL in
Pulumi Cloud. Say while it runs: Neo is editing a real TypeScript program and
running the real CLI, inside the VM, against a real account, with credentials
that did not exist a minute ago and expire in an hour. It never sees a key
file or a secret value, and the preview was against the real provider. Open
the update in the console on the second screen.
-->

---

# 4 · Read-only lets Neo plan, not deploy

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code">

```bash
01-sandbox/up.sh \
  --env NEO_SANDBOX_PERMISSION_MODE=read-only -- \
  "Add a lifecycle rule that expires noncurrent \
   versions after 30 days, preview it, and deploy it."
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.25rem] !leading-relaxed space-y-3">
      <li>Banner shows <code>permission=read-only</code></li>
      <li>Neo edits and previews</li>
      <li>The deploy is refused</li>
      <li>Approval mode is the other axis</li>
    </ul>
  </div>
</div>

<!--
Step 4, 2.5 min. Leave the Neo session (exit or Ctrl-C; the sandbox keeps
running) and re-attach with the session override and a first prompt. Expected:
the banner line changes to permission=read-only; Neo edits the file, can run
the preview (one to create), and reports that it cannot deploy in read-only
mode. Say: two independent axes. Permission mode is scope: default means my
RBAC, read-only means no Pulumi Cloud writes. Approval mode is cadence:
manual asks on every tool call, balanced auto-approves low-risk calls and
still asks before pulumi up, auto never asks. Plan Mode, Shift+Tab before the
first message, puts a plan in front of all of it. Read-only is scoped to
Pulumi Cloud, not the account; that boundary is RBAC plus which ESC
environments the user can open. If Neo shells out to pulumi up instead of
using its Pulumi tool, say so (open question 11). Do not run all three
approval modes; describe balanced and auto in one sentence each.
-->

---

# 5 · The guard answers instead of Pulumi

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code">

```text
You: Tear the whole stack down.
Neo: runs pulumi destroy --yes   [approve on purpose]
guard: blocked a destructive command
  pulumi destroy --yes
  matched: ^(destroy|down)([[:space:]]|$)
Nothing was executed.
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.25rem] !leading-relaxed space-y-3">
      <li>Layer 1: the shim in the VM</li>
      <li>Layer 2: <code>protect: true</code> in Pulumi</li>
      <li>Layer 3: hypervisor, allow-list, proxy</li>
    </ul>
  </div>
</div>

<!--
Step 5, 2 min. Re-attach in default mode with a first prompt asking Neo to
tear the stack down (DEMO.md has the exact command). Neo proposes pulumi
destroy through its shell tool; approve it on purpose so the audience sees
the guard answer instead of Pulumi, and Neo reports the refusal. Then from
the host: 03-guardrails/try-destroy.sh does the same without Neo (exit 2,
guard log with both attempts) and 03-guardrails/try-egress.sh shows an
unlisted region endpoint blocked in the proxy log. Three layers, soft to
hard: the shim in the VM refuses and logs, and a human lifts it per sandbox
with one file; Pulumi refuses to delete a protected resource even if the guard
were gone; the hypervisor, the allow-list and the credential proxy sit outside
the VM, where root inside cannot reach them.
-->

---

# 6 · The change is in the account

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code">

```bash
cd 02-app
git --no-pager diff --stat -- index.ts
pulumi env run <org>/neo-workshop/aws-oidc -- \
  aws s3api get-bucket-versioning \
  --bucket "$(pulumi stack output bucketName)"
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.25rem] !leading-relaxed space-y-3">
      <li>The diff is what you would review</li>
      <li>The update sits in Pulumi Cloud</li>
      <li>Same ESC environment, no static key</li>
    </ul>
  </div>
</div>

<!--
Step 6, 1.5 min. From the host: the git diff of index.ts (three resources),
the AWS API through pulumi env run with the same ESC environment the sandbox
used (DEMO.md expects a versioning status of Enabled), and the AWS console (Properties, Bucket Versioning: Enabled) plus the
update in Pulumi Cloud. Close the loop: a real change in a real account,
reviewed at every step, with nothing on the laptop an agent could have
leaked. Reset happens after the session with 01-sandbox/reset.sh. Hand over
to the ESC part, which explains the pulumi env run you just used.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">No static keys.</h1>
</div>

<!--
Part 7 divider. ~3s. Three minutes on Pulumi ESC and short-lived
credentials: what the demo used, and what it replaces.
-->

---

# ESC mints credentials that expire

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code code-sm">

```yaml
values:
  aws:
    login:
      fn::open::aws-login:
        oidc:
          roleArn: arn:aws:iam::<account>:role/neo-workshop-esc
          duration: 1h
          sessionName: neo-in-a-docker-sandbox
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.25rem] !leading-relaxed space-y-3">
      <li>AWS trusts <code>api.pulumi.com/oidc</code></li>
      <li>Audience <code>aws:&lt;org&gt;</code>, subject <code>env:*</code></li>
      <li>Opening the environment mints STS credentials</li>
      <li><code>Pulumi.dev.yaml</code> imports it</li>
    </ul>
  </div>
</div>

<!--
~2 min. The YAML is the environment 00-esc creates as
<org>/neo-workshop/aws-oidc, trimmed to the login provider; the full file
also projects the credentials as AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY and
AWS_SESSION_TOKEN environment variables and sets aws:region as stack config.
From the ESC AWS OIDC docs: AWS trusts https://api.pulumi.com/oidc as an
identity provider with audience aws:<org>, and the documented trust policy
allows the subject pulumi:environments:org:<org>:env:* (any environment in
the org). A stack that imports the environment presents the literal subject
…:env:<yaml>, so the docs recommend subjectAttributes to pin a single
environment; the demo keeps the documented default and limits blast radius
with the role's S3 policy instead (open question 18). fn::open::aws-login exchanges the ESC OIDC token for STS
credentials whenever the environment is opened: by pulumi up, pulumi env open
or pulumi env run. The stack imports it with a two-line environment: block in
02-app/Pulumi.dev.yaml, so the provider gets region and credentials and
nothing is stored. Inside the sandbox this is the only way credentials
appear, and they are gone in an hour. This is learning outcome 4: how ESC
replaces static API keys.
-->

---

# ESC replaces the key on your laptop

<div class="zoom-content">

<div class="grid grid-cols-2 gap-8 mt-4">
  <div class="gpu-card gpu-card--muted">
    <div class="gpu-caption gpu-caption--muted">Before</div>
    <ul class="!mt-3 !text-[1.15rem] !leading-relaxed space-y-2">
      <li>A long-lived key in <code>~/.aws/credentials</code></li>
      <li>Rotation is a project</li>
      <li>Whoever reads the file owns the account</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary">
    <div class="gpu-caption gpu-caption--accent">With ESC</div>
    <ul class="!mt-3 !text-[1.15rem] !leading-relaxed space-y-2">
      <li>A role only your org's environments assume</li>
      <li>One hour, least privilege</li>
      <li>Who opens it is Pulumi RBAC</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.35; }
</style>

<!--
~60s. Before: a long-lived key in ~/.aws/credentials, in .env, in CI secrets,
in the agent's environment; rotation is a project and revocation is a fire
drill. With ESC: an IAM role that only your Pulumi org's environments can
assume, for one hour, with a least-privilege policy (the demo role: S3 on
neo-workshop-* buckets). Who can open the environment is Pulumi RBAC, and
ESC open approvals put a reviewer in front of the most powerful environments,
including Neo's opens. The same pattern exists for Azure and Google Cloud
login providers and for Vault, 1Password and Secrets Manager. Tie it to Neo
with the permissions page: Neo opens environments as you, so scope the role
and scope who can open the environment, and the agent's cloud reach is what
you decided.
-->

---

# Sixty minutes, one safe loop

<div class="zoom-content">

<ul class="!mt-6 !text-[1.35rem] !leading-relaxed space-y-3">
  <li>The credential is the blast radius</li>
  <li>Neo: modes, Plan Mode, your RBAC</li>
  <li>A microVM: one folder, proxy, allow-list, guard</li>
  <li>ESC: credentials that expire in an hour</li>
  <li>One repo folder has everything</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
</style>

<!--
~45s. Suggested speaker: Adam. Say the first and the last line. In between:
we ran Pulumi Neo in the terminal with approval and permission modes, Plan
Mode and your RBAC; sealed it in a Docker Sandbox microVM with one mounted
folder, a proxy-injected token, a default-deny allow-list and a guard; and
watched it change real infrastructure with credentials ESC minted for an
hour. Kit, runbook, scripts and slides are in one folder of pulumi/workshops.
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="res-card">
    <img src="/qr/repo.png" alt="QR: workshop repo" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → neo-in-a-docker-sandbox</div>
  </div>
  <div class="res-card">
    <img src="/qr/neo-cli.png" alt="QR: Neo in the CLI docs" />
    <div class="res-card__title">Neo in the CLI</div>
    <div class="res-card__body">pulumi.com/docs/ai/neo/pulumi-cli</div>
  </div>
  <div class="res-card">
    <img src="/qr/sandboxes.png" alt="QR: Docker Sandboxes docs" />
    <div class="res-card__title">Docker Sandboxes</div>
    <div class="res-card__body">docs.docker.com/ai/sandboxes</div>
  </div>
  <div class="res-card">
    <img src="/qr/kit.png" alt="QR: infrastructure-sandbox-kit" />
    <div class="res-card__title">The kit</div>
    <div class="res-card__body">github.com/dirien/infrastructure-sandbox-kit</div>
  </div>
  <div class="res-card">
    <img src="/qr/event.png" alt="QR: event page" />
    <div class="res-card__title">Event page</div>
    <div class="res-card__body">pulumi.com/events/neo-in-a-docker-sandbox</div>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.res-card { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.4rem; }
.res-card img { width: 9rem; height: 9rem; background: white; padding: 0.4rem; border-radius: 0.5rem; }
.res-card__title { font-size: 1.15rem; font-weight: 600; color: var(--p-fg); margin-top: 0.4rem; }
.res-card__body { font-family: var(--slidev-font-mono); font-size: 0.8rem; color: var(--p-fg-muted); line-height: 1.4; word-break: break-all; }
</style>

<!--
~20s. Five QR codes, generated into slides/public/qr. The repo one is the
only one people need; the runbook (DEMO.md) and the kit are in there.
-->

---

# Continue your Pulumi journey!

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-6">
  <div class="gpu-card gpu-card--primary journey-card">
    <div class="journey-card__title">Join the Pulumi Community Slack!</div>
    <p class="journey-card__body">
      <a class="text-[var(--p-primary)]" href="https://slack.pulumi.com/">slack.pulumi.com</a>
    </p>
  </div>
  <div class="gpu-card gpu-card--primary journey-card">
    <div class="journey-card__title">Sign up for a Pulumi Cloud account!</div>
    <p class="journey-card__body">
      Sign up to follow along
    </p>
  </div>
  <div class="gpu-card gpu-card--accent journey-card">
    <div class="journey-card__title">Join us for our next workshops!</div>
    <p class="journey-card__body">
      Link in the <strong>Handouts</strong> tab
    </p>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.45; }
.journey-card { display: flex; flex-direction: column; }
.journey-card__title { font-size: 1.5rem; font-weight: 600; line-height: 1.25; margin-bottom: 0.9rem; color: var(--p-fg); }
.journey-card__body { font-size: 1.15rem; line-height: 1.55; margin: 0 !important; color: var(--p-fg); }
</style>

<!--
~20s. The three CTAs from every Pulumi workshop: the community Slack (ask
about Neo, ESC or the sandbox kit), a Pulumi Cloud account (the event page
says "This workshop uses Pulumi Cloud. Sign up to follow along."; which plans
include Neo is open question 19), and the next workshop link in the handouts
tab.
-->

---

# Questions?

<div class="contact-grid">
  <div class="contact-card">
    <div class="contact-card__avatar"><img src="/avatars/adamgordonbell.png" alt="Adam Gordon Bell" /></div>
    <div class="contact-card__name">Adam Gordon Bell</div>
    <div class="contact-card__role">Community Engineer, Pulumi</div>
  </div>
  <div class="contact-card">
    <div class="contact-card__avatar"><img src="/avatars/dirien.png" alt="Engin Diri" /></div>
    <div class="contact-card__name">Engin Diri</div>
    <div class="contact-card__role">Principal Solutions Architect, Pulumi</div>
    <div class="contact-card__handles"><span>dirien</span><span>engin-diri</span></div>
  </div>
  <div class="contact-card">
    <div class="contact-card__avatar"><img src="/avatars/mikegcoleman.png" alt="Mike Coleman" /></div>
    <div class="contact-card__name">Mike Coleman</div>
    <div class="contact-card__role">Staff Solutions Architect, Docker</div>
  </div>
  <div class="contact-card">
    <div class="contact-card__qr"><img src="/qr/repo.png" alt="QR code: workshop repo" /></div>
    <div class="contact-card__name">Slides + demo</div>
    <div class="contact-card__role contact-card__role--mono">github.com/pulumi/workshops/<wbr/>tree/main/neo-in-a-docker-sandbox</div>
  </div>
</div>

<style scoped>
.contact-grid { display: grid; grid-template-columns: repeat(4, auto); justify-content: center; gap: 4rem; margin-top: 2.5rem; align-items: start; }
.contact-card { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.6rem; }
.contact-card__avatar { width: 9rem; height: 9rem; border-radius: 9999px; overflow: hidden; border: 2px solid var(--p-primary); background: var(--p-bg-elevated); display: flex; align-items: center; justify-content: center; }
.contact-card__avatar img { width: 100%; height: 100%; object-fit: cover; }
.contact-card__name { font-size: 1.5rem; font-weight: 700; margin-top: 0.5rem; color: var(--p-fg); }
.contact-card__role { font-size: 1.05rem; color: var(--p-fg-muted); max-width: 16rem; }
.contact-card__role--mono { font-family: var(--slidev-font-mono); font-size: 0.85rem; line-height: 1.45; word-break: break-all; max-width: 16rem; }
.contact-card__handles { display: flex; gap: 1rem; font-size: 0.95rem; color: var(--p-fg-muted); font-family: var(--slidev-font-mono); }
.contact-card__qr { width: 9rem; height: 9rem; background: white; padding: 0.5rem; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; }
.contact-card__qr img { width: 100%; height: 100%; object-fit: contain; }
</style>

<!--
~2 min Q&A budget, with the recording of the demo ready to replay if a
question needs it. If nobody asks for 10 seconds, prompt with: "which of the
six boundaries would your security team ask about first?"

Avatars are GitHub profile photos saved under slides/public/avatars/
(handles adamgordonbell, dirien, mikegcoleman); confirm the two that are
not yours before the session and replace the files if needed.
-->
