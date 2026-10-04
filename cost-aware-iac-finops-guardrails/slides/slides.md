---
theme: "@pulumi/slidev-theme"
title: "Cost-aware infrastructure as code: tagging, budgets and FinOps guardrails with Pulumi"
info: |
  Cost-aware infrastructure as code: tagging, budgets and FinOps guardrails with Pulumi: Provision a budget as code and block untagged or oversized instances at preview.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/cost-aware-iac-finops-guardrails
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
    Cost-aware infrastructure as code: tagging, budgets and FinOps guardrails with Pulumi
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Provision a budget as code and block untagged or oversized instances at preview
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
Welcome. Title and the promise of the next ninety minutes. Time: 30 sec
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
Introduce yourself in a sentence, then go on. Time: 1 min
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
Housekeeping and agenda: a short divider. Time: 15 sec
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
Where the repo lives, what to install, how to ask questions. Time: 45 sec
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>The cost problem</li>
  <li>Budgets and tags as code</li>
  <li>Pulumi Policies</li>
  <li>The guardrails we build</li>
  <li>The demo</li>
  <li>Wrap-up and Q&A</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
Five parts: the problem, budgets and tags, Pulumi Policies, what we build, the demo. Time: 45 sec
-->

---

# The FinOps Foundation says: set ownership at creation

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">The FinOps Foundation, Allocation capability</div>
    <p>"Shifting Left in Allocation means ownership and metadata standards are enforced at the point a resource is created, not reconstructed later through tagging cleanup."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>A framework statement, not an incident</li>
      <li>At the Crawl level, ownership is recorded after deployment</li>
      <li>At Walk, required fields come before provisioning</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-quotes class="psst__icon" />
  <span><strong>That sentence is this workshop.</strong> We will enforce it with code.</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
