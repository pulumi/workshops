---
theme: "@pulumi/slidev-theme"
title: "GPU-aware batch scheduling for AI training on Kubernetes with Pulumi"
info: |
  GPU-aware batch scheduling for AI training on Kubernetes with Pulumi: Provision a gang scheduler with Pulumi, start a training job all-or-nothing, and enforce fair share between two teams.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/gpu-aware-batch-scheduling-ai-training
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
    GPU-aware batch scheduling for AI training on Kubernetes with Pulumi
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Provision a gang scheduler with Pulumi, start a training job all-or-nothing, and enforce fair share between two teams
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
[1 min] Welcome. Say who we are and the one-line promise: by the end you will have watched a scheduler refuse to start half a training job.
-->

---

<div class="absolute inset-0 flex items-center px-24 gap-20">
  <div class="flex-shrink-0">
    <img src="/img/speaker-placeholder.svg" class="w-[28rem] rounded-2xl shadow-xl border-4" style="border-color: rgba(126,107,255,0.45)" alt="Speaker Name" />
  </div>
  <div class="flex-1">
    <h1 class="!text-[7rem] !leading-[1.02] !font-semibold !tracking-tight !mb-4 !text-[var(--p-primary)]">Speaker Name</h1>
    <p class="!text-[2.2rem] !leading-relaxed !m-0 opacity-90">
      Role at <strong class="!text-[var(--p-primary)]">Pulumi</strong>
    </p>
    <div class="!mt-8 flex items-center gap-8 !text-[1.5rem] opacity-70">
      <span class="flex items-center gap-2"><carbon-logo-x /> @handle</span>
      <span class="flex items-center gap-2"><carbon-logo-linkedin /> handle</span>
      <span class="flex items-center gap-2"><carbon-logo-github /> handle</span>
    </div>
    <p class="!mt-10 !text-[1.75rem] !leading-relaxed opacity-70 !m-0">
      One line on what they build.<br/>
      One line on why this topic matters to them.
    </p>
  </div>
</div>

<!--
[1 min] Introduce yourselves in one breath each. Keep it short, the job is the demo.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
[0.5 min] Quick transition into housekeeping and the agenda.
-->

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

<!--
[1 min] Housekeeping: where the repo is, that everything runs on a laptop with kind, no cloud account, no GPU. Say now that the GPU sharing part is a recording.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>The idle GPU problem</li>
  <li>Gang scheduling and queues</li>
  <li>Volcano on Kubernetes</li>
  <li>What we build with Pulumi</li>
  <li>Demo: gangs, queues, DRA</li>
  <li>Teardown and Q&A</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
[1 min] Walk the agenda: the problem, the tech, what we build, then the demo. Six questions run through all of it.
-->

---

# A job that asked for 16 GPUs took 4 and is training nothing

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">Lambda, on the default scheduler</div>
    <p>"A distributed training job asks for 16 GPUs. Four are free. The default scheduler grabs those four, then sits and waits for the other twelve."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>The job needs all of its pods at once</li>
      <li>The scheduler places them one at a time</li>
      <li>Lambda calls it a partial-scheduling deadlock</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-quotes class="psst__icon" />
  <span><strong>Source:</strong> Lambda's LinkedIn post, "Your Kubernetes scheduler is quietly wasting GPUs"</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
[2 min] Open on Lambda's own words. Read the quote slowly: sixteen asked, four free, the scheduler takes the four and waits for twelve. Then the three facts on the right. The post is about two months old on LinkedIn, the exact date is not shown, so do not quote a date.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[5.2rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Four GPUs sit held by a job that cannot start</h1>
</div>

<!--
[1 min] Let it sit. Four GPUs are held and nothing is training. Ask the room what that costs per hour.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Nobody else can use them</h1>
</div>

<!--
[1 min] The second half of the tension. Those four are not free, and they are not working. Everyone else in the queue waits behind a job that is not running.
-->

