---
theme: "@pulumi/slidev-theme"
title: "Observability as Code: OpenTelemetry, Prometheus and Grafana on Kubernetes with Pulumi"
info: |
  Observability as Code: OpenTelemetry, Prometheus and Grafana on Kubernetes with Pulumi: Build a self-hosted observability stack where the dashboard and the alert are reviewed code.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/observability-as-code-otel-prometheus-grafana
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
    Observability as Code: OpenTelemetry, Prometheus and Grafana on Kubernetes with Pulumi
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Build a self-hosted observability stack where the dashboard and the alert are reviewed code
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
[1 min] Welcome. Title, who we are, what you leave with: a running stack where the dashboard and the alert are code.
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
[1 min] Introduce the speaker. Speaker details are placeholders in this draft.
-->
---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
[0.5 min] Housekeeping and agenda are next.
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
[1.5 min] Housekeeping: repo, questions in chat, what you need installed. The prerequisites are in the README.
-->
---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>The pain: blind when it counts</li>
  <li>Why observability drifts</li>
  <li>OpenTelemetry, Prometheus, Grafana</li>
  <li>The stack we build</li>
  <li>Demo: seven steps</li>
  <li>Wrap-up and Q&A</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
[1 min] Read the agenda. Pain, why it drifts, the three tools, the stack, then the demo.
-->
---

# 101 different tools were cited as in use
<div class="zoom-content">
<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">Grafana Labs Observability Survey 2025</div>
    <p>1,255 responses. 101 different observability technologies in use.</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>71% use Prometheus and OpenTelemetry in some capacity</li>
      <li>39% name complexity and overhead as their biggest obstacle</li>
      <li>It was the most frequently cited obstacle</li>
    </ul>
    </v-clicks>
  </div>
</div>
</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 1.6rem; font-size: 1.4rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
[1.5 min] Start with the room's own experience. Grafana Labs asked 1,255 people how they do observability. They counted 101 different technologies in use. Most of those people run Prometheus and OpenTelemetry in some capacity. And the obstacle they name most often is complexity. Ask who has clicked a dashboard together at two in the morning.
-->
---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The stack is open source.</h1>
</div>

<!--
[0.5 min] Say it flat. Prometheus, OpenTelemetry, Grafana: anyone can run them. Pause, then the next slide.
-->
---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The wiring is clicked together.</h1>
</div>

<!--
[0.5 min] The tools are not the hard part. The dashboard, the alert rule and the Collector config end up in a UI or a loose file. Nobody reviews them. This is the premise of the workshop. It is our claim, not a survey result.
-->
---

# What changes when observability is code
<div class="zoom-content">
<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Clicked together</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>A dashboard edited in the UI</li>
      <li>An alert nobody reviewed</li>
      <li>Collector config on one laptop</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Reviewed code</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>A dashboard in a pull request</li>
      <li>An alert rule with a diff</li>
      <li>Collector config in the repo</li>
    </ul>
  </div>
</div>
</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1.5 min] Walk the two columns. Left: the usual state. Right: what we build today. Pulumi IaC is the common thread: the same program language and the same preview-then-up flow for the cluster and for the dashboard.
-->
---

# Six questions before you trust a stack
<div class="zoom-content">
<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-rocket-launch class="step-icon" /><div class="gpu-caption gpu-caption--muted">Emit</div><p>How does the app emit telemetry?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-funnel class="step-icon" /><div class="gpu-caption gpu-caption--muted">Receive</div><p>Where does it all arrive first?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-database class="step-icon" /><div class="gpu-caption gpu-caption--muted">Store</div><p>Who stores the metrics and traces?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-chart-line class="step-icon" /><div class="gpu-caption gpu-caption--muted">See</div><p>Where do I look at it?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-bell-ringing class="step-icon" /><div class="gpu-caption gpu-caption--muted">Alert</div><p>Who tells me when it breaks?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-arrows-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--muted">Repeat</div><p>How do I rebuild it the same way?</p></div>
</div>
</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
[2.5 min] Read the six cards out loud, one click each. These are the spine of the next hour. We answer them in order, and the demo answers the last one.
-->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">OpenTelemetry: one way to emit.</h1>
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
[0.25 min] Section one. Questions one and two.
-->
---

# OpenTelemetry defines how an app emits traces, metrics and logs
<div class="zoom-content">
<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-app-window class="plan__icon" />
    <p>The app is instrumented</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-broadcast class="plan__icon" />
    <p>It emits traces, metrics and logs</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-paper-plane-tilt class="plan__icon" />
    <p>OTLP carries them out</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-hard-drives class="plan__icon" />
    <p>Any backend can receive them</p>
  </div>
