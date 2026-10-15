---
theme: "@pulumi/slidev-theme"
title: "Azure Policy as code with Pulumi"
info: |
  Azure Policy as code with Pulumi: Management groups, initiatives, assignments and preventive Pulumi Policies.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/azure-policy-as-code-pulumi-policies
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
    Azure Policy as code with Pulumi
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Management groups, initiatives, assignments and preventive Pulumi Policies
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
[1.0 min] Welcome. Title and the one-line promise: a baseline that holds, in Azure and before Azure.
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
[1.0 min] Speakers to be confirmed. Introduce yourselves when known.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
[0.25 min] Divider. Housekeeping first.
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
[1.0 min] Housekeeping: where the repo is, how to ask questions, that the demo steps build on each other. Say the Azure account needs rights to create management groups.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>Why a public storage account is still easy to ship</li>
  <li>How Azure Policy governs</li>
  <li>Managing it as code with Pulumi IaC</li>
  <li>Preventive Pulumi Policies</li>
  <li>Where each layer breaks</li>
  <li>The demo</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
[1.5 min] Agenda. Read the five items. Say the six questions come next and the demo answers them.
-->

---

# Attackers go looking for public storage

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">Microsoft's own words</div>
    <p>"Threat actors enumerate Blob Storage to identify publicly exposed data and credentials that they can leverage later in the attack chain."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>Microsoft's threat analysis of Azure Blob Storage</li>
      <li>Published 20 October 2025</li>
      <li>Public containers and the credentials in them are the target</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span><strong>Source:</strong> Microsoft Security blog, 2025-10-20</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
[1.25 min] Open with the scene. Read the quote slowly, it is Microsoft's sentence, not ours. The blog is a threat analysis of attacks on Azure Blob Storage. The point for this room: public exposure is something attackers search for on purpose. Do not add numbers beyond what is on the slide. Our rule for the day is small: no storage account allows public blob access.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Your Pulumi stack can be clean.</h1>
</div>

<!--
[0.25 min] One beat. Let it sit. Say that your own program is reviewed and you trust it.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Azure takes requests from every other caller too.</h1>
</div>

<!--
[0.25 min] Second beat. A portal click, a script, another team's pipeline. All of them reach Azure Resource Manager. The brief's layering rule starts here.
-->

---

# A rule on a wiki doesn't stop a request

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Policy as a document</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Written on a wiki</li>
      <li>Checked in a review</li>
      <li>Found after the account exists</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Policy as code</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Definitions in your repo</li>
      <li>Inherited from a management group</li>
      <li>Enforced at the request, or at preview</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1.25 min] Contrast. Left is how most teams start. Right is what we build today in two layers: Azure Policy inside Azure, Pulumi Policies in front of it. Keep it short, the next slide asks the real questions.
-->

---

# Six questions before you trust a baseline

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-tree-structure class="step-icon" /><div class="gpu-caption gpu-caption--muted">Where</div><p>Where does a rule live so every subscription inherits it?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-list-checks class="step-icon" /><div class="gpu-caption gpu-caption--muted">What happens</div><p>What does Azure do when a request breaks the rule?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-file-code class="step-icon" /><div class="gpu-caption gpu-caption--muted">As code</div><p>How do we manage the baseline as code?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-clock-counter-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--muted">Existing</div><p>What about resources that already exist, and exceptions?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-shield-check class="step-icon" /><div class="gpu-caption gpu-caption--muted">Before Azure</div><p>What stops it before Azure is even called?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-scales class="step-icon" /><div class="gpu-caption gpu-caption--muted">Which layer</div><p>Which layer owns what?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[2.0 min] These six questions are the spine of the next 40 minutes. Read each one aloud. Questions one to five get an answer in the next section. Question six is answered by the demo and the closing discussion, where we agree the layering rule: Pulumi Policies in CI, Azure Policy as the backstop.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Where does a rule live so every subscription inherits it?</h1>
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
[0.25 min] Question one. Section opener, keep moving.
-->

---

