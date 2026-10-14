---
theme: "@pulumi/slidev-theme"
title: "AI Agents for IT Ops: Custom Agent on AKS with Azure OpenAI"
info: |
  AI Agents for IT Ops: Custom Agent on AKS with Azure OpenAI: Provision AKS and Azure OpenAI from one Pulumi program, run your own agent on it, and tear it down clean.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/itops-agent-aks-azure-openai
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
    AI Agents for IT Ops: Custom Agent on AKS with Azure OpenAI
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Provision AKS and Azure OpenAI from one Pulumi program, run your own agent on it, and tear it down clean
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
[0.5 min] Title slide. Welcome people, say who we are and what we will build: an agent on AKS that calls Azure OpenAI with no API key, from one Pulumi program.
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
[1.0 min] Speaker slide. Introduce yourself in a sentence. Placeholder until the real speaker data exists.
-->
---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
[0.5 min] Housekeeping and agenda divider. Nothing to say beyond: two quick slides, then we start.
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
[1.0 min] Housekeeping. Questions in the chat, the repo link comes later, and we will tear everything down at the end so nothing keeps billing.
-->
---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>Why agents fail in ops</li>
  <li>Credentials without secrets</li>
  <li>AKS and Azure OpenAI as code</li>
  <li>The agent on the cluster</li>
  <li>Demo: from empty to a model call</li>
  <li>Teardown and cost</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
[1.0 min] Today's agenda. Six parts, about ninety minutes of talk and demo and the rest for questions. Read the six headings out.
-->
---

# A key scraped from public sources was all it took

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">Microsoft's own words</div>
    <p>"exploited exposed customer credentials scraped from public sources to unlawfully access accounts with certain generative AI services."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>Microsoft Digital Crimes Unit, 27 February 2025</li>
      <li>The group it tracks as Storm-2139</li>
      <li>The services included Azure OpenAI Service</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span><strong>The credential was how they got in.</strong> The model was not the weak point.</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
[2.0 min] Read the quote slowly. This is Microsoft describing a case it brought against a group abusing generative AI services. The attackers used credentials that were exposed and scraped from public sources. The source is on Microsoft On the Issues, 27 February 2025. Ask the room who has an API key in an environment variable today. Do not blame anyone. Let the question sit, then move on.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">An agent needs a credential to do anything.</h1>
</div>

<!--
[0.5 min] Whatever the agent does, calls the model, reads a cluster, it has to prove who it is. So there is always a credential somewhere.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">A credential you can copy works for whoever copies it.</h1>
</div>

<!--
[0.5 min] A key does not know who is holding it. Pause, then go to the comparison.
-->

---

# A key works from anywhere; a federated token works for one service account

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">A static key</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Works from any machine that has it</li>
      <li>Lives until someone rotates it</li>
      <li>Ends up in config, logs and repos</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">A federated token</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Issued to one service account</li>
      <li>Expires on its own</li>
      <li>Nothing to store or leak</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[2.5 min] In code, the two look the same: you call the model and it answers. The difference is what happens when someone else gets hold of it. The key works from anywhere until you rotate it. The token is issued to one service account in one cluster and it expires. We will build the second kind today.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Run your own agent and you answer the questions a managed service answered for you.</h1>
</div>

<!--
[1.0 min] With a managed agent service, the provider picked the identity, the permissions and the runtime. When you run your own agent on your own cluster, you pick. The trade is more control and more questions.
-->

---

# Six questions decide whether you can trust it

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--muted">Who</div><p>Who is the agent acting as?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--muted">What</div><p>What may it do?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--muted">Where</div><p>Where does it run?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--muted">With what</div><p>How does it reach the model without a key?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-git-branch class="step-icon" /><div class="gpu-caption gpu-caption--muted">How</div><p>How do we build and change it repeatably?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-shield-check class="step-icon" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>How do we know it works and leaves nothing running?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[3.5 min] Walk the six cards. Who is it acting as. What may it do. Where does it run. How does it reach the model without a key. How do we build and change it repeatably. And how do we know it works and leaves nothing running. The rest of the session follows these questions. Questions one to five get answers in the tech section. Question six is answered by the demo.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Who is the agent acting as?</h1>
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
[0.5 min] Question one.
-->

