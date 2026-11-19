---
theme: "@pulumi/slidev-theme"
title: "One platform, many clusters"
info: |
  One platform, many clusters: Share one Kubernetes API with every consumer cluster, using kbind and Pulumi IaC.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/kbind-service-sharing-across-clusters
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
    One platform, many clusters
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Share one Kubernetes API with every consumer cluster, using kbind and Pulumi IaC
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
Time: 1 min.
Welcome. Introduce yourself and the topic. [SPEAKER PLACEHOLDER: names and roles are not known yet.]
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
Time: 1 min.
Speaker slide. [SPEAKER PLACEHOLDER: fill in from frame.json once speakers are known.]
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
Time: 0.5 min.
Set the frame: this is a 90 minute session with a live demo.
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
Time: 0.75 min.
Housekeeping: where to find the code, questions welcome at any point, the demo clusters take a few minutes to create.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>Why an operator per cluster hurts</li>
  <li>How kbind shares an API</li>
  <li>Pulumi IaC and ESC around it</li>
  <li>Demo: two clusters, one binding</li>
  <li>Wrap-up and Q&A</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
Time: 0.75 min.
Walk the agenda: why an operator per cluster hurts, how kbind shares an API, Pulumi IaC and ESC around it, the demo, wrap-up and Q&A.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Kubernetes lacks a native way to provide APIs as services.</h1>
</div>

<!--
Time: 0.75 min.
This is the project's own sentence, from the front page of kbind.dev (read 2026-10-24): while Kubernetes has amazing ecosystem, it lacks a native way to provide APIs as services. I could not find a verifiable incident or practitioner quote for this topic, so I start from the problem statement the project itself publishes. Pause here. Ask who in the room runs a service that other teams or customers consume from their own cluster.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">One service. Many clusters.</h1>
</div>

<!--
Time: 0.25 min.
You run the service in one place and your consumers live in many. The rest of the session covers how to serve them all without copying the service into each cluster.
-->

---

# Six questions before you share an API

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--muted">Who</div><p>Who provides the API?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-stack class="step-icon" /><div class="gpu-caption gpu-caption--muted">What</div><p>What exactly is shared?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-plugs-connected class="step-icon" /><div class="gpu-caption gpu-caption--muted">How</div><p>How does a consumer bind?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-vault class="step-icon" /><div class="gpu-caption gpu-caption--muted">Which</div><p>Which credentials does each side hold?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-copy class="step-icon" /><div class="gpu-caption gpu-caption--muted">Again</div><p>How do we add the next consumer?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--muted">Where</div><p>Where does the object live?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
Time: 1.25 min.
These six questions are the spine of the talk. We answer the first four with slides, and the demo answers the last two. Click through them one at a time and ask for a show of hands on which one hurts most today.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">A CRD alone is only a schema.</h1>
</div>

<!--
Time: 0.25 min.
A custom resource definition tells a cluster what an object looks like. Something still has to act on it. The kbind docs home page says the provider indirectly reads and writes the synced objects as the interface to its service, and that no controllers or operators are injected into the consumer cluster. That is the piece the consumer should not have to run.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How kbind shares an API.</h1>
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
Time: 0.25 min.
Section one. Short and conceptual.
-->

---

# Three roles carry the whole model

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-cloud-check class="chain__icon" />
    <div class="gpu-caption">Provider</div>
    <span>Exports APIs</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-plugs-connected class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Konnector</div>
    <span>Syncs both ways</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-cube class="chain__icon" />
    <div class="gpu-caption">Consumer</div>
    <span>Imports and uses</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>The konnector connects provider and consumer.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-file-code /><p>Provider exports CRDs plus permission claims</p></div>
  <div class="fact"><ph-sign-in /><p>Consumer authenticates through OAuth2 flows</p></div>
  <div class="fact"><ph-arrows-left-right /><p>Konnector syncs schema and data</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.0; }
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
Time: 1.25 min.
Source: the kbind usage guide, docs.kbind.dev, read 2026-10-24. The service provider is the cluster that exports APIs. The consumer imports them. The konnector agent keeps the secure connection and synchronizes resources and handles permissions. Note the names: kbind was called kube-bind until this year, and the docs still show kube-bind in places.
-->