# Assign once at a management group, subscriptions inherit

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-tree-structure class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Management group ws-governance</div></div>
    <ul class="zone__list">
      <li><ph-stack /><span>Governance conditions cascade down</span></li>
      <li><ph-cloud /><span>The subscription moves in as a child</span></li>
      <li><ph-shield-check /><span>Rules apply to the resources beneath it</span></li>
      <li><ph-user-circle /><span>You need rights to create and manage groups</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption">Azure Resource Manager</div></div>
    <ph-globe-hemisphere-west class="zone__hero" />
    <p>Every request is checked against what is inherited</p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">The risk</div>
  <p>If your tenant blocks management groups, assign at subscription scope instead.</p>
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
[2.0 min] Microsoft Learn says governance conditions applied to a management group cascade by inheritance to all associated subscriptions. That is why we assign at the group. Risk from the brief: creating and managing groups needs the right permissions (Microsoft Learn lists write permissions on the group and the subscription). The demo has a scopeMode setting that falls back to the subscription. Mention it, do not demo it.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What does Azure do when a request breaks the rule?</h1>
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
[0.25 min] Question two.
-->

---

# The effect decides what Azure does

<div class="zoom-content">

<div class="modes">
  <div class="gpu-card gpu-card--primary mode" v-click>
    <div class="mode__head"><ph-magnifying-glass class="mode__icon" /><code class="mode__name">audit</code></div>
    <p>Flags the resource as non-compliant</p>
    <div class="mode__note">Our default, and step 7 starts here</div>
  </div>
  <div class="gpu-card gpu-card--accent mode" v-click>
    <div class="mode__head"><ph-prohibit class="mode__icon" /><code class="mode__name">deny</code></div>
    <p>Rejects the request before the resource provider is called</p>
    <div class="mode__note">We switch to it near the end of step 7</div>
  </div>
  <div class="gpu-card mode" v-click>
    <div class="mode__head"><ph-tag class="mode__icon" /><code class="mode__name">modify</code></div>
    <p>Alters the request, for example adds a tag</p>
    <div class="mode__note">Remediation applies it to existing resources</div>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.modes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; align-items: stretch; }
.mode { display: flex; flex-direction: column; gap: 0.9rem; padding-inline: 1.4rem; }
.mode p { margin: 0 !important;  font-size: 1.25rem; }
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
[2.0 min] Effects from Microsoft Learn. Audit records, deny blocks, modify changes. Azure processes several effects before it hands the request to the resource provider, and deny is evaluated before audit so you do not log the same bad resource twice. Also exist: deployIfNotExists and disabled. We stay with these three. Compliance results can take minutes, so in the demo we trigger a scan or show a recorded result.
-->

---

# Two questions covered, four to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-tree-structure class="step-icon" /><div class="gpu-caption gpu-caption--accent">Where</div><p>Management group, inherited</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-list-checks class="step-icon" /><div class="gpu-caption gpu-caption--accent">What happens</div><p>audit, deny, modify</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-file-code class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">As code</div><p>How do we manage the baseline as code?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-clock-counter-clockwise class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Existing</div><p>What about resources that already exist?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-check class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Before Azure</div><p>What stops it before Azure is called?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-scales class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Which layer</div><p>Which layer owns what?</p></div>
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
[0.25 min] Recap. Two answered, point at the muted cards.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How do we manage the baseline as code?</h1>
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
[0.25 min] Question three.
-->

---

# Definition, initiative, assignment: one chain, one component

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-file-code class="plan__icon" />
    <p>Custom definition: the rule</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-list-checks class="plan__icon" />
    <p>Initiative: definitions grouped, effect as parameter</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-target class="plan__icon" />
    <p>Assignment at the group, with an identity</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-cube class="plan__icon" />
    <p>One component wraps all three</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-eye class="plan__foot-icon" />
  <p>Pulumi IaC shows the change in <code>pulumi preview</code> before it lands.</p>
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
[2.25 min] The definition holds the rule. For us: a storage account whose allowBlobPublicAccess is not false. It is the same check as a built-in definition, so say that. The initiative groups it with a modify definition that adds a tag, so remediation has something to do. The assignment applies the initiative with the effect parameter. Then we wrap all three in a Pulumi component. Pulumi IaC is the tool for the whole chain, same program, same preview.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What about resources that already exist, and exceptions?</h1>
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
[0.25 min] Question four.
-->

---