Start here. This is the FinOps Foundation's own wording on the Allocation capability. It is a framework statement, not an incident. It says ownership and metadata should be enforced at the moment a resource is created, not rebuilt later in a tagging cleanup. Crawl is the level where ownership is recorded by hand after deployment. Walk makes the fields a precondition for provisioning. Today we build the Walk behaviour with code. Time: 2 min 55 sec
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[4rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[85%]">"Monthly challenges identifying the owners of unknown, untagged, unidentified accounts"</h1>
  <p class="!mt-8 !text-[1.5rem] text-[var(--p-fg-muted)]">FinOps Foundation, Allocation capability, the Crawl-level symptom</p>
</div>

<!--
This is how the same page describes the Crawl level. Every month, somebody hunts for who owns the untagged thing. If you have run that hunt, you know the feeling. Time: 1 min
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The bill arrives after the deploy.</h1>
</div>

<!--
First tension. The deploy takes minutes. The bill shows up after it. Time: 30 sec
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The tagging cleanup arrives after the bill.</h1>
</div>

<!--
Second tension. By the time anyone asks who owns this, the money is spent and the owner is hard to find. Time: 30 sec
-->

---

# Cleanup finds the owner after the spend; a gate finds it before

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Tag cleanup, after deploy</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Ownership recorded by hand</li>
      <li>Tagging compliance is inconsistent</li>
      <li>Owners found monthly, after the spend</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">A gate, at creation</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Required fields are a precondition</li>
      <li>The resource never exists untagged</li>
      <li>The check runs before the cloud is touched</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
</style>

<!--
Two ways to get the same tag. On the left, the Crawl pattern from the FinOps page: ownership recorded by hand, compliance inconsistent, owners hunted monthly. On the right, the Walk pattern: required fields are a precondition for provisioning. The rest of the workshop is how to build the right-hand column with Pulumi IaC. Time: 1 min 30 sec
-->

---

# Six questions before you trust a cost guardrail

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-sliders-horizontal class="step-icon" /><div class="gpu-caption gpu-caption--muted">How much</div><p>How much may we spend?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-clock class="step-icon" /><div class="gpu-caption gpu-caption--muted">When</div><p>When do we hear about it?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-users-three class="step-icon" /><div class="gpu-caption gpu-caption--muted">Who</div><p>Who owns each resource?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-prohibit class="step-icon" /><div class="gpu-caption gpu-caption--muted">What if</div><p>What if nobody tags it?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-magnifying-glass class="step-icon" /><div class="gpu-caption gpu-caption--muted">Already there</div><p>What about what is already deployed?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-scales class="step-icon" /><div class="gpu-caption gpu-caption--muted">Too big</div><p>What stops an oversized instance?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
These six questions are the spine of the workshop. How much may we spend. When do we hear about it. Who owns each resource. What if nobody tags it. What about what is already deployed. And what stops an oversized instance. We answer them in this order. The first five get answers in the next section. The sixth one the demo answers last. Time: 1 min 30 sec
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">A budget is a resource, so it lives in code.</h1>
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
First section: how much and when. A budget is just another resource. Time: 20 sec
-->

---

# A budget carries its limit and its alert in one resource

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card gpu-card--primary chain__node" v-click="1">
    <ph-sliders-horizontal class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Budget</div>
    <span>Monthly limit</span>
  </div>
  <ph-arrow-right class="chain__arrow" />
  <div class="gpu-card chain__node" v-click="2">
    <ph-bell class="chain__icon" />
    <div class="gpu-caption">Threshold</div>
    <span>Alert at 80%</span>
  </div>
  <ph-arrow-right class="chain__arrow" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-paper-plane-tilt class="chain__icon" />
    <div class="gpu-caption">Notification</div>
    <span>SNS topic and email</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click>
  <p>No Billing console clicks: the limit, the window and the alert are all code.</p>
</aside>

<div class="facts" v-click>
  <div class="fact"><ph-check-circle /><p><code>aws.budgets.Budget</code></p></div>
  <div class="fact"><ph-clock /><p>Time unit and limit are fields</p></div>
  <div class="fact"><ph-scroll /><p>Reviewed in a pull request</p></div>
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
In Pulumi IaC the AWS Budget is the aws.budgets.Budget resource. It has a limit, a time unit, and notifications. In our demo that is a monthly limit of fifty dollars with an alert at eighty percent, sent to an SNS topic and to an email subscriber. Everything you would click through in the Billing console is a field you can review in a pull request. Time: 2 min
-->

---

# A forecast alert fires before the money is spent

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Actual spend</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Alert after costs accrue</li>
      <li>You learn it already happened</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Forecasted spend</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Alert before costs accrue</li>
      <li>You can still change course</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
</style>

<!--
AWS Budgets supports alerts for both actual spend, after it accrues, and forecasted spend, before it accrues. A forecast alert is the early one. The AWS Budgets page says this directly. Our demo uses the actual-spend type at eighty percent, so it is the late alert, and I will say so when we get there. The point for now: a budget informs, it does not block. Time: 1 min 30 sec
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Every resource needs an owner.</h1>
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
Next section: who owns it. Time: 20 sec
-->

---

# A tag is not a cost allocation tag until you activate it

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">A tag on a resource</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>A key and a value</li>
      <li>For example <code>CostCenter</code></li>
      <li>Organizes resources</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">An activated cost allocation tag</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Activated separately in billing</li>
      <li>Appears in Cost Explorer</li>
      <li>Appears in the cost allocation report</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
</style>

<!--
A tag is a label with a key and a value. AWS says you can use tags to organize resources, and cost allocation tags to track costs in detail. And here is the catch: user-defined cost allocation tags have to be activated separately before they show up in Cost Explorer or on the cost allocation report. Our demo enforces that the tag exists. Activating it in billing stays a manual step, and I will list that in where this breaks today. Time: 2 min
-->

---

# Three questions covered, three to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-sliders-horizontal class="step-icon" /><div class="gpu-caption gpu-caption--accent">How much</div><p>A budget with a limit</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-clock class="step-icon" /><div class="gpu-caption gpu-caption--accent">When</div><p>An alert at 80%</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-users-three class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>A <code>CostCenter</code> tag</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-prohibit class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">What if</div><p>What if nobody tags it?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-magnifying-glass class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Already there</div><p>What about what is already deployed?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-scales class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Too big</div><p>What stops an oversized instance?</p></div>
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
Three down. We know how much, when we hear, and what the owner label is. Now the hard part: a tag that nothing enforces depends on people remembering it. Time: 1 min
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What if nobody tags it?</h1>
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
Section three: Pulumi Policies. Time: 20 sec
-->

---

# Policies run on the preview, before the cloud is touched

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-code class="chain__icon" />
    <div class="gpu-caption">Your program</div>
    <span>Python, TypeScript or others</span>
  </div>
  <ph-arrow-right class="chain__arrow" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-magnifying-glass class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Pulumi Policies</div>
    <span>Policy pack checks each resource</span>
  </div>
  <ph-arrow-right class="chain__arrow" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-cloud class="chain__icon" />
    <div class="gpu-caption">Your cloud</div>
    <span>Changes only if it passes</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click>
  <p>A violation of a mandatory policy stops the deployment.</p>
</aside>

<div class="facts" v-click>
  <div class="fact"><ph-eye /><p>Runs at <code>pulumi preview</code> and <code>up</code></p></div>
  <div class="fact"><ph-shield-check /><p>Enforced before any change in the cloud</p></div>
  <div class="fact"><ph-package /><p>Rules ship as a policy pack</p></div>
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
Pulumi Policies checks a resource during preview and up. The Pulumi docs say policies are enforced before anything changes in your cloud provider, and that a violation of a mandatory policy stops the deployment. Rules ship as a policy pack, which you hand to the CLI with the policy-pack flag. That is the gate from the earlier slide. Time: 2 min
-->

---

# Four enforcement levels: advisory warns, mandatory blocks

<div class="zoom-content">

<div class="modes">
  <div class="gpu-card mode" v-click>
    <div class="mode__head"><ph-info class="mode__icon" /><code class="mode__name">advisory</code></div>
    <p>Reports a warning</p>
  </div>
  <div class="gpu-card gpu-card--primary mode" v-click>
    <div class="mode__head"><ph-hand-palm class="mode__icon" /><code class="mode__name">mandatory</code></div>
    <p>Blocks the deployment</p>
  </div>
  <div class="gpu-card gpu-card--accent mode" v-click>
    <div class="mode__head"><ph-wrench class="mode__icon" /><code class="mode__name">remediate</code></div>
    <p>Fixes the resource</p>
  </div>
</div>

<aside class="info-card" v-click>
  <p>A fourth level, <code>disabled</code>, turns the policy off. Both packs today are <code>mandatory</code>.</p>
</aside>

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
Every policy has an enforcement level. Advisory reports a violation as a warning. Mandatory blocks the deployment. Remediate fixes the resource automatically. Disabled turns the policy off. We use mandatory for both packs today, so you can see a real stop. If your team is nervous, start with advisory for a sprint and watch the warnings. Time: 1 min 30 sec
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What about what is already deployed?</h1>
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
Section four: the resources that already exist. Time: 20 sec
-->

---

# Preventative blocks at preview; audit reports what already exists

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Audit policy groups</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Evaluate discovered resources</li>
      <li>Evaluate the latest state of stacks</li>
      <li>Report violations, block nothing</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Preventative policy groups</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Evaluate IaC-managed resources</li>
      <li>Run during preview and up</li>
      <li>Can block a deployment</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
</style>

<!--
Pulumi has two enforcement modes, chosen per policy group. Preventative groups evaluate IaC-managed resources during preview and up, and can block. Audit groups evaluate discovered resources and the latest stack state, and report without blocking. So your untagged legacy instances are an audit finding, not a blocked deploy. The audit side is a Pulumi Cloud feature. We show it on a slide here and do not run it live. Time: 2 min
-->

---

# Where this breaks today

<div class="zoom-content">

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-warning class="step-icon" /><div class="gpu-caption gpu-caption--accent">Tag activation</div><p>Activating the tag in billing is a manual step</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-bell class="step-icon" /><div class="gpu-caption gpu-caption--accent">Alert only</div><p>The budget sends mail and attaches no action</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-scales class="step-icon" /><div class="gpu-caption gpu-caption--accent">One resource type</div><p>Both packs check <code>aws.ec2.Instance</code> only</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-package class="step-icon" /><div class="gpu-caption gpu-caption--accent">Per command</div><p>The demo passes the pack by flag, not by policy group</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
Four limits. One: cost allocation tags still have to be activated in billing. Two: our budget sends email and attaches no action. Three: both packs only look at EC2 instances, so a tagged-but-wrong resource type slips by. Four: we pass the pack with a flag on the CLI. Enforcing it org-wide on stacks is what Pulumi Cloud policy groups are for. The docs describe that, we do not demo it. Time: 2 min
-->

---

# Five questions answered, one to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-sliders-horizontal class="step-icon" /><div class="gpu-caption gpu-caption--accent">How much</div><p>A budget as code</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-clock class="step-icon" /><div class="gpu-caption gpu-caption--accent">When</div><p>An 80% alert</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-users-three class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>A <code>CostCenter</code> tag</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-prohibit class="step-icon" /><div class="gpu-caption gpu-caption--accent">What if</div><p>A mandatory policy at preview</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-magnifying-glass class="step-icon" /><div class="gpu-caption gpu-caption--accent">Already there</div><p>Audit mode in Pulumi Cloud</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-scales class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Too big</div><p>What stops an oversized instance?</p></div>
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
Five answered. How much, when, who, what if nobody tags it, and what about what exists. One left: what stops an oversized instance. The demo answers that last. Time: 1 min
-->

---

# One policy pack sits between your code and the cloud

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-laptop class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Your machine</div></div>
    <ul class="zone__list">
      <li><ph-file-code /><span>A Pulumi program per step</span></li>
      <li><ph-gavel /><span>Two policy packs: tag, then size</span></li>
      <li><ph-eye /><span><code>pulumi preview</code> runs the packs</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption">AWS</div></div>
    <ph-sliders-horizontal class="zone__hero" />
    <p>A budget, an SNS topic and one <code>t3.micro</code></p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">The guardrail</div>
  <p>A failing pack means nothing reaches AWS.</p>
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
This is what we build. On the left, your machine: one small Pulumi program per step, and two policy packs. One requires the CostCenter tag. The second adds a size rule on top. On the right, AWS: a budget with its SNS topic and email subscriber, and one t3.micro instance. When the preview runs the packs and one fails, nothing reaches AWS. Time: 1 min 30 sec
-->

---

# The tag rule is a few lines of Python

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-file-code />03-tagging-policy</div>
    <div class="big-code code-sm">

```python
cost_center_tag_required = ResourceValidationPolicy(
    name="cost-center-tag-required",
    description="Requires a CostCenter tag on every EC2 instance for cost allocation.",
    enforcement_level=EnforcementLevel.MANDATORY,
    validate=validate_cost_center_tag,
)
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-gavel /><span>One policy, one name</span></li>
    <li><ph-hand-palm /><span>Mandatory blocks the deployment</span></li>
    <li><ph-code /><span>The check is a function we write</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
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
This is the only program code you will see today. A ResourceValidationPolicy has a name, a description, an enforcement level, and a validate function. Ours is mandatory. The validate function looks at EC2 instances and reports a violation when the CostCenter tag is missing. The size pack adds a second policy of the same shape, named instance-size-guardrail. The code lives in the repo, and we will read it side by side on screen in the demo. Time: 2 min
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Cost-aware IaC.</h1>
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
Demo divider. Take a breath. Time: 15 sec
-->

---

# What we are going to do

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-sliders-horizontal class="step__icon" /><p>A budget with an 80% alert, as code</p></div>
  <div class="gpu-card step" v-click><ph-warning class="step__icon" /><p>An untagged instance deploys, unchecked</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-prohibit class="step__icon" /><p>The tag policy blocks it at preview</p></div>
  <div class="gpu-card step" v-click><ph-check-circle class="step__icon" /><p>A tagged instance passes the same pack</p></div>
  <div class="gpu-card gpu-card--accent step" v-click><ph-scales class="step__icon" /><p>The size guardrail blocks <code>t3.2xlarge</code></p></div>
  <div class="gpu-card step" v-click><ph-trash class="step__icon" /><p>Teardown leaves nothing behind</p></div>
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
Here is the plan for the live part. Step one, the budget. Step two, an untagged instance goes through, because nothing stops it. Step three, the tag policy blocks it at preview. Step four, add the tag and the same pack passes. Step five, the size rule blocks a t3.2xlarge. Then teardown. Setup is in the README for each folder. Time: 2 min 30 sec
-->

---

# 1 · The budget exists before the spend

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />01-budget</div>
    <div class="big-code code-sm">

```bash
pulumi up
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-seal-check /><span>Five resources: budget, SNS topic, email subscriber</span></li>
    <li><ph-paper-plane-tilt /><span>Confirm the SNS email</span></li>
    <li><ph-eye /><span>Check the Billing console for the budget</span></li>
    <li><ph-sliders-horizontal /><span>Alert at 80% of the limit</span></li>
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
Step one, folder 01-budget. Before this I set the region, the alert email and a limit of fifty. Run pulumi up. Five resources come up, including the budget with its eighty percent alert. Confirm the SNS email so alerts can be delivered, then open the Billing console and find the budget. Time: 8 min
-->

---

# 2 · An untagged instance deploys cleanly

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />02-untagged-instance</div>
    <div class="big-code code-sm">

```bash
pulumi up
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-check /><span>A <code>t3.micro</code>, no <code>CostCenter</code> tag</span></li>
    <li><ph-warning /><span>The update succeeds</span></li>
    <li><ph-prohibit /><span>Nothing stopped it</span></li>
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
Step two. A t3.micro with no CostCenter tag. pulumi up succeeds. This is the gap: no policy exists yet, so nothing in the pipeline objects. Remember the monthly hunt for owners from the start. Time: 6 min
-->

---

# 3 · The tag policy blocks it at preview

<div class="zoom-content">

<div class="s5__cmd big-code code-sm">

```bash
pulumi preview --policy-pack ../03-tagging-policy
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-terminal-window /><span>Preview runs from 02, with the pack</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-magnifying-glass /><span>The pack inspects the instance</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-shield-warning /><span>Mandatory violation: <code>cost-center-tag-required</code></span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Before any deploy</div><p>The preview fails. Nothing reaches AWS.</p></aside>
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
Step three. Same folder, same program, one new flag: pass the policy pack to preview. The pack finds the instance has no CostCenter tag and reports a mandatory violation named cost-center-tag-required. The preview fails. Nothing reached AWS. Read the message aloud, it tells the developer exactly what to add. Tests run offline too, with python unittest in the policy folder. Time: 9 min
-->

---

# 4 · A tagged instance passes the same pack

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
pulumi up --policy-pack ../03-tagging-policy
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-trash /><div><div class="gpu-caption gpu-caption--accent">1 · Replace</div><span>Destroy the untagged one in 02</span></div></div>
  <div class="gpu-card check" v-click><ph-eye /><div><div class="gpu-caption gpu-caption--accent">2 · Preview</div><span>Preview first, with the same flag</span></div></div>
  <div class="gpu-card check" v-click><ph-check-circle /><div><div class="gpu-caption gpu-caption--accent">3 · Passes</div><span>No violation in 04</span></div></div>
  <div class="gpu-card check" v-click><ph-users-three /><div><div class="gpu-caption gpu-caption--accent">4 · Owner</div><span>The instance carries <code>CostCenter</code></span></div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.checks { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.9rem; }
.checks__cmd { margin-bottom: 1.1rem; }
.checks__cmd pre { margin: 0 !important; }
.check { display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.2rem; }
.check > svg { flex-shrink: 0; font-size: 1.9rem; color: var(--p-primary); }
.check code { display: inline-block; margin-top: 0.4rem; font-size: 0.9rem !important; background: var(--p-bg) !important; }
.checks__note { display: flex; align-items: center; gap: 0.7rem; margin-top: 1.3rem; }
.checks__icon { font-size: 1.4rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
Step four. I destroy the untagged instance in folder 02, move to 04, and run preview with the same pack flag first. It passes, because the instance now carries the CostCenter tag. Then pulumi up with the flag. The same rule that blocked the bad case allows the good case. Time: 8 min
-->

---

# 5 · The size guardrail blocks <code>t3.2xlarge</code>

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
pulumi config set instanceType t3.2xlarge
pulumi preview --policy-pack ../05-size-guardrail
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-prohibit /><div><div class="gpu-caption gpu-caption--accent">1 · Blocked</div><span>Violation: <code>instance-size-guardrail</code></span></div></div>
  <div class="gpu-card check" v-click><ph-gavel /><div><div class="gpu-caption gpu-caption--accent">2 · Distinct</div><span>A second rule, separate from the tag rule</span></div></div>
  <div class="gpu-card check" v-click><ph-check-circle /><div><div class="gpu-caption gpu-caption--accent">3 · Allowed</div><span>Back at <code>t3.micro</code>, it passes</span></div></div>
  <div class="gpu-card check" v-click><ph-scales /><div><div class="gpu-caption gpu-caption--accent">4 · Limit</div><span>Anything above <code>t3.large</code> is blocked</span></div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.checks { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.9rem; }
.checks__cmd { margin-bottom: 1.1rem; }
.checks__cmd pre { margin: 0 !important; }
.check { display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.2rem; }
.check > svg { flex-shrink: 0; font-size: 1.9rem; color: var(--p-primary); }
.check code { display: inline-block; margin-top: 0.4rem; font-size: 0.9rem !important; background: var(--p-bg) !important; }
.checks__note { display: flex; align-items: center; gap: 0.7rem; margin-top: 1.3rem; }
.checks__icon { font-size: 1.4rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
Step five. Same folder 04, now with the size pack. I set instanceType to t3.2xlarge and run preview. It fails with a different, distinct rule: instance-size-guardrail. The tag is fine, the size is not. Set it back to t3.micro and the preview passes again. The rule is an allow list from t3.nano to t3.large. That answers our sixth question. Time: 9 min
-->

---

# Teardown leaves no budget behind

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-trash />04-tagged-instance, then 01-budget</div>
    <div class="big-code code-sm">

```bash
pulumi destroy
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-trash /><span>Destroy 04, then destroy 01</span></li>
    <li><ph-eye /><span>Confirm <code>cost-aware-iac-workshop</code> is gone in Billing</span></li>
    <li><ph-warning /><span>AWS Budgets has no soft delete</span></li>
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
Teardown. Run pulumi destroy in 04, then in 01-budget. Then check in the Billing console that the budget called cost-aware-iac-workshop is gone. Budgets have no soft delete, so confirm it. Time: 5 min
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/cost-aware-iac-finops-guardrails" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → cost-aware-iac-finops-guardrails</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/" dark="#000000" />
    <div class="res-card__title">Write a policy pack</div>
    <div class="res-card__body">pulumi.com/docs</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/registry/packages/aws/api-docs/budgets/budget/" dark="#000000" />
    <div class="res-card__title">aws.budgets.Budget</div>
    <div class="res-card__body">pulumi.com/registry</div>
  </div>
  <div class="res-card">
    <QRCode data="https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html" dark="#000000" />
    <div class="res-card__title">AWS Budgets</div>
    <div class="res-card__body">docs.aws.amazon.com</div>
  </div>
  <div class="res-card">
    <QRCode data="https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html" dark="#000000" />
    <div class="res-card__title">Cost allocation tags</div>
    <div class="res-card__body">docs.aws.amazon.com</div>
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
Resources: the repo and the docs we used. QR codes are on the slide. Time: 45 sec
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
Where to go next. Time: 30 sec
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/cost-aware-iac-finops-guardrails" dark="#000000" /></div>
      <div class="thanks__qr-label">cost-aware-iac-finops-guardrails</div>
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
Questions. We have time, so open the floor. Time: 10 min
-->
