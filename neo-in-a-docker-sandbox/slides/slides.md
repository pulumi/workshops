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

---

<div class="absolute inset-0 flex items-center px-24 gap-20">
  <div class="flex-shrink-0">
    <img src="/img/engin-diri.png" class="w-[28rem] rounded-2xl shadow-xl border-4" style="border-color: rgba(126,107,255,0.45)" alt="Engin Diri" />
  </div>
  <div class="flex-1">
    <h1 class="!text-[7rem] !leading-[1.02] !font-semibold !tracking-tight !mb-4 !text-[var(--p-primary)]">Engin Diri</h1>
    <p class="!text-[2.2rem] !leading-relaxed !m-0 opacity-90">
      Principal Solutions Architect at <strong class="!text-[var(--p-primary)]">Pulumi</strong>
    </p>
    <div class="!mt-8 flex items-center gap-8 !text-[1.5rem] opacity-70">
      <span class="flex items-center gap-2"><carbon-logo-x /> @_ediri</span>
      <span class="flex items-center gap-2"><carbon-logo-linkedin /> engin-diri</span>
      <span class="flex items-center gap-2"><carbon-logo-github /> dirien</span>
    </div>
    <p class="!mt-10 !text-[1.75rem] !leading-relaxed opacity-70 !m-0">
      Building platform tooling and infrastructure-as-code.<br/>
      Helping teams ship cloud infrastructure faster. With and without agents.
    </p>
  </div>
</div>

---

<div class="absolute inset-0 flex items-center px-24 gap-20">
  <div class="flex-shrink-0">
    <img src="/img/adam-gordon-bell.png" class="w-[28rem] rounded-2xl shadow-xl border-4" style="border-color: rgba(126,107,255,0.45)" alt="Adam Gordon Bell" />
  </div>
  <div class="flex-1">
    <h1 class="!text-[7rem] !leading-[1.02] !font-semibold !tracking-tight !mb-4 !text-[var(--p-primary)]">Adam Gordon Bell</h1>
    <p class="!text-[2.5rem] !leading-relaxed !m-0 opacity-90">
      Community Engineer at <strong class="!text-[var(--p-primary)]">Pulumi</strong>
    </p>
    <div class="!mt-8 flex items-center gap-8 !text-[1.5rem] opacity-70">
      <span class="flex items-center gap-2"><carbon-logo-x /> @adamgordonbell</span>
      <span class="flex items-center gap-2"><carbon-logo-linkedin /> adamgordonbell</span>
      <span class="flex items-center gap-2"><carbon-logo-github /> adamgordonbell</span>
    </div>
    <p class="!mt-10 !text-[1.75rem] !leading-relaxed opacity-70 !m-0">
      Host of the CoRecursive podcast.<br/>
      Telling the stories behind the code.
    </p>
  </div>
</div>

---

<div class="absolute inset-0 flex items-center px-24 gap-20">
  <div class="flex-shrink-0">
    <img src="/img/mike-coleman.jpg" class="w-[28rem] rounded-2xl shadow-xl border-4" style="border-color: rgba(126,107,255,0.45)" alt="Mike Coleman" />
  </div>
  <div class="flex-1">
    <h1 class="!text-[7rem] !leading-[1.02] !font-semibold !tracking-tight !mb-4 !text-[var(--p-primary)]">Mike Coleman</h1>
    <p class="!text-[2.5rem] !leading-relaxed !m-0 opacity-90">
      Staff Solutions Architect at <strong class="!text-[var(--p-primary)]">Docker</strong>
    </p>
    <div class="!mt-8 flex items-center gap-8 !text-[1.5rem] opacity-70">
      <span class="flex items-center gap-2"><carbon-logo-github /> mikegcoleman</span>
    </div>
    <p class="!mt-10 !text-[1.75rem] !leading-relaxed opacity-70 !m-0">
      Docker Sandboxes, and the isolation that makes them safe.
    </p>
  </div>
</div>

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

---

# Housekeeping

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>Be chatty in the chat tab</li>
  <li>Ask questions in the Q&amp;A tab</li>
  <li>The handouts tab has slides and scripts</li>
  <li>The recording link comes by email</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>Why infra is different</li>
  <li>Pulumi Neo in the CLI</li>
  <li>Docker Sandboxes, with Mike</li>
  <li>The infrastructure sandbox kit</li>
  <li>The demo</li>
  <li>Wrap-up and Q&amp;A</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.6; }
</style>

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[4rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[85%]">"This was a catastrophic failure on my part… I destroyed months of work in seconds."</h1>
</div>

---
layout: image
image: /michael-scott-cringe.jpg
backgroundSize: cover
---

---

# An AI said that. About a production database.

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">The agent's own words</div>
    <p>"This was a catastrophic failure on my part… I destroyed months of work in seconds."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>A founder testing "vibe coding" live, in public</li>
      <li>Mid code freeze, told not to proceed without approval</li>
      <li>It also said rollback was impossible. That wasn't true.</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span><strong>Psssst…</strong> it was Replit's own agent, July 2025</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">You can revert the program.</h1>
</div>

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">You can't undo what it did.</h1>
</div>

---

# What changes when the target is your cloud

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">A codebase</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Review a diff</li>
      <li>Revert with one command</li>
      <li>Tests run on fakes</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
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

---

# Before you give an agent your cloud account

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--muted">Who</div><p>Who is it acting as?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--muted">What</div><p>What is it allowed to change?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-clock class="step-icon" /><div class="gpu-caption gpu-caption--muted">When</div><p>When does it stop and ask you?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--muted">Where</div><p>Where does it actually run?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--muted">With what</div><p>Which credentials does it hold?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-shield-warning class="step-icon" /><div class="gpu-caption gpu-caption--muted">What if</div><p>What stops it when it gets it wrong?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Pulumi Neo in the terminal.</h1>
  </div>
</div>

<style scoped>
.sec { position: absolute; inset: 0; overflow: hidden; }
.sec__lines { position: absolute; width: 30rem; height: auto; opacity: 0.55; pointer-events: none; }
.sec__lines--tr { top: 0; right: 0; }
.sec__lines--bl { bottom: 0; left: 0; }
.sec__inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 5rem; }
.sec__inner h1 { text-wrap: balance; }
</style>

---

# Neo is Pulumi's infrastructure agent

<div class="grid grid-cols-[1.4fr_1fr] gap-10 mt-4">
  <div>
    <v-clicks>
    <ul class="neo-props !mt-2 !text-[1.3rem] !leading-relaxed space-y-3">
      <li><ph-cloud class="neo-icon" />Lives in Pulumi Cloud: tasks, automations, PRs</li>
      <li><ph-books class="neo-icon" />Ships the Pulumi Agent Skills catalog</li>
      <li><ph-plugs-connected class="neo-icon" />Integrations: GitHub, Slack, Datadog, PagerDuty</li>
      <li><ph-buildings class="neo-icon" />4,500+ organizations before the CLI launch</li>
      <li><ph-terminal-window class="neo-icon" />In the terminal since May 2026</li>
    </ul>
    </v-clicks>
  </div>
  <div class="neo-wrap">
    <img src="/pulumi-neo.png" alt="pulumi neo in a terminal" />
  </div>
</div>

<div class="neo-more" v-click>
  <div class="text-right">
    <div class="gpu-caption gpu-caption--accent">More on Neo</div>
    <div class="neo-more__url">pulumi.com/docs/ai/neo</div>
  </div>
  <QRCode data="https://www.pulumi.com/docs/ai/neo/" dark="#000000" />
</div>