</div>
<aside class="info-card plan__foot" v-click="5">
  <ph-tag class="plan__foot-icon" />
  <p>OpenTelemetry is vendor and tool agnostic.</p>
</aside>
</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.9rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
[2 min] OpenTelemetry is an open source framework and toolkit for generating, exporting and collecting telemetry: traces, metrics and logs. OTLP is the protocol that moves them between sources, collectors and backends. The point: the app does not know which backend you picked.
-->
---

# The Collector is the one place telemetry arrives
<div class="zoom-content">
<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-sign-in class="plan__icon" />
    <p>Receivers take OTLP in</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-gear class="plan__icon" />
    <p>Processors batch it</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-sign-out class="plan__icon" />
    <p>Exporters send it on</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-git-fork class="plan__icon" />
    <p>Metrics to Prometheus, traces to Tempo</p>
  </div>
</div>
<aside class="info-card plan__foot" v-click="5">
  <ph-plug class="plan__foot-icon" />
  <p>The Collector receives, processes and exports telemetry in a vendor-agnostic way.</p>
</aside>
</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.9rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
[2 min] The Collector has three parts: receivers, processors, exporters. In our demo it receives OTLP, batches, then exports metrics for Prometheus to scrape and traces to Tempo. One ingestion point. Change the backend by changing the Collector config, not the app.
-->
---

# Two questions answered, four to go
<div class="zoom-content">
<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-rocket-launch class="step-icon" /><div class="gpu-caption gpu-caption--accent">Emit</div><p>How does the app emit telemetry?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-funnel class="step-icon" /><div class="gpu-caption gpu-caption--accent">Receive</div><p>Where does it all arrive first?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-database class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Store</div><p>Who stores the metrics and traces?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-chart-line class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">See</div><p>Where do I look at it?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-bell-ringing class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Alert</div><p>Who tells me when it breaks?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-arrows-clockwise class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Repeat</div><p>How do I rebuild it the same way?</p></div>
</div>
</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
[0.5 min] Quick recap. Emit and receive are done.
-->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Prometheus: pull, store, query.</h1>
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
[0.25 min] Section two. Question three.
-->
---

# Prometheus pulls metrics and stores them as time series
<div class="zoom-content">
<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-clock-countdown class="plan__icon" />
    <p>Targets expose metrics over HTTP</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-download-simple class="plan__icon" />
    <p>Prometheus scrapes them on a schedule</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-database class="plan__icon" />
    <p>Samples are stored with labels</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-magnifying-glass class="plan__icon" />
    <p>PromQL queries them</p>
  </div>
</div>
<aside class="info-card plan__foot" v-click="5">
  <ph-tag class="plan__foot-icon" />
  <p>The service name sits in the <code>job</code> label.</p>
</aside>
</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.9rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
[2 min] Prometheus collects and stores metrics as time series, each sample stored with a timestamp and key-value labels. Collection happens over a pull model on HTTP. You query with PromQL. In our demo the Collector exposes the app's metrics, and the app's service name ends up in the job label. The dashboard and the alert both filter on it.
-->
---

# The operator turns scrape and alert config into Kubernetes objects
<div class="zoom-content">
<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-package class="plan__icon" />
    <p>kube-prometheus-stack installs the operator</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-target class="plan__icon" />
    <p>A ServiceMonitor selects what to scrape</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-scroll class="plan__icon" />
    <p>A PrometheusRule holds the alert</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-arrows-clockwise class="plan__icon" />
    <p>Prometheus loads both without a restart</p>
  </div>
</div>
<aside class="info-card plan__foot" v-click="5">
  <ph-warning class="plan__foot-icon" />
  <p>One Helm value matters: the selectors must accept our own objects.</p>
</aside>
</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.9rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
[3 min] The kube-prometheus-stack Helm chart installs the Prometheus Operator and a set of dashboards and rules. The operator adds custom resources: ServiceMonitor for what to scrape, PrometheusRule for alerts. The operator reconciles them and loads them dynamically, no restart. One trap, which our step two handles: by default the chart's selector values only pick up objects the chart itself created, so we turn that off.
-->
---

