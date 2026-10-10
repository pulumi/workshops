---
theme: "@pulumi/slidev-theme"
title: "Disposable Cloud Sandboxes for AI Agents: One Pulumi Stack per Task"
info: |
  Disposable Cloud Sandboxes for AI Agents: One Pulumi Stack per Task: Spawn a scoped AWS sandbox for every agent task, and delete it on schedule.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/agent-sandboxes-pulumi
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
    Disposable Cloud Sandboxes for AI Agents: One Pulumi Stack per Task
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Spawn a scoped AWS sandbox for every agent task, and delete it on schedule
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
[0.5 min] Welcome. Title slide: one Pulumi stack per agent task, deleted on schedule. Wait for people to settle.
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
[1 min] Introduce yourself in a sentence. Say who you are and which part of the demo you will run.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
[0.25 min] Divider. Housekeeping first, then the agenda.
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
[1 min] Where to chat, where to ask questions, where to find the slides and scripts, and that the recording comes by email.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>Why agent sandboxes leak</li>
  <li>One stack per task</li>
  <li>Short-lived credentials and boundaries</li>
  <li>Rules at preview, expiry by reaper</li>
  <li>Demo: three sandboxes, one reaper</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
[1 min] Five parts: why sandboxes leak, one stack per task, credentials and boundaries, rules and expiry, then the demo. Say that the demo answers the last question.
-->

---

# At least ten conference sessions this summer had "sandbox" in the title

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">KubeCon + CloudNativeCon NA 2026, keynote abstract</div>
    <p>"A problematic agent with too much access, either through choice or a lack of knowledge, can take down entire production stacks and wipe databases."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>AI Engineer World's Fair 2026 listed at least ten sessions with "sandbox" in the title</li>
      <li>One of them: "Sandboxes Aren't Optional: Runtime Isolation Patterns for Coding Agents at Scale"</li>
      <li>KubeCon has the keynote "Sandbox Your Agents"</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span><strong>No single incident here.</strong> The conference programmes are the signal.</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
[2.75 min] I don't have a famous incident for this one, and I won't make one up. What I have is the conference programme. I counted at least ten session titles with sandbox in them at the AI Engineer World's Fair this summer. KubeCon has a keynote in November called Sandbox Your Agents. Read the abstract: an agent with too much access can take down production stacks and wipe databases. When a whole industry schedules talks about the same word, the problem is real. The question is what a good sandbox looks like.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">An agent with your long-lived key is an incident waiting for a prompt.</h1>
</div>

<!--
[0.5 min] Say it slowly. The key does not expire, and the prompt can come from anywhere: a user, a web page, a file the agent read.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">A shared, wide-open sandbox is the same incident, slower.</h1>
</div>

<!--
[0.5 min] The obvious fix is one sandbox for all agents. It feels safe. It is the same problem on a delay.
-->

---

# Disposable means one environment per task, scoped and deleted on schedule

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">One shared sandbox</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Every task sees every other task's data</li>
      <li>The credential outlives the task</li>
      <li>Nobody owns cleanup</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">One environment per task</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Its own bucket and its own role</li>
      <li>One-hour credentials</li>
      <li>An expiry date, and a job that enforces it</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[2.5 min] A shared sandbox looks safe. Look at what is inside. Task A can read task B's files. The credential is still valid next week. And when the work is done, nobody deletes anything, because nobody owns it. On the right is what we build today: one environment per task, with its own bucket and role, credentials that last an hour, and an expiry date that something actually enforces.
-->

---

# Every sandbox has three ways to be too open

<div class="zoom-content">

<div class="bounds">
  <div class="bound" v-click><ph-eye /><div class="bound__want">reach</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Too wide: one task can read another's data</div></div>
  <div class="bound" v-click><ph-clock /><div class="bound__want">time</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Too long: the credential outlives the task</div></div>
  <div class="bound" v-click><ph-trash /><div class="bound__want">cleanup</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Too quiet: nobody deletes it when the work ends</div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