---

# A codebase reverts with one command, a stuck GPU gang costs money every minute it waits

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">A codebase</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Review a diff</li>
      <li>Revert with one command</li>
      <li>A wrong change costs nothing while it waits</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">A half-started GPU gang</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>No diff to review</li>
      <li>No revert, it only costs</li>
      <li>GPUs bill by the hour while it waits</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[2 min] The contrast. A wrong change in code you revert and move on. A gang stuck half started has no revert. It sits there and bills by the hour. That is why we want the scheduler to prevent it, not clean it up.
-->

---

# Six questions decide whether you can trust a batch scheduler

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-link class="step-icon" /><div class="gpu-caption gpu-caption--muted">Together</div><p>What has to start together?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-users-three class="step-icon" /><div class="gpu-caption gpu-caption--muted">Turn</div><p>Whose turn is it?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-gavel class="step-icon" /><div class="gpu-caption gpu-caption--muted">Scheduler</div><p>Which scheduler decides?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-package class="step-icon" /><div class="gpu-caption gpu-caption--muted">Install</div><p>How do we install it and keep it reproducible?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--muted">Sharing</div><p>How does one GPU serve two jobs?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-rocket-launch class="step-icon" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>What does it look like when it runs?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[2 min] These six questions are the spine of the next hour. Name them once. Tell the room the demo answers the last one, and that we answer them in order. Do not explain any yet.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Question 1: What has to start together?</h1>
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

<!--
[0.5 min] Section one.
-->

---

# A gang job starts all its pods or none of them

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-note-pencil class="plan__icon" />
    <p>The job declares <code>minAvailable</code></p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-magnifying-glass class="plan__icon" />
    <p>The scheduler checks that many pods fit at once</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-check-circle class="plan__icon" />
    <p>They fit: every pod starts together</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-pause-circle class="plan__icon" />
    <p>They do not: all stay Pending, no GPU held</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p><strong>All or nothing:</strong> no half-started job holds GPUs.</p>
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

<!--
[2.5 min] Walk the four steps. The key move is step two: the decision is about the whole group, not the next pod. In the demo the field is minAvailable on a Volcano Job. If it does not fit, nothing starts and nothing is held.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Question 2: Whose turn is it?</h1>
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

<!--
[0.5 min] Section two. Gangs fix one job. Teams share one cluster.
-->

---

# A queue caps what a team can hold and shares out the rest

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-users-three class="zone__icon" /><div class="gpu-caption gpu-caption--accent">A Volcano queue</div></div>
    <ul class="zone__list">
      <li><ph-sliders-horizontal /><span><code>weight</code>: its share when the cluster is contended</span></li>
      <li><ph-prohibit /><span><code>capability</code>: a hard ceiling</span></li>
      <li><ph-arrows-clockwise /><span><code>reclaimable</code>: others can borrow idle share</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-cube class="zone__icon" /><div class="gpu-caption">The cluster</div></div>
    <ph-brain class="zone__hero" />
    <p>Eight fake GPUs, shared by team-a and team-b</p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">The demo</div>
  <p>Each team queue is capped at 4 GPUs.</p>
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

<!--
[2.5 min] Three fields per queue: weight, capability, reclaimable. Weight is the share under contention. Capability is the ceiling. Reclaimable lets others borrow what a team is not using. In the demo each of two queues has a capability of 4 GPUs.
-->

---

# Two questions answered, four to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-link class="step-icon" /><div class="gpu-caption gpu-caption--accent">Together</div><p>Gang scheduling: all or nothing</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-users-three class="step-icon" /><div class="gpu-caption gpu-caption--accent">Turn</div><p>Queues: weight, capability, reclaim</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-gavel class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Scheduler</div><p>Which scheduler decides?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-package class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Install</div><p>How do we install it and keep it reproducible?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-cube class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Sharing</div><p>How does one GPU serve two jobs?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-rocket-launch class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>What does it look like when it runs?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
[1 min] Quick recap. Gang answers what starts together. Queues answer whose turn it is. Four to go.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Question 3: Which scheduler decides?</h1>
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