<style scoped>
.neo-props { list-style: none; padding-left: 0; zoom: 1.3; }
.neo-props li { display: flex; align-items: center; gap: 0.75rem; }
.neo-icon { flex-shrink: 0; font-size: 1.6rem; color: var(--p-primary); }
.neo-more { position: absolute; right: 3.5rem; bottom: 2.6rem; display: flex; align-items: center; gap: 1rem; }
.neo-more .qr-code { width: 5.5rem; height: 5.5rem; flex-shrink: 0; background: #ffffff; padding: 0.4rem; border-radius: 10px; box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18); }
.neo-more__url { font-family: var(--slidev-font-mono); font-size: 0.9rem; color: var(--p-fg-muted); margin-top: 0.4rem; }
.neo-wrap { display: flex; align-items: center; justify-content: center; }
.neo-wrap img { max-width: 100%; max-height: 30rem; height: auto; }
</style>

---

# `pulumi neo` inherits your local setup

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-laptop class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Your machine</div></div>
    <ul class="zone__list">
      <li><ph-terminal-window />Your authenticated CLIs</li>
      <li><ph-sliders-horizontal />Your environment variables and kubeconfigs</li>
      <li><ph-folder-open />The project you are editing</li>
      <li><ph-wrench />Tool calls run on your machine</li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption">Pulumi Cloud</div></div>
    <ph-brain class="zone__hero" />
    <p>The reasoning stays in Pulumi Cloud</p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">The feature and the risk</div>
  <p>Whatever the terminal reaches, Neo reaches.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.setup { display: grid; grid-template-columns: 1.7fr auto 1fr; align-items: stretch; gap: 1.25rem; }
.zone__head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.1rem; }
.zone__icon { font-size: 1.6rem; color: var(--p-primary); }
.zone--cloud .zone__icon { color: var(--p-fg-muted); }
.zone__list { list-style: none; padding: 0; margin: 0; }
.zone__list li { display: flex; align-items: center; gap: 0.8rem; margin: 0 0 0.85rem; }
.zone__list li:last-child { margin-bottom: 0; }
.zone__list li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
.setup__link { display: flex; align-items: center; font-size: 2.2rem; color: var(--p-accent); }
.zone--cloud { display: flex; flex-direction: column; }
.zone__hero { font-size: 4.2rem; color: var(--p-accent); margin: auto 0 0.9rem; }
.zone--cloud p { margin: 0 !important; }
</style>

---

# Approval mode decides when Neo pauses

<div class="zoom-content">

<div class="modes">
  <div class="gpu-card gpu-card--primary mode" v-click>
    <div class="mode__head"><ph-hand-palm class="mode__icon" /><code class="mode__name">manual</code></div>
    <p>Asks before every tool call</p>
    <div class="mode__track"><i /><ph-pause-circle /><i /><ph-pause-circle /><i /><ph-pause-circle /><i /></div>
    <div class="mode__note">In the console, <code>manual</code> is called Review</div>
  </div>
  <div class="gpu-card gpu-card--accent mode" v-click>
    <div class="mode__head"><ph-scales class="mode__icon" /><code class="mode__name">balanced</code></div>
    <p>Asks only before <code>pulumi up</code></p>
    <div class="mode__track"><i /><i /><i /><i /><ph-pause-circle /><b>up</b></div>
  </div>
  <div class="gpu-card mode" v-click>
    <div class="mode__head"><ph-lightning class="mode__icon" /><code class="mode__name">auto</code></div>
    <p>Never asks</p>
    <div class="mode__track"><i /><i /><i /><i /><i /><b>up</b></div>
  </div>
</div>

<div class="gates" v-click>
  <div class="gpu-caption gpu-caption--accent">Console gates</div>
  <span class="gate"><ph-eye />preview</span>
  <ph-caret-right class="gates__sep" />
  <span class="gate"><ph-rocket-launch />up</span>
  <ph-caret-right class="gates__sep" />
  <span class="gate"><ph-git-pull-request />pull request</span>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.modes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; align-items: stretch; }
.mode { display: flex; flex-direction: column; gap: 0.9rem; padding-inline: 1.4rem; }
.mode p { margin: 0 !important; white-space: nowrap; font-size: 1.25rem; }
.mode__head { display: flex; align-items: center; gap: 0.7rem; }
.mode__icon { font-size: 2rem; color: var(--p-primary); }
.mode__name { font-size: 1.25rem !important; font-weight: 600; }
.mode__track { display: flex; align-items: center; gap: 0.45rem; height: 1.8rem; color: var(--p-primary); font-size: 1.35rem; }
.mode__track i { width: 0.6rem; height: 0.6rem; border-radius: 999px; background: var(--p-accent); opacity: 0.55; }
.mode__track b { font-family: var(--slidev-font-mono); font-size: 0.85rem; color: var(--p-fg-muted); margin-left: 0.2rem; }
.mode__note { margin-top: auto; font-size: 0.95rem; color: var(--p-fg-muted); border-top: 1px dashed var(--p-border); padding-top: 0.7rem; }
.gates { display: flex; align-items: center; gap: 0.9rem; margin-top: 1.6rem; }
.gates .gpu-caption { margin-right: 0.4rem; }
.gate { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.95rem; border-radius: 999px; background: var(--p-bg-elevated); border: 1px solid var(--p-border); font-size: 1.1rem; color: var(--p-fg); }
.gate svg { color: var(--p-primary); font-size: 1.2rem; }
.gates__sep { color: var(--p-fg-subtle); font-size: 1.1rem; }
</style>

---

# Permission mode decides what Neo may change

<div class="zoom-content">

<div class="perms">
  <div class="gpu-card perm" v-click>
    <ph-lock-open class="perm__icon" />
    <code class="perm__name">default</code>
    <p class="perm__claim">Your full RBAC</p>
  </div>
  <div class="gpu-card gpu-card--primary perm" v-click>
    <ph-lock class="perm__icon" />
    <code class="perm__name">read-only</code>
    <p class="perm__claim">No Pulumi Cloud writes</p>
    <div class="perm__keeps">
      <span class="gpu-caption gpu-caption--accent">Keeps</span>
      <span class="chip"><ph-check />reads</span>
      <span class="chip"><ph-check />previews</span>
      <span class="chip"><ph-check />edits</span>
      <span class="chip"><ph-check />PRs</span>
    </div>
  </div>
</div>

<div class="perm-facts" v-click>
  <div><ph-arrows-split />Independent of approval mode</div>
  <div><ph-user-gear />Org admins set defaults, you override</div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.perms { display: grid; grid-template-columns: 1fr 1.5fr; gap: 1.25rem; align-items: stretch; }
.perm { display: flex; flex-direction: column; align-items: flex-start; gap: 0.6rem; }
.perm__icon { font-size: 2.6rem; color: var(--p-fg-muted); }
.gpu-card--primary .perm__icon { color: var(--p-primary); }
.perm__name { font-size: 1.35rem !important; font-weight: 600; }
.perm__claim { margin: 0 !important; font-size: 1.55rem !important; font-weight: 600; letter-spacing: -0.02em; }
.perm__keeps { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem; margin-top: auto; padding-top: 0.8rem; }
.perm__keeps .gpu-caption { margin-right: 0.2rem; }
.chip { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.8rem; border-radius: 999px; background: var(--p-bg); border: 1px solid var(--p-border); font-size: 1.05rem; color: var(--p-fg); }
.chip svg { color: var(--p-primary); }
.perm-facts { display: flex; gap: 2.5rem; margin-top: 1.5rem; }
.perm-facts div { display: flex; align-items: center; gap: 0.7rem; font-size: 1.2rem; color: var(--p-fg); }
.perm-facts svg { font-size: 1.5rem; color: var(--p-accent); }
</style>

---

# Plan Mode: Makes Neo agree on a plan first

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <div class="plan__keys"><kbd>Shift</kbd><span>+</span><kbd>Tab</kbd></div>
    <p>Before the first message</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-magnifying-glass class="plan__icon" />
    <p>Neo studies the infra and dependencies</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-note-pencil class="plan__icon" />
    <p>Writes a plan, you challenge it</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-check-circle class="plan__icon" />
    <p>Acts only after explicit approval</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p><strong>Plan Mode with auto:</strong> agree once, then let it run.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.9rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__keys { display: flex; align-items: center; gap: 0.35rem; height: 2.8rem; color: var(--p-fg-muted); }