.bounds { display: grid; grid-template-columns: 1fr; gap: 1.2rem; }
.bound { display: grid; grid-template-columns: auto 9.5rem auto 1fr; align-items: center; gap: 0.7rem; padding: 0.8rem 1rem; border: 1.5px solid var(--p-border); border-radius: 14px; background: var(--p-bg-elevated); }
.bound > svg:first-child { font-size: 1.5rem; color: var(--p-primary); }
.bound__want { font-family: var(--slidev-font-mono); font-size: 0.92rem; font-weight: 600; color: var(--p-fg-muted); }
.bound__arrow { font-size: 1.1rem; color: var(--p-accent); }
.bound__by { font-size: 1.05rem; line-height: 1.3; color: var(--p-fg); }
</style>

<!--
[2 min] Three ways a sandbox goes wrong. Reach: it can touch more than the task needs. Time: the credentials last longer than the task. Cleanup: it stays around because nobody owns deleting it. Each of these is a question, and the next slide turns them into five.
-->

---

# Five questions decide whether you can trust a sandbox

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--muted">Scope</div><p>What does an agent need to work, and nothing more?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-clock class="step-icon" /><div class="gpu-caption gpu-caption--muted">Expiry</div><p>How do credentials expire without anyone remembering to rotate them?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-gavel class="step-icon" /><div class="gpu-caption gpu-caption--muted">Rules</div><p>How do you prove a sandbox follows the rules before it exists?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-scroll class="step-icon" /><div class="gpu-caption gpu-caption--muted">Audit</div><p>Where does the audit trail live?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-trash class="step-icon" /><div class="gpu-caption gpu-caption--muted">Cleanup</div><p>How do you stop sandboxes piling up?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[3 min] Five questions. I will ask them now and answer them in order. One: what does an agent need to work, and nothing more? Two: how do credentials expire without anyone remembering to rotate them? Three: how do you prove a sandbox follows the rules before it exists? Four: where does the audit trail live? Five: how do you stop sandboxes piling up? Keep these in your head. They come back as a scorecard twice, and the demo answers the last one.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Q1. What does an agent need to work, and nothing more?</h1>
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
[0.25 min] First question: scope.
-->

---

# One stack per task makes a sandbox something you can create and delete

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-paper-plane-tilt class="plan__icon" />
    <p>A task arrives</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-stack class="plan__icon" />
    <p>The orchestrator creates a stack named for the task</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-cube class="plan__icon" />
    <p>The stack creates a bucket, a role and a policy</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-terminal-window class="plan__icon" />
    <p>The agent works inside that bucket</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p><strong>Delete the stack, delete the sandbox.</strong> Pulumi IaC tracks every resource in it.</p>
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
[2 min] The answer to question one starts with a unit. One task gets one Pulumi stack. A small Python program, using the Pulumi Automation API, creates that stack when the task arrives. The stack holds a bucket, a role and a policy. Because the stack knows every resource it made, deleting the sandbox means destroying the stack. You do not have to remember or hunt for anything.
-->

---

# A permissions boundary caps what the task's role can ever do

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-user-gear class="chain__icon" />
    <div class="gpu-caption">The task's role</div>
    <span>One role per task</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card chain__node" v-click="2">
    <ph-file-text class="chain__icon" />
    <div class="gpu-caption">Scoped policy</div>
    <span>Read, write, list on its own bucket</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="3">
    <ph-shield-check class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Permissions boundary</div>
    <span>S3 on <code>agent-sandbox-*</code> buckets only</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>The role can never do more than the boundary allows.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-lock-key /><p>The boundary sets a ceiling and grants nothing</p></div>
  <div class="fact"><ph-prohibit /><p>IAM and EC2 are denied by omission</p></div>
  <div class="fact"><ph-eye-slash /><p>A neighbour's bucket is out of reach</p></div>
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
.fact { flex: 1; }
.fact p { margin: 0 !important; font-size: 1.05rem; line-height: 1.35; }
.fact small { display: block; font-size: 0.9rem; color: var(--p-fg-muted); margin-top: 0.2rem; }
</style>

<!--
[2.5 min] Question one again: what does the agent need, and nothing more? Each task gets its own role. The role's own policy allows read, write and list on one bucket. On top of that sits a permissions boundary. The boundary is a ceiling. It does not grant anything. Even if someone attached a wider policy to the role later, the role could not do more than S3 on buckets whose names start with agent-sandbox. IAM, EC2, everything else is denied because the boundary never mentions it.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Q2. How do credentials expire without anyone remembering to rotate them?</h1>
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
[0.25 min] Second question: expiry.
-->

---

# ESC trades an OIDC token for one-hour AWS credentials

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-seal-check class="plan__icon" />
    <p>Pulumi Cloud issues an OIDC token</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-key class="plan__icon" />
    <p>Pulumi ESC <code>aws-login</code> assumes the base role</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-clock class="plan__icon" />
    <p>One-hour credentials come back</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-stack class="plan__icon" />
    <p>The stack opens the environment and runs</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p><strong>No static key on the machine.</strong> When the hour ends, the credential is dead.</p>
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
[2.5 min] Question two. The orchestrator holds no AWS key. Instead it opens a Pulumi ESC environment. ESC's aws-login function uses OpenID Connect: Pulumi Cloud vouches for the caller, AWS hands back credentials for one base role, and they last one hour. Nobody rotates anything, because nothing lives long enough to rotate. The one thing we create by hand is that base role, and we do it in step one of the demo.
-->

---

# Two questions covered, three to go

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">Scope</div><p>One stack, one role, one boundary per task</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-clock class="step-icon" /><div class="gpu-caption gpu-caption--accent">Expiry</div><p>ESC credentials that last one hour</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-gavel class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Rules</div><p>How do you prove a sandbox follows the rules before it exists?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-scroll class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Audit</div><p>Where does the audit trail live?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-trash class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Cleanup</div><p>How do you stop sandboxes piling up?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
[0.75 min] Scorecard. Scope: one stack, one role, one boundary. Expiry: one-hour credentials from ESC. Three left: rules, audit and cleanup.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Q3. How do you prove a sandbox follows the rules before it exists?</h1>
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
[0.25 min] Third question: rules.
-->

---

# Policies run at preview, before any resource exists

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-gavel class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Pulumi Policies pack</div></div>
    <ul class="zone__list">
      <li><ph-shield-check /><span>Every role carries the permissions boundary</span></li>
      <li><ph-note-pencil /><span>Buckets and roles carry <code>agent-task</code> and <code>expires-at</code> tags</span></li>
      <li><ph-seal-check /><span>Both rules are mandatory</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrow-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-eye class="zone__icon" /><div class="gpu-caption">Preview</div></div>
    <ph-prohibit class="zone__hero" />
    <p>A violation stops the run</p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">Why it matters here</div>
  <p>A sandbox that breaks a rule never gets created.</p>
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
[2.5 min] Question three. How do you know a sandbox follows the rules before it exists? You check at preview. A Pulumi Policies pack inspects each resource the program is about to create. Ours has two rules. Every role must carry the boundary. Every bucket and role must carry the task and expiry tags. Both are mandatory, so a violation stops the run. The bad sandbox never reaches AWS. We will break a rule on purpose in step seven.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Q4. Where does the audit trail live?</h1>
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
[0.25 min] Fourth question: audit.
-->

---

# Pulumi Cloud keeps one record per sandbox

<div class="zoom-content">

<div class="compose">
  <div class="compose__stack">
    <div class="gpu-caption">One sandbox in Pulumi Cloud</div>
    <div class="piece piece--mixin" v-click="4"><ph-cube />resources · bucket, role, policy</div>
    <div class="piece piece--mixin" v-click="3"><ph-note-pencil />stack tags · expires-at, owner</div>
    <div class="piece piece--sandbox" v-click="2"><ph-clock-clockwise />update history · every up and destroy</div>
    <div class="piece piece--template" v-click="1"><ph-stack />stack · one per task</div>
  </div>
  <ul class="rules" v-click="5">
    <li><ph-stack /><span>One stack per sandbox, so one place to look</span></li>
    <li><ph-scroll /><span>Every update is recorded</span></li>
    <li><ph-note-pencil /><span>Tags say who owns it and when it expires</span></li>
    <li><ph-trash /><span>The reaper reads those tags</span></li>
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

<!--
[2 min] Question four. Because every sandbox is its own stack, the audit trail is the stack's record in Pulumi Cloud. One stack, one update history, one set of tags. You can see what was created, when, and when it was destroyed. The tags carry the owner and the expiry date, and the reaper reads exactly those tags later.
-->

---

# Four questions answered, one to go

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">Scope</div><p>One stack, one role, one boundary per task</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-clock class="step-icon" /><div class="gpu-caption gpu-caption--accent">Expiry</div><p>ESC credentials that last one hour</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-gavel class="step-icon" /><div class="gpu-caption gpu-caption--accent">Rules</div><p>Policies check every sandbox at preview</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-scroll class="step-icon" /><div class="gpu-caption gpu-caption--accent">Audit</div><p>One Pulumi Cloud record per sandbox</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-trash class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Cleanup</div><p>How do you stop sandboxes piling up?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
[1 min] Four answered: scope, expiry, rules and audit. One left: how do you stop sandboxes piling up? That is the demo's last step, and it ends on the answer.
-->

---

# Where this breaks today: the sandbox is S3 and IAM, nothing more

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">What the sandbox is</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>One bucket, one role, one policy</li>
      <li>No compute, no network, no database</li>
      <li>A boundary that allows S3 and nothing else</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">What you still have to do</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Widen the boundary on purpose, per workload</li>
      <li>Schedule the reaper yourself</li>
      <li>Check your own account's limits</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[2 min] The sandbox in this workshop is S3 and IAM. It has no compute, no network and no database. If your agent needs a VM, you widen the boundary deliberately. And the reaper is a script. In the demo I run it by hand. In real life you put it on cron or a CI schedule. Those are the edges of what we build today.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Give every task its own cloud, and take it back on schedule.</h1>
</div>

<!--
[0.5 min]
That is the whole idea in one line. Four answers so far; now we add the fifth and build it.
-->

---

# TTL stacks need Pro, so we build our own reaper

<div class="zoom-content">

<div class="modes">
  <div class="gpu-card gpu-card--primary mode" v-click>
    <div class="mode__head"><ph-clock class="mode__icon" /><code class="mode__name">TTL stacks</code></div>
    <p>Managed expiry in Pulumi Cloud</p>
    <div class="mode__track"><i /><i /><ph-clock /><i /><ph-trash /></div>
    <div class="mode__note">Needs the Pro or Enterprise edition</div>
  </div>
  <div class="gpu-card gpu-card--accent mode" v-click>
    <div class="mode__head"><ph-note-pencil class="mode__icon" /><code class="mode__name">Tags and a reaper</code></div>
    <p>An <code>expires-at</code> tag, and a script that destroys expired stacks</p>
    <div class="mode__track"><i /><i /><i /><ph-pause-circle /><b>run</b></div>
    <div class="mode__note">Works on any edition. We build this one.</div>
  </div>
  <div class="gpu-card mode" v-click>
    <div class="mode__head"><ph-hand-palm class="mode__icon" /><code class="mode__name">By hand</code></div>
    <p>Somebody remembers</p>
    <div class="mode__track"><i /><i /><i /><i /><i /><b>?</b></div>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.modes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; align-items: stretch; }
.mode { display: flex; flex-direction: column; gap: 0.9rem; padding-inline: 1.4rem; }
.mode p { margin: 0 !important; font-size: 1.25rem; }
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
[2 min] Question five is cleanup. There are three ways. Pulumi Cloud has TTL stacks, a managed expiry, but it needs the Pro or Enterprise edition. The third way is somebody remembering, which we have already ruled out. The middle way works on any edition: put an expiry tag on every stack and run a small script that destroys the expired ones. That is what we build.
-->

---

