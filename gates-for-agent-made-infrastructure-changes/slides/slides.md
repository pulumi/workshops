---
theme: "@pulumi/slidev-theme"
title: "Gates for agent-made infrastructure changes"
info: |
  Gates for agent-made infrastructure changes: Mandatory policies, ESC approvals and an audit trail with Pulumi.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/gates-for-agent-made-infrastructure-changes
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
    Gates for agent-made infrastructure changes
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Mandatory policies, ESC approvals and an audit trail with Pulumi
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

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
  <li>Why agent changes need gates</li>
  <li>Policies that block at preview</li>
  <li>Approvals on credentials</li>
  <li>Agent approval modes and audit logs</li>
  <li>Live demo</li>
  <li>Wrap-up and Q&A</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

---

# An AI agent deleted a live company database during a code freeze

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">The agent's own words</div>
    <p>"This was a catastrophic failure on my part. I destroyed months of work in seconds."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>A founder testing a "vibe coding" tool, documented in public</li>
      <li>Mid code freeze, told not to proceed without human approval</li>
      <li>It said rollback would not work. The founder recovered the data by hand.</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span><strong>Replit's own agent</strong>, reported by Fortune, July 2025</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
[2 min] Open with the incident, not with Pulumi. In July 2025 Replit's AI agent deleted a live company database during an active code freeze. The founder, Jason Lemkin of SaaStr, had told it not to proceed without human approval. Asked why, the agent admitted running unauthorized commands, and said "This was a catastrophic failure on my part. I destroyed months of work in seconds." It also said rollback would not work. Lemkin recovered the data manually. Replit's CEO then announced separation of development and production databases. Source: Fortune, Beatrice Nolan, 23 July 2025. Pause on the freeze: the instruction existed, nothing enforced it. Fallback: none needed, this slide is a story.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Agents can produce changes faster than people can review them.</h1>
</div>

<!--
[1 min] Say it slowly, then stop. This is the tension in one line: the agent's speed is the point, and it is also the problem. Next slide shows that people in the field already say this.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Every action still has to leave a record.</h1>
</div>

