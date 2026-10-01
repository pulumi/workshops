---
theme: "@pulumi/slidev-theme"
title: "Defense in Depth as Code: Kyverno Admission Control and Pulumi Policies"
info: |
  Defense in Depth as Code: Kyverno Admission Control and Pulumi Policies: Block an unsafe workload at the cluster door and in the Pulumi pipeline, with one rule at two layers.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/defense-in-depth-kyverno-pulumi-policies
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
    Defense in Depth as Code: Kyverno Admission Control and Pulumi Policies
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Block an unsafe workload at the cluster door and in the Pulumi pipeline, with one rule at two layers
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
Welcome. Introduce yourself and the topic: defense in depth for Kubernetes, with Kyverno and Pulumi Policies. We stand up both guards today.
Time: 1 min
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
Introduce the speaker. Placeholder slide: replace with the real speaker details before delivery.
Time: 2 min
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
Quick bridge into housekeeping and agenda.
Time: 0.5 min
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
Housekeeping: where the repo is, how questions work, what to have installed. Keep it short.
Time: 1 min
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>The incident and the tension</li>
  <li>Two places to stop a bad Pod</li>
  <li>Admission control with Kyverno</li>
  <li>Policies in the Pulumi pipeline</li>
  <li>Live demo</li>
  <li>Side by side and takeaways</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
Walk the agenda in one pass: the pain, the tech, the solution, then the demo.
Time: 1.5 min
-->

---

# A cluster accepted a workload nobody should have approved

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">RedLock researchers, February 2018</div>
    <p>"The hackers had infiltrated Tesla's Kubernetes console which was not password protected."</p>
    <div class="gpu-caption gpu-caption--muted" style="margin-top:1.2rem">arstechnica.com, Dan Goodin, Feb 20, 2018</div>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>An unprotected Kubernetes administrative console was the entry point</li>
      <li>Inside one pod, AWS access credentials were exposed</li>
      <li>Attackers ran currency-mining software in Tesla's cloud account</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span>RedLock reported it and the systems were quickly disinfected. <strong>Nothing at the door asked what was running.</strong></span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
Start with a real incident. In February 2018 RedLock researchers found that hackers had run currency-mining software in a Tesla cloud account. Their words on the slide: the Kubernetes console was not password protected. The same report says credentials to Tesla's AWS environment were exposed inside one pod. RedLock reported it and the systems were quickly disinfected. That last line, that nothing at the door asked what was running, is our reading, not the article's. Be clear about that when you say it. The incident was an open console, not missing resource limits. We use it for one point: an unguarded cluster accepts whatever it is handed.
Time: 3 min
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">You can review every manifest.</h1>
</div>

<!--
First half of the tension. Pause after it. Teams do review manifests, in pull requests, with a diff.
Time: 1 min
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">You can't review every request that reaches the cluster.</h1>
</div>

<!--
Second half. Requests come from pipelines, from kubectl, from tools, from people at 2 a.m. Review does not sit in that path.
Time: 1 min
-->

---

# A valid manifest is not a safe manifest

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Valid</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>The API server accepts it</li>
      <li>The schema is fine</li>
      <li>A Pod named <code>unsafe-pod</code> with image <code>nginx:1.27</code> reads as normal in a diff</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Safe</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Needs a rule somebody enforces</li>
      <li>Every container sets <code>resources.limits.cpu</code> and <code>resources.limits.memory</code></li>
      <li>The Pod Security Standards call the Privileged level "purposely-open, and entirely unrestricted"</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
Valid means the API server can parse it. Safe means somebody wrote a rule and something enforces it. Take the demo Pod: nothing in a diff looks wrong. It simply has no resource limits. The Privileged level of the Pod Security Standards describes itself as purposely open and entirely unrestricted, in the Kubernetes docs. So safety needs a rule with an enforcer. That is the workshop.
Time: 2 min
-->

---

