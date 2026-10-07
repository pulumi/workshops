---
theme: "@pulumi/slidev-theme"
title: "Provisioning real infrastructure from a Backstage catalog with Pulumi"
info: |
  Provisioning real infrastructure from a Backstage catalog with Pulumi: Turn a developer's click on Create into a tagged, policy-checked AWS resource, with no ticket and no static key.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/provisioning-infrastructure-from-a-backstage-catalog
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
    Provisioning real infrastructure from a Backstage catalog with Pulumi
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Turn a developer's click on Create into a tagged, policy-checked AWS resource, with no ticket and no static key
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
[1 min] Welcome the room, say the title, and state the promise: a Backstage Create button that runs a Pulumi program against AWS. Say it is a 105 minute session and the demo is the last hour.
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
[1.5 min] Introduce the speaker. Placeholder until the speakers are confirmed.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
[0.5 min] Divider. Two things before we start: housekeeping, then the agenda.
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
[1.5 min] Housekeeping: where questions go, the handouts, the recording. Say that live steps may need a retry and that is fine.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>The pain: Create opens a ticket</li>
  <li>Backstage and the Automation API</li>
  <li>Short-lived credentials with Pulumi ESC</li>
  <li>Pulumi Cloud and policies</li>
  <li>The demo</li>
  <li>Wrap-up and Q&A</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
[1.5 min] Read the agenda as six beats. The pain, Backstage and the Automation API, credentials with ESC, Pulumi Cloud and policies, the demo, then wrap-up.
-->

---

# Guidewire's platform team set out to eliminate state files and drift

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">The subtitle of Guidewire's engineering blog post</div>
    <p>"How KubeVela &amp; Crossplane helped us eliminate state files, drift, and deliver infrastructure faster."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>Guidewire's engineering blog, on platform engineering with KubeVela</li>
      <li>The post is about getting infrastructure to developers faster</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span><strong>Different stack, same question:</strong> what runs when someone clicks Create?</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
[3 min] Open on a real sentence from a platform team. Read the subtitle aloud. Say that Guidewire answered with KubeVela and Crossplane, and that we will answer with Backstage and Pulumi. Ask the room how many run a portal today and what Create does behind it. Keep it short. The question at the end is what matters.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The portal is the front door to infrastructure.</h1>
</div>

<!--
[1 min] Let this sit for a second. Everyone in the room has a portal or wants one. Backstage gives you the catalog, the templates and the form.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Behind it, Create opens a ticket.</h1>
</div>

<!--
[1 min] This is the gap. In many setups the form hands a request to a person or a queue. The portal looks like self-service, and the work still waits for someone. Ask who has waited on that ticket.
-->

---

# A form that submits a ticket is not a form that runs a program

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Create opens a ticket</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>The form hands a request to a person</li>
      <li>A queue sits between request and resource</li>
      <li>You find out later what actually ran</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Create runs a program</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>The form fills in the inputs of a Pulumi program</li>
      <li>The click itself creates the resource</li>
      <li>The run is recorded in Pulumi Cloud</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[3 min] Walk the two cards. The left side is the portal as a front door with nothing behind it. The right side is the same portal where the form is the program's input. The rest of the workshop is how to build the right side. Say that a portal is good at catalogs and forms, and that state, credentials, policy and history belong to whatever runs the infrastructure.
-->

---

# A good Create is a request that becomes a resource, with no queue between

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-cursor-click class="plan__icon" />
    <p>Someone clicks Create</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-list-checks class="plan__icon" />
    <p>The form becomes a task</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-gear class="plan__icon" />
    <p>A Pulumi program runs</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-check-circle class="plan__icon" />
    <p>A tagged bucket exists</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p>The click is the request and the deployment.</p>
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
[2 min] Draw the target. Four steps, no queue. Keep it abstract, we will fill each step with a real piece of tech. The bucket is the smallest real resource that still needs credentials, a tag policy and a history.
-->

---