<!--
[1 min] The second half of the tension. Speed pushes toward fewer reviews; accountability pushes toward more evidence. The rest of the session is how to get both: gates that act without a person, and a record afterwards.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[4rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[85%]">"...human review becomes the next scaling bottleneck."</h1>
</div>

<!--
[1.5 min] Quote from the KubeCon + CloudNativeCon North America 2026 abstract for session 1250982, "Progressive Delivery for Trust: How Agents Earn the Right to Merge", by Darian DeFalco. The full sentence: "As agentic systems become more effective, human review becomes the next scaling bottleneck." A second session, 1334820, says giving non-deterministic systems write-access to production "risks turning minor incidents into P0 disasters". Both abstracts read 2026-10-23. Point: reviewing every change by hand does not scale. Also mention, in a sentence, the devopsdays Boston 2026 talk "We Gave the Agent Production Credentials" by Anish Puthuraya, as the same story from the field.
-->

---

# Scoped access limits where an agent can reach and leaves what it changes open

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">What scoping limits</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Which account the agent reaches</li>
      <li>Which role it assumes</li>
      <li>Which environments it can open</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">What it leaves open</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Whether the bucket is tagged</li>
      <li>Whether it is encrypted and private</li>
      <li>Who signed off, and where it is recorded</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[2 min] Access is scoped, so the agent may touch the bucket. Nothing in the scope says whether the bucket it creates is tagged, encrypted and private, who signed off, or where the change is recorded. That gap is what the gates fill. Reviewing every change by hand closes it and makes the reviewer the bottleneck. Keep the left card short; the right card is the point.
-->

---

# An agent change goes wrong in three ways: wrong resource, wrong scope, no record

<div class="zoom-content">

<div class="modes">
  <div class="gpu-card gpu-card--primary mode" v-click>
    <div class="mode__head"><ph-cube class="mode__icon" /><code class="mode__name">Wrong resource</code></div>
    <p>The agent changes something nobody asked for</p>
    <div class="mode__note">Caught by: a preview and a policy</div>
  </div>
  <div class="gpu-card gpu-card--accent mode" v-click>
    <div class="mode__head"><ph-lock-key class="mode__icon" /><code class="mode__name">Wrong scope</code></div>
    <p>It can reach more than the task needs</p>
    <div class="mode__note">Caught by: a credential gate</div>
  </div>
  <div class="gpu-card mode" v-click>
    <div class="mode__head"><ph-scroll class="mode__icon" /><code class="mode__name">No record</code></div>
    <p>Nobody can say who changed what</p>
    <div class="mode__note">Caught by: the audit log</div>
  </div>
</div>

<div class="gates" v-click>
  <div class="gpu-caption gpu-caption--accent">Gates</div>
  <span class="gate"><ph-eye />preview</span>
  <ph-caret-right class="gates__sep" />
  <span class="gate"><ph-key />credentials</span>
  <ph-caret-right class="gates__sep" />
  <span class="gate"><ph-scroll />record</span>
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
[1.5 min] Three failure shapes, each with a different gate. Do not explain the gates yet; the questions slide names them. Tie it back to the opening: the agent also gave a wrong account of whether rollback would work, so a record kept outside the agent matters.
-->

---

# A reviewer needs the diff, the policy result and the identity before approving

<div class="zoom-content">

<div class="bounds">
  <div class="bound" v-click><ph-git-diff /><div class="bound__want">the diff</div><ph-arrow-right class="bound__arrow" /><div class="bound__by"><code>pulumi preview</code> against live state</div></div>
  <div class="bound" v-click><ph-gavel /><div class="bound__want">the policy result</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Mandatory policies, named violations</div></div>
  <div class="bound" v-click><ph-user-circle /><div class="bound__want">the identity</div><ph-arrow-right class="bound__arrow" /><div class="bound__by"><code>pulumi whoami</code>, the agent's own login</div></div>
  <div class="bound" v-click><ph-seal-check /><div class="bound__want">the approval</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">A reviewer applies a time-bound grant</div></div>
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

<!--
[2 min] A reviewer who sees only a diff cannot approve safely. Four things belong in front of them: the preview, the policy result, which identity is asking, and a recorded approval. Each maps to a gate we build in Act 2.
-->

---

# An auditor asks who changed what, when, and who approved it

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-user-circle class="chain__icon" />
    <div class="gpu-caption">Who</div>
    <span>the login that acted</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-clock class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">When</div>
    <span>the timestamp of each event</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-seal-check class="chain__icon" />
    <div class="gpu-caption">Approved by</div>
    <span>the reviewer who applied the grant</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>One chain of evidence per change.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-scroll /><p>What the action was</p></div>
  <div class="fact"><ph-globe /><p>Where it came from</p></div>
  <div class="fact"><ph-link /><p>Tied to one identity</p></div>
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
[2 min] The auditor's three questions. Pulumi Cloud audit logs capture the event time, the user who invoked it, the event and the source IP; the logs are immutable (audit logs page, read 2026-10-23). Who approved is the ESC approval step shown in Act 2.
-->

---

# Six questions stand between an agent and production

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-prohibit class="step-icon" /><div class="gpu-caption gpu-caption--muted">Stops it</div><p>What stops a bad change before it reaches the cloud?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-seal-check class="step-icon" /><div class="gpu-caption gpu-caption--muted">Signs off</div><p>How does a human sign off without reviewing every read?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-pause-circle class="step-icon" /><div class="gpu-caption gpu-caption--muted">Pauses</div><p>When does the agent itself pause?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-door-open class="step-icon" /><div class="gpu-caption gpu-caption--muted">Left open</div><p>What does approval mode leave open?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-scroll class="step-icon" /><div class="gpu-caption gpu-caption--muted">Records</div><p>How do I show afterwards who did what?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-warning class="step-icon" /><div class="gpu-caption gpu-caption--muted">Limits</div><p>Where does this design stop working?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[2.5 min] Six questions, revealed one per click. Read each aloud. The talk answers them in order, and the recap slides show which are answered. Question 4 is answered together with question 3, and question 6 together with question 5.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What stops a bad change before it reaches the cloud?</h1>
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
[0.5 min] Question 1 of 6. Pause on the question for a beat, then move on. Do not answer it here.
-->

---

# A policy pack runs at preview, before anything reaches the cloud

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-package class="plan__icon" />
    <p>Pack published to Pulumi Cloud</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-toggle-right class="plan__icon" />
    <p>Enabled in a policy group</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-eye class="plan__icon" />
    <p><code>pulumi preview</code> evaluates each resource</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-prohibit class="plan__icon" />
    <p>A mandatory violation stops the update</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p><strong>Before the provider is called:</strong> policies run in the same preview command.</p>
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
[1.5 min] From the policy groups page, read 2026-10-23: preventative policy groups run before any resource is deployed, during pulumi preview and pulumi up, and a mandatory policy stops a non-compliant change before it reaches the cloud provider. Preventative policy groups see only resources Pulumi manages. Policy groups are a Pro and Enterprise feature; if the org lacks them, run step 2 with --policy-pack locally.
-->

---

# Mandatory is the one enforcement level that blocks the change

<div class="zoom-content">

<div class="modes">
  <div class="gpu-card mode" v-click>
    <div class="mode__head"><ph-eye class="mode__icon" /><code class="mode__name">advisory</code></div>
    <p>Prints a warning, the update continues</p>
  </div>
  <div class="gpu-card gpu-card--primary mode" v-click>
    <div class="mode__head"><ph-prohibit class="mode__icon" /><code class="mode__name">mandatory</code></div>
    <p>Blocks the update from proceeding</p>
    <div class="mode__note">The level this workshop uses</div>
  </div>
  <div class="gpu-card gpu-card--accent mode" v-click>
    <div class="mode__head"><ph-wrench class="mode__icon" /><code class="mode__name">remediate</code></div>
    <p>Fixes the violation automatically</p>
  </div>
</div>

<div class="gates" v-click>
  <div class="gpu-caption gpu-caption--accent">Blocks at</div>
  <span class="gate"><ph-eye />preview</span>
  <ph-caret-right class="gates__sep" />
  <span class="gate"><ph-rocket-launch />update</span>
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
[1.5 min] From the write-a-policy-pack page, read 2026-10-23: the enforcement level can be advisory, mandatory, remediate or disabled. Advisory warns, mandatory blocks, remediate fixes, disabled switches the policy off. Our three policies are mandatory. Say that disabled exists but is not shown. The Blocks-at row: mandatory stops the update before it proceeds.
-->

---

# Policy groups decide which stacks a pack guards

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-laptop class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Policy group</div></div>
    <ul class="zone__list">
      <li><ph-package /><span>One or more policy packs</span></li>
      <li><ph-stack /><span>Stacks added one by one</span></li>
      <li><ph-tag /><span>Or every stack that matches a tag rule</span></li>
      <li><ph-prohibit /><span>Mandatory policies block there</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption">Your stacks</div></div>
    <ph-stack class="zone__hero" />
    <p>The pack guards the stacks in the group</p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">Pro and Enterprise</div>
  <p>Policy groups are a Pulumi Cloud feature of the Pro and Enterprise editions.</p>
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
[1.5 min] From the policy groups page, read 2026-10-23: policy groups apply packs to specific stacks, individually or by tag rule. Preventative groups see only resources Pulumi manages. Audit groups report and never block, so they are the place to measure a new policy before enforcing it. Fallback: without policy groups, run step 2 with --policy-pack against a local directory.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How does a human sign off without reviewing every read?</h1>
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
[0.5 min] Question 2 of 6. Approvals are expensive, so the next three slides place one approval on the credential instead of on every command.
-->

---

# One approval on the credential replaces a review of every command

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-robot class="chain__icon" />
    <div class="gpu-caption">Agent</div>
    <span>asks to open the environment</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-key class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">ESC environment</div>
    <span>open approval ruleset</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-cloud-check class="chain__icon" />
    <div class="gpu-caption">Cloud credentials</div>
    <span>minted only inside a grant</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>A user with open permission still cannot open the environment without a grant.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-chat-text /><p>The request carries a reason</p></div>
  <div class="fact"><ph-timer /><p>The grant is time-bound</p></div>
  <div class="fact"><ph-scroll /><p>Each request is a record</p></div>
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
[1.5 min] From the ESC approvals page, read 2026-10-23. When an open approval ruleset is on, users with open permission cannot open the environment directly. They submit an open request with a reason, wait for approvals, apply the grant, then open within the window. The gate is on the credential, so the reviewer does not read every command.
-->

---

# An open request becomes a grant only after the reviewer applies it

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-chat-text class="plan__icon" />
    <p>Agent submits an open request</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-seal-check class="plan__icon" />
    <p>Reviewer approves</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-check-circle class="plan__icon" />
    <p>Reviewer applies the request</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-key class="plan__icon" />
    <p>Agent opens within the window</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-hand-palm class="plan__foot-icon" />
  <p><strong>Approval alone grants nothing:</strong> the request must be applied.</p>
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
[1.5 min] ESC approvals page, read 2026-10-23: submit the request with a reason and duration, wait for approvals, apply the request to activate the grant, open the environment within the granted window. Self-approval is a ruleset setting; with one login, one person plays both roles, so say so out loud. Fallback: if the org lacks ESC approvals, show steps 4 and 5 from recordings.
-->

---

# Grant expiration and access duration are two different clocks

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Grant expiration</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>How long the approval can still be activated</li>
      <li>Counts from approval</li>
      <li>Example in the docs: 24 hours</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Access duration</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>How long you have after first opening</li>
      <li>Counts from the first open</li>
      <li>Example in the docs: 2 hours</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1.5 min] From the ESC approvals page, read 2026-10-23: grant expiration is how long an approval stays valid before it must be activated; access duration is how long access lasts after the first open. The demo uses 4h and 30m (script 04). The CLI flags are --access-duration-seconds and --grant-expiration-seconds; script 04 passes durations such as 30m and 4h, as the CLI reference examples do. If your CLI version rejects a duration, pass plain seconds.
