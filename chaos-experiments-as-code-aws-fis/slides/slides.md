---
theme: "@pulumi/slidev-theme"
title: "Chaos experiments as code with Pulumi IaC and AWS Fault Injection Service"
info: |
  Chaos experiments as code with Pulumi IaC and AWS Fault Injection Service: Define a chaos experiment as a Pulumi resource, run it on AWS, and block any experiment without a stop condition.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/chaos-experiments-as-code-aws-fis
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
    Chaos experiments as code with Pulumi IaC and AWS Fault Injection Service
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Define a chaos experiment as a Pulumi resource, run it on AWS, and block any experiment without a stop condition
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
[0.5 min] Welcome. Title and promise: in 90 minutes you define a chaos experiment as a Pulumi resource with a stop condition, run it on AWS, and block any experiment without one.
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
[0.5 min] Speaker TBD. Introduce yourself and say who you build this for: platform engineers and SREs who run services on AWS.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
[0.5 min] Housekeeping and agenda coming up.
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
[0.5 min] Housekeeping. Sandbox AWS account only, budget 5 USD, remind about the ALB hourly cost and the teardown step at the end.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>Why manual chaos fails</li>
  <li>Fault injection and Pulumi</li>
  <li>The solution we build</li>
  <li>Demo: experiments as code</li>
  <li>Wrap-up and Q&A</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
[0.5 min] Agenda: why manual chaos fails, fault injection and Pulumi, the solution, the demo, wrap-up. Act 1 is 15 minutes, Act 2 is 25, the demo is 50.
-->

---

# One hour of downtime costs more than $300,000

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">PlatformCon 2026, Jun 23</div>
    <p>"Over 90% of enterprises report that one hour of downtime costs more than $300,000, and in an outage, backups didn't save them."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>Talk: Beyond backups, DR-as-code, 15 minutes</li>
      <li>Speaker: Ido Neeman, co-founder and CEO of Firefly</li>
      <li>His point: if infrastructure is not codified end to end, the recovery time objective is a guess</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-warning class="psst__icon" />
  <span><strong>Read it as a vendor claim.</strong> The figure is the speaker's</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
[3 min] Open on the money. Read the quote, then say whose figure it is: a vendor speaker at PlatformCon, so treat it as a claim, not a measurement. Source: https://2026.platformcon.com/sessions/beyond-backups-building-cloud-resilience-with-dr-as-code (read 2026-10-23). Ask the room: who has run a recovery drill in the last year? Who has run a chaos experiment? Keep the hands-up under a minute.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">You can codify the recovery.</h1>
</div>

<!--
[1 min] Tension, line one. Teams write recovery plans and infrastructure as code. Pause after this line.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">You can't review the experiment that tests it.</h1>
</div>

<!--
[1 min] Tension, line two. Experiments are clicked together in a console, so nobody reviews them, limits live in someone's head, and there is no record. This is the gap the workshop closes.
-->

---

# A console experiment leaves nothing to review

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">In a console</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Clicks you cannot diff</li>
      <li>The limit lives in someone's head</li>
      <li>No record of what ran</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">As code</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>A diff a teammate reviews</li>
      <li>The stop condition is in the template</li>
      <li>Policy enforces it before deploy</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[2 min] Two columns, before and after. Game days and console clicks are how most teams start. They work once and cannot be repeated or audited. Say that as code gives us three things: review, a built-in limit, and enforcement.
-->

---

# Unmanaged experiments fail in three ways

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-target class="step-icon" /><div class="gpu-caption gpu-caption--accent">Blast radius</div><p>An experiment hits more than you meant</p></div>
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-git-diff class="step-icon" /><div class="gpu-caption gpu-caption--accent">Drift</div><p>Dev and prod run different experiments</p></div>
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-hourglass class="step-icon" /><div class="gpu-caption gpu-caption--accent">Stop rules</div><p>Nobody tested the limit before the incident</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[2 min] Three failure modes. Runaway blast radius: the target selector is too wide. Drift: each team clicks its own version. Untested stop rules: the safety limit exists on paper only. Each one maps to a piece of tech we cover.
-->

---

# You leave with a working safe experiment

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-flask class="step-icon" /><div class="gpu-caption gpu-caption--accent">A template</div><p>An FIS experiment as a Pulumi resource, with a stop condition</p></div>
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-puzzle-piece class="step-icon" /><div class="gpu-caption gpu-caption--accent">A component</div><p>One reusable, safe pattern for many experiments</p></div>
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-shield-check class="step-icon" /><div class="gpu-caption gpu-caption--accent">A gate</div><p>A policy that blocks any experiment without a stop condition</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[2 min] What participants take home: a working experiment template, a Pulumi component, and a policy pack. Mention the agenda on the previous slide: 25 minutes of tech, then the hands-on demo.
-->

---

# Six questions before you trust it

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-flask class="step-icon" /><div class="gpu-caption gpu-caption--muted">Resource</div><p>What does an experiment look like as a resource?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--muted">Login</div><p>How does the tool log in to AWS without stored keys?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-puzzle-piece class="step-icon" /><div class="gpu-caption gpu-caption--muted">Reuse</div><p>How do teams reuse one safe pattern?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-shield-check class="step-icon" /><div class="gpu-caption gpu-caption--muted">Gate</div><p>How do we block an experiment with no stop condition?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--muted">Fit</div><p>Where do Litmus and Chaos Mesh fit next to FIS?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-heartbeat class="step-icon" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>How do we know the stop condition works?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[2 min] These six questions are the spine of the talk. We answer one through five in the tech section and the sixth in the demo. Read them aloud once, slowly. They return at the recap slides and in the close.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Fault injection, in AWS terms.</h1>
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
[0.5 min] Section one: what an experiment is in AWS Fault Injection Service (AWS FIS).
-->

