---
theme: "@pulumi/slidev-theme"
title: "Provisioning the AI Inference Platform on Kubernetes"
info: |
  Provisioning the AI Inference Platform on Kubernetes: Build GPU node pools, autoscaling and quotas as Pulumi code.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/ai-inference-platform-on-kubernetes
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
    Provisioning the AI Inference Platform on Kubernetes
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Build GPU node pools, autoscaling and quotas as Pulumi code
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
~1 min. Welcome. Name the workshop, the level, and the promise: the platform layer under a GPU inference workload, as Pulumi code.
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
~1 min. Introduce the speaker. Placeholder until the speaker details are filled in.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
~0.5 min. Two quick sections: housekeeping, then the agenda.
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
~1.5 min. Where the repo is, how to ask questions, what you need installed. Say that the demo creates real AWS resources.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>The cost of idle GPUs</li>
  <li>Why the platform layer is hard</li>
  <li>Pulumi and the GPU platform</li>
  <li>The platform we will build</li>
  <li>Live demo on EKS</li>
  <li>Where this stops today</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
~2 min. Walk the agenda in order. Pain first, then the tech, then the build, then the demo. Say that the questions come back before the demo.
-->

---

<!-- pattern: quote-card -->

# 95% of GPU capacity is doing nothing

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">Laurent Gil, Cast AI</div>
    <p>"A GPU sitting idle costs dollars per hour. A CPU sitting idle costs cents. And 95% of GPU capacity is doing nothing."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>Cast AI's 2026 State of Kubernetes Optimization Report</li>
      <li>GPU utilization averaged 5% across the clusters analyzed</li>
      <li>A vendor report, measured on clusters that were not optimized</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span><strong>Source:</strong> Cast AI press release, 2026-04-21 (cast.ai/press-release/2026-state-of-kubernetes-optimization-report)</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
~3 min. Start with the number. Cast AI published its 2026 Kubernetes optimization report in April. Average GPU utilization across the clusters it looked at was 5%. Laurent Gil, the co-founder, put it as: a GPU sitting idle costs dollars per hour, and 95% of GPU capacity is doing nothing.
This is a vendor report. It looked at clusters that were not optimized, tens of thousands of them according to the press release. So read it as "this is what an unmanaged GPU fleet looks like", not as a law of nature.
Ask the room how many run GPU nodes today, and whether anyone knows their utilization. Then go to the next slide.
-->

---

<!-- pattern: big-statement -->

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">A GPU bills for every hour you hold it.</h1>
</div>

<!--
~1 min. Pause on this one. The meter runs while the node exists, not while the model is serving a request.
-->

---

<!-- pattern: big-statement -->

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Your inference traffic uses it for a fraction of that.</h1>
</div>

<!--
~1.5 min. Inference traffic comes in bursts. The node does not. That gap between the two lines is what this workshop is about: capacity that matches demand, and a limit on who can take it.
-->

---

<!-- pattern: compare -->

# An idle GPU costs dollars, an idle CPU costs cents

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">A CPU node</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Idle costs cents per hour</li>
      <li>Runs on any node group</li>
      <li>Nothing to install first</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">A GPU node</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Idle costs dollars per hour</li>
      <li>Needs a GPU node group and image</li>
      <li>Needs a device plugin first</li>
      <li>Requested in limits, whole units only</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
~2 min. The cost line is Gil's: cents against dollars. The rest is why you cannot treat a GPU like a bigger CPU node. You need a node group built for it. Kubernetes does not report the GPU until a device plugin runs. And nothing in the cluster limits who takes the GPU unless you add a limit.
Out of the box, any pod in any namespace can ask for it.
-->

---

<!-- pattern: card-grid -->

# Five questions stand between a ticket and a platform

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--muted">Capacity</div><p>Where does the GPU capacity come from?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-plugs-connected class="step-icon" /><div class="gpu-caption gpu-caption--muted">Visibility</div><p>How does Kubernetes see the GPU?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-scales class="step-icon" /><div class="gpu-caption gpu-caption--muted">Sharing</div><p>Who may take how much?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-arrows-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--muted">Scaling</div><p>When does capacity appear and go away?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-trash class="step-icon" /><div class="gpu-caption gpu-caption--muted">Cleanup</div><p>Is anything left billing when we are done?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
~2.5 min. This is the spine of the next hour. You got the ticket: add GPU inference support. Five questions stand between that ticket and something you would run.
Where does the capacity come from. How does Kubernetes see it. Who may take how much. When does capacity appear and go away. And is anything left billing when we are done.
Tell them we answer the first four with tech, then the fifth one in the demo, last.
-->