-->

---

# Two questions answered, four to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-prohibit class="step-icon" /><div class="gpu-caption gpu-caption--accent">Stops it</div><p>Mandatory policies at preview</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-seal-check class="step-icon" /><div class="gpu-caption gpu-caption--accent">Signs off</div><p>An open approval on the credential</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-pause-circle class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Pauses</div><p>When does the agent itself pause?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-door-open class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Left open</div><p>What does approval mode leave open?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-scroll class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Records</div><p>How do I show afterwards who did what?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-warning class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Limits</div><p>Where does this design stop working?</p></div>
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
[0.75 min] Two answers in: policies block at preview, and one approval sits on the credential. Do not re-explain. Point at the four muted cards and move on to the Neo section.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">When does the agent itself pause?</h1>
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
[0.5 min] Question 3 of 6, and question 4 comes with it: what approval mode leaves open. This is the Neo half of the talk.
-->

---

# Neo acts as the user, never with more permission than the user has

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-user-circle class="chain__icon" />
    <div class="gpu-caption">You</div>
    <code><code>pulumi login</code></code>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-terminal-window class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Neo task</div>
    <span>same identity as you</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-cloud-check class="chain__icon" />
    <div class="gpu-caption">Pulumi Cloud</div>
    <span>your RBAC decides</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>Neo has no identity of its own.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-key /><p>Opens any ESC environment you can open</p></div>
  <div class="fact"><ph-eye-slash /><p>Secrets redacted in task events</p></div>
  <div class="fact"><ph-scroll /><p>Runs under your login</p></div>
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
[1.5 min] From the Neo permissions page, read 2026-10-23: Neo has no identity of its own and by default carries the acting user's roles. If the user can open an ESC environment, so can Neo. Detected credential patterns are redacted in task events, as defense in depth, not a guarantee. This is why the demo gives Neo a dedicated agent identity.
-->

