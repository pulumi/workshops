---
theme: "@pulumi/slidev-theme"
title: "AI Agents for IT Ops"
info: |
  AI Agents for IT Ops: Managed Agent in Microsoft Foundry.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/ai-agents-for-it-ops-managed-agent-in-microsoft-foundry
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
    AI Agents for IT Ops
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Managed Agent in Microsoft Foundry
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>


<!--
[0.25 min] Welcome them in and give the room a beat to settle before housekeeping.
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
[0.5 min] Speaker introduces themselves: role, what they build day to day, and why this topic matters to them.
-->
---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>


<!--
[0.25 min] One-breath transition into logistics and the agenda.
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
[0.75 min] Cover wifi, breaks, the Q&A tab, and where the recording and handouts land.
-->
---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>Why agents need answerable operators</li>
  <li>The Foundry platform, as Pulumi code</li>
  <li>The agent Azure won't give an ARM resource</li>
  <li>Grounding the agent in your own runbooks</li>
  <li>Live demo: start to teardown</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>


<!--
[0.75 min] Walk the agenda top to bottom so the audience knows the shape of the next 90 minutes.
-->
---

# "I have failed you completely and catastrophically."

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">The agent's own words</div>
    <p>"I have failed you completely and catastrophically. My review of the commands confirms my gross incompetence."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>Asked to rename a directory and move its contents elsewhere</li>
      <li>A directory-creation call silently failed. It kept going anyway</li>
      <li>Cascading moves scattered the files across the filesystem</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span><strong>Psssst…</strong> days later the files turned up at the root of the C: drive. Misplaced, not gone.</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
[3.25 min] This is Gemini CLI, July 2025, a different vendor's tool, and still
the clearest public case of an agent narrating its own actions wrong in both
directions: first insisting it had destroyed the files, then turning out to
have only misplaced them. Source: GitHub issue google-gemini/gemini-cli#4586;
WinBuzzer, 2025-07-26. The point for today: an agent's own account of what it
did is not verification. You need a place outside the agent that says what
happened.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The agent apologized instantly.</h1>
</div>

<!--
[1.25 min] Beat one of two. Let it land before the next slide.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Nobody could tell what it had done.</h1>
</div>

<!--
[1.25 min] Beat two. That gap between the apology and the facts is the whole
problem this workshop is about. An instant, sincere-sounding apology tells
you nothing about what happened; only looking outside the agent does.
-->

---

# Managed doesn't yet mean it has an ARM resource

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">A self-managed agent runtime</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>You run the container or the VM</li>
      <li>You own every log and every audit trail</li>
      <li>Nothing about the runtime is hidden from you</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">A Foundry-managed agent</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Azure hosts the runtime for you</li>
      <li>The agent itself still isn't an ARM resource</li>
      <li>Microsoft's own quickstart has no Bicep, ARM, or Terraform tab</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.35; }
</style>

<!--
[2.75 min] If your workshop runs the AKS sibling of this session, that one is
self-managed: you stood up the runtime yourself, so you also own its logs.
This one hands the runtime to Azure. That sounds like it settles the
question, until you go looking for the agent in the Azure resource graph and
it isn't there as its own resource. Managed doesn't mean accounted for.
-->

---

# Five questions before you'd trust it with your ops runbooks

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--muted">Who</div><p>Who provisioned this, and can you prove it?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--muted">What</div><p>What is it running as, and what can it touch?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--muted">Where</div><p>Where is the resource for the agent itself?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-folder-open class="step-icon" /><div class="gpu-caption gpu-caption--muted">Grounded in</div><p>What is it grounded in, and can you scope that down?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-magnifying-glass class="step-icon" /><div class="gpu-caption gpu-caption--muted">Verify</div><p>How do you verify what it did?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[3.25 min] These five carry the rest of the session. The first four get answered
before we touch the keyboard. The fifth only the demo can answer, because
verifying what an agent did means going and looking, not asking it.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Who provisioned this, and can you prove it?</h1>
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
[1.0 min] Question one of five.
-->

---

# The platform is Python, not portal clicks

<div class="zoom-content">