---

<!-- pattern: section-opener -->

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Where does the GPU capacity come from?</h1>
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
~0.5 min. Question one. Capacity first, before anything runs on it.
-->

---

<!-- pattern: flow -->

# The GPU node group is one resource in the cluster program

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-cloud class="plan__icon" />
    <p>Pulumi IaC declares the EKS cluster</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-cube class="plan__icon" />
    <p>A node group takes that cluster object</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-lightning class="plan__icon" />
    <p>A GPU instance type and a GPU image</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-arrows-clockwise class="plan__icon" />
    <p>Preview, then <code>pulumi up</code></p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-info class="plan__foot-icon" />
  <p><strong>Our choice:</strong> one config value turns the GPU group on or off.</p>
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
.plan { grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; }
</style>

<!--
~3 min. The pulumi-eks package gives you an eks.Cluster and an eks.ManagedNodeGroup. The node group takes the live cluster object as its argument. It is not a name or an ARN string. In this demo the GPU group lives in the same Pulumi project as the cluster, because we pass the cluster object itself. The package also accepts a core data object, so a split is possible. We keep it simple.
So in the demo, steps one and two are the same project. A config value, gpuNodeGroupEnabled, is what separates "cluster with no GPU nodes" from "cluster with one". Preview first, then up. Nothing here is new if you know Pulumi IaC; the GPU part is the instance type and the image.
-->

---

<!-- pattern: stack -->

# Components hide the wiring, not the choices

<div class="zoom-content">

<div class="compose">
  <div class="compose__stack">
    <div class="gpu-caption">What the EKS component wraps</div>
    <div class="piece piece--mixin" v-click="4"><ph-key />OIDC provider on the cluster</div>
    <div class="piece piece--mixin" v-click="3"><ph-lock-key />node role you pass in</div>
    <div class="piece piece--sandbox" v-click="2"><ph-cube />node groups you add on top</div>
    <div class="piece piece--template" v-click="1"><ph-cloud />eks.Cluster</div>
  </div>
  <ul class="rules" v-click="5">
    <li><ph-cube /><span>The component sets the cluster up with defaults</span></li>
    <li><ph-sliders-horizontal /><span>You still pick instance type, image and taints</span></li>
    <li><ph-package /><span>Same idea as your own <code>ComponentResource</code></span></li>
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
~3 min. A component groups resources into one unit with a few inputs. The EKS package does that for the cluster. It does not make the GPU decisions for you. Instance type, AMI type and taint are still yours, and you will see them in the code in a few minutes.
If you write components yourself, the same rule holds: hide the plumbing, expose the choices people have to make.
-->

---

<!-- pattern: section-opener -->

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How does Kubernetes see the GPU?</h1>
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
~0.5 min. Question two. A GPU node is not enough on its own.
-->

---

<!-- pattern: flow -->

# The device plugin turns a GPU into a schedulable resource

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-cube class="plan__icon" />
    <p>A node with an NVIDIA GPU</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-plugs-connected class="plan__icon" />
    <p>The device plugin runs on that node</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-check-circle class="plan__icon" />
    <p>The node reports <code>nvidia.com/gpu</code></p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-rocket-launch class="plan__icon" />
    <p>The scheduler can place a pod on it</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-package class="plan__foot-icon" />
  <p><strong>Installed with Pulumi:</strong> the Helm v4 <code>Chart</code> resource in the Pulumi Kubernetes provider.</p>
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
.plan { grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; }
</style>

<!--
~3 min. Kubernetes does not know about GPUs by itself. NVIDIA's device plugin runs as a daemon set, finds the GPUs on the node and reports them as nvidia.com/gpu. Only then can a pod ask for one.
We install the plugin with the Helm v4 Chart resource from the Pulumi Kubernetes provider. That is the same resource you would use for any chart, so there is nothing GPU specific on the Pulumi side. In the demo you will see nvidia.com/gpu show up under allocatable on the node.
-->

---

<!-- pattern: compare -->

# GPU requests are whole units in limits

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">CPU and memory</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Requests and limits differ</li>
      <li>Fractions are fine</li>
      <li>Nodes can be overcommitted</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">nvidia.com/gpu</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Set in limits</li>
      <li>A request, if given, must equal the limit</li>
      <li>Whole units, per the Kubernetes docs</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