# Three questions answered, three to go
<div class="zoom-content">
<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-rocket-launch class="step-icon" /><div class="gpu-caption gpu-caption--accent">Emit</div><p>How does the app emit telemetry?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-funnel class="step-icon" /><div class="gpu-caption gpu-caption--accent">Receive</div><p>Where does it all arrive first?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-database class="step-icon" /><div class="gpu-caption gpu-caption--accent">Store</div><p>Who stores the metrics and traces?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-chart-line class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">See</div><p>Where do I look at it?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-bell-ringing class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Alert</div><p>Who tells me when it breaks?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-arrows-clockwise class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Repeat</div><p>How do I rebuild it the same way?</p></div>
</div>
</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
[0.5 min] Store is done. Next, where you look at it and who wakes you up.
-->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Grafana: see it, and get told.</h1>
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
[0.25 min] Section three. Questions four and five.
-->
---

# A labelled ConfigMap becomes a Grafana dashboard
<div class="zoom-content">
<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-file-code class="plan__icon" />
    <p>The dashboard is JSON in a ConfigMap</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-tag class="plan__icon" />
    <p>A label marks it for Grafana</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-eye class="plan__icon" />
    <p>The Grafana sidecar watches for it</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-chart-line class="plan__icon" />
    <p>The dashboard appears, no clicks</p>
  </div>
</div>
<aside class="info-card plan__foot" v-click="5">
  <ph-git-pull-request class="plan__foot-icon" />
  <p>The dashboard is reviewed like any other change.</p>
</aside>
</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.9rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
[2 min] Step five of the demo. Grafana runs a sidecar that watches ConfigMaps with a given label. In step two we enable it. In step five a Pulumi program creates a ConfigMap with the dashboard JSON and that label. Tempo is the trace backend Grafana reads traces from.
-->
---

# An alert is a PrometheusRule you can diff
<div class="zoom-content">
<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-scroll class="plan__icon" />
    <p>The rule holds a PromQL expression</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-timer class="plan__icon" />
    <p>It must hold for one minute</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-bell-ringing class="plan__icon" />
    <p>Prometheus marks the alert firing</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-envelope class="plan__icon" />
    <p>Alertmanager routes notifications</p>
  </div>
</div>
<aside class="info-card plan__foot" v-click="5">
  <ph-info class="plan__foot-icon" />
  <p>Prometheus fires the alert. Alertmanager sends notifications.</p>
</aside>
</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.9rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
[2 min] Alerting with Prometheus has two parts. Alerting rules in Prometheus send alerts to an Alertmanager. The Alertmanager handles silencing, grouping and notifications. Our demo defines the rule only, and watches it fire in the Prometheus alerts page. We do not set up a notification channel.
-->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Pulumi IaC: one program per layer.</h1>
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
[0.25 min] Section four. Question six.
-->
---

# Each step is a Pulumi project that reads the one before
<div class="zoom-content">
<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-cube class="plan__icon" />
    <p>Step 1 creates the cluster</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-package class="plan__icon" />
    <p>Steps 2 and 3 install the stack and Collector</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-app-window class="plan__icon" />
    <p>Step 4 deploys the app</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-chart-line class="plan__icon" />
    <p>Steps 5 and 6 add the dashboard and alert</p>
  </div>
</div>
<aside class="info-card plan__foot" v-click="5">
  <ph-link class="plan__foot-icon" />
  <p>Stack references pass the cluster between projects.</p>
</aside>
</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.9rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
[2 min] Seven folders, seven small Pulumi projects. A StackReference lets one project read exported outputs from another stack. The cluster project exports the kubeconfig, the later projects read it. Helm releases use the Pulumi Kubernetes helm v3 Release resource. Dashboards and rules are plain Kubernetes objects.
-->
---

# Where this breaks today
<div class="zoom-content">
<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">In this demo</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Local kind cluster, not production</li>
      <li>Alert rule only, no notification channel</li>
      <li>Dashboard JSON is written by hand</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Your next step</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Add Alertmanager receivers</li>
      <li>Pin and review every chart version</li>
      <li>Move to your cluster and storage</li>
    </ul>
  </div>
</div>
</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[2 min] Say the limits plainly. This is a single-node kind cluster. Nothing is sized for production. The alert fires in Prometheus but nobody is paged. The dashboard JSON is hand-written. Those are the first three things you would change.
-->
---

# Five questions answered, one to go
<div class="zoom-content">
<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-rocket-launch class="step-icon" /><div class="gpu-caption gpu-caption--accent">Emit</div><p>How does the app emit telemetry?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-funnel class="step-icon" /><div class="gpu-caption gpu-caption--accent">Receive</div><p>Where does it all arrive first?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-database class="step-icon" /><div class="gpu-caption gpu-caption--accent">Store</div><p>Who stores the metrics and traces?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-chart-line class="step-icon" /><div class="gpu-caption gpu-caption--accent">See</div><p>Where do I look at it?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-bell-ringing class="step-icon" /><div class="gpu-caption gpu-caption--accent">Alert</div><p>Who tells me when it breaks?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-arrows-clockwise class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Repeat</div><p>How do I rebuild it the same way?</p></div>
</div>
</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
[1 min] Five answered. The last one, rebuilding the same way, is what the demo shows.
-->
---