# Six questions stand between a Create button and trust

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-terminal-window class="step-icon" /><div class="gpu-caption gpu-caption--muted">Where</div><p>Where does the code run when someone clicks Create?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--muted">Credentials</div><p>How does it reach my cloud account without a static key?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-clock-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--muted">History</div><p>Where do I see what happened, and roll it back?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-shield-check class="step-icon" /><div class="gpu-caption gpu-caption--muted">Guardrails</div><p>Can a bad request be stopped before it becomes a resource?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-globe class="step-icon" /><div class="gpu-caption gpu-caption--muted">Providers</div><p>Does this only work for AWS?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-users-three class="step-icon" /><div class="gpu-caption gpu-caption--muted">Platform</div><p>What does the platform team build once, and what does every team get?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[3 min] These six are the spine of the next hour. Read them one at a time. We answer the first five with slides and the sixth with the demo. Tell people to hold their own question against these six, and to raise anything that is missing.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Where does the code run when someone clicks Create?</h1>
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
[0.5 min] First question. The short answer is in the Backstage backend, as a scaffolder action. Next few slides show how that works.
-->

---

# A catalog entry becomes a form, and the form becomes a task

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-books class="plan__icon" />
    <p>A template sits in the catalog</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-note-pencil class="plan__icon" />
    <p>Its parameters render a form</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-list-checks class="plan__icon" />
    <p>Submitting it starts a scaffolder task</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-gear class="plan__icon" />
    <p>A step runs a custom action</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p>The custom action is where Pulumi comes in.</p>
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
[3 min] Backstage side only. A software template is a catalog entity. Its parameters become the form. Submitting the form creates a task, and the task's steps call actions. Backstage ships some actions, and you can write your own. Ours is called pulumi:s3-bucket. Point out that nothing here is Pulumi yet.
-->

---

# The custom action runs in the Backstage backend, as ordinary TypeScript

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-hard-drives class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Backstage backend</div></div>
    <ul class="zone__list">
      <li><ph-package /><span>The backend loads the action as a module</span></li>
      <li><ph-code /><span>The action is a TypeScript function</span></li>
      <li><ph-play /><span>It runs when a task reaches the step</span></li>
      <li><ph-note-pencil /><span>Its inputs are the form's fields</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption">Pulumi Cloud</div></div>
    <ph-database class="zone__hero" />
    <p>State and history live here, not in the portal</p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">Where things run</div>
  <p>The program runs from the Backstage backend. Pulumi Cloud keeps the record.</p>
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
[3 min] Two zones. The action lives and runs in the Backstage backend, next to the portal. Pulumi Cloud holds state and history. This is the answer to question one. The portal does not need a separate runner for the demo.
-->

---

# The Automation API turns up, preview and destroy into a typed SDK

<div class="zoom-content">

<div class="compose">
  <div class="compose__stack">
    <div class="gpu-caption">One Create click</div>
    <div class="piece piece--template" v-click="4"><ph-package />Scaffolder action, a TypeScript function</div>
    <div class="piece piece--sandbox" v-click="3"><ph-code />Automation API, createOrSelectStack and up</div>
    <div class="piece piece--mixin" v-click="2"><ph-file-code />Inline Pulumi program, one S3 bucket</div>
    <div class="piece piece--mixin" v-click="1"><ph-cloud />Pulumi engine and the AWS provider</div>
  </div>
  <ul class="rules" v-click="5">
    <li><ph-cube /><span>One stack per bucket</span></li>
    <li><ph-tag /><span>The stack is named after the bucket</span></li>
    <li><ph-rocket-launch /><span><code>up</code> and <code>destroy</code> are method calls</span></li>
    <li><ph-list-numbers /><span>Outputs come back as typed values</span></li>
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
[3 min] Read the stack from the bottom. The engine and provider do the work. The Automation API is the SDK that drives them from code, so up and destroy are method calls instead of shell commands. The action wraps that in a function. One stack per bucket keeps every request isolated.
-->

---

# An inline program fits an action that ships with the portal

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Local source</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>The program lives in its own directory</li>
      <li>A separate team can own and release it</li>
      <li>The portal points at a work directory</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Inline source</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>The program is a function in the action</li>
      <li>One repository, one version, one deploy</li>
      <li>What the demo uses</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[2.5 min] The Automation API supports both. We pick inline because the platform team owns the portal and the action together. If an application team owns the program, local source keeps the release cycles apart. Do not belabor this. It is a design choice.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How does it reach my cloud without a static key?</h1>
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
[0.5 min] Second question. Credentials. This is where most portals get uncomfortable.
-->

---