.plan__keys kbd { font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 600; color: var(--p-primary); background: var(--p-bg); border: 1.5px solid var(--p-border); border-bottom-width: 3px; border-radius: 8px; padding: 0.2rem 0.55rem; }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

---

# Read-only is scoped to Pulumi Cloud

<div class="zoom-content">

<div class="scope">
  <div class="scope__fence" v-click="1">
    <div class="scope__label"><ph-lock />read-only</div>
    <div class="gpu-card gpu-card--primary node">
      <ph-cloud class="node__icon" />
      <div class="gpu-caption gpu-caption--accent">Pulumi Cloud</div>
      <p class="node__quote"><ph-quotes />"No Pulumi Cloud mutations"</p>
    </div>
  </div>
  <ph-arrow-right class="scope__arrow" v-click="2" />
  <div class="gpu-card node" v-click="2">
    <ph-vault class="node__icon" />
    <div class="gpu-caption">ESC environments</div>
    <p>Neo can still open ESC environments</p>
  </div>
  <ph-arrow-right class="scope__arrow scope__arrow--warn" v-click="3" />
  <div class="gpu-card node node--warn" v-click="3">
    <ph-warning class="node__icon" />
    <div class="gpu-caption">Cloud accounts</div>
    <p>And reach the accounts they unlock</p>
  </div>
</div>

<div class="scope__rules">
  <aside class="info-card scope__rule" v-click="4"><ph-user-gear /><div><div class="info-card__label">What sets the limit</div><p>Your RBAC and the environments you can open</p></div></aside>
  <aside class="info-card scope__rule" v-click="5"><ph-lock /><div><div class="info-card__label">So scope the role</div><p>Prefer read-only cloud roles in ESC</p></div></aside>
  <aside class="info-card scope__rule" v-click="6"><ph-users-three /><div><div class="info-card__label">For sensitive environments</div><p>Open approvals put a reviewer in front</p></div></aside>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.scope { --warn: #933d0d; --warn-bg: #fffbeb; --warn-border: #fdcf4c; display: grid; grid-template-columns: 1.15fr auto 1fr auto 1fr; align-items: stretch; gap: 0.8rem; }
html.dark .scope { --warn: #fde38a; --warn-bg: #371d11; --warn-border: #b54f08; }
.scope__fence { position: relative; border: 2px dashed var(--p-accent); border-radius: 20px; padding: 1.5rem 0.8rem 0.8rem; display: flex; }
.scope__fence .node { flex: 1; }
.scope__label { position: absolute; top: -0.85rem; left: 1.2rem; display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.1rem 0.6rem; background: var(--p-bg); font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); }
.node { display: flex; flex-direction: column; gap: 0.6rem; }
.node p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.node__icon { font-size: 2.3rem; color: var(--p-primary); }
.node__quote { display: flex; gap: 0.4rem; font-style: italic; color: var(--p-fg-muted) !important; }
.node__quote svg { flex-shrink: 0; color: var(--p-accent); }
.node--warn { background: var(--warn-bg); border-color: var(--warn-border); }
.node--warn .node__icon, .node--warn .gpu-caption { color: var(--warn); }
.scope__arrow { align-self: center; font-size: 1.6rem; color: var(--p-accent); }
.scope__arrow--warn { color: var(--warn); }
.scope__rules { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1.6rem; }
.scope__rule { display: flex; align-items: flex-start; gap: 0.7rem; }
.scope__rule > svg { flex-shrink: 0; font-size: 1.6rem; color: var(--p-primary); margin-top: 0.1rem; }
.scope__rule p { font-size: 1.1rem !important; line-height: 1.35; }
.scope__rules .info-card { margin-top: 0; }
</style>

---

# The demo needs two flags and resume

<div class="zoom-content">

<div class="term">
  <div class="term__bar"><span /><span /><span /><div class="term__title">pulumi neo</div></div>
  <div class="term__row term__row--demo" v-click>
    <code class="term__flag">--approval-mode</code>
    <div class="term__vals"><span>manual</span><span>balanced</span><span>auto</span></div>
  </div>
  <div class="term__row term__row--demo" v-click>
    <code class="term__flag">--permission-mode</code>
    <div class="term__vals"><span>default</span><span>read-only</span></div>
  </div>
  <div class="term__row term__row--demo" v-click>
    <code class="term__flag">resume</code>
    <div class="term__desc">reattaches after a dropped session</div>
  </div>
  <div class="term__row" v-click>
    <code class="term__flag">--print</code>
    <div class="term__desc">runs one prompt for scripts</div>
  </div>
  <div class="term__row" v-click>
    <code class="term__flag">--debug-update</code>
    <div class="term__desc">investigates a failed update</div>
  </div>
</div>

<div class="acp" v-click><ph-code />Editors host Neo over ACP</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.term { border: 1.5px solid var(--p-border); border-radius: 16px; overflow: hidden; background: var(--p-bg-elevated); }
.term__bar { display: flex; align-items: center; gap: 0.45rem; padding: 0.7rem 1.1rem; border-bottom: 1px solid var(--p-border); }
.term__bar > span { width: 0.7rem; height: 0.7rem; border-radius: 999px; background: var(--p-border); }
.term__title { margin-left: 0.6rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 600; color: var(--p-fg-muted); }
.term__row { display: grid; grid-template-columns: 15rem 1fr; align-items: center; gap: 1.2rem; padding: 0.75rem 1.4rem; border-left: 4px solid transparent; }
.term__row + .term__row { border-top: 1px solid var(--p-border); }
.term__row--demo { border-left-color: var(--p-primary); background: var(--p-bg); }
.term__flag { font-size: 1.2rem !important; font-weight: 600; background: transparent !important; padding: 0 !important; }
.term__row:not(.term__row--demo) .term__flag { color: var(--p-fg-muted) !important; }
.term__vals { display: flex; gap: 0.5rem; }
.term__vals span { font-family: var(--slidev-font-mono); font-size: 1rem; padding: 0.2rem 0.7rem; border-radius: 999px; border: 1px solid var(--p-border); color: var(--p-fg); background: var(--p-bg-elevated); }
.term__desc { font-size: 1.2rem; color: var(--p-fg); }
.term__row:not(.term__row--demo) .term__desc { color: var(--p-fg-muted); }
.acp { display: flex; align-items: center; gap: 0.7rem; margin-top: 1.4rem; font-size: 1.2rem; color: var(--p-fg); }
.acp svg { font-size: 1.5rem; color: var(--p-accent); }
</style>

---

# Neo picks up context from the project directory

<div class="zoom-content">

<div class="ctx">
  <div class="gpu-card gpu-card--primary ctx__card" v-click>
    <div class="ctx__head"><ph-file-text class="ctx__icon" /><div class="gpu-caption gpu-caption--accent">Project instructions</div></div>
    <div class="tree">
      <div class="tree__row tree__row--dir"><ph-folder-open />02-app/</div>
      <div class="tree__row"><ph-file />Pulumi.yaml</div>
      <div class="tree__row"><ph-file />index.ts</div>
      <div class="tree__row tree__row--hit"><ph-file-text />AGENTS.md</div>
    </div>
    <p>Ship <code>AGENTS.md</code> next to <code>Pulumi.yaml</code></p>
    <p>Neo's tools see the working directory</p>
    <div class="ctx__note"><ph-info />Auto-loading is not documented</div>
  </div>
  <div class="gpu-card ctx__card" v-click>
    <div class="ctx__head"><ph-paper-plane-tilt class="ctx__icon" /><div class="gpu-caption gpu-caption--accent">Handoff from other agents</div></div>
    <div class="agents"><span>Claude Code</span><span>Codex</span><span>Cursor</span><span>Copilot</span><span>Gemini</span><span>Junie</span></div>
    <div class="flow">
      <div class="flow__step"><code>pulumi-neo-handoff</code><span>Goal, repo pointers, summary</span></div>
      <ph-arrow-down class="flow__arrow" />
      <div class="flow__step"><code>pulumi neo</code><span>Neo reads the working tree itself</span></div>
      <ph-arrow-down class="flow__arrow" />
      <div class="flow__step flow__step--end"><ph-link />Returns a Neo task URL</div>
    </div>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.ctx { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; align-items: stretch; }
.ctx__card { display: flex; flex-direction: column; gap: 0.8rem; }
.ctx__card p { margin: 0 !important; font-size: 1.2rem; }
.ctx__head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.2rem; }
.ctx__icon { font-size: 1.6rem; color: var(--p-primary); }
.tree { font-family: var(--slidev-font-mono); font-size: 1rem; background: var(--p-bg); border: 1px solid var(--p-border); border-radius: 12px; padding: 0.7rem 1rem; margin-bottom: 0.3rem; }
.tree__row { display: flex; align-items: center; gap: 0.5rem; padding: 0.15rem 0 0.15rem 1.6rem; color: var(--p-fg-muted); }
.tree__row svg { color: var(--p-fg-subtle); }
.tree__row--dir { padding-left: 0; color: var(--p-fg); }
.tree__row--hit { color: var(--p-primary); font-weight: 700; }
.tree__row--hit svg, .tree__row--dir svg { color: var(--p-primary); }
.ctx__note { display: flex; align-items: center; gap: 0.45rem; margin-top: auto; font-size: 0.95rem; color: var(--p-fg-muted); }
.agents { display: flex; flex-wrap: wrap; gap: 0.45rem; }
.agents span { padding: 0.2rem 0.7rem; border-radius: 999px; border: 1px solid var(--p-border); background: var(--p-bg); font-size: 0.95rem; color: var(--p-fg); }
.flow { display: flex; flex-direction: column; align-items: stretch; gap: 0.25rem; margin-top: 0.3rem; }
.flow__step { display: flex; align-items: baseline; gap: 0.8rem; padding: 0.55rem 0.9rem; border-radius: 10px; background: var(--p-bg); border: 1px solid var(--p-border); }
.flow__step code { font-size: 1rem !important; font-weight: 600; white-space: nowrap; }
.flow__step span { font-size: 1.05rem; color: var(--p-fg-muted); }
.flow__step--end { align-items: center; border-color: color-mix(in srgb, var(--p-primary) 60%, var(--p-border)); color: var(--p-fg); font-size: 1.1rem; font-weight: 600; }
.flow__step--end svg { color: var(--p-primary); font-size: 1.3rem; }
.flow__arrow { align-self: center; font-size: 1.1rem; color: var(--p-accent); }
</style>