# The demo ends with this pipeline running
<div class="zoom-content">
<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-app-window class="plan__icon" />
    <p>Sample app, OpenTelemetry SDK</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-funnel class="plan__icon" />
    <p>OpenTelemetry Collector</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-database class="plan__icon" />
    <p>Prometheus and Tempo</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-chart-line class="plan__icon" />
    <p>Grafana dashboard and alert</p>
  </div>
</div>
<aside class="info-card plan__foot" v-click="5">
  <ph-cube class="plan__foot-icon" />
  <p>All of it on one local kind cluster, defined in Pulumi IaC.</p>
</aside>
</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.9rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
[2 min] This is the picture to hold. App to Collector to Prometheus and Tempo to Grafana. Everything runs on a local kind cluster, so the cost is zero and nobody needs a cloud account.
-->
---

# The stack is one Helm release in code
<div class="zoom-content">
<div class="big-code">
```ts
new k8s.helm.v3.Release("kube-prometheus-stack", {
    chart: "kube-prometheus-stack",
    version: "91.9.0",
    values: { prometheus: { prometheusSpec: {
        serviceMonitorSelectorNilUsesHelmValues: false,
    } } },
}, { provider });
```
</div>
</div>

<style scoped>
.zoom-content { zoom: 1.5; }
</style>

<!--
[2 min] This is the shape of the Pulumi program, trimmed. A Helm release resource, a pinned chart version, and the one value that lets Prometheus see our ServiceMonitor and alert rule. The full file is in step two.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Observability as Code.</h1>
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
[0.5 min] Divider. From here we build.
-->
---

# What we are going to do
<div class="zoom-content">
<div class="steps">
  <div class="gpu-card step" v-click><ph-cube class="step__icon" /><p>A kind cluster, created by Pulumi</p></div>
  <div class="gpu-card step" v-click><ph-chart-bar class="step__icon" /><p>Prometheus, Grafana and Tempo installed</p></div>
  <div class="gpu-card step" v-click><ph-funnel class="step__icon" /><p>An OpenTelemetry Collector in front</p></div>
  <div class="gpu-card step" v-click><ph-app-window class="step__icon" /><p>A sample app that emits telemetry</p></div>
  <div class="gpu-card step" v-click><ph-presentation-chart class="step__icon" /><p>A dashboard as code</p></div>
  <div class="gpu-card step" v-click><ph-bell-ringing class="step__icon" /><p>An alert rule as code</p></div>
  <div class="gpu-card step" v-click><ph-pulse class="step__icon" /><p>Load, then watch it all move</p></div>
</div>
<div class="big-code code-sm mt-2">
```bash
cd 0X-<step> && pulumi up
```
</div>
</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.steps { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.8rem; margin-top: 2.2rem; }
.step { display: flex; flex-direction: row; align-items: center; gap: 0.9rem; padding: 0.7rem 1.1rem; }
.step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.step__icon { font-size: 2rem; color: var(--p-primary); }
</style>

<!--
[3 min] Seven steps, each one folder and one Pulumi project. Same command in each: pulumi up in the folder. We show it once here and not again.
-->
---

# A kind cluster comes up from a Pulumi program
<div class="zoom-content">
<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />01-cluster</div>
    <div class="s1__label"><ph-terminal-window />then, once, with a network</div>
    <div class="big-code code-sm">
```bash
./precache-images.sh
```
</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
      <li><ph-cube /><span>One kind cluster</span></li>
      <li><ph-folders /><span>A monitoring and a demo namespace</span></li>
      <li><ph-download-simple /><span>Images are pre-loaded for the venue Wi-Fi</span></li>
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
[5 min] Step one. The cluster is a Pulumi program that shells out to kind create cluster. Run pulumi up, then the pre-cache script once, while the network is good. You should see the cluster and two namespaces.
-->
---

# Prometheus, Grafana and Tempo arrive in one program
<div class="zoom-content">
<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />02-metrics-stack</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
      <li><ph-check /><span>Prometheus selects our monitors and rules</span></li>
      <li><ph-lock /><span>The Grafana admin password is a Pulumi secret</span></li>
      <li><ph-tree-structure /><span>Tempo is installed beside it</span></li>
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
[6 min] Step two. Show the program on screen: two Helm releases and the selector values. Run pulumi up. You should see the monitoring pods come up. The Grafana password was set as a secret in config.
-->
---