# Audit finds it, a waiver excuses it, remediation fixes the tag

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-magnifying-glass class="plan__icon" />
    <p>Audit flags the public account</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-hand-palm class="plan__icon" />
    <p>Exemption, category Waiver, with an expiry</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-wrench class="plan__icon" />
    <p>Remediation task fixes the tag</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-check-circle class="plan__icon" />
    <p>Compliant tags, and a visible exception</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-info class="plan__foot-icon" />
  <p>Waiver means the non-compliance is accepted for now. Mitigated means the intent is met another way.</p>
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
[2.0 min] Microsoft Learn: remediation tasks apply modify or deployIfNotExists to existing non-compliant resources using the identity set on the assignment. So that identity needs a role. In the demo it holds Tag Contributor. Exemptions have two categories, Waiver and Mitigated. We use Waiver and give it an expiry. Risk: if the identity has no role, the remediation cannot change the resource. Check the role assignment exists before running it.
-->

---

# Four questions covered, two to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-tree-structure class="step-icon" /><div class="gpu-caption gpu-caption--accent">Where</div><p>Management group, inherited</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-list-checks class="step-icon" /><div class="gpu-caption gpu-caption--accent">What happens</div><p>audit, deny, modify</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-file-code class="step-icon" /><div class="gpu-caption gpu-caption--accent">As code</div><p>Definition, initiative, assignment, component</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-clock-counter-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--accent">Existing</div><p>Remediation task, waiver exemption</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-check class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Before Azure</div><p>What stops it before Azure is called?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-scales class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Which layer</div><p>Which layer owns what?</p></div>
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
[0.25 min] Recap. Four answered.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What stops it before Azure is even called?</h1>
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
[0.25 min] Question five.
-->

---

# Pulumi Policies has four enforcement levels

<div class="zoom-content">

<div class="modes">
  <div class="gpu-card gpu-card--primary mode" v-click>
    <div class="mode__head"><ph-warning class="mode__icon" /><code class="mode__name">advisory</code></div>
    <p>Reports a violation as a warning</p>
    <div class="mode__note">Does not stop the update</div>
  </div>
  <div class="gpu-card gpu-card--accent mode" v-click>
    <div class="mode__head"><ph-hand-palm class="mode__icon" /><code class="mode__name">mandatory</code></div>
    <p>Blocks the deployment</p>
    <div class="mode__note">The level the demo uses</div>
  </div>
  <div class="gpu-card mode" v-click>
    <div class="mode__head"><ph-wrench class="mode__icon" /><code class="mode__name">remediate</code></div>
    <p>Fixes the resource automatically</p>
    <div class="mode__note">A fourth level, disabled, turns a policy off</div>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.modes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; align-items: stretch; }
.mode { display: flex; flex-direction: column; gap: 0.9rem; padding-inline: 1.4rem; }
.mode p { margin: 0 !important;  font-size: 1.25rem; }
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
[2.0 min] From the Pulumi docs: advisory warns, mandatory blocks, remediate fixes automatically, disabled turns the policy off. Our policy is mandatory. Pulumi Policies are checked against the resources the program declares, during preview and up, before anything changes in your cloud provider. Rules are written in TypeScript, Python or OPA (Rego); we use TypeScript.
-->

---

# A violation stops the preview, and Azure is never called

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-file-code class="plan__icon" />
    <p>Program declares a storage account</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-list-checks class="plan__icon" />
    <p>Pulumi IaC builds the plan</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-shield-check class="plan__icon" />
    <p>The policy pack validates each resource</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-prohibit class="plan__icon" />
    <p>Violation: preview fails, no Azure call</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-git-branch class="plan__foot-icon" />
  <p>Run the pack in CI or at preview, or it checks nothing.</p>
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
[2.0 min] The pack is a separate project with its own PulumiPolicy file. It runs when you pass it to preview. The rule reads allowBlobPublicAccess from the typed inputs of the storage account. If it is not false, it reports a violation. Caveat: the docs show the validateResourceOfType pattern with a provider class, and we use the azure-native storage account class. Say that this was written from the docs and has to be run before the event.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Deny acts late.</h1>
</div>

<!--
[0.5 min] Azure Policy deny stops the request, but only once Azure has received it. The error comes back from Azure.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Preview acts early.</h1>
</div>

<!--
[0.5 min] A Pulumi Policies violation stops the preview. Nothing is sent. Both statements are true, and both need running to be proven: say that.
-->

