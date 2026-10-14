---
theme: "@pulumi/slidev-theme"
title: "VMs on Kubernetes as code"
info: |
  VMs on Kubernetes as code: Provision and live-migrate a KubeVirt VM with Pulumi.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/vms-on-kubernetes-kubevirt-live-migration
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
    VMs on Kubernetes as code
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Provision and live-migrate a KubeVirt VM with Pulumi
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
Welcome. Introduce the topic in one sentence: running VMs on Kubernetes, declared with Pulumi.

Time: 0.5 min
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
Introduce yourself. The speaker names are placeholders until confirmed; swap them before the session.

Time: 1.5 min
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
Two things before we start: housekeeping, then the agenda.

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
Housekeeping: where the code lives, how to follow along, and that questions are welcome any time.

Time: 2 min
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>The VM problem on Kubernetes</li>
  <li>What KubeVirt adds</li>
  <li>Where Pulumi fits</li>
  <li>The solution we build</li>
  <li>Demo: provision and live-migrate</li>
  <li>Wrap-up and Q&A</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
Walk the agenda in one breath: the problem, KubeVirt, Pulumi, then the demo with a live migration.

Time: 1 min
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[4rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[85%]">"How do you standardize on cloud native infrastructure while maintaining the virtual machines that your business depends on?"</h1>
  <p class="!mt-10 !text-[1.6rem] text-[var(--p-fg-muted)] !max-w-[80%]">Janakiram MSV, The New Stack, 3 November 2025. A sponsored post by Spectro Cloud, excerpt of the TNS eBook "Running Virtual Machines on Kubernetes".</p>
</div>

<!--
Start with a question. This one comes from a sponsored post on The New Stack, so read it as a vendor framing, not a neutral survey. I still like it because every platform team in this room has had that conversation. Hold on to it; the whole workshop answers it.

Time: 1.5 min
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Your platform runs containers.</h1>
</div>

<!--
The platform you chose, or are choosing, is Kubernetes. Say it plainly and pause.

Time: 0.5 min
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Your business still runs VMs.</h1>
</div>

<!--
And the applications that pay the bills still ship as virtual machines. Both sentences are true at once, and that is the tension.

Time: 0.5 min
-->

---

# Two stacks mean two teams, two toolchains and two skill sets

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-desktop class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Hypervisor platform</div></div>
    <ul class="zone__list">
      <li><ph-desktop /><span>Where your VMs run</span></li>
      <li><ph-users /><span>A team that knows that platform</span></li>
      <li><ph-wrench /><span>Its own tools and workflow</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-cube class="zone__icon" /><div class="gpu-caption">Kubernetes</div></div>
    <ph-cube class="zone__hero" />
    <p>Where your containers run</p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">The cost</div>
  <p>The post puts it this way: each stack needs its own skill set, so different teams run them.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
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
Today a VM runs on a hypervisor platform and a container runs on Kubernetes. The New Stack post says each needs its own skill set, so different teams end up running them. The cost is two of everything around the hypervisor.

Time: 2 min
-->

---

# The usual answer keeps two control planes; the goal is one API

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Two control planes</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>VMs on a hypervisor platform</li>
      <li>Containers on Kubernetes</li>
      <li>Two skill sets, two teams</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">One API</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>VMs as objects in the Kubernetes API</li>
      <li>Added by KubeVirt, no second platform to run</li>
      <li>One place to declare and read both</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
</style>

<!--
The usual answer is to leave the VMs where they are. The alternative from the KubeVirt user guide is to make VMs objects in the Kubernetes API. That is the goal for today: one API. The claim to make is that it removes the second control plane. It does not make VMs free.

Time: 2 min
-->

---

# Five questions decide whether you can trust VMs on Kubernetes

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--muted">Q1</div><p>What is a VM to Kubernetes?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-cloud class="step-icon" /><div class="gpu-caption gpu-caption--muted">Q2</div><p>What runs it?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-file-code class="step-icon" /><div class="gpu-caption gpu-caption--muted">Q3</div><p>Who declares it?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-arrows-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--muted">Q4</div><p>What does live migration need?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-link class="step-icon" /><div class="gpu-caption gpu-caption--muted">Q5</div><p>Does a connection survive the move?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
These five questions are the spine of the next hour. Read them aloud. Q1 and Q2 are about KubeVirt, Q3 is about Pulumi, Q4 and Q5 are about live migration. We answer the first four with slides and the fifth by running it.

Time: 2 min
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Q1. What is a VM to Kubernetes?</h1>
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
First question. What is a VM, from the cluster's point of view.

Time: 0.5 min
-->

---

# KubeVirt adds VM types to the Kubernetes API instead of a second API

<div class="zoom-content">

<div class="compose">
  <div class="compose__stack">
    <div class="gpu-caption">What KubeVirt adds</div>
    <div class="piece piece--mixin" v-click="4"><ph-plugs />virt-handler, a daemon on each node</div>
    <div class="piece piece--mixin" v-click="3"><ph-brain />virt-controller</div>
    <div class="piece piece--sandbox" v-click="2"><ph-package />Custom resource definitions: VirtualMachine, VirtualMachineInstance</div>
    <div class="piece piece--template" v-click="1"><ph-cube />Kubernetes API</div>
  </div>
  <ul class="rules" v-click="5">
      <li><ph-cube /><span>CRDs add the VM types</span></li>
      <li><ph-brain /><span>Controllers act on them</span></li>
      <li><ph-plugs /><span>Node daemons run the VMs</span></li>
      <li><ph-check /><span>No second API to learn</span></li>
  </ul>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
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
KubeVirt extends Kubernetes with custom resource definitions, controllers and node daemons.  Build it up from the bottom: the API you already have, then the new types, then the controller, then the daemon on each node.

Time: 2 min
-->

---

# A VirtualMachine becomes a VirtualMachineInstance, then a pod

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-file-code class="chain__icon" />
    <div class="gpu-caption">VirtualMachine</div>
    <span>The object you declare</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-desktop class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">VirtualMachineInstance</div>
    <span>The running VM</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-cube class="chain__icon" />
    <div class="gpu-caption">virt-launcher pod</div>
    <span>Where the guest runs</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>You declare a VirtualMachine; the cluster runs it in a pod.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
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
Three objects. You write a VirtualMachine. KubeVirt creates a VirtualMachineInstance from it, and the guest runs inside a virt-launcher pod. Why this matters later: a migration moves the instance, so there is a second pod for a moment.

Time: 2 min
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Q2. What runs it?</h1>
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
Second question: what actually runs the VM.

Time: 0.5 min
-->

---

# KubeVirt's controllers and daemons run as pods on your cluster

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Your cluster</div></div>
    <ul class="zone__list">
      <li><ph-brain /><span>virt-controller runs as a pod</span></li>
      <li><ph-plugs /><span>virt-handler runs beside kubelet on each node</span></li>
      <li><ph-package /><span>Installed by an operator</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-desktop class="zone__icon" /><div class="gpu-caption">The VM</div></div>
    <ph-cube class="zone__hero" />
    <p>The guest runs in a virt-launcher pod</p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">What this means</div>
  <p>KubeVirt components run as pods on top of the cluster you already operate.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
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
Nothing special sits outside the cluster. The controller and the node daemon are pods. The node daemon runs beside kubelet. The operator installs them, and that is what we will install in step three of the demo.

Time: 2 min
-->

---

# Hardware virtualization is optional: KVM if you have it, emulation if you do not

<div class="zoom-content">

<div class="modes">
  <div class="gpu-card gpu-card--primary mode" v-click>
    <div class="mode__head"><ph-cpu class="mode__icon" /><code class="mode__name">KVM</code></div>
    <p>Hardware virtualization on the node</p>
    <div class="mode__note">Needs /dev/kvm</div>
  </div>
  <div class="gpu-card gpu-card--accent mode" v-click>
    <div class="mode__head"><ph-code class="mode__icon" /><code class="mode__name">Emulation</code></div>
    <p>Software emulation through useEmulation</p>
    <div class="mode__note">For hosts without KVM</div>
  </div>
  <div class="gpu-card  mode" v-click>
    <div class="mode__head"><ph-laptop class="mode__icon" /><code class="mode__name">This demo</code></div>
    <p>useEmulation is true by default in 03-kubevirt</p>
    <div class="mode__note">A Linux host works with or without /dev/kvm</div>
  </div>
</div>

<aside class="info-card" v-click>
  <p>KubeVirt on kind needs a Linux host; the demo does not support macOS or Windows.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
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
KVM if the node has it, emulation if it does not. The demo project sets useEmulation to true by default, so a Linux host without /dev/kvm still works. Say the limit now: kind with KubeVirt is Linux only.

Time: 1.5 min
-->

---

# Two questions answered, three to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--accent">Q1 · What is a VM?</div><p>Custom resources: VirtualMachine, VirtualMachineInstance, pod</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-cloud class="step-icon" /><div class="gpu-caption gpu-caption--accent">Q2 · What runs it?</div><p>Controllers and daemons as pods; KVM or emulation</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-file-code class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Q3 · Who declares it?</div><p>Open</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-arrows-clockwise class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Q4 · What does migration need?</div><p>Open</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-link class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Q5 · Does a connection survive?</div><p>Open</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
Quick recap. A VM is a custom resource, and its parts run as pods. Three questions left.

Time: 1 min
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Q3. Who declares it?</h1>
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
Third question: who writes this down. Pulumi does.

Time: 0.5 min
-->

---

# A Pulumi program applies KubeVirt resources like any other Kubernetes object

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">The operator</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Release manifest from KubeVirt</li>
      <li>Applied with <code>k8s.yaml.v2.ConfigFile</code></li>
      <li>Pulumi Kubernetes provider</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">KubeVirt and the VM</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Declared as custom resources</li>
      <li><code>k8s.apiextensions.CustomResource</code></li>
      <li>Same program, same <code>pulumi up</code></li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
</style>

<!--
The Pulumi Kubernetes provider already knows how to apply a manifest and how to apply a custom resource. So the operator goes in through ConfigFile and the KubeVirt resource and the VM go in as custom resources. Nothing KubeVirt specific to learn in the tool.

Time: 2 min
-->

---

# The order is the program: cluster, operator, KubeVirt resource, VM

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-cloud class="plan__icon" />
    <p>Cluster: 02-cluster</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-package class="plan__icon" />
    <p>Operator: 03-kubevirt</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-cube class="plan__icon" />
    <p>KubeVirt resource: 03-kubevirt</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-desktop class="plan__icon" />
    <p>VM: 04-vm</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p>Three Pulumi stacks, linked by stack references.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
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
Four things in a fixed order. The cluster first, then the operator, then the KubeVirt resource, then the VM. We split it into three stacks, and the stacks read each other through stack references.

Time: 2 min
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The KubeVirt resource cannot exist before the operator's CRD does.</h1>
</div>

<!--
This is the one ordering rule that bites. The KubeVirt resource is a custom resource, and the cluster only knows that type once the operator has installed it. That is why the order is the program.

Time: 1 min
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Q4. What does live migration need?</h1>
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
Fourth question: what does it take to move a running VM.

Time: 0.5 min
-->

---

# A migration is one object you post to the cluster

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-file-code class="plan__icon" />
    <p>Name the VMI in a VirtualMachineInstanceMigration</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-paper-plane-tilt class="plan__icon" />
    <p>Post it; <code>virtctl migrate</code> does that</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-arrows-clockwise class="plan__icon" />
    <p>KubeVirt moves the VMI to another node</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="4">
  <ph-lightning class="plan__foot-icon" />
  <p>The demo runs <code>virtctl migrate demo-vm</code>.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
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
A migration is an object. You name the instance in a VirtualMachineInstanceMigration and post it. virtctl migrate is a shortcut that creates it. We will use the shortcut in the demo.

Time: 2 min
-->

---

# Live migration has rules about storage, ports and interfaces

<div class="zoom-content">

<div class="bounds">
  <div class="bound" v-click><ph-folder-open /><div class="bound__want">a PVC-backed volume</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">needs ReadWriteMany (RWX)</div></div>
  <div class="bound" v-click><ph-plugs /><div class="bound__want">migration traffic</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">ports 49152 and 49153</div></div>
  <div class="bound" v-click><ph-link /><div class="bound__want">the primary interface</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">same name on both pods</div></div>
  <div class="bound" v-click><ph-globe /><div class="bound__want">bridge binding</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">on the limitations list</div></div>
  <div class="bound" v-click><ph-package /><div class="bound__want">this demo</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">containerDisk: kind local-path is ReadWriteOnce</div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
.bounds { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem 1.4rem; }
.bound { display: grid; grid-template-columns: auto 9.5rem auto 1fr; align-items: center; gap: 0.7rem; padding: 0.8rem 1rem; border: 1.5px solid var(--p-border); border-radius: 14px; background: var(--p-bg-elevated); }
.bound > svg:first-child { font-size: 1.5rem; color: var(--p-primary); }
.bound__want { font-family: var(--slidev-font-mono); font-size: 0.92rem; font-weight: 600; color: var(--p-fg-muted); }
.bound__arrow { font-size: 1.1rem; color: var(--p-accent); }
.bound__by { font-size: 1.05rem; line-height: 1.3; color: var(--p-fg); }
</style>

<!--
These are from the live migration page of the user guide. Storage must be RWX for PVC volumes, two ports must be open, the primary interface needs the same name on both pods, and bridge binding is on the limitations list. Our kind cluster uses local-path, which is ReadWriteOnce, so the demo uses a containerDisk instead.

Time: 2 min
-->

---

# Where this breaks today: hosts, storage, versions and bridge networking

<div class="zoom-content">

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-laptop class="step-icon" /><div class="gpu-caption gpu-caption--muted">Hosts</div><p>kind with KubeVirt is Linux only</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-folder-open class="step-icon" /><div class="gpu-caption gpu-caption--muted">Storage</div><p>local-path is ReadWriteOnce, so no PVC volume migration here</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-list-numbers class="step-icon" /><div class="gpu-caption gpu-caption--muted">Versions</div><p>KubeVirt 1.9 supports Kubernetes 1.34 to 1.36</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-globe class="step-icon" /><div class="gpu-caption gpu-caption--muted">Networking</div><p>Bridge binding is on the limitations list; the demo uses masquerade</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
Be straight about the limits. Our demo is a laptop-scale Linux setup, not a production storage story. Use this slide to say what we did not prove.

Time: 2 min
-->

---

# Four questions answered, one to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--accent">Q1 · What is a VM?</div><p>VirtualMachine, VirtualMachineInstance, pod</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-cloud class="step-icon" /><div class="gpu-caption gpu-caption--accent">Q2 · What runs it?</div><p>Controllers and daemons as pods</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-file-code class="step-icon" /><div class="gpu-caption gpu-caption--accent">Q3 · Who declares it?</div><p>A Pulumi program, three stacks</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-arrows-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--accent">Q4 · What does migration need?</div><p>A migration object, RWX, ports, interface</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-link class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Q5 · Does a connection survive?</div><p>The demo answers this</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
Four of five. The last one we answer by running it.

Time: 1 min
-->

---

# The solution we will build: three Pulumi stacks, one kind cluster, one VM

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-git-pull-request class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Three Pulumi stacks</div></div>
    <ul class="zone__list">
      <li><ph-cloud /><span>02-cluster: the kind cluster</span></li>
      <li><ph-package /><span>03-kubevirt: operator and KubeVirt resource</span></li>
      <li><ph-desktop /><span>04-vm: demo-vm and its Service</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-cube class="zone__icon" /><div class="gpu-caption">One kind cluster</div></div>
    <ph-cube class="zone__hero" />
    <p>Three nodes, one VM, one NodePort Service</p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">The idea</div>
  <p>demo-vm moves between nodes while the Service keeps answering.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
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
This is the picture to keep in your head. Three stacks build up one kind cluster with three nodes. The VM sits behind a NodePort Service, and in the last step we move it.

Time: 2 min
-->

---

# The VM is a few lines of Pulumi

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-file-code />04-vm/index.ts</div>
    <div class="big-code code-sm">

```ts
new k8s.apiextensions.CustomResource("vm", {
  apiVersion: "kubevirt.io/v1",
  kind: "VirtualMachine",
  metadata: { name: vmName },
  spec: { runStrategy: "Always",
    template: { spec: { evictionStrategy: "LiveMigrate", /* … */ } } },
});
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-cube /><span>A custom resource like any other</span></li>
    <li><ph-arrows-clockwise /><span><code>evictionStrategy: "LiveMigrate"</code> prefers migration over deletion</span></li>
    <li><ph-file-code /><span>The rest of the spec sits in the file</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
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
Only slide with program code. It is the real resource from the file, trimmed. Point at runStrategy and at evictionStrategy. Everything else is in the editor when we get there.

Time: 2 min
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: KubeVirt live migration.</h1>
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
Divider. Everything so far was why and how; now we run it.

Time: 0.5 min
-->

---

# What we will do: seven steps to a moved VM

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-check-circle class="step__icon" /><p>The host passes preflight</p></div>
  <div class="gpu-card step" v-click><ph-cloud class="step__icon" /><p>A three-node kind cluster</p></div>
  <div class="gpu-card step" v-click><ph-package class="step__icon" /><p>The KubeVirt operator reaches Deployed</p></div>
  <div class="gpu-card step" v-click><ph-desktop class="step__icon" /><p>demo-vm runs behind a NodePort Service</p></div>
  <div class="gpu-card step" v-click><ph-laptop class="step__icon" /><p>You are inside the guest</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-arrows-clockwise class="step__icon" /><p>The VM changes node, the probe keeps answering</p></div>
  <div class="gpu-card gpu-card--accent step" v-click><ph-check class="step__icon" /><p>Nothing is left behind</p></div>
</div>

<div class="big-code code-sm">

```bash
pulumi up --stack dev
```

</div>

<p class="!text-[1rem] text-[var(--p-fg-muted)]">Steps 02 to 04 each run this in their own folder.</p>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
.steps { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.2rem; }
.step { display: flex; flex-direction: row; align-items: center; gap: 1rem; padding: 1rem 1.3rem; }
.step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.step__icon { font-size: 2rem; color: var(--p-primary); }
</style>

<!--
Seven steps, each one an outcome. The one command you will see over and over is pulumi up with the dev stack, in steps two, three and four, each in its own folder. Do not read the list; say the arc: host, cluster, operator, VM, console, migration, cleanup.

Time: 1.5 min
-->

---

# 01-preflight: the host passes before anything is created

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
01-preflight/preflight.sh
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-desktop /><div><div class="gpu-caption gpu-caption--accent">1 · Host</div><code>The script checks the host and prints what it finds</code></div></div>
  <div class="gpu-card check" v-click><ph-package /><div><div class="gpu-caption gpu-caption--accent">2 · virtctl</div><code>Warns if it is missing</code></div></div>
  <div class="gpu-card check" v-click><ph-cloud /><div><div class="gpu-caption gpu-caption--accent">3 · Images</div><code><code>prepull-images.sh</code> pulls them first</code></div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
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
Preflight first. If it fails, it fails here, in a minute, not halfway through a cluster build. The script checks the host. Run prepull-images.sh next so nobody waits on a download later. If virtctl is missing, say so now.

Time: 3 min
-->

---

# 02-cluster: a three-node kind cluster comes from <code>pulumi up</code>

<div class="zoom-content">

<p class="!text-[1.1rem] !mb-2">Folder: <code>02-cluster/</code></p>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-terminal-window /><span><code>pulumi up</code> creates the kind cluster</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-cube /><span>Three nodes join</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-check-circle /><span>The cluster is ready for the operator</span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">What you should see</div><p>Three nodes in <code>kubectl get nodes</code>.</p></aside>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
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
First stack. Run pulumi up in 02-cluster. While it runs, talk about why kind: it is a local cluster, so everyone can follow. When it finishes, show the three nodes.

Time: 6 min
-->

---

# 03-kubevirt: the operator reaches Deployed

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
kubectl -n kubevirt get kubevirt kubevirt -o jsonpath='{.status.phase}'
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-package /><div><div class="gpu-caption gpu-caption--accent">1 · Operator</div><code>Installed from the release manifest</code></div></div>
  <div class="gpu-card check" v-click><ph-cube /><div><div class="gpu-caption gpu-caption--accent">2 · KubeVirt resource</div><code>Created after the CRD exists</code></div></div>
  <div class="gpu-card check" v-click><ph-check-circle /><div><div class="gpu-caption gpu-caption--accent">3 · Phase</div><code>Reads Deployed</code></div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
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
Second stack: the operator and the KubeVirt resource. Run pulumi up in 03-kubevirt. This is the ordering rule from the slides, live. When it finishes, the phase should read Deployed. It can take a few minutes; fill the time with the Q2 slides in your head, controllers and daemons becoming pods.

Time: 8 min
-->

---

# 04-vm: the VM reaches Running behind a NodePort Service

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />Check</div>
    <div class="big-code code-sm">

```bash
kubectl get vmi
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-file-code /><span>Folder: <code>04-vm/</code>, run <code>pulumi up</code> there</span></li>
    <li><ph-check-circle /><span>The VMI reaches Running</span></li>
    <li><ph-globe /><span>A NodePort Service sits in front</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
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
Third stack: the VM. Run pulumi up in 04-vm, then kubectl get vmi. Open the index.ts in the editor and show the resource from the program-shape slide, plus the Service in front of it.

Time: 7 min
-->

---

# 05-console: you are inside the guest

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-laptop />Console</div>
    <div class="big-code code-sm">

```bash
05-console/console.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-terminal-window /><span>The script runs <code>virtctl console demo-vm</code></span></li>
    <li><ph-check-circle /><span>You get a login prompt in the guest</span></li>
    <li><ph-arrow-right /><span>Exit with Ctrl+] as the script says</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
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
A short step. Open the serial console so people see a real guest OS, not a container. Then get back out; Ctrl and the right bracket, as the script reminds you.

Time: 4 min
-->

---

# 06-live-migration: the VM changes node and the probe keeps answering

<div class="zoom-content">

<p class="!text-[1.1rem] !mb-2">Run <code>06-live-migration/migrate.sh</code> while <code>hold-connection.sh</code> probes in a second terminal</p>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-eye /><span>The probe prints OK with the banner</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-arrows-clockwise /><span><code>virtctl migrate demo-vm</code> starts the migration</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-check-circle /><span>The VM is on another node; the probe still answers</span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Be exact</div><p>Each probe opens a new connection, so this shows the service stays reachable, not one long session.</p></aside>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
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
The payoff. Start hold-connection.sh in a second terminal first and let it print OK a few times. Then run migrate.sh, and use watch-migration.sh to follow it. Say the caveat out loud: each probe opens a new connection, so we show the service stays reachable. That is our honest answer to Q5.

Time: 10 min
-->

---

# 07-teardown: nothing is left behind

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
07-teardown/teardown.sh
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-trash /><div><div class="gpu-caption gpu-caption--accent">1 · Teardown</div><code><code>pulumi destroy --stack dev</code> for 04, 03, 02</code></div></div>
  <div class="gpu-card check" v-click><ph-check-circle /><div><div class="gpu-caption gpu-caption--accent">2 · Verify</div><code><code>verify-clean.sh</code> finds no kind cluster</code></div></div>
  <div class="gpu-card check" v-click><ph-package /><div><div class="gpu-caption gpu-caption--accent">3 · Containers</div><code>No kindest/node or KubeVirt containers left running</code></div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.zoom-content code, .zoom-content p, .zoom-content li, .zoom-content div { overflow-wrap: anywhere; }
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
Clean up with teardown.sh, then run verify-clean.sh. It fails loudly if a kind cluster or a leftover container remains. End on a clean machine.

Time: 3 min
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-4 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/vms-on-kubernetes-kubevirt-live-migration" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → vms-on-kubernetes-kubevirt-live-migration</div>
  </div>
  <div class="res-card">
    <QRCode data="https://kubevirt.io/user-guide/compute/live_migration/" dark="#000000" />
    <div class="res-card__title">KubeVirt user guide: live migration</div>
    <div class="res-card__body">kubevirt.io/user-guide</div>
  </div>
  <div class="res-card">
    <QRCode data="https://kubevirt.io/user-guide/cluster_admin/installation/" dark="#000000" />
    <div class="res-card__title">KubeVirt installation guide</div>
    <div class="res-card__body">kubevirt.io installation</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/registry/packages/kubernetes/" dark="#000000" />
    <div class="res-card__title">Pulumi Kubernetes provider</div>
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
Resources: scan the QR codes. The repo link goes live once the pull request is merged.

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
Where to go next after today.

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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/vms-on-kubernetes-kubevirt-live-migration" dark="#000000" /></div>
      <div class="thanks__qr-label">vms-on-kubernetes-kubevirt-live-migration</div>
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
Thank you. Leave this up for questions; keep the migration probe visible if anyone wants a second look.

Time: 5 min
-->
