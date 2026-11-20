---
theme: "@pulumi/slidev-theme"
title: "Run a Kubernetes cluster fleet as code: one component, one stack per cluster, staged upgrades with Pulumi"
info: |
  Run a Kubernetes cluster fleet as code: one component, one stack per cluster, staged upgrades with Pulumi: Build three AKS clusters from one Pulumi component, roll them out in waves, upgrade them in two stages, and tear them down.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/kubernetes-cluster-fleet-as-code
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
    Run a Kubernetes cluster fleet as code: one component, one stack per cluster, staged upgrades with Pulumi
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Build three AKS clusters from one Pulumi component, roll them out in waves, upgrade them in two stages, and tear them down
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
[0.5 min] Welcome. Introduce the workshop in one sentence: three AKS clusters from one Pulumi component, rolled out in waves, upgraded in two stages, then removed. Mention the shape of the 90 minutes: about 30 minutes of slides, 45 of demo and 10 of questions.
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
[0.5 min] Speaker placeholder: speakers are not announced yet, so replace this slide with the real speaker details before delivery.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
[0.5 min] Section title: housekeeping, then the agenda.
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
[1 min] Housekeeping. Chat tab for chatter, Q&A tab for questions, handouts tab for slides and scripts, recording link by email. Say that questions in the Q&A tab are answered at the end.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>Why one change reaches every cluster</li>
  <li>One component, one stack per cluster</li>
  <li>Credentials, policy and rollout order</li>
  <li>The fleet we will build</li>
  <li>Demo: build, upgrade, destroy</li>
  <li>Wrap-up and Q&A</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
[1 min] Agenda. Why one change reaches every cluster, one component with one stack per cluster, credentials, policy and rollout order, the fleet we will build, then the demo: build, upgrade, destroy. Wrap-up and Q&A at the end.
-->

---

# An automatic security update took five Datadog regions offline in the same hour.

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">Datadog's own post-mortem</div>
    <p>"a security update to systemd was automatically applied to a number of VMs"</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>It began on 2023-03-08 at 06:03 UTC</li>
      <li>US1, EU1, US3, US4 and US5 were affected, across all services</li>
      <li>"tens of thousands of nodes" were affected between 06:00 and 07:00</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span><strong>Psssst…</strong> all services were operational again on 2023-03-09 at 08:58 UTC</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
[2 min] Start with a real day. On 2023-03-08, Datadog had an outage that began at 06:03 UTC and hit five regions: US1, EU1, US3, US4 and US5, across all services. The cause in their own words: a security update to systemd was automatically applied to a number of VMs. Their post-mortem says this affected tens of thousands of nodes in their fleet between 06:00 and 07:00. Then the reveal: all services were operational again in all regions on 2023-03-09 at 08:58 UTC, a day later. Source: Datadog's post-mortem, https://www.datadoghq.com/blog/2023-03-08-multiregion-infrastructure-connectivity-issue/, read 2026-11-20. Say plainly that we only quote what the post-mortem says. We make no claim about how Datadog runs its fleet today.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[4rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[85%]">"Thus it affected multiple regions at the exact same time."</h1>
  <p class="!mt-10 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0">Datadog's own post-mortem, 2023-03-08</p>
</div>

<!--
[1 min] This is the sentence to remember. Datadog's post-mortem says the base OS image "had a legacy security update channel enabled", and "Thus it affected multiple regions at the exact same time". Before that sentence they describe their change process: "we do so region-by-region, cluster-by-cluster, node-by-node". Read the headline as the point: a careful process and a fast, shared channel existed side by side. Source: https://www.datadoghq.com/blog/2023-03-08-multiregion-infrastructure-connectivity-issue/, read 2026-11-20.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Your change process rolls out one cluster at a time.</h1>
</div>

<!--
[0.5 min] Pause here. Most of you have this process: a canary, then the rest, one cluster after another. Say it, then let it sit for a second before the next slide.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Your clusters can still change all at once.</h1>
</div>

<!--
[0.5 min] The tension. The process is one thing and the paths that change a cluster are another. A base image, an update channel or a copied credential can bypass the order you wrote down. The rest of the workshop is about putting the order into code.
-->

---

# By hand, every cluster ends up a little different from the last one; as code, every cluster starts from one definition.

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">By hand</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Each cluster drifts a little from the last one</li>
      <li>The order of change lives in people's heads</li>
      <li>Credentials get copied from cluster to cluster</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">As code</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Every cluster starts from one definition</li>
      <li>The order of change is written down</li>
      <li>A preview shows the change before it ships</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1.5 min] Why this is hard. By hand, you build cluster one, then copy it for cluster two, and by cluster five nobody remembers which flag was different. The team knows the order of a rollout; the system does not. As code, every cluster starts from one definition and the order is a file you can review. Be fair about it: code leaves the hard parts in place and makes them visible and repeatable. The credential line is about the copied secrets that come up in question 3.
-->

---

# Six questions decide whether a cluster fleet is safe to run.

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-buildings class="step-icon" /><div class="gpu-caption gpu-caption--muted">One cluster</div><p>When is one cluster not enough?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--muted">Unit</div><p>What is the smallest unit you can repeat?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--muted">Access</div><p>How do clusters get credentials and config without copied secrets?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-shield-warning class="step-icon" /><div class="gpu-caption gpu-caption--muted">Guard</div><p>What stops a bad cluster from shipping?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-list-numbers class="step-icon" /><div class="gpu-caption gpu-caption--muted">Order</div><p>How do you roll out a change in a safe order?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-trash class="step-icon" /><div class="gpu-caption gpu-caption--muted">Remove</div><p>How do you remove it all?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
[2 min] These six questions are the spine of the workshop. Read them one at a time as the cards appear. One: when is one cluster not enough? Two: what is the smallest unit you can repeat? Three: how do clusters get credentials and config without copied secrets? Four: what stops a bad cluster from shipping? Five: how do you roll out a change in a safe order? Six: how do you remove it all? After each section I bring the grid back with the answered cards lit up. The demo answers question six last.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">When is one cluster not enough?</h1>
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
[0.5 min] Question one. Open with the honest default: one cluster is often enough.
-->