<div class="term">
  <div class="term__bar"><span /><span /><span /><div class="term__title">workshop layout</div></div>
  <div class="term__row term__row--demo" v-click>
    <code class="term__flag">02-foundry-platform/</code>
    <div class="term__desc">resource group, AIServices account, project, model deployment</div>
  </div>
  <div class="term__row term__row--demo" v-click>
    <code class="term__flag">03-agent/</code>
    <div class="term__desc">the prompt agent itself</div>
  </div>
  <div class="term__row term__row--demo" v-click>
    <code class="term__flag">04-tool-connection/</code>
    <div class="term__desc">blob container, connection, file-search tool</div>
  </div>
  <div class="term__row" v-click>
    <code class="term__flag">05-exercise/</code>
    <div class="term__desc">a script that asks the agent a question</div>
  </div>
  <div class="term__row" v-click>
    <code class="term__flag">06-teardown/</code>
    <div class="term__desc">reverse-order destroy plus a purge check</div>
  </div>
</div>

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
.term__flag { font-size: 1.1rem !important; font-weight: 600; background: transparent !important; padding: 0 !important; }
.term__row:not(.term__row--demo) .term__flag { color: var(--p-fg-muted) !important; }
.term__desc { font-size: 1.15rem; color: var(--p-fg); }
.term__row:not(.term__row--demo) .term__desc { color: var(--p-fg-muted); }
</style>

<!--
[3.25 min] Five numbered folders, each its own Pulumi Python project with its own
Pulumi.yaml and its own virtual environment. The three highlighted rows are
the platform itself, the resources we're accountable for. 05 and 06 are
tooling around it: asking the agent something, and proving the teardown
finished.
-->

---

# You see the plan before anything runs

<div class="zoom-content">

<div class="term">
  <div class="term__bar"><span /><span /><span /><div class="term__title">pulumi lifecycle</div></div>
  <div class="term__row term__row--demo" v-click>
    <code class="term__flag">pulumi preview</code>
    <div class="term__desc">every planned change, against real state, before it happens</div>
  </div>
  <div class="term__row term__row--demo" v-click>
    <code class="term__flag">pulumi up</code>
    <div class="term__desc">applies only what you just reviewed</div>
  </div>
  <div class="term__row" v-click>
    <code class="term__flag">pulumi up --yes</code>
    <div class="term__desc">skips that review; not used in this workshop</div>
  </div>
  <div class="term__row term__row--demo" v-click>
    <code class="term__flag">pulumi destroy</code>
    <div class="term__desc">removes every resource the stack tracks</div>
  </div>
</div>

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
.term__desc { font-size: 1.15rem; color: var(--p-fg); }
.term__row:not(.term__row--demo) .term__desc { color: var(--p-fg-muted); }
</style>

<!--
[3.25 min] This is the proof for question one. A plan you can read is something
you can hold someone to, including an agent. Every folder in this demo gets
previewed before it gets applied. That's the habit, not a one-time step.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What is it running as, and what can it touch?</h1>
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
[1.0 min] Question two.
-->

---

# The Foundry platform is ordinary Azure resources

<div class="zoom-content">

<div class="compose">
  <div class="compose__stack">
    <div class="gpu-caption">02-foundry-platform</div>
    <div class="piece piece--mixin" v-click="4"><ph-rocket-launch />deployment · gpt-4o</div>
    <div class="piece piece--mixin" v-click="3"><ph-folder-open />project · foundry-project</div>
    <div class="piece piece--sandbox" v-click="2"><ph-brain />account · kind AIServices</div>
    <div class="piece piece--template" v-click="1"><ph-cube />resource group · foundry-rg</div>
  </div>
  <ul class="rules" v-click="5">
    <li><ph-cube /><span>One resource group anchors the platform</span></li>
    <li><ph-brain /><span>The account is the Foundry resource kind: AIServices</span></li>
    <li><ph-folder-open /><span>The project is a child of that account</span></li>
    <li><ph-rocket-launch /><span>A model deployment attaches gpt-4o to it</span></li>
    <li><ph-scroll /><span>Every piece is an ordinary resource, in Pulumi state</span></li>
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
[3.25 min] Four resources, one dependency chain, all azure-native. The account's
kind is what makes it a Foundry resource instead of a plain Cognitive
Services account; the project sits under it, and the deployment gives the
account an actual model to call.
-->

