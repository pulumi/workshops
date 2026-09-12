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
30s hook. Suggested speaker: Adam. Read the title, introduce the three of us in
one line each. Don't sell anything yet. The argument starts on slide 5 with
"an agent that breaks your laptop is annoying". Arc of the hour: why infra is
different → Neo's controls → the kit → Docker Sandboxes (Mike) → the demo →
ESC → wrap.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
~20s. Two beats: housekeeping (show-only workshop, everything is in the repo,
questions any time in Q&A) and the agenda (eight parts, one hour, demo in the
middle).
-->

---

# Housekeeping

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>Be chatty in the <strong>chat</strong> tab</li>
  <li>Ask questions in the <strong>Q&amp;A</strong> tab; we answer as we go</li>
  <li>Slides, the demo runbook and every script are in the <strong>handouts</strong> tab (one repo folder)</li>
  <li>This session is being recorded; the link lands in the follow-up email</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
~30s. Walk the four bullets. Set the expectation: this is show-only. Attendees
follow along; the repo folder (pulumi/workshops → neo-in-a-docker-sandbox)
has the kit, the runbook and the slides, so nobody needs to take notes.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.45rem] !leading-relaxed space-y-4">
  <li>Why this matters <span class="text-[var(--p-fg-muted)]">· 5 min</span></li>
  <li>What changes when the target is infra, not a codebase <span class="text-[var(--p-fg-muted)]">· 5 min</span></li>
  <li>Pulumi Neo in the CLI <span class="text-[var(--p-fg-muted)]">· 10 min</span></li>
  <li>The infrastructure sandbox kit <span class="text-[var(--p-fg-muted)]">· 10 min</span></li>
  <li>Docker Sandboxes, with Mike <span class="text-[var(--p-fg-muted)]">· 10 min</span></li>
  <li>Demo: Neo in a Docker Sandbox <span class="text-[var(--p-fg-muted)]">· 15 min</span></li>
  <li>Pulumi ESC and short-lived credentials <span class="text-[var(--p-fg-muted)]">· 3 min</span></li>
  <li>Wrap-up, resources, Q&amp;A <span class="text-[var(--p-fg-muted)]">· 2 min</span></li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.6; }
</style>

<!--
~30s. Eight lines; say the part name and a half-sentence each. The point to
land: the demo is in the middle, everything before it is the setup for what
you will see, everything after it is what makes it safe in your own org.
Hand over to the "why" separator.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[5.5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">An agent that breaks your laptop is annoying.</h1>
</div>

<!--
Part 1 divider. ~5s pause, then the next slide finishes the sentence. This is
the line from the workshop abstract; the whole hour hangs on it.
-->

---

# An agent that breaks production comes with a postmortem

<div class="zoom-content">

<p class="!mt-8 !text-[1.35rem] !leading-relaxed">
  Coding agents changed how software gets written. Almost nobody lets one near
  their infrastructure, and the reason is simple: the failure modes are not
  symmetric.
</p>

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted">
    <div class="gpu-caption gpu-caption--muted">On your laptop</div>
    <ul class="!mt-4 !text-[1.15rem] !leading-relaxed space-y-2">
      <li>A bad edit is a <code>git checkout</code> away</li>
      <li>A wrong <code>rm -rf</code> costs you an afternoon</li>
      <li>Secrets leak to… your own disk</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary">
    <div class="gpu-caption gpu-caption--accent">In your cloud</div>
    <ul class="!mt-4 !text-[1.15rem] !leading-relaxed space-y-2">
      <li>A wrong <code>pulumi destroy</code> is customer data</li>
      <li>A leaked key is an incident, not a cleanup</li>
      <li>There is no undo button</li>
    </ul>
  </div>
</div>

<p class="!mt-6 !text-[1.35rem] !leading-relaxed">
  This session is about letting the agent in anyway, <strong class="text-[var(--p-primary)]">safely</strong>.
</p>

</div>

<style scoped>
.zoom-content { zoom: 1.35; }
</style>

<!--
~90s. Suggested speaker: Adam. Left card is the world everyone knows from
coding agents. Right card is why platform teams say no. Don't argue the
point; the audience is here because they agree. Land the last line: we are
not going to tell you to keep the agent out. We put it in a sealed workspace
with an identity that has limits and credentials that expire.
-->

---

# What you leave with

<div class="zoom-content">

<ul class="!mt-8 !text-[1.35rem] !leading-relaxed space-y-5">
  <li><strong>What changes</strong> when a coding agent's target is your cloud instead of your codebase</li>
  <li><strong>What's inside a Docker Sandbox</strong>, and how to set up the perfect one for your projects</li>
  <li><strong>How Docker Sandboxes give Neo a sealed workspace</strong> where it can work without supervision</li>
  <li><strong>How Pulumi ESC replaces static API keys</strong> with short-lived credentials for AWS, Azure, or Google Cloud</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.6; }
</style>

<!--
~45s. These four lines are the promises on the event page, verbatim. Each
maps to a part of the deck: 1 → part 2, 2 and 3 → Mike's part and the kit,
4 → part 7. Say that out loud so people know when their question gets
answered.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Infra is not a codebase.</h1>
</div>

<!--
Part 2 divider. ~3s. Five minutes: what is different, then what that does to
the controls. This is the bridge from "coding agent" to "infrastructure
agent".
-->

---

# What changes when the target is your cloud

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="gpu-card gpu-card--muted">
    <div class="gpu-caption gpu-caption--muted">A codebase</div>
    <ul class="!mt-4 !text-[1.15rem] !leading-relaxed space-y-2">
      <li>The unit of review is a <strong>diff</strong></li>
      <li>Mistakes are local and reversible: branches, reverts, CI</li>
      <li>Tests run on fakes; nothing real is touched until merge</li>
      <li>Secrets are an anti-pattern; the agent rarely needs one</li>
      <li>Blast radius: one repo</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary">
    <div class="gpu-caption gpu-caption--accent">Your cloud</div>
    <ul class="!mt-4 !text-[1.15rem] !leading-relaxed space-y-2">
      <li>The unit of review is a <strong>preview</strong>: the diff against live state</li>
      <li>Mistakes are shared and often irreversible: deletes, data, DNS</li>
      <li>"Tests" run against real accounts with real credentials</li>
      <li>Secrets are the raw material: the agent cannot work without cloud access</li>
      <li>Blast radius: everything the credential can reach</li>
    </ul>
  </div>
</div>

<aside class="info-card">
  <div class="info-card__label">The consequence</div>
  <p>
    You cannot bolt "review the PR" onto an infra agent and call it safe. The
    credential the agent holds <strong>is</strong> the blast radius.
  </p>