---

# A template holds actions, targets and stop conditions

<div class="zoom-content">

<div class="chain" style="grid-template-columns: 1fr auto 1fr auto 1fr;">
  <div class="gpu-card chain__node" v-click="1">
    <ph-lightning class="chain__icon" />
    <div class="gpu-caption">Actions</div>
    <span>What to break</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card chain__node" v-click="2">
    <ph-target class="chain__icon" />
    <div class="gpu-caption">Targets</div>
    <span>What to hit</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="3">
    <ph-bell-ringing class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Stop conditions</div>
    <span>When to quit</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>An experiment template is the blueprint. You start experiments from it.</p>
</aside>

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
[1.5 min] AWS FIS runs experiments from a template. The template has actions, targets and stop conditions. Source: AWS FIS user guide, what-is page. The same template is what we will deploy with Pulumi.
-->

---

# Four words decide the design

<div class="zoom-content">

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-gauge class="step-icon" /><div class="gpu-caption gpu-caption--muted">Steady state</div><p>What normal looks like, as a metric</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-flask class="step-icon" /><div class="gpu-caption gpu-caption--muted">Hypothesis</div><p>What you expect to stay true</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-target class="step-icon" /><div class="gpu-caption gpu-caption--muted">Blast radius</div><p>How much the experiment can touch</p></div>
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-bell-ringing class="step-icon" /><div class="gpu-caption gpu-caption--accent">Stop condition</div><p>The alarm that ends it early</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[1 min] Vocabulary, with the AWS definitions where they exist. Steady state is business or technical metrics such as latency or healthy hosts. Hypothesis and blast radius are the standard chaos engineering terms. Stop condition is an FIS feature.
-->

---

# Tags pick the targets, a mode picks how many

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-tag class="step-icon" /><div class="gpu-caption gpu-caption--accent">Tag</div><p><code>chaos-target=workshop</code> is the only selector</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-stack class="step-icon" /><div class="gpu-caption gpu-caption--muted">ARNs</div><p>Or list resources by ARN</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-hand-palm class="step-icon" /><div class="gpu-caption gpu-caption--muted">Mode</div><p><code>COUNT(1)</code> hits one task, <code>ALL</code> hits all</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[1 min] FIS selects resources by tags, by ARN or by filters, and a selection mode decides how many. The workshop uses one tag so an experiment cannot reach anything else in a shared account.
-->

---

# Two actions do all the work today

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">aws:ecs:stop-task</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Stops ECS tasks</li>
      <li>Needs the ECS access role</li>
      <li>Our fault</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">aws:fis:wait</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Waits one minute to 12 hours</li>
      <li>Needs no permissions</li>
      <li>Holds the fault open</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1 min] Both action ids appear in the FIS actions reference. stop-task is the fault. wait keeps the experiment running after the stop so the alarm has time to fire. In the all-tasks experiment the wait is five minutes.
-->

---

# A CloudWatch alarm is the stop condition

<div class="zoom-content">

<div class="chain" style="grid-template-columns: 1fr auto 1fr auto 1fr;">
  <div class="gpu-card chain__node" v-click="1">
    <ph-heartbeat class="chain__icon" />
    <div class="gpu-caption">Healthy targets</div>
    <span>ALB healthy host count</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-bell-ringing class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Alarm</div>
    <span>Below one for 60 seconds</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-stop class="chain__icon" />
    <div class="gpu-caption">FIS</div>
    <span>Stops the experiment</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>A stopped experiment cannot be resumed.</p>
</aside>

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
[1.5 min] Steady state turned into an alarm. In the demo: HealthyHostCount, minimum statistic, threshold one, period 60 seconds. When it fires FIS stops the experiment, and the docs say a stopped experiment cannot be resumed.
-->

---

# The experiment role gets one managed policy

<div class="zoom-content">

<div class="chain" style="grid-template-columns: 1fr auto 1fr auto 1fr;">
  <div class="gpu-card chain__node" v-click="1">
    <ph-cloud class="chain__icon" />
    <div class="gpu-caption">FIS service</div>
    <span>Assumes the role</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-key class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">IAM role</div>
    <span>Trusts fis.amazonaws.com</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-lock-key class="chain__icon" />
    <div class="gpu-caption">ECS access</div>
    <span>AWSFaultInjectionSimulatorECSAccess</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>Least privilege: a managed policy scoped to ECS fault actions, not an admin role.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
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
[1 min] The experiment runs with a service role. Its trust policy names the FIS service principal and it carries the AWS managed ECS access policy. Say least privilege out loud.
-->

---

# Pulumi IaC makes the experiment a resource

<div class="zoom-content">

<div class="chain" style="grid-template-columns: 1fr auto 1fr auto 1.25fr auto 1fr;">
  <div class="gpu-card chain__node" v-click="1">
    <ph-key class="chain__icon" />
    <div class="gpu-caption">IAM role</div>
    <span>aws.iam.Role</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card chain__node" v-click="2">
    <ph-lock-key class="chain__icon" />
    <div class="gpu-caption">Policy</div>
    <span style="font-size:0.95rem; overflow-wrap:anywhere">RolePolicy<wbr>Attachment</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="3">
    <ph-flask class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Template</div>
    <span style="font-size:0.95rem; overflow-wrap:anywhere">aws.fis.<wbr>ExperimentTemplate</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="4" />
  <div class="gpu-card chain__node" v-click="4">
    <ph-bell-ringing class="chain__icon" />
    <div class="gpu-caption">Alarm</div>
    <span>Stop condition ARN</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="5">
  <p>Pulumi IaC previews the change, and the state lives in Pulumi Cloud.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.15; }
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
[1.5 min] The resource graph the demo builds in steps 3 and 4. The template references the role and the alarm, so Pulumi orders the creates. Preview shows the change before anything runs.
-->