---

# The agent gets its own identity and uses no person's login

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-user-circle class="plan__icon" />
    <p>A user-assigned managed identity in Azure</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-cube class="plan__icon" />
    <p>A Kubernetes service account in one namespace</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-link class="plan__icon" />
    <p>A federated credential links the two</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-check-circle class="plan__icon" />
    <p>The pod acts as the identity, never as a person</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p><strong>AKS workload identity:</strong> the pod borrows the identity and does not hold it.</p>
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
[2.5 min] Four steps, left to right. First, a user-assigned managed identity: a standing Azure identity that is not a person. Second, a Kubernetes service account in the agent namespace. Third, a federated credential that says: this issuer and this service account may act as that identity. Fourth, the pod acts as the identity. No human login is involved at any point. I am describing the model from the AKS workload identity docs on Microsoft Learn.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What may it do?</h1>
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
[0.5 min] Question two.
-->

---

# One role on one account is the whole permission set

<div class="zoom-content">

<div class="bounds">
  <div class="bound" v-click><ph-brain /><div class="bound__want">call the model</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Cognitive Services OpenAI User, on the one account</div></div>
  <div class="bound" v-click><ph-key /><div class="bound__want">read an API key</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">No key exists: local auth is disabled on the account</div></div>
  <div class="bound" v-click><ph-cloud /><div class="bound__want">touch other Azure resources</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">No other role assignment</div></div>
  <div class="bound" v-click><ph-cube /><div class="bound__want">act outside its pod</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">The federated credential names one service account</div></div>
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
[2.5 min] The identity gets exactly one role, Cognitive Services OpenAI User, scoped to the one Azure OpenAI account. That role lets it call the model. It cannot create deployments or read keys, and in our program the account has API key authentication turned off, so there is no key to read. Each row is a thing the agent might want and what stops it. The role is documented on Microsoft Learn under the managed identity how-to for Azure OpenAI.
-->

---

# Two questions covered, four to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>A user-assigned identity, mapped to one service account</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">What</div><p>One role on one account, no key</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-cube class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Where</div><p>Where does it run?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-key class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">With what</div><p>How does it reach the model without a key?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-git-branch class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">How</div><p>How do we build and change it repeatably?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-check class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>How do we know it works and leaves nothing running?</p></div>
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
[1.5 min] Who: a managed identity mapped to a service account. What: one role on one account. Four to go.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Where does it run?</h1>
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

# The cluster is yours, and so is the blast radius

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-cube class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Your AKS cluster</div></div>
    <ul class="zone__list">
      <li><ph-folder-open /><span>One namespace for the agent</span></li>
      <li><ph-user-circle /><span>One service account</span></li>
      <li><ph-hard-drives /><span>Nodes you pay for and patch</span></li>
      <li><ph-wrench /><span>Your upgrade and network choices</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption">Azure OpenAI</div></div>
    <ph-brain class="zone__hero" />
    <p>The model stays a managed service</p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">The trade</div>
  <p>You own where the agent runs. Azure owns the model.</p>
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
[2.5 min] Two zones. On the left, an AKS cluster you own. The agent runs there, so its blast radius is the namespace you give it. That also means you own the nodes, the upgrades and the network. On the right, Azure OpenAI stays a managed service: we do not host a model, we call one. Make this split clear, because it explains the cost and the cleanup later.
-->

---

# One namespace holds the agent and nothing else

<div class="zoom-content">