---

# Where this breaks today: each layer has a blind spot

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Azure Policy</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Runs when the request reaches Azure</li>
      <li>Covers every caller, not only Pulumi</li>
      <li>Compliance results can take minutes</li>
      <li>Remediation needs a role on the identity</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Pulumi Policies</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Runs at preview and up</li>
      <li>Checks the stacks that run the pack</li>
      <li>Needs the pack run in CI or at preview</li>
      <li>Does not see changes made outside Pulumi</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
</style>

<!--
[2.0 min] Say the limits plainly. Azure Policy deny acts at runtime, so the failure shows up late, as an error from Azure. Pulumi Policies acts at preview, early, but only for stacks that run the pack. A portal click never meets it. That is why we want both. Also say: step 7 deny, the remediation, the compliance evaluation and teardown were never run against a live Azure tenant when this deck was written.
-->

---

# Five questions covered, one to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-tree-structure class="step-icon" /><div class="gpu-caption gpu-caption--accent">Where</div><p>Management group, inherited</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-list-checks class="step-icon" /><div class="gpu-caption gpu-caption--accent">What happens</div><p>audit, deny, modify</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-file-code class="step-icon" /><div class="gpu-caption gpu-caption--accent">As code</div><p>Definition, initiative, assignment, component</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-clock-counter-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--accent">Existing</div><p>Remediation task, waiver exemption</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-shield-check class="step-icon" /><div class="gpu-caption gpu-caption--accent">Before Azure</div><p>Policy pack, mandatory, at preview</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-scales class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Which layer</div><p>The demo and the discussion answer this</p></div>
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
[0.25 min] Recap. The last card is answered by the demo, then by the discussion that closes it.
-->

---

# Two layers guard the same setting

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-rocket-launch class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Before Azure: Pulumi Policies</div></div>
    <ul class="zone__list">
      <li><ph-file-code /><span>Your Pulumi IaC program</span></li>
      <li><ph-shield-check /><span>Policy pack at preview, mandatory</span></li>
      <li><ph-prohibit /><span>A violation stops the update</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption">In Azure: Azure Policy</div></div>
    <ph-tree-structure class="zone__hero" />
    <p>Initiative assigned at the management group</p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">Layering rule</div>
  <p>Pulumi Policies in CI, Azure Policy as the backstop.</p>
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
[1.25 min] The picture we will build. Left: your pipeline with the pack. Right: Azure with the baseline at the group. They check the same setting. Put the layering rule on the table now and test it against the demo: Pulumi Policies in CI, Azure Policy as the backstop.
-->

---

# We build the baseline in four steps, then the pack

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-tree-structure class="plan__icon" />
    <p>Management group and test resource group</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-stack class="plan__icon" />
    <p>Definition, initiative and assignment in a component</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-magnifying-glass class="plan__icon" />
    <p>Audit, exempt, remediate, then Deny</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-shield-check class="plan__icon" />
    <p>A pack blocks it at preview</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-timer class="plan__foot-icon" />
  <p>75 minutes in total. Steps 1 to 8 are live.</p>
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
[1.25 min] Roadmap for the demo. Eight numbered folders, each a complete Pulumi project that builds on the one before, all on stack dev. No program code on slides, the code is in the editor.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Now we build it.</h1>
</div>

<!--
[0.5 min] Hand over to the demo. Open the editor and the terminal.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Azure Policy as code.</h1>
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
[0.25 min] Divider into the demo. Everything from here is live in the editor and the terminal.
-->

---

# What we are going to do

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-tree-structure class="step__icon" /><p>Management group and test resource group</p></div>
  <div class="gpu-card step" v-click><ph-file-code class="step__icon" /><p>A custom definition rejects public blob access</p></div>
  <div class="gpu-card step" v-click><ph-stack class="step__icon" /><p>An initiative groups it with a tag rule</p></div>
  <div class="gpu-card step" v-click><ph-target class="step__icon" /><p>The initiative is assigned at the group</p></div>
  <div class="gpu-card step" v-click><ph-cube class="step__icon" /><p>One component wraps the chain</p></div>
  <div class="gpu-card step" v-click><ph-hand-palm class="step__icon" /><p>Audit flags it, a waiver excuses it, a task fixes the tag</p></div>
  <div class="gpu-card step" v-click><ph-shield-check class="step__icon" /><p>Deny rejects the second account in Azure</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-prohibit class="step__icon" /><p>A policy pack blocks it at preview</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; padding-top: 1.5rem; }