---

# One question covered, five to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-flask class="step-icon" /><div class="gpu-caption gpu-caption--accent">Resource</div><p>One Pulumi resource</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-key class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Login</div><p>How does the tool log in to AWS without stored keys?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-puzzle-piece class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Reuse</div><p>How do teams reuse one safe pattern?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-check class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Gate</div><p>How do we block an experiment with no stop condition?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-cube class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Fit</div><p>Where do Litmus and Chaos Mesh fit next to FIS?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-heartbeat class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>How do we know the stop condition works?</p></div>
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
[0.5 min] Recap. Question one answered: the experiment is one Pulumi resource. Next: how it logs in.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Pulumi ESC: login without keys.</h1>
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
[0.5 min] Section two: credentials.
-->

---

# Pulumi ESC trades a token for one hour of AWS credentials

<div class="zoom-content">

<div class="chain" style="grid-template-columns: 1fr auto 1fr auto 1fr;">
  <div class="gpu-card chain__node" v-click="1">
    <ph-cloud-check class="chain__icon" />
    <div class="gpu-caption">Pulumi Cloud</div>
    <span>Issues an OIDC token</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-key class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">AWS IAM role</div>
    <span>Trust policy checks it</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-terminal-window class="chain__icon" />
    <div class="gpu-caption">Your shell</div>
    <span>Short-lived AWS variables</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>No access key is stored in the repo, the stack or the laptop.</p>
</aside>

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
[1.5 min] ESC environment uses the aws-login provider with OIDC and a role ARN, one hour duration. It exports the standard AWS environment variables. Fallback if OIDC setup fails for a participant: the presenter shares a pre-created role and environment.
-->

---

# Two questions covered, four to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-flask class="step-icon" /><div class="gpu-caption gpu-caption--accent">Resource</div><p>One Pulumi resource</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">Login</div><p>Pulumi ESC and OIDC</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-puzzle-piece class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Reuse</div><p>How do teams reuse one safe pattern?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-check class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Gate</div><p>How do we block an experiment with no stop condition?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-cube class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Fit</div><p>Where do Litmus and Chaos Mesh fit next to FIS?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-heartbeat class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>How do we know the stop condition works?</p></div>
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
[0.5 min] Recap. Login answered with Pulumi ESC and OIDC. Next: reuse.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">A component: one safe pattern.</h1>
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
[0.5 min] Section three: reuse.
-->

---

# A component wraps the role, the policy and the template

<div class="zoom-content">

<div class="chain" style="grid-template-columns: 1fr auto 1fr auto 1fr;">
  <div class="gpu-card chain__node" v-click="1">
    <ph-puzzle-piece class="chain__icon" />
    <div class="gpu-caption">Arguments</div>
    <span>Tag, mode, alarm ARN</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-cube class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">ChaosExperiment</div>
    <span>Pulumi component</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-flask class="chain__icon" />
    <div class="gpu-caption">Resources</div>
    <span>Role, policy, template</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>The alarm ARN is a required argument. No alarm, no experiment.</p>
</aside>

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
[1.5 min] ComponentResource groups related resources. Children get parent equals this. The interface requires an alarm ARN, so the safe pattern is the easy path. Duration is optional and adds the wait action.
-->

---

# Aliases move step 4 resources without replacing them

<div class="zoom-content">

<div class="chain" style="grid-template-columns: 1fr auto 1fr auto 1fr;">
  <div class="gpu-card chain__node" v-click="1">
    <ph-git-branch class="chain__icon" />
    <div class="gpu-caption">Before</div>
    <span>Resources at the stack root</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-puzzle-piece class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Aliases</div>
    <span>Old names and parent</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-check-circle class="chain__icon" />
    <div class="gpu-caption">After</div>
    <span>Preview shows no replace</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>Refactor into a component, then check the preview.</p>
</aside>

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
[1 min] Moving resources into a component changes their URNs. Aliases tell Pulumi they are the same resources. The demo checks that preview shows no replace.
-->

---

# Three questions covered, three to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-flask class="step-icon" /><div class="gpu-caption gpu-caption--accent">Resource</div><p>One Pulumi resource</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">Login</div><p>Pulumi ESC and OIDC</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-puzzle-piece class="step-icon" /><div class="gpu-caption gpu-caption--accent">Reuse</div><p>A Pulumi component</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-check class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Gate</div><p>How do we block an experiment with no stop condition?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-cube class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Fit</div><p>Where do Litmus and Chaos Mesh fit next to FIS?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-heartbeat class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>How do we know the stop condition works?</p></div>
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
[0.5 min] Recap. Reuse answered with a component. Next: the gate.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Pulumi Policies: the gate.</h1>
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
[0.5 min] Section four: enforcement.
-->

---

# A mandatory policy stops the deployment