<!--
[0.5 min] Section three. Who implements gangs and queues?
-->

---

# Volcano adds gangs and queues next to the default scheduler

<div class="zoom-content">

<div class="compose">
  <div class="compose__stack">
    <div class="gpu-caption">Your cluster</div>
    <div class="piece piece--mixin" v-click="4"><ph-wrench />Volcano admission</div>
    <div class="piece piece--mixin" v-click="3"><ph-users-three />Volcano controllers</div>
    <div class="piece piece--sandbox" v-click="2"><ph-cube />Volcano scheduler · gangs and queues</div>
    <div class="piece piece--template" v-click="1"><ph-package />Default scheduler · stays installed</div>
  </div>
  <ul class="rules" v-click="5">
    <li><ph-check-circle /><span>A CNCF incubating project</span></li>
    <li><ph-note-pencil /><span>A pod opts in with <code>schedulerName: volcano</code></span></li>
    <li><ph-scales /><span>Gang scheduling and queues are built in</span></li>
    <li><ph-terminal-window /><span>Admission, controllers and scheduler run in <code>volcano-system</code></span></li>
  </ul>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
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

<!--
[2.5 min] Volcano is a CNCF incubating project. It runs next to the default scheduler, it does not replace it. Pods opt in by naming it. Gang scheduling and queues are built in. In the demo you will see the admission, controllers and scheduler pods in the volcano-system namespace, Volcano version 1.15.3.
-->

---

# Armada and Kueue solve the same problem, and we picked Volcano by judgment

<div class="zoom-content">

<div class="modes">
  <div class="gpu-card gpu-card--primary mode" v-click>
    <div class="mode__head"><ph-gavel class="mode__icon" /><code class="mode__name">Volcano</code></div>
    <p>Gang scheduling and queues built in</p>
    <div class="mode__note">CNCF incubating</div>
  </div>
  <div class="gpu-card gpu-card--accent mode" v-click>
    <div class="mode__head"><ph-scales class="mode__icon" /><code class="mode__name">Armada</code></div>
    <p>Solves the same problem</p>
    <div class="mode__note">CNCF sandbox, not compared hands on</div>
  </div>
  <div class="gpu-card mode" v-click>
    <div class="mode__head"><ph-list-numbers class="mode__icon" /><code class="mode__name">Kueue</code></div>
    <p>Solves the same problem</p>
    <div class="mode__note">Not compared hands on</div>
  </div>
</div>

<div class="gates" v-click>
  <div class="gpu-caption gpu-caption--accent">Why Volcano</div>
  <span class="gate"><ph-seal-check />gang scheduling</span>
  <ph-caret-right class="gates__sep" />
  <span class="gate"><ph-users-three />queues built in</span>
  <ph-caret-right class="gates__sep" />
  <span class="gate"><ph-scroll />a KubeCon NA 2026 session</span>
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

<!--
[2.5 min] Be plain: Armada and Kueue solve the same problem and we did not compare them hands on. Volcano is a judgment call, not a community consensus. If someone in the room runs Kueue or Armada, ask them to say why. Same Pulumi program shape would work for either.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Question 4: How do we install it and keep it reproducible?</h1>
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

<!--
[0.5 min] Section four. Now Pulumi IaC.
-->

---

# A Pulumi program replaces a pile of kubectl apply commands

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Manifests by hand</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Applied one command at a time</li>
      <li>Order is up to you</li>
      <li>Cleanup is up to you</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Pulumi IaC</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Typed resources in TypeScript</li>
      <li>One <code>pulumi up</code> per project</li>
      <li>One teardown removes it all</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[2.5 min] Say what Pulumi IaC does here, no adjectives. The Helm chart, the queues and the jobs are resources in a program. You preview, you apply, and you tear down with one script that destroys in reverse order.
-->

---

# Three small Pulumi projects hand the cluster to each other

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card gpu-card--primary chain__node" v-click="1">
    <ph-cube class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">01-cluster</div>
    <span>kind, fake GPUs, Volcano chart</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card chain__node" v-click="2">
    <ph-users-three class="chain__icon" />
    <div class="gpu-caption">02-queues</div>
    <span>team-a and team-b queues</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-rocket-launch class="chain__icon" />
    <div class="gpu-caption">03-jobs</div>
    <span>default, gang, fair share</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>Each project is one <code>pulumi up</code>.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-link /><p>Stack outputs pass the kubeconfig on</p></div>
  <div class="fact"><ph-trash /><p>Teardown runs in reverse order</p></div>
  <div class="fact"><ph-package /><p>Volcano 1.15.3 is pinned</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.chain { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.8rem; }
.chain__node { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; padding-block: 1.2rem; }
.chain__node span { font-size: 1.15rem; color: var(--p-fg); }
.chain__node code { font-size: 1.05rem !important; }
.chain__icon { font-size: 2.6rem; color: var(--p-primary); }
.chain__arrow { align-self: center; font-size: 1.6rem; color: var(--p-accent); }
.chain__rule { margin-top: 1.2rem; }
.chain__rule p { font-size: 1.3rem; font-weight: 600; }
.facts { display: flex; justify-content: space-between; gap: 1rem; margin-top: 1.4rem; }
.fact { display: flex; align-items: flex-start; gap: 0.7rem; }
.fact svg { flex-shrink: 0; font-size: 1.6rem; color: var(--p-primary); margin-top: 0.1rem; }
.fact p { margin: 0 !important; font-size: 1.05rem; line-height: 1.35; white-space: nowrap; }
.fact small { display: block; font-size: 0.9rem; color: var(--p-fg-muted); margin-top: 0.2rem; }
</style>

<!--
[2.5 min] Three folders, three Pulumi projects. The cluster project exports the kubeconfig. The queues project reads it through a stack reference. The jobs project does the same. Fewer moving parts per project, and each one is a single pulumi up.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Question 5: How does one GPU serve two jobs?</h1>
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

<!--
[0.5 min] Section five. Remind them this part is a recording.
-->

---

# DRA lets a pod claim a device by what it needs, not a whole GPU

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Without DRA</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>A pod asks for a number of GPUs</li>
      <li>Whole devices only</li>
      <li>The scheduler counts them</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Dynamic Resource Allocation</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>A pod makes a claim for a device</li>
      <li>The claim says what it needs</li>
      <li>A driver decides what satisfies it</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[2.5 min] Dynamic Resource Allocation, DRA, is a Kubernetes API. The pod stops asking for a count and makes a claim. Read the Kubernetes DRA page before presenting and keep to what it says. We do not run it live.
-->

---

# A driver publishes devices and the scheduler matches claims to them

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-cube class="zone__icon" /><div class="gpu-caption gpu-caption--accent">A DRA driver</div></div>
    <ul class="zone__list">
      <li><ph-package /><span>Publishes devices as resource slices</span></li>
      <li><ph-list-numbers /><span>Device classes group kinds of device</span></li>
      <li><ph-warning /><span>Needs a real GPU and a driver</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-gavel class="zone__icon" /><div class="gpu-caption">The scheduler</div></div>
    <ph-brain class="zone__hero" />
    <p>Matches each claim to a published device</p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">On this kind cluster</div>
  <p>The list of published devices is empty.</p>
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

<!--
[2.5 min] The split of work: the driver publishes, the scheduler matches. On kind there is no GPU and no driver, so the list is empty. That is exactly what step five will show, and then we play the recording.
-->

---

# Where this breaks today: starvation, driver mismatch, and a GPU we cannot show live

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-warning class="step-icon" /><div class="gpu-caption gpu-caption--muted">Starvation</div><p>A big gang can wait while smaller jobs keep fitting</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-shield-warning class="step-icon" /><div class="gpu-caption gpu-caption--muted">Driver mismatch</div><p>Volcano 1.15.0 and 1.15.1 had a DRA capacity-check bypass; we pin 1.15.3</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-prohibit class="step-icon" /><div class="gpu-caption gpu-caption--muted">No live GPU</div><p>kind has fake GPUs; DRA is a recording</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-sliders-horizontal class="step-icon" /><div class="gpu-caption gpu-caption--muted">Rehearsed numbers</div><p>Eight GPUs and ten pods make the contrast</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-scales class="step-icon" /><div class="gpu-caption gpu-caption--muted">A judgment call</div><p>Armada and Kueue not compared hands on</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-hand-palm class="step-icon" /><div class="gpu-caption gpu-caption--muted">Untested path</div><p>The real-GPU DRA setup is not built here</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[3.5 min] Real limits, said plainly. A large gang can wait while small jobs keep fitting, this is the usual cost of all-or-nothing. Versions matter: Volcano 1.15.0 and 1.15.1 are affected by a DRA capacity-check bypass fixed in 1.15.2 and 1.15.3, so we pin 1.15.3. And kind has no GPU: the numbers are fake and the GPU sharing part is recorded. Rehearse the eight-GPU, ten-pod sizing before you deliver.
-->

---

# Five questions answered, one to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-link class="step-icon" /><div class="gpu-caption gpu-caption--accent">Together</div><p>Gang: all or nothing</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-users-three class="step-icon" /><div class="gpu-caption gpu-caption--accent">Turn</div><p>Queues cap and share</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-gavel class="step-icon" /><div class="gpu-caption gpu-caption--accent">Scheduler</div><p>Volcano, by judgment</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-package class="step-icon" /><div class="gpu-caption gpu-caption--accent">Install</div><p>Pulumi IaC, three projects</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--accent">Sharing</div><p>DRA claims, recorded</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-rocket-launch class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>What does it look like when it runs?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
[1 min] Five answered. The last one, what it looks like when it runs, is the demo.
-->

---

# The cluster, Volcano, two queues and the jobs all come from Pulumi IaC

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-cube class="plan__icon" />
    <p><code>01-cluster</code>: kind and fake GPUs</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-package class="plan__icon" />
    <p>Volcano from its Helm chart</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-users-three class="plan__icon" />
    <p><code>02-queues</code>: team-a, team-b</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-rocket-launch class="plan__icon" />
    <p><code>03-jobs</code>: default, gang, fair share</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p><strong>Eight fake GPUs, ten pods:</strong> that is what makes the contrast visible.</p>
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

<!--
[2 min] This is the picture of what we build. One kind cluster with a control plane and two workers, four fake GPUs per worker. Volcano from its Helm chart. Two queues. Then the jobs.
-->

---

# The gang is one field: minAvailable

<div class="zoom-content">

<div class="big-code code-sm">

```ts
new k8s.apiextensions.CustomResource(name, {
  apiVersion: "batch.volcano.sh/v1alpha1",
  kind: "Job",
  spec: {
    schedulerName: "volcano",
    queue,
    minAvailable: replicas,
    tasks: [{ name: "worker", replicas, template }],
  },
});
```

</div>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
</style>

<!--
[2 min] The only program code in the deck, simplified from 03-jobs. schedulerName opts in to Volcano, queue picks the team, minAvailable is the gang. Set it equal to replicas and the job starts whole or not at all.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: GPU-aware batch scheduling.</h1>
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

<!--
[0.5 min] Divider. We have the story, now we prove it. Check that the cluster is up before you start the next slide.
-->

---