---

# Review, Balanced and Auto decide where Neo stops

<div class="zoom-content">

<div class="modes">
  <div class="gpu-card gpu-card--primary mode" v-click>
    <div class="mode__head"><ph-hand-palm class="mode__icon" /><code class="mode__name">Review</code></div>
    <p>Asks before preview, <code>up</code> and a pull request</p>
    <div class="mode__track"><i /><ph-pause-circle /><i /><ph-pause-circle /><i /><ph-pause-circle /><i /></div>
    <div class="mode__note">In the CLI, Review is called <code>manual</code></div>
  </div>
  <div class="gpu-card gpu-card--accent mode" v-click>
    <div class="mode__head"><ph-scales class="mode__icon" /><code class="mode__name">Balanced</code></div>
    <p>Asks only before <code>pulumi up</code></p>
    <div class="mode__track"><i /><i /><i /><i /><ph-pause-circle /><b>up</b></div>
  </div>
  <div class="gpu-card mode" v-click>
    <div class="mode__head"><ph-lightning class="mode__icon" /><code class="mode__name">Auto</code></div>
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

<!--
[1.5 min] From the Neo permissions page, read 2026-10-23. Review needs approval before pulumi preview, pulumi up and opening a pull request. Balanced only before pulumi up. Auto needs none. In the pulumi neo CLI the strictest mode is manual, the console calls it Review. Permission mode is a separate axis: default or read-only. Org admins set the default approval mode. Fallback if the org has no Neo access: show step 6 from the recording and say why on this slide.
-->

---

# Approval mode leaves reads open, so RBAC is the boundary

<div class="zoom-content">

<div class="bounds">
  <div class="bound" v-click><ph-eye /><div class="bound__want">Reads and searches</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Open, up to the acting user's RBAC</div></div>
  <div class="bound" v-click><ph-key /><div class="bound__want">ESC environments</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Whatever the user can open, Neo can open</div></div>
  <div class="bound" v-click><ph-cloud-check /><div class="bound__want">Pulumi Cloud changes</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">The user's RBAC and permission mode</div></div>
  <div class="bound" v-click><ph-gavel /><div class="bound__want">Unsafe resources</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Mandatory policy, in the same preview</div></div>
  <div class="bound" v-click><ph-seal-check /><div class="bound__want">Credentials</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">An open approval, if you set one</div></div>
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

<!--
[1.5 min] From the Neo permissions page, read 2026-10-23: approval modes gate preview, up and pull requests; Neo reads broadly within the user's RBAC and inherits the user's ESC access. So approval mode is not an access boundary. Scope RBAC, prefer read-only roles in ESC, and put open approvals on the environments that unlock the most. Permission mode read-only keeps reads and blocks Pulumi Cloud writes.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How do I show afterwards who did what?</h1>
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
[0.5 min] Question 5 of 6. After the change, the question is evidence. Question 6, where the design stops, follows on the next audit slide.
-->

---

# The audit log records who did what and when, and you can export it

<div class="zoom-content">

