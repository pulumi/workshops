---
theme: "@pulumi/slidev-theme"
title: "Fine-grained authorization as code: OpenFGA relationship-based access control with Pulumi"
info: |
  Fine-grained authorization as code: OpenFGA relationship-based access control with Pulumi: Define a ReBAC model as Pulumi code and check access for a human user and an AI agent.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/fine-grained-authorization-openfga
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
    Fine-grained authorization as code: OpenFGA relationship-based access control with Pulumi
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Define a ReBAC model as Pulumi code and check access for a human user and an AI agent
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
[1min] Welcome. Title, who we are, and the promise: by the end you will define a ReBAC model as Pulumi code and check access for a person and an AI agent.
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
[1min] A placeholder for the speaker slide. Introduce yourself here: who you are and what you work on.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
[0.5min] Quick housekeeping, then the agenda.
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
[1min] Where the code lives, how to ask questions, and what you need installed: Docker, the Pulumi CLI and curl. Everything runs on localhost.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>Why agents break RBAC</li>
  <li>Relationship-based access control</li>
  <li>OpenFGA and Pulumi</li>
  <li>The solution we build</li>
  <li>The demo</li>
  <li>Wrap-up and Q&A</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
[1min] Five parts. The problem, the tech, what we build, the demo, and questions. Most of the time goes to the first three, so the demo has room.
-->

---

# A single prompt injection met an agent with every capability already switched on

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">Arcade.dev, 2026-06-23</div>
    <p>"No authorization layer distinguished a user-initiated action from an injection-initiated one." "The agent was who it claimed to be."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>Johann Rehberger's ZombAI proof of concept against ChatGPT</li>
      <li>One prompt injection planted persistent instructions in its memory</li>
      <li>He showed it can be controlled remotely</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span><strong>The gap:</strong> the agent was authenticated, and nothing checked the action</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
[2min] This is a real proof of concept from Johann Rehberger, from January 2025. One prompt injection planted instructions that stayed in ChatGPT's memory. The quote on the left is from an Arcade dot dev post about it, from June 2026. Read the second sentence slowly: the agent was who it claimed to be. The identity check passed. What was missing was any layer that asked about the action. I am quoting Arcade and crediting the incident to Rehberger, I am not adding a number to it.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Can this AI agent deploy to production?</h1>
</div>

<!--
[1min] Keep this one question in your head for the next ninety minutes. It is the whole workshop. Pause, let people think of how their own system would answer.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The agent is exactly who it claims to be.</h1>
</div>

<!--
[0.5min] Authentication works. The token is valid, the identity is right.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Nothing asks whether this action should run.</h1>
</div>

<!--
[0.5min] That is the missing piece. Identity is answered, permission for this one action is not. Next, why roles do not fill that hole.
-->

---

# A role says who you are; an agent needs a rule for each thing it touches

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Roles (RBAC)</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>A role covers a whole class of people</li>
      <li>"Deployer" means every stack</li>
      <li>An agent needs a new role per resource</li>
      <li>Roles multiply, reviews get lost</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Relationships (ReBAC)</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>A tuple links one principal to one object</li>
      <li>The agent is a viewer of production only</li>
      <li>Narrower than its owner, by design</li>
      <li>A grant is a single reviewable line</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[2.5min] On the left, roles. They work well for people, because a person is one of a class. An agent acts for a user, but it should hold fewer rights than that user, and per object. To say that with roles you invent a role for every agent and every resource. On the right, the alternative we will build: a relationship between this principal and that object. ReBAC sits behind identity. It does not replace it.
-->

---

# Before you let an agent deploy, five questions need an answer

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--muted">Who</div><p>Who is acting, a person or an agent?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--muted">What</div><p>What may it touch, and through which relationship?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-scales class="step-icon" /><div class="gpu-caption gpu-caption--muted">Where</div><p>Where is the decision made?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-git-branch class="step-icon" /><div class="gpu-caption gpu-caption--muted">How</div><p>How does the model become reviewable code?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-check-circle class="step-icon" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>How do we prove it works and leave nothing behind?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[2.5min] Five questions. They are the spine of the talk. First two are about the model, the third is about where the decision lives, the fourth is about code, and the last one we answer by running it. Come back to this slide if you get lost.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Who is acting: a person or an agent?</h1>
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
[0.5min] First question. Who is acting.
-->