# Six questions decide whether you can trust a guard

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-door class="step-icon" /><div class="gpu-caption gpu-caption--muted">Q1</div><p>Where does a request get checked?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-eye class="step-icon" /><div class="gpu-caption gpu-caption--muted">Q2</div><p>What does admission control see?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-code class="step-icon" /><div class="gpu-caption gpu-caption--muted">Q3</div><p>How do I ship that rule as code?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-git-branch class="step-icon" /><div class="gpu-caption gpu-caption--muted">Q4</div><p>Can the pipeline stop it earlier?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-warning class="step-icon" /><div class="gpu-caption gpu-caption--muted">Q5</div><p>What does each layer miss?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-scales class="step-icon" /><div class="gpu-caption gpu-caption--muted">Q6</div><p>Which layer should catch this?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
These are the six questions we answer today, in this order. Q1 and Q2 are about the cluster door. Q3 is about shipping the rule as code. Q4 moves the check into the pipeline. Q5 and Q6 are the point of the day: what each layer misses and which one you rely on. The demo answers the last one.
Time: 2 min
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Q1: Where does a request get checked?</h1>
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
First question. Short section.
Time: 0.5 min
-->

---

# Every request passes the API server before it is stored

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-terminal-window class="chain__icon" />
    <div class="gpu-caption">kubectl</div>
    <span>apply</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card chain__node" v-click="2">
    <ph-cloud-check class="chain__icon" />
    <div class="gpu-caption">API server</div>
    <span>receives the request</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-wrench class="chain__icon" />
    <div class="gpu-caption">Mutating admission</div>
    <span>may change it</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="4" />
  <div class="gpu-card chain__node" v-click="4">
    <ph-gavel class="chain__icon" />
    <div class="gpu-caption">Validating admission</div>
    <span>may reject it</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="5" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="5">
    <ph-cube class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">etcd</div>
    <span>stored</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="6">
  <p>Admission control runs in two phases, mutating then validating</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.chain { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.8rem; }
.chain__node { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; padding-block: 1.2rem; }
.chain__node span { font-size: 1.05rem; color: var(--p-fg); }
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
Walk left to right. kubectl apply sends a request to the API server. Admission control then runs in two phases: mutating first, then validating. Only a request that survives both is stored in etcd. The Kubernetes admission controllers page describes the two phases. Everything we build today sits in that validating step.
Time: 4 min
-->

---

# Kyverno is a webhook the API server calls

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-laptop class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Kubernetes control plane</div></div>
    <ul class="zone__list">
      <li><ph-cloud-check /><span>API server</span></li>
      <li><ph-gavel /><span>Admission phase</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--muted zone" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption">In the cluster</div></div>
    <ul class="zone__list">
      <li><ph-shield-check /><span>Kyverno, the admission controller</span></li>
      <li><ph-lock-key /><span>Policies it applies</span></li>
    </ul>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">Validating and mutating admission webhook callbacks</div>
  <p>Kyverno applies matching policies and returns results that enforce admission policies or reject requests.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.setup { display: grid; grid-template-columns: 1fr auto 1fr; align-items: stretch; gap: 1.25rem; }
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
Kyverno does not sit in front of the cluster. The API server calls it. Kyverno registers validating and mutating admission webhooks, and the API server sends it callbacks. Kyverno matches the request against its policies and returns a result. Depending on the policy, that result is an allow or a reject. This is from the Kyverno doc on how Kyverno works.
Time: 3 min
-->

---

# A ClusterPolicy is match, validate, reject

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-magnifying-glass class="plan__icon" />
    <p>Match: kind Pod</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-check-circle class="plan__icon" />
    <p>Validate: <code>resources.limits.cpu</code> and <code>resources.limits.memory</code> are set on every container</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-prohibit class="plan__icon" />
    <p>failureAction Enforce: reject with the policy message</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="4">
  <ph-lightning class="plan__foot-icon" />
  <p><strong>Our policy:</strong> <code>require-resource-limits</code></p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
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
Our one rule has three parts. Match: it applies to Pods. Validate: every container sets a CPU limit and a memory limit. And with the failure action set to Enforce, a Pod that fails is rejected with the policy's message. The policy is called require-resource-limits. We will not read the YAML, you will see it in the editor during the demo.
Time: 2.5 min
-->