<div class="compose">
  <div class="compose__stack">
    <div class="gpu-caption">What the agent namespace holds</div>
    <div class="piece piece--mixin" v-click="4"><ph-globe />service · port 80 to the pod</div>
    <div class="piece piece--mixin" v-click="3"><ph-rocket-launch />deployment · the agent container</div>
    <div class="piece piece--sandbox" v-click="2"><ph-user-circle />service account · carries the identity</div>
    <div class="piece piece--template" v-click="1"><ph-folder-open />namespace · itops-agent</div>
  </div>
  <ul class="rules" v-click="5">
    <li><ph-user-circle /><span>The service account names the identity it acts as</span></li>
    <li><ph-key /><span>No secret is mounted into the pod</span></li>
    <li><ph-cloud /><span>The Pulumi kubernetes provider creates all of it</span></li>
    <li><ph-trash /><span>Deleting the namespace deletes the agent</span></li>
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
[2.5 min] Build it bottom up. A namespace. A service account in it, which carries the identity. A deployment with the agent container. A service in front of it. On the right: the rules. The service account carries the client ID of the Azure identity, the pod carries one workload identity label, and no secret is mounted. A projected token volume is not a secret. The Pulumi kubernetes provider creates all of this in the same program as the cluster.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How does it reach the model without a key?</h1>
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
[0.5 min] Question four. This is the main question of the talk.
-->

---

# The pod's token is exchanged for a model token, and no key exists

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-cube class="chain__icon" />
    <div class="gpu-caption">The pod</div>
    <span>Gets a service account token</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-identification-card class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Microsoft Entra ID</div>
    <span>Checks issuer and subject</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-brain class="chain__icon" />
    <div class="gpu-caption">Azure OpenAI</div>
    <span>Accepts the access token</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>The agent code asks <code>DefaultAzureCredential</code> for a token. It never sees a key.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-clock-clockwise /><p>Tokens expire on their own</p></div>
  <div class="fact"><ph-link /><p>Valid for one issuer and one subject</p></div>
  <div class="fact"><ph-prohibit /><p>Key authentication is off on the account</p></div>
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
.fact p { margin: 0 !important; font-size: 1.05rem; line-height: 1.35; white-space: normal; }
.fact small { display: block; font-size: 0.9rem; color: var(--p-fg-muted); margin-top: 0.2rem; }
</style>

<!--
[2.5 min] Here is the exchange. The pod gets a signed service account token from the cluster. Microsoft Entra ID checks that the issuer and the subject match the federated credential, and hands back an access token for the managed identity. Azure OpenAI accepts that token. In the agent, this is all behind DefaultAzureCredential, so the code does not change between your laptop and the cluster. The mechanism is described on Microsoft Learn in the AKS workload identity overview.
-->

---

# Pulumi ESC gives Pulumi the same keyless access to Azure

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-vault class="plan__icon" />
    <p>A Pulumi ESC environment with the azure-login provider</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-identification-card class="plan__icon" />
    <p>OIDC trust between Pulumi Cloud and Azure</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-key class="plan__icon" />
    <p>Short-lived credentials at run time</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-rocket-launch class="plan__icon" />
    <p>pulumi up deploys with no stored secret</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p><strong>Pulumi does not hold an Azure key either.</strong></p>
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
[2.5 min] The agent is not the only thing that needs Azure access. Pulumi does too, to create the resources. Pulumi ESC has an azure-login provider that uses OIDC, so Pulumi gets short-lived credentials when it runs, rather than a stored key. I read the azure-login page in the ESC docs for this. In the demo, you can also use az login locally if you prefer.
-->

---

# Four questions covered, two to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>A user-assigned identity, mapped to one service account</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">What</div><p>One role on one account, no key</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--accent">Where</div><p>Your AKS cluster, one namespace</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">With what</div><p>OIDC federation, and ESC for Pulumi</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-git-branch class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">How</div><p>How do we build and change it repeatably?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-check class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>How do we know it works and leaves nothing running?</p></div>
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
[1.5 min] Four covered. Who, what, where, and how the pod reaches the model. Two to go: how we build it repeatably, and how we know it works.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How do we build and change it repeatably?</h1>
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
[0.5 min] Question five.
-->

---

# One Pulumi program describes the cluster, the model and the pod

<div class="zoom-content">

<div class="modes">
  <div class="gpu-card gpu-card--primary mode" v-click>
    <div class="mode__head"><ph-cloud class="mode__icon" /><code class="mode__name">azure-native</code></div>
    <p>The cluster, the model deployment, the identity and the role</p>
  </div>
  <div class="gpu-card gpu-card--accent mode" v-click>
    <div class="mode__head"><ph-cube class="mode__icon" /><code class="mode__name">kubernetes</code></div>
    <p>The namespace, service account, deployment and service</p>
  </div>
  <div class="gpu-card mode" v-click>
    <div class="mode__head"><ph-stack class="mode__icon" /><code class="mode__name">six folders</code></div>
    <p>Each folder is the one before plus new resources, on one stack</p>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.modes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; align-items: stretch; }