---

# An agent is its own principal with narrower rights than its owner

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">user:alice</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>A person, typed as <code>user</code></li>
      <li>Owner of <code>stack:production</code></li>
      <li>Can view and deploy</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">agent:deploy-bot</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>An agent, typed as <code>agent</code></li>
      <li>Viewer of <code>stack:production</code></li>
      <li>Can view, cannot deploy</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[3.5min] This is the first design choice in the model. The agent is not alice wearing a different hat. It is a separate type, agent, with its own name. That is what lets us give it fewer rights than alice on the very same stack. In the demo, alice is an owner and deploy-bot starts as a viewer. People often model the agent as the user and then cannot tell the two apart in the audit trail. Keep them apart from the start.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">RBAC cannot say 'this agent may view production but not deploy to it'</h1>
</div>

<!--
[1.5min] Say it out loud: view yes, deploy no, for one stack. With roles you end up with a role like production-viewer-for-bot. With relationships it is one line. Next section: what the relationship looks like.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What may it touch, and through which relationship?</h1>
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
[0.5min] Second question. What may it touch.
-->

---

# A tuple is three words: user, relation, object

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-robot class="chain__icon" />
    <div class="gpu-caption">User</div>
    <code>agent:deploy-bot</code>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-link class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Relation</div>
    <code>viewer</code>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-cube class="chain__icon" />
    <div class="gpu-caption">Object</div>
    <code>stack:production</code>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>One tuple is one fact about one principal and one object.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-user-circle /><p>The user can be a person or an agent</p></div>
  <div class="fact"><ph-database /><p>Tuples are stored in OpenFGA</p></div>
  <div class="fact"><ph-plus-circle /><p>A grant is a new tuple</p></div>
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
[3.5min] A relationship tuple is a user, a relation and an object. That is the definition in the OpenFGA docs, nothing more. Here the user is the agent deploy-bot, the relation is viewer, the object is the production stack. The word user is a bit unlucky: in OpenFGA it can be any principal, including an agent. The type is the prefix before the colon.
-->

---

# Permissions are computed from relations, so a grant is one tuple

<div class="zoom-content">

<div class="compose">
  <div class="compose__stack">
    <div class="gpu-caption">Type <code>stack</code></div>
    <div class="piece piece--template" v-click="1"><ph-rocket-launch />can_deploy = owner or deployer</div>
    <div class="piece piece--sandbox" v-click="2"><ph-eye />can_view = owner or viewer</div>
    <div class="piece piece--mixin" v-click="3"><ph-crown />owner · viewer · deployer</div>
  </div>
  <ul class="rules" v-click="4">
    <li><ph-crown /><span><code>owner</code> accepts <code>user</code> only</span></li>
    <li><ph-eye /><span><code>viewer</code> accepts <code>user</code> and <code>agent</code></span></li>
    <li><ph-rocket-launch /><span><code>deployer</code> accepts <code>user</code> and <code>agent</code></span></li>
    <li><ph-plus-circle /><span>Deploy rights for the bot: one <code>deployer</code> tuple</span></li>
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
[3.5min] Here is the model for the stack type. Three relations you assign directly: owner, viewer, deployer. Two you never assign: can_view is owner or viewer, can_deploy is owner or deployer. The application asks the computed ones. Owner takes users only, so an agent can never be an owner. Viewer and deployer accept both. So granting the bot deploy rights is one tuple, and nothing in the model changes.
-->

---

# Two questions answered, three to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>Agents are their own principals</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">What</div><p>Tuples and computed relations</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-scales class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Where</div><p>Where is the decision made?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-git-branch class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">How</div><p>How does the model become reviewable code?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-check-circle class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>How do we prove it works and leave nothing behind?</p></div>
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
[1.5min] Two done. The agent is its own principal, and what it may touch is a set of tuples with computed relations. Three to go: where the decision is made, how it becomes code, and the proof.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Where is the decision made?</h1>
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
[0.5min] Third question. Where the decision is made.
-->

---