<div class="compose">
  <div class="compose__stack">
    <div class="gpu-caption">Audit trail</div>
    <div class="piece piece--mixin" v-click="5"><ph-file-arrow-down />export · CLI, console or REST API</div>
    <div class="piece piece--mixin" v-click="4"><ph-user-circle />event · the user who invoked it</div>
    <div class="piece piece--mixin" v-click="3"><ph-clock />event · UNIX timestamp</div>
    <div class="piece piece--sandbox" v-click="2"><ph-globe />event · source IP of the call</div>
    <div class="piece piece--template" v-click="1"><ph-scroll />audit log · immutable</div>
  </div>
  <ul class="rules" v-click="6">
    <li><ph-lock-key /><span>The log is immutable</span></li>
    <li><ph-user-circle /><span>Each event names the user and the time</span></li>
    <li><ph-download-simple /><span>Export on demand: console, CLI or REST API</span></li>
    <li><ph-eye /><span>Only org admins can view it</span></li>
    <li><ph-buildings /><span>Pro and Enterprise editions</span></li>
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
[1.5 min] From the audit logs page, read 2026-10-23: the logs are immutable, record all user actions, and capture the UNIX timestamp, the user who invoked the action, the event and the source IP. Export on demand from the console, CLI or REST API; automatic export is Enterprise. Only org admins can view them. Because Neo acts through the user's login, the agent's actions show up under that identity, which is why the demo uses a dedicated agent user.
-->

---

# Where this breaks today: reads, deployments and editions

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-laptop class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Where the gates hold</div></div>
    <ul class="zone__list">
      <li><ph-prohibit /><span>Mandatory policies on Pulumi-managed resources</span></li>
      <li><ph-key /><span>Open approval on the credential</span></li>
      <li><ph-hand-palm /><span>Neo approval modes on preview, up and pull request</span></li>
      <li><ph-scroll /><span>Audit log of user actions</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption">Where they do not</div></div>
    <ph-warning class="zone__hero" />
    <p>Reads, Pulumi-external resources and automated deployments</p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">Editions and admins</div>
  <p>Policy groups, ESC approvals and audit logs are Pro and Enterprise. Only org admins view audit logs.</p>
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
[1.5 min] Three limits, all from the docs read 2026-10-23. One: preventative policy groups see only the resources Pulumi manages. Two: the open-approval gate protects the credential, not the deployment; git-push and pull-request deployments run under an ephemeral stack token that cannot hold a grant, so use a dedicated access-token principal approved ahead of each run. Three: approval modes do not gate Neo's reads, so RBAC and ESC scope are the boundary. Step 8 shows limit two live.
-->

---

# Five questions answered, one to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-prohibit class="step-icon" /><div class="gpu-caption gpu-caption--accent">Stops it</div><p>Mandatory policies at preview</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-seal-check class="step-icon" /><div class="gpu-caption gpu-caption--accent">Signs off</div><p>An open approval on the credential</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-pause-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Pauses</div><p>Review, Balanced or Auto</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-door-open class="step-icon" /><div class="gpu-caption gpu-caption--accent">Left open</div><p>Reads stay open; RBAC bounds them</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-scroll class="step-icon" /><div class="gpu-caption gpu-caption--accent">Records</div><p>Audit log, exported by user and time</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-warning class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Limits</div><p>Where does this design stop working?</p></div>
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
[0.75 min] Five of six answered, with the limits of each. The sixth, automated deployments, we show live in step 8. Keep this to under a minute.
-->

---

# Three gates and one timeline sit around the same stack

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-gavel class="plan__icon" />
    <p>Policy blocks the change at preview</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-key class="plan__icon" />
    <p>Approval gates the credential</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-hand-palm class="plan__icon" />
    <p>Neo pauses by approval mode</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-scroll class="plan__icon" />
    <p>Audit log records the whole timeline</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-stack class="plan__foot-icon" />
  <p><strong>One stack, four controls:</strong> each answers one of the six questions.</p>
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
[2 min] The whole design on one slide. Policy answers question 1, the credential approval question 2, approval mode questions 3 and 4, the audit log question 5, and the limits drill question 6. Same stack through the whole demo.
-->

---

# Two identities, one stack: the agent proposes and the reviewer releases

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-robot class="chain__icon" />
    <div class="gpu-caption">Agent identity</div>
    <span>proposes the change</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-cloud-check class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Pulumi Cloud</div>
    <span>policy, approval, audit</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-user-circle class="chain__icon" />
    <div class="gpu-caption">Reviewer identity</div>
    <span>applies the grant</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>Two logins, one stack: the agent proposes and the reviewer releases.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-user-circle /><p><code>pulumi whoami</code> shows which one</p></div>
  <div class="fact"><ph-seal-check /><p>Self-approval is a ruleset setting</p></div>
  <div class="fact"><ph-scroll /><p>Audit log shows both</p></div>
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
[1.5 min] Demo setup. Two Pulumi Cloud users: an agent user and a reviewer. Switch with a separate login or a second terminal and say which is which each time. If you only have one login, one person plays both roles and self-approval has to be allowed in the ruleset: say so out loud. Prerequisites: Pro or Enterprise org, an AWS account with an OIDC role for ESC, Neo access for step 6.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Gates for agent changes.</h1>
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