.zoom-content { zoom: 1.4; }</style>

<!--
~3 min. The Kubernetes docs say GPUs are specified in limits. You can give limits alone and Kubernetes uses the limit as the request. If you give both, they must be equal. You cannot give a request without a limit.
Whole units: the Kubernetes docs say extended resources like GPUs are integers only, cannot be overcommitted, and cannot be shared between containers. That is why one GPU is a coarse thing to hand out, and why the next question matters.
-->

---

<!-- pattern: recap-grid -->

# Two questions covered, three to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--accent">Capacity</div><p>A managed node group in the cluster program</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-plugs-connected class="step-icon" /><div class="gpu-caption gpu-caption--accent">Visibility</div><p>The NVIDIA device plugin, installed with Helm</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-scales class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Sharing</div><p>Who may take how much?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-arrows-clockwise class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Scaling</div><p>When does capacity appear and go away?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-trash class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Cleanup</div><p>Is anything left billing when we are done?</p></div>
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
~0.5 min. Capacity from a node group, visibility from the device plugin. Three left: who may take it, when it scales, and what is left at the end.
-->

---

<!-- pattern: section-opener -->

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Who may take how much?</h1>
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
~0.5 min. Question three.
-->

---

<!-- pattern: zones -->

# A quota makes the namespace the unit of sharing

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-folder-open class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Namespace gpu-workloads</div></div>
    <ul class="zone__list">
      <li><ph-scales /><span>A <code>ResourceQuota</code> declared in Pulumi</span></li>
      <li><ph-cube /><span>GPU requests capped at one</span></li>
      <li><ph-prohibit /><span>A pod asking for two is refused</span></li>
      <li><ph-eye /><span>Refused at admission, before any node moves</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption">The cluster</div></div>
    <ph-cube class="zone__hero" />
    <p>One GPU node, shared by every namespace</p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">What the quota does</div>
  <p>It caps a namespace. It does not reserve a GPU for it.</p>
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
~3.5 min. A ResourceQuota caps what one namespace can request. Ours allows one GPU in gpu-workloads and ten pods. A pod that asks for two is rejected by the API server before it reaches the scheduler.
A quota caps. It does not reserve. Another namespace without a quota can still take the GPU. So you set a quota in every namespace that could ask for one.
We declare it as a Pulumi Kubernetes resource, in its own project that reads the cluster through a stack reference.
-->

---

<!-- pattern: section-opener -->

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">When does capacity appear and go away?</h1>
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
~0.5 min. Question four. So far the GPU node is always on, which is the expensive part.
-->

---

<!-- pattern: flow -->

# Karpenter adds and removes GPU nodes on demand

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-hourglass class="plan__icon" />
    <p>A GPU pod stays pending</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-magnifying-glass class="plan__icon" />
    <p>Karpenter sees a pod the scheduler cannot place</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-rocket-launch class="plan__icon" />
    <p>It launches a node the NodePool allows</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-broom class="plan__icon" />
    <p>It removes the node when it is empty or underused</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-package class="plan__foot-icon" />
  <p><strong>Installed with Pulumi:</strong> a Helm chart plus a NodePool with one GPU instance type.</p>
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
~3.5 min. Karpenter watches for pods the scheduler cannot place. It picks an instance that fits from the NodePool rules, launches it, and later removes it when it is empty or underused. Our NodePool allows one GPU instance type, carries the same taint as the managed group and sets consolidation to when empty or underutilized.
Installing Karpenter is a Helm chart in Pulumi. The part people miss is what the chart does not create. That is the next slide.
-->

---

<!-- pattern: chain -->

# Autoscaling needs AWS permissions before it needs a chart

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-lock-key class="chain__icon" />
    <div class="gpu-caption">AWS side</div>
    <span>Node role, instance profile, interruption queue</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-package class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Karpenter</div>
    <span>Helm chart through Pulumi</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-cube class="chain__icon" />
    <div class="gpu-caption">NodePool</div>
    <span>The rules that launch GPU nodes</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>All three live in one Pulumi project.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-link /><p>Cluster outputs arrive by stack reference</p></div>
  <div class="fact"><ph-seal-check /><p>Preview shows the whole chain</p></div>
  <div class="fact"><ph-clock-clockwise /><p>Order is declared, not scripted</p></div>
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
~3 min. Karpenter needs a node IAM role and instance profile for the nodes it launches, plus an interruption queue. The Helm chart does not create those, so the Pulumi project declares them next to the chart and the NodePool. Pulumi works out the order from the references.
The cluster details, such as the OIDC provider and subnets, come in from the cluster project through a stack reference. That is how four small projects stay connected.
-->