# OpenFGA decides, your application and agent only ask

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--muted zone" v-click>
    <div class="zone__head"><ph-robot class="zone__icon" /><div class="gpu-caption">Your application or agent</div></div>
    <ul class="zone__list">
      <li><ph-question /><span>Asks one question per action</span></li>
      <li><ph-hand-palm /><span>Enforces the answer</span></li>
      <li><ph-prohibit /><span>Holds no permission rules</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-shield-check class="zone__icon" /><div class="gpu-caption gpu-caption--accent">OpenFGA server</div></div>
    <ul class="zone__list">
      <li><ph-tree-structure /><span>Authorization model</span></li>
      <li><ph-database /><span>Relationship tuples</span></li>
      <li><ph-scales /><span>Computes the answer</span></li>
    </ul>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">One place to change</div>
  <p>Change the tuples and every caller sees the new answer.</p>
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
[3.5min] The rules do not live in the agent and not in the application. They live in the OpenFGA server: the model and the tuples. The caller asks and then enforces. That has a consequence you will see in the demo: we change one tuple and the agent's answer changes, without touching the agent. The application must still enforce the answer. OpenFGA tells you allowed or not, it does not block anything by itself.
-->

---

# Check is one HTTP call that returns allowed true or false

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-robot class="plan__icon" />
    <p>The caller asks: can <code>deploy-bot</code> <code>can_deploy</code> production?</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-globe class="plan__icon" />
    <p>One POST to the store's <code>check</code> endpoint</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-tree-structure class="plan__icon" />
    <p>OpenFGA walks the model and the tuples</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-check-circle class="plan__icon" />
    <p>The answer: <code>allowed</code> is true or false</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p><strong>Our script names the model version</strong> in every request.</p>
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
[3.5min] A check is a POST to the check endpoint of a store. The body has a tuple key with user, relation and object, and in our demo also the authorization model id. The response is a small JSON object with allowed true or false. In the demo we call it with curl through a tiny script so you can see the request and the response. Nothing to install on the caller side.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How does the model become reviewable code?</h1>
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
[0.5min] Fourth question. How the model becomes code you can review.
-->

---

# Store, model and tuples are three Pulumi resources, created in order

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-cube class="plan__icon" />
    <p>Docker container runs OpenFGA</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-database class="plan__icon" />
    <p>Store: a named tenant</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-tree-structure class="plan__icon" />
    <p>Model: types and relations</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-link class="plan__icon" />
    <p>Tuples: who relates to what</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p><strong>Each id feeds the next.</strong> Pulumi orders the work.</p>
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
[3.5min] There is no native OpenFGA provider for Pulumi, so the program uses dynamic resources. The Pulumi docs say dynamic providers are supported in TypeScript and Python, and that they are lighter weight than a full provider. Ours are small Python classes that call the OpenFGA HTTP API. The store id flows into the model, and both flow into the tuples, so Pulumi knows the order. On destroy it runs in reverse.
-->

---

# A change is a tuple diff, a new model version or a new store

<div class="zoom-content">

<div class="modes">
  <div class="gpu-card gpu-card--primary mode" v-click>
    <div class="mode__head"><ph-plus-minus class="mode__icon" /><code class="mode__name">tuples</code></div>
    <p>Edit the list. Only the adds and removes are sent.</p>
  </div>
  <div class="gpu-card gpu-card--accent mode" v-click>
    <div class="mode__head"><ph-git-branch class="mode__icon" /><code class="mode__name">model</code></div>
    <p>Models are immutable. A change writes a new version.</p>
  </div>
  <div class="gpu-card mode" v-click>
    <div class="mode__head"><ph-database class="mode__icon" /><code class="mode__name">store</code></div>
    <p>A new store name replaces the store and everything in it.</p>
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
[3.5min] Three kinds of change. The everyday one is a tuple change: you edit the list, Pulumi diffs it and our provider sends only the tuples to add or remove. A model change is different. OpenFGA models are immutable, the docs say they can no longer be deleted or modified, and each write creates a new version, so the tuples follow the new model id. And a new store name replaces the store. In the demo we only do the first kind.
-->

---

# Four questions answered, one to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>Agents are their own principals</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">What</div><p>Tuples and computed relations</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-scales class="step-icon" /><div class="gpu-caption gpu-caption--accent">Where</div><p>OpenFGA decides, callers ask</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-git-branch class="step-icon" /><div class="gpu-caption gpu-caption--accent">How</div><p>Three Pulumi resources</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-check-circle class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>How do we prove it works and leave nothing behind?</p></div>
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
[1.5min] Four answered. The last one we answer by running it, and then deleting it.
-->