# A static key on the portal host is a standing breach waiting to happen

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">A static key on the host</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Sits there until someone rotates it</li>
      <li>Anyone with access to the host can read it</li>
      <li>A leak is valid for as long as the key</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">A short-lived credential</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Issued for each run</li>
      <li>Expires on its own</li>
      <li>Nothing long-lived to rotate on the host</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[3 min] Name the risk. The Backstage host needs to create buckets, so the lazy path is an access key in an environment variable. That key is a permanent secret on a machine many people can reach. The alternative is a credential that exists for one update and then expires.
-->

---

# ESC trades a short-lived token for temporary AWS credentials

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-gear class="chain__icon" />
    <div class="gpu-caption">Backstage action</div>
    <span>Stack linked to an ESC environment</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-vault class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Pulumi ESC</div>
    <span>Exchanges an OIDC token</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-cloud-check class="chain__icon" />
    <div class="gpu-caption">AWS</div>
    <span>Returns temporary credentials</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>No AWS key lives on the Backstage host.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-link /><p>Linked with <code>addEnvironments</code></p></div>
  <div class="fact"><ph-seal-check /><p>Trust is set up once, by the platform team</p></div>
  <div class="fact"><ph-eye-slash /><p>The demo checks the container for keys</p></div>
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
[4 min] Walk left to right. The action links the stack to an ESC environment. ESC uses OpenID Connect to ask AWS for temporary credentials through a role the platform team created once. The demo proves the other half: no access key variable exists in the backend container. Mention that the OIDC provider and role are created before the session.
-->

---

# Two questions covered, four to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-terminal-window class="step-icon" /><div class="gpu-caption gpu-caption--accent">Where</div><p>An action in the Backstage backend</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">Credentials</div><p>ESC and OIDC, short-lived</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-clock-clockwise class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">History</div><p>Where do I see what happened, and roll it back?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-check class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Guardrails</div><p>Can a bad request be stopped?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-globe class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Providers</div><p>Does this only work for AWS?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-users-three class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Platform</div><p>What does the platform team build once?</p></div>
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
[1.5 min] Bring the six cards back. Two answered. Ask whether anyone has a question on code location or credentials before we move on.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Where do I see what happened, and roll it back?</h1>
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
[0.5 min] Third question. History and rollback.
-->

---

# A portal-created stack is a first-class stack in Pulumi Cloud

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-browser class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Backstage</div></div>
    <ul class="zone__list">
      <li><ph-cursor-click /><span>Create runs one update</span></li>
      <li><ph-tag /><span>The stack is named after the bucket</span></li>
      <li><ph-folder-open /><span>The project is <code>backstage-s3-bucket</code></span></li>
      <li><ph-trash /><span>Teardown destroys the stack</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption">Pulumi Cloud</div></div>
    <ph-clock-clockwise class="zone__hero" />
    <p>Resources, outputs and update history per stack</p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">What you see</div>
  <p>The same console and the same history as any stack you deployed by hand.</p>
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
[4 min] The action creates an ordinary stack. Everything you know from Pulumi Cloud applies: the resource list, the update history, the outputs. Rolling back is another call from the same API, destroy, and the demo's teardown script does exactly that for each bucket stack.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Can a bad request be stopped before it becomes a resource?</h1>
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
[0.5 min] Fourth question. Guardrails.
-->

---

# Pulumi Policies block the update before the resource is created

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-cursor-click class="plan__icon" />
    <p>Someone clicks Create</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-shield-check class="plan__icon" />
    <p>The update runs with a policy pack</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-tag class="plan__icon" />
    <p>A rule checks for the team tag</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-prohibit class="plan__icon" />
    <p>A violation blocks the update</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p>The demo rule: every bucket needs a team tag.</p>
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
[3.5 min] Policies are code that runs against the resources an update would create. In the demo a policy pack requires a team tag on the bucket. The pack runs from a local path in the demo. In production you would enforce it through Pulumi Cloud policy groups, say that out loud. Backstage shows the violation name in the task log.
-->

---

# The same program shape works with any provider Pulumi supports

<div class="zoom-content">