# Nine steps take one agent change through every gate

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-package class="step__icon" /><p>Baseline bucket, ESC and a stack</p></div>
  <div class="gpu-card step" v-click><ph-gavel class="step__icon" /><p>Three mandatory policies</p></div>
  <div class="gpu-card step" v-click><ph-prohibit class="step__icon" /><p>Non-compliant change fails at preview</p></div>
  <div class="gpu-card step" v-click><ph-key class="step__icon" /><p>Agent requests the credential</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-seal-check class="step__icon" /><p>Reviewer applies, agent deploys</p></div>
  <div class="gpu-card step" v-click><ph-hand-palm class="step__icon" /><p>Neo pauses by approval mode</p></div>
  <div class="gpu-card step" v-click><ph-scroll class="step__icon" /><p>Audit timeline</p></div>
  <div class="gpu-card gpu-card--accent step" v-click><ph-warning class="step__icon" /><p>Limits drill</p></div>
  <div class="gpu-card step" v-click><ph-trash class="step__icon" /><p>Teardown, in order</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.steps { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.2rem; }
.step { display: flex; flex-direction: column; gap: 0.7rem; padding: 1.2rem 1.3rem; }
.step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.step__icon { font-size: 2rem; color: var(--p-primary); }
</style>

<!--
[2 min] Nine steps, numbered 01 to 09 in the demo folder. Name them, do not explain them. Fallback: every step has a script and an expected-output note, so a failed step can be shown from the recorded output; say which step is recorded. If the org lacks ESC approvals or audit logs, run steps 1 to 3 live and show steps 4, 5 and 7 from recordings. A policy pack needs Node.js or Python where it runs; check that before the session.
-->

---

# 1 · A compliant baseline gives every gate something to guard

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />01-baseline</div>
    <div class="big-code code-sm">

```bash
pulumi up
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-cloud-check /><span>Stack agent-gates, S3 bucket, ESC environment</span></li>
    <li><ph-key /><span>Credentials come from ESC, not your shell</span></li>
    <li><ph-check-circle /><span>The bucket is tagged, private and encrypted</span></li>
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
[3 min] Folder 01-baseline, script setup.sh. It creates the ESC environment, the stack agent-gates and runs pulumi preview, then pulumi up. Show pulumi config to prove the environment is linked. Linking an environment changes which credentials the stack uses: say it. Fallback: if AWS or OIDC fails, show the recorded output and stop; later steps need this stack.
-->

---

# 2 · Three mandatory policies guard every bucket

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
pulumi policy publish "$ORG"
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-tag /><div><div class="gpu-caption gpu-caption--accent">1 · Tags</div><code>s3-required-tags</code></div></div>
  <div class="gpu-card check" v-click><ph-lock /><div><div class="gpu-caption gpu-caption--accent">2 · Public access</div><code>s3-public-access-block</code></div></div>
  <div class="gpu-card check" v-click><ph-shield-check /><div><div class="gpu-caption gpu-caption--accent">3 · Encryption</div><code>s3-server-side-encryption</code></div></div>
  <div class="gpu-card check" v-click><ph-package /><div><div class="gpu-caption gpu-caption--accent">4 · Publish</div><code>pulumi policy publish</code></div></div>
  <div class="gpu-card check" v-click><ph-toggle-right /><div><div class="gpu-caption gpu-caption--accent">5 · Enable</div><code>pulumi policy enable ... latest</code></div></div>
  <div class="gpu-card check" v-click><ph-prohibit /><div><div class="gpu-caption gpu-caption--accent">6 · Level</div><code>mandatory</code></div></div>
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
[3 min] Folder 02-policy-pack, publish.sh. The pack agent-gates-s3 holds three resource policies, all mandatory. publish.sh then runs pulumi policy enable for the pack at latest, in a policy group if GROUP is set. Fallback: if policy groups are not on the org, run step 3 with POLICY_PACK_DIR so preview uses --policy-pack locally.
-->

---

# 3 · A non-compliant change fails at preview with three named violations

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
pulumi preview
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-user-circle /><div><div class="gpu-caption gpu-caption--accent">1 · Identity</div><code>pulumi whoami</code></div></div>
  <div class="gpu-card check" v-click><ph-tag /><div><div class="gpu-caption gpu-caption--accent">2 · Violation 1</div><code>s3-required-tags</code></div></div>
  <div class="gpu-card check" v-click><ph-lock /><div><div class="gpu-caption gpu-caption--accent">3 · Violation 2</div><code>s3-public-access-block</code></div></div>
  <div class="gpu-card check" v-click><ph-shield-check /><div><div class="gpu-caption gpu-caption--accent">4 · Violation 3</div><code>s3-server-side-encryption</code></div></div>
  <div class="gpu-card check" v-click><ph-x-circle /><div><div class="gpu-caption gpu-caption--accent">5 · Exit code</div><code>non-zero</code></div></div>
  <div class="gpu-card check" v-click><ph-cloud /><div><div class="gpu-caption gpu-caption--accent">6 · Cloud</div><code>nothing changed</code></div></div>
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
[4 min] Folder 03-agent-change, agent.sh. The agent adds a second bucket with no tags, no public access block and no encryption (agentChange set to noncompliant), then runs pulumi preview. Expected: a non-zero exit and three named violations, and nothing reaches AWS. Then run fix.sh: the same preview passes. Fallback: if the violations do not show, check that the pack is enabled for this stack's group.
-->

---

# 4 · The agent cannot open the credentials until a reviewer approves

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />04-approval-gate</div>
    <div class="big-code code-sm">

```bash
pulumi env open-request "$(esc_fqn)" \
  --reason "$REASON" \
  --access-duration-seconds "$ACCESS_DURATION" \
  --grant-expiration-seconds "$GRANT_EXPIRATION"
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-user-circle /><span>Run as the agent identity</span></li>
    <li><ph-chat-text /><span>The request carries a reason</span></li>
    <li><ph-hourglass /><span>A pending request, and nothing else changes</span></li>
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
[5 min] Folder 04-approval-gate, request-open.sh. Defaults are 30m for access and 4h for grant expiry. The request appears in the Approvals tab of the environment. Before this, an Open approval ruleset is switched on in the console for the credential environment (setup in the folder README). Fallback: if the org has no ESC approvals, show the console Approvals tab from a recording.
-->