---

# Neo runs as your Pulumi user

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-user-circle class="chain__icon" />
    <div class="gpu-caption">You</div>
    <code>pulumi login</code>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <img class="chain__neo chain__neo--light" src="/logos/neo-icon-circle-light.svg" alt="Neo" />
    <img class="chain__neo chain__neo--dark" src="/logos/neo-icon-circle-dark.svg" alt="Neo" />
    <div class="gpu-caption gpu-caption--accent">Neo task</div>
    <span>Same identity as you</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-cloud-check class="chain__icon" />
    <div class="gpu-caption">Pulumi Cloud</div>
    <span>Your RBAC decides</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>Neo can only do what you could do yourself.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-clock-clockwise /><p>RBAC re-checked when the task runs</p></div>
  <div class="fact"><ph-scroll /><p>Audit runs through your Pulumi login</p></div>
  <div class="fact"><ph-eye-slash /><p>Secrets redacted in task events</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.chain { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.8rem; }
.chain__node { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; padding-block: 1.2rem; }
.chain__node span { font-size: 1.15rem; color: var(--p-fg); }
.chain__node code { font-size: 1.05rem !important; }
.chain__icon { font-size: 2.6rem; color: var(--p-primary); }
.chain__neo { width: 3.6rem; height: 3.6rem; margin-block: -0.25rem; }
.chain__neo--light { display: var(--p-logo-light-display, block); }
.chain__neo--dark { display: var(--p-logo-dark-display, none); }
.chain__arrow { align-self: center; font-size: 1.6rem; color: var(--p-accent); }
.chain__rule { margin-top: 1.2rem; }
.chain__rule p { font-size: 1.3rem; font-weight: 600; }
.facts { display: flex; justify-content: space-between; gap: 1rem; margin-top: 1.4rem; }
.fact { display: flex; align-items: flex-start; gap: 0.7rem; }
.fact svg { flex-shrink: 0; font-size: 1.6rem; color: var(--p-primary); margin-top: 0.1rem; }
.fact p { margin: 0 !important; font-size: 1.05rem; line-height: 1.35; white-space: nowrap; }
.fact small { display: block; font-size: 0.9rem; color: var(--p-fg-muted); margin-top: 0.2rem; }
</style>

---

# Ok, three questions covered, three to go!

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>Your Pulumi user, your RBAC</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">What</div><p>Permission mode, <code>protect: true</code></p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-clock class="step-icon" /><div class="gpu-caption gpu-caption--accent">When</div><p>Approval mode, Plan Mode</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-cube class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Where</div><p>Where does it actually run?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-key class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">With what</div><p>Which credentials does it hold?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-warning class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">What if</div><p>What stops it when it gets it wrong?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <img src="/logos/docker-logo-ocean-blue.svg" class="docker-logo docker-logo--light" alt="Docker" />
    <img src="/logos/docker-logo-white.svg" class="docker-logo docker-logo--dark" alt="Docker" />
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Docker Sandboxes.</h1>
  </div>
</div>

<style scoped>
.sec { position: absolute; inset: 0; overflow: hidden; }
.sec__lines { position: absolute; width: 30rem; height: auto; opacity: 0.55; pointer-events: none; }
.sec__lines--tr { top: 0; right: 0; }
.sec__lines--bl { bottom: 0; left: 0; }
.sec__inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 5rem; }
.sec__inner h1 { text-wrap: balance; }
.docker-logo { height: 6.5rem; width: auto; margin-bottom: 3.5rem; }
.docker-logo--light { display: var(--p-logo-light-display, block); }
.docker-logo--dark { display: var(--p-logo-dark-display, none); }
</style>

---
layout: image
image: /img/handover-kermit.gif
backgroundSize: cover
---

---

# A sandbox is a microVM with its own kernel

<div class="gpu-caption gpu-caption--muted !mb-4">Placeholder for Mike Coleman (Docker)</div>

<div class="zoom-content">

<v-clicks>
<ul class="!mt-2 !text-[1.3rem] !leading-relaxed space-y-3">
  <li>Own kernel, filesystem, Docker Engine, network</li>
  <li>Host files: only the mounted workspace</li>
  <li>Clone mode mounts the repo read-only</li>
  <li>Sandboxes cannot talk to each other</li>
  <li><code>sbx rm</code> deletes everything inside</li>
</ul>
</v-clicks>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

---

# A kit declares the whole sandbox in one file

<div class="gpu-caption gpu-caption--muted !mb-4">Placeholder for Mike Coleman (Docker)</div>

<div class="zoom-content">

<v-clicks>
<ul class="!mt-2 !text-[1.3rem] !leading-relaxed space-y-3">
  <li><code>spec.yaml</code>: tools, environment, credentials, network, files</li>
  <li><code>kind: mixin</code> extends an agent</li>
  <li><code>kind: sandbox</code> defines one: image and entrypoint</li>
  <li>Load from a directory, git or OCI</li>
  <li>Sources are allow-listed; installs run as root</li>
</ul>
</v-clicks>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

---

# Secrets stay on the host

<div class="gpu-caption gpu-caption--muted !mb-4">Placeholder for Mike Coleman (Docker)</div>

<div class="zoom-content">