# One orchestrator, three stacks, one reaper

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-package class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Orchestrator</div></div>
    <ul class="zone__list">
      <li><ph-stack /><span>One stack per task: task-a, task-b, task-c</span></li>
      <li><ph-key /><span>Credentials from the ESC environment</span></li>
      <li><ph-gavel /><span>The policy pack runs at preview</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-trash class="zone__icon" /><div class="gpu-caption">Reaper</div></div>
    <ph-clock class="zone__hero" />
    <p>Destroys stacks past their expiry</p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">All of it lives in Pulumi Cloud and one AWS account</div>
  <p>Each stack: a bucket, a role, a policy, and an expiry tag.</p>
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
[2 min] Here is the whole thing on one slide. The orchestrator creates one stack per task, with credentials from ESC and the policy pack at preview. Each stack holds a bucket, a role and a policy, plus an expiry tag. The reaper is a separate script that reads those tags and destroys what has expired. Next slide: what the orchestrator actually calls.
-->

---

# The orchestrator is a handful of Automation API calls

<div class="zoom-content">

<div class="term">
  <div class="term__bar"><span /><span /><span /><div class="term__title">orchestrator.py</div></div>
  <div class="term__row term__row--demo" v-click>
    <code class="term__flag">create_or_select_stack</code>
    <div class="term__desc">one stack per task</div>
  </div>
  <div class="term__row" v-click>
    <code class="term__flag">add_environments</code>
    <div class="term__desc">opens the ESC environment</div>
  </div>
  <div class="term__row" v-click>
    <code class="term__flag">set_tag</code>
    <div class="term__desc">expires-at and owner</div>
  </div>
  <div class="term__row term__row--demo" v-click>
    <code class="term__flag">up</code>
    <div class="term__desc">creates the resources, with the policy pack</div>
  </div>
</div>

<div class="acp" v-click><ph-code />The reaper uses <code>list_stacks</code>, <code>list_tags</code> and <code>destroy</code></div>

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

<!--
[2 min] This is the shape of the program, not the whole file. It creates or selects a stack, opens the ESC environment, sets the expiry and owner tags, and runs up with the policy pack. The reaper uses three more calls: list the stacks, read the tags, destroy. That is all the orchestration there is. We will read the real code in the editor during the demo.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Agent Sandboxes.</h1>
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
[0.25 min] Demo divider. Switch to the terminal and the editor.
-->

---

# What we are going to do

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-key class="step__icon" /><p>One base role by hand: <code>01-setup/setup.sh</code></p></div>
  <div class="gpu-card step" v-click><ph-clock class="step__icon" /><p>ESC hands out one-hour credentials</p></div>
  <div class="gpu-card step" v-click><ph-shield-check class="step__icon" /><p>A boundary caps every role</p></div>
  <div class="gpu-card step" v-click><ph-cube class="step__icon" /><p>One task previews as five resources</p></div>
  <div class="gpu-card step" v-click><ph-stack class="step__icon" /><p>Three tasks spawn at once</p></div>
  <div class="gpu-card step" v-click><ph-lock-key class="step__icon" /><p>An agent is denied its neighbour's bucket</p></div>
  <div class="gpu-card step" v-click><ph-gavel class="step__icon" /><p>A bad sandbox fails at preview</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-trash class="step__icon" /><p>The reaper deletes the expired one</p></div>
  <div class="gpu-card step" v-click><ph-check-circle class="step__icon" /><p>Teardown leaves nothing behind</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem; }
.step { display: flex; flex-direction: column; gap: 0.7rem; padding: 1.2rem 1.3rem; }
.step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.step__icon { font-size: 2rem; color: var(--p-primary); }
</style>

<!--
[5 min] Nine steps. We start from an empty account and end with a reaped sandbox. One: a base role, by hand. Two: ESC credentials. Three: the boundary. Four: preview one sandbox. Five: spawn three. Six: an agent gets denied. Seven: a bad sandbox fails at preview. Eight: the reaper. Nine: teardown. Each step has one command and one thing to watch for. Step one, the base role, is the only manual step: the script creates an OIDC provider so AWS trusts Pulumi Cloud, and a role called agent-sandbox-provisioner. In a live session I run it beforehand, because the OIDC setup takes a while, and show you the output. Watch for the role name and for pulumi whoami working at the end.
-->