---

# Two questions answered, four to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-door class="step-icon" /><div class="gpu-caption gpu-caption--accent">Q1</div><p>At the API server, before storage</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-eye class="step-icon" /><div class="gpu-caption gpu-caption--accent">Q2</div><p>The Pod spec, via a webhook</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-code class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Q3</div><p>How do I ship that rule as code?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-git-branch class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Q4</div><p>Can the pipeline stop it earlier?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-warning class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Q5</div><p>What does each layer miss?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-scales class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Q6</div><p>Which layer should catch this?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
Quick recap. Q1: at the API server, before anything is stored. Q2: admission sees the Pod spec, delivered through a webhook. Four to go.
Time: 1 min
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Q3: How do I ship that rule as code?</h1>
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
Next question.
Time: 0.5 min
-->

---

# Kyverno and its policy are Pulumi resources

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-package class="chain__icon" />
    <div class="gpu-caption">Helm chart</div>
    <span><code>kubernetes.helm.v4.Chart</code>, kyverno 3.9.1</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card chain__node" v-click="2">
    <ph-shield-check class="chain__icon" />
    <div class="gpu-caption">Kyverno running</div>
    <span>admission controller ready</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-gavel class="chain__icon" />
    <div class="gpu-caption">ClusterPolicy</div>
    <span><code>kubernetes.apiextensions.CustomResource</code></span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="4">
    <ph-prohibit class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Pod blocked</div>
    <span>request rejected</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="5">
  <p>One program, one pulumi up, one preview</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.chain { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.8rem; }
.chain__node { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; padding-block: 1.2rem; }
.chain__node span { font-size: 1.05rem; color: var(--p-fg); }
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
Both pieces live in a Pulumi program. The Helm chart installs Kyverno, version 3.9.1, pinned. The ClusterPolicy is a custom resource that Pulumi applies once Kyverno is running. One program, one pulumi up, and the rule goes through preview like anything else. Ordering matters here, and I will come back to it on the limits slide.
Time: 2.5 min
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The rule goes through preview like any other resource.</h1>
</div>

<!--
This is the practical gain of shipping the rule as code: it shows up in a preview, in a diff, in review, and in history. The guard is no longer a kubectl command somebody once ran.
Time: 1.5 min
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Q4: Can the pipeline stop it earlier?</h1>
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
Fourth question. Admission is late: the request already reached the cluster. Can we fail earlier?
Time: 0.5 min
-->

---

# Pulumi Policies checks resources before anything changes

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-terminal-window class="plan__icon" />
    <p><code>pulumi preview</code></p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-magnifying-glass class="plan__icon" />
    <p>The policy pack evaluates the declared resources</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-prohibit class="plan__icon" />
    <p>A mandatory violation stops the deployment</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-cloud-check class="plan__icon" />
    <p>The cluster never sees the Pod</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p>Policies are written in TypeScript, JavaScript, Python or OPA (Rego).</p>
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
Pulumi Policies evaluates policies against the resources a Pulumi program declares, during pulumi preview and pulumi up, before anything changes in your cloud provider. A violation of a mandatory policy stops the deployment. So the cluster never sees the Pod. Policies are written in TypeScript, JavaScript, Python, or OPA Rego. Source: the Pulumi Policies docs.
Time: 2.5 min
-->

---

# The enforcement level decides what a violation does

<div class="zoom-content">

<div class="modes">
  <div class="gpu-card mode" v-click>
    <div class="mode__head"><ph-warning class="mode__icon" /><code class="mode__name">advisory</code></div>
    <p>Reports a violation as a warning</p>
    <div class="mode__track"><i /><ph-warning /><i /><i /><i /></div>
  </div>
  <div class="gpu-card gpu-card--primary mode" v-click>
    <div class="mode__head"><ph-prohibit class="mode__icon" /><code class="mode__name">mandatory</code></div>
    <p>Blocks the deployment</p>
    <div class="mode__track"><i /><i /><ph-prohibit /><i /><i /></div>
    <div class="mode__note">The demo uses this one</div>
  </div>
  <div class="gpu-card mode" v-click>
    <div class="mode__head"><ph-wrench class="mode__icon" /><code class="mode__name">remediate</code></div>
    <p>Fixes the resource automatically</p>
    <div class="mode__track"><i /><i /><i /><ph-wrench /><i /></div>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">Visual track</div>
  <p>warn, block, fix</p>