<div class="zoom-content">

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-bell class="step-icon" /><div class="gpu-caption gpu-caption--muted">Advisory</div><p>Reports a warning</p></div>
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-prohibit class="step-icon" /><div class="gpu-caption gpu-caption--accent">Mandatory</div><p>Blocks the deployment</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-wrench class="step-icon" /><div class="gpu-caption gpu-caption--muted">Remediate</div><p>Fixes the resource</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-hand-palm class="step-icon" /><div class="gpu-caption gpu-caption--muted">Disabled</div><p>Turns the policy off</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[1.5 min] Enforcement levels from the Pulumi Policies docs. We use mandatory. The policy runs during preview and update, before anything changes in AWS. Ours reads one field: whether a stop condition has the cloudwatch alarm source.
-->

---

# Four questions covered, two to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-flask class="step-icon" /><div class="gpu-caption gpu-caption--accent">Resource</div><p>One Pulumi resource</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">Login</div><p>Pulumi ESC and OIDC</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-puzzle-piece class="step-icon" /><div class="gpu-caption gpu-caption--accent">Reuse</div><p>A Pulumi component</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-shield-check class="step-icon" /><div class="gpu-caption gpu-caption--accent">Gate</div><p>A mandatory policy</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-cube class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Fit</div><p>Where do Litmus and Chaos Mesh fit next to FIS?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-heartbeat class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>How do we know the stop condition works?</p></div>
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
[0.5 min] Recap. Gate answered with a mandatory policy in a policy pack. Next: where the open source tools fit.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Where Litmus and Chaos Mesh fit.</h1>
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
[0.5 min] Section five: comparison.
-->

---

# Pick the tool by the layer you break

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Litmus and Chaos Mesh</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Open source, built for Kubernetes</li>
      <li>Faults at pod level</li>
      <li>Experiments are Kubernetes resources</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">AWS FIS</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Managed AWS service</li>
      <li>Faults on AWS services such as ECS tasks</li>
      <li>Template, role and alarm in AWS</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1.5 min] Honest comparison. Chaos Mesh describes itself as an open source cloud native chaos engineering platform. Litmus is the same family. If your workload is on Kubernetes pods, they fit well. If you break AWS service level things, FIS fits. They cover different layers, so pick by layer. Both can be managed as code.
-->

---

# Where this breaks today

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-timer class="step-icon" /><div class="gpu-caption gpu-caption--accent">Alarm lag</div><p>The alarm needs a 60 second period before it can stop anything</p></div>
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-shield-warning class="step-icon" /><div class="gpu-caption gpu-caption--accent">Presence only</div><p>The policy checks that a stop condition exists, not that it is good</p></div>
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-currency-dollar class="step-icon" /><div class="gpu-caption gpu-caption--accent">Real cost</div><p>Experiments run on real resources and cost real money</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[1.5 min] A real limitation, stated plainly. Fargate can replace a task faster than the alarm period, so an experiment may complete instead of stopping. Fallback: lengthen the wait action or lower the alarm period, and keep the rehearsal recording. The policy does not judge the alarm quality.
-->

---

# Five questions covered, one to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-flask class="step-icon" /><div class="gpu-caption gpu-caption--accent">Resource</div><p>One Pulumi resource</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">Login</div><p>Pulumi ESC and OIDC</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-puzzle-piece class="step-icon" /><div class="gpu-caption gpu-caption--accent">Reuse</div><p>A Pulumi component</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-shield-check class="step-icon" /><div class="gpu-caption gpu-caption--accent">Gate</div><p>A mandatory policy</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--accent">Fit</div><p>Pod faults vs AWS faults</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-heartbeat class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>How do we know the stop condition works?</p></div>
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
[0.5 min] Recap. Five answered. The demo answers the last: does the stop condition work?
-->

---

# The demo builds one stack with a policy gate

<div class="zoom-content">

<div class="chain" style="grid-template-columns: 1fr auto 1fr auto 1.25fr auto 1fr;">
  <div class="gpu-card chain__node" v-click="1">
    <ph-cloud class="chain__icon" />
    <div class="gpu-caption">Pulumi IaC</div>
    <span>Program in TypeScript</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-shield-check class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Policy pack</div>
    <span>Blocks no stop condition</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-cube class="chain__icon" />
    <div class="gpu-caption">ECS service</div>
    <span>Two nginx tasks behind an ALB</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="4" />
  <div class="gpu-card chain__node" v-click="4">
    <ph-flask class="chain__icon" />
    <div class="gpu-caption">FIS experiment</div>
    <span>Component with alarm</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="5">
  <p>Pulumi ESC supplies the AWS login. Pulumi Cloud holds the state.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.15; }
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
[1.5 min] The architecture the demo ends with. A TypeScript program creates an ALB, a Fargate service with two nginx tasks, a CloudWatch alarm and two experiments through the component. The policy pack gates every preview.
-->

---

# The whole experiment is six lines

<div class="zoom-content">

<div class="big-code code-sm">

```ts
new ChaosExperiment("stop-all-tasks", {
    targetTag,
    selectionMode: "ALL",
    alarmArn: steadyStateAlarm.arn,
    duration: "PT5M",
});
```

</div>

<aside class="info-card" style="margin-top:1.4rem"><div class="info-card__label">What it creates</div><p>A role, a policy attachment and an experiment template with a stop condition.</p></aside>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1.5 min] The only program code in the deck. Walk the four arguments: which tasks, how many, the stop alarm, how long to hold the fault. Everything else lives in the component. Show the real file in the editor during the demo.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Chaos experiments as code.</h1>
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
[0.5 min] Demo divider. Fallbacks if a step stalls: deploy steps 2 and 3 before the session; the presenter account runs the experiment on screen; the presenter has a pre-deployed second stack.
-->

---