---

<!-- pattern: boundaries -->

# Where this breaks today: serving, sharing and spot

<div class="zoom-content">

<div class="bounds">
  <div class="bound" v-click><ph-cube /><div class="bound__want">model and serving</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Not built here; KServe and Ray Serve manifests are read only</div></div>
  <div class="bound" v-click><ph-package /><div class="bound__want">a Pulumi package</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">None first party that we found; use the Helm and custom resource APIs</div></div>
  <div class="bound" v-click><ph-scales /><div class="bound__want">GPU for a team</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">A quota caps a namespace and reserves nothing</div></div>
  <div class="bound" v-click><ph-lightning /><div class="bound__want">GPU node pool</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">One on-demand instance type; no spot, no GPU sharing</div></div>
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
~1.5 min. Say what this workshop does not do. We build the platform layer. The model and the serving framework are out. The demo shows a KServe and a Ray Serve manifest for orientation, and nothing is applied.
For Pulumi packages, we checked the registry on 24 September and found no first party package for either. If you want them as code, you use the generic Helm and custom resource APIs from the Kubernetes provider, the same way we use them for Karpenter. If that has changed, tell me.
Also: quotas cap and do not reserve, and the demo pool is one on-demand instance type. Spot, GPU sharing and multiple instance types are yours to add.
-->

---

<!-- pattern: recap-grid -->

# Four questions covered, one to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--accent">Capacity</div><p>A managed node group in the cluster program</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-plugs-connected class="step-icon" /><div class="gpu-caption gpu-caption--accent">Visibility</div><p>The NVIDIA device plugin, installed with Helm</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-scales class="step-icon" /><div class="gpu-caption gpu-caption--accent">Sharing</div><p>A ResourceQuota per namespace</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-arrows-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--accent">Scaling</div><p>Karpenter, installed with its AWS prerequisites</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-trash class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Cleanup</div><p>Is anything left billing when we are done?</p></div>
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
~0.5 min. Four answered. The last one, what is still billing at the end, is the last thing the demo does.
-->

---

<!-- pattern: zones -->

# One cluster, one GPU pool, four Pulumi projects

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption gpu-caption--accent">AWS</div></div>
    <ul class="zone__list">
      <li><ph-cube /><span><code>01-cluster</code>: EKS cluster, system nodes, GPU node group</span></li>
      <li><ph-plugs-connected /><span><code>02-device-plugin</code>: NVIDIA device plugin</span></li>
      <li><ph-scales /><span><code>03-quotas</code>: ResourceQuota for <code>gpu-workloads</code></span></li>
      <li><ph-arrows-clockwise /><span><code>04-autoscaling</code>: Karpenter, NodePool, AWS prerequisites</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption">Pulumi Cloud</div></div>
    <ph-link class="zone__hero" />
    <p>Stacks pass cluster outputs along by stack reference</p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">The serving layer</div>
  <p>Plugs in on top. We only read its manifests.</p>
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
~3 min. This is what we will have at the end. Four Pulumi projects, one stack each, named dev. The first holds the cluster and the GPU node group. The next three read the cluster's outputs through a stack reference and add the device plugin, the quota, and Karpenter.
Pulumi Cloud holds the state for each stack and is how the outputs travel. The serving layer sits on top of this and is outside the build.
-->

---

<!-- pattern: big-code -->

# The GPU node group is a handful of declarations

<div class="zoom-content">

<div class="big-code code-sm">

```python
gpu_node_group = eks.ManagedNodeGroup(
    "gpu-node-group",
    cluster=cluster,
    instance_types=["g5.xlarge"],
    ami_type=eks.AmiType.AL2023_X86_64_NVIDIA,
    labels={"workshop-role": "gpu", "nvidia.com/gpu": "true"},
)
```

</div>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
</style>

<!--
~3 min. This is the only program code in the slides. The cluster object goes in as an argument. The instance type is g5.xlarge. The AMI type is the NVIDIA one for Amazon Linux 2023. The label marks the node. The taint, the scaling config and the tags are in the file and left out here.
Open the file in the editor during the demo.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: AI inference platform.</h1>
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
~0.5 min. Switching from slides to the terminal and the editor.
-->