---

# Step 2 · The ESC environment hands out one-hour credentials

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
02-esc/create-env.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-clock /><span><code>aws-login</code> with a one-hour duration</span></li>
    <li><ph-vault /><span><code>aws sts get-caller-identity</code> works</span></li>
    <li><ph-prohibit /><span>No static key on the machine</span></li>
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
[4 min] Step two. The script creates the ESC environment agent-sandboxes slash aws, using aws-login over OIDC with a one-hour duration. Then it proves the credentials work by running the AWS identity call inside pulumi env run. Look at the key id prefix in the output: ASIA means a temporary key. There is no access key stored anywhere on this laptop.
-->

---

# Step 3 · The boundary is a ceiling the agent's role cannot exceed

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
03-boundary/apply.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-shield-check /><span>One IAM policy: <code>agent-sandbox-boundary</code></span></li>
    <li><ph-cube /><span>S3 on <code>agent-sandbox-*</code> buckets only</span></li>
    <li><ph-file-text /><span>The ARN is saved for the next steps</span></li>
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
[4 min] Step three. A small Pulumi program creates one IAM policy, the boundary, and saves its ARN to a file. Open the program in the editor and read it: one statement, S3 actions, buckets whose names start with agent-sandbox. Every sandbox role created from here on carries this ceiling.
-->

---

# Step 4 · One task previews as five resources

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
cd 04-sandbox && pulumi stack init demo
pulumi config set taskId a && pulumi config set boundaryArn "$(cat ../.state/boundary-arn)"
pulumi preview
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-cube /><span>Five to create, the stack included</span></li>
    <li><ph-package /><span>A bucket, a policy, a role and an attachment</span></li>
    <li><ph-note-pencil /><span>Three tags on the resources</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1.4rem; }
.s1__facts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[5 min] Step four. Before the orchestrator, run the sandbox program for one task with a plain pulumi preview. Five resources to create: the stack itself, the bucket, the scoped policy, the role and the policy attachment. Open sandbox dot py in the editor and walk the tags. This is the same function the orchestrator runs next.
-->

---

# Step 5 · Three tasks spawn at once, each with its own stack

<div class="zoom-content">

<div class="s5__cmd big-code code-sm">