.steps { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.8rem; }
.step { display: flex; flex-direction: row; align-items: center; gap: 0.9rem; padding: 0.8rem 1.1rem; }
.step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.step__icon { font-size: 2rem; color: var(--p-primary); }
</style>

<!--
[1.25 min] Eight steps as outcomes. Each folder is its own project, same stack name dev, and each builds on the one before. Say once: the command in steps two to six is pulumi up in that folder. Say the unverified part once, plainly: this demo has been checked by type-check and by reading, not by a live deployment into an Azure tenant.
-->

---

# 1 · Setup: the stack and the Azure provider are ready

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />01-setup</div>
    <div class="big-code code-sm">

```bash
pulumi stack init dev
pulumi config set azure-native:subscriptionId "$(az account show --query id -o tsv)"
pulumi preview
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-package /><span>npm install once, at the workshop root</span></li>
    <li><ph-sign-in /><span>Logged in with az login</span></li>
    <li><ph-check-circle /><span>Preview shows the stack, no changes</span></li>
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
[2.0 min] Prerequisites are in the README: Azure CLI logged in, Pulumi CLI, Node. Run npm install at the root first. Then the three commands. Expect preview to succeed with nothing to create. If preview fails, check the subscription id.
-->

---

# 2 · A management group now holds the subscription

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />02-management-group</div>
    <div class="big-code code-sm">

```bash
pulumi up
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-tree-structure /><span>The group ws-governance appears</span></li>
    <li><ph-arrow-fat-right /><span>The subscription becomes its child</span></li>
    <li><ph-warning /><span>Needs rights on the tenant root</span></li>
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
[4.0 min] Run pulumi up and say yes. Show the group in the Azure portal. If your tenant blocks management groups, the scopeMode setting falls back to the subscription. That fallback was not run live either. Allow time for it.
-->

---

# 3 · One custom definition rejects public blob access

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />03-policy-definition</div>
    <div class="big-code code-sm">

```bash
pulumi up
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-file-code /><span>The rule is the check on allowBlobPublicAccess</span></li>
    <li><ph-list-checks /><span>Its effect is a parameter</span></li>
    <li><ph-eye /><span>Open the definition in the portal</span></li>
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
[4.0 min] Open index.ts and read the policy rule. Run pulumi up. The effect is a parameter, so audit and deny need no new definition. Then show the definition in the portal.
-->

---

# 4 · The initiative adds a tag rule to the group

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />04-initiative</div>
    <div class="big-code code-sm">

```bash
pulumi up
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-stack /><span>Two definitions, one initiative</span></li>
    <li><ph-tag /><span>The second one adds a tag</span></li>
    <li><ph-sliders /><span>The effect passes through as a parameter</span></li>
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
[4.0 min] The tag definition uses modify, so remediation will have a job in step seven. Run pulumi up. Show the initiative and its two members.
-->

---

# 5 · The assignment turns the baseline on

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />05-assignment</div>
    <div class="big-code code-sm">