</aside>

<!--
~2 min. Suggested speaker: Engin. Walk the pairs top to bottom: diff vs
preview, reversible vs not, fakes vs real accounts, no secrets vs secrets as
raw material, one repo vs the whole account. The info card is the thesis of
the hour: with infra, the credential is the blast radius, so the credential
is what we have to design.
-->

---

# So the controls move too

<div class="zoom-content">

<div class="grid grid-cols-2 gap-x-12 gap-y-3 mt-4 controls-grid">
  <div class="gpu-caption gpu-caption--accent">Question</div>
  <div class="gpu-caption gpu-caption--accent">Today's answer</div>
  <div><strong>Who</strong> is the agent when it acts?</div><div>Your Pulumi user, your RBAC. Neo never has more access than you do, only less.</div>
  <div><strong>What</strong> may it change?</div><div>Permission mode: <code>default</code> or <code>read-only</code>; <code>protect: true</code> on resources</div>
  <div><strong>When</strong> does it pause?</div><div>Approval mode: <code>manual</code>, <code>balanced</code>, <code>auto</code>; Plan Mode before it starts</div>
  <div><strong>Where</strong> can it reach?</div><div>A Docker Sandbox microVM: one mounted folder, a default-deny egress allow-list, its own Docker</div>
  <div><strong>With what</strong>, for how long?</div><div>No key in the VM. Pulumi ESC mints 1-hour OIDC credentials at <code>pulumi up</code> time</div>
  <div><strong>What if</strong> it tries anyway?</div><div>A guard in front of destructive commands, a proxy log on the host, an audit trail in Pulumi Cloud</div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.controls-grid > div { font-size: 1.15rem; line-height: 1.45; }
.controls-grid > div:nth-child(odd):not(:first-child) { color: var(--p-fg); }
</style>

<!--
~2 min. Six questions, six answers. Every answer on the right is something the
audience will see in the next 45 minutes: rows 1 to 3 are Neo (part 3), row 4 is
Docker Sandboxes and the kit (parts 4 and 5), row 5 is ESC (part 7), row 6 is the
guardrail step of the demo. Read it as the map of the talk, then move to Neo.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Pulumi Neo in the terminal.</h1>
</div>

<!--
Part 3 divider. ~3s. Ten minutes on `pulumi neo`: what it inherits, the two
axes of control, Plan Mode, the flags, instructions and handoff, identity.
Every fact on the next seven slides comes from the Neo docs (pulumi-cli,
permissions, tasks, skills pages) and the launch post.
-->

---

# Pulumi Neo, the infrastructure agent

<div class="grid grid-cols-2 gap-10 mt-4">
  <div>
    <ul class="!mt-2 !text-[1.3rem] !leading-relaxed space-y-3">
      <li>Pulumi Neo delegates real infrastructure work: scaffolding, migrating, investigating, operationalizing</li>
      <li>Lives in Pulumi Cloud: tasks, automations, pull requests, code reviews, integrations (GitHub, Slack, Datadog, PagerDuty, Linear, Atlassian)</li>
      <li>Ships the Pulumi Agent Skills catalog built in; loads the relevant skill when a task calls for it</li>
      <li>Over 4,500 organizations used it through Pulumi Cloud before the CLI launch (May 2026)</li>
      <li class="!font-semibold"><span class="text-[var(--p-primary)]">Now: <code>pulumi neo</code>, the same agent in your terminal</span></li>
    </ul>
  </div>
  <div class="neo-wrap">
    <img src="/pulumi-neo.png" alt="pulumi neo in a terminal: component analysis, stack outputs, repo layout" />
  </div>
</div>

<style scoped>
.neo-wrap { display: flex; align-items: center; justify-content: center; }
.neo-wrap img { max-width: 100%; max-height: 30rem; height: auto; border-radius: 12px; border: 1px solid var(--p-border); }
</style>

<!--
~60s. One slide of context for people who have not used Neo. Facts: the launch
post ("Neo, Now in the Terminal", May 20 2026) and the Neo docs index. The
screenshot on the right is `pulumi neo` in a terminal. Then straight into what
"local" buys you.
-->

---

# `pulumi neo` inherits your setup

<div class="grid grid-cols-2 gap-10 mt-4">
  <div>
    <ul class="!mt-2 !text-[1.3rem] !leading-relaxed space-y-3">
      <li>Runs where you run it: the CLIs you've authenticated, your environment variables, your kubeconfigs, the project you're editing</li>
      <li>Filesystem and shell tool calls execute on this machine, in the working directory you select; the reasoning stays in the Neo backend</li>
      <li>Ask it to investigate a failed preview, change the program, verify against a fresh preview, read live stack state</li>
      <li>Interactive by design: pair with it. For long asynchronous work, Pulumi Cloud Neo is still the place; both reach the same backend</li>
    </ul>
  </div>
  <div class="big-code">

```bash
pulumi login                  # identity + RBAC for Neo
cd my-project                 # needs a Pulumi.yaml
pulumi neo                    # interactive TUI
pulumi neo "what's in this stack?"  # or with a prompt

# tool calls run here; approvals show in the TUI
# the task's console URL is printed as well
```

  </div>
</div>

<aside class="info-card">
  <div class="info-card__label">Why this matters for the sandbox</div>
  <p>
    "Inherits your setup" is the feature <strong>and</strong> the risk. Whatever
    the terminal can reach, Neo can reach. That is exactly what we are going to
    put a wall around.
  </p>
</aside>

<!--
~75s. The docs' phrase is "Neo inherits your setup: the CLIs you've
authenticated, the environment variables and kubeconfigs you've configured,
and the project you're editing". Say it, then flip it: that is also the
attack surface. The info card is the pivot to Docker Sandboxes: we keep the
convenience by making the terminal itself the boundary.
-->

---

# Two axes of control

<div class="grid grid-cols-2 gap-8 mt-4">
  <div class="gpu-card gpu-card--primary">
    <div class="gpu-caption gpu-caption--accent">Approval mode · when Neo pauses</div>
    <ul class="!mt-4 !text-[1.15rem] !leading-relaxed space-y-2">
      <li><code>manual</code> (the console's <em>Review</em>): approval before <code>pulumi preview</code>, <code>pulumi up</code> and opening a pull request; in the CLI every tool call prompts</li>
      <li><code>balanced</code>: approval only before <code>pulumi up</code>; low-risk calls are auto-approved</li>
      <li><code>auto</code>: no approvals</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--accent">
    <div class="gpu-caption gpu-caption--accent">Permission mode · what Neo may change</div>
    <ul class="!mt-4 !text-[1.15rem] !leading-relaxed space-y-2">
      <li><code>default</code>: your full role-based capabilities</li>
      <li><code>read-only</code>: removes the ability to trigger Pulumi Cloud writes; reads, previews, code edits and pull requests keep working</li>
      <li>Independent of approval mode; org admins set the defaults, you override per task</li>
    </ul>
  </div>
</div>

<div class="mt-6 big-code">

```bash
pulumi neo --approval-mode balanced --permission-mode read-only "add tags to every bucket"
```

</div>

<!--
~90s. Quote the permissions page: "Neo has two independent axes of control.
Do not conflate them." Approval mode gates the Pulumi actions (preview, up,
PR); by design Neo investigates autonomously (reads state, opens ESC
environments) without prompting for each read. Permission mode is scope.
The demo uses manual + default first, then read-only. The CLI names the
strictest mode `manual`; the console calls it Review.
-->