# What we are going to do

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-key class="step__icon" /><p>No stored keys: ESC login</p></div>
  <div class="gpu-card step" v-click><ph-cube class="step__icon" /><p>Two nginx tasks behind an ALB</p></div>
  <div class="gpu-card step" v-click><ph-bell-ringing class="step__icon" /><p>An alarm for healthy hosts</p></div>
  <div class="gpu-card step" v-click><ph-flask class="step__icon" /><p>A template with a stop condition</p></div>
  <div class="gpu-card step" v-click><ph-puzzle-piece class="step__icon" /><p>The component, with no replace</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-shield-check class="step__icon" /><p>The policy blocks a bad template</p></div>
  <div class="gpu-card step" v-click><ph-lightning class="step__icon" /><p>Stop one task, traffic stays up</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-stop class="step__icon" /><p>Stop all tasks, the alarm stops it</p></div>
  <div class="gpu-card step" v-click><ph-trash class="step__icon" /><p>Teardown and the checks</p></div>
</div>

<aside class="info-card" style="margin-top:1rem" v-click><div class="info-card__label">Steps 2 to 5</div><p>Each runs <code>pulumi up</code> in its folder.</p></aside>

</div>

<style scoped>
.zoom-content { zoom: 1.15; }
.steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem; }
.step { display: flex; flex-direction: column; gap: 0.7rem; padding: 1.2rem 1.3rem; }
.step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.step__icon { font-size: 2rem; color: var(--p-primary); }
</style>

<!--
[3 min] Map of the hands-on part. Nine steps as outcomes. Cost reminder: one ALB, two small Fargate tasks and a few FIS action minutes, the ALB bills per hour or partial hour per the AWS pricing page; the brief sets a budget of 5 USD. Participants use a sandbox AWS account. Steps 2 and 3 can be deployed before the session if time is tight; fallback: the starter repository with steps 1 to 3 pre-written. Presenter keeps a pre-deployed second stack to show if a deploy stalls.
-->

---

# 1 · No keys: ESC logs in to AWS

<div class="zoom-content">

<div class="ds__cmd big-code code-sm">

```bash
pulumi whoami -v
```

</div>

<div class="ds">
  <div class="ds__flow">
    <div class="ds__step" v-click="1"><ph-cloud-check /><span>Pulumi Cloud login shown</span></div>
    <ph-arrow-down class="ds__arrow" v-click="2" />
    <div class="ds__step" v-click="2"><ph-key /><span>ESC environment opens the AWS role</span></div>
    <ph-arrow-down class="ds__arrow" v-click="3" />
    <div class="ds__step ds__step--stop" v-click="3"><ph-check-circle /><span><code>pulumi up</code> works with no stored keys</span></div>
  </div>
  <div class="ds__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Folder</div><p>01-esc-oidc: <code>setup.sh</code> creates the environment and stack.</p></aside>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.ds { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center; margin-top: 1.2rem; }
.ds__cmd pre { margin: 0 !important; white-space: pre-wrap; }
.ds__flow { display: flex; flex-direction: column; align-items: stretch; }
.ds__step { display: flex; align-items: center; gap: 0.8rem; padding: 0.7rem 1rem; border: 1.5px solid var(--p-border); border-radius: 12px; background: var(--p-bg-elevated); font-size: 1.15rem; }
.ds__step svg { flex-shrink: 0; font-size: 1.45rem; color: var(--p-primary); }
.ds__step--stop { border-color: color-mix(in srgb, var(--p-primary) 60%, var(--p-border)); background: var(--p-bg); font-weight: 600; }
.ds__arrow { align-self: center; font-size: 1.1rem; color: var(--p-accent); margin: 0.2rem 0; }
.ds__side { display: flex; flex-direction: column; gap: 1rem; }
.ds__side pre { margin: 0 !important; }
.ds__side .info-card { margin-top: 0; }
</style>

<!--
[5 min] Step 1. Set PULUMI_ORG and AWS_ROLE_ARN, run setup.sh, then pulumi whoami -v. Show the ESC environment in the Pulumi console. Fallback if OIDC setup fails: use the pre-created role and environment from the presenter.
-->

---

# 2 · Two tasks answer behind the ALB

<div class="zoom-content">

<div class="ds__cmd big-code code-sm">

```bash
curl -s -o /dev/null -w '%{http_code}' "$(pulumi stack output albUrl)"
```

</div>

<div class="ds">
  <div class="ds__flow">
    <div class="ds__step" v-click="1"><ph-cube /><span><code>pulumi up</code> in 02-target-service</span></div>
    <ph-arrow-down class="ds__arrow" v-click="2" />
    <div class="ds__step" v-click="2"><ph-heartbeat /><span>Two targets turn healthy</span></div>
    <ph-arrow-down class="ds__arrow" v-click="3" />
    <div class="ds__step ds__step--stop" v-click="3"><ph-check-circle /><span>The curl prints 200</span></div>
  </div>
  <div class="ds__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Also check</div><p><code>aws elbv2 describe-target-health</code> shows two healthy targets.</p></aside>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.ds { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center; margin-top: 1.2rem; }
.ds__cmd pre { margin: 0 !important; white-space: pre-wrap; }
.ds__flow { display: flex; flex-direction: column; align-items: stretch; }
.ds__step { display: flex; align-items: center; gap: 0.8rem; padding: 0.7rem 1rem; border: 1.5px solid var(--p-border); border-radius: 12px; background: var(--p-bg-elevated); font-size: 1.15rem; }
.ds__step svg { flex-shrink: 0; font-size: 1.45rem; color: var(--p-primary); }
.ds__step--stop { border-color: color-mix(in srgb, var(--p-primary) 60%, var(--p-border)); background: var(--p-bg); font-weight: 600; }
.ds__arrow { align-self: center; font-size: 1.1rem; color: var(--p-accent); margin: 0.2rem 0; }
.ds__side { display: flex; flex-direction: column; gap: 1rem; }
.ds__side pre { margin: 0 !important; }
.ds__side .info-card { margin-top: 0; }
</style>

