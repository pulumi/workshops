---
theme: "@pulumi/slidev-theme"
title: "Meter every token: per-team Amazon Bedrock cost tracking and guardrails as code"
info: |
  Meter every token: per-team Amazon Bedrock cost tracking and guardrails as code: Give each team its own tagged inference profile, count its tokens in CloudWatch, and block untagged profiles before they exist.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/bedrock-per-team-token-metering
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
    Meter every token: per-team Amazon Bedrock cost tracking and guardrails as code
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Give each team its own tagged inference profile, count its tokens in CloudWatch, and block untagged profiles before they exist
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!-- [1 min] Title. Say who we are and what the next 90 minutes deliver. -->

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

<!-- [1 min] Introduce the speaker. -->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!-- [0.5 min] Housekeeping and agenda divider. -->

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

<!-- [2 min] Housekeeping: AWS account, shell, Pulumi login. Say what to have ready. -->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>The unattributable bill</li>
  <li>One profile and one role per team</li>
  <li>Token counts in CloudWatch</li>
  <li>Guardrails in a policy pack</li>
  <li>Live demo</li>
  <li>Wrap-up and Q&A</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!-- [1 min] Walk the agenda in one breath. -->

---

# A conference session asked the question out loud

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">The session title</div>
    <p>"FinOps for AI Agents: Who Spent All the Tokens?"</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>AI Engineer World's Fair 2026</li>
      <li>Tisha Chawla and Susheem Koul, Microsoft</li>
      <li>Source: ai.engineer/worldsfair/2026, schedule</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span><strong>One shared role</strong> is enough to lose the owner of a bill</span>
</div>