---

# A binding takes four steps

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-file-code class="plan__icon" />
    <p>Provider defines an export template</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-paper-plane-tilt class="plan__icon" />
    <p>Consumer sends an export request</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-cloud-check class="plan__icon" />
    <p>Provider creates the export and the schema</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-check-circle class="plan__icon" />
    <p>Consumer applies a binding</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-arrows-left-right class="plan__foot-icon" />
  <p><strong>After binding:</strong> objects sync both ways.</p>
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
Time: 1.25 min.
Source: API Concepts (the objects are APIServiceExportTemplate, APIServiceExportRequest and APIServiceBinding), docs.kbind.dev, section Complete Binding Flow, read 2026-10-24. The docs list five steps; I fold the export and its bound schema into one. Step five in the docs is bidirectional sync between provider and consumer resources through the konnector agents. In the demo you will see steps two to four happen from one browser login.
-->

---

# Each API type has one owner

<div class="zoom-content">

<div class="bounds">
  <div class="bound" v-click><ph-file-code /><div class="bound__want">the service contract</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Provider: <code>APIServiceExportTemplate</code></div></div>
  <div class="bound" v-click><ph-paper-plane-tilt /><div class="bound__want">a request to bind</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Consumer: <code>APIServiceExportRequest</code></div></div>
  <div class="bound" v-click><ph-check-circle /><div class="bound__want">the CRD on the consumer</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Konnector: <code>APIServiceBinding</code> applies it</div></div>
  <div class="bound" v-click><ph-tree-structure /><div class="bound__want">namespace mapping</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Konnector: <code>APIServiceNamespace</code></div></div>
  <div class="bound" v-click><ph-lock-key /><div class="bound__want">extra resources a service reads</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Permission claims on the template</div></div>
  <div class="bound" v-click><ph-users-three /><div class="bound__want">isolation between consumers</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">One of three isolation modes</div></div>
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
Time: 1.25 min.
Source: API Concepts on docs.kbind.dev, read 2026-10-24. The API Concepts page marks for each type who uses it: providers, consumers through the CLI or UI, or the konnector agents, which create the binding and the namespace mapping for you. Permission claims decide what additional resources a service can reach beyond its own CRDs; they can select by label or by name.
-->

---

# Isolation has three modes

<div class="zoom-content">

<div class="modes">
  <div class="gpu-card gpu-card--primary mode" v-click>
    <div class="mode__head"><ph-users-three class="mode__icon" /><code class="mode__name">Prefixed</code></div>
    <p>Consumer id prefixes the name</p>
  </div>
  <div class="gpu-card gpu-card--accent mode" v-click>
    <div class="mode__head"><ph-folder-open class="mode__icon" /><code class="mode__name">Namespaced</code></div>
    <p>One namespace each</p>
  </div>
  <div class="gpu-card  mode" v-click>
    <div class="mode__head"><ph-prohibit class="mode__icon" /><code class="mode__name">None</code></div>
    <p>No isolation, one tenant</p>
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
Time: 0.75 min.
Source: API Concepts, section Namespace Isolation Modes, docs.kbind.dev, read 2026-10-24. Prefixed puts the consumer id in front of the namespace name. Namespaced gives each consumer a dedicated provider namespace. None is for provider clusters that serve one tenant. The demo uses the default the backend chart sets; I have not pinned a mode in the demo code.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The operator stays on the provider side.</h1>
</div>

<!--
Time: 0.25 min.
kbind's front page says the goal is a service provider who can securely provide centrally operated kube-native services (kbind.dev, read 2026-10-24). That is the claim we test in the demo: the consumer has the CRD and no provider operator.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Pulumi IaC and ESC around it.</h1>
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
Time: 0.25 min.
Section two. What Pulumi does around kbind.
-->

---

# A component wraps the provider side

<div class="zoom-content">