.mode { display: flex; flex-direction: column; gap: 0.9rem; padding-inline: 1.4rem; }
.mode p { margin: 0 !important; white-space: normal; font-size: 1.25rem; }
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
[2.5 min] One Pulumi IaC program, two providers. The azure-native provider creates the Azure side: cluster, model deployment, identity, role. The kubernetes provider creates what runs on the cluster. And because the cluster output feeds the kubernetes provider, Pulumi works out the order for you. The workshop is six cumulative folders on one stack, so each step adds to the one before. No copying of config between them.
-->

---

# Where this breaks today

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">What the demo does not cover</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Production hardening of the cluster and network</li>
      <li>What the agent should be allowed to do</li>
      <li>A registry and a pipeline for the image</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">What can bite you live</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Azure OpenAI quota and region approval</li>
      <li>AKS takes several minutes to create</li>
      <li>A soft-deleted account blocks its own name</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[3.0 min] On the left, what this workshop is not: it is a small agent on a demo cluster, not a hardened production setup, and it does not decide what the agent should be allowed to do beyond calling the model. On the right, what can bite you live. Quota and region availability for Azure OpenAI vary by subscription, so check them first. The cluster typically takes several minutes to create. And a deleted Azure OpenAI account is soft-deleted and keeps its name until you purge it, which is why the teardown script purges it.
-->

---

# Five questions answered, one to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>A user-assigned identity, mapped to one service account</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">What</div><p>One role on one account, no key</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--accent">Where</div><p>Your AKS cluster, one namespace</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">With what</div><p>OIDC federation, and ESC for Pulumi</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-git-branch class="step-icon" /><div class="gpu-caption gpu-caption--accent">How</div><p>One Pulumi program, six folders</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-check class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>How do we know it works and leaves nothing running?</p></div>
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
[2.0 min] Five answered. The last one is not a slide. How do we know it works, and that it leaves nothing running? The demo answers that, and it starts with an empty resource group.
-->

---

# The agent, the model and the identity between them sit in one resource group

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-cube class="chain__icon" />
    <div class="gpu-caption">AKS pod</div>
    <span>The agent, in its namespace</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-user-circle class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Managed identity</div>
    <span>One role, federated to the pod</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-brain class="chain__icon" />
    <div class="gpu-caption">Azure OpenAI</div>
    <span>One account, one deployment</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>One Pulumi stack creates all of it, and one destroy removes all of it.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-folder-open /><p>One resource group holds everything</p></div>
  <div class="fact"><ph-cloud /><p>Pulumi Cloud keeps the state, ESC the access</p></div>
  <div class="fact"><ph-prohibit /><p>No API key anywhere in the program</p></div>
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
.fact p { margin: 0 !important; font-size: 1.05rem; line-height: 1.35; white-space: normal; }
.fact small { display: block; font-size: 0.9rem; color: var(--p-fg-muted); margin-top: 0.2rem; }
</style>

<!--
[3.0 min] This is the picture the demo ends with. An AKS pod running the agent. A managed identity with one role. An Azure OpenAI account with one model deployment. All of it in one resource group, created by one Pulumi stack, with the state in Pulumi Cloud and Azure access from Pulumi ESC. Take a moment on the right-hand facts: one resource group means one destroy.
-->

---

# Under ten lines of Python declare the pod's access to the model

<div class="zoom-content">

<div class="big-code code-sm">

```python
role_assignment = authorization.RoleAssignment(
    "itops-agent-openai-role",
    principal_id=identity.principal_id,
    principal_type=authorization.PrincipalType.SERVICE_PRINCIPAL,
    role_definition_id=openai_user_role_id,
    scope=account.id,
)
```

</div>

<aside class="info-card" v-click>
  <div class="info-card__label">The shape, not the whole file</div>
  <p>The role goes to the identity, on the account. The program has no key to put anywhere.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[2.0 min] The only program code in the deck. A role assignment: this identity gets this role on this account. That is the entire permission set. The real file builds the role definition ID from the subscription, I shortened that line so the shape fits. You will see the full program in the editor during the demo.