<div class="modes">
  <div class="gpu-card mode" v-click>
    <div class="mode__head"><ph-cloud class="mode__icon" /><code class="mode__name">aws</code></div>
    <p>The provider the demo uses</p>
    <div class="mode__track"><i /><i /><i /><i /><i /><b>up</b></div>
    <div class="mode__note">Shown in the demo</div>
  </div>
  <div class="gpu-card gpu-card--accent mode" v-click>
    <div class="mode__head"><ph-cloud-arrow-up class="mode__icon" /><code class="mode__name">azure-native, gcp</code></div>
    <p>Swap the resources</p>
    <div class="mode__track"><i /><i /><i /><i /><i /><b>up</b></div>
    <div class="mode__note">Not shown in the demo</div>
  </div>
  <div class="gpu-card gpu-card--muted mode" v-click>
    <div class="mode__head"><ph-cube class="mode__icon" /><code class="mode__name">kubernetes</code></div>
    <p>Same pattern for cluster objects</p>
    <div class="mode__track"><i /><i /><i /><i /><i /><b>up</b></div>
    <div class="mode__note">Not shown in the demo</div>
  </div>
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
[2.5 min] Question five. We state this as a claim about the pattern and do not demonstrate it. The action calls the Automation API with a program, and the program can declare resources from any provider. Only the aws provider is in the demo.
-->

---

# Where this breaks today

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-shield-warning class="step-icon" /><div class="gpu-caption gpu-caption--muted">Policy</div><p>The demo runs the pack from a local path, Cloud policy groups are a separate setup</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-seal-check class="step-icon" /><div class="gpu-caption gpu-caption--muted">Trust</div><p>The OIDC provider and role are created before the session</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-trash class="step-icon" /><div class="gpu-caption gpu-caption--muted">Cleanup</div><p>Teardown is a script, not a button in Backstage</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-package class="step-icon" /><div class="gpu-caption gpu-caption--muted">Scope</div><p>One resource type, an S3 bucket</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-code class="step-icon" /><div class="gpu-caption gpu-caption--muted">Ownership</div><p>The action is code your team writes and upgrades</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-warning-circle class="step-icon" /><div class="gpu-caption gpu-caption--muted">Failures</div><p>A failed update shows up as a failed Backstage task</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[2.5 min] Say the limits as they are. This is a pattern with moving parts. Each card is a thing a platform team still owns. Invite the room to say which one worries them most.
-->

---

# Five questions answered, one to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-terminal-window class="step-icon" /><div class="gpu-caption gpu-caption--accent">Where</div><p>Backstage backend action</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">Credentials</div><p>ESC and OIDC</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-clock-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--accent">History</div><p>Pulumi Cloud stacks</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-shield-check class="step-icon" /><div class="gpu-caption gpu-caption--accent">Guardrails</div><p>Pulumi Policies</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-globe class="step-icon" /><div class="gpu-caption gpu-caption--accent">Providers</div><p>Not tied to AWS</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-users-three class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Platform</div><p>What does the platform team build once, and what does every team get?</p></div>
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
[1.5 min] Five of six. The last one is for the demo: a developer clicks Create and gets a tagged, checked, recorded resource.
-->

---

# One click in Backstage ends as a tagged, checked, recorded bucket

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-cursor-click class="plan__icon" />
    <p>Create</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-gear class="plan__icon" />
    <p>Scaffolder action</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-key class="plan__icon" />
    <p>ESC credentials</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-shield-check class="plan__icon" />
    <p>Policy check</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="5" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="5">
    <span class="plan__num">5</span>
    <ph-check-circle class="plan__icon" />
    <p>Bucket and history</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="6">
  <ph-lightning class="plan__foot-icon" />
  <p>The platform team builds the middle once.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.15; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
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
[3 min] This is the architecture we build. Five pieces. The platform team writes the action, the template, the ESC environment and the policy pack once. Every consuming team gets a Create button. Hold this picture for the demo.
-->

---

# The action is a short function around one Automation API program

<div class="zoom-content">

<div class="big-code code-sm">

```ts
const stack = await LocalWorkspace.createOrSelectStack({
  stackName: bucketName,
  projectName: PULUMI_PROJECT_NAME,
  program: createS3BucketProgram({ bucketName, team }),
});
await stack.addEnvironments(escEnvironment);
const upResult = await stack.up({ policyPacks: [policyPack] });
```

</div>

</div>

<style scoped>
.zoom-content { zoom: 1.6; }
</style>