---

# Plan Mode, and the read-only fine print

<div class="grid grid-cols-2 gap-10 mt-4">
  <div>
    <div class="gpu-caption gpu-caption--accent">Plan Mode</div>
    <ul class="!mt-3 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Toggle with <strong>Shift+Tab</strong> before sending the first message</li>
      <li>Neo examines the infrastructure and dependencies, writes a grounded plan, iterates with you, waits for explicit approval</li>
      <li>Task-level: composes with any approval or permission mode</li>
      <li>Best for multi-stack operations and unfamiliar infra</li>
    </ul>
  </div>
  <div>
    <div class="gpu-caption gpu-caption--muted">Read-only is scoped to Pulumi Cloud</div>
    <ul class="!mt-3 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>It blocks writes in Pulumi Cloud and instructs Neo not to modify; it does not stop Neo from opening an ESC environment or reaching the cloud account it unlocks</li>
      <li>The boundary you can rely on is <strong>permissions</strong>: the user's RBAC and the ESC environments the user can open</li>
      <li>Prefer read-only cloud roles in ESC environments; broaden deliberately</li>
    </ul>
  </div>
</div>

<aside class="info-card">
  <div class="info-card__label">Docs, verbatim</div>
  <p>"Treat read-only as 'no Pulumi Cloud mutations,' not 'no side effects anywhere.'"</p>
</aside>

<!--
~75s. Left: Plan Mode from the tasks page and the CLI page (Shift+Tab). Right:
the paragraph from the permissions model that every security reviewer should
read. This is the honest part of the talk and it sets up why the sandbox and
ESC exist: Neo's read-only is about Pulumi Cloud; the cloud-side boundary is
the role ESC hands out and the network the VM can reach.
-->

---

# The command, flag by flag

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code code-sm">

```text
pulumi neo [prompt] [flags]

  --approval-mode     manual | balanced | auto  (manual)
  --permission-mode   default | read-only       (default)
  -s, --stack         stack to attach to the task
  --cwd               working directory for local tools
  -p, --print         one prompt, non-interactive, exit
  --debug-update[=v]  investigate a failed update
  --debug-preview[=id]   investigate a failed preview
  --disable-integrations no integration credentials
  --org               organization that owns the task

pulumi neo resume <task-id>   reattach the tool loop
pulumi neo acp                Neo as an ACP editor agent
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>Ships with the Pulumi CLI; the sandbox image carries 3.260.0</li>
      <li><code>--print</code> is for scripts and other agents; it has no UI, so <code>manual</code> is rejected and the default becomes <code>auto</code></li>
      <li><code>resume</code> re-renders the chat and reattaches the loop; historical tool calls are not re-executed</li>
      <li><code>--debug-update</code> is the "why did last night's deploy fail" button</li>
      <li>Editors (Zed, JetBrains, VS Code, Cursor) host Neo over the Agent Client Protocol with the same controls</li>
    </ul>
  </div>
</div>

<!--
~60s. From the command reference and `pulumi neo --help`. Don't read every
flag; point at the three the demo uses (approval, permission, resume) and at
`--print`, because that is how other agents call Neo. Mention the editor
path in one breath (Neo in Your Editor docs).
-->

---

# Project instructions and handoff

<div class="grid grid-cols-2 gap-10 mt-4">
  <div>
    <div class="gpu-caption gpu-caption--accent">Instructions in the repo</div>
    <ul class="!mt-3 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Ship an <code>AGENTS.md</code> next to <code>Pulumi.yaml</code>: stack names, the ESC environment to use, what never to run</li>
      <li>Neo's filesystem tool is scoped to the working directory (plus <code>/tmp</code>), so the project's file is what it can read</li>
      <li>Our demo project carries one; whether Neo loads it unprompted is not stated in the docs (see the open questions in the repo)</li>
    </ul>
  </div>
  <div>
    <div class="gpu-caption gpu-caption--accent">Handoff from other agents</div>
    <ul class="!mt-3 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>The <code>pulumi-neo-handoff</code> skill packages the goal, repository pointers and a compacted conversation summary into a new Neo task and returns the task URL</li>
      <li>Claude Code, Codex, Cursor, Copilot, Gemini, Junie: any agent-skills client</li>
      <li>Under the hood it starts <code>pulumi neo</code></li>
    </ul>
  </div>
</div>

<div class="mt-5 big-code">

```bash
/plugin install pulumi-delegation                       # Claude Code: the handoff skill only
npx skills add pulumi/agent-skills/delegation --skill '*' # any agent that supports skills
# then: "Hand this off to Neo to apply the staging migration in production."
```

</div>

<!--
~60s. Left is our recommendation, stated carefully: put the instructions in
the project, because that is inside Neo's tool boundary; the docs do not say
AGENTS.md is auto-loaded, so we do not claim it. Right is from the agent
skills page: the delegation plugin and the universal `npx skills add` path.
-->

---

# Identity, RBAC, audit

<div class="zoom-content">

<ul class="!mt-6 !text-[1.3rem] !leading-relaxed space-y-4">
  <li><code>pulumi neo</code> runs as <strong>your Pulumi user</strong>, via <code>pulumi login</code>. Identity, RBAC and audit all run through Pulumi Cloud, the same as the console</li>
  <li>Neo has no identity of its own. A task carries the acting user's role assignments; on Enterprise and Business Critical a task can assume one role you already hold, which narrows access and never widens it</li>
  <li>RBAC is evaluated at execution time: lose access, and a running task loses it immediately</li>
  <li>Version control writes are the exception: Neo opens pull requests and pushes as the shared Pulumi GitHub App, not as you</li>
  <li>ESC secrets that a task reads can reach the model; Neo is instructed never to run <code>pulumi env open</code> or <code>--show-secrets</code>, and task events are scanned and redacted. the docs call that defense in depth rather than a guarantee</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.35; }
</style>

<!--
~60s. All from "Neo's permissions model". The one-liner: "Neo acts on behalf
of the user invoking it, and Neo can only do what that user could do
themselves." Then the two nuances people ask about: VCS identity, and what
happens to secret values. Close part 3: controls are good, but they are all
inside Pulumi Cloud. Next: the machine Neo runs on.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The infrastructure sandbox kit.</h1>
</div>

<!--
Part 4 divider. ~3s. Ten minutes: what is baked into the image, the
credential proxy, the network rules, the guardrails, MCP, and how the Neo
agent is defined. Source: github.com/dirien/infrastructure-sandbox-kit and
the kit in the workshop folder.
-->

---

# What's baked in

<div class="grid grid-cols-2 gap-10 mt-4">
  <div>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>A Docker Sandboxes template image: <code>ghcr.io/dirien/infrastructure-sandbox:v0.9.0</code>, multi-arch, built from <code>docker/sandbox-templates:claude-code-docker</code></li>
      <li>Pulumi CLI 3.260.0 (with <code>pulumi neo</code> and ESC via <code>pulumi env</code>), Terraform 1.16.0, OpenTofu 1.12.6, kubectl 1.37.0, Helm 4.2.4</li>
      <li>AWS CLI 2.36.34, Azure CLI, gcloud; Go, Node.js, Python, Java with language servers</li>
      <li>Every core tool pinned and verified by checksum or GPG signature; no <code>curl | sh</code></li>
      <li>Three ways in: a mixin kit on the stock Claude agent, the template plus the mixin, or one sandbox kit that names the image</li>
    </ul>
  </div>
  <div class="big-code code-sm">

```text
infrastructure-sandbox-kit/
├── kit/spec.yaml          # mixin (schemaVersion "2")
├── sandbox-kit/spec.yaml  # one-flag bundle, pins the image
├── template/Dockerfile    # the baked image
├── scripts/               # pinned, verified provisioning
├── docs/credentials.md    # binding Pulumi / cloud creds
└── docs/network.md        # extending the allow-list