-->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Custom IT Ops Agent on AKS.</h1>
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
[0.5 min] Demo divider. Switch to the terminal and the editor.
-->
---

# What we are going to do

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-folder-open class="step__icon" /><p>The program starts as one resource group</p></div>
  <div class="gpu-card step" v-click><ph-cube class="step__icon" /><p>The cluster comes up from the same program</p></div>
  <div class="gpu-card step" v-click><ph-brain class="step__icon" /><p>The model deployment lands beside it</p></div>
  <div class="gpu-card step" v-click><ph-user-circle class="step__icon" /><p>The identity gets one role and no key</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-chat-circle-text class="step__icon" /><p>The agent answers with a model completion</p></div>
  <div class="gpu-card gpu-card--accent step" v-click><ph-trash class="step__icon" /><p>Destroy, verify and purge leave nothing billable</p></div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">Steps 2 to 5 run the same command</div>
  <p><code>pulumi up --stack dev</code>, once in each folder</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.steps { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.2rem; }
.step { display: flex; flex-direction: column; gap: 0.7rem; padding: 1.2rem 1.3rem; }
.step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.step__icon { font-size: 2rem; color: var(--p-primary); }
</style>

<!--
[2.5 min] Six steps, six folders, one stack. Each folder is the one before plus new resources, so from step 2 on the command is the same: pulumi up on the dev stack, in the next folder. Tell the room the cluster takes five to ten minutes, so we start it early and talk while it builds.
-->

---

# Step 1: the program starts as one resource group

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-terminal-window />host</div>
    <div class="big-code code-sm">

```bash
pulumi stack init dev
pulumi up
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-folder-open /><span>Folder <code>01-empty-program</code></span></li>
    <li><ph-check-circle /><span>Expect one resource group, <code>rg-itops-agent-aks-azure-openai</code></span></li>
    <li><ph-vault /><span>Pulumi gets Azure access from ESC, or <code>az login</code></span></li>
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
[2.0 min] Folder 01. We create the stack and the resource group, nothing else. This proves the Azure access works before we spend ten minutes on a cluster. What you should see is a preview with one resource group, and after the update, that group in Azure.
-->

---

# Step 2: the cluster comes up from the same program

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-terminal-window />host</div>
    <div class="big-code code-sm">

```bash
pulumi up --stack dev
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-folder-open /><span>Folder <code>02-aks-cluster</code></span></li>
    <li><ph-hourglass /><span>Expect several minutes of waiting</span></li>
    <li><ph-shield-check /><span>The OIDC issuer and workload identity are switched on</span></li>
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
[7.0 min] Folder 02. Same stack, more resources. The cluster has the OIDC issuer and workload identity turned on, which step 4 depends on. While it builds, which takes five to ten minutes, go back to the questions slide and talk through where each one gets answered. If you can, run this before the session starts.
-->

---

# Step 3: the model deployment lands beside it

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-terminal-window />host</div>
    <div class="big-code code-sm">