---

# Where this breaks today: no native provider, in-memory data, immutable models

<div class="zoom-content">

<div class="bounds">
  <div class="bound" v-click><ph-plugs /><div class="bound__want">a native Pulumi provider</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">None here: three small dynamic resources instead</div></div>
  <div class="bound" v-click><ph-memory /><div class="bound__want">data that survives a restart</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">The demo uses the in-memory datastore, state is lost</div></div>
  <div class="bound" v-click><ph-git-branch /><div class="bound__want">to delete a model</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">No endpoint for it; deleting the store leaves its models behind</div></div>
  <div class="bound" v-click><ph-globe /><div class="bound__want">a shared server</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">localhost only; production needs a real datastore</div></div>
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
[3.5min] Be plain about the limits. There is no native OpenFGA provider, so this is a dynamic provider that I wrote for the workshop. The demo container uses the in-memory datastore, so a restart loses everything, which is fine for a workshop and wrong for production. There is no endpoint to delete a model, and the delete-store endpoint does not remove a store's models or tuples. Here, removing the container clears them. And it runs on localhost. For production you would pick a real datastore and think about the provider question before you copy this.
-->

---

# The whole stack runs on localhost for $0

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--muted zone" v-click>
    <div class="zone__head"><ph-laptop class="zone__icon" /><div class="gpu-caption">Your machine</div></div>
    <ul class="zone__list">
      <li><ph-code /><span>Pulumi program in Python</span></li>
      <li><ph-plugs /><span>Three dynamic resources</span></li>
      <li><ph-terminal-window /><span><code>curl</code> checks</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-cube class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Docker container</div></div>
    <ul class="zone__list">
      <li><ph-shield-check /><span>OpenFGA, API on 8080</span></li>
      <li><ph-play /><span>Playground on 3000</span></li>
      <li><ph-memory /><span>In-memory datastore</span></li>
    </ul>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">What it costs</div>
  <p>Docker and nothing else. No cloud account.</p>
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
[3min] This is what we build. Your machine runs the Pulumi program. A Docker container runs OpenFGA, API on 8080, the playground on 3000, in-memory. Pulumi talks to the API over HTTP on localhost. It costs nothing, you need Docker and that is it. Next, the shape of the program.
-->

---

# One Pulumi program holds the container, the store, the model and the tuples

<div class="zoom-content">

<div class="compose">
  <div class="compose__stack">
    <div class="gpu-caption">One Pulumi program</div>
    <div class="piece piece--mixin" v-click="4"><ph-link />tuples</div>
    <div class="piece piece--mixin" v-click="3"><ph-tree-structure />model</div>
    <div class="piece piece--sandbox" v-click="2"><ph-database />store</div>
    <div class="piece piece--template" v-click="1"><ph-cube />Docker container</div>
  </div>
  <div class="big-code code-sm" v-click="5">

```python
store = OpenFgaStoreResource("store", api_url=API_URL, store_name=store_name,
                             opts=pulumi.ResourceOptions(depends_on=[container]))
auth_model = OpenFgaAuthModelResource("model", api_url=API_URL, store_id=store.store_id, model=model)
tuples = OpenFgaTuplesResource("tuples", api_url=API_URL, store_id=store.store_id,
                               authorization_model_id=auth_model.authorization_model_id,
                               tuples=TUPLES)
```

</div>
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
[3min] This is the only program code in the deck. The container is declared just above these lines. The store depends on the container. The model takes the store id. The tuples take the store id and the model id, and the list of tuples comes from a separate file. Pulumi works out the order from those references. That separate list is what we edit in step six.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: OpenFGA with Pulumi.</h1>
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
[0.5min] Now we run it.
-->

---