# The Collector sits between the app and the backends
<div class="zoom-content">
<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />03-collector</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
      <li><ph-sign-in /><span>OTLP comes in on 4317 and 4318</span></li>
      <li><ph-funnel /><span>Metrics go out for Prometheus to scrape</span></li>
      <li><ph-git-fork /><span>Traces go to Tempo</span></li>
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
[7 min] Step three. The Collector config is in the program on screen. Receivers, a batch processor, exporters, two pipelines. Run pulumi up. If it breaks, the diff-against-fallback script compares against the known good file.
-->
---

# The sample app emits telemetry with no backend code
<div class="zoom-content">
<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />04-sample-app</div>
    <div class="s1__label"><ph-terminal-window />build and load the image</div>
    <div class="big-code code-sm">
```bash
./build-and-load.sh
```
</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
      <li><ph-app-window /><span>A small HTTP service</span></li>
      <li><ph-pulse /><span>Auto-instrumented with the OpenTelemetry Node SDK</span></li>
      <li><ph-link /><span>It reads the Collector from the other stack</span></li>
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
[6 min] Step four. Build the image and load it into kind, then pulumi up. The app has a work endpoint with a random delay and a ten percent simulated failure. You should see the pod running in the demo namespace.
-->
---

# The dashboard is a ConfigMap in a pull request
<div class="zoom-content">
<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />05-dashboard</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
      <li><ph-chart-line /><span>A p95 latency panel</span></li>
      <li><ph-tag /><span>The <code>grafana_dashboard</code> label registers it</span></li>
      <li><ph-tree-structure /><span>A Tempo panel sits beside it</span></li>
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
[6 min] Step five. The panel queries the request duration histogram, filtered on the job label for the sample app. Run pulumi up. Open Grafana. The dashboard is there, nobody clicked it together.
-->
---

# The alert is a rule with a threshold and a diff
<div class="zoom-content">
<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />06-alert-rule</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
      <li><ph-scroll /><span>A PrometheusRule, p95 above 200 ms</span></li>
      <li><ph-timer /><span>It must hold for one minute</span></li>
      <li><ph-eye /><span>Watch it on the Prometheus alerts page</span></li>
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
[4 min] Step six. Run pulumi up. The rule is a PrometheusRule custom resource. Open the alerts page: it is inactive for now. In the next step we make it move.
-->
---

# Traffic makes the graph move and the trace appear
<div class="zoom-content">
<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />07-load-and-observe</div>
    <div class="s1__label"><ph-terminal-window />terminal one</div>
    <div class="big-code code-sm">
```bash
./port-forward.sh &
```
</div>
    <div class="s1__label"><ph-terminal-window />terminal two</div>
    <div class="big-code code-sm">
```bash
./generate-load.sh
```
</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
      <li><ph-globe /><span>Grafana on port 3000, Prometheus on 9090</span></li>
      <li><ph-chart-line /><span>Latency moves, and a trace waterfall shows</span></li>
      <li><ph-bell-ringing /><span>The alert may fire. Say if it does not.</span></li>
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
[5.5 min] Step seven. Port-forward, then about five requests a second to the work endpoint. Show the dashboard and a trace in Grafana. The p95 sits in the 50 to 250 millisecond delay range, so the alert may or may not cross 200 ms. We say which. This answers the last question: all of it, rebuilt from code.
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-4 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/observability-as-code-otel-prometheus-grafana" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → observability-as-code-otel-prometheus-grafana</div>
  </div>
  <div class="res-card">
    <QRCode data="https://opentelemetry.io/docs/collector/" dark="#000000" />
    <div class="res-card__title">OpenTelemetry Collector docs</div>
    <div class="res-card__body">opentelemetry.io/docs/collector</div>
  </div>
  <div class="res-card">
    <QRCode data="https://prometheus.io/docs/introduction/overview/" dark="#000000" />
    <div class="res-card__title">Prometheus overview</div>
    <div class="res-card__body">prometheus.io/docs</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v3/release/" dark="#000000" />
    <div class="res-card__title">Pulumi Kubernetes Helm Release</div>
    <div class="res-card__body">pulumi.com/registry</div>
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
[1 min] The repo QR code and the resource links. Everything we build is in the repo.
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
[0.5 min] Where to go next.
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/observability-as-code-otel-prometheus-grafana" dark="#000000" /></div>
      <div class="thanks__qr-label">observability-as-code-otel-prometheus-grafana</div>
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
[10 min] Questions. This is the buffer from the brief.
-->