pulumi/workshops → neo-in-a-docker-sandbox/
└── neo-kit/spec.yaml      # kind: sandbox, runs pulumi neo
```

  </div>
</div>

<!--
~75s. The kit started life as a Claude Code sandbox for IaC work. Everything
on the left is pinned; the hardening table in the kit README lists the
verification method per tool. The workshop adds one thing: a `neo-kit` that
reuses the same image and rules but starts `pulumi neo` instead of Claude
Code. The wall stays the same; the agent inside it changes.
-->

---

# The credential proxy

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code">

```yaml
# neo-kit/spec.yaml
credentials:
  - service: pulumi
    required: true
    apiKey:
      name: PULUMI_ACCESS_TOKEN
      proxyManaged: true
      inject:
        - domain: api.pulumi.com
          header: Authorization
          format: "token %s"
```

```bash
# on the host, once
sbx secret set -g pulumi
# inside the VM, forever
echo $PULUMI_ACCESS_TOKEN   # → proxy-managed
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>The kit declares <em>which</em> credential and <em>where</em> it is injected; you bind the value on the host. A kit cannot read host environment variables or files</li>
      <li>The container sees a sentinel. The host-side proxy rewrites the <code>Authorization</code> header on requests to <code>api.pulumi.com</code> only</li>
      <li>Enough for <code>pulumi login</code>, <code>pulumi neo</code>, <code>pulumi up</code> and <code>pulumi env</code>; the real token never enters the VM</li>
      <li>Third-party v2 kits need an approved credential binding: <code>sbx</code> asks on first run and records it in <code>~/.config/sbx/credentials.yaml</code></li>
      <li>Cloud credentials are <strong>not</strong> in this block on purpose: those come from ESC at run time (part 7)</li>
    </ul>
  </div>
</div>

<!--
~90s. Read the YAML top to bottom. `proxyManaged: true` is the line that puts
the placeholder in the VM. Then the mental model from the Docker credentials
docs: a kit declares the need and the injection point, the user provides the
value through the secret store, a binding authorizes it. Stress the last
bullet: AWS uses SigV4, so an AWS key would have to live in the VM; that is
why we mint it short-lived instead of injecting it.
-->

---

# Network rules

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code code-sm">

```yaml
permissions:
  network:
    allow:
      - api.pulumi.com        # Neo API + events, state, ESC
      - get.pulumi.com        # plugin downloads
      - github.com            # providers, kit scripts
      - objects.githubusercontent.com
      - registry.npmjs.org    # program dependencies
      - sts.amazonaws.com
      - sts.eu-central-1.amazonaws.com
      - s3.eu-central-1.amazonaws.com
      - "*.s3.eu-central-1.amazonaws.com"
      # …registries, apt mirrors, other clouds
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>Egress is <strong>default-deny</strong>. All outbound TCP goes through a proxy on the host; UDP and ICMP are blocked; DNS resolves through a policy-aware resolver</li>
      <li>The kit's list is the whole reachable world: exact hosts, <code>host:port</code>, single-label <code>*.host</code> are enforced; <code>**.host</code> and CIDR parse but are pending</li>
      <li>Regional AWS endpoints are explicit, so a task cannot wander into another region</li>
      <li><code>sbx policy log &lt;sandbox&gt;</code> shows every request with the rule it matched: the discovery loop for new hosts</li>
      <li>Organization governance (paid) can override: only org allow rules grant access; kit deny rules still apply</li>
    </ul>
  </div>
</div>

<!--
~90s. The list on the left is abridged from neo-kit/spec.yaml. Two things to
say: default-deny is the posture (Docker "Default security posture" page),
and the region endpoints are deliberately narrow. The proxy log is what the
demo shows in step 2. Governance line: from the kits docs, for the platform
teams in the room.
-->

---

# Guardrails: hooks for Claude Code, shims for Neo

<div class="grid grid-cols-2 gap-8 mt-4">
  <div class="gpu-card gpu-card--muted">
    <div class="gpu-caption gpu-caption--muted">Claude Code kit</div>
    <ul class="!mt-3 !text-[1.1rem] !leading-relaxed space-y-2">
      <li>Claude Code hooks from <code>dirien/my-claude-apm-setup</code>, wired into <code>~/.claude/settings.json</code> at every start</li>
      <li>PreToolUse guard blocks destructive shell commands (<code>rm -rf /</code>, <code>git push --force</code>, <code>mkfs</code>, …)</li>
      <li>PostToolUse hook scans edits for hardcoded secrets and formats files</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary">
    <div class="gpu-caption gpu-caption--accent">Neo kit</div>
    <ul class="!mt-3 !text-[1.1rem] !leading-relaxed space-y-2">
      <li>Neo has no hook system, but it runs shell tool calls through <code>sh -c</code>, so PATH is the hook</li>
      <li><code>~/.local/bin/{pulumi,aws,terraform,tofu}</code> are shims: match the argument line against a pattern list, log, exit 2; otherwise exec the real binary</li>
      <li>A human lifts it per sandbox with one file; blocked attempts land in <code>guard.log</code></li>
    </ul>
  </div>
</div>

<div class="mt-5 big-code">

```text
pulumi|^(destroy|down)([[:space:]]|$)            pulumi|^stack[[:space:]]+(rm|remove|delete)
pulumi|^state[[:space:]]+(delete|unprotect)      aws|(^|[[:space:]])s3[[:space:]]+(rb|rm)
aws|(delete|terminate|deregister|purge|remove|disassociate|detach)-[a-z0-9-]+
terraform|^(destroy|taint|force-unlock)          tofu|^apply[[:space:]].*-destroy
```

</div>

<aside class="info-card">
  <div class="info-card__label">What the guard is not</div>
  <p>The guard catches accidents. It is no security boundary, because the agent has sudo inside the VM. The boundaries are the hypervisor, the allow-list, the proxy and Pulumi RBAC.</p>
</aside>

<!--
~90s. Left is what the kit already did for Claude Code. Right is the port to
Neo: same idea, different mechanism, because `pulumi neo` executes shell
tools with `sh -c` (that is in the pulumi/pulumi source, tools/shell.go). The
pattern file is in the repo. Say the info card out loud, because without it
the guard looks like a demo trick.
-->

---

# MCP: what the kit registers, what Neo brings

<div class="grid grid-cols-2 gap-10 mt-4">
  <div>
    <div class="gpu-caption gpu-caption--muted">Claude Code kit</div>
    <ul class="!mt-3 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Registers the hosted <code>pulumi</code> MCP server (<code>mcp.ai.pulumi.com</code>) at user scope on every start</li>
      <li>Registry lookups, resource schemas, code validation, Neo tasks from Claude</li>
      <li>Docker routes supported agents through one host-side MCP gateway; org MCP policies are enforced there</li>
    </ul>
  </div>
  <div>
    <div class="gpu-caption gpu-caption--accent">Neo kit</div>
    <ul class="!mt-3 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Nothing to register: Neo ships the Pulumi skills catalog and registry knowledge, and gets external MCP integrations from Pulumi Cloud</li>
      <li>MCP integration credentials are never exposed to the model; <code>--disable-integrations</code> turns them off per task</li>
      <li>CLI integrations run as <code>pulumi env run</code> against an ESC environment, as you</li>
    </ul>
  </div>
</div>

<!--
~45s. Short slide. The kit's MCP story is a Claude Code feature; for Neo the
equivalent lives in Pulumi Cloud (integrations page, permissions page). Keep
it to the two contrasts and move on to the interesting part: how the agent is
defined.
-->

---

# How the Neo agent is defined

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code code-xs">

```yaml
# neo-kit/spec.yaml (abridged)
schemaVersion: "2"
kind: sandbox
name: neo-sandbox
args:
  approvalMode:   { default: manual,  enum: [manual, balanced, auto] }
  permissionMode: { default: default, enum: [default, read-only] }
sandbox:
  image: ghcr.io/dirien/infrastructure-sandbox:v0.9.0
  entrypoint: [bash, /home/agent/.local/share/neo-sandbox/neo-sandbox.sh]
environment:
  variables:
    NEO_SANDBOX_APPROVAL_MODE:   "${{ kit.args.approvalMode }}"
    NEO_SANDBOX_PERMISSION_MODE: "${{ kit.args.permissionMode }}"
setup:
  install:
    - user: "1000"
      command: bash ~/.local/share/neo-sandbox/install-shims.sh
  files:
    - path: /home/agent/.config/neo-sandbox/workspace
      content: "${WORKDIR}"
agentInstructions: { filename: AGENTS.md }
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.15rem] !leading-relaxed space-y-2">
      <li><code>kind: sandbox</code> defines a full agent: image plus entrypoint. A mixin would only extend one</li>
      <li>The image is the one the Claude kit builds; the entrypoint is what changes</li>
      <li><code>neo-sandbox.sh</code>: put the shims first on PATH → find the <code>Pulumi.yaml</code> in the workspace → print the boundaries → <code>exec pulumi neo --approval-mode … --permission-mode …</code></li>
      <li>Kit arguments set the modes at create time; <code>sbx run --env</code> overrides them for a session</li>
      <li>The image must provide UID 1000 <code>agent</code> with passwordless sudo and preserve the proxy variables across sudo; the sandbox templates already do</li>
    </ul>
  </div>
</div>

<!--
~90s. The whole "custom agent" is 20 lines: image, entrypoint, two arguments.
Walk the entrypoint's four steps; the banner is the "what Neo can and can't
touch" moment of the demo. The base-image requirements are from the kit spec
reference. Then the run command on the next slide.
-->

---

# Running it, and the boundaries it draws

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code code-sm">

```bash
sbx secret set -g pulumi                  # once
sbx run --name neo-demo ./neo-kit ./02-app
sbx run --name neo-demo \
  --env NEO_SANDBOX_PERMISSION_MODE=read-only
sbx exec neo-demo sh -c 'pulumi destroy'  # blocked
sbx policy log neo-demo                   # who reached what
sbx rm -f neo-demo                        # gone, secrets too
```

  </div>
  <div class="boundaries">
    <table>
      <thead><tr><th>Neo wants…</th><th>Enforced by</th></tr></thead>
      <tbody>
        <tr><td>the host filesystem</td><td>hypervisor; only the workspace is mounted</td></tr>
        <tr><td>the Pulumi token</td><td>credential proxy; sentinel in the VM</td></tr>
        <tr><td>cloud credentials</td><td>none in the VM; ESC mints 1h OIDC creds</td></tr>
        <tr><td>the internet</td><td>default-deny allow-list; proxy log</td></tr>
        <tr><td>to change Pulumi Cloud</td><td>your RBAC; permission mode; approvals</td></tr>
        <tr><td>to delete things</td><td>guard shims; <code>protect: true</code></td></tr>
      </tbody>
    </table>
  </div>
</div>

<style scoped>
.boundaries table { width: 100%; border-collapse: collapse; font-size: 1.1rem; line-height: 1.4; }
.boundaries th { text-align: left; color: var(--p-primary); font-family: var(--slidev-font-mono); font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.06em; padding: 0.4rem 0.6rem; border-bottom: 1.5px solid var(--p-border); }
.boundaries td { padding: 0.5rem 0.6rem; border-bottom: 1px solid var(--p-border); vertical-align: top; }
</style>

<!--
~75s. Five commands the demo uses, and the table the demo proves row by row.
Rows 1 to 4 are enforced outside the VM (Mike's part explains why that holds),
rows 5 and 6 by Pulumi Cloud and the kit. This is the last Pulumi slide before
the Docker segment; hand over to Mike with "so why can we trust rows 1 to 4".
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Docker Sandboxes.</h1>
  <p class="!mt-6 !text-[2rem] text-[var(--p-fg-muted)] !m-0">Mike Coleman · Staff Solutions Architect, Docker</p>
</div>

<!--
MIKE: replace. Part 5 divider, 10 minutes owned by Mike Coleman (Docker).
The three slides that follow are placeholders drafted from the public Docker
Sandboxes docs (architecture, isolation, kits, credentials). Replace them
with your own; the Pulumi slides only assume these three ideas were covered:
microVM isolation, kits, secret injection.
-->

---

<!-- MIKE: replace -->

# microVM isolation

<div class="gpu-caption gpu-caption--muted !mb-4">Placeholder for Mike Coleman (Docker)</div>

<div class="zoom-content">

<ul class="!mt-2 !text-[1.25rem] !leading-relaxed space-y-3">
  <li><strong>Hypervisor:</strong> every sandbox is a lightweight microVM with its own Linux kernel; host processes and files outside the mounted workspace are not reachable. <code>sbx rm</code> deletes the VM and everything in it</li>
  <li><strong>Network:</strong> its own isolated network; all outbound TCP through a policy-enforcing proxy on the host; direct UDP/ICMP blocked; sandboxes cannot talk to each other</li>
  <li><strong>Docker Engine:</strong> a separate engine inside the VM; <code>docker build</code> and <code>compose up</code> never touch the host daemon</li>
  <li><strong>Workspace:</strong> mountless, direct mount, or <code>--clone</code> (host repo read-only at <code>/run/sandbox/source</code>, the agent works on a private clone)</li>
  <li><strong>Credential proxy:</strong> keys stay on the host; the proxy injects headers on the way out</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.35; }
</style>

<!--
MIKE: replace. ~3 min. Drafted from docs.docker.com/ai/sandboxes/security/isolation
("five isolation layers") and the architecture page. The "review agent-edited
files like an untrusted PR" warning for direct mounts is worth one sentence
for this audience.
-->

---

<!-- MIKE: replace -->

# Kits: the perfect sandbox for your project, declared

<div class="gpu-caption gpu-caption--muted !mb-4">Placeholder for Mike Coleman (Docker)</div>

<div class="grid grid-cols-2 gap-10 mt-2">
  <div>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>One <code>spec.yaml</code> (schema v2): tools to install, environment, credentials to inject, network allow/deny, files to drop in, startup commands, agent instructions</li>
      <li><code>kind: mixin</code> extends an agent and stacks with <code>--kit</code>; <code>kind: sandbox</code> defines the agent: image, entrypoint, command</li>
      <li>Load from a directory, ZIP, Git URL or OCI registry; <code>sbx kit validate</code>, <code>inspect</code>, <code>push</code>, <code>sign</code>, <code>verify</code></li>
      <li>Kit sources are allow-listed (<code>kit.allowedSources</code>); install commands run as root in the VM, so provenance matters</li>
    </ul>
  </div>
  <div class="big-code code-sm">

```bash
sbx run ./my-agent/                    # sandbox kit
sbx run claude --kit ./my-mixin/       # mixin on claude
sbx run "git+https://github.com/docker/sbx-kits-contrib.git#dir=amp"
sbx run ghcr.io/myorg/my-agent:1.0     # OCI registry
sbx run ./my-agent/ --kit-arg channel=beta
```

  </div>
</div>

<!--
MIKE: replace. ~3 min. Drafted from the kits page and the kit spec reference.
Two things the Pulumi half relies on: the mixin vs sandbox distinction and
`permissions.network` + `credentials` living in the kit.
-->

---

<!-- MIKE: replace -->

# Secret injection

<div class="gpu-caption gpu-caption--muted !mb-4">Placeholder for Mike Coleman (Docker)</div>

<div class="grid grid-cols-2 gap-10 mt-2">
  <div>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-2">
      <li><code>sbx secret set &lt;service&gt;</code> stores the value in the OS keychain; the sandbox only ever sees a sentinel such as <code>proxy-managed</code></li>
      <li>The forward proxy matches the declared domain and rewrites the header before the request leaves the host</li>
      <li>Dynamic sources: <code>--ref op://…</code>, an AWS Secrets Manager ARN, or <code>--command 'gh auth token'</code>, resolved on the host and cached</li>
      <li>OAuth agents get sentinel tokens too; <code>passthrough: true</code> opts out</li>
      <li>Third-party v2 kits need an approved credential binding per service and domain</li>
    </ul>
  </div>
  <div class="big-code code-sm">

```bash
sbx secret set anthropic                 # built-in service
sbx secret set -g pulumi                 # kit-declared (ours)
sbx secret set github --command 'gh auth token'
sbx secret set-custom --host api.example.com \
  --env API_KEY --value "$KEY"
gh auth token | sbx secret set --registry ghcr.io \
  --password-stdin
```

  </div>
</div>

<!--
MIKE: replace. ~3 min. Drafted from the credentials page. The line the demo
comes back to: "credential values are never stored inside the VM; they are
not available as environment variables or files inside the sandbox unless you
explicitly set them." Hand back to Engin for the demo.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Neo in a Docker Sandbox.</h1>
</div>

<!--
Part 6 divider. 15 minutes. Suggested speaker: Engin, with Adam on the second
terminal. Switch to the terminals now; the next seven slides are the map and
one slide per step, to flip back to when the terminal is thinking. The
runbook with every command and expected output is DEMO.md.
-->

---

# The demo in six steps

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card"><div class="gpu-caption gpu-caption--muted">1 · 2 min</div><p>Start the sandbox, read the banner</p></div>
  <div class="gpu-card gpu-card--muted step-card"><div class="gpu-caption gpu-caption--muted">2 · 2 min</div><p>What Neo can and can't touch</p></div>
  <div class="gpu-card gpu-card--primary step-card"><div class="gpu-caption gpu-caption--accent">3 · 5 min</div><p>A real task: harden the bucket, preview, approve, up</p></div>
  <div class="gpu-card gpu-card--muted step-card"><div class="gpu-caption gpu-caption--muted">4 · 2.5 min</div><p>Approval and permission modes doing their job</p></div>
  <div class="gpu-card gpu-card--accent step-card"><div class="gpu-caption gpu-caption--accent">5 · 2 min</div><p>A guardrail catches a destructive command</p></div>
  <div class="gpu-card gpu-card--muted step-card"><div class="gpu-caption gpu-caption--muted">6 · 1.5 min</div><p>The change landed</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