```bash
pulumi up --stack dev
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-folder-open /><span>Folder <code>03-azure-openai</code></span></li>
    <li><ph-brain /><span>Expect an account and the <code>itops-agent-gpt-4o</code> deployment</span></li>
    <li><ph-prohibit /><span>API key authentication is turned off on the account</span></li>
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
[4.0 min] Folder 03. An Azure OpenAI account and one model deployment, pinned to GPT-4o. Check the model lifecycle page before the session: version 2024-11-20 is listed as Legacy, retiring 2027-04-14. Point at the line that disables local authentication: the account will not accept keys. If your subscription has no quota in the region, this is the step that fails, which is why the slide before warned you.
-->

---

# Step 4: the identity has one role and no key

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
pulumi up --stack dev
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-user-circle /><div><div class="gpu-caption gpu-caption--accent">1 · Role</div><span>Cognitive Services OpenAI User</span></div></div>
  <div class="gpu-card check" v-click><ph-magnifying-glass /><div><div class="gpu-caption gpu-caption--accent">2 · No keys</div><span>grep finds no accessKey or apiKey</span></div></div>
  <div class="gpu-card check" v-click><ph-link /><div><div class="gpu-caption gpu-caption--accent">3 · Federation</div><span>issuer and service account subject</span></div></div>
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
[5.0 min] Folder 04. The managed identity, the federated credential, and the role assignment. Then two checks. First, list the role assignments for the identity and expect the one role. Second, grep the program for accessKey and apiKey and expect nothing. Those are expected results from the program as written, so say what you see on the day.
-->

---

# Step 5: the agent answers with a real model completion

<div class="zoom-content">

<div class="s5__cmd big-code code-sm">

```bash
curl -X POST localhost:8080/prompt -H 'Content-Type: application/json' -d '{"prompt": "Say hello from AKS"}'
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-rocket-launch /><span>Folder <code>05-agent-deployment</code> deploys the pod</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-plug /><span>Port-forward the service to your machine</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-chat-circle-text /><span>The model answers, with no key in the pod</span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Expect</div><p>A model response to the prompt, returned by the agent.</p></aside>
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
[5.0 min] Folder 05. We set the agent image, run pulumi up, check the pod is running, port-forward the service, and send one prompt. The expected result is a real completion from the model, returned through the agent. If it works, the whole chain worked: pod token, Entra ID, role, model. If it fails, check the role assignment first, because role assignments can take up to five minutes to propagate, sometimes ten.
-->

---

# Step 6: destroy, verify and purge leave nothing billable

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
06-teardown/teardown.sh
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-trash /><div><div class="gpu-caption gpu-caption--accent">1 · Destroy</div><span>one stack destroy</span></div></div>
  <div class="gpu-card check" v-click><ph-folder-open /><div><div class="gpu-caption gpu-caption--accent">2 · Group</div><span>resource group is gone</span></div></div>
  <div class="gpu-card check" v-click><ph-list-checks /><div><div class="gpu-caption gpu-caption--accent">3 · Resources</div><span>nothing left to list</span></div></div>
  <div class="gpu-card check" v-click><ph-broom /><div><div class="gpu-caption gpu-caption--accent">4 · Purge</div><span>soft-deleted account purged</span></div></div>
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
[7.0 min] Folder 06. One script. It destroys the stack, checks that the resource group is gone and that nothing is left in it, then purges the soft-deleted Azure OpenAI account so the name can be used again. This is the answer to question six: it leaves nothing running. Cost depends on node size and model usage, so price your own setup in the Azure pricing calculator before you leave it running. Run the purge every time.
-->
---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/itops-agent-aks-azure-openai" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → itops-agent-aks-azure-openai</div>
  </div>
  <div class="res-card">
    <QRCode data="https://learn.microsoft.com/en-us/azure/aks/workload-identity-overview" dark="#000000" />
    <div class="res-card__title">Microsoft Entra Workload ID on AKS</div>
    <div class="res-card__body">learn.microsoft.com/azure/aks</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/azure-login/" dark="#000000" />
    <div class="res-card__title">Pulumi ESC azure-login provider</div>
    <div class="res-card__body">pulumi.com/docs/esc</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/registry/packages/azure-native/api-docs/containerservice/managedcluster/" dark="#000000" />
    <div class="res-card__title">azure-native ManagedCluster</div>
    <div class="res-card__body">pulumi.com/registry</div>
  </div>
  <div class="res-card">
    <QRCode data="https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/managed-identity" dark="#000000" />
    <div class="res-card__title">Azure OpenAI with Microsoft Entra ID</div>
    <div class="res-card__body">learn.microsoft.com/azure/openai</div>
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
[1.0 min] Resources. Point at the QR codes. The workshop repo holds all six folders, one per demo step.
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
[1.0 min] Where to go next: Pulumi docs, the Pulumi Cloud sign-up, and the community Slack.
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/itops-agent-aks-azure-openai" dark="#000000" /></div>
      <div class="thanks__qr-label">itops-agent-aks-azure-openai</div>
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
[8.0 min] Thank you. Leave this up for questions. Eight minutes of Q&A, and more if the demo ran short.
-->