<!--
[6 min] Step 2. The ALB and service take several minutes to become healthy: run pulumi up first, talk, then curl. Fallback: deploy steps 2 and 3 before the session and walk through them. Docker Hub pull limits: use the public.ecr.aws/nginx/nginx mirror with the same tag, after confirming the tag exists there (open question for the PR).
-->

---

# 3 · The alarm starts in OK

<div class="zoom-content">

<div class="ds__cmd big-code code-sm">

```bash
aws cloudwatch describe-alarms --alarm-names chaos-fis-healthy-hosts --query 'MetricAlarms[0].StateValue'
```

</div>

<div class="ds">
  <div class="ds__flow">
    <div class="ds__step" v-click="1"><ph-bell-ringing /><span><code>pulumi up</code> in 03-steady-state-alarm</span></div>
    <ph-arrow-down class="ds__arrow" v-click="2" />
    <div class="ds__step" v-click="2"><ph-gauge /><span>Healthy host count, minimum, below one</span></div>
    <ph-arrow-down class="ds__arrow" v-click="3" />
    <div class="ds__step ds__step--stop" v-click="3"><ph-check-circle /><span>The state prints <code>OK</code></span></div>
  </div>
  <div class="ds__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Why it matters</div><p>This alarm is the steady state check and the stop condition.</p></aside>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.ds { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center; margin-top: 1.2rem; }
.ds__cmd pre { margin: 0 !important; white-space: pre-wrap; }
.ds__flow { display: flex; flex-direction: column; align-items: stretch; }
.ds__step { display: flex; align-items: center; gap: 0.8rem; padding: 0.7rem 1rem; border: 1.5px solid var(--p-border); border-radius: 12px; background: var(--p-bg-elevated); font-size: 1.15rem; }
.ds__step svg { flex-shrink: 0; font-size: 1.45rem; color: var(--p-primary); }
.ds__step--stop { border-color: color-mix(in srgb, var(--p-primary) 60%, var(--p-border)); background: var(--p-bg); font-weight: 600; }
.ds__arrow { align-self: center; font-size: 1.1rem; color: var(--p-accent); margin: 0.2rem 0; }
.ds__side { display: flex; flex-direction: column; gap: 1rem; }
.ds__side pre { margin: 0 !important; }
.ds__side .info-card { margin-top: 0; }
</style>

<!--
[4 min] Step 3. Point out the threshold and the 60 second period. Missing data counts as breaching. Split the screen: alarm on one side, FIS page on the other.
-->

---

# 4 · The first template has a stop condition

<div class="zoom-content">

<div class="ds__cmd big-code code-sm">

```bash
aws fis list-experiment-templates
```

</div>

<div class="ds">
  <div class="ds__flow">
    <div class="ds__step" v-click="1"><ph-key /><span><code>pulumi up</code> in 04-first-experiment</span></div>
    <ph-arrow-down class="ds__arrow" v-click="2" />
    <div class="ds__step" v-click="2"><ph-flask /><span>Role, policy and template created</span></div>
    <ph-arrow-down class="ds__arrow" v-click="3" />
    <div class="ds__step ds__step--stop" v-click="3"><ph-check-circle /><span>The template is listed</span></div>
  </div>
  <div class="ds__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">In the template</div><p>Actions, one tagged target, and the alarm as stop condition.</p></aside>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.ds { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center; margin-top: 1.2rem; }
.ds__cmd pre { margin: 0 !important; white-space: pre-wrap; }
.ds__flow { display: flex; flex-direction: column; align-items: stretch; }
.ds__step { display: flex; align-items: center; gap: 0.8rem; padding: 0.7rem 1rem; border: 1.5px solid var(--p-border); border-radius: 12px; background: var(--p-bg-elevated); font-size: 1.15rem; }
.ds__step svg { flex-shrink: 0; font-size: 1.45rem; color: var(--p-primary); }
.ds__step--stop { border-color: color-mix(in srgb, var(--p-primary) 60%, var(--p-border)); background: var(--p-bg); font-weight: 600; }
.ds__arrow { align-self: center; font-size: 1.1rem; color: var(--p-accent); margin: 0.2rem 0; }
.ds__side { display: flex; flex-direction: column; gap: 1rem; }
.ds__side pre { margin: 0 !important; }
.ds__side .info-card { margin-top: 0; }
</style>

<!--
[5 min] Step 4. Open the template in the console and show the stop condition. FIS quota or permission error in a participant account: the presenter account runs the experiment on screen, participants still deploy the template.
-->

---

# 5 · The refactor replaces nothing

<div class="zoom-content">

<div class="ds__cmd big-code code-sm">

```bash
pulumi preview
```

</div>

<div class="ds">
  <div class="ds__flow">
    <div class="ds__step" v-click="1"><ph-puzzle-piece /><span>Move the resources into the component</span></div>
    <ph-arrow-down class="ds__arrow" v-click="2" />
    <div class="ds__step" v-click="2"><ph-git-branch /><span>Aliases keep the identity</span></div>
    <ph-arrow-down class="ds__arrow" v-click="3" />
    <div class="ds__step ds__step--stop" v-click="3"><ph-check-circle /><span>Preview shows no replace, two templates exist</span></div>
  </div>
  <div class="ds__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Folder</div><p>05-chaos-component adds the second experiment.</p></aside>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.ds { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center; margin-top: 1.2rem; }