</style>

<!--
~20s. Say the six steps and the one rule: every command in the demo is in the
repo, so anyone can replay it. If the live demo dies, the recording plays the
same six steps (DEMO.md, "Fallback").
-->

---

# 1 · Start the sandbox

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code">

```bash
01-sandbox/up.sh
# = sbx run --name neo-demo ./neo-kit ./02-app
```

```text
┌─ Neo in a Docker Sandbox ────────────────────────────
│ agent       pulumi neo  (Pulumi CLI v3.260.0)
│ identity    engin  orgs: …  via the credential proxy
│ token       PULUMI_ACCESS_TOKEN=proxy-managed
│ cloud creds none; ESC mints them at run time
│ egress      default-deny; kit allow-list only
│ guard       on: destructive commands are blocked
│ modes       approval=manual  permission=default
│ project     …/neo-in-a-docker-sandbox/02-app
└──────────────────────────────────────────────────────
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>First run pulls the image and asks to approve the <code>pulumi</code> credential binding the kit declares</li>
      <li>The install step is a no-op on this image; the shims are installed; the entrypoint prints the banner and starts the Neo TUI</li>
      <li>Read the banner: identity through the proxy, sentinel token, no cloud credentials, default-deny egress, guard on, manual approvals</li>
    </ul>
  </div>
</div>

<!--
Step 1, 2 min. The banner is the whole part 4 in eight lines. Point at
"identity" (Neo is me) and "token" (but the token is not here). Then leave
this slide up while T2 runs the boundaries script.
-->

---

# 2 · What Neo can and can't touch

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code">

```bash
01-sandbox/boundaries.sh     # host, via sbx exec
```

```text
▶ 1. Identity    whoami → User: engin
▶ 2. Token       PULUMI_ACCESS_TOKEN=proxy-managed
▶ 3. Cloud creds no AWS_/GOOGLE_/AZURE_ vars, no ~/.aws
▶ 4. Filesystem  only …/02-app; no parent, no /Users
▶ 5. Network     ifconfig.me blocked; api.pulumi.com 200
▶ 6. Proxy log   sbx policy log: host, rule, count
▶ 7. Guard       pulumi destroy → blocked, exit=2
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>Seven checks, all run from outside the VM</li>
      <li>The proxy log is the host's view: it decides what leaves, and it knows which rule matched</li>
      <li>Try it on your own kit: every blocked row is a host to add or a leak you just prevented</li>
    </ul>
  </div>
</div>

<!--
Step 2, 2 min. Run the script in T2 and narrate the seven blocks. The
audience question this answers: "what could the agent exfiltrate?" Nothing
it doesn't have; and it doesn't have much.
-->

---

# 3 · A real task

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code">

```text
Harden the S3 bucket in index.ts: enable versioning,
default SSE-S3 encryption, block all public access,
and tag the new resources with owner=neo. Use the
@pulumi/aws v7 sub-resources. Run pulumi preview
and show me the diff before deploying anything.
```

```text
+  aws:s3:BucketVersioning                   create
+  aws:s3:BucketServerSideEncryptionConfig…  create
+  aws:s3:BucketPublicAccessBlock            create
Resources: + 3 to create, 2 unchanged
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>Manual mode: every tool call asks. Reads, the edit, the preview, then <em>deploy it</em>, then the update</li>
      <li>The preview ran inside the VM against the real account, with credentials ESC minted for that run; the proxy log shows STS and S3 in one region</li>
      <li>Neo never sees a key file or a secret value; the provider is the real one</li>
      <li>The update URL points at Pulumi Cloud: the audit trail is the normal one</li>
    </ul>
  </div>
</div>

<!--
Step 3, 5 min. The longest step; keep talking while Neo works (the "Say"
paragraph in DEMO.md). When the preview shows, read the three resources.
Type "deploy it", approve `pulumi up`, and open the update in the console on
the second screen.
-->

---

# 4 · Modes doing their job

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code">

```bash
# leave the session, re-attach read-only
01-sandbox/up.sh \
  --env NEO_SANDBOX_PERMISSION_MODE=read-only -- \
  "Add a lifecycle rule that expires noncurrent \
   versions after 30 days, preview it, and deploy it."
```

```text
│ modes   approval=manual  permission=read-only
…
Neo: edits index.ts, runs pulumi preview (+1)
Neo: cannot deploy in read-only mode; reports
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>Permission mode is scope: read-only removes Pulumi Cloud writes, keeps reads, previews, edits and PRs</li>
      <li>Approval mode is cadence: manual asks every time, balanced only before <code>pulumi up</code>, auto never; Plan Mode (Shift+Tab) puts a plan in front of all of it</li>
      <li>Read-only is scoped to Pulumi Cloud, not the account: that boundary is RBAC plus which ESC environments you can open</li>
    </ul>
  </div>
</div>

<!--
Step 4, 2.5 min. Show the banner line change, let Neo edit and preview, and
let it refuse the deploy. If Neo shells out to `pulumi up` instead of using
its Pulumi tool, say so honestly (open question 11 in the repo). Do not run
all three approval modes; describe balanced and auto in one sentence each.
-->

---

# 5 · A guardrail catches a destructive command

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code">

```text
You: We're done here. Tear the whole stack down.
Neo: runs `pulumi destroy --yes`  [approve on purpose]

guard: blocked a destructive command
  pulumi destroy --yes
  matched: ^(destroy|down)([[:space:]]|$)
Nothing was executed. …
```

```bash
03-guardrails/try-destroy.sh  # from the host: exit=2
03-guardrails/try-egress.sh   # unlisted region → blocked
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>Layer 1, soft: the shim in the VM refuses and logs. A human lifts it per sandbox with one file</li>
      <li>Layer 2, Pulumi: the bucket is <code>protect: true</code>; the engine refuses to delete it even if the guard is gone</li>
      <li>Layer 3, outside the VM: hypervisor, allow-list, credential proxy. Root inside the VM does not reach them</li>
    </ul>
  </div>
</div>

<!--
Step 5, 2 min. Approve the destroy on purpose so the audience sees the guard
answer instead of Pulumi. Then the host-side scripts. The three layers are
the takeaway, because the guard alone proves little.
-->

---

# 6 · The change landed

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code">

```bash
cd 02-app
git --no-pager diff --stat -- index.ts
pulumi env run <org>/neo-workshop/aws-oidc -- \
  aws s3api get-bucket-versioning \
  --bucket "$(pulumi stack output bucketName)"