# Eight steps take you from empty Docker to an agent that may deploy

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-cube class="step__icon" /><p>One <code>pulumi up</code> starts OpenFGA</p></div>
  <div class="gpu-card step" v-click><ph-database class="step__icon" /><p>The store exists as a resource</p></div>
  <div class="gpu-card step" v-click><ph-tree-structure class="step__icon" /><p>The model is written once, as code</p></div>
  <div class="gpu-card step" v-click><ph-link class="step__icon" /><p>Two tuples: alice owns, the bot views</p></div>
  <div class="gpu-card gpu-card--accent step" v-click><ph-prohibit class="step__icon" /><p>Check: the agent may not deploy</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-plus-circle class="step__icon" /><p>One new tuple, applied with <code>pulumi up</code></p></div>
  <div class="gpu-card step" v-click><ph-user-circle class="step__icon" /><p>Check: alice may deploy, before and after</p></div>
  <div class="gpu-card step" v-click><ph-trash class="step__icon" /><p><code>pulumi destroy</code> leaves nothing behind</p></div>
</div>

<div class="big-code code-sm">

```bash
pulumi up
```

</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.steps { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.2rem; margin-top: 1.2rem; }
.step { display: flex; flex-direction: row; align-items: center; gap: 0.9rem; padding: 0.8rem 1.1rem; }
.step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.step__icon { font-size: 2rem; color: var(--p-primary); }
</style>

<!--
[2min] Eight steps, all in three folders. Every step that changes something runs pulumi up in the stack folder, so I show the command once here. The checks are small scripts that print the request and the response. By the end the agent is denied, then allowed after one new tuple, alice is allowed throughout, and then everything is gone.
-->

---

# Step 1: One pulumi up starts OpenFGA with the playground open

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
docker ps
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-cube /><span>Container <code>openfga-workshop</code> runs</span></li>
    <li><ph-shield-check /><span>Image <code>openfga/openfga:v1.21.0</code></span></li>
    <li><ph-memory /><span>In-memory datastore</span></li>
    <li><ph-play /><span>Playground on localhost:3000</span></li>
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
[5min] Run pulumi up in the stack folder. Pulumi pulls the pinned image, starts the container with the API on 8080 and the playground on 3000, then creates the store, the model and the tuples. That is steps one to four in one go, but we look at them one by one. Then docker ps shows the container. Open the playground in the browser. If the container fails to start, I have a pre-started one in another tab.
-->

---

# Step 2: The store exists as a Pulumi resource

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
pulumi stack output store_id
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-database /><div><div class="gpu-caption gpu-caption--accent">1 · Resource</div><code>OpenFgaStoreResource</code></div></div>
  <div class="gpu-card check" v-click><ph-hash /><div><div class="gpu-caption gpu-caption--accent">2 · Output</div><code>store_id</code></div></div>
  <div class="gpu-card check" v-click><ph-tag /><div><div class="gpu-caption gpu-caption--accent">3 · Name</div><code>pulumi-workshop</code></div></div>
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
[3min] The store is a Pulumi resource like any other. Its id is a stack output. The name is a config value, pulumi-workshop by default.
-->

---

# Step 3: The model is code, written once and versioned

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
pulumi stack output authorization_model_id
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-tree-structure /><div><div class="gpu-caption gpu-caption--accent">1 · Resource</div><code>OpenFgaAuthModelResource</code></div></div>
  <div class="gpu-card check" v-click><ph-file-code /><div><div class="gpu-caption gpu-caption--accent">2 · Source</div><code>model.json</code></div></div>
  <div class="gpu-card check" v-click><ph-hash /><div><div class="gpu-caption gpu-caption--accent">3 · Output</div><code>authorization_model_id</code></div></div>
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
[3min] The model comes from model.json in the same folder. Three types: user, agent and stack. Stack has owner, viewer and deployer, plus the computed can_view and can_deploy. The id of the model version is a stack output. Show the same model in the playground.
-->

---

# Step 4: Two tuples give alice ownership and the agent view only

<div class="zoom-content">

<div class="checks">
  <div class="gpu-card check" v-click><ph-user-circle /><div><div class="gpu-caption gpu-caption--accent">1 · alice</div><code>owner of stack:production</code></div></div>
  <div class="gpu-card check" v-click><ph-robot /><div><div class="gpu-caption gpu-caption--accent">2 · deploy-bot</div><code>viewer of stack:production</code></div></div>
  <div class="gpu-card check" v-click><ph-list-checks /><div><div class="gpu-caption gpu-caption--accent">3 · Resource</div><code>OpenFgaTuplesResource</code></div></div>
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
[4min] Open the tuples file. Two lines. Alice is owner of the production stack, the agent deploy-bot is a viewer. A third line is there as a comment, the grant for step six. Do not uncomment it yet. People ask why the tuples are in Python: because that is the diff we want in a pull request.
-->