<div class="compose">
  <div class="compose__stack">
    <div class="gpu-caption">Example stack</div>
    <div class="piece piece--mixin" v-click="3"><ph-file-code />Exported API template</div>
    <div class="piece piece--sandbox" v-click="2"><ph-package />kbind backend release</div>
    <div class="piece piece--template" v-click="1"><ph-cube />EKS cluster</div>
  </div>
  <ul class="rules" v-click="4">
    <li><ph-package /><span>The component is one resource to its consumers</span></li>
    <li><ph-stack /><span>Its children sit under it in the resource tree</span></li>
    <li><ph-lock-key /><span>The kubeconfig is a secret output</span></li>
    <li><ph-copy /><span>A second component wraps the consumer cluster</span></li>
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
Time: 1.25 min.
Source: Pulumi docs, Components page, read 2026-10-24: a component is a logical grouping of resources exposed as a single resource. In the demo code the provider component creates the EKS cluster, installs the kbind backend chart and exports the API; the consumer component creates a cluster and installs the konnector side. The kubeconfig outputs are marked secret in the program.
-->

---

# ESC hands each stack its AWS credentials

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-vault class="chain__icon" />
    <div class="gpu-caption">ESC environment</div>
    <code><code>aws-login</code></code>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-cloud-check class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Pulumi Cloud</div>
    <span>OIDC token exchange</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-key class="chain__icon" />
    <div class="gpu-caption">AWS role</div>
    <span>Short-lived credentials</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>No static AWS keys live in the repo or the stack.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-clock /><p>Credentials last one hour</p></div>
  <div class="fact"><ph-file-code /><p>Variables feed the AWS provider</p></div>
  <div class="fact"><ph-link /><p>The stack config links it</p></div>
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
Time: 1.25 min.
Source: Pulumi docs, ESC aws-login provider, read 2026-10-24: OIDC is the recommended way; Pulumi Cloud exchanges a short-lived OIDC token for temporary AWS credentials by assuming an IAM role, so there are no long-lived keys. The demo environments request a one hour duration and set the AWS environment variables. Linking an environment to a stack is the one command that asks for confirmation; the setup script never passes the skip flag.
-->

---

# The consumer reads the provider's outputs

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-cloud-check class="chain__icon" />
    <div class="gpu-caption">Provider stack</div>
    <code><code>backendUrl</code> output</code>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-vault class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">ESC</div>
    <code><code>pulumi-stacks</code></code>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-cube class="chain__icon" />
    <div class="gpu-caption">Consumer stack</div>
    <code><code>providerUrl</code> config</code>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>One output, read where it is needed.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-file-code /><p>The environment names <code>project/stack</code></p></div>
  <div class="fact"><ph-arrow-right /><p>Outputs resolve under the stack name</p></div>
  <div class="fact"><ph-lock-key /><p>No token is copied by hand</p></div>
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
Time: 1 min.
Source: Pulumi docs, ESC pulumi-stacks provider, read 2026-10-24: the provider imports stack outputs into the environment, and the stack is named project/stack. In our environments the provider stack kbind-provider/provider-dev is read, and its backendUrl becomes the consumer's providerUrl config. That is how the consumer finds the backend without anyone pasting a URL.
-->

---

# Pulumi and kbind split the work

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-cloud-check class="step-icon" /><div class="gpu-caption gpu-caption--muted">Pulumi</div><p>Clusters and kubeconfigs</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-package class="step-icon" /><div class="gpu-caption gpu-caption--muted">Pulumi</div><p>The backend release</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-file-code class="step-icon" /><div class="gpu-caption gpu-caption--muted">Pulumi</div><p>The exported API definition</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-arrow-square-out class="step-icon" /><div class="gpu-caption gpu-caption--muted">kbind</div><p>Export</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-plugs-connected class="step-icon" /><div class="gpu-caption gpu-caption--muted">kbind</div><p>Binding</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-arrows-left-right class="step-icon" /><div class="gpu-caption gpu-caption--muted">kbind</div><p>Sync</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
Time: 0.75 min.
Learning outcome five. Pulumi IaC builds the clusters, installs the release and declares the API definition; Pulumi ESC and Pulumi Cloud carry credentials and outputs. kbind does the export, the binding and the sync. Click through and keep the two columns apart.
-->