<v-clicks>
<ul class="!mt-2 !text-[1.3rem] !leading-relaxed space-y-3">
  <li><code>sbx secret set pulumi</code> stores it once</li>
  <li>The VM sees a sentinel value</li>
  <li>The proxy injects the real header</li>
  <li>Only on the declared domain</li>
  <li>Bindings approve third-party kits</li>
</ul>
</v-clicks>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The infrastructure sandbox kit.</h1>
  </div>
</div>

<style scoped>
.sec { position: absolute; inset: 0; overflow: hidden; }
.sec__lines { position: absolute; width: 30rem; height: auto; opacity: 0.55; pointer-events: none; }
.sec__lines--tr { top: 0; right: 0; }
.sec__lines--bl { bottom: 0; left: 0; }
.sec__inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 5rem; }
.sec__inner h1 { text-wrap: balance; }
</style>

---

# Kits layer rules on top of a template

<div class="zoom-content">

<div class="layers">
  <div class="layers__stack">
    <div class="gpu-card gpu-card--primary layer" v-click="3">
      <div class="layer__head"><ph-file-code class="layer__icon" /><div class="gpu-caption gpu-caption--accent">Kit · YAML, applied at create</div></div>
      <div class="layer__chips"><span>network</span><span>credentials</span><span>env</span><span>setup</span><span>instructions</span></div>
    </div>
    <div class="gpu-card layer" v-click="2">
      <div class="layer__head"><ph-package class="layer__icon" /><div class="gpu-caption gpu-caption--accent">Template · image, built once</div></div>
      <div class="layer__chips"><span>Pulumi</span><span>Terraform</span><span>OpenTofu</span><span>cloud CLIs</span></div>
    </div>
    <div class="gpu-card gpu-card--muted layer layer--vm" v-click="1">
      <div class="layer__head"><ph-cube class="layer__icon" /><div class="gpu-caption">microVM</div></div>
    </div>
  </div>
  <v-clicks at="4">
  <ul class="why">
    <li><ph-lightning />Heavy tools bake once: fast starts, pinned versions</li>
    <li><ph-arrows-clockwise />Change a kit without rebuilding the image</li>
    <li><ph-key />Secrets stay out of the image</li>
    <li><ph-package />Ship kits from a folder, git or OCI</li>
    <li><ph-seal-check />Allow-list kit sources, require signatures</li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.layers { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; align-items: center; }
.layers__stack { display: flex; flex-direction: column; gap: 0.6rem; }
.layer { padding: 1rem 1.3rem; }
.layer__head { display: flex; align-items: center; gap: 0.6rem; }
.layer__icon { font-size: 1.5rem; color: var(--p-primary); }
.layer--vm .layer__icon { color: var(--p-fg-muted); }
.layer__chips { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.7rem; }
.layer__chips span { font-family: var(--slidev-font-mono); font-size: 0.9rem; padding: 0.15rem 0.6rem; border-radius: 999px; border: 1px solid var(--p-border); background: var(--p-bg); color: var(--p-fg); }
.why { list-style: none; padding: 0; margin: 0; }
.why li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.why li svg { flex-shrink: 0; font-size: 1.6rem; color: var(--p-primary); }
</style>

---

# Small kits stack into one agent setup

<div class="zoom-content">

<div class="compose">
  <div class="compose__stack">
    <div class="gpu-caption">Example stack</div>
    <div class="piece piece--mixin" v-click="5"><ph-wrench />mixin · shared linter config</div>
    <div class="piece piece--mixin" v-click="4"><ph-key />mixin · a service credential</div>
    <div class="piece piece--mixin" v-click="3"><ph-globe />mixin · team network rules</div>
    <div class="piece piece--sandbox" v-click="2"><ph-cube />sandbox kit · image and agent</div>
    <div class="piece piece--template" v-click="1"><ph-package />template image</div>
  </div>
  <ul class="rules" v-click="6">
    <li><ph-cube />One sandbox kit picks image and agent</li>
    <li><ph-stack /><span>Repeat <code>--kit</code> to stack mixins</span></li>
    <li><ph-list-numbers /><span>Applied in <code>--kit</code> order, stage by stage</span></li>
    <li><ph-prohibit />A deny in any kit wins</li>
    <li><ph-lock-key /><span><code>requires</code> pins the agent, <code>locked</code> guards fields</span></li>
  </ul>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.compose { display: grid; grid-template-columns: 1fr 1.15fr; gap: 2.5rem; align-items: center; }
.compose__stack { display: flex; flex-direction: column; gap: 0.45rem; }
.compose__stack .gpu-caption { margin-bottom: 0.3rem; }
.piece { display: flex; align-items: center; gap: 0.7rem; padding: 0.65rem 1rem; border-radius: 12px; border: 1.5px solid var(--p-border); font-family: var(--slidev-font-mono); font-size: 1rem; color: var(--p-fg); }
.piece svg { flex-shrink: 0; font-size: 1.3rem; color: var(--p-primary); }
.piece--mixin { border-style: dashed; margin-inline: 1.2rem; }
.piece--sandbox { background: var(--p-bg-elevated); border-color: color-mix(in srgb, var(--p-primary) 60%, var(--p-border)); margin-inline: 0.6rem; }
.piece--template { background: var(--p-bg-elevated); }
.rules { list-style: none; padding: 0; margin: 0; }
.rules li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.2rem; margin: 0 0 0.95rem; }
.rules li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
.compose__note { display: flex; align-items: center; gap: 0.5rem; margin-top: 1.2rem; font-size: 0.95rem; color: var(--p-fg-muted); }
</style>

---

# One repo publishes all

<div class="zoom-content">

<div class="artifacts">
  <div class="gpu-card artifact" v-click>
    <div class="artifact__head"><ph-package class="artifact__icon" /><div class="gpu-caption gpu-caption--accent">Template image</div></div>
    <code class="artifact__ref">ghcr.io/dirien/infrastructure-sandbox:v0.10.0</code>
    <ul>
      <li>Pulumi 3.x with <code>pulumi neo</code></li>
      <li>Terraform, OpenTofu, kubectl, Helm</li>
      <li>AWS, Azure and Google Cloud CLIs</li>
      <li>Checksum or signature per core tool</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary artifact" v-click>
    <div class="artifact__head"><ph-cube class="artifact__icon" /><div class="gpu-caption gpu-caption--accent">Sandbox kit</div><span class="artifact__tag">in the demo</span></div>
    <code class="artifact__ref">ghcr.io/dirien/infrastructure-sandbox-kit:v0.10.0</code>
    <ul>
      <li>Names the template image</li>
      <li>Allow-list and the <code>pulumi</code> credential</li>
      <li>Install step: a no-op on the image</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--muted artifact" v-click>
    <div class="artifact__head"><ph-puzzle-piece class="artifact__icon artifact__icon--muted" /><div class="gpu-caption">Mixin kit</div></div>
    <code class="artifact__ref">ghcr.io/dirien/infrastructure-kit:v0.10.0</code>
    <ul>
      <li>Same rules for the built-in <code>claude</code> agent</li>
      <li>With or without the template</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.artifacts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.1rem; align-items: stretch; }
.artifact { display: flex; flex-direction: column; gap: 0.7rem; padding: 1.3rem 1.4rem; }
.artifact__head { display: flex; align-items: center; gap: 0.55rem; }
.artifact__icon { font-size: 1.6rem; color: var(--p-primary); }
.artifact__icon--muted { color: var(--p-fg-muted); }
.artifact__tag { margin-left: auto; font-size: 0.8rem; font-weight: 600; padding: 0.1rem 0.6rem; border-radius: 999px; background: var(--p-primary); color: var(--p-bg); }
.artifact__ref { font-size: 0.78rem !important; word-break: break-all; background: var(--p-bg) !important; border: 1px solid var(--p-border); padding: 0.35rem 0.55rem !important; border-radius: 8px !important; }
.artifact ul { list-style: none; padding: 0; margin: 0.2rem 0 0; }
.artifact li { font-size: 1.05rem; line-height: 1.35; margin: 0 0 0.5rem; padding-left: 1.1rem; position: relative; }
.artifact li::before { content: ""; position: absolute; left: 0; top: 0.55em; width: 0.4rem; height: 0.4rem; border-radius: 999px; background: var(--p-accent); }
</style>