---

# Step 5: The agent is denied deploy

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
../02-checks/check.sh agent:deploy-bot can_deploy stack:production
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-prohibit /><span>Script prints request and response</span></li>
    <li><ph-x-circle /><span>Last line: <code>allowed: false</code></span></li>
    <li><ph-eye /><span>The bot is only a viewer</span></li>
    <li><ph-shield-check /><span>OpenFGA decided, the script only asked</span></li>
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
[3min] Run the check. You see the POST, the body, the response and then allowed false. Ask the room to predict it first. The bot has viewer, and can_deploy needs owner or deployer. Allowed false.
-->

---

# Step 6: One new tuple, and the agent may deploy

<div class="zoom-content">

<div class="s5__cmd big-code code-sm">

```bash
../02-checks/grant-deployer.sh
pulumi up
../02-checks/check.sh agent:deploy-bot can_deploy stack:production
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-note-pencil /><span>The deployer tuple is uncommented in code</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-plus-circle /><span><code>pulumi up</code> writes only the new tuple</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-check-circle /><span>The same check now says <code>allowed: true</code></span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Nothing else changed</div><p>No agent restart. No model change.</p></aside>
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
[5.5min] The grant is a code change. The script uncomments one line in the tuples file. Show the diff in the editor, one line, that is your pull request. Then pulumi up: the preview shows an update on the tuples resource, and our provider writes only the new tuple. Run the same check again. Allowed true. The agent, the model and the container did not change.
-->

---

# Step 7: Alice could deploy before and after the change

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
../02-checks/check.sh user:alice can_deploy stack:production
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-user-circle /><div><div class="gpu-caption gpu-caption--accent">1 · Before</div><code>allowed: true</code></div></div>
  <div class="gpu-card check" v-click><ph-plus-circle /><div><div class="gpu-caption gpu-caption--accent">2 · Grant</div><code>deployer tuple added</code></div></div>
  <div class="gpu-card check" v-click><ph-user-circle /><div><div class="gpu-caption gpu-caption--accent">3 · After</div><code>allowed: true</code></div></div>
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
[3min] Alice is an owner, so she could deploy before the grant and after it. The grant to the bot did not touch her. That is the point of a narrow, additive change.
-->

---

# Step 8: pulumi destroy leaves nothing behind

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
pulumi destroy
../03-teardown/verify-teardown.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-trash /><span>Tuples, store and container removed</span></li>
    <li><ph-arrow-u-up-left /><span>In reverse order of creation</span></li>
    <li><ph-cube /><span>No <code>openfga-workshop</code> container</span></li>
    <li><ph-plug /><span>API port closed</span></li>
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
[4min] Destroy removes the tuples, then the store, then the container. The verify script checks that no container is left and the API port is closed. Between runs there is a reset script that puts the deny case back. That answers the fifth question: we proved it works, and we left nothing behind.
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/fine-grained-authorization-openfga" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → fine-grained-authorization-openfga</div>
  </div>
  <div class="res-card">
    <QRCode data="https://openfga.dev/docs" dark="#000000" />
    <div class="res-card__title">OpenFGA documentation</div>
    <div class="res-card__body">openfga.dev/docs</div>
  </div>
  <div class="res-card">
    <QRCode data="https://openfga.dev/docs/getting-started/perform-check" dark="#000000" />
    <div class="res-card__title">OpenFGA: perform a check</div>
    <div class="res-card__body">openfga.dev/perform-check</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/iac/concepts/resources/dynamic-providers/" dark="#000000" />
    <div class="res-card__title">Pulumi dynamic providers</div>
    <div class="res-card__body">pulumi.com/dynamic-providers</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/registry/packages/docker/" dark="#000000" />
    <div class="res-card__title">Pulumi Docker provider</div>
    <div class="res-card__body">pulumi.com/registry/docker</div>
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
[1min] Everything is in the workshop repository. The QR codes link to the folder and the docs we used.
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
[1min] Other places to go after today. Then questions.
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/fine-grained-authorization-openfga" dark="#000000" /></div>
      <div class="thanks__qr-label">fine-grained-authorization-openfga</div>
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
[1min] Thanks. Questions are open, and I can go back to any step.
-->