</aside>

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
Three enforcement levels, from the docs. Advisory reports a violation as a warning. Mandatory blocks the deployment, and that is the one the demo uses. Remediate fixes the resource automatically. Start with advisory when you roll a rule out; move to mandatory when you trust it.
Time: 2 min
-->

---

# Four questions answered, two to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-door class="step-icon" /><div class="gpu-caption gpu-caption--accent">Q1</div><p>At the API server, before storage</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-eye class="step-icon" /><div class="gpu-caption gpu-caption--accent">Q2</div><p>The Pod spec, via a webhook</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-code class="step-icon" /><div class="gpu-caption gpu-caption--accent">Q3</div><p>Helm chart and ClusterPolicy as resources</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-git-branch class="step-icon" /><div class="gpu-caption gpu-caption--accent">Q4</div><p>Pulumi Policies at preview</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-warning class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Q5</div><p>What does each layer miss?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-scales class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Q6</div><p>Which layer should catch this?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
Four answered. The last two are the interesting ones.
Time: 1 min
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Q5: What does each layer miss?</h1>
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
Both layers sound complete. They are not.
Time: 0.5 min
-->

---

# Each layer sees a different moment

<div class="zoom-content">

<div class="bounds">
  <div class="bound" v-click><ph-terminal-window /><div class="bound__want">a manifest applied with kubectl</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Kyverno, at admission</div></div>
  <div class="bound" v-click><ph-git-branch /><div class="bound__want">a resource declared in a Pulumi program</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Pulumi Policies, at preview and up</div></div>
  <div class="bound" v-click><ph-cube /><div class="bound__want">a resource created outside Pulumi</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Only admission sees it</div></div>
  <div class="bound" v-click><ph-warning /><div class="bound__want">a program nobody runs through the policy pack</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Only admission sees it</div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.bounds { display: grid; grid-template-columns: 1fr; gap: 0.8rem 1.4rem; }
.bound { display: grid; grid-template-columns: auto 22rem auto 1fr; align-items: center; gap: 0.7rem; padding: 0.8rem 1rem; border: 1.5px solid var(--p-border); border-radius: 14px; background: var(--p-bg-elevated); }
.bound > svg:first-child { font-size: 1.5rem; color: var(--p-primary); }
.bound__want { font-family: var(--slidev-font-mono); font-size: 0.92rem; font-weight: 600; color: var(--p-fg-muted); }
.bound__arrow { font-size: 1.1rem; color: var(--p-accent); }
.bound__by { font-size: 1.05rem; line-height: 1.3; color: var(--p-fg); }
</style>

<!--
Four cases. A manifest applied with kubectl is guarded by Kyverno at admission. A resource declared in a Pulumi program is guarded by Pulumi Policies at preview and up. Now the gaps. A resource created outside Pulumi never passes through the policy pack, so only admission sees it. The same goes for a Pulumi program that nobody runs with the policy pack. These last two follow from the docs: policies evaluate the resources a Pulumi program declares. Pulumi Policies cannot see what is never declared in a program it checks.
Time: 4 min
-->

---

# Five questions answered, one to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-door class="step-icon" /><div class="gpu-caption gpu-caption--accent">Q1</div><p>At the API server, before storage</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-eye class="step-icon" /><div class="gpu-caption gpu-caption--accent">Q2</div><p>The Pod spec, via a webhook</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-code class="step-icon" /><div class="gpu-caption gpu-caption--accent">Q3</div><p>Helm chart and ClusterPolicy as resources</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-git-branch class="step-icon" /><div class="gpu-caption gpu-caption--accent">Q4</div><p>Pulumi Policies at preview</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-warning class="step-icon" /><div class="gpu-caption gpu-caption--accent">Q5</div><p>Admission misses the pipeline view, the pipeline misses live applies</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-scales class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Q6</div><p>The demo answers it</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
Five of six. The demo answers the last one by running both guards on the same Pod.
Time: 1 min
-->