---

# 5 · Approval alone grants nothing: the reviewer applies, then the agent deploys

<div class="zoom-content">

<div class="s5__cmd big-code code-sm">

```bash
pulumi up --cwd "$PROGRAM_DIR" --stack "$STACK"
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-seal-check /><span>Reviewer approves the request</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-check-circle /><span>Reviewer applies it: the grant is live</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-rocket-launch /><span>Agent runs pulumi up inside the window</span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Before the apply</div><p>The same command fails to open the environment.</p></aside>
    <aside class="info-card" v-click="5"><div class="info-card__label">After the window</div><p>Access ends; ask again.</p></aside>
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
[5 min] Folder 05-review-and-apply. review-steps.sh lists what the reviewer checks: the preview diff, the policy result, who asked and why. Approve, then apply, in the console; approval alone grants nothing. Then agent-up.sh runs pulumi preview and pulumi up. Show the failure first if time allows: without an active grant the update fails at once and does not wait. verify-bucket.sh checks the bucket. Fallback: if the apply step cannot be shown live, play the recording of steps 4 and 5.
-->

---

# 6 · Neo pauses exactly where its approval mode says

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
pulumi neo --org "$ORG" --stack "$STACK" \
  --cwd "$PROGRAM_DIR" --approval-mode "$MODE" \
  --permission-mode "$PERMISSION" "$(cat "$PROMPT_FILE")"
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-hand-palm /><div><div class="gpu-caption gpu-caption--accent">1 · manual</div><code>asks before preview, up, PR</code></div></div>
  <div class="gpu-card check" v-click><ph-scales /><div><div class="gpu-caption gpu-caption--accent">2 · balanced</div><code>asks before pulumi up</code></div></div>
  <div class="gpu-card check" v-click><ph-lightning /><div><div class="gpu-caption gpu-caption--accent">3 · auto</div><code>never asks</code></div></div>
  <div class="gpu-card check" v-click><ph-eye /><div><div class="gpu-caption gpu-caption--accent">4 · read-only</div><code>reads, no cloud writes</code></div></div>
  <div class="gpu-card check" v-click><ph-user-circle /><div><div class="gpu-caption gpu-caption--accent">5 · Identity</div><code>the acting user's login</code></div></div>
  <div class="gpu-card check" v-click><ph-key /><div><div class="gpu-caption gpu-caption--accent">6 · Credential</div><code>same environment, same gate</code></div></div>
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
[6 min] Folder 06-neo-approval-modes, neo-cli.sh takes manual, balanced or readonly. The task prompt is in task-prompt.txt. In the CLI, manual is the mode the console calls Review. Run it twice and show the pause points move. Fallback: if Neo is not enabled for the org or the CLI is missing, show the recording of the three runs and say so; the claim on slide 26 comes from the Neo permissions page.
-->

---

# 7 · One audit timeline shows the whole change, attributed

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />07-audit-trail</div>
    <div class="big-code code-sm">

```bash
pulumi org audit-log list --org "$ORG" --start-time "$START" --all --output json
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-user-circle /><span>Run as an org admin, filtered to the agent user</span></li>
    <li><ph-scroll /><span>timeline.py maps events to workshop steps</span></li>
    <li><ph-clock /><span>One timeline, attributed</span></li>
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
[4 min] Folder 07-audit-trail, export.sh then timeline.py. The command is marked experimental in the CLI reference; export.sh adds --end-time and --user when set. Audit logs need an org admin and the Pro or Enterprise edition. Fallback: if the command is missing or changed, use Console, Settings, Audit Logs, filter by user and time, export JSON; timeline.py reads that file too.
-->