---

# Four questions answered, two to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>Provider component</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-stack class="step-icon" /><div class="gpu-caption gpu-caption--accent">What</div><p>CRDs and permission claims</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-plugs-connected class="step-icon" /><div class="gpu-caption gpu-caption--accent">How</div><p>Request, then browser login</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-vault class="step-icon" /><div class="gpu-caption gpu-caption--accent">Which</div><p>ESC, OIDC, no keys</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-copy class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Again</div><p>The demo answers this</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-cube class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Where</div><p>The demo answers this</p></div>
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
Time: 0.75 min.
Recap. Walk the four answered cards in one breath. The two grey ones are the demo: adding a second consumer without touching the provider, and the object created on a consumer showing up on the provider.
-->

---

# Where this breaks today

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-flask class="step-icon" /><div class="gpu-caption gpu-caption--muted">Alpha</div><p>The API version is <code>v1alpha2</code></p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-tree-structure class="step-icon" /><div class="gpu-caption gpu-caption--muted">Sandbox</div><p>kbind is a CNCF Sandbox project</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-git-branch class="step-icon" /><div class="gpu-caption gpu-caption--muted">2.0</div><p>Release candidates up to rc7 are out</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-push-pin class="step-icon" /><div class="gpu-caption gpu-caption--muted">Pin</div><p>The demo pins 0.8.1, latest stable is 0.8.2</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-browser class="step-icon" /><div class="gpu-caption gpu-caption--muted">Browser</div><p>Binding opens a login page</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-clock class="step-icon" /><div class="gpu-caption gpu-caption--muted">Time</div><p>Each cluster takes minutes</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
Time: 0.75 min.
Sources, all read 2026-10-24: the API Concepts page shows kube-bind.io/v1alpha2; the CNCF sandbox issue 464 on GitHub records the sandbox vote passing on 2026-03-12 with 8 in favour and none against, and the rename to kbind; the releases page lists v2.0.0-rc7 as a pre-release on 2026-08-20 and v0.8.2 as the latest stable on 2026-07-03. The demo pins 0.8.1 because that is what the chart and plugin were tested against in the demo code; check the README open points before you change it. Binding needs a browser on the presenter's machine.
-->

---

# Two consumers bind one provider

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-cloud-check class="chain__icon" />
    <div class="gpu-caption">Provider EKS</div>
    <code>Backend and exported API</code>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-plugs-connected class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">kbind binding</div>
    <span>Konnector syncs objects</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-cube class="chain__icon" />
    <div class="gpu-caption">Consumer EKS</div>
    <span>CRD, no operator</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>Pulumi IaC builds all three clusters from two programs.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-cube /><p>Consumer A binds first</p></div>
  <div class="fact"><ph-copy /><p>Consumer B is a new stack</p></div>
  <div class="fact"><ph-lock-key /><p>The provider stack stays unchanged</p></div>
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
Time: 1 min.
This is the picture for the demo. One provider cluster. Consumer A binds and creates an object. Consumer B is a second stack of the same consumer component with its own ESC environment, and binds without a change to the provider stack.
-->

---

# One component, two config values

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-file-code />05-consumer/index.ts</div>
    <div class="big-code code-sm">