```bash
pulumi up
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-target /><span>Assigned at ws-governance</span></li>
    <li><ph-identification-card /><span>A managed identity, Tag Contributor</span></li>
    <li><ph-hourglass /><span>The role must exist before remediation</span></li>
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
[4.75 min] The assignment needs an identity, since modify uses it. The role assignment has to exist before step seven, so check it after the apply. Run pulumi up. Show the assignment on the group.
-->

---

# 6 · The same chain is now one component

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
pulumi preview
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-cube /><div><div class="gpu-caption gpu-caption--accent">AzureStorageBaseline</div><code>Wraps definition, initiative, assignment</code></div></div>
  <div class="gpu-card check" v-click><ph-equals /><div><div class="gpu-caption gpu-caption--accent">No changes</div><code>Resources keep their identity</code></div></div>
  <div class="gpu-card check" v-click><ph-git-branch /><div><div class="gpu-caption gpu-caption--accent">Reusable</div><code>One call per baseline</code></div></div>
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
[3.25 min] We refactored the three steps into one component. Run preview and read the output: it should show no changes, because the resources moved under the component with aliases. If you see replacements, stop and say so. Then show the short index.ts.
-->

---

# 7a · Audit flags it, a waiver excuses it, remediation fixes the tag

<div class="zoom-content">

<div class="s5__cmd big-code code-sm">

```bash
pulumi up
az policy state trigger-scan
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-cloud-arrow-up /><span>pulumi up creates a public storage account</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-magnifying-glass /><span>Azure flags it non-compliant</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step" v-click="3"><ph-hand-palm /><span>A waiver excuses it, with an expiry</span></div>
    <ph-arrow-down class="s5__arrow" v-click="4" />
    <div class="s5__step" v-click="4"><ph-wrench /><span>Remediation adds the missing tag</span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="5"><div class="info-card__label">Wait for it</div><p>Compliance results can take several minutes. Trigger the scan, then show a recorded result if needed.</p></aside>
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
[4.5 min] Run pulumi up with the effect on Audit. Trigger the scan. Show the non-compliant account. Then the exemption and the remediation task. Nothing in this step has been run against a live tenant: say so, and have a recording ready.
-->

---

# 7b · Deny rejects the second account in Azure

<div class="zoom-content">

<div class="s5__cmd big-code code-sm">

```bash
pulumi config set effect Deny
pulumi config set deploySecondAccount true
pulumi up
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-cloud-arrow-up /><span>pulumi up sends the second account</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step s5__step--stop" v-click="2"><ph-prohibit /><span>Azure rejects it at deployment time</span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="3"><div class="info-card__label">Runtime, not preview</div><p>The error comes from Azure, after the request was sent.</p></aside>
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
[4.0 min] Switch the effect to Deny and add the second account. Run pulumi up. The failure comes from Azure at deployment time. Compare with the next step, where nothing is sent at all.
-->

---

# 8 · The policy pack blocks it before anything is sent

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
(cd policy-pack && npm test)
pulumi preview --policy-pack ./policy-pack
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-check-circle /><div><div class="gpu-caption gpu-caption--accent">Unit tests pass</div><code>The rule is tested without Azure</code></div></div>
  <div class="gpu-card check" v-click><ph-prohibit /><div><div class="gpu-caption gpu-caption--accent">Mandatory violation</div><code>Preview stops</code></div></div>
  <div class="gpu-card check" v-click><ph-cloud-slash /><div><div class="gpu-caption gpu-caption--accent">No Azure call</div><code>Nothing is created</code></div></div>
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
[5.5 min] Run the tests, then preview with the pack. The violation is mandatory and the preview fails before any request goes to Azure. Then the discussion: which layer owns what? Close with the layering rule. Teardown is in the README, run it after the session: ../scripts/teardown.sh, from the last folder you deployed. It was not run live either.
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/azure-policy-as-code-pulumi-policies" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → azure-policy-as-code-pulumi-policies</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/discovery-governance/concepts/policy-as-code/" dark="#000000" />
    <div class="res-card__title">Pulumi Policies</div>
    <div class="res-card__body">pulumi.com/docs/discovery-governance</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/" dark="#000000" />
    <div class="res-card__title">Write your own policy packs</div>
    <div class="res-card__body">pulumi.com/docs/.../write-a-policy-pack</div>
  </div>
  <div class="res-card">
    <QRCode data="https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effect-basics" dark="#000000" />
    <div class="res-card__title">Azure Policy effects</div>
    <div class="res-card__body">learn.microsoft.com/.../effect-basics</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/registry/packages/azure-native/installation-configuration/" dark="#000000" />
    <div class="res-card__title">Azure Native setup</div>
    <div class="res-card__body">pulumi.com/registry/.../azure-native</div>
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
[1.0 min] Resources. The repo has the README with every command. Docs links are on screen.
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
[0.5 min] Continue the journey. One sentence per card, do not read them.
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/azure-policy-as-code-pulumi-policies" dark="#000000" /></div>
      <div class="thanks__qr-label">azure-policy-as-code-pulumi-policies</div>
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
[6.0 min] Questions. Use the time for the discussion: which layer owns what, and what is your layering rule? Anchor on: Pulumi Policies in CI, Azure Policy as the backstop.
-->