---

<!-- pattern: demo-overview -->

# What we are going to do

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-cube class="step__icon" /><p>The cluster comes up with no GPU nodes</p></div>
  <div class="gpu-card step" v-click><ph-lightning class="step__icon" /><p>One config value adds a GPU node</p></div>
  <div class="gpu-card step" v-click><ph-plugs-connected class="step__icon" /><p>The node reports a GPU the scheduler can use</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-prohibit class="step__icon" /><p>An oversized GPU request is rejected</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-arrows-clockwise class="step__icon" /><p>A pending pod creates a node, idle removes it</p></div>
  <div class="gpu-card step" v-click><ph-books class="step__icon" /><p>The serving layer plugs in here, read only</p></div>
  <div class="gpu-card gpu-card--accent step" v-click><ph-trash class="step__icon" /><p>Teardown leaves nothing billing</p></div>
  <div class="gpu-card step" v-click><ph-terminal-window class="step__icon" /><p>Each step: <code>pulumi up</code> in its folder</p></div>
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
~2 min. Seven steps and one rule. Every project is brought up with pulumi up inside its own folder, so I will not repeat that on each slide. Each slide gives you the folder, the command that shows the result, and what to look for.
The two highlighted ones are where the questions get answered: the quota rejection and the scale up and down. Teardown is last on purpose.
-->

---

<!-- pattern: demo-step -->

# 1 · The cluster comes up with no GPU nodes

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />01-cluster</div>
    <div class="big-code code-sm">

```bash
kubectl get nodes
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-check-circle /><span>Healthy system nodes</span></li>
    <li><ph-prohibit /><span>No GPU node in the list</span></li>
    <li><ph-lock-key /><span>The GPU group exists only when the config says so</span></li>
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
~4 min. Folder 01-cluster. Run pulumi up. It takes a while, so talk through the program while it runs. When it finishes, kubectl get nodes shows the system nodes and no GPU node. That is the starting point: a cluster with no GPU cost.
-->

---

<!-- pattern: demo-step -->

# 2 · One config value adds the GPU node

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />01-cluster</div>
    <div class="big-code code-sm">

```bash
pulumi config set gpuNodeGroupEnabled true
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-sliders-horizontal /><span>Same project, new config value</span></li>
    <li><ph-magnifying-glass /><span>Read the preview: one node group to add</span></li>
    <li><ph-cube /><span>After <code>pulumi up</code>, a g5.xlarge node joins</span></li>
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
~4 min. Same folder, same stack. Set the config value, then preview. The preview should show a node group and little else. Then pulumi up and watch kubectl get nodes until the g5.xlarge node joins. Say again why this is one project: we hand the node group the cluster object.
-->

---

<!-- pattern: demo-checks -->

# 3 · The node reports a GPU the scheduler can use

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
kubectl describe node <gpu-node>
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-plugs-connected /><div><div class="gpu-caption gpu-caption--accent">1 · Allocatable</div><code>nvidia.com/gpu</code></div></div>
  <div class="gpu-card check" v-click><ph-prohibit /><div><div class="gpu-caption gpu-caption--accent">2 · Taint</div><code>nvidia.com/gpu</code></div></div>
  <div class="gpu-card check" v-click><ph-cube /><div><div class="gpu-caption gpu-caption--accent">3 · Label</div><code>workshop-role=gpu</code></div></div>
  <div class="gpu-card check" v-click><ph-desktop /><div><div class="gpu-caption gpu-caption--accent">4 · Instance type</div><code>g5.xlarge</code></div></div>
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
.checks { grid-template-columns: repeat(2, 1fr); }
</style>

<!--
~4 min. Folder 02-device-plugin. Run pulumi up, which installs the chart. Then describe the GPU node and look for nvidia.com/gpu under allocatable. If it is missing, the plugin has not finished starting. Also point at the taint: pods need a toleration to land here, which is on purpose.
-->

---

<!-- pattern: demo-outcome -->

# 4 · An oversized GPU request is rejected

<div class="zoom-content">

<div class="s5__cmd big-code code-sm">