.ds__cmd pre { margin: 0 !important; white-space: pre-wrap; }
.ds__flow { display: flex; flex-direction: column; align-items: stretch; }
.ds__step { display: flex; align-items: center; gap: 0.8rem; padding: 0.7rem 1rem; border: 1.5px solid var(--p-border); border-radius: 12px; background: var(--p-bg-elevated); font-size: 1.15rem; }
.ds__step svg { flex-shrink: 0; font-size: 1.45rem; color: var(--p-primary); }
.ds__step--stop { border-color: color-mix(in srgb, var(--p-primary) 60%, var(--p-border)); background: var(--p-bg); font-weight: 600; }
.ds__arrow { align-self: center; font-size: 1.1rem; color: var(--p-accent); margin: 0.2rem 0; }
.ds__side { display: flex; flex-direction: column; gap: 1rem; }
.ds__side pre { margin: 0 !important; }
.ds__side .info-card { margin-top: 0; }
</style>

<!--
[5 min] Step 5. Show the legacyNames argument that carries the aliases. Run pulumi preview and read the summary: no replace. Then pulumi up creates the second template.
-->

---

# 6 · The policy rejects a template with no stop condition

<div class="zoom-content">

<div class="ds__cmd big-code code-sm">

```bash
pulumi preview --policy-pack ../policy-pack
```

</div>

<div class="ds">
  <div class="ds__flow">
    <div class="ds__step" v-click="1"><ph-shield-check /><span>Preview runs the policy pack</span></div>
    <ph-arrow-down class="ds__arrow" v-click="2" />
    <div class="ds__step ds__step--stop" v-click="2"><ph-prohibit /><span>Fails and names the policy and the resource</span></div>
    <ph-arrow-down class="ds__arrow" v-click="3" />
    <div class="ds__step" v-click="3"><ph-check-circle /><span>One-line fix, then it passes</span></div>
  </div>
  <div class="ds__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Where</div><p>Run from 06-policy-gate/program. Deploy with <code>pulumi up --policy-pack ../policy-pack</code>.</p></aside>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.ds { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center; margin-top: 1.2rem; }
.ds__cmd pre { margin: 0 !important; white-space: pre-wrap; }
.ds__flow { display: flex; flex-direction: column; align-items: stretch; }
.ds__step { display: flex; align-items: center; gap: 0.8rem; padding: 0.7rem 1rem; border: 1.5px solid var(--p-border); border-radius: 12px; background: var(--p-bg-elevated); font-size: 1.15rem; }
.ds__step svg { flex-shrink: 0; font-size: 1.45rem; color: var(--p-primary); }
.ds__step--stop { border-color: color-mix(in srgb, var(--p-primary) 60%, var(--p-border)); background: var(--p-bg); font-weight: 600; }
.ds__arrow { align-self: center; font-size: 1.1rem; color: var(--p-accent); margin: 0.2rem 0; }
.ds__side { display: flex; flex-direction: column; gap: 1rem; }
.ds__side pre { margin: 0 !important; }
.ds__side .info-card { margin-top: 0; }
</style>

<!--
[6 min] Step 6. The program starts with a template missing its stop condition. Preview fails with a mandatory violation naming fis-requires-alarm-stop-condition. Apply the one-line fix in program/index.ts and show it passes. Fallback: policy pack from the local folder if the published pack is unavailable.
-->

---

# 7 · One task stops, traffic keeps returning 200

<div class="zoom-content">

<div class="ds__cmd big-code code-sm">

```bash
07-stop-one-task/run.sh
```

</div>

<div class="ds">
  <div class="ds__flow">
    <div class="ds__step" v-click="1"><ph-terminal-window /><span>Second terminal: <code>07-stop-one-task/traffic.sh</code></span></div>
    <ph-arrow-down class="ds__arrow" v-click="2" />
    <div class="ds__step" v-click="2"><ph-lightning /><span>FIS stops one task, the experiment completes</span></div>
    <ph-arrow-down class="ds__arrow" v-click="3" />
    <div class="ds__step ds__step--stop" v-click="3"><ph-check-circle /><span>Requests still return 200</span></div>
  </div>
  <div class="ds__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Wait</div><p>Before the next run, wait for two healthy targets again.</p></aside>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.ds { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center; margin-top: 1.2rem; }
.ds__cmd pre { margin: 0 !important; white-space: pre-wrap; }
.ds__flow { display: flex; flex-direction: column; align-items: stretch; }
.ds__step { display: flex; align-items: center; gap: 0.8rem; padding: 0.7rem 1rem; border: 1.5px solid var(--p-border); border-radius: 12px; background: var(--p-bg-elevated); font-size: 1.15rem; }
.ds__step svg { flex-shrink: 0; font-size: 1.45rem; color: var(--p-primary); }
.ds__step--stop { border-color: color-mix(in srgb, var(--p-primary) 60%, var(--p-border)); background: var(--p-bg); font-weight: 600; }
.ds__arrow { align-self: center; font-size: 1.1rem; color: var(--p-accent); margin: 0.2rem 0; }
.ds__side { display: flex; flex-direction: column; gap: 1rem; }
.ds__side pre { margin: 0 !important; }
.ds__side .info-card { margin-top: 0; }
</style>

<!--
[5 min] Step 7. Start traffic.sh in a second terminal first. Run the experiment, watch one task stop and ECS replace it. The experiment completes and traffic stays at 200.
-->