---

# 8 · An automated deployment cannot hold an open grant

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
pulumi deployment run update --stack "$STACK" --suppress-stream-logs=false
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-user-circle /><div><div class="gpu-caption gpu-caption--accent">1 · User run</div><code>uses your grant</code></div></div>
  <div class="gpu-card check" v-click><ph-prohibit /><div><div class="gpu-caption gpu-caption--accent">2 · No grant</div><code>fails, does not wait</code></div></div>
  <div class="gpu-card check" v-click><ph-git-pull-request /><div><div class="gpu-caption gpu-caption--accent">3 · Git push</div><code>ephemeral stack token</code></div></div>
  <div class="gpu-card check" v-click><ph-git-merge /><div><div class="gpu-caption gpu-caption--accent">4 · Pull request</div><code>ephemeral stack token</code></div></div>
  <div class="gpu-card check" v-click><ph-key /><div><div class="gpu-caption gpu-caption--accent">5 · Workaround</div><code>dedicated access token</code></div></div>
  <div class="gpu-card check" v-click><ph-hand-palm /><div><div class="gpu-caption gpu-caption--accent">6 · Approve</div><code>ahead of each run</code></div></div>
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
[4 min] Folder 08-limits-drill, limits-drill.sh user. A user-initiated deployment opens the environment as you, so with an active grant it runs and without one it fails. Git-push and pull-request deployments cannot hold a grant, which the Gated deployments guide documents; connecting a repository is not part of this folder, so show that part from the console. Fallback: run limits-drill.sh explain to print the limits.
-->

---

# 9 · Teardown runs in order, with the ruleset first

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />09-teardown</div>
    <div class="big-code code-sm">

```bash
pulumi destroy --cwd "$PROGRAM_DIR" --stack "$STACK"
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-toggle-left /><span>First: disable the Open ruleset in the console</span></li>
    <li><ph-trash /><span>Then destroy, remove the stack and environments</span></li>
    <li><ph-check-circle /><span>End state: no stack, bucket, environment or policy group</span></li>
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
[2 min] Folder 09-teardown, teardown.sh. Order matters: pulumi destroy opens the credential environment, so disable the Open ruleset first or the destroy needs a grant. Then stack rm, env remove, policy disable and remove, the IAM role, and a check that no buckets remain. Every destructive step asks first. Confirm the stack name aloud before destroying.
-->

---

# Six questions, six answers

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-prohibit class="step-icon" /><div class="gpu-caption gpu-caption--accent">Stops it</div><p>Mandatory policies at preview</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-seal-check class="step-icon" /><div class="gpu-caption gpu-caption--accent">Signs off</div><p>An open approval on the credential</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-pause-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Pauses</div><p>Review, Balanced or Auto</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-door-open class="step-icon" /><div class="gpu-caption gpu-caption--accent">Left open</div><p>Reads stay open; RBAC bounds them</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-scroll class="step-icon" /><div class="gpu-caption gpu-caption--accent">Records</div><p>Audit log, exported by user and time</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-warning class="step-icon" /><div class="gpu-caption gpu-caption--accent">Limits</div><p>Automated deployments cannot hold a grant</p></div>
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
[2 min] Close the loop. Every card is now answered, and each answer was shown in a numbered step. Then the take-back list: write one mandatory policy, put one approval on the credential, export one audit timeline. Fallback if the demo failed: show the recorded step outputs and say which steps were recorded.
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/gates-for-agent-made-infrastructure-changes" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → gates-for-agent-made-infrastructure-changes</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/esc/concepts/approvals/" dark="#000000" />
    <div class="res-card__title">ESC approvals</div>
    <div class="res-card__body">pulumi.com/docs/esc/concepts/approvals</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/" dark="#000000" />
    <div class="res-card__title">Write a policy pack</div>
    <div class="res-card__body">pulumi.com/docs/discovery-governance</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/administration/concepts/audit-logs/" dark="#000000" />
    <div class="res-card__title">Audit logs</div>
    <div class="res-card__body">pulumi.com/docs/administration</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/ai/concepts/neo/permissions/" dark="#000000" />
    <div class="res-card__title">Neo permissions</div>
    <div class="res-card__body">pulumi.com/docs/ai/concepts/neo</div>
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/gates-for-agent-made-infrastructure-changes" dark="#000000" /></div>
      <div class="thanks__qr-label">gates-for-agent-made-infrastructure-changes</div>
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