```ts
const consumer = new KbindConsumer("kbind", {
  clusterName: `${pulumi.getProject()}-${pulumi.getStack()}`,
  consumerName: config.require("consumerName"),
  providerUrl: config.require("providerUrl"),
});
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-user-circle /><span>The consumer name comes from ESC</span></li>
    <li><ph-link /><span>So does the provider URL</span></li>
    <li><ph-copy /><span>A new consumer is a new stack</span></li>
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
Time: 0.75 min.
This is the only program code in the deck. It is the consumer stack's index file from the demo folder, trimmed to the component call. Both config values come from the stack's ESC environment, so a second consumer needs no code change.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The provider does not change when a consumer joins.</h1>
</div>

<!--
Time: 0.25 min.
This is the claim the demo tests. When the second consumer binds, the provider stack shows no pending change. Hold the claim and watch for it in step 8.
-->

---

# Check these before we start

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--muted">Pulumi</div><p>CLI 3.200 or newer, logged in to Pulumi Cloud</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-vault class="step-icon" /><div class="gpu-caption gpu-caption--muted">AWS</div><p>An IAM role that trusts the Pulumi Cloud OIDC issuer</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-terminal-window class="step-icon" /><div class="gpu-caption gpu-caption--muted">Tools</div><p>Node.js 20, AWS CLI v2, kubectl</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-browser class="step-icon" /><div class="gpu-caption gpu-caption--muted">Browser</div><p>On the machine that runs the bind step</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-lightning class="step-icon" /><div class="gpu-caption gpu-caption--muted">Preflight</div><p><code>preflight.sh</code> checks all of it</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-clock class="step-icon" /><div class="gpu-caption gpu-caption--muted">Time</div><p>Clusters take several minutes</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
Time: 0.5 min.
Source: the demo README, prerequisites section. This is for people following along on their own accounts. The preflight script in the demo folder checks everything on this slide. Expect idle waiting while clusters build; this talk covers it.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Same program, second consumer.</h1>
</div>

<!--
Time: 0.25 min.
Last line before the demo. The claim to watch: the second consumer needs a new stack and a new ESC environment, and the provider stack shows no pending change.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: One platform, many clusters.</h1>
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
Time: 0.25 min.
Demo opener. The cluster waits start now.
-->

---

# What we are going to do

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-git-branch class="step__icon" /><p>Stacks and ESC</p></div>
  <div class="gpu-card step" v-click><ph-cloud class="step__icon" /><p>Provider cluster and backend</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-plugs-connected class="step__icon" /><p>Consumer, bind, object</p></div>
  <div class="gpu-card gpu-card--accent step" v-click><ph-copy class="step__icon" /><p>Second consumer, teardown</p></div>
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
Time: 4.75 min.
Four blocks, nine steps; step 1, 01-stacks-and-esc/setup.sh, creates the stacks and ESC environments and is run on the host before the slides continue (it asks you to confirm config env add, and needs KBIND_AWS_ROLE_ARN from the README). Stacks and ESC first, then the provider cluster, the kbind backend and the export. Then a consumer cluster, the binding and one object. Last, a second consumer and the teardown. Cluster creation takes minutes, so the story slides cover the waiting. Every command on the next slides is the script the demo folder runs.
-->

---

# Step 2: The provider cluster

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
02-provider/deploy.sh cluster
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-cloud /><span>Stage one: the EKS cluster only</span></li>
    <li><ph-eye /><span>Runs pulumi preview, then pulumi up</span></li>
    <li><ph-hourglass /><span>Cluster creation takes minutes</span></li>
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
Time: 9 min.
Stage one of the provider stack: the cluster only. The script sets the stack config flags, runs pulumi preview, then pulumi up and asks you to confirm. While it runs, go back to the Act 2 idea: the provider side is one component. Then run 02-provider/check.sh cluster, which expects two Ready nodes.
-->

---

# Step 3: The kbind backend

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
02-provider/deploy.sh backend
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-package /><span>The backend is a Helm release</span></li>
    <li><ph-number-circle-one /><span>Phase one installs it</span></li>
    <li><ph-link /><span>Phase two sets the external address</span></li>
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
Time: 8 min.
Stage two installs the kbind backend as a Helm release. It comes in two phases: the first installs it, the second (deploy.sh address) sets externalAddress and callbackUrl once the load balancer has an address. Run 02-provider/check.sh backend to see the pod Running and the URL answer.
-->

---

# Step 4: Export the API

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
02-provider/deploy.sh export
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-file-code /><span>Creates the CRD</span></li>
    <li><ph-export /><span>And the APIServiceExportTemplate</span></li>
    <li><ph-list-checks /><span>check.sh export lists the template</span></li>
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
Time: 5 min.
The export stage creates the CRD, the APIServiceExportTemplate and the Collection. This is the moment the provider publishes an API. Run 02-provider/check.sh export and show the template in the list.
-->

---

# Step 5: The consumer cluster

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
05-consumer/deploy.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-database /><span>Reads the provider stack outputs</span></li>
    <li><ph-user-circle /><span>Consumer name comes from ESC</span></li>
    <li><ph-hourglass /><span>Another cluster, another wait</span></li>
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
Time: 8 min.
The consumer stack reads the provider stack's backendUrl output through its ESC environment, so the provider needs its backend installed first. The script runs pulumi preview, then pulumi up. Use the wait to ask the room how they hand credentials to a second cluster today.
-->

---

# Step 6: Bind the consumer

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
06-bind/bind.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-browser /><span>Opens a browser on this machine</span></li>
    <li><ph-key /><span>Sign in on the embedded OIDC page</span></li>
    <li><ph-cube /><span>Select the mangodb template</span></li>
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
Time: 5 min.
bind.sh runs kubectl bind login and kubectl bind against the consumer cluster, with --konnector-image pointing at the kbind-dev registry. Both open a browser. The chart's embedded OIDC server needs no external identity provider; the kbind Helm docs call for a real OIDC provider in production. Select the mangodb template, then run 06-bind/check.sh to see the konnector pod and the mangodb CRD.
-->

---

# Step 7: Create one object

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
07-create-object/create.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-file-code /><span>kubectl apply on the consumer</span></li>
    <li><ph-arrows-left-right /><span>The object shows up on the provider</span></li>
    <li><ph-timer /><span>Syncing takes a few seconds</span></li>
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
Time: 4 min.
create.sh applies one mangodb object in the consumer, then lists the same resource on both clusters. The provider shows it in a namespace the backend created for this consumer. Syncing takes a few seconds; check.sh retries.
-->

---

# Step 8: A second consumer

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
08-second-consumer/run.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-copy /><span>New stack, new ESC environment</span></li>
    <li><ph-plugs-connected /><span>Cluster, bind, object again</span></li>
    <li><ph-equals /><span>Provider preview shows no changes</span></li>
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
Time: 8 min.
run.sh repeats steps 1, 5, 6 and 7 for consumer-b-dev. The binding opens a browser again. It ends with the provider listing objects from two consumers and a pulumi preview --expect-no-changes on provider-dev that exits 0. That is the claim of the talk: the provider did not change.
-->

---

# Step 9: Tear it down

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
09-teardown/teardown.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-arrow-down /><span>Consumers first, provider last</span></li>
    <li><ph-question /><span>Asks before each destroy</span></li>
    <li><ph-check-circle /><span>Then run verify.sh and cleanup.sh</span></li>
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
Time: 3 min.
teardown.sh destroys consumer-b-dev, consumer-a-dev and then provider-dev, removing each stack. Consumers go first so the provider's load balancer and bindings have no live consumers. It asks before each destroy. Afterwards run 09-teardown/verify.sh and 09-teardown/cleanup.sh.
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-4 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/kbind-service-sharing-across-clusters" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → kbind-service-sharing-across-clusters</div>
  </div>
  <div class="res-card">
    <QRCode data="https://docs.kbind.dev/main/" dark="#000000" />
    <div class="res-card__title">kbind documentation</div>
    <div class="res-card__body">docs.kbind.dev</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/iac/concepts/components/" dark="#000000" />
    <div class="res-card__title">Pulumi components</div>
    <div class="res-card__body">pulumi.com/docs/iac/concepts/components</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/esc/" dark="#000000" />
    <div class="res-card__title">Pulumi ESC</div>
    <div class="res-card__body">pulumi.com/docs/esc</div>
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
Time: 1 min.
Resources: the kbind docs, Pulumi components and Pulumi ESC. Point at the QR codes.
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
Time: 1 min.
Next steps with Pulumi. Name one thing to try this week.
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/kbind-service-sharing-across-clusters" dark="#000000" /></div>
      <div class="thanks__qr-label">kbind-service-sharing-across-clusters</div>
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
Time: 12.75 min.
Questions. Use the time for audience questions; the failure modes slide and the open points in the README are good seeds.
-->