---

# Where this breaks today

<div class="zoom-content">

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-shield-warning class="step-icon" /><div class="gpu-caption gpu-caption--muted">Rules</div><p>One rule: resource limits only</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--muted">Scope</div><p>Pod only: the rule matches kind Pod, the policy pack validates <code>kubernetes:core/v1:Pod</code>, not Deployments</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-laptop class="step-icon" /><div class="gpu-caption gpu-caption--muted">Cluster</div><p>Local kind cluster, single node, not a production setup</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-clock class="step-icon" /><div class="gpu-caption gpu-caption--muted">Order</div><p>Kyverno must be Ready before the ClusterPolicy applies; the demo waits with <code>wait-for-kyverno.sh</code></p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
Plain limits of this demo. One rule only: resource limits. The brief also mentions privileged containers; the demo code does not enforce that. Pod only: the Kyverno rule matches kind Pod, and the policy pack validates core v1 Pod, not Deployments. A local kind cluster, one node, not a production setup. And ordering: Kyverno has to be Ready before the ClusterPolicy applies, so the demo waits with a small script. Stating these buys more trust than any adjective.
Time: 4 min
-->

---

# Two guards, one program model, one local cluster

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-laptop class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Pulumi pipeline</div></div>
    <ul class="zone__list">
      <li><ph-folder-open /><span>Pulumi program</span></li>
      <li><ph-gavel /><span>Policy pack</span></li>
      <li><ph-terminal-window /><span><code>pulumi preview</code></span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--muted zone" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption">kind cluster policy-demo</div></div>
    <ul class="zone__list">
      <li><ph-cloud-check /><span>API server</span></li>
      <li><ph-shield-check /><span>Kyverno</span></li>
      <li><ph-lock-key /><span>ClusterPolicy <code>require-resource-limits</code></span></li>
    </ul>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">pulumi up</div>
  <p><code>kubectl apply</code> by hand hits the cluster door; the Pulumi program hits the policy pack first.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.setup { display: grid; grid-template-columns: 1fr auto 1fr; align-items: stretch; gap: 1.25rem; }
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
This is what we end up with. On the left, the Pulumi pipeline: the program, the policy pack, pulumi preview. On the right, a local kind cluster called policy-demo with the API server, Kyverno, and the require-resource-limits policy. pulumi up connects them. A kubectl apply by hand hits the cluster door; the Pulumi program hits the policy pack first.
Time: 3 min
-->

---

# The whole install is about ten lines of Pulumi

<div class="zoom-content">

<div class="big-code">
```ts
const kyverno = new k8s.helm.v4.Chart("kyverno", {
  chart: "kyverno", version: "3.9.1",
  repositoryOpts: { repo: "https://kyverno.github.io/kyverno/" },
});
new k8s.apiextensions.CustomResource("require-resource-limits", {
  apiVersion: "kyverno.io/v1", kind: "ClusterPolicy",
  spec: { /* validate limits.cpu + limits.memory, Enforce */ },
});
```
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
</style>

<!--
This is abridged from the demo's 02-kyverno and 03-cluster-policy programs. The chart, pinned. The ClusterPolicy as a custom resource, with the rule body elided. It is the only program code in the deck. In the demo you will see the real files in the editor.
Time: 2 min
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Kyverno and Pulumi Policies.</h1>
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
Divider. From here on we run things.
Time: 0.5 min
-->

---

# What we are going to do

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-cube class="step__icon" /><p>A local cluster is ready</p></div>
  <div class="gpu-card step" v-click><ph-shield-check class="step__icon" /><p>Kyverno runs, installed by Pulumi</p></div>
  <div class="gpu-card step" v-click><ph-gavel class="step__icon" /><p>The ClusterPolicy is Ready</p></div>
  <div class="gpu-card step" v-click><ph-prohibit class="step__icon" /><p><code>kubectl apply</code> is rejected</p></div>
  <div class="gpu-card step" v-click><ph-eye class="step__icon" /><p><code>pulumi preview</code> is blocked</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-trash class="step__icon" /><p>Nothing is left running</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.steps { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.2rem; }