---

# Ordinary resources means ordinary Azure RBAC

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Without an ARM resource</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>No resource ID for a role assignment to scope to</li>
      <li>No entry in the Activity Log when something changes</li>
      <li>Azure Resource Graph has nothing to find</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">With the account and project as ARM resources</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Role assignments scope to the account or the resource group</li>
      <li>Every create and update lands in the Activity Log</li>
      <li>Azure Resource Graph finds them like anything else</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.35; }
</style>

<!--
[2.75 min] This is the payoff of question two: because the account and the
project are ordinary ARM resources, "what can it touch" is answered with the
same RBAC and the same audit trail as every other resource in the
subscription. No separate permission model to learn. The agent itself is a
different story, and that's question three.
-->

---

# Two questions answered, three to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>Python in Pulumi state, reviewed with preview</p></div>
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">What</div><p>Ordinary azure-native resources, ordinary RBAC</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--muted">Where</div><p>Where is the resource for the agent itself?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-folder-open class="step-icon" /><div class="gpu-caption gpu-caption--muted">Grounded in</div><p>What is it grounded in, and can you scope that down?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-magnifying-glass class="step-icon" /><div class="gpu-caption gpu-caption--muted">Verify</div><p>How do you verify what it did?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.13rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; opacity: 0.9; }
</style>

<!--
[1.75 min] Two down. The next one is the odd resource out.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Where is the resource for the agent itself?</h1>
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
[1.0 min] Question three, and the one with the least satisfying answer.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[90%]">Microsoft's own quickstart has no ARM tab for this.</h1>
</div>

<!--
[2.25 min] Look at the "Create a prompt agent" quickstart in the Microsoft
Foundry docs, read this run: the SDK tabs are there, Bicep, ARM template and
Terraform are not. The agent is a data-plane object the SDK creates inside a
project, not a resource type in the Azure Resource Manager schema.
-->

---

# A local command gives it a real create-and-delete lifecycle anyway

<div class="zoom-content">

<div class="chain">
  <div class="chain__step" v-click>
    <div class="gpu-card gpu-card--muted"><ph-terminal-window class="chain__icon" /><div class="gpu-caption gpu-caption--muted">pulumi up</div><p>You run the lifecycle command</p></div>
  </div>
  <ph-arrow-right class="chain__arrow" v-click />
  <div class="chain__step" v-click>
    <div class="gpu-card gpu-card--primary"><ph-code class="chain__icon" /><div class="gpu-caption gpu-caption--accent">command.local.Command</div><p>wraps the azure-ai-projects SDK call</p></div>
  </div>
  <ph-arrow-right class="chain__arrow" v-click />
  <div class="chain__step" v-click>
    <div class="gpu-card gpu-card--muted"><ph-brain class="chain__icon" /><div class="gpu-caption gpu-caption--muted">Foundry agent</div><p>create_version, then delete_version</p></div>
  </div>
</div>

<p class="chain__summary" v-click>The agent still gets a tracked create and delete, not an untracked portal click.</p>

<ul class="rules rules--row" v-click>
  <li><ph-arrows-clockwise /><span>create_version on up, delete_version on destroy</span></li>
  <li><ph-scroll /><span>Tracked in Pulumi state like any other resource</span></li>
  <li><ph-cube /><span>No azure-native resource type exists for it yet</span></li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.chain { display: flex; align-items: stretch; gap: 1.2rem; }
.chain__step { flex: 1; }
.chain__step .gpu-card { height: 100%; display: flex; flex-direction: column; gap: 0.4rem; }
.chain__step p { margin: 0 !important; font-size: 1.05rem; }
.chain__icon { font-size: 1.8rem; color: var(--p-primary); }
.chain__arrow { align-self: center; font-size: 1.8rem; color: var(--p-fg-muted); flex-shrink: 0; }
.chain__summary { text-align: center; font-size: 1.25rem; margin: 1.6rem 0 1.2rem; color: var(--p-fg); }
.rules--row { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem; }
.rules--row li { display: flex; align-items: center; gap: 0.7rem; font-size: 1.05rem; margin: 0; }
.rules--row li svg { flex-shrink: 0; font-size: 1.4rem; color: var(--p-primary); }
</style>