# Six steps take us from an empty laptop to a proven gang

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-cube class="step__icon" /><p>A cluster with Volcano and fake GPUs</p></div>
  <div class="gpu-card step" v-click><ph-users-three class="step__icon" /><p>Two queues, each capped at 4 GPUs</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-pause-circle class="step__icon" /><p>The default scheduler strands 2 of 10 pods</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-shield-check class="step__icon" /><p>The gang waits together, then starts</p></div>
  <div class="gpu-card step" v-click><ph-hand-palm class="step__icon" /><p>team-b asks for 6 and waits behind its cap of 4</p></div>
  <div class="gpu-card gpu-card--accent step" v-click><ph-trash class="step__icon" /><p>A recorded look at GPU sharing, then teardown</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.steps { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.2rem; }
.step { display: flex; flex-direction: column; gap: 0.7rem; padding: 1.2rem 1.3rem; }
.step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.step__icon { font-size: 2rem; color: var(--p-primary); }
</style>

<!--
[2 min] Six steps. Steps three and four are the proof. Step five is a recording. Step six is teardown, and we check it rather than assume it.
-->

---

# Step 1: One pulumi up gives us a cluster with Volcano running

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-cube />01-cluster</div>
    <div class="big-code code-sm">

```bash
cd 01-cluster && pulumi up
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-cube /><span>One control plane, two workers</span></li>
    <li><ph-sliders-horizontal /><span>Four fake GPUs per worker</span></li>
    <li><ph-package /><span>Volcano 1.15.3 from its Helm chart</span></li>
    <li><ph-check-circle /><span>Scheduler, controllers and admission are Running</span></li>
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

<!--
[7 min] Fallback: if the kind cluster is slow or Docker is not ready, run init-stacks.sh the day before and keep the cluster up; image pulls are the usual delay. The folder is 01-cluster. After pulumi up, show the pods in volcano-system. Talk through Volcano while it applies.
-->

---

# Step 2: Two queues are Open, each capped at 4 GPUs

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-users-three />02-queues</div>
    <div class="big-code code-sm">

```bash
cd 02-queues && pulumi up
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-users-three /><span>team-a and team-b</span></li>
    <li><ph-prohibit /><span>Each capped at 4 GPUs</span></li>
    <li><ph-arrows-clockwise /><span><code>weight</code>, <code>capability</code>, <code>reclaimable</code> set per queue</span></li>
    <li><ph-check-circle /><span>Both queues report Open</span></li>
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

<!--
[4 min] Short step. Show that the queue is a resource in the program, and that both report Open.
-->

---

# Step 3a: The default scheduler starts 8 pods and strands 2

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
03-jobs/scenario.sh default-scheduler
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-check-circle /><div><div class="gpu-caption gpu-caption--accent">1 · Running</div><span>8 pods</span></div></div>
  <div class="gpu-card check" v-click><ph-clock /><div><div class="gpu-caption gpu-caption--accent">2 · Pending</div><span>2 pods</span></div></div>
  <div class="gpu-card check" v-click><ph-cube /><div><div class="gpu-caption gpu-caption--accent">3 · GPUs</div><span>All 8 fake GPUs are in use</span></div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.checks { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.9rem; }