```

```json
{ "Status": "Enabled" }
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>A real change in a real account, reviewed at every step</li>
      <li>The same ESC environment the sandbox used mints the credentials for this check; no static key anywhere in the demo</li>
      <li>The diff is what you would review in a pull request; the update is in Pulumi Cloud; the bucket is in the AWS console</li>
    </ul>
  </div>
</div>

<!--
Step 6, 1.5 min. Close the loop: git diff, the AWS API through `pulumi env
run`, the console. Then reset happens after the session
(01-sandbox/reset.sh). Hand over to part 7, which explains the `pulumi env
run` you just used.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">No static keys.</h1>
</div>

<!--
Part 7 divider. ~3s. Three minutes on Pulumi ESC and short-lived credentials:
what the demo used, and what it replaces.
-->

---

# Pulumi ESC: credentials that expire

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code code-sm">

```yaml
# ESC environment <org>/neo-workshop/aws-oidc (from 00-esc)
values:
  aws:
    region: eu-central-1
    login:
      fn::open::aws-login:
        oidc:
          duration: 1h
          roleArn: arn:aws:iam::<account>:role/neo-workshop-esc
          sessionName: neo-in-a-docker-sandbox
  environmentVariables:
    AWS_ACCESS_KEY_ID: ${aws.login.accessKeyId}
    AWS_SECRET_ACCESS_KEY: ${aws.login.secretAccessKey}
    AWS_SESSION_TOKEN: ${aws.login.sessionToken}
  pulumiConfig:
    aws:region: ${aws.region}
```

```yaml
# 02-app/Pulumi.dev.yaml
environment:
  - neo-workshop/aws-oidc
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>AWS trusts <code>https://api.pulumi.com/oidc</code> as an identity provider; audience <code>aws:&lt;org&gt;</code>; the role's trust policy pins the subject to <code>pulumi:environments:org:&lt;org&gt;:env:neo-workshop/*</code></li>
      <li><code>fn::open::aws-login</code> exchanges the ESC token for STS credentials when the environment is opened: by <code>pulumi up</code>, <code>pulumi env open</code>, <code>pulumi env run</code></li>
      <li>The stack imports the environment; the provider gets region and credentials; nothing is stored</li>
      <li>Inside the sandbox this is the only way credentials appear, and they are gone in an hour</li>
    </ul>
  </div>
</div>

<!--
~2 min. The YAML is the one 00-esc creates. Walk it: login provider with
OIDC, the projections into env vars and stack config, then the two-line
stack import. Trust policy facts from the ESC AWS OIDC docs. This is learning
outcome 4, so name it: "this is how ESC replaces static API keys".
-->

---

# What this replaces

<div class="grid grid-cols-2 gap-8 mt-4">
  <div class="gpu-card gpu-card--muted">
    <div class="gpu-caption gpu-caption--muted">Before</div>
    <ul class="!mt-3 !text-[1.15rem] !leading-relaxed space-y-2">
      <li>A long-lived key in <code>~/.aws/credentials</code>, in <code>.env</code>, in CI secrets, in the agent's environment</li>
      <li>Rotation is a project; revocation is a fire drill</li>
      <li>Whoever (or whatever) reads the file has the account</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary">
    <div class="gpu-caption gpu-caption--accent">With ESC</div>
    <ul class="!mt-3 !text-[1.15rem] !leading-relaxed space-y-2">
      <li>An IAM role that only your Pulumi org's environments can assume, for one hour, with a least-privilege policy (the demo role: S3 on <code>neo-workshop-*</code> buckets)</li>
      <li>Who can open the environment is Pulumi RBAC; open approvals put a reviewer in front of the most powerful ones, including Neo's opens</li>
      <li>Same pattern for Azure and Google Cloud login providers, and for Vault, 1Password, Secrets Manager</li>
    </ul>
  </div>
</div>

<aside class="info-card">
  <div class="info-card__label">Neo opens environments as you</div>
  <p>Scope the role and scope who can open the environment, and the agent's cloud reach is exactly what you decided.</p>
</aside>

<!--
~60s. The permissions page says it directly: to constrain what Neo can reach,
scope the acting user's RBAC and the ESC environments they can open, and
prefer read-only cloud roles. That is the sentence to end the technical part
on. Then wrap.
-->

---

# Recap

<div class="zoom-content">

<div class="recap-wrap">
  <div class="gpu-card gpu-card--primary recap-card">
    <div class="gpu-caption gpu-caption--accent">What we did in 60 minutes</div>
    <ul class="!mt-3 !text-[1.35rem] !leading-relaxed space-y-3">
      <li>Named what changes when the agent's target is your cloud: the credential is the blast radius</li>
      <li>Ran Pulumi Neo in the terminal with approval and permission modes, Plan Mode and your RBAC</li>
      <li>Sealed it in a Docker Sandbox microVM: one folder, a proxy-injected token, a default-deny allow-list, a guard</li>
      <li>Watched it change real infrastructure with credentials Pulumi ESC minted for an hour</li>
      <li>Everything is in one repo folder: kit, runbook, scripts, slides</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.recap-wrap { margin-top: 1rem; display: flex; justify-content: center; }
.recap-card { display: flex; flex-direction: column; max-width: 60rem; }
.recap-card .gpu-caption { font-size: 1.5rem !important; letter-spacing: 0.04em; margin-bottom: 0.6rem; }
</style>

<!--
~45s. Suggested speaker: Adam. Don't read the whole list; say the first and
the last line. Then resources and Q&A.
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
~20s. Five QR codes, generated locally into slides/public/qr. The repo one is
the only one people need; the runbook (DEMO.md) and the kit are in there.
-->

---

# Continue your Pulumi journey!

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-6">
  <div class="gpu-card gpu-card--primary journey-card">
    <div class="journey-card__title">Join the Pulumi Community Slack!</div>
    <p class="journey-card__body">
      Head to <a class="text-[var(--p-primary)]" href="https://slack.pulumi.com/">slack.pulumi.com</a>
      and ask about Neo, ESC or the sandbox kit.
    </p>
  </div>
  <div class="gpu-card gpu-card--primary journey-card">
    <div class="journey-card__title">Sign up for a Pulumi Cloud account!</div>
    <p class="journey-card__body">
      A free individual account is enough to try <code>pulumi neo</code> and ESC;
      a trial organization gives you the full set of features.
    </p>
  </div>
  <div class="gpu-card gpu-card--accent journey-card">
    <div class="journey-card__title">Join us for our next workshops!</div>
    <p class="journey-card__body">
      Link in the <strong>Handouts</strong> tab.
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
~20s. Three CTAs, same as every Pulumi workshop: Slack, a Cloud account, the
next workshop link in the handouts tab.
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