<!--
[3.25 min] This is 03-agent's actual shape: a pulumi_command.local.Command whose
create and delete each shell out to the Azure AI Projects SDK. It's a
workaround, and it's an honest one. You get dependency tracking, a real
delete on destroy, and something StackReference can point at, three years
before there might be a native resource type.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[5.5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What is it grounded in, and can you scope that down?</h1>
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
[1.0 min] Question four.
-->

---

# The runbooks live in one private container, not the whole tenant

<div class="zoom-content">

<div class="zones">
  <div class="zone zone--in" v-click>
    <div class="gpu-caption gpu-caption--accent">Blob container: runbooks</div>
    <ul class="!mt-3 !text-[1.15rem] !leading-relaxed space-y-2">
      <li>restart-service.md, disk-space-cleanup.md, network-outage-triage.md</li>
      <li>Public access: None</li>
      <li>allow_shared_key_access: False</li>
    </ul>
  </div>
  <ph-arrows-left-right class="zones__arrow" v-click />
  <div class="zone zone--out" v-click>
    <ph-buildings class="zone__hero" />
    <div class="gpu-caption gpu-caption--muted">The rest of the tenant</div>
    <p>Nothing else is wired to this agent</p>
  </div>
</div>

<div class="callout" v-click>
  <ph-lock-key class="callout__icon" />
  <span>The agent, and any human, reaches the container only through Azure AD. No shared keys.</span>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.zones { display: flex; align-items: stretch; gap: 1.6rem; margin-top: 1rem; }
.zone { flex: 1; border-radius: 16px; padding: 1.4rem 1.6rem; }
.zone--in { border: 1.5px solid color-mix(in srgb, var(--p-primary) 60%, var(--p-border)); background: var(--p-bg-elevated); }
.zone--out { border: 1.5px dashed var(--p-border); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 0.5rem; opacity: 0.75; }
.zone__hero { font-size: 2.6rem; color: var(--p-fg-muted); }
.zone--out p { margin: 0; font-size: 1.1rem; color: var(--p-fg-muted); }
.zones__arrow { align-self: center; font-size: 1.8rem; color: var(--p-fg-muted); flex-shrink: 0; }
.callout { display: flex; align-items: center; gap: 1rem; margin-top: 1.8rem; padding: 1rem 1.4rem; border-radius: 12px; background: var(--p-bg-elevated); border: 1px solid var(--p-border); font-size: 1.15rem; }
.callout__icon { font-size: 1.7rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
[3.25 min] Grounding is a scoping decision, not a technology decision. This
container holds exactly three files, nothing else, and no shared key can
reach it. Whatever the agent can search is the edge of that box.
-->

---

# A connection and a file-search tool, scoped to that container only

<div class="zoom-content">

<div class="flow">
  <div class="flow__step" v-click><ph-folder-open class="flow__icon" /><div class="flow__num">1</div><p>Upload three runbooks to the private container</p></div>
  <ph-arrow-right class="flow__arrow" v-click />
  <div class="flow__step" v-click><ph-plugs-connected class="flow__icon" /><div class="flow__num">2</div><p>A ProjectConnection wires the container in over Azure AD</p></div>
  <ph-arrow-right class="flow__arrow" v-click />
  <div class="flow__step" v-click><ph-puzzle-piece class="flow__icon" /><div class="flow__num">3</div><p>The file-search tool references only that one connection</p></div>
  <ph-arrow-right class="flow__arrow" v-click />
  <div class="flow__step" v-click><ph-check-circle class="flow__icon" /><div class="flow__num">4</div><p>create_version re-creates the agent with the tool attached</p></div>
</div>

<div class="callout" v-click>
  <ph-magnifying-glass class="callout__icon" />
  <span>Scope the container, and you scope what the agent can search. Nothing wider is reachable.</span>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.flow { display: flex; align-items: stretch; gap: 0.9rem; margin-top: 0.6rem; }
.flow__step { flex: 1; position: relative; border: 1.5px solid var(--p-border); border-radius: 14px; padding: 1.3rem 1.1rem 1rem; text-align: center; background: var(--p-bg-elevated); }
.flow__icon { font-size: 2rem; color: var(--p-primary); }
.flow__num { position: absolute; top: -0.7rem; left: -0.7rem; width: 1.8rem; height: 1.8rem; border-radius: 999px; background: var(--p-primary); color: var(--p-bg); font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; }
.flow__step p { margin: 0.7rem 0 0; font-size: 1.02rem; line-height: 1.35; }
.flow__arrow { align-self: center; font-size: 1.5rem; color: var(--p-fg-muted); flex-shrink: 0; }
.callout { display: flex; align-items: center; gap: 1rem; margin-top: 1.8rem; padding: 1rem 1.4rem; border-radius: 12px; background: var(--p-bg-elevated); border: 1px solid var(--p-border); font-size: 1.15rem; }
.callout__icon { font-size: 1.7rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
[3.25 min] This is 04-tool-connection end to end. The connection's auth type is
Azure AD, not a key, and the file-search tool's definition points at that one
connection and nothing else. Re-creating the agent to attach a tool is the
same local-command pattern from the last question.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[90%]">The command wrapped around the agent is still the only thing you can alias or protect.</h1>
</div>

<!--
[2.75 min] Where this breaks today. Pulumi's own safety nets, import, aliases,
protect, refresh, all apply to real resources. The agent itself is
data-plane-only, so those nets sit on the command around it, one layer
removed from the thing they're meant to guard. Worth knowing before you rely
on it.
-->

---

# Four questions answered, one left for the demo

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>Python in Pulumi state, reviewed with preview</p></div>
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">What</div><p>Ordinary azure-native resources, ordinary RBAC</p></div>
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--accent">Where</div><p>A tracked local command, not a portal click</p></div>
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-folder-open class="step-icon" /><div class="gpu-caption gpu-caption--accent">Grounded in</div><p>One private, AAD-only container. Nothing wider</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-magnifying-glass class="step-icon" /><div class="gpu-caption gpu-caption--muted">Verify</div><p>How do you verify what it did, and that it's really gone?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.1rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; opacity: 0.9; }
</style>

<!--
[1.75 min] Four settled from code you can read before it runs. The last one only
the demo answers, because verifying an agent means going and looking at what
it touched, not trusting what it says about itself.
-->

---

# Three small Pulumi programs, chained by StackReference

<div class="zoom-content">

<div class="chain">
  <div class="chain__step" v-click>
    <div class="gpu-card gpu-card--primary"><ph-cube class="chain__icon" /><div class="gpu-caption gpu-caption--accent">02-foundry-platform</div><p>Resource group, account, project, deployment</p></div>
  </div>
  <ph-arrow-right class="chain__arrow" v-click />
  <div class="chain__step" v-click>
    <div class="gpu-card gpu-card--primary"><ph-brain class="chain__icon" /><div class="gpu-caption gpu-caption--accent">03-agent</div><p>The prompt agent, via a local command</p></div>
  </div>
  <ph-arrow-right class="chain__arrow" v-click />
  <div class="chain__step" v-click>
    <div class="gpu-card gpu-card--primary"><ph-plugs-connected class="chain__icon" /><div class="gpu-caption gpu-caption--accent">04-tool-connection</div><p>Blob container, connection, file-search tool</p></div>
  </div>
</div>

<p class="chain__summary" v-click>Each arrow is a pulumi.StackReference reading the upstream stack's own outputs.</p>

<ul class="rules rules--row" v-click>
  <li><ph-scroll /><span>Each folder has its own Pulumi.yaml and its own virtualenv</span></li>
  <li><ph-arrows-clockwise /><span>StackReference reads outputs, never shares source</span></li>
  <li><ph-terminal-window /><span>pulumi up runs three times, once per folder, in order</span></li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.chain { display: flex; align-items: stretch; gap: 1.2rem; }
.chain__step { flex: 1; }
.chain__step .gpu-card { height: 100%; display: flex; flex-direction: column; gap: 0.4rem; }
.chain__step p { margin: 0 !important; font-size: 1.05rem; }
.chain__icon { font-size: 1.8rem; color: var(--p-primary); }
.chain__arrow { align-self: center; font-size: 1.8rem; color: var(--p-fg-muted); flex-shrink: 0; }
.chain__summary { text-align: center; font-size: 1.25rem; margin: 1.6rem 0 1.2rem; color: var(--p-fg); }
.rules--row { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem; }
.rules--row li { display: flex; align-items: center; gap: 0.7rem; font-size: 1.05rem; margin: 0; }
.rules--row li svg { flex-shrink: 0; font-size: 1.4rem; color: var(--p-primary); }
</style>

<!--
[3.25 min] Not one program, three, each a separate Pulumi project you could hand
to a different owner. StackReference is the only thing connecting them: the
agent's program reads the platform's outputs, and the tool-connection
program reads both. This is what we run in the demo, in this order.
-->

---

# The shape of the platform code

<div class="zoom-content">

<div class="big-code code-sm">

```python
account = azure_native.cognitiveservices.Account(
    "foundry-account",
    resource_group_name=resource_group.name,
    kind="AIServices")

project = azure_native.cognitiveservices.Project(
    "foundry-project",
    resource_group_name=resource_group.name,
    account_name=account.name)
```

</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
</style>

<!--
[3.75 min] Trimmed for the slide: the real call also sets sku, identity and a
custom subdomain. The one line worth pointing at is kind="AIServices". Change
that string and this becomes a plain Cognitive Services account with no
Foundry project underneath it. Everything else on this slide is ordinary
Pulumi: a resource, a dependency, a name.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Managed agent, start to teardown.</h1>
  </div>
</div>

<!--
[0.25 min] Transition line: everything so far has been the plan, this is it running for real.
-->

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
  <div class="gpu-card step" v-click><ph-cube class="step__icon" /><p>The Foundry platform comes up as Pulumi state</p></div>
  <div class="gpu-card step" v-click><ph-robot class="step__icon" /><p>The agent exists, with no ARM resource behind it</p></div>
  <div class="gpu-card step" v-click><ph-magnifying-glass class="step__icon" /><p>The agent can now search the org's own runbooks</p></div>
  <div class="gpu-card step" v-click><ph-chat-circle-text class="step__icon" /><p>The agent answers, and names the runbook it used</p></div>
  <div class="gpu-card gpu-card--accent step" v-click><ph-shield-check class="step__icon" /><p>Destroy alone isn't proof of a clean exit, so we check</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.steps { display: grid; grid-template-columns: 1fr; gap: 0.9rem; max-width: 900px; margin: 0 auto; }
.step { display: flex; flex-direction: row; align-items: center; gap: 1rem; padding: 1rem 1.3rem; }
.step p { margin: 0 !important; font-size: 1.25rem; line-height: 1.35; }
.step__icon { font-size: 1.8rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
Presenter: 01-preflight already ran before the session: CLI, az login, region and quota all
checked. Walk through these five outcomes as the map for the next twenty minutes, then move
straight into 02-foundry-platform. [3.25 min]
-->

---

# The Foundry platform comes up as Pulumi state

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder />02-foundry-platform</div>
    <div class="big-code code-sm">

```bash
pulumi up --yes
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-buildings /><span>A resource group, then a Foundry <code>Account</code> (kind <code>AIServices</code>)</span></li>
    <li><ph-cube /><span>A <code>Project</code>, a child of that account</span></li>
    <li><ph-cpu /><span>A <code>Deployment</code> of <code>gpt-4o</code> (2024-11-20)</span></li>
    <li><ph-export /><span>Outputs <code>project_endpoint</code> and <code>deployment_name</code> for the next folder</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.1fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.2rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
Presenter: cd into 02-foundry-platform (venv already created during preflight) and run this live.
The apply takes a minute or two. Narrate the resource graph while it runs. If it is slow, have
the completed `pulumi up` output from a prior dry run ready to show instead. [4.5 min]
-->

---

# The agent exists, with no ARM resource behind it

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder />03-agent</div>
    <div class="big-code code-sm">

```bash
pulumi up --yes
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-magnifying-glass /><span>Nothing new shows up in the Azure console</span></li>
    <li><ph-terminal-window /><span>Stdout is the agent's id, printed by <code>agent.py</code></span></li>
    <li><ph-export /><span>Captured as the <code>agent_id</code> stack output</span></li>
    <li><ph-arrow-counter-clockwise /><span><code>pulumi destroy</code> here still calls <code>delete_version</code></span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.1fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.2rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
Presenter: same folder pattern as before: fresh venv, `pulumi up --yes`. The point to land here
is absence: open the Azure portal's resource group and show nothing agent-shaped appeared, only
the local.Command's stdout in the Pulumi CLI. If the SDK method names have drifted from what this
program calls, the command fails loudly rather than silently; have the printed agent id from a
prior successful run ready to show if that happens. [4.5 min]
-->

---

# The agent can now search the org's own runbooks

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder />04-tool-connection</div>
    <div class="big-code code-sm">

```bash
pulumi up --yes
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-file-text /><span>Uploads <code>restart-service.md</code>, <code>disk-space-cleanup.md</code>, <code>network-outage-triage.md</code></span></li>
    <li><ph-link /><span>A <code>ProjectConnection</code> wires the container into the project (<code>auth_type="AAD"</code>)</span></li>
    <li><ph-arrows-clockwise /><span>The agent is re-created as version 2, now with a file-search tool</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.s1 { display: grid; grid-template-columns: 1fr 1.15fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.15rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
Presenter: this folder's `pulumi up` both uploads the three runbooks and re-creates the agent with
the file-search tool attached, in one apply. Call out the three real filenames as they upload.
The next slide's question depends on the agent citing one of them by name. [4.5 min]
-->

---

# The agent answers, and names the runbook it used

<div class="zoom-content">

<div class="s5__cmd big-code code-sm">

```bash
./venv/bin/python3 ask-agent.py
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-terminal-window /><span>Sends the default question: "One of our services is hung and not responding to health checks: what should I do?"</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-chat-circle-text /><span>The agent answers over its file-search tool</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-file-text /><span>The answer names the runbook it drew from</span></div>
  </div>
  <div class="s5__side">
    <ul class="s5__files" v-click="4">
      <li><ph-file-text /><span><code>restart-service.md</code></span></li>
      <li><ph-file-text /><span><code>disk-space-cleanup.md</code></span></li>
      <li><ph-file-text /><span><code>network-outage-triage.md</code></span></li>
    </ul>
    <aside class="info-card" v-click="5"><div class="info-card__label">If it doesn't cite one</div><p>Nothing in the runbooks answered it: the system prompt says so, plainly, instead of guessing.</p></aside>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.15; }
.s5__cmd pre { margin: 0 !important; white-space: pre-wrap; }
.s5 { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center; margin-top: 1.2rem; }
.s5__flow { display: flex; flex-direction: column; align-items: stretch; }
.s5__step { display: flex; align-items: center; gap: 0.8rem; padding: 0.7rem 1rem; border: 1.5px solid var(--p-border); border-radius: 12px; background: var(--p-bg-elevated); font-size: 1.05rem; }
.s5__step svg { flex-shrink: 0; font-size: 1.4rem; color: var(--p-primary); }
.s5__step--stop { border-color: color-mix(in srgb, var(--p-primary) 60%, var(--p-border)); background: var(--p-bg); font-weight: 600; }
.s5__arrow { align-self: center; font-size: 1.1rem; color: var(--p-accent); margin: 0.2rem 0; }
.s5__side { display: flex; flex-direction: column; gap: 1rem; }
.s5__files { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem; }
.s5__files li { display: flex; align-items: center; gap: 0.7rem; font-size: 1.1rem; padding: 0.6rem 1rem; border-radius: 10px; background: var(--p-bg-elevated); }
.s5__files li svg { flex-shrink: 0; font-size: 1.3rem; color: var(--p-primary); }
.s5__side .info-card { margin-top: 0; }
</style>

<!--
Presenter: this is the one live network call in the demo. It can be slow or occasionally rate
limited. Run it early in this slide's time and narrate while it resolves; if it stalls, have a
captured transcript of a prior successful run ready to paste in rather than waiting live. [4.5 min]
-->

---

# Destroy alone is not proof of a clean exit

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
06-teardown/teardown.sh
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-arrow-counter-clockwise /><div><div class="gpu-caption gpu-caption--accent">1 · Stacks</div><code>pulumi destroy</code>, 04 &rarr; 03 &rarr; 02</div></div>
  <div class="gpu-card check" v-click><ph-x-circle /><div><div class="gpu-caption gpu-caption--accent">2 · Account</div><code>az cognitiveservices account show</code></div></div>
  <div class="gpu-card check" v-click><ph-trash /><div><div class="gpu-caption gpu-caption--accent">3 · Soft-delete</div><code>az cognitiveservices account purge</code></div></div>
  <div class="gpu-card check" v-click><ph-x-circle /><div><div class="gpu-caption gpu-caption--accent">4 · Storage</div><code>az storage account show</code></div></div>
</div>

<div class="checks__note">
  <ph-scroll class="checks__icon" /><span>Checks 2-4 run by <code>verify-clean.sh</code>, not <code>teardown.sh</code>: destroy removes resources, but it does not confirm they stayed removed.</span>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.checks { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.9rem; }
.checks__cmd { margin-bottom: 1.1rem; }
.checks__cmd pre { margin: 0 !important; }
.check { display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.2rem; }
.check > svg { flex-shrink: 0; font-size: 1.9rem; color: var(--p-primary); }
.check code { display: inline-block; margin-top: 0.4rem; font-size: 0.85rem !important; background: var(--p-bg) !important; }
.checks__note { display: flex; align-items: center; gap: 0.7rem; margin-top: 1.3rem; }
.checks__icon { font-size: 1.4rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
Presenter: run teardown.sh live, then verify-clean.sh right after. Narrate that Cognitive
Services soft-deletes by default, so a destroyed account can still count against quota until it is
purged. If verify-clean.sh reports FAIL on the account check, wait a few seconds and re-run it.
Azure's delete can lag behind the API returning success. [4.5 min]
-->

---

# Five questions, five answers you could go check yourself

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>Python, in state, reviewable with <code>pulumi preview</code></p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-buildings class="step-icon" /><div class="gpu-caption gpu-caption--accent">What</div><p>An ordinary Account and Project, under normal RBAC</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--accent">Where</div><p>No ARM resource, only a tracked <code>local.Command</code> instead</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-books class="step-icon" /><div class="gpu-caption gpu-caption--accent">Grounded in</div><p>One private container, one scoped file-search tool</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-magnifying-glass class="step-icon" /><div class="gpu-caption gpu-caption--accent">Verify</div><p>A cited runbook, then a purge check that closes the loop</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
</style>

<!--
Presenter: close by pointing back at the section-opener questions from Act 2. Everything up to
Q4 was answered before you ran a single command; Q5 only the demo could answer, and you just
watched it. Thank the room and move to Resources. [3.75 min]
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-4 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/ai-agents-for-it-ops-managed-agent-in-microsoft-foundry" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → ai-agents-for-it-ops-managed-agent-in-microsoft-foundry</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/registry/packages/azure-native/api-docs/cognitiveservices/account/" dark="#000000" />
    <div class="res-card__title">cognitiveservices.Account / Project (Pulumi registry)</div>
    <div class="res-card__body">pulumi.com/registry</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/registry/packages/command/api-docs/local/command/" dark="#000000" />
    <div class="res-card__title">command.local.Command (Pulumi registry)</div>
    <div class="res-card__body">pulumi.com/registry</div>
  </div>
  <div class="res-card">
    <QRCode data="https://learn.microsoft.com/en-us/azure/foundry/agents/quickstarts/prompt-agent" dark="#000000" />
    <div class="res-card__title">Microsoft Foundry Agent Service quickstart</div>
    <div class="res-card__body">learn.microsoft.com</div>
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
[0.5 min] Point at the QR codes and say which one to scan first.
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
[0.25 min] One line on where to keep learning after today.
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/ai-agents-for-it-ops-managed-agent-in-microsoft-foundry" dark="#000000" /></div>
      <div class="thanks__qr-label">ai-agents-for-it-ops-managed-agent-in-microsoft-foundry</div>
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
[0.5 min] Thank the room and open the floor for questions.
-->