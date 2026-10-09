---
theme: "@pulumi/slidev-theme"
title: "Monitoring as code on Google Cloud"
info: |
  Monitoring as code on Google Cloud: An SLO and burn-rate alert component with a dashboard and a policy guardrail.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/gcp-monitoring-alert-policy
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
    Monitoring as code on Google Cloud
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    An SLO and burn-rate alert component with a dashboard and a policy guardrail
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
[0.5 min] Title. Say who we are and what we build today.
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
[1 min] Speakers. Introduce yourselves in one breath each.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
[0.25 min] Section break into housekeeping and agenda.
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
[0.5 min] Chat tab, questions in the Q and A tab, the repo is linked at the end.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>The alert nobody wrote</li>
  <li>SLOs and burn rates</li>
  <li>Components, tests and policies</li>
  <li>Credentials with Pulumi ESC</li>
  <li>The demo</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
[1 min] Walk the agenda in order. Five sections, then questions.
-->

---

# Customers lost the signal along with the service

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">Google Cloud's own incident report</div>
    <p>"For some customers, the monitoring infrastructure they had running on Google Cloud was also failing, leaving them without a signal of the incident or an understanding of the impact to their business and/or infrastructure."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>A Google Cloud outage on 12 June 2025</li>
      <li>The report names invalid or corrupt data in an API management platform</li>
      <li>Google's follow-up: keep monitoring running even when its primary monitoring products are down</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span><strong>Source:</strong> status.cloud.google.com, incident ow5i3PPK96RduMcb1SsW</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
[1.5 min] Open on the sentence in the report. Customers whose monitoring ran on Google Cloud had no signal during the outage. Do not claim the report says more: the cause it names is invalid or corrupt data in an API management platform, and the follow-up says Google will keep its monitoring and communication running. Our point is narrower: monitoring is infrastructure somebody has to define on purpose. Source: the incident report at status.cloud.google.com/incidents/ow5i3PPK96RduMcb1SsW.
-->
---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Every service needs an alert.</h1>
</div>

<!--
[0.5 min] First half of the tension. Pause after it.
-->
---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Nobody remembers to write it.</h1>
</div>

<!--
[0.25 min] Second half. Teams ship services on a Friday and the alert is a ticket for next sprint. That is the gap this workshop closes.
-->
---

# Alerts by hand drift. Alerts from code get reviewed.

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">By hand</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Click through the console for each service</li>
      <li>Copy alert JSON from the last project</li>
      <li>Nothing checks that an alert exists</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">As code</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>One component per service</li>
      <li>Changes arrive as a diff and a preview</li>
      <li>A test and a policy fail when the alert is missing</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1.5 min] Do not argue that the console is bad. The problem is that nothing makes the alert exist. Code gives us a place to put a check. This is the contrast the rest of the talk builds on.
-->
---

# Six questions decide whether you can trust monitoring as code

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-check-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">1 · Goal</div><p>How do I say "this service should be up 99%" in code?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-warning class="step-icon" /><div class="gpu-caption gpu-caption--accent">2 · Page</div><p>When should it page me?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-eye class="step-icon" /><div class="gpu-caption gpu-caption--accent">3 · See</div><p>How do I see it?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-puzzle-piece class="step-icon" /><div class="gpu-caption gpu-caption--accent">4 · Reuse</div><p>How do teams reuse this?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">5 · Keys</div><p>How do I run this without service account keys?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-shield-check class="step-icon" /><div class="gpu-caption gpu-caption--accent">6 · Proof</div><p>How do I prove no service ships without an alert?</p></div>
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
[1.5 min] Read the six questions out loud. Each one gets a section, in this order. The last one is the one the demo answers.
-->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How do I say 99% in code?</h1>
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

# 99% becomes a resource, not a sentence in a wiki

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-cloud class="plan__icon" />
    <div class="gpu-caption">Cloud Run</div>
    <p>The service we watch</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-list-numbers class="plan__icon" />
    <div class="gpu-caption">Custom service</div>
    <p>The monitoring view of it</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-scales class="plan__icon" />
    <div class="gpu-caption">SLO</div>
    <p>Request-based, goal 0.99</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="4">
  <ph-lightning class="plan__foot-icon" />
  <p>The demo creates the custom service and the SLO with Pulumi IaC, in the same program as the service.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.7rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.15rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
[1 min] The demo uses a request-based SLO with a goal of 0.99. Say what an SLO is in one sentence: a goal for how many requests succeed. Whether the exact SLI shape is accepted by Google Cloud is not proven yet; step 3 of the demo is where we find out live.
-->
---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">A burn rate above 1 means you will miss the SLO.</h1>
</div>

<!--
[1 min] Google's burn-rate page says a burn rate greater than one means that, if the measured error rate is sustained over a future compliance period, the service will be out of SLO. That one number is what we alert on.
-->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">When should it page me?</h1>
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

# Two alerts: one for fast burns, one for slow ones

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Fast burn</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Short lookback, threshold far above baseline</li>
      <li>Google's starting point: 10x over 1 or 2 hours</li>
      <li>Demo: 10x over 1 hour</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Slow burn</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Longer lookback to smooth out variation</li>
      <li>Threshold above ideal, but not far above</li>
      <li>Demo: 2x over 6 hours</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1.5 min] Both numbers in the demo come from the component's defaults: fast 3600 seconds at 10, slow 21600 seconds at 2. Google's guidance on fast burn: a good starting point is 10x the baseline with a one or two hour lookback. Slow burn: longer lookback, threshold higher than ideal but not much. The 6-hour and 2x values are our choice, not a quote from the page.
-->
---

# The page comes from the SLO's burn rate, not from a CPU graph

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-scales class="plan__icon" />
    <div class="gpu-caption">SLO</div>
    <p>Goal 0.99</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-sliders-horizontal class="plan__icon" />
    <div class="gpu-caption">Burn-rate filter</div>
    <p>select_slo_burn_rate</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-warning class="plan__icon" />
    <div class="gpu-caption">Alert policy</div>
    <p>Fast and slow</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-paper-plane-tilt class="plan__icon" />
    <div class="gpu-caption">Notification</div>
    <p>Email channel and runbook link</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p>Both policies carry the email channel and a runbook link.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.7rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.15rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
[1 min] select_slo_burn_rate is the time-series selector Google documents for the burn-rate metric. The exact filter string we generate has not been run against Google Cloud yet. Say so if asked.
-->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How do I see it?</h1>
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

# Errors and a dashboard come from the same program

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-scroll class="plan__icon" />
    <div class="gpu-caption">Application errors</div>
    <p>In the service logs</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-code class="plan__icon" />
    <div class="gpu-caption">Log-based metric</div>
    <p>Counts them</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-desktop class="plan__icon" />
    <div class="gpu-caption">Dashboard</div>
    <p>Defined as code</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="4">
  <ph-lightning class="plan__foot-icon" />
  <p>The dashboard is created in step 5, after the alerts.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.7rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.15rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
[1 min] Short slide. The log-based metric counts application errors; the dashboard is a Pulumi resource too. Nobody builds charts by hand.
-->
---

# Three questions covered, three to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-check-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Goal</div><p>A custom service and a 99% SLO</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-check-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Page</div><p>Fast and slow burn-rate policies</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-check-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">See</div><p>Log metric and dashboard</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-puzzle-piece class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Reuse</div><p>How do teams reuse this?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-key class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Keys</div><p>How do I run this without keys?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-check class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>What stops a service with no alert?</p></div>
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
[1 min] Bring the questions back. Three answered, three open.
-->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How do teams reuse this?</h1>
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
[0.5 min] Question four.
-->
---

# One component holds the whole monitoring set

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-list-numbers class="step-icon" /><div class="gpu-caption gpu-caption--accent">Custom service</div><p>The service's monitoring view</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-scales class="step-icon" /><div class="gpu-caption gpu-caption--accent">SLO</div><p>Goal passed in</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-warning class="step-icon" /><div class="gpu-caption gpu-caption--accent">Fast burn</div><p>Policy, 1 hour</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-clock class="step-icon" /><div class="gpu-caption gpu-caption--accent">Slow burn</div><p>Policy, 6 hours</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-paper-plane-tilt class="step-icon" /><div class="gpu-caption gpu-caption--accent">Channel and runbook</div><p>Email, link on every policy</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-desktop class="step-icon" /><div class="gpu-caption gpu-caption--accent">Metric and dashboard</div><p>Errors and one view</p></div>
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
[1.5 min] Pulumi's docs define a component as a logical grouping of resources exposed as a single resource. Our ServiceMonitoring component takes the service name, the goal, an email and a runbook URL. Step 6 shows the call: five arguments in the service's program.
-->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How do I run this without keys?</h1>
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

# Pulumi ESC logs in to Google Cloud through OpenID Connect

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-vault class="plan__icon" />
    <div class="gpu-caption">Pulumi ESC</div>
    <p>Environment with gcp-login</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-link class="plan__icon" />
    <div class="gpu-caption">OpenID Connect</div>
    <p>Workload identity pool and service account</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-key class="plan__icon" />
    <div class="gpu-caption">Environment variables</div>
    <p>Project and access token</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-rocket-launch class="plan__icon" />
    <div class="gpu-caption">Pulumi IaC</div>
    <p>pulumi up uses them</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p>No service account key file on the laptop or in the repo.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.7rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.15rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
[1.5 min] From the ESC gcp-login docs: the provider logs in to Google Cloud using OpenID Connect or static credentials, and returns credentials the Pulumi Google Cloud provider reads from environment variables. We use the OIDC route. The pulumi env setup gcp command that creates the trust is marked experimental and was not run.
-->
---

# Five questions covered, one to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-check-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Goal</div><p>A custom service and a 99% SLO</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-check-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Page</div><p>Fast and slow burn-rate policies</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-check-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">See</div><p>Log metric and dashboard</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-check-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Reuse</div><p>One component per service</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-check-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Keys</div><p>Pulumi ESC and OpenID Connect</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-check class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>What stops a service with no alert?</p></div>
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
[1 min] One left, and it is the one the demo ends on.
-->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How do I prove no service ships without an alert?</h1>
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
[0.5 min] Question six.
-->
---

# A test checks the component. A policy checks the stack.

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Unit test</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Runs the component against mocks</li>
      <li>npm test passes for the component</li>
      <li>npm run test:plain fails by design</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Pulumi policy</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Stack validation sees every resource in the stack</li>
      <li>A mandatory policy blocks the update</li>
      <li>Runs with the preview</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1.5 min] The unit test proves our component creates the alert. The policy proves nobody bypassed the component. From the policy docs: validateStack gives the callback access to all resources in the stack, and a mandatory policy blocks an update from proceeding. Policies run during pulumi preview and pulumi up.
-->
---

# A stack with a service and no alert policy is rejected at preview

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-cloud class="plan__icon" />
    <div class="gpu-caption">Stack</div>
    <p>A custom service, no alert policy</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-gavel class="plan__icon" />
    <div class="gpu-caption">Policy pack</div>
    <p>Stack validation rule</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-prohibit class="plan__icon" />
    <div class="gpu-caption">Blocked</div>
    <p>Mandatory violation</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="4">
  <ph-lightning class="plan__foot-icon" />
  <p>Local policy pack, passed with --policy-pack. No Pulumi Cloud policy group needed.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.7rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.15rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
[1.5 min] The pack lives in 05-policy and is run locally with --policy-pack. Its own tests run with npm test.
-->
---

# Nothing here has run on real Google Cloud yet

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">What the checks covered</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Unit tests for the component, on mocks</li>
      <li>Policy pack tests</li>
      <li>The scripts through shellcheck</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">What is still unproven</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>The nested SLI shape and the Cloud Run filter</li>
      <li>The burn-rate filter string and the zero-second duration</li>
      <li>adoptInline replacing nothing</li>
      <li>Also: these alerts live in Cloud Monitoring, the same dependency as in the opening</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
</style>

<!--
[1.5 min] Be plain about it. The demo folder was checked offline. The first live preview and up are where the SLI shape, the filter and adoptInline get tested. Also say the quiet part: our alerts live in Cloud Monitoring on Google Cloud, so the opening story applies to us too. Pulumi gives you review and tests, not independence.
-->
---

# Neo can draft the change. Tests and policy still gate it.

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Pulumi Neo</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Reads your organization's state in Pulumi Cloud</li>
      <li>Can open a pull request against your IaC code</li>
      <li>Works with policy guardrails and approvals</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Your gates</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>The component's unit tests</li>
      <li>The policy pack at preview</li>
      <li>A human review of the pull request</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1.5 min] One slide, no demo. From the Neo docs: Neo reads your organization's live state in Pulumi Cloud and can open a pull request against your IaC code, with policy guardrails and human approvals. We did not run Neo for this workshop.
-->
---

# Every service gets its monitoring from the same component

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-laptop class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Pulumi, on your machine</div></div>
    <ul class="zone__list">
      <li><ph-package /><span>ServiceMonitoring component</span></li>
      <li><ph-check-circle /><span>Unit tests on mocks</span></li>
      <li><ph-gavel /><span>Policy pack at preview</span></li>
      <li><ph-vault /><span>Pulumi ESC login</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--muted zone" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption">Google Cloud</div></div>
    <ul class="zone__list">
      <li><ph-cloud /><span>Cloud Run service</span></li>
      <li><ph-scales /><span>Custom service and SLO</span></li>
      <li><ph-warning /><span>Fast and slow burn alerts</span></li>
      <li><ph-desktop /><span>Log metric and dashboard</span></li>
    </ul>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">What the demo ends with</div>
  <p>A service whose stack has no alert policy does not pass the preview.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.setup { display: grid; grid-template-columns: 1fr auto 1fr; align-items: stretch; gap: 1.25rem; }
.zone__head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.1rem; }
.zone__icon { font-size: 1.6rem; color: var(--p-primary); }
.zone__list { list-style: none; padding: 0; margin: 0; }
.zone__list li { display: flex; align-items: center; gap: 0.8rem; margin: 0 0 0.85rem; }
.zone__list li:last-child { margin-bottom: 0; }
.zone__list li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
.setup__link { display: flex; align-items: center; font-size: 2.2rem; color: var(--p-accent); }
</style>

<!--
[2 min] This is the picture the demo builds, piece by piece. Left side is code and checks, right side is what exists in the project.
-->


---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Monitoring as code on Google Cloud.</h1>
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
[0.25 min] Divider. The rest of the time is the demo.
-->

---

# What we are going to do

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card  step" v-click><ph-vault class="step__icon" /><p>Pulumi ESC logs in without a key</p></div>
  <div class="gpu-card  step" v-click><ph-cloud class="step__icon" /><p>A Cloud Run service to watch</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-scales class="step__icon" /><p>An SLO, then alert policies, then metric and dashboard</p></div>
  <div class="gpu-card  step" v-click><ph-package class="step__icon" /><p>The same monitoring as a component</p></div>
  <div class="gpu-card  step" v-click><ph-check-circle class="step__icon" /><p>Unit tests pass, and one fails on purpose</p></div>
  <div class="gpu-card gpu-card--accent step" v-click><ph-gavel class="step__icon" /><p>The policy pack blocks a stack with no alert</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-warning class="step__icon" /><p>We break the service and watch the alert</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.05; }
.steps { margin-top: 0.6rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.2rem; }
.step { display: flex; flex-direction: column; gap: 0.7rem; padding: 1.2rem 1.3rem; }
.step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.step__icon { font-size: 2rem; color: var(--p-primary); }
</style>

<!--
[1 min] Seven outcomes. Setup, the ESC environment and the APIs are done before we start. The commands in each step are the ones in the README, run from the folder named on the slide. Nothing here has run on a real project yet, so we will see the first live results together.
-->
---

# 1 · One environment holds the login, no key file

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-vault />01-esc</div>
    <div class="big-code code-sm">

```bash
PULUMI_ORG=<org> 01-esc/create-env.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-vault /><span>Environment with gcp-login</span></li>
    <li><ph-link /><span>OpenID Connect trust</span></li>
    <li><ph-eye-slash /><span>No key file on disk</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.6; }
.s1 { display: grid; grid-template-columns: 1.15fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[4 min] Show 01-esc/gcp-oidc.yaml in the editor. Point at the pool, provider and service account. The pulumi env setup gcp command that creates the trust is experimental and has not been run.
-->
---

# 2 · The service answers 200, and 500 on request

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-cloud />02-service</div>
    <div class="big-code code-sm">

```bash
pulumi up
curl "$(pulumi stack output url)?x-set-response-status-code=500"
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-check-circle /><span>A Cloud Run service comes up</span></li>
    <li><ph-warning /><span>The query switch returns a 500</span></li>
    <li><ph-clock /><span>Request metrics lag by a couple of minutes</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.6; }
.s1 { display: grid; grid-template-columns: 1.15fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[6 min] Run pulumi up in 02-service, then the 500 request. Whether the echo image honours the status code switch on Cloud Run is unproven until now. If it does not, say so and move on.
-->
---

# 3 · The goal becomes an SLO resource

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-scales />03-inline</div>
    <div class="big-code code-sm">

```bash
pulumi config set stage slo && pulumi up
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-list-numbers /><span>One custom service</span></li>
    <li><ph-scales /><span>One request-based SLO</span></li>
    <li><ph-magnifying-glass /><span>Check it in the console</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.6; }
.s1 { display: grid; grid-template-columns: 1.15fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[6 min] The stage config adds pieces in order, so the audience sees each one land. First live test of the SLI shape. If Google rejects it, read the error together and fix it in the editor.
-->
---

# 4 · Two alert policies watch the burn rate

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-warning />03-inline</div>
    <div class="big-code code-sm">

```bash
pulumi config set stage alerts && pulumi up
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-clock /><span>Fast burn, 1 hour</span></li>
    <li><ph-clock-clockwise /><span>Slow burn, 6 hours</span></li>
    <li><ph-paper-plane-tilt /><span>Email channel on both</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.6; }
.s1 { display: grid; grid-template-columns: 1.15fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[6 min] Open both policies in the console and read the condition. First live test of the burn-rate filter string.
-->
---

# 5 · A log metric and a dashboard finish the set

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />03-inline</div>
    <div class="big-code code-sm">

```bash
pulumi config set stage full && pulumi up
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-code /><span>Log-based metric for errors</span></li>
    <li><ph-desktop /><span>One dashboard</span></li>
    <li><ph-check /><span>Everything from one program</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.6; }
.s1 { display: grid; grid-template-columns: 1.15fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[5 min] Open the dashboard. Do not wait for data; metrics lag. We come back to it in step 9.
-->
---

# 6 · The same monitoring becomes one component

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-package />04-component</div>
    <div class="big-code code-sm">

```bash
pulumi preview
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-package /><span>One resource holds the set</span></li>
    <li><ph-arrows-clockwise /><span>Adopting the inline stack needs one config switch</span></li>
    <li><ph-eye /><span>The preview shows what changes</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.6; }
.s1 { display: grid; grid-template-columns: 1.15fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[7 min] If the stack came from 03-inline, first run pulumi config set adoptInline true. Whether adoption updates state without replacing anything is unproven; read the preview carefully before any up.
-->
---

# 7 · The test passes, and a second test fails on purpose

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
npm test
npm run test:plain
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-check-circle /><div><div class="gpu-caption gpu-caption--accent">1 · Passes</div><code>Alert policy per custom service</code></div></div>
  <div class="gpu-card check" v-click><ph-check-circle /><div><div class="gpu-caption gpu-caption--accent">2 · Passes</div><code>One service, two burn policies</code></div></div>
  <div class="gpu-card check" v-click><ph-check-circle /><div><div class="gpu-caption gpu-caption--accent">3 · Passes</div><code>Channel and runbook on both</code></div></div>
  <div class="gpu-card check" v-click><ph-check-circle /><div><div class="gpu-caption gpu-caption--accent">4 · Passes</div><code>Log metric and dashboard</code></div></div>
  <div class="gpu-card check" v-click><ph-prohibit /><div><div class="gpu-caption gpu-caption--accent">5 · Fails on purpose</div><code>test:plain, no alert policy</code></div></div>
  <div class="gpu-card check" v-click><ph-code /><div><div class="gpu-caption gpu-caption--accent">6 · Offline</div><code>Mocks, no cloud calls</code></div></div>
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
</style>

<!--
[6 min] The first command passes with four tests. The second creates a custom service without an alert policy and fails. That failure is what we want. It only shows the component does it right; it cannot stop someone skipping the component.
-->
---

# 8 · The policy pack blocks the stack the test could not

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-gavel />05-policy</div>
    <div class="big-code code-sm">

```bash
pulumi preview --policy-pack ../05-policy
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-prohibit /><span>03-inline at stage slo: blocked</span></li>
    <li><ph-check-circle /><span>04-component: passes</span></li>
    <li><ph-gavel /><span>Stack validation, mandatory</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.6; }
.s1 { display: grid; grid-template-columns: 1.15fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[7 min] Run the same command twice: first in 03-inline with stage slo, which has no alert policy yet and is blocked; then in 04-component, which passes. Run npm test in 05-policy first if time allows.
-->
---

# 9 · We break the service and the alert opens

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-terminal-window />repo root</div>
    <div class="big-code code-sm">

```bash
06-break/send-requests.sh <url> fail 200
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-clock /><span>Start it 15 minutes before this slide</span></li>
    <li><ph-warning /><span>The incident appears in the console</span></li>
    <li><ph-desktop /><span>The dashboard shows the errors</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.6; }
.s1 { display: grid; grid-template-columns: 1.15fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[6 min] Started at least 15 minutes ago. Show the open incident and the dashboard. If nothing fired, say so; the burn-rate filter is unproven and this is where it would show. Then tear down: PULUMI_ORG=<org> GCP_PROJECT_ID=<id> 07-teardown/teardown.sh 04-component dev. Monitoring and Cloud Run cost money.
-->


---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/gcp-monitoring-alert-policy" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → gcp-monitoring-alert-policy</div>
  </div>
  <div class="res-card">
    <QRCode data="https://docs.cloud.google.com/stackdriver/docs/solutions/slo-monitoring/alerting-on-budget-burn-rate" dark="#000000" />
    <div class="res-card__title">Alerting on your burn rate (Google Cloud)</div>
    <div class="res-card__body">cloud.google.com burn-rate alerting</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/registry/packages/gcp/api-docs/monitoring/slo/" dark="#000000" />
    <div class="res-card__title">gcp.monitoring.Slo (Pulumi Registry)</div>
    <div class="res-card__body">pulumi.com/registry gcp Slo</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/insights/policy/policy-packs/authoring/" dark="#000000" />
    <div class="res-card__title">Authoring policy packs</div>
    <div class="res-card__body">pulumi.com/docs policy packs</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/esc/providers/login/gcp-login/" dark="#000000" />
    <div class="res-card__title">Pulumi ESC gcp-login provider</div>
    <div class="res-card__body">pulumi.com/docs gcp-login</div>
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
[0.5 min] Scan the repo QR code first. The other links are for later.
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
[0.25 min] Community Slack, Pulumi Cloud sign-up, next workshops.
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/gcp-monitoring-alert-policy" dark="#000000" /></div>
      <div class="thanks__qr-label">gcp-monitoring-alert-policy</div>
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
[5 min] Questions.
-->