---

# A new cluster earns its place when a customer, a region or an environment needs its own boundary.

<div class="zoom-content">

<div class="modes">
  <div class="gpu-card gpu-card--primary mode" v-click>
    <div class="mode__head"><ph-users-three class="mode__icon" /><code class="mode__name">customer</code></div>
    <p>One boundary per customer</p>
    <div class="mode__track"><i /><i /><ph-cube /><i /><i /></div>
    <div class="mode__note">Tenants stay apart</div>
  </div>
  <div class="gpu-card gpu-card--accent mode" v-click>
    <div class="mode__head"><ph-globe class="mode__icon" /><code class="mode__name">region</code></div>
    <p>One boundary per region</p>
    <div class="mode__track"><i /><ph-cube /><i /><ph-cube /><i /></div>
    <div class="mode__note">Each region fails on its own</div>
  </div>
  <div class="gpu-card mode" v-click>
    <div class="mode__head"><ph-stack class="mode__icon" /><code class="mode__name">environment</code></div>
    <p>One boundary per environment</p>
    <div class="mode__track"><i /><ph-cube /><ph-arrow-right /><ph-cube /><i /></div>
    <div class="mode__note">Changes reach dev before prod</div>
  </div>
</div>

<div class="gates" v-click>
  <div class="gpu-caption gpu-caption--accent">Start with</div>
  <span class="gate"><ph-cube />one cluster</span>
  <ph-caret-right class="gates__sep" />
  <span class="gate"><ph-buildings />add a cluster for a boundary</span>
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
.mode__note { margin-top: auto; font-size: 0.95rem; color: var(--p-fg-muted); border-top: 1px dashed var(--p-border); padding-top: 0.7rem; }
.gates { display: flex; align-items: center; gap: 0.9rem; margin-top: 1.6rem; }
.gates .gpu-caption { margin-right: 0.4rem; }
.gate { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.95rem; border-radius: 999px; background: var(--p-bg-elevated); border: 1px solid var(--p-border); font-size: 1.1rem; color: var(--p-fg); }
.gate svg { color: var(--p-primary); font-size: 1.2rem; }
.gates__sep { color: var(--p-fg-subtle); font-size: 1.1rem; }
</style>

<!--
[1.5 min] Answer to question one. Do not add a cluster because it feels tidy. Add one when a customer, a region or an environment needs its own boundary: data and access for a customer, a failure domain for a region, a safe place to change things first for an environment. This is a judgement call and the workshop takes no position on how many you need. It takes the position that once you have more than one, you need them to be alike. The three tracks are only pictures of one boundary each.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What is the smallest unit you can repeat?</h1>
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
[0.5 min] Question two. The answer is small on purpose.
-->

---

# One component describes a cluster and its baseline as a single resource.

<div class="zoom-content">

<div class="compose">
  <div class="compose__stack">
    <div class="gpu-caption">FleetCluster component</div>
    <div class="piece piece--mixin" v-click="3"><ph-folder-open />baseline · namespace platform</div>
    <div class="piece piece--sandbox" v-click="2"><ph-link />fleet member · update group</div>
    <div class="piece piece--template" v-click="1"><ph-cube />AKS managed cluster</div>
  </div>
  <ul class="rules" v-click="4">
    <li><ph-package /><span>One Pulumi IaC component, one resource in the stack</span></li>
    <li><ph-cube /><span>It creates the AKS cluster</span></li>
    <li><ph-link /><span>It joins the cluster to the fleet</span></li>
    <li><ph-sliders-horizontal /><span>Version and group arrive as config</span></li>
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
</style>

<!--
[1.5 min] The smallest unit worth repeating is a cluster plus its baseline. In our demo that is one Pulumi IaC component, named FleetCluster, with three parts: the AKS managed cluster, its membership in a fleet with an update group, and a baseline namespace called platform. The Pulumi docs describe a component as "a logical grouping of Pulumi resources that is exposed as a single Pulumi resource" (https://www.pulumi.com/docs/iac/concepts/components/, read 2026-11-20). The stack sees one resource. Kubernetes version and group are inputs, so one definition produces canary and non-canary clusters. We show no program code on slides. The code is in the repo, folder 05-fleet-cluster.
-->

---

# Each cluster is its own stack, with its own state and its own configuration.

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-package class="zone__icon" /><div class="gpu-caption gpu-caption--accent">One component</div></div>
    <ul class="zone__list">
      <li><ph-cube /><span>The same definition for every cluster</span></li>
      <li><ph-sliders-horizontal /><span>Version and group are config</span></li>
      <li><ph-link /><span>Fleet membership is part of it</span></li>
      <li><ph-folder-open /><span>Baseline namespace is part of it</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrow-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-stack class="zone__icon" /><div class="gpu-caption">Three stacks</div></div>
    <ul class="zone__list">
      <li><ph-cube /><span>canary-1</span></li>
      <li><ph-cube /><span>rest-1</span></li>
      <li><ph-cube /><span>rest-2</span></li>
      <li><ph-scroll /><span>Own state and config each</span></li>
    </ul>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">The Pulumi docs say</div>
  <p>A stack is "an isolated, independently configurable instance of a Pulumi program".</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.setup { display: grid; grid-template-columns: 1fr auto 1fr; align-items: stretch; gap: 1.25rem; }
.zone__head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.1rem; }
.zone__icon { font-size: 1.6rem; color: var(--p-primary); }
.zone--cloud .zone__icon { color: var(--p-fg-muted); }
.zone__list { list-style: none; padding: 0; margin: 0; }
.zone__list li { display: flex; align-items: center; gap: 0.8rem; margin: 0 0 0.85rem; }
.zone__list li:last-child { margin-bottom: 0; }
.zone__list li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
.setup__link { display: flex; align-items: center; font-size: 2.2rem; color: var(--p-accent); }
.zone--cloud { display: flex; flex-direction: column; }
</style>