</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!-- [2 min] Open on the title a conference gave a session: who spent all the tokens. Read it slowly. The monitoring you already run was built for requests, so it cannot answer it. Ask who in the room has had an AI bill they could not explain. -->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[4rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[85%]">"98% now manage AI spend (up from 31% two years ago)."</h1>
  <p class="!mt-8 !text-[1.4rem] opacity-70">State of FinOps 2026, FinOps Foundation, data.finops.org</p>
</div>

<!-- [1 min] Quote the report. Nearly everyone is managing AI spend now, and two years ago fewer than a third were. Managing it is the easy claim. Doing it per team is the hard part, and that is today. -->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Every team calls a model.</h1>
</div>

<!-- [0.5 min] Short beat. Pause after it. -->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Nobody can say which team spent the tokens.</h1>
</div>

<!-- [0.5 min] Second beat. This is the whole workshop in one line. -->

---

# One shared role hides the team behind the call

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">One shared setup</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Every team calls the model directly</li>
      <li>The bill shows one line for the model</li>
      <li>A wildcard grant lets anyone invoke anything</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">One profile and one role per team</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Each call names its team's profile</li>
      <li>The profile's tags follow the call into billing</li>
      <li>The role can invoke that profile and nothing else</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!-- [2 min] The obvious setup is one role and the model id. It works, and it tells you nothing about who called. The fix has two halves: a profile that carries the team, and a role that can only reach that profile. Both are cloud resources, so both can live in Pulumi code. -->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">A bill without an owner is a bill nobody can cut.</h1>
</div>

<!-- [0.5 min] Opinion line, say it as one. Then move to the questions. -->

---

# Six questions before you trust a per-team bill

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-user-circle class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Who</div><p>Who spent these tokens?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-lock-key class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">What</div><p>What may a team call?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-shield-check class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Stop</div><p>What stops a mistake before it exists?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-key class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">With what</div><p>Which credentials does the tooling hold?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-receipt class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Invoice</div><p>What will the invoice say?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-clock class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">How fast</div><p>How fast do token counts show up?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!-- [2 min] Walk the six cards. Who spent it, what may a team call, what stops a mistake, which credentials the tooling holds, what the invoice will say, and how fast counts show up. The demo answers the last one live. -->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Who spent these tokens?</h1>
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

<!-- [0.5 min] Question one. The answer has to be on the call itself. -->

---

# Bedrock has more than one way to attribute spend, we use the first

<div class="zoom-content">

<div class="modes">
  <div class="gpu-card gpu-card--primary mode" v-click>
    <div class="mode__head"><ph-tag class="mode__icon" /><code class="mode__name">profile</code></div>
    <p>An application inference profile with cost allocation tags</p>
  </div>
  <div class="gpu-card mode" v-click>
    <div class="mode__head"><ph-user-circle class="mode__icon" /><code class="mode__name">principal</code></div>
    <p>IAM principal attribution</p>
  </div>
  <div class="gpu-card mode" v-click>
    <div class="mode__head"><ph-note-pencil class="mode__icon" /><code class="mode__name">request metadata</code></div>
    <p>Per-request metadata tagging</p>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
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

<!-- [2 min] The AWS docs list several routes. A profile is a resource you create and tag, and you pass its ARN where the model id would go. Principal attribution and request metadata exist too. For the Responses and Chat Completions APIs, which profiles do not support, the docs point to those two and to Projects. The same docs recommend Projects for flexibility; say so if asked. We use profiles because the tags land on the billing record and a profile is easy to scope in IAM. -->

---

# A profile per team carries the tags into billing

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-tag class="plan__icon" />
    <p>Create a profile with Team and CostCenter tags</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">2</span>
    <ph-copy class="plan__icon" />
    <p>It copies one model</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="5">
    <span class="plan__num">3</span>
    <ph-code class="plan__icon" />
    <p>Callers pass its ARN as the model id</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="6" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="7">
    <span class="plan__num">4</span>
    <ph-receipt class="plan__icon" />
    <p>Its tags attach to the billing record</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="8">
  <ph-lightning class="plan__foot-icon" />
  <p>The profile is the unit of attribution.</p>
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

<!-- [2 min] Walk the four steps. The profile references one model, so you need one per team and model. The tags are only useful for cost once they are activated as cost allocation tags, and we come back to that. -->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What may a team call?</h1>
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

<!-- [0.5 min] Question two. Attribution is worthless if a team can skip its own profile. -->

---

# The role reaches its own profile and nothing else

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-users-three class="chain__icon" />
    <div class="gpu-caption">Team caller</div>
    <span>Assumes its team role</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-identification-badge class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Team role</div>
    <span>Invoke on its profile ARN only</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-cube class="chain__icon" />
    <div class="gpu-caption">Model</div>
    <span>Reached only through that profile</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>A team cannot borrow another team's profile.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-lock-key /><p>Scoped to the profile ARN</p></div>
  <div class="fact"><ph-eye /><p>Each call is logged with the caller</p></div>
  <div class="fact"><ph-x-circle /><p>Cross-team call: AccessDenied</p></div>
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

<!-- [2 min] The component creates the role next to the profile. The role names the profile ARN and the routed model ARNs, with a condition so the model cannot be called directly. Step six of the demo shows the support team trying the search profile and getting denied. -->

---

# Ok, two questions covered, four to go!

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>A tagged profile per team</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">What</div><p>A role per team, scoped to its profile</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-check class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Stop</div><p>What stops a mistake before it exists?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-key class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">With what</div><p>Which credentials does the tooling hold?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-receipt class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Invoice</div><p>What will the invoice say?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-clock class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">How fast</div><p>How fast do token counts show up?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!-- [1 min] Two answered. Profile for who, role for what. Next, what stops a mistake. -->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What stops a mistake before it exists?</h1>
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

<!-- [0.5 min] Question three. Review comments do not scale; a policy does. -->

---

# Each mistake has an enforcer that runs at preview

<div class="zoom-content">

<div class="bounds">
  <div class="bound" v-click><ph-tag /><div class="bound__want">an untagged profile</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Policy: Team and CostCenter tags required</div></div>
  <div class="bound" v-click><ph-shield-warning /><div class="bound__want">a wildcard invoke grant</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Policy: no bedrock:InvokeModel on every resource</div></div>
  <div class="bound" v-click><ph-lock-key /><div class="bound__want">direct model calls</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">The role condition, not a review comment</div></div>
  <div class="bound" v-click><ph-eye /><div class="bound__want">a bad change reaching AWS</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Mandatory policies stop the preview</div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.bounds { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem 1.4rem; }
.bound { display: grid; grid-template-columns: auto 9.5rem auto 1fr; align-items: center; gap: 0.7rem; padding: 0.8rem 1rem; border: 1.5px solid var(--p-border); border-radius: 14px; background: var(--p-bg-elevated); }
.bound > svg:first-child { font-size: 1.5rem; color: var(--p-primary); }
.bound__want { font-family: var(--slidev-font-mono); font-size: 0.92rem; font-weight: 600; color: var(--p-fg-muted); }
.bound__arrow { font-size: 1.1rem; color: var(--p-accent); }
.bound__by { font-size: 1.05rem; line-height: 1.3; color: var(--p-fg); }
</style>

<!-- [2 min] The policy pack has two mandatory rules. One requires the tags on every inference profile. The other rejects an IAM policy that allows model invocation on every resource. A mandatory violation fails the preview, so nothing reaches AWS. The pack has unit tests, and step seven runs it. -->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Which credentials does the tooling hold?</h1>
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

<!-- [0.5 min] Question four. The answer should be none that last. -->

---

# ESC hands out short-lived AWS credentials

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-user-circle class="chain__icon" />
    <div class="gpu-caption">You</div>
    <span>Sign in to Pulumi Cloud</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-vault class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Pulumi ESC</div>
    <span>OIDC login to your AWS role</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-cloud class="chain__icon" />
    <div class="gpu-caption">AWS</div>
    <span>Short-lived credentials per run</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>No AWS key sits in the repo or on the laptop.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-key /><p>No static keys in config</p></div>
  <div class="fact"><ph-arrows-clockwise /><p>New credentials per run</p></div>
  <div class="fact"><ph-eye-slash /><p>Nothing to rotate or leak</p></div>
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

<!-- [2 min] The ESC environment uses the aws-login provider with OIDC. Every pulumi and aws command in the demo runs through pulumi env run, so the credentials exist only for that command. The stack imports the same environment. -->

---

# Ok, four questions covered, two to go!

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>A tagged profile per team</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">What</div><p>A role per team, scoped to its profile</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-shield-check class="step-icon" /><div class="gpu-caption gpu-caption--accent">Stop</div><p>Policy pack at preview</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">With what</div><p>ESC with OIDC, no static keys</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-receipt class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Invoice</div><p>What will the invoice say?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-clock class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">How fast</div><p>How fast do token counts show up?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!-- [1 min] Four down. Two left: the invoice, and how quickly counts show. -->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What will the invoice say?</h1>
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

<!-- [0.5 min] Question five. The honest answer includes a delay. -->

---

# Metrics answer in minutes, the invoice answers tomorrow

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">CloudWatch token metrics</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Counted from invocation logs</li>
      <li>Per team, per minute</li>
      <li>Visible minutes after a call, as the demo shows</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Cost allocation tags</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Activate the tags in billing first</li>
      <li>Up to 24 hours to appear in Cost Explorer</li>
      <li>Not retroactive</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!-- [2 min] Two views, two clocks. The log-based metric is what you use for operations. The tag-based view is what finance uses. AWS says tags can take up to 24 hours to appear after activation, and they are not retroactive, so activate them early. That is why step ten is optional and shown pre-baked. -->

---

# Where this breaks today

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Limits of this setup</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Profiles do not work with Responses and Chat Completions</li>
      <li>One profile per team and model</li>
      <li>The alarm only changes state, nothing is notified</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">What to do about it</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Use principal attribution or request metadata there</li>
      <li>Add profiles as teams add models</li>
      <li>Wire an alarm action before you rely on it</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!-- [2 min] Say these plainly. The AWS docs say profiles are not supported by the Responses and Chat Completions APIs. The demo alarm has no alarm action, so it shows a state change and nothing more. Invocation logging covers the whole account in a Region, so this stack owns it. -->

---

# Ok, five questions covered, one to go!

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>A tagged profile per team</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">What</div><p>A role per team, scoped to its profile</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-shield-check class="step-icon" /><div class="gpu-caption gpu-caption--accent">Stop</div><p>Policy pack at preview</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">With what</div><p>ESC with OIDC, no static keys</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-receipt class="step-icon" /><div class="gpu-caption gpu-caption--accent">Invoice</div><p>Tags, activated, up to 24 hours</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-clock class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">How fast</div><p>How fast do token counts show up?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!-- [1 min] Five answered. The last one we answer by measuring: how fast do counts show up. -->

---

# The solution: one stack, one component per team

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-buildings class="chain__icon" />
    <div class="gpu-caption">Foundation</div>
    <span>Log group, invocation logging, dashboard</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-cube class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Component per team</div>
    <span>Profile, role, metrics, alarm</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-chart-line class="chain__icon" />
    <div class="gpu-caption">CloudWatch</div>
    <span>Token counts per team</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>Adding a team is adding an entry to the teams list.</p>
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

<!-- [2 min] One Pulumi stack, because invocation logging covers the whole account in a Region. The foundation is created once. Each team is an entry in the teams config value, and each entry becomes one MeteredModelAccess component. -->

---

# A call becomes a per-team token metric

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-terminal-window class="plan__icon" />
    <p>Team calls its profile</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">2</span>
    <ph-file-text class="plan__icon" />
    <p>Invocation record in the log group</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="5">
    <span class="plan__num">3</span>
    <ph-funnel class="plan__icon" />
    <p>Metric filter counts tokens</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="6" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="7">
    <span class="plan__num">4</span>
    <ph-chart-line class="plan__icon" />
    <p>Dashboard and alarm per team</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="8">
  <ph-lightning class="plan__foot-icon" />
  <p>Input and output tokens, one metric each, per team.</p>
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

<!-- [2 min] The invocation record carries the token counts. The metric filters turn them into per-team input and output token metrics. The demo checks the metrics a few minutes after the calls, and the talk says so plainly. -->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Now we meter real calls.</h1>
</div>

<!-- [0.5 min] Hand over to the terminal. Everything from here runs in the demo folders. -->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Per-team Bedrock metering.</h1>
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

<!-- [0.5 min] Demo divider. Switch to the terminal. -->

---

# What we are going to do

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-key class="step__icon" /><p>Credentials from Pulumi ESC, a foundation stack</p></div>
  <div class="gpu-card step" v-click><ph-tag class="step__icon" /><p>A tagged profile and a scoped role per team</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-chart-line class="step__icon" /><p>Token counts per team in CloudWatch</p></div>
  <div class="gpu-card gpu-card--accent step" v-click><ph-gavel class="step__icon" /><p>A policy that fails the preview, then teardown</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.steps { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.2rem; }
.step { display: flex; flex-direction: column; gap: 0.7rem; padding: 1.2rem 1.3rem; }
.step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.step__icon { font-size: 2rem; color: var(--p-primary); }
</style>

<!-- [1.5 min] Four outcomes. Credentials and foundation first, then the teams, then the metrics, then the guardrails and teardown. Eleven steps, one optional. -->

---

# Steps 1 and 2: credentials resolve through ESC, then the foundation goes up

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="big-code code-sm">

```bash
01-credentials/check.sh
02-platform/up.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-vault /><span>Check prints the AWS identity from ESC</span></li>
    <li><ph-eye /><span>Up previews, then applies, with no teams</span></li>
    <li><ph-chart-bar /><span>Expect logging on and an empty dashboard</span></li>
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

<!-- [7 min] Run the check first. It prints sts get-caller-identity with credentials from the ESC environment. If it fails, stop and fix the role trust. Then up.sh sets teams to an empty list, previews, applies, and prints the invocation logging configuration. -->

---

# Step 3: one team is one inference profile and one role

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="big-code code-sm">

```bash
03-first-team/up.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-tag /><span>Profile search-nova with Team and CostCenter tags</span></li>
    <li><ph-identification-badge /><span>A role scoped to that profile</span></li>
    <li><ph-bell /><span>Two metric filters and one alarm</span></li>
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

<!-- [5 min] Team search with cost center cc-1001. The script lists application inference profiles in a table. Expect to see the new profile and its ARN. -->

---

# Step 4: every call names a team and a token count

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="big-code code-sm">

```bash
04-calls/send-calls.sh search 20
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-terminal-window /><span>Twenty Converse calls through the profile</span></li>
    <li><ph-file-text /><span>The log shows who called</span></li>
    <li><ph-chart-line /><span>Metrics follow a few minutes later</span></li>
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

<!-- [6 min] Twenty calls with prompts of varying length. Then show the invocation log with show-log, and read the metrics with check-metrics. Both are in the 04-calls folder. Expect the metrics to lag, so say so before you run them. -->

---

# Steps 5 and 6: support joins the same component and cannot use search's profile

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="big-code code-sm">

```bash
05-second-team/up.sh
06-cross-team/try-cross-team.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-plus-circle /><span>Team support, cost center cc-2002</span></li>
    <li><ph-x-circle /><span>Expect AccessDenied from the cross-team call</span></li>
    <li><ph-shield-check /><span>The script fails if the call succeeds</span></li>
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

<!-- [5 min] One more config entry, same component. Then send twenty calls as support, like step four: 04-calls/send-calls.sh support 20. Then the cross-team call. The script treats a success as an error. -->

---

# Steps 7 and 8: the pack passes clean code and fails two mistakes before AWS

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="big-code code-sm">

```bash
07-policy/run-preview.sh
08-violations/break.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-check-circle /><span>Clean preview first</span></li>
    <li><ph-warning /><span>Then an untagged profile and a wildcard invoke</span></li>
    <li><ph-shield-warning /><span>Expect two mandatory violations</span></li>
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

<!-- [7 min] The pack is bedrock-metering-guardrails. A clean preview shows the rules do not block correct code. break.sh turns on demoViolations and expects failure. Then run fix.sh in the same folder to switch it off and preview clean. -->

---

# Step 9: one team pushes its output tokens over the alarm line

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="big-code code-sm">

```bash
09-alarm/trip-alarm.sh search
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-chart-line-up /><span>Eight long answers from one team</span></li>
    <li><ph-bell /><span>Alarm threshold on output tokens per minute</span></li>
    <li><ph-clock /><span>State changes within a few minutes</span></li>
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

<!-- [5 min] The alarm sums a team's output tokens in one minute against a threshold, 2000 by default. The script reads the alarm state. Expect it to change after a few minutes. The alarm has no action, so nothing else happens. -->

---

# Step 10 (optional): a budget filtered by the Team tag

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="big-code code-sm">

```bash
10-budget/enable.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-envelope /><span>Needs BUDGET_EMAIL set</span></li>
    <li><ph-tag /><span>Needs the Team tag activated for cost allocation</span></li>
    <li><ph-clock /><span>Spend shows up to 24 hours later</span></li>
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

<!-- [2 min] Optional. The talk shows this pre-baked, because tag activation and spend both take up to a day. The command needs BUDGET_EMAIL in the environment. -->

---

# Step 11: teardown removes everything and proves it

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="big-code code-sm">

```bash
11-teardown/teardown.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-trash /><span>Destroys the stack, removes the stack</span></li>
    <li><ph-list-checks /><span>Three checks that nothing is left</span></li>
    <li><ph-check-circle /><span>No profiles, no logging, no log group</span></li>
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

<!-- [3 min] Run it even if the room is in a hurry. Profiles and logging cost or linger if left behind. -->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/bedrock-per-team-token-metering" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → bedrock-per-team-token-metering</div>
  </div>
  <div class="res-card">
    <QRCode data="https://docs.aws.amazon.com/bedrock/latest/userguide/cost-mgmt-application-inference-profiles.html" dark="#000000" />
    <div class="res-card__title">Application inference profiles and cost allocation</div>
    <div class="res-card__body">docs.aws.amazon.com/bedrock</div>
  </div>
  <div class="res-card">
    <QRCode data="https://docs.aws.amazon.com/bedrock/latest/userguide/model-invocation-logging.html" dark="#000000" />
    <div class="res-card__title">Bedrock model invocation logging</div>
    <div class="res-card__body">Model invocation logging</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/aws-login/" dark="#000000" />
    <div class="res-card__title">Pulumi ESC aws-login (OIDC)</div>
    <div class="res-card__body">pulumi.com/docs/esc</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/insights/policy/policy-packs/authoring/" dark="#000000" />
    <div class="res-card__title">Write a Pulumi policy pack</div>
    <div class="res-card__body">Policy pack authoring</div>
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

<!-- [1 min] Resources. Point at the QR codes. -->

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

<!-- [1 min] Continue your journey. Name the next step. -->

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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/bedrock-per-team-token-metering" dark="#000000" /></div>
      <div class="thanks__qr-label">bedrock-per-team-token-metering</div>
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

<!-- [8 min] Questions. Eight minutes. -->