.step { display: flex; flex-direction: column; gap: 0.7rem; padding: 1.2rem 1.3rem; }
.step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.step__icon { font-size: 2rem; color: var(--p-primary); }
.steps { grid-template-columns: repeat(3, 1fr); }
</style>

<!--
Six outcomes. A cluster that is ready. Kyverno running, installed by Pulumi. The policy Ready. A kubectl apply that is rejected. A pulumi preview that is blocked. And a teardown that leaves nothing running. Outcomes, not commands: the commands are on the step slides.
Time: 2 min
-->

---

# A local cluster is ready before anyone arrives

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />01-cluster</div>
    <div class="big-code code-sm">
```bash
01-cluster/create-cluster.sh
```
</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-cube /><span>kind cluster <code>policy-demo</code></span></li>
    <li><ph-check-circle /><span><code>kubectl get nodes</code> shows Ready</span></li>
    <li><ph-clock /><span>Run before the session, with <code>01-cluster/preflight.sh</code></span></li>
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
The presenter ran create-cluster.sh, and preflight.sh, before the session so nobody waits for images. We show that the node is Ready and move on.
Time: 3 min
-->

---

# Kyverno comes up as a Pulumi-managed chart

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />02-kyverno</div>
    <div class="big-code code-sm">
```bash
pulumi up
kubectl --context kind-policy-demo get pods -n kyverno
```
</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-package /><span>The Helm chart is a Pulumi resource</span></li>
    <li><ph-check-circle /><span>Kyverno pods Running and ready</span></li>
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
Run pulumi up in the 02-kyverno folder. Pulumi installs the chart. Then check the pods in the kyverno namespace. We want them Running and ready before the next step.
Time: 5 min
-->

---

# The rule is Ready in enforce mode

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />03-cluster-policy</div>
    <div class="big-code code-sm">
```bash
./wait-for-kyverno.sh
pulumi up
kubectl --context kind-policy-demo get clusterpolicy
```
</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-clock /><span>Wait until Kyverno is Ready</span></li>
    <li><ph-gavel /><span><code>require-resource-limits</code></span></li>
    <li><ph-check-circle /><span>READY shows True</span></li>
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
In 03-cluster-policy, wait for Kyverno, apply the policy with pulumi up, then list the cluster policies. require-resource-limits should show READY True. This is the ordering point from the limits slide.
Time: 5 min
-->

---

# The cluster refuses a Pod with no limits

<div class="zoom-content">

<div class="s5__cmd big-code code-sm">
```bash
04-admission-denied/try-apply.sh
```
</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-terminal-window /><span><code>kubectl apply</code> sends the Pod</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-gavel /><span>Kyverno checks it at admission</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-prohibit /><span>The request is rejected</span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Read the output</div><p>The error names <code>require-resource-limits</code> with the message: "Every container must set resources.limits.cpu and resources.limits.memory." The script prints "rejected as expected". It always exits 0, so read the output.</p></aside>
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
Run try-apply.sh in 04-admission-denied. It applies unsafe-pod.yaml. Expect a Kyverno admission error that names require-resource-limits, and the message about limits. The script prints rejected as expected. Careful: the script always exits zero, so read the output, not the exit code.
Time: 4 min
-->

---

# The pipeline blocks the same Pod before the cluster sees it

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">
```bash
pulumi preview --policy-pack ../policy-pack
```
</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-gavel /><div><div class="gpu-caption gpu-caption--accent">Violation</div><span><code>containers-must-set-resource-limits</code> (mandatory) for Container "app" in Pod "unsafe-workload"</span></div></div>
  <div class="gpu-card check" v-click><ph-prohibit /><div><div class="gpu-caption gpu-caption--accent">Preview stops</div><span>No update is applied</span></div></div>
  <div class="gpu-card check" v-click><ph-cloud-check /><div><div class="gpu-caption gpu-caption--accent">Cluster untouched</div><span>Nothing created in the cluster</span></div></div>
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
Run this in 05-pipeline-policy/workload. The policy pack is written to report a mandatory violation of containers-must-set-resource-limits for the container app in the Pod unsafe-workload, and the preview stops. Nothing is created in the cluster. Check the real output on screen against these three cards.
Time: 6 min
-->