<!--
[1.5 min] One program, three stacks: canary-1, rest-1 and rest-2. The Pulumi docs define a stack as "an isolated, independently configurable instance of a Pulumi program" (https://www.pulumi.com/docs/iac/concepts/stacks/, read 2026-11-20). Each stack has its own state and its own config, so one bad change cannot silently touch the other two. The cost is that you now need something to run many stacks in order. That comes in question five.
-->

---

# Two questions answered, four to go.

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-buildings class="step-icon" /><div class="gpu-caption gpu-caption--accent">One cluster</div><p>A boundary: customer, region or environment</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--accent">Unit</div><p>One component, one stack per cluster</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-key class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Access</div><p>How do clusters get credentials and config without copied secrets?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-warning class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Guard</div><p>What stops a bad cluster from shipping?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-list-numbers class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Order</div><p>How do you roll out a change in a safe order?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-trash class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Remove</div><p>How do you remove it all?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
[1 min] Recap. Two answered: a boundary decides when you add a cluster, and one component with one stack per cluster is the unit you repeat. Four to go, starting with credentials.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How do clusters get credentials and config without copied secrets?</h1>
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
[0.5 min] Question three.
-->

---

# The stack asks Pulumi ESC for short-lived Azure credentials over OIDC, so no secret is copied.

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-stack class="chain__icon" />
    <div class="gpu-caption">Stack</div>
    <span>Lists an ESC environment</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-vault class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Pulumi ESC</div>
    <code>azure-login</code>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-cloud-check class="chain__icon" />
    <div class="gpu-caption">Azure</div>
    <span>Trusts the OIDC token</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>The credentials are short-lived and never copied into a stack.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-key /><p>ARM_* variables feed the Azure provider</p></div>
  <div class="fact"><ph-sliders-horizontal /><p>pulumiConfig values reach the program as config</p></div>
  <div class="fact"><ph-cloud /><p>ESC needs the Pulumi Cloud backend</p></div>
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
.fact p { margin: 0 !important; font-size: 1.05rem; line-height: 1.35; }
</style>

<!--
[1.5 min] The stack lists a Pulumi ESC environment. That environment uses the azure-login provider with OIDC turned on, and returns short-lived Azure credentials that the Azure provider reads through the ARM_ variables. Source: https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/azure-login/ (read 2026-11-20). Values under pulumiConfig reach the program as config, and ESC requires the Pulumi Cloud backend for the stack (https://www.pulumi.com/docs/esc/integrations/infrastructure/pulumi-iac/, read 2026-11-20). That last point is why the demo stacks use Pulumi Cloud for state. Step 1 of the demo creates the Azure side of this trust.
-->

---

# One shared environment holds the login, and each cluster's environment imports it.

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-vault class="plan__icon" />
    <p>fleet/azure-base holds the Azure login, region and VM size</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-arrows-split class="plan__icon" />
    <p>canary-1, rest-1 and rest-2 import the base</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-sliders-horizontal class="plan__icon" />
    <p>Each sets its own group and version; its own values win</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-stack class="plan__icon" />
    <p>The stack lists its environment</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p><strong>Change the region once:</strong> it lives only in fleet/azure-base.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.9rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
[1.5 min] Four environments in a project called fleet. One shared base holds the Azure OIDC login, the region and the VM size. Three per-cluster environments import it and add the update group and the Kubernetes version. The Pulumi docs say the current environment's values win over imported ones (https://www.pulumi.com/docs/esc/environments/imports/, read 2026-11-20). Practical effect: moving the whole fleet to another region is one edit in azure-base. Step 2 builds all four.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What stops a bad cluster from shipping?</h1>
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
[0.5 min] Question four.
-->

---

# A mandatory policy pack fails the preview before the cluster exists.

<div class="zoom-content">

<div class="bounds">
  <div class="bound" v-click><ph-cube /><div class="bound__want">an unsupported version</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">aks-supported-version: 1.35 or 1.36</div></div>
  <div class="bound" v-click><ph-shield-check /><div class="bound__want">a cluster without RBAC</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">aks-rbac-enabled</div></div>
  <div class="bound" v-click><ph-seal-check /><div class="bound__want">an untagged cluster</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">aks-fleet-tag: fleet=workshop</div></div>
  <div class="bound" v-click><ph-wrench /><div class="bound__want">a bigger node pool</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">aks-one-small-pool: one pool, one node</div></div>
  <div class="bound" v-click><ph-gavel /><div class="bound__want">any broken rule</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Mandatory: the update does not proceed</div></div>
  <div class="bound" v-click><ph-eye /><div class="bound__want">a bad cluster in Azure</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">The pack runs on preview, before it ships</div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.bounds { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem 1.4rem; }
.bound { display: grid; grid-template-columns: auto 11rem auto 1fr; align-items: center; gap: 0.7rem; padding: 0.8rem 1rem; border: 1.5px solid var(--p-border); border-radius: 14px; background: var(--p-bg-elevated); }
.bound > svg:first-child { font-size: 1.5rem; color: var(--p-primary); }
.bound__want { font-family: var(--slidev-font-mono); font-size: 0.92rem; font-weight: 600; color: var(--p-fg-muted); }
.bound__arrow { font-size: 1.1rem; color: var(--p-accent); }
.bound__by { font-size: 1.05rem; line-height: 1.3; color: var(--p-fg); }
</style>

<!--
[1.5 min] The guard is a Pulumi Policies pack called fleet-baseline, with four rules, all mandatory: supported Kubernetes version, RBAC on, a fleet tag, and one small node pool as a cost guard. The enforcement levels are advisory, mandatory, remediate and disabled. A mandatory policy blocks an update from proceeding, and enforcement runs during preview and update (https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/, read 2026-11-20). So the bad cluster fails at preview, before anything reaches Azure. Step 4 shows this with a Kubernetes version the pack does not allow.
-->

---

# Four questions answered, two to go.

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-buildings class="step-icon" /><div class="gpu-caption gpu-caption--accent">One cluster</div><p>A boundary: customer, region or environment</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--accent">Unit</div><p>One component, one stack per cluster</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">Access</div><p>Pulumi ESC with an Azure OIDC login</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-shield-warning class="step-icon" /><div class="gpu-caption gpu-caption--accent">Guard</div><p>A mandatory policy pack on preview</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-list-numbers class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Order</div><p>How do you roll out a change in a safe order?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-trash class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Remove</div><p>How do you remove it all?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
[1 min] Recap. Four answered: the boundary, the repeatable unit, credentials through Pulumi ESC and OIDC, and a mandatory policy pack. Two to go: the rollout order and the removal.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How do you roll out a change in a safe order?</h1>
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
[0.5 min] Question five. Two tools answer it, at two different times.
-->

---

# The Automation API runs the cluster stacks in waves: the canary first, then the rest.

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-file-code class="plan__icon" />
    <p>A Node.js driver creates or selects each stack</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-cube class="plan__icon" />
    <p>Wave 1: canary-1 on its own</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-arrows-split class="plan__icon" />
    <p>Wave 2: rest-1 and rest-2 in parallel</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-check-circle class="plan__icon" />
    <p>Outputs return to the driver</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-warning class="plan__foot-icon" />
  <p><strong>Alpha:</strong> LocalWorkspace is marked Alpha in the Node.js reference, and the API needs the Pulumi CLI at runtime.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.9rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
[1.5 min] The Pulumi Automation API drives the Pulumi engine from a program, and it needs the Pulumi CLI at runtime (https://www.pulumi.com/docs/iac/concepts/automation-api/, read 2026-11-20). Our driver is a small Node.js program: wave 1 creates canary-1, wave 2 creates rest-1 and rest-2 in parallel. Say this plainly: LocalWorkspace is marked Alpha in the Node.js reference, version 3.277.0 (https://www.pulumi.com/docs/reference/pkg/nodejs/pulumi/pulumi/classes/automation.LocalWorkspace.html, read 2026-11-20). This ordering covers creating the stacks. The upgrade order is the next slide.
-->

---

# Fleet Manager upgrades the clusters in stages and groups, with a wait between the stages.

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-clock class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Stage 1: canary</div></div>
    <ul class="zone__list">
      <li><ph-cube /><span>Group canary</span></li>
      <li><ph-link /><span>Member canary-1</span></li>
      <li><ph-clock /><span>Then wait 60 seconds</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrow-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-stack class="zone__icon" /><div class="gpu-caption">Stage 2: rest</div></div>
    <ul class="zone__list">
      <li><ph-cube /><span>Group rest</span></li>
      <li><ph-link /><span>Members rest-1 and rest-2</span></li>
      <li><ph-check-circle /><span>Run reports Completed</span></li>
    </ul>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">How update runs work</div>
  <p>Stages apply one after the other. Groups inside a stage update in parallel.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.setup { display: grid; grid-template-columns: 1fr auto 1fr; align-items: stretch; gap: 1.25rem; }
.zone__head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.1rem; }
.zone__icon { font-size: 1.6rem; color: var(--p-primary); }
.zone--cloud .zone__icon { color: var(--p-fg-muted); }
.zone__list { list-style: none; padding: 0; margin: 0; }
.zone__list li { display: flex; align-items: center; gap: 0.8rem; margin: 0 0 0.85rem; }
.zone__list li:last-child { margin-bottom: 0; }
.zone__list li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
.setup__link { display: flex; align-items: center; font-size: 2.2rem; color: var(--p-accent); }
.zone--cloud { display: flex; flex-direction: column; }
</style>

<!--
[1.5 min] Azure Kubernetes Fleet Manager has update runs made of stages, groups and strategies. Stages apply sequentially, groups in a stage update in parallel, and wait times and gates are available (https://learn.microsoft.com/en-us/azure/kubernetes-fleet/concepts-update-orchestration, read 2026-11-20). Our strategy is called two-waves: stage canary, group canary, wait 60 seconds, then stage rest, group rest. The group names in the strategy have to match the groups the cluster members are created with. Fleet Manager overview: https://learn.microsoft.com/en-us/azure/kubernetes-fleet/overview.
-->

---

# Three limits shape the design: an Alpha LocalWorkspace, a fixed agent pool and a fleet without a hub.

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">In the tools</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>LocalWorkspace in the Automation API is marked Alpha</li>
      <li>A fleet without a hub has no workload placement</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">In the cluster</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li><code>agentPoolProfiles</code> cannot be updated directly</li>
      <li>So the demo never changes the pool after creation</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1.5 min] Where this breaks today. One: LocalWorkspace, the class the driver uses, is marked Alpha in the Node.js reference, so pin the version and expect change. Two: the registry page for ManagedCluster says agentPoolProfiles cannot be updated directly, so the demo never changes the pool after the cluster exists (https://www.pulumi.com/registry/packages/azure-native/api-docs/containerservice/managedcluster/, read 2026-11-20). Three: a fleet without a hub cluster supports Kubernetes and node image updates, has no workload placement, and costs nothing (https://learn.microsoft.com/en-us/azure/kubernetes-fleet/concepts-choosing-fleet, read 2026-11-20). We chose the hubless fleet on purpose. If you need placement, that is a different design.
-->

---

# Five questions answered, one to go.

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-buildings class="step-icon" /><div class="gpu-caption gpu-caption--accent">One cluster</div><p>A boundary: customer, region or environment</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--accent">Unit</div><p>One component, one stack per cluster</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">Access</div><p>Pulumi ESC with an Azure OIDC login</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-shield-warning class="step-icon" /><div class="gpu-caption gpu-caption--accent">Guard</div><p>A mandatory policy pack on preview</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-list-numbers class="step-icon" /><div class="gpu-caption gpu-caption--accent">Order</div><p>Waves, then an update run in stages</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-trash class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Remove</div><p>How do you remove it all?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
[1 min] Five answered. The last question, how you remove it all, is the last thing the demo does. Everything we just covered is what we are about to build.
-->

---

# The fleet we will build is one core stack, three cluster stacks and one update run.

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Core stack fleet-core</div></div>
    <ul class="zone__list">
      <li><ph-folder-open /><span>Resource group rg-fleet-workshop</span></li>
      <li><ph-link /><span>Fleet fleet-workshop, no hub</span></li>
      <li><ph-list-numbers /><span>Strategy two-waves</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrow-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-stack class="zone__icon" /><div class="gpu-caption">Cluster stacks</div></div>
    <ul class="zone__list">
      <li><ph-cube /><span>canary-1</span></li>
      <li><ph-cube /><span>rest-1</span></li>
      <li><ph-cube /><span>rest-2</span></li>
      <li><ph-rocket-launch /><span>Update run: 1.35 to 1.36</span></li>
    </ul>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">The update run</div>
  <p>It lives in its own stack, upgrade, and moves the three clusters from 1.35 to 1.36.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.setup { display: grid; grid-template-columns: 1fr auto 1fr; align-items: stretch; gap: 1.25rem; }
.zone__head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.1rem; }
.zone__icon { font-size: 1.6rem; color: var(--p-primary); }
.zone--cloud .zone__icon { color: var(--p-fg-muted); }
.zone__list { list-style: none; padding: 0; margin: 0; }
.zone__list li { display: flex; align-items: center; gap: 0.8rem; margin: 0 0 0.85rem; }
.zone__list li:last-child { margin-bottom: 0; }
.zone__list li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
.setup__link { display: flex; align-items: center; font-size: 2.2rem; color: var(--p-accent); }
.zone--cloud { display: flex; flex-direction: column; }
</style>

<!--
[2 min] The picture of what the demo ends with. A core stack, fleet-core, holds the resource group, a fleet without a hub and the update strategy two-waves. Three cluster stacks are made from the one component: canary-1, rest-1 and rest-2, each on Kubernetes 1.35. One update run, in a stack called upgrade, moves them to 1.36: canary first, then the rest after 60 seconds. AKS 1.35 is supported until Mar 2027 and 1.36 until Jun 2027; 1.37 is GA (https://learn.microsoft.com/en-us/azure/aks/supported-kubernetes-versions, read 2026-11-20). The demo was not run live when these slides were written, so every end state on the next slides comes from the demo README.
-->

---

# Six numbered folders hold the whole demo, in run order.

<div class="zoom-content">

<div class="compose">
  <div class="compose__stack">
    <div class="gpu-caption">Run order, bottom to top</div>
    <div class="piece piece--sandbox" v-click="6"><ph-rocket-launch />06-update-run</div>
    <div class="piece piece--template" v-click="5"><ph-cube />05-fleet-cluster</div>
    <div class="piece piece--template" v-click="4"><ph-gavel />04-fleet-policies</div>
    <div class="piece piece--template" v-click="3"><ph-cloud />03-fleet-core</div>
    <div class="piece piece--template" v-click="2"><ph-vault />02-esc</div>
    <div class="piece piece--template" v-click="1"><ph-key />01-subscription</div>
  </div>
  <ul class="rules" v-click="7">
    <li><ph-key /><span>01 and 02 are the once-only setup</span></li>
    <li><ph-cloud /><span>03 deploys the fleet core</span></li>
    <li><ph-gavel /><span>04 holds the policy pack</span></li>
    <li><ph-cube /><span>05 holds the component and the driver</span></li>
    <li><ph-rocket-launch /><span>06 holds the update run</span></li>
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
</style>

<!--
[1.5 min] The repo layout follows the demo flow. 01-subscription prepares the Azure side. 02-esc creates the four ESC environments. 03-fleet-core is the fleet. 04-fleet-policies is the policy pack. 05-fleet-cluster holds the component and the Automation API driver, and serves steps 5, 6, 8 and 9. 06-update-run is the update run. Nine steps run on six folders, and step 9 also touches 06, 03, 02 and 01 in reverse. The driver lives next to the component because an inline program has to load the same copy of the Pulumi SDK as the component it runs.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Kubernetes cluster fleet as code.</h1>
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
[0.5 min] Divider. Switch to the terminal and the editor. The demo was not run live when the deck was written, so keep the backups ready: the recorded run of step 7, 06-update-run/fallback-az.sh, and LOCATION=swedencentral for step 2.
-->

---

# Nine steps take three clusters from nothing to upgraded to gone.

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><span class="step__num">1</span><ph-key class="step__icon" /><p>The subscription trusts Pulumi ESC</p></div>
  <div class="gpu-card step" v-click><span class="step__num">2</span><ph-vault class="step__icon" /><p>Four ESC environments hold the config</p></div>
  <div class="gpu-card step" v-click><span class="step__num">3</span><ph-cloud class="step__icon" /><p>The fleet core and its two-stage strategy</p></div>
  <div class="gpu-card gpu-card--accent step" v-click><span class="step__num">4</span><ph-shield-warning class="step__icon" /><p>A bad version stops at preview</p></div>
  <div class="gpu-card step" v-click><span class="step__num">5</span><ph-cube class="step__icon" /><p>Wave 1 builds the canary</p></div>
  <div class="gpu-card step" v-click><span class="step__num">6</span><ph-arrows-split class="step__icon" /><p>Wave 2 builds the other two</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><span class="step__num">7</span><ph-rocket-launch class="step__icon" /><p>One update run upgrades to 1.36</p></div>
  <div class="gpu-card step" v-click><span class="step__num">8</span><ph-check-circle class="step__icon" /><p>Reconcile shows no diff</p></div>
  <div class="gpu-card step" v-click><span class="step__num">9</span><ph-trash class="step__icon" /><p>Teardown leaves nothing behind</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.1; }
.steps { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.8rem 1.2rem; }
.step { display: flex; flex-direction: row; align-items: center; gap: 0.9rem; padding: 0.7rem 1.1rem; }
.step p { margin: 0 !important; font-size: 1.15rem; line-height: 1.3; }
.step__icon { flex-shrink: 0; font-size: 1.8rem; color: var(--p-primary); }
.step__num { flex-shrink: 0; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
</style>

<!--
[2 min] Walk the nine outcomes. One: the subscription trusts Pulumi ESC. Two: four ESC environments hold the config. Three: the fleet core and its strategy. Four: a bad version stops at preview. Five and six: the canary, then the other two. Seven: one update run upgrades all three to 1.36. Eight: reconcile shows no diff. Nine: teardown leaves nothing behind. Steps 1 and 2 are the once-only setup, steps 3 to 8 are the run, step 9 resets everything. Cost, if asked: the README estimates about $1.49 for three clusters over three hours, from retail prices in the Azure retail price API read 2026-11-20. That figure was not confirmed in the Azure Pricing Calculator, so call it an estimate. Presenter prerequisites: a dry run of steps 1 to 9 the day before and a recorded run of step 7.
-->

---

# Step 1: The Azure subscription trusts Pulumi ESC through a federated credential.

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
01-subscription/prepare.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-user-gear /><span>An Entra app registration appears</span></li>
    <li><ph-key /><span>It carries a federated credential for ESC</span></li>
    <li><ph-shield-check /><span>It holds Contributor on the subscription</span></li>
    <li><ph-paper-plane-tilt /><span>The script prints three values to export</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.45fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; white-space: pre-wrap; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[3.5 min] Run 01-subscription/prepare.sh. Set expectations first: PULUMI_ORG must be exported, and the Azure CLI must be logged in with rights to create an app registration and a role assignment. What you should see: an app registration with a federated credential for Pulumi ESC and Contributor on the subscription, then three values printed: client id, tenant id and subscription id. Export all three. The proof that the trust works comes after step 2, because it needs the base environment: pulumi env open $PULUMI_ORG/fleet/azure-base returns the ARM_ values. Say that now so nobody waits for it here. The demo was not run live when the deck was written, so describe this from the README, not from a measured result. If the Azure CLI is not logged in, stop and log in; do not improvise.
-->

---

# Step 2: Four ESC environments give each cluster its merged configuration.

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
02-esc/create.sh
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-vault /><div><div class="gpu-caption gpu-caption--accent">1 · azure-base</div><span>Azure OIDC login, region, VM size</span></div></div>
  <div class="gpu-card check" v-click><ph-cube /><div><div class="gpu-caption gpu-caption--accent">2 · canary-1</div><span>Imports the base, group canary</span></div></div>
  <div class="gpu-card check" v-click><ph-cube /><div><div class="gpu-caption gpu-caption--accent">3 · rest-1</div><span>Imports the base, group rest</span></div></div>
  <div class="gpu-card check" v-click><ph-cube /><div><div class="gpu-caption gpu-caption--accent">4 · rest-2</div><span>Imports the base, group rest</span></div></div>
  <div class="gpu-card check" v-click><ph-eye /><div><div class="gpu-caption gpu-caption--accent">5 · Proof</div><code>pulumi env open $PULUMI_ORG/fleet/canary-1</code></div></div>
  <div class="gpu-card check" v-click><ph-globe /><div><div class="gpu-caption gpu-caption--accent">6 · Region</div><span>Lives only in azure-base</span></div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.checks { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.9rem; }
.checks__cmd { margin-bottom: 1.1rem; }
.checks__cmd pre { margin: 0 !important; white-space: pre-wrap; }
.check { display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.2rem; }
.check > svg { flex-shrink: 0; font-size: 1.9rem; color: var(--p-primary); }
.check code { display: inline-block; margin-top: 0.4rem; font-size: 0.9rem !important; background: var(--p-bg) !important; }
.check span { display: inline-block; margin-top: 0.4rem; font-size: 1rem; line-height: 1.3; }
</style>

<!--
[4 min] Run 02-esc/create.sh. The script creates fleet/azure-base and then fleet/canary-1, fleet/rest-1 and fleet/rest-2. Each cluster environment imports the base and sets its update group and the starting Kubernetes version, 1.35. What you should see: the script prints each environment as it creates it and ends with pulumi env get for canary-1, which shows the merged config with secrets hidden. To show the resolved values, run pulumi env open $PULUMI_ORG/fleet/canary-1, then, as the step 1 proof, pulumi env open $PULUMI_ORG/fleet/azure-base, which returns the ARM_ values. env open prints live credentials, so do not leave it on screen. Fallback: if Standard_D2ds_v5 has no capacity in westeurope, run LOCATION=swedencentral 02-esc/create.sh instead; the region lives only in the base environment. Not run live when the deck was written, so say "you should see", not "we saw".
-->

---

# Step 3: One pulumi up creates the fleet and its two-stage update strategy.

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
cd 03-fleet-core && npm ci && pulumi stack init $PULUMI_ORG/fleet && pulumi up
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-folder-open /><span>A resource group, rg-fleet-workshop</span></li>
    <li><ph-link /><span>A fleet without a hub, fleet-workshop</span></li>
    <li><ph-list-numbers /><span>Update strategy two-waves</span></li>
    <li><ph-check-circle /><span>A fleet without a hub costs nothing</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.45fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; white-space: pre-wrap; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[4.5 min] The one command is a chain: npm ci, a stack init under your Pulumi Cloud organization, and pulumi up. Read the preview aloud before you approve it: a resource group, a fleet and an update strategy. What you should see after the update: fleet fleet-workshop and strategy two-waves exist. Check with az fleet show --resource-group rg-fleet-workshop --name fleet-workshop. The fleet has no hub cluster, which the Microsoft Learn page says costs nothing and has no workload placement (https://learn.microsoft.com/en-us/azure/kubernetes-fleet/concepts-choosing-fleet, read 2026-11-20). Not run live when the deck was written.
-->

---

# Step 4: A bad Kubernetes version stops at preview.

<div class="zoom-content">

<div class="s5__cmd big-code code-sm">

```bash
(cd 04-fleet-policies && npm ci) && (cd 05-fleet-cluster && npm ci) && 04-fleet-policies/try-bad-version.sh
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-sliders-horizontal /><span>The script sets an unsupported Kubernetes version</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-eye /><span>Preview runs the fleet-baseline pack</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-shield-warning /><span>Preview fails: mandatory aks-supported-version</span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Then it cleans up</div><p>The script puts 1.35 back, even on failure.</p></aside>
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
.s5__side .info-card { margin-top: 0; }
</style>

<!--
[4.5 min] This is question four, live. The script creates the canary-1 stack if needed, sets the Kubernetes version to 1.33 in the canary-1 environment, runs pulumi preview with the fleet-baseline pack, and expects a non-zero exit. What you should see: the preview fails with a mandatory violation of aks-supported-version, and nothing is created in Azure. The script restores 1.35 in the environment afterwards, also on failure or Ctrl-C. Point at the policy name in the output and tie it back to the boundaries slide. Not run live when the deck was written, so the exact output text is unverified; read it from the screen.
-->

---

# Step 5: Wave 1 creates one canary cluster at Kubernetes 1.35.

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
cd 05-fleet-cluster && npm run build && node bin/rollout.js wave 1
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-cube /><span>One AKS cluster at 1.35</span></li>
    <li><ph-link /><span>In the fleet, group canary</span></li>
    <li><ph-folder-open /><span>Namespace platform is present</span></li>
    <li><ph-note-pencil /><span>Outputs are printed</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.45fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; white-space: pre-wrap; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[5.5 min] The driver builds the component, then wave 1 creates the canary-1 stack through the Automation API. Cluster creation is the slow part, so use the wait: say what the driver does, which is create or select the stack, set config, preview, up, read outputs. What you should see at the end: one AKS cluster at 1.35 in the fleet, in group canary, with the namespace platform present, and the outputs printed. Not run live when the deck was written. If time runs short, say so and move on to the recorded run of step 7 later; do not skip step 6.
-->

---

# Step 6: Wave 2 creates the other two clusters in parallel.

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
node bin/rollout.js wave 2
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-cube /><div><div class="gpu-caption gpu-caption--accent">1 · rest-1</div><span>Created in wave 2</span></div></div>
  <div class="gpu-card check" v-click><ph-cube /><div><div class="gpu-caption gpu-caption--accent">2 · rest-2</div><span>Created in parallel with rest-1</span></div></div>
  <div class="gpu-card check" v-click><ph-list-numbers /><div><div class="gpu-caption gpu-caption--accent">3 · Members</div><span>Three in the fleet</span></div></div>
  <div class="gpu-card check" v-click><ph-folder-open /><div><div class="gpu-caption gpu-caption--accent">4 · Groups</div><span>Two: canary and rest</span></div></div>
  <div class="gpu-card check" v-click><ph-check-circle /><div><div class="gpu-caption gpu-caption--accent">5 · Version</div><span>All three at 1.35</span></div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.checks { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.9rem; }
.checks__cmd { margin-bottom: 1.1rem; }
.checks__cmd pre { margin: 0 !important; white-space: pre-wrap; }
.check { display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.2rem; }
.check > svg { flex-shrink: 0; font-size: 1.9rem; color: var(--p-primary); }
.check code { display: inline-block; margin-top: 0.4rem; font-size: 0.9rem !important; background: var(--p-bg) !important; }
.check span { display: inline-block; margin-top: 0.4rem; font-size: 1rem; line-height: 1.3; }
</style>

<!--
[4.5 min] Run from 05-fleet-cluster. Wave 2 creates rest-1 and rest-2 in parallel. What you should see: az fleet member list --resource-group rg-fleet-workshop --fleet-name fleet-workshop -o table shows three members in two groups, all at 1.35. Ask the room to read the table with you. Not run live when the deck was written. Tie back to the Automation API slide: wave 2 is where parallel creation pays off.
-->

---

# Step 7: One update run moves the canary first and the rest 60 seconds later.

<div class="zoom-content">

<div class="s5__cmd big-code code-sm">

```bash
cd 06-update-run && npm ci && pulumi stack init $PULUMI_ORG/upgrade && pulumi up && ./start.sh
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-rocket-launch /><span>Stage canary: canary-1 goes to 1.36</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-clock /><span>The run waits 60 seconds</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step" v-click="3"><ph-arrows-split /><span>Stage rest: rest-1 and rest-2 go to 1.36</span></div>
    <ph-arrow-down class="s5__arrow" v-click="4" />
    <div class="s5__step s5__step--stop" v-click="4"><ph-check-circle /><span>The run reports Completed</span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="5"><div class="info-card__label">End state</div><p>All three clusters are on 1.36 and the run is Completed.</p></aside>
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
.s5__side .info-card { margin-top: 0; }
</style>

<!--
[8 min] The longest step and the least tested piece. pulumi up creates the UpdateRun resource, and start.sh starts the run and follows it. What you should see: canary reaches 1.36, the run waits 60 seconds, then both rest clusters reach 1.36 and the run reports Completed. Upgrades take several minutes per cluster, so talk through the strategy while it runs. Fallbacks, in order. One: if the run takes too long, play the recorded run of step 7; keep the wait at 60 seconds. Two: if the UpdateRun resource misbehaves, run 06-update-run/fallback-az.sh instead of pulumi up in that folder. It creates and starts the same run with az fleet updaterun create and start. Three: if the demo needs another region, the swedencentral switch is in step 2. Be honest if you fall back: the Pulumi UpdateRun resource was not run live when the deck was written.
-->

---

# Step 8: After the upgrade, reconcile leaves no diff on any stack.

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
cd 05-fleet-cluster && node bin/rollout.js reconcile --version 1.36
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-arrows-clockwise /><span>Refresh reads the real versions</span></li>
    <li><ph-sliders-horizontal /><span>Then 1.36 goes into the ESC environments</span></li>
    <li><ph-eye /><span>Then preview runs on every stack</span></li>
    <li><ph-check-circle /><span>No diff on all three stacks</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.45fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; white-space: pre-wrap; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[4 min] The update run changed the clusters outside the Pulumi stacks, so the stacks and the environments still say 1.35. Reconcile fixes the record in order: refresh, then set 1.36 in the ESC environments, then preview. What you should see: no diff on all three stacks. If a stack shows a diff, read it aloud and treat it as a finding. Not run live when the deck was written.
-->

---

# Step 9: Teardown runs in reverse order and leaves nothing behind.

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
(cd 06-update-run && pulumi destroy --stack "$PULUMI_ORG/upgrade")
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-rocket-launch /><div><div class="gpu-caption gpu-caption--accent">1 · Update run</div><span>The command above</span></div></div>
  <div class="gpu-card check" v-click><ph-cube /><div><div class="gpu-caption gpu-caption--accent">2 · Cluster stacks</div><span>rest-1 and rest-2, then canary-1</span></div></div>
  <div class="gpu-card check" v-click><ph-cloud /><div><div class="gpu-caption gpu-caption--accent">3 · Fleet core</div><span>Fleet, strategy, resource group</span></div></div>
  <div class="gpu-card check" v-click><ph-vault /><div><div class="gpu-caption gpu-caption--accent">4 · ESC environments</div><span>All four removed</span></div></div>
  <div class="gpu-card check" v-click><ph-key /><div><div class="gpu-caption gpu-caption--accent">5 · App registration</div><span>Removed from Microsoft Entra</span></div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.checks { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.9rem; }
.checks__cmd { margin-bottom: 1.1rem; }
.checks__cmd pre { margin: 0 !important; white-space: pre-wrap; }
.check { display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.2rem; }
.check > svg { flex-shrink: 0; font-size: 1.9rem; color: var(--p-primary); }
.check code { display: inline-block; margin-top: 0.4rem; font-size: 0.9rem !important; background: var(--p-bg) !important; }
.check span { display: inline-block; margin-top: 0.4rem; font-size: 1rem; line-height: 1.3; }
</style>

<!--
[4 min] Question six, answered last. Run the five teardown commands in this order, because each stack needs the ESC environment and the fleet that come after it. One: (cd 06-update-run && pulumi destroy --stack "$PULUMI_ORG/upgrade"). Two: (cd 05-fleet-cluster && node bin/rollout.js destroy), which removes rest-1 and rest-2 in parallel, then canary-1. Three: (cd 03-fleet-core && pulumi destroy --stack "$PULUMI_ORG/fleet"). Four: 02-esc/delete.sh. Five: 01-subscription/cleanup.sh. The slide shows the first command; type the rest. What you should see: the resource group is gone, az aks list returns nothing, and no ESC environment and no app registration is left. Not run live when the deck was written. After this, the whole demo can start again at step 1. Then show the six-question grid one more time in the closing and say all six are answered.
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-4 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/kubernetes-cluster-fleet-as-code" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → kubernetes-cluster-fleet-as-code</div>
  </div>
  <div class="res-card">
    <QRCode data="https://learn.microsoft.com/en-us/azure/kubernetes-fleet/overview" dark="#000000" />
    <div class="res-card__title">Azure Kubernetes Fleet Manager overview</div>
    <div class="res-card__body">learn.microsoft.com/azure/kubernetes-fleet</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/iac/concepts/automation-api/" dark="#000000" />
    <div class="res-card__title">Pulumi Automation API</div>
    <div class="res-card__body">pulumi.com/docs/iac/concepts/automation-api</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/azure-login/" dark="#000000" />
    <div class="res-card__title">Pulumi ESC: Azure login</div>
    <div class="res-card__body">pulumi.com/docs/esc/.../azure-login</div>
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
[1 min] Resources: the workshop repo, the Azure Kubernetes Fleet Manager overview, the Pulumi Automation API docs and the Pulumi ESC Azure login page. Say the repo link resolves once the pull request is merged.
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
[0.5 min] Three next steps: the Pulumi Community Slack, a Pulumi Cloud account, and the next workshops in the handouts tab.
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/kubernetes-cluster-fleet-as-code" dark="#000000" /></div>
      <div class="thanks__qr-label">kubernetes-cluster-fleet-as-code</div>
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
[10 min] Questions. Bring back the six questions and say all six are answered: a boundary, one component with one stack per cluster, Pulumi ESC with OIDC, a mandatory policy pack, waves and an update run, and teardown in reverse order. Mention once more that LocalWorkspace is marked Alpha. Point to the repo for the code.
-->