---

# The Pulumi token lives in your keychain

<div class="zoom-content">

<div class="token">
  <div class="token__cmd big-code" v-click="1">

```bash
sbx secret set pulumi   # prompts for the token
sbx secret ls           # (global)  service  pulumi
```

  </div>
  <div class="token__flow">
    <div class="gpu-card node" v-click="2"><ph-cube class="node__icon" /><div class="gpu-caption">In the VM</div><code>PULUMI_ACCESS_TOKEN=<br />proxy-managed</code></div>
    <ph-arrow-right class="token__arrow" v-click="3" />
    <div class="gpu-card gpu-card--primary node" v-click="3"><ph-keyhole class="node__icon" /><div class="gpu-caption gpu-caption--accent">Host proxy</div><span>Swaps in the token from the keychain</span></div>
    <ph-arrow-right class="token__arrow" v-click="4" />
    <div class="gpu-card node" v-click="4"><ph-cloud-check class="node__icon" /><div class="gpu-caption">api.pulumi.com</div><span>Sees the real token</span></div>
  </div>
</div>

<div class="token__facts" v-click="5">
  <div><ph-globe />Global: every new sandbox</div>
  <div><ph-clock-clockwise />Set it before creating the sandbox</div>
  <div><ph-puzzle-piece /><span>Injected where a kit declares <code>pulumi</code></span></div>
  <div><ph-seal-check />First run: approve the binding</div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.token { display: grid; grid-template-columns: 1fr; gap: 1.2rem; }
.token__cmd pre { margin: 0 !important; }
.token__flow { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: 0.8rem; align-items: stretch; }
.node { display: flex; flex-direction: column; gap: 0.5rem; padding: 1.1rem 1.3rem; }
.node__icon { font-size: 1.9rem; color: var(--p-primary); }
.node code { font-size: 0.9rem !important; word-break: break-all; }
.node span { font-size: 1.1rem; }
.token__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.token__facts { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.7rem 2rem; margin-top: 1.3rem; }
.token__facts div { display: flex; align-items: center; gap: 0.6rem; font-size: 1.15rem; }
.token__facts svg { flex-shrink: 0; font-size: 1.35rem; color: var(--p-primary); }
</style>

---

# The Pulumi CLI works as usual inside

<div class="zoom-content">

<div class="usual">
  <div class="term" v-click="1">
    <div class="term__bar"><span /><span /><span /><div class="term__title">host</div></div>
    <div class="term__body"><b>$</b> sbx run --name neo-demo \<br />&nbsp;&nbsp;ghcr.io/dirien/infrastructure-sandbox-kit:v0.10.0 ./02-app</div>
    <div class="term__bar term__bar--inner"><ph-cube /><div class="term__title">sandbox shell</div></div>
    <div class="term__body"><b>$</b> pulumi whoami -v<br /><b>$</b> pulumi neo</div>
  </div>
  <v-clicks at="2">
  <ul class="usual__facts">
    <li><ph-terminal-window />A shell with every IaC tool on PATH</li>
    <li><ph-key /><span>No <code>pulumi login</code>: it reads <code>PULUMI_ACCESS_TOKEN</code></span></li>
    <li><ph-vault />AWS credentials still come from ESC</li>
    <li><ph-hand-palm />Neo keeps its own approval prompts</li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.usual { display: grid; grid-template-columns: 1.25fr 1fr; gap: 2rem; align-items: center; }
.term { border: 1.5px solid var(--p-border); border-radius: 16px; overflow: hidden; background: var(--p-bg-elevated); }
.term__bar { display: flex; align-items: center; gap: 0.45rem; padding: 0.6rem 1rem; border-bottom: 1px solid var(--p-border); }
.term__bar > span { width: 0.65rem; height: 0.65rem; border-radius: 999px; background: var(--p-border); }
.term__bar--inner { border-top: 1px solid var(--p-border); color: var(--p-primary); }
.term__title { margin-left: 0.4rem; font-family: var(--slidev-font-mono); font-size: 0.9rem; font-weight: 600; color: var(--p-fg-muted); }
.term__body { font-family: var(--slidev-font-mono); font-size: 0.88rem; line-height: 1.7; padding: 0.8rem 1.1rem; color: var(--p-fg); background: var(--p-bg); }
.term__body b { color: var(--p-primary); margin-right: 0.4rem; }
.usual__facts { list-style: none; padding: 0; margin: 0; }
.usual__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.2rem; margin: 0 0 1rem; }
.usual__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

---

# Egress is default-deny

<div class="zoom-content">

<div class="egress">
  <div class="gpu-card egress__col" v-click>
    <div class="egress__head"><ph-cube class="egress__icon" /><div class="gpu-caption gpu-caption--accent">The kit allows</div></div>
    <div class="egress__chips"><span>api.pulumi.com</span><span>get.pulumi.com</span><span>registry.npmjs.org</span><span>github.com</span><span>sts.amazonaws.com</span></div>
  </div>
  <div class="gpu-card gpu-card--primary egress__col" v-click>
    <div class="egress__head"><ph-globe class="egress__icon" /><div class="gpu-caption gpu-caption--accent">A mixin adds, for this sandbox</div></div>
    <div class="egress__chips"><span>sts.eu-central-1.amazonaws.com</span><span>s3.eu-central-1.amazonaws.com</span><span>*.s3.eu-central-1.amazonaws.com</span></div>
  </div>
  <div class="gpu-card gpu-card--muted egress__col" v-click>
    <div class="egress__head"><ph-prohibit class="egress__icon egress__icon--muted" /><div class="gpu-caption">No matching rule</div></div>
    <p>Blocked at the host proxy</p>
    <p class="egress__small">Your global policy applies on top</p>
  </div>
</div>

<div class="egress__cmd big-code code-sm" v-click>

```yaml
kind: mixin          # 01-sandbox/region-kit, passed with --kit
permissions:
  network:
    allow: [sts.eu-central-1.amazonaws.com, "*.s3.eu-central-1.amazonaws.com"]
```

</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.egress { display: grid; grid-template-columns: 1fr 1fr 0.8fr; gap: 1rem; align-items: stretch; }
.egress__col { display: flex; flex-direction: column; gap: 0.8rem; padding: 1.1rem 1.3rem; }
.egress__col p { margin: 0 !important; font-size: 1.15rem; }
.egress__col .egress__small { font-size: 0.95rem; color: var(--p-fg-muted); }
.egress__head { display: flex; align-items: center; gap: 0.55rem; }
.egress__icon { font-size: 1.5rem; color: var(--p-primary); }
.egress__icon--muted { color: var(--p-fg-muted); }
.egress__chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.egress__chips span { font-family: var(--slidev-font-mono); font-size: 0.82rem; padding: 0.15rem 0.55rem; border-radius: 999px; border: 1px solid var(--p-border); background: var(--p-bg); color: var(--p-fg); }
.egress__cmd { margin-top: 1.2rem; }
.egress__cmd pre { margin: 0 !important; white-space: pre-wrap; word-break: break-all; }
</style>

---

# Every boundary has an enforcer outside Neo

<div class="zoom-content">

<div class="bounds">
  <div class="bound" v-click><ph-folder-open /><div class="bound__want">the host filesystem</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Only the workspace is mounted</div></div>
  <div class="bound" v-click><ph-key /><div class="bound__want">the Pulumi token</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Keychain and proxy; a sentinel in the VM</div></div>
  <div class="bound" v-click><ph-vault /><div class="bound__want">cloud credentials</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">None in the VM; ESC mints them per run</div></div>
  <div class="bound" v-click><ph-globe /><div class="bound__want">the internet</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Allow-lists at the proxy; the proxy log</div></div>
  <div class="bound" v-click><ph-cloud-check /><div class="bound__want">to change Pulumi Cloud</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Your RBAC; permission mode; approvals</div></div>
  <div class="bound" v-click><ph-trash /><div class="bound__want">to delete things</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Your approval; <code>protect: true</code> in the engine</div></div>
  <div class="bound" v-click><ph-gavel /><div class="bound__want">to ship something unsafe</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Policy as code, mandatory, on every update</div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.bounds { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem 1.4rem; }