---

# Same rule, two moments of failure

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Admission (Kyverno)</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Fails at <code>kubectl apply</code></li>
      <li>The request reaches the API server and is refused</li>
      <li>Sees any client</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Pipeline (Pulumi Policies)</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Fails at <code>pulumi preview</code></li>
      <li>Nothing reaches the cluster</li>
      <li>Sees only Pulumi programs</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
This answers Q6. Same rule, two moments. Admission fails at kubectl apply: the request reached the API server and was refused, and it sees any client. The pipeline fails at preview: nothing reaches the cluster, but it sees only Pulumi programs. Keep both. The pipeline gives fast feedback, admission is the backstop.
Time: 3 min
-->

---

# Six questions, six answers

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-door class="step-icon" /><div class="gpu-caption gpu-caption--accent">Q1</div><p>At the API server, before storage</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-eye class="step-icon" /><div class="gpu-caption gpu-caption--accent">Q2</div><p>The Pod spec, via a webhook</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-code class="step-icon" /><div class="gpu-caption gpu-caption--accent">Q3</div><p>Helm chart and ClusterPolicy as resources</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-git-branch class="step-icon" /><div class="gpu-caption gpu-caption--accent">Q4</div><p>Pulumi Policies at preview</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-warning class="step-icon" /><div class="gpu-caption gpu-caption--accent">Q5</div><p>Admission misses the pipeline view, the pipeline misses live applies</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-scales class="step-icon" /><div class="gpu-caption gpu-caption--accent">Q6</div><p>Both: pipeline for early feedback, admission for the backstop</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
All six answered. If you remember one line: the pipeline gives early feedback, admission is the backstop.
Time: 2 min
-->

---

# Teardown leaves nothing running

<div class="zoom-content">

<div class="s5__cmd big-code code-sm">
```bash
./teardown.sh
```
</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-terminal-window /><span><code>docker ps</code> shows no <code>policy-demo-control-plane</code></span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step s5__step--stop" v-click="2"><ph-check-circle /><span><code>kubectl config get-contexts</code> no longer lists <code>kind-policy-demo</code></span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="3"><div class="info-card__label">Check</div><p>The cluster and its kubectl context are both gone.</p></aside>
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
Run teardown.sh from the workshop folder. Then check that docker ps shows no policy-demo control plane and that kubectl no longer lists the kind-policy-demo context.
Time: 2 min
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-4 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/defense-in-depth-kyverno-pulumi-policies" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → defense-in-depth-kyverno-pulumi-policies</div>
  </div>
  <div class="res-card">
    <QRCode data="https://kyverno.io/docs/" dark="#000000" />
    <div class="res-card__title">Kyverno documentation</div>
    <div class="res-card__body">kyverno.io/docs</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/insights/policy/" dark="#000000" />
    <div class="res-card__title">Pulumi Policies documentation</div>
    <div class="res-card__body">pulumi.com/docs/insights/policy</div>
  </div>
  <div class="res-card">
    <QRCode data="https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/" dark="#000000" />
    <div class="res-card__title">Kubernetes admission controllers</div>
    <div class="res-card__body">kubernetes.io admission controllers</div>
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
Resources: the workshop repo comes first, then the docs links. Give people a moment to scan the QR codes.
Time: 1 min
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
Where to go next. One sentence, then questions.
Time: 0.5 min
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/defense-in-depth-kyverno-pulumi-policies" dark="#000000" /></div>
      <div class="thanks__qr-label">defense-in-depth-kyverno-pulumi-policies</div>
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
Thank the room and take questions. This is the buffer in the budget.
Time: 5 min
-->