---

# 8 · Stop all tasks: the alarm ends the experiment

<div class="zoom-content">

<div class="ds__cmd big-code code-sm">

```bash
08-stop-all-tasks/run.sh
```

</div>

<div class="ds">
  <div class="ds__flow">
    <div class="ds__step" v-click="1"><ph-stop /><span>FIS stops every task</span></div>
    <ph-arrow-down class="ds__arrow" v-click="2" />
    <div class="ds__step" v-click="2"><ph-bell-ringing /><span>Healthy hosts drop, the alarm fires</span></div>
    <ph-arrow-down class="ds__arrow" v-click="3" />
    <div class="ds__step ds__step--stop" v-click="3"><ph-check-circle /><span>State is <code>stopped</code>, reason names the stop condition</span></div>
  </div>
  <div class="ds__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Then</div><p><code>08-stop-all-tasks/alarm-history.sh</code> shows the alarm go to ALARM.</p></aside>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.ds { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center; margin-top: 1.2rem; }
.ds__cmd pre { margin: 0 !important; white-space: pre-wrap; }
.ds__flow { display: flex; flex-direction: column; align-items: stretch; }
.ds__step { display: flex; align-items: center; gap: 0.8rem; padding: 0.7rem 1rem; border: 1.5px solid var(--p-border); border-radius: 12px; background: var(--p-bg-elevated); font-size: 1.15rem; }
.ds__step svg { flex-shrink: 0; font-size: 1.45rem; color: var(--p-primary); }
.ds__step--stop { border-color: color-mix(in srgb, var(--p-primary) 60%, var(--p-border)); background: var(--p-bg); font-weight: 600; }
.ds__arrow { align-self: center; font-size: 1.1rem; color: var(--p-accent); margin: 0.2rem 0; }
.ds__side { display: flex; flex-direction: column; gap: 1rem; }
.ds__side pre { margin: 0 !important; }
.ds__side .info-card { margin-top: 0; }
</style>

<!--
[6 min] Step 8. The proof slide, and it answers question six. Risk: Fargate replaces tasks faster than the alarm period and the experiment completes instead of stopping. Fallback: lengthen the wait action or lower the alarm period, and show the recording from rehearsal.
-->

---

# 9 · Teardown leaves nothing behind

<div class="zoom-content">

<div class="ds__cmd big-code code-sm">

```bash
09-teardown/check.sh
```

</div>

<div class="ds">
  <div class="ds__flow">
    <div class="ds__step" v-click="1"><ph-trash /><span><code>09-teardown/teardown.sh</code> destroys the stack</span></div>
    <ph-arrow-down class="ds__arrow" v-click="2" />
    <div class="ds__step" v-click="2"><ph-list-checks /><span>Check lists the cluster, ALB, templates, alarm, logs, roles</span></div>
    <ph-arrow-down class="ds__arrow" v-click="3" />
    <div class="ds__step ds__step--stop" v-click="3"><ph-check-circle /><span>Every list is empty</span></div>
  </div>
  <div class="ds__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Reminder</div><p>The ALB bills by the hour. Do not leave it running.</p></aside>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.ds { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center; margin-top: 1.2rem; }
.ds__cmd pre { margin: 0 !important; white-space: pre-wrap; }
.ds__flow { display: flex; flex-direction: column; align-items: stretch; }
.ds__step { display: flex; align-items: center; gap: 0.8rem; padding: 0.7rem 1rem; border: 1.5px solid var(--p-border); border-radius: 12px; background: var(--p-bg-elevated); font-size: 1.15rem; }
.ds__step svg { flex-shrink: 0; font-size: 1.45rem; color: var(--p-primary); }
.ds__step--stop { border-color: color-mix(in srgb, var(--p-primary) 60%, var(--p-border)); background: var(--p-bg); font-weight: 600; }
.ds__arrow { align-self: center; font-size: 1.1rem; color: var(--p-accent); margin: 0.2rem 0; }
.ds__side { display: flex; flex-direction: column; gap: 1rem; }
.ds__side pre { margin: 0 !important; }
.ds__side .info-card { margin-top: 0; }
</style>

<!--
[3 min] Step 9. Run teardown.sh, then check.sh. The script prints six lists (cluster, load balancer, templates, alarms, log groups, roles); the brief says five checks. Open question for the PR.
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-4 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/chaos-experiments-as-code-aws-fis" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → chaos-experiments-as-code-aws-fis</div>
  </div>
  <div class="res-card">
    <QRCode data="https://docs.aws.amazon.com/fis/latest/userguide/what-is.html" dark="#000000" />
    <div class="res-card__title">AWS FIS user guide</div>
    <div class="res-card__body">docs.aws.amazon.com/fis</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/discovery-governance/concepts/policy-as-code/" dark="#000000" />
    <div class="res-card__title">Pulumi Policies docs</div>
    <div class="res-card__body">pulumi.com/docs/policy</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/esc/environments/configuring-oidc/aws/" dark="#000000" />
    <div class="res-card__title">Pulumi ESC OIDC for AWS</div>
    <div class="res-card__body">pulumi.com/docs/esc</div>
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
[0.5 min] Resources. Show the QR codes, give people a moment. Open the repo first.
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
[0.25 min] Next steps: the Pulumi docs for ESC, Pulumi Policies and components.
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/chaos-experiments-as-code-aws-fis" dark="#000000" /></div>
      <div class="thanks__qr-label">chaos-experiments-as-code-aws-fis</div>
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
[0.25 min] Questions. Return to the six questions from Act 1 and ask which one still feels open.
-->