.bound { display: grid; grid-template-columns: auto 9.5rem auto 1fr; align-items: center; gap: 0.7rem; padding: 0.8rem 1rem; border: 1.5px solid var(--p-border); border-radius: 14px; background: var(--p-bg-elevated); }
.bound > svg:first-child { font-size: 1.5rem; color: var(--p-primary); }
.bound__want { font-family: var(--slidev-font-mono); font-size: 0.92rem; font-weight: 600; color: var(--p-fg-muted); }
.bound__arrow { font-size: 1.1rem; color: var(--p-accent); }
.bound__by { font-size: 1.05rem; line-height: 1.3; color: var(--p-fg); }
</style>

---

# Five questions answered, one to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>Your Pulumi user, your RBAC</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">What</div><p>Permission mode, <code>protect: true</code></p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-clock class="step-icon" /><div class="gpu-caption gpu-caption--accent">When</div><p>Approval mode, Plan Mode</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--accent">Where</div><p>A microVM with an allow-list</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">With what</div><p>Token via the proxy, AWS via ESC</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-warning class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">What if</div><p>What stops it when it gets it wrong?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Neo in a Docker Sandbox.</h1>
  </div>
</div>

<style scoped>
.sec { position: absolute; inset: 0; overflow: hidden; }
.sec__lines { position: absolute; width: 30rem; height: auto; opacity: 0.55; pointer-events: none; }
.sec__lines--tr { top: 0; right: 0; }
.sec__lines--bl { bottom: 0; left: 0; }
.sec__inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 5rem; }
.sec__inner h1 { text-wrap: balance; }
</style>

---

# What we are going to do

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-key class="step__icon" /><p>One secret, one kit, one shell</p></div>
  <div class="gpu-card step" v-click><ph-shield-check class="step__icon" /><p>Neo sees the workspace and nothing else</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-wrench class="step__icon" /><p>Neo hardens the bucket, we approve</p></div>
  <div class="gpu-card gpu-card--accent step" v-click><ph-shield-warning class="step__icon" /><p><code>protect: true</code> refuses the delete</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.steps { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.2rem; }
.step { display: flex; flex-direction: column; gap: 0.7rem; padding: 1.2rem 1.3rem; }
.step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.step__icon { font-size: 2rem; color: var(--p-primary); }
</style>

---

# 1 · One secret, one kit, one shell

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
sbx secret ls
sbx rm -f neo-demo
sbx run --name neo-demo --kit ./01-sandbox/region-kit \
  ghcr.io/dirien/infrastructure-sandbox-kit:v0.10.0 ./02-app
```

</div>
    <div class="s1__label"><ph-cube />sandbox shell</div>
    <div class="big-code code-sm">

```bash
pulumi whoami -v
echo "$PULUMI_ACCESS_TOKEN"   # proxy-managed
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-package />First run pulls the image</li>
    <li><ph-seal-check />And asks to approve the binding</li>
    <li><ph-lightning />The kit's install step is a no-op</li>
    <li><ph-terminal-window />Then a shell opens in the VM</li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.45fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

---

# 2 · Neo sees the workspace and nothing else

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
01-sandbox/boundaries.sh
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-user-circle /><div><div class="gpu-caption gpu-caption--accent">1 · Identity</div><code>pulumi whoami -v</code></div></div>
  <div class="gpu-card check" v-click><ph-key /><div><div class="gpu-caption gpu-caption--accent">2 · Token</div><code>$PULUMI_ACCESS_TOKEN</code></div></div>
  <div class="gpu-card check" v-click><ph-vault /><div><div class="gpu-caption gpu-caption--accent">3 · Cloud creds</div><code>env, ~/.aws</code></div></div>
  <div class="gpu-card check" v-click><ph-folder-open /><div><div class="gpu-caption gpu-caption--accent">4 · Filesystem</div><code>ls outside the workspace</code></div></div>
  <div class="gpu-card check" v-click><ph-globe /><div><div class="gpu-caption gpu-caption--accent">5 · Network</div><code>curl an unlisted host</code></div></div>
  <div class="gpu-card check" v-click><ph-scroll /><div><div class="gpu-caption gpu-caption--accent">6 · Proxy log</div><code>sbx policy log neo-demo</code></div></div>
</div>


</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.checks { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.9rem; }
.checks__cmd { margin-bottom: 1.1rem; }
.checks__cmd pre { margin: 0 !important; }
.check { display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.2rem; }
.check > svg { flex-shrink: 0; font-size: 1.9rem; color: var(--p-primary); }
.check code { display: inline-block; margin-top: 0.4rem; font-size: 0.9rem !important; background: var(--p-bg) !important; }
.checks__note { display: flex; align-items: center; gap: 0.7rem; margin-top: 1.3rem; }
.checks__icon { font-size: 1.4rem; color: var(--p-primary); flex-shrink: 0; }
</style>

---

# 3 · Neo hardens the bucket, we approve each step

<div class="zoom-content">

<div class="s3">
  <div class="s3__prompt">
    <div class="s3__head"><ph-terminal-window /><code>pulumi neo</code></div>
    <div class="big-code code-sm s3__paste">

```text
Harden the S3 bucket in index.ts: enable versioning, default SSE-S3 encryption, block all public access, and tag the new resources with owner=neo. Use the @pulumi/aws v7 sub-resources. Run pulumi preview and show me the diff before deploying anything.
```

</div>
  </div>
  <div class="s3__flow">
    <div class="s3__step" v-click><ph-eye /><span>Reads <code>index.ts</code> and <code>AGENTS.md</code></span></div>
    <div class="s3__step" v-click><ph-note-pencil />Adds three sub-resources</div>
    <div class="s3__step" v-click><ph-magnifying-glass /><span><code>pulumi preview</code> shows +3</span></div>
    <div class="s3__step s3__step--you" v-click><ph-hand-palm /><span>You: <em>deploy it</em></span></div>
    <div class="s3__step" v-click><ph-rocket-launch /><span><code>pulumi up</code>, update in Pulumi Cloud</span></div>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.s3 { display: grid; grid-template-columns: 1.1fr 1fr; gap: 2rem; align-items: center; }
.s3__prompt { display: flex; flex-direction: column; gap: 0.8rem; }
.s3__paste pre { margin: 0 !important; white-space: pre-wrap !important; word-break: break-word; }
.s3__paste code { white-space: pre-wrap !important; }
.s3__head { display: flex; align-items: center; gap: 0.6rem; }
.s3__head svg { font-size: 1.5rem; color: var(--p-primary); }
.s3__head code { font-size: 1.1rem !important; font-weight: 600; }
.s3__flow { display: flex; flex-direction: column; gap: 0.5rem; position: relative; }
.s3__step { display: flex; align-items: center; gap: 0.7rem; padding: 0.6rem 1rem; border: 1.5px solid var(--p-border); border-radius: 12px; background: var(--p-bg-elevated); font-size: 1.1rem; }
.s3__step svg { flex-shrink: 0; font-size: 1.35rem; color: var(--p-primary); }
.s3__step--you { border-color: color-mix(in srgb, var(--p-primary) 60%, var(--p-border)); background: var(--p-bg); }
.s3__step code { font-size: 0.95rem !important; }
</style>

---

# 4 · `protect: true` refuses the delete

<div class="zoom-content">

<div class="s5__cmd big-code code-sm">