<!--
[2 min] The only program code in the deck. Abridged from the action in 03-scaffolder-action: the real code reads the ESC environment and the policy pack path from environment variables and only applies them when set. Stack per bucket, ESC environment, policy pack, up.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Backstage to AWS with Pulumi.</h1>
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
[0.5 min] Demo divider. Switch to the terminal and the Backstage tab.
-->

---

# Seven steps take a catalog entry to a checked bucket

<div class="zoom-content" style="padding-top: 0.6rem">

<div class="steps" style="gap: 0.5rem">
  <div class="gpu-card step" v-click><ph-browser class="step__icon" /><p>Backstage is up and the catalog is browsable</p></div>
  <div class="gpu-card step" v-click><ph-note-pencil class="step__icon" /><p>The template renders, Create fails</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-cube class="step__icon" /><p>Registering the action makes a real bucket</p></div>
  <div class="gpu-card step" v-click><ph-key class="step__icon" /><p>Static keys leave, Create still works</p></div>
  <div class="gpu-card step" v-click><ph-clock-clockwise class="step__icon" /><p>The stack is already in Pulumi Cloud</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-shield-check class="step__icon" /><p>An untagged bucket is blocked</p></div>
  <div class="gpu-card gpu-card--accent step" v-click><ph-trash class="step__icon" /><p>Teardown removes the buckets</p></div>
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
[3 min] One card per step. Each step has an end state and one proof. We go in this order because every step removes one thing the audience would otherwise worry about. Remind people the commands are in the repo folder with the same name as the step.
-->

---

# 1 · Backstage is up and the catalog is browsable

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
curl -fsS http://<host>:7007/api/catalog/entities | head -c 200
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-browser /><span>Open the portal on port 7007</span></li>
    <li><ph-books /><span>Browse the catalog</span></li>
    <li><ph-plus-circle /><span>Open Create</span></li>
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
[4 min] Backstage runs in Docker Compose on one EC2 host from 01-backstage-host. Open the portal, show the catalog, open Create. The curl is the proof for people who prefer a terminal. Nothing Pulumi yet.
-->

---

# 2 · The template renders, and Create fails on a missing action

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-browser />Backstage task log</div>
    <aside class="info-card"><div class="info-card__label">What the log says</div><p>The action <code>pulumi:s3-bucket</code> is not registered yet</p></aside>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-note-pencil /><span>The form comes from <code>02-template</code></span></li>
    <li><ph-prohibit /><span>The task fails at the step</span></li>
    <li><ph-gear /><span>The action is the missing piece</span></li>
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
[4 min] Fill in the form from the template and press Create. It fails on purpose and the log names the missing action. This makes the point that the template is only a form until an action sits behind it.
-->

---

# 3 · Registering the action turns Create into a real bucket

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />backend, then aws cli</div>
    <div class="big-code code-sm">

```bash
aws s3api get-bucket-tagging --bucket <name>
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-package /><span>Register the module in the backend</span></li>
    <li><ph-cursor-click /><span>Click Create again</span></li>
    <li><ph-tag /><span>A bucket with tags exists</span></li>
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
[6 min] Register the module from 03-scaffolder-action in the Backstage backend, restart, and click Create. Watch the task log stream the Pulumi update. The aws command is the proof: the bucket exists and carries tags. At this point the host still holds a static AWS key, which is the next step.
-->

---

# 4 · The host holds no AWS key, and Create still works

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-cube />backend container</div>
    <div class="big-code code-sm">

```bash
env | grep -c AWS_ACCESS_KEY_ID
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-trash /><span>Remove the static AWS keys</span></li>
    <li><ph-vault /><span>Set the ESC environment variable</span></li>
    <li><ph-arrow-clockwise /><span>Restart, click Create</span></li>
    <li><ph-check-circle /><span>The command prints 0</span></li>
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
[5 min] Remove the static keys, set PULUMI_ESC_ENVIRONMENT to the ESC environment, restart Backstage and click Create. Same result with no long-lived credential. The grep count of zero is the proof. If live OIDC fails, switch to the fallback ESC environment with a pre-minted credential.
-->

---

# 5 · The stack and its history are already in Pulumi Cloud

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-terminal-window />terminal</div>
    <div class="big-code code-sm">