```bash
kubectl apply -f manifests/oversized-gpu-pod.yaml -n gpu-workloads
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-terminal-window /><span>The pod asks for two GPUs</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-scales /><span>The quota allows one in this namespace</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-prohibit /><span>The API server answers: exceeded quota</span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Where it stops</div><p>At admission. No node is touched and nothing is billed.</p></aside>
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
~4 min. Folder 03-quotas. Run pulumi up for the quota, then apply the oversized pod. It asks for two GPUs, the quota allows one, so the API server refuses it with an exceeded quota error. This answers question three. Point out that nothing was scheduled and no node moved.
-->

---

<!-- pattern: demo-checks -->

# 5 · Pending pods create a GPU node and no pods remove it

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
kubectl scale deployment/gpu-echo -n gpu-workloads --replicas=2
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-clock /><div><div class="gpu-caption gpu-caption--accent">1 · Pods</div><code>Pending, then Running</code></div></div>
  <div class="gpu-card check" v-click><ph-rocket-launch /><div><div class="gpu-caption gpu-caption--accent">2 · Nodes</div><code>a new GPU node appears</code></div></div>
  <div class="gpu-card check" v-click><ph-terminal-window /><div><div class="gpu-caption gpu-caption--accent">3 · Pod log</div><code>nvidia-smi -L</code></div></div>
  <div class="gpu-card check" v-click><ph-trash /><div><div class="gpu-caption gpu-caption--accent">4 · Replicas 0</div><code>the node is reclaimed</code></div></div>
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
.checks { grid-template-columns: repeat(2, 1fr); }
</style>

<!--
~4 min. Folder 04-autoscaling. Run pulumi up, apply the gpu-echo deployment at zero replicas, then scale to two. Watch the pods go pending and a node appear. Then scale to zero and watch the node get reclaimed. Consolidation takes a little while, so say so and keep talking. This answers question four.
-->

---

<!-- pattern: demo-step -->

# 6 · The serving layer plugs in here and we only read it

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />05-serving-layer</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-file-code /><span>A KServe <code>InferenceService</code> example</span></li>
    <li><ph-file-code /><span>A Ray Serve <code>RayService</code> example</span></li>
    <li><ph-hand-palm /><span>Illustrative only, never applied</span></li>
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
~2.5 min. Folder 05-serving-layer. Open the two example manifests in the editor. Say plainly that we do not apply them and that Pulumi has no first party package for either that we found. This is where a team would put the serving layer, on the platform we just built.
-->

---

<!-- pattern: demo-outcome -->

# 7 · Teardown leaves nothing billing

<div class="zoom-content">

<div class="s5__cmd big-code code-sm">

```bash
06-teardown/teardown.sh
06-teardown/verify-clean.sh
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-trash /><span>Destroy 04, 03, 02, then 01</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-seal-check /><span>Each stack reports zero resources</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-magnifying-glass /><span>No tagged EC2 instances are left</span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Why the order</div><p>Reverse of dependency: the cluster goes last.</p></aside>
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
~4 min. Run teardown.sh from the workshop root. It destroys the four stacks in reverse order. Then run verify-clean.sh, which checks each stack is empty and looks for EC2 instances tagged for this workshop. This answers question five. If it fails, read the message and rerun teardown.
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-4 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/ai-inference-platform-on-kubernetes" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → ai-inference-platform-on-kubernetes</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/clouds/aws/guides/eks/" dark="#000000" />
    <div class="res-card__title">Pulumi Amazon EKS guide</div>
    <div class="res-card__body">pulumi.com/docs/clouds/aws/guides/eks</div>
  </div>
  <div class="res-card">
    <QRCode data="https://karpenter.sh/docs/concepts/nodepools/" dark="#000000" />
    <div class="res-card__title">Karpenter NodePools</div>
    <div class="res-card__body">karpenter.sh/docs/concepts/nodepools</div>
  </div>
  <div class="res-card">
    <QRCode data="https://github.com/NVIDIA/k8s-device-plugin" dark="#000000" />
    <div class="res-card__title">NVIDIA device plugin</div>
    <div class="res-card__body">github.com/NVIDIA/k8s-device-plugin</div>
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
~1 min. Repo first, then the docs. Everything we ran is in the repo.
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
~1 min. Where to go next: docs, the community Slack, and the registry.
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/ai-inference-platform-on-kubernetes" dark="#000000" /></div>
      <div class="thanks__qr-label">ai-inference-platform-on-kubernetes</div>
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
~10.5 min. Questions. Start with the teardown result and anything that failed.
-->