```bash
python 05-orchestrator/orchestrator.py spawn task-a task-b task-c --ttl-minutes 30
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-paper-plane-tilt /><span>Three tasks go in</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-stack /><span>Three stacks start in parallel</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-cloud-check /><span>Three buckets and three roles in AWS</span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">In Pulumi Cloud</div><p>Stacks <code>sandbox-task-a</code>, <code>-b</code> and <code>-c</code></p></aside>
    <aside class="info-card" v-click="5"><div class="info-card__label">Expiry</div><p>Each carries an <code>expires-at</code> tag, 30 minutes out</p></aside>
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

<!--
[7 min] Step five is the main event. One command spawns three tasks. Each gets its own stack, its own bucket and its own role, all in parallel. Watch the output prefixed with the task name. Then open Pulumi Cloud and show the three stacks and their tags. If anything fails, the update history in Pulumi Cloud is where we look first.
-->

---

# Step 6 · An agent writes to its bucket and is denied its neighbour's

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
python 06-agent/agent.py task-a task-b
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-key /><div><div class="gpu-caption gpu-caption--accent">1 · Assume</div><code>The agent takes task-a's role</code></div></div>
  <div class="gpu-card check" v-click><ph-check-circle /><div><div class="gpu-caption gpu-caption--accent">2 · Write</div><code>Its own bucket: succeeds</code></div></div>
  <div class="gpu-card check" v-click><ph-prohibit /><div><div class="gpu-caption gpu-caption--accent">3 · Read</div><code>task-b's bucket: AccessDenied</code></div></div>
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

<!--
[5 min] Step six answers question one with evidence. A simulated agent assumes task A's role, writes a file to its own bucket, and that works. Then it tries to read task B's bucket and gets AccessDenied. That is the scope doing its job. No prompt can talk its way past an IAM denial.
-->

---

# Step 7 · A sandbox without a boundary fails at preview

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
python 05-orchestrator/orchestrator.py spawn bad-task --noncompliant --policy-pack 07-policy
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-eye /><span>The preview fails</span></li>
    <li><ph-gavel /><span>The error names the policy</span></li>
    <li><ph-prohibit /><span>Nothing is created in AWS</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1.4rem; }
.s1__facts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[5 min] Step seven answers question three. The noncompliant flag builds a sandbox with no boundary and missing tags. The policy pack runs at preview and stops it. Read the error aloud: it names the rule that failed. Then check that no bad-task bucket exists.
-->

---

# Step 8 · The reaper deletes the expired sandbox and keeps the other three

<div class="zoom-content">

<div class="s5__cmd big-code code-sm">

```bash
python 05-orchestrator/orchestrator.py spawn short --ttl-minutes 2
python 08-reaper/reaper.py
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-paper-plane-tilt /><span>A fourth sandbox expires in two minutes</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-clock /><span>We wait; the tag passes</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-trash /><span>The reaper destroys <code>sandbox-short</code></span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Still there</div><p>task-a, task-b and task-c remain</p></aside>
    <aside class="info-card" v-click="5"><div class="info-card__label">Question five</div><p>How do you stop sandboxes piling up? Expiry tags and a reaper.</p></aside>
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

<!--
[7 min] Step eight answers the last question. Spawn a fourth sandbox with a two minute lifetime and wait. Use the wait to recap: questions one to four are answered. Then run the reaper. It reads each stack's expiry tag and destroys the one that has passed. The other three stay. That is question five: expiry tags and a reaper. All five questions answered.
-->

---

# Step 9 · Teardown leaves nothing behind

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
09-teardown/teardown.sh
09-teardown/leftovers.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-trash /><span>Destroys the remaining stacks</span></li>
    <li><ph-check-circle /><span><code>leftovers.sh</code> lists nothing</span></li>
    <li><ph-cloud-check /><span>No <code>agent-sandbox-*</code> bucket remains</span></li>
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
[4 min] Step nine. Teardown destroys what is left. Then leftovers dot sh checks for strays and lists nothing. That closes the loop: five questions, one sandbox per task, and an empty account at the end. Thank you, and over to your questions.
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/agent-sandboxes-pulumi" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → agent-sandboxes-pulumi</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/iac/guides/building-extending/automation-api/" dark="#000000" />
    <div class="res-card__title">Pulumi Automation API guide</div>
    <div class="res-card__body">pulumi.com/docs/iac/guides/building-extending/automation-api</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/esc/environments/configuring-oidc/aws/" dark="#000000" />
    <div class="res-card__title">Configuring OIDC for AWS in Pulumi ESC</div>
    <div class="res-card__body">pulumi.com/docs/esc/environments/configuring-oidc/aws</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/discovery-governance/concepts/policy-as-code/" dark="#000000" />
    <div class="res-card__title">Pulumi Policies, policy as code</div>
    <div class="res-card__body">pulumi.com/docs/discovery-governance/concepts/policy-as-code</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/deployments/concepts/ttl/" dark="#000000" />
    <div class="res-card__title">TTL stacks in Pulumi Cloud</div>
    <div class="res-card__body">pulumi.com/docs/deployments/concepts/ttl</div>
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
[1 min] Resources. The repo QR code first: it holds every script from today. Then the docs links. Pause so people can scan.
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
[0.5 min] Pointers for after the workshop: the Pulumi docs and the community.
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/agent-sandboxes-pulumi" dark="#000000" /></div>
      <div class="thanks__qr-label">agent-sandboxes-pulumi</div>
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
[4.5 min] Thank you. Questions: the best ones are about widening the boundary for a real workload and where to run the reaper.
-->