```bash
05-pulumi-cloud/show-history.sh <org> <bucket-name>
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-cube /><span>The stack is named after the bucket</span></li>
    <li><ph-list-bullets /><span>Resources and outputs are listed</span></li>
    <li><ph-clock-clockwise /><span>Every update is in the history</span></li>
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
[4 min] The script prints the stack's resources and update history and opens the console. Same data as the Pulumi Cloud page. Show the project name, the stack, the update from the Create click.
-->

---

# 6 · An untagged bucket is blocked before it exists

<div class="zoom-content">

<div class="checks__cmd">

<div class="big-code code-sm">

```bash
PREVIEW_OMIT_TEAM=true PULUMI_POLICY_PACK_PATH=$PWD/../06-policy npx tsx test/preview.ts
```

</div>

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-gear /><div><div class="gpu-caption gpu-caption--accent">1 · Pack path</div><code>PULUMI_POLICY_PACK_PATH</code></div></div>
  <div class="gpu-card check" v-click><ph-tag /><div><div class="gpu-caption gpu-caption--accent">2 · Tag left off</div><code>WORKSHOP_OMIT_TEAM_TAG=true</code></div></div>
  <div class="gpu-card check" v-click><ph-cursor-click /><div><div class="gpu-caption gpu-caption--accent">3 · Create</div>click in Backstage</div></div>
  <div class="gpu-card check" v-click><ph-prohibit /><div><div class="gpu-caption gpu-caption--accent">4 · Blocked</div>the update does not run</div></div>
  <div class="gpu-card check" v-click><ph-scroll /><div><div class="gpu-caption gpu-caption--accent">5 · Violation</div><code>s3-bucket-require-team-tag</code></div></div>
  <div class="gpu-card check" v-click><ph-terminal-window /><div><div class="gpu-caption gpu-caption--accent">6 · Offline</div>same output from the preview</div></div>
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
[6 min] Set the pack path and leave the team tag off, restart, click Create. The update is blocked and Backstage shows the rule name. The command runs the same check offline from 03-scaffolder-action. Repeat that the demo runs the pack locally, and production would use policy groups.
-->

---

# 7 · Teardown removes every bucket stack, and --full removes the rest

<div class="zoom-content">

<div class="s5__cmd">

<div class="big-code code-sm">

```bash
./teardown.sh
```

</div>

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-terminal-window /><span>The script lists the bucket stacks</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-trash /><span>Each stack is destroyed</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-check-circle /><span>Its record is removed</span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Run it from 07-teardown</div><p>With <code>--full</code> it also destroys the bootstrap stack. Then stop or terminate the host.</p></aside>
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
[4 min] Run teardown from 07-teardown. It destroys each bucket stack and removes its record. The full flag also destroys the bootstrap stack (IAM role and OIDC provider) and stops the Compose host, so use it only at the end. Stop the EC2 host afterward. Expected cost is under a dollar. Then go to questions.
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/provisioning-infrastructure-from-a-backstage-catalog" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → provisioning-infrastructure-from-a-backstage-catalog</div>
  </div>
  <div class="res-card">
    <QRCode data="https://backstage.io/docs/features/software-templates/writing-custom-actions/" dark="#000000" />
    <div class="res-card__title">Backstage: writing custom scaffolder actions</div>
    <div class="res-card__body">backstage.io/docs</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/iac/packages-and-automation/automation-api/" dark="#000000" />
    <div class="res-card__title">Pulumi Automation API</div>
    <div class="res-card__body">pulumi.com/docs/automation-api</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/aws-login/" dark="#000000" />
    <div class="res-card__title">Pulumi ESC: AWS login with OIDC</div>
    <div class="res-card__body">pulumi.com/docs/esc</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/insights/policy/" dark="#000000" />
    <div class="res-card__title">Pulumi Policies</div>
    <div class="res-card__body">pulumi.com/docs/policy</div>
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
[2.5 min] Resources. Scan the QR codes. The workshop folder has the demo code and these slides.
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
[2 min] Point at the next steps for Pulumi: the docs, the community, the next workshop.
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/provisioning-infrastructure-from-a-backstage-catalog" dark="#000000" /></div>
      <div class="thanks__qr-label">provisioning-infrastructure-from-a-backstage-catalog</div>
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
[4 min] Thank the room and take questions. Return to the six question cards if it helps.
-->