```bash
pulumi neo "We are done with this environment. Tear the whole stack down."
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-terminal-window /><span>Neo proposes <code>pulumi destroy</code></span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-hand-palm /><span>You approve, on purpose</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-shield-warning /><span>The engine refuses: the bucket is protected</span></div>
  </div>
  <div class="s5__side">
    <div class="big-code code-sm" v-click="4">

```ts
const bucket = new aws.s3.Bucket(
    "demo",
    { bucketPrefix, tags: { … } },
    { protect: true },
);
```

</div>
    <aside class="info-card" v-click="5"><div class="info-card__label">If Neo asks to unprotect</div><p>Decline. Teardown is a human's job.</p></aside>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.s5 { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center; margin-top: 1.2rem; }
.s5__cmd pre { margin: 0 !important; white-space: pre-wrap; }
.s5__flow { display: flex; flex-direction: column; align-items: stretch; }
.s5__step { display: flex; align-items: center; gap: 0.8rem; padding: 0.7rem 1rem; border: 1.5px solid var(--p-border); border-radius: 12px; background: var(--p-bg-elevated); font-size: 1.15rem; }
.s5__step svg { flex-shrink: 0; font-size: 1.45rem; color: var(--p-primary); }
.s5__step--stop { border-color: color-mix(in srgb, var(--p-primary) 60%, var(--p-border)); background: var(--p-bg); font-weight: 600; }
.s5__arrow { align-self: center; font-size: 1.1rem; color: var(--p-accent); margin: 0.2rem 0; }
.s5__side { display: flex; flex-direction: column; gap: 1rem; }
.s5__side pre { margin: 0 !important; }
.s5__side .info-card { margin-top: 0; }
</style>

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/neo-in-a-docker-sandbox" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → neo-in-a-docker-sandbox</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/ai/neo/pulumi-cli/" dark="#000000" />
    <div class="res-card__title">Neo in the CLI</div>
    <div class="res-card__body">pulumi.com/docs/ai/neo/pulumi-cli</div>
  </div>
  <div class="res-card">
    <QRCode data="https://docs.docker.com/ai/sandboxes/" dark="#000000" />
    <div class="res-card__title">Docker Sandboxes</div>
    <div class="res-card__body">docs.docker.com/ai/sandboxes</div>
  </div>
  <div class="res-card">
    <QRCode data="https://github.com/dirien/infrastructure-sandbox-kit" dark="#000000" />
    <div class="res-card__title">The kit</div>
    <div class="res-card__body">github.com/dirien/infrastructure-sandbox-kit</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/events/neo-in-a-docker-sandbox/" dark="#000000" />
    <div class="res-card__title">Event page</div>
    <div class="res-card__body">pulumi.com/events/neo-in-a-docker-sandbox</div>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.res-card { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.4rem; }
.res-card .qr-code { width: 9rem; height: 9rem; background: #ffffff; padding: 0.45rem; border-radius: 10px; box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18); }
.res-card__title { font-size: 1.15rem; font-weight: 600; color: var(--p-fg); margin-top: 0.4rem; }
.res-card__body { font-family: var(--slidev-font-mono); font-size: 0.8rem; color: var(--p-fg-muted); line-height: 1.4; word-break: break-all; }
</style>

---

# Continue your Pulumi journey!

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-6">
  <div class="gpu-card gpu-card--primary journey-card" v-click>
    <div class="journey-card__title">Join the Pulumi Community Slack!</div>
    <p class="journey-card__body">
      <a class="text-[var(--p-primary)]" href="https://slack.pulumi.com/">slack.pulumi.com</a>
    </p>
  </div>
  <div class="gpu-card gpu-card--primary journey-card" v-click>
    <div class="journey-card__title">Sign up for a Pulumi Cloud account!</div>
    <p class="journey-card__body">
      Sign up to follow along
    </p>
  </div>
  <div class="gpu-card gpu-card--accent journey-card" v-click>
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

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-16">
  <div class="thanks__kicker">Thank you</div>
  <h1 class="!text-[4.5rem] !leading-[1.02] !font-semibold !tracking-tight !mt-3 !mb-12 text-center">Questions?</h1>
  <div class="thanks">
    <div class="thanks__person">
      <img class="thanks__avatar" src="/img/adam-gordon-bell.png" alt="Adam Gordon Bell" />
      <div class="thanks__name">Adam Gordon Bell</div>
      <div class="thanks__org">Pulumi</div>
      <div class="thanks__handles">
        <span><carbon-logo-x />@adamgordonbell</span>
        <span><carbon-logo-github />adamgordonbell</span>
      </div>
      <div class="thanks__qr"><QRCode data="https://www.linkedin.com/in/adamgordonbell/" dark="#000000" /></div>
      <div class="thanks__qr-label"><carbon-logo-linkedin />adamgordonbell</div>
    </div>
    <div class="thanks__person">
      <img class="thanks__avatar" src="/img/engin-diri.png" alt="Engin Diri" />
      <div class="thanks__name">Engin Diri</div>
      <div class="thanks__org">Pulumi</div>
      <div class="thanks__handles">
        <span><carbon-logo-x />@_ediri</span>
        <span><carbon-logo-github />dirien</span>
      </div>
      <div class="thanks__qr"><QRCode data="https://www.linkedin.com/in/engin-diri/" dark="#000000" /></div>
      <div class="thanks__qr-label"><carbon-logo-linkedin />engin-diri</div>
    </div>
    <div class="thanks__person">
      <img class="thanks__avatar" src="/img/mike-coleman.jpg" alt="Mike Coleman" />
      <div class="thanks__name">Mike Coleman</div>
      <div class="thanks__org">Docker</div>
      <div class="thanks__handles">
        <span><carbon-logo-x />@mikegcoleman</span>
        <span><carbon-logo-github />mikegcoleman</span>
      </div>
      <div class="thanks__qr"><QRCode data="https://github.com/mikegcoleman" dark="#000000" /></div>
      <div class="thanks__qr-label"><carbon-logo-github />mikegcoleman</div>
    </div>
    <div class="thanks__person">
      <div class="thanks__avatar thanks__avatar--icon"><carbon-logo-github /></div>
      <div class="thanks__name">Workshop repo</div>
      <div class="thanks__org">slides · demo · kit</div>
      <div class="thanks__handles">
        <span>pulumi/workshops</span>
      </div>
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/neo-in-a-docker-sandbox" dark="#000000" /></div>
      <div class="thanks__qr-label">neo-in-a-docker-sandbox</div>
    </div>
  </div>
</div>

<style scoped>
.thanks__kicker { font-family: var(--slidev-font-mono); font-size: 1.15rem; font-weight: 700; letter-spacing: 0.6em; text-transform: uppercase; color: var(--p-fg-muted); }
.thanks { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2.5rem; justify-items: center; }
.thanks__person { display: flex; flex-direction: column; align-items: center; text-align: center; height: 100%; }
.thanks__avatar { width: 7rem; height: 7rem; border-radius: 9999px; object-fit: cover; border: 3px solid color-mix(in srgb, var(--p-primary) 45%, transparent); }
.thanks__avatar--icon { display: flex; align-items: center; justify-content: center; font-size: 3.6rem; color: var(--p-fg); background: var(--p-bg-elevated); }
.thanks__name { margin-top: 0.9rem; font-size: 1.45rem; font-weight: 700; color: var(--p-fg); }
.thanks__org { font-size: 1.1rem; color: var(--p-fg-muted); }
.thanks__handles { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 0.15rem; margin-top: 0.5rem; min-height: 3rem; font-size: 1rem; color: var(--p-fg-muted); }
.thanks__handles span { display: inline-flex; align-items: center; gap: 0.35rem; }
.thanks__qr { width: 8rem; height: 8rem; margin-top: 1.1rem; padding: 0.45rem; background: #ffffff; border-radius: 10px; box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18); }
.thanks__qr-label { display: inline-flex; align-items: center; gap: 0.35rem; margin-top: 0.55rem; font-family: var(--slidev-font-mono); font-size: 0.85rem; color: var(--p-fg-muted); }
</style>