.checks__cmd { margin-bottom: 1.1rem; }
.checks__cmd pre { margin: 0 !important; }
.check { display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.2rem; }
.check > svg { flex-shrink: 0; font-size: 1.9rem; color: var(--p-primary); }
.check code { display: inline-block; margin-top: 0.4rem; font-size: 0.9rem !important; background: var(--p-bg) !important; }
.checks__note { display: flex; align-items: center; gap: 0.7rem; margin-top: 1.3rem; }
.checks__icon { font-size: 1.4rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
[5 min] Fallback: if the counts differ, rehearse the capacity numbers first: eight fake GPUs against ten one-GPU pods is what makes it visible. Run reset.sh to get back to the start of step three. The point: the default scheduler starts as many as fit and leaves the rest. This is Lambda's deadlock in miniature.
-->

---

# Step 3b: The gang keeps all 10 pods Pending together, then starts when GPUs grow

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
03-jobs/scenario.sh gang
03-jobs/grow-gpus.sh 5
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-clock /><div><div class="gpu-caption gpu-caption--accent">1 · Pending</div><span>All 10 pods together</span></div></div>
  <div class="gpu-card check" v-click><ph-prohibit /><div><div class="gpu-caption gpu-caption--accent">2 · Held</div><span>No GPU held by a half job</span></div></div>
  <div class="gpu-card check" v-click><ph-note-pencil /><div><div class="gpu-caption gpu-caption--accent">3 · Why</div><span>minAvailable is 10, 8 GPUs fit</span></div></div>
  <div class="gpu-card check" v-click><ph-arrows-clockwise /><div><div class="gpu-caption gpu-caption--accent">4 · Grow</div><span>5 fake GPUs per worker</span></div></div>
  <div class="gpu-card check" v-click><ph-cube /><div><div class="gpu-caption gpu-caption--accent">5 · Total</div><span>10 GPUs</span></div></div>
  <div class="gpu-card check" v-click><ph-check-circle /><div><div class="gpu-caption gpu-caption--accent">6 · Running</div><span>All 10 start together</span></div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.checks { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.9rem; }
.checks__cmd { margin-bottom: 1.1rem; }
.checks__cmd pre { margin: 0 !important; }
.check { display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.2rem; }
.check > svg { flex-shrink: 0; font-size: 1.9rem; color: var(--p-primary); }
.check code { display: inline-block; margin-top: 0.4rem; font-size: 0.9rem !important; background: var(--p-bg) !important; }
.checks__note { display: flex; align-items: center; gap: 0.7rem; margin-top: 1.3rem; }
.checks__icon { font-size: 1.4rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
[7 min] Fallback: reset.sh returns to the start of step three; grow-gpus.sh 5 runs a pulumi up in 01-cluster, so allow time. show.sh prints the state. If the gang does not stay Pending, check the job is on the volcano scheduler. The moment to land: nothing is held until all ten fit.
-->

---

# Step 4: team-b asks for 6 GPUs, over its cap of 4, and waits

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
03-jobs/scenario.sh fair-share
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-check-circle /><div><div class="gpu-caption gpu-caption--accent">1 · team-a</div><span>Running</span></div></div>
  <div class="gpu-card check" v-click><ph-clock /><div><div class="gpu-caption gpu-caption--accent">2 · team-b</div><span>Asks for 6, waits</span></div></div>
  <div class="gpu-card check" v-click><ph-prohibit /><div><div class="gpu-caption gpu-caption--accent">3 · Cap</div><span>4 GPUs per queue</span></div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.checks { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.9rem; }
.checks__cmd { margin-bottom: 1.1rem; }
.checks__cmd pre { margin: 0 !important; }
.check { display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.2rem; }
.check > svg { flex-shrink: 0; font-size: 1.9rem; color: var(--p-primary); }
.check code { display: inline-block; margin-top: 0.4rem; font-size: 0.9rem !important; background: var(--p-bg) !important; }
.checks__note { display: flex; align-items: center; gap: 0.7rem; margin-top: 1.3rem; }
.checks__icon { font-size: 1.4rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
[5 min] Fallback: if both teams run, reset.sh and check each queue's capability is 4. Make the point that the wait comes from the queue cap, not from a full cluster. Run show.sh to read the state.
-->

---

# Step 5: Sharing one GPU is a recording, because kind has no GPU

<div class="zoom-content">

<div class="s5__cmd big-code code-sm">

```bash
04-dra/check-dra.sh
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-terminal-window /><span>The resource.k8s.io API is served</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-list-numbers /><span>Device classes are listed</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-warning /><span>The resource slice list is empty</span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Recorded segment</div><p>kind has no GPU. We show the DRA API here, then play the recording of two jobs sharing one GPU.</p></aside>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
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

<!--
[5 min] Say it plainly: this part is not live. kind has no GPU and no GPU driver, so the device list is empty. The script shows the API and the empty list, then you play the recording. No GPU node is provisioned and no cloud cost is incurred. Running it live needs a real GPU and a DRA driver; that path is not built or tested here.
-->

---

# Step 6: Teardown leaves nothing behind, and we check

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-trash />05-teardown</div>
    <div class="big-code code-sm">

```bash
05-teardown/teardown.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-arrow-down /><span>Stacks are destroyed in reverse order</span></li>
    <li><ph-cube /><span>The kind cluster is deleted</span></li>
    <li><ph-list-numbers /><span>The script lists what is left</span></li>
    <li><ph-eye /><span>We verify, we do not assume</span></li>
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

<!--
[4 min] Teardown is part of the demo. The script destroys the stacks in reverse order, deletes the kind cluster and lists what is left. Read the list out loud.
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-4 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/gpu-aware-batch-scheduling-ai-training" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → gpu-aware-batch-scheduling-ai-training</div>
  </div>
  <div class="res-card">
    <QRCode data="https://volcano.sh/en/docs/queue/" dark="#000000" />
    <div class="res-card__title">Volcano queue docs</div>
    <div class="res-card__body">volcano.sh/en/docs/queue</div>
  </div>
  <div class="res-card">
    <QRCode data="https://kubernetes.io/docs/concepts/scheduling-eviction/dynamic-resource-allocation/" dark="#000000" />
    <div class="res-card__title">Dynamic Resource Allocation in Kubernetes</div>
    <div class="res-card__body">kubernetes.io/docs DRA</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/registry/packages/kubernetes/" dark="#000000" />
    <div class="res-card__title">Pulumi Kubernetes provider</div>
    <div class="res-card__body">pulumi.com/registry/kubernetes</div>
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

<!--
[1 min] Resources. Point at the repo QR code first, then the docs. The repo link resolves once the pull request is merged.
-->

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

<!--
[0.5 min] Continue your journey: one sentence, then move on.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-16">
  <div class="thanks__kicker">Thank you</div>
  <h1 class="!text-[4.5rem] !leading-[1.02] !font-semibold !tracking-tight !mt-3 !mb-12 text-center">Questions?</h1>
  <div class="thanks">
    <div class="thanks__person">
      <img class="thanks__avatar" src="/img/speaker-placeholder.svg" alt="Speaker Name" />
      <div class="thanks__name">Speaker Name</div>
      <div class="thanks__org">Pulumi</div>
      <div class="thanks__handles">
        <span><carbon-logo-x />@handle</span>
        <span><carbon-logo-github />handle</span>
      </div>
      <div class="thanks__qr"><QRCode data="https://www.linkedin.com/company/pulumi/" dark="#000000" /></div>
      <div class="thanks__qr-label"><carbon-logo-linkedin />pulumi</div>
    </div>
    <div class="thanks__person">
      <div class="thanks__avatar thanks__avatar--icon"><carbon-logo-github /></div>
      <div class="thanks__name">Workshop repo</div>
      <div class="thanks__org">slides · demo</div>
      <div class="thanks__handles">
        <span>pulumi/workshops</span>
      </div>
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/gpu-aware-batch-scheduling-ai-training" dark="#000000" /></div>
      <div class="thanks__qr-label">gpu-aware-batch-scheduling-ai-training</div>
    </div>
  </div>
</div>

<style scoped>
.thanks__kicker { font-family: var(--slidev-font-mono); font-size: 1.15rem; font-weight: 700; letter-spacing: 0.6em; text-transform: uppercase; color: var(--p-fg-muted); }
.thanks { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2.5rem; justify-items: center; }
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

<!--
[4.5 min] Questions. If nobody asks, pick the starvation case from the limits slide, or the Armada and Kueue choice. Be plain that Volcano was a judgment call.
-->
