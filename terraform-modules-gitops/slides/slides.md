---
theme: "@pulumi/slidev-theme"
title: "Keep your Terraform modules, change the pipeline"
info: |
  Keep your Terraform modules, change the pipeline: Terraform modules in Pulumi with push-to-deploy and drift detection.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/terraform-modules-gitops
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
    Keep your Terraform modules, change the pipeline
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Terraform modules in Pulumi with push-to-deploy and drift detection
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
Welcome. Introduce yourself and the promise: in 90 minutes you take a community Terraform VPC module, run it from a Pulumi TypeScript program next to a native Pulumi resource, deploy it from a git push with short-lived AWS credentials, and detect a console change as drift. Agenda: 25 minutes talk, 55 hands-on, 10 wrap-up.

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
Speaker placeholder: fill in name, role, handles and two lines about why this topic matters to you before delivery.

Time: 0.5 min
-->
---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
Section beat before logistics. Do not linger.

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
Housekeeping: chat tab, Q&A tab, handouts tab with slides and scripts, recording link by email. Remind people to open the prerequisites: AWS account where you can create an OIDC identity provider and IAM roles, AWS CLI, Pulumi Cloud Free, GitHub, Pulumi CLI 3.272.0 or newer, Node 24, git.

Time: 1 min
-->
---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>The pipeline is the problem</li>
  <li>Modules without a rewrite</li>
  <li>Credentials, deploys and drift</li>
  <li>What we build</li>
  <li>The demo</li>
  <li>Wrap-up and Q&A</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
Walk the agenda in six lines: the pipeline problem, modules without a rewrite, credentials, deploys and drift, what we build, the demo, wrap-up. Tell them the hands-on part is 55 minutes and the demo can be followed from the repo folders.

Time: 1 min
-->
---

# At Meta, a one-line Helm values change can take a working day in the Terraform pipeline

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">Abstract of a talk set for 2026-11-11</div>
    <p>"Even a one-line Helm values change can take a working day in our monolithic Terraform pipeline, where one stuck app can block dozens of others."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>About 15 engineers run about 100 Kubernetes clusters for AI research and inference</li>
      <li>Terraform "exceeds expectations at its job: setting up infra"</li>
      <li>The problem is "its side gig: deploying the k8s apps"</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-calendar-blank class="psst__icon" />
  <span><strong>KubeCon + CloudNativeCon North America 2026</strong> keynote, Phong Nguyen and Shaun Hopper, Meta</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
Start with a scene, and be exact about its status. This is the abstract of a keynote that is scheduled for 2026-11-11 at KubeCon + CloudNativeCon North America. The talk has not been given yet. We only quote what the abstract says.
The abstract says about 15 engineers run about 100 Kubernetes clusters for AI research and inference. Terraform does its job of setting up the infrastructure. The trouble is deploying the apps: a one-line Helm values change can take a working day, and one stuck app can block dozens of others.
Ask the room: who has a pipeline where one stuck run blocks everyone behind it? Take hands, then move on.
Source: events.linuxfoundation.org, keynote 1360829.

Time: 1.5 min
-->
---

# Meta left Terraform with the infrastructure and gave the apps to Argo CD and Kargo

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--muted zone" v-click>
    <div class="zone__head"><ph-cube class="zone__icon" /><div class="gpu-caption gpu-caption--muted">Terraform</div></div>
    <ul class="zone__list">
      <li><ph-stack /><span>Sets up the infrastructure for the clusters</span></li>
      <li><ph-download-simple /><span>Installs Argo CD</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-git-branch class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Argo CD and Kargo</div></div>
    <ul class="zone__list">
      <li><ph-rocket-launch /><span>Each app ships on its own</span></li>
      <li><ph-timer /><span>A routine update is live and healthy in minutes</span></li>
    </ul>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">The abstract's own words</div>
  <p>"Terraform didn't get fired, just reorged."</p>
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
The same abstract describes the fix. Terraform keeps what it is good at: setting up the infrastructure for the clusters, and installing Argo CD. Kargo and Argo CD take over the apps, so each app ships on its own and a routine update is live and healthy in minutes.
The abstract's own words: Terraform was not fired, just reorged. It keeps the infrastructure and installs Argo CD, and the loop for the apps changed.
That is the idea for the next 90 minutes, with different tools. Do not say anything about how the Meta talk goes beyond the abstract; it has not been given.

Time: 1 min
-->
---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Your Terraform modules are the asset.</h1>
</div>

<!--
Say it slowly. Years of tested modules: VPCs, clusters, IAM. This is the part worth keeping.

Time: 0.5 min
-->
---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The pipeline around them is the liability.</h1>
</div>

<!--
The pipeline is the cron job, the shared state, the run that blocks the next one. Pause after this line, then go to the contrast.

Time: 0.5 min
-->
---

# Rewriting the modules to change the pipeline is a cost most teams will not pay

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Rewrite the modules</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Port every module to something new</li>
      <li>Re-test what already works</li>
      <li>Pay before the pipeline changes</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Keep the modules</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Modules run as they are</li>
      <li>Real code goes next to them</li>
      <li>Credentials, deploys and drift change</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
Before: to change the pipeline, rewrite the modules. After: keep the modules, change the loop around them. Most teams will not pay for the rewrite, so the pipeline stays as it is.

Exercise, two minutes, on paper or in the chat: draw your pipeline. Boxes for plan, approve, apply, and where the credentials live. Mark the step that blocks others. Mark where you would learn that the cloud changed. Keep the drawing; we come back to it at the end.
If the room is quiet, take one volunteer and draw theirs on the shared screen.

Time: 1.5 min
-->
---

# Six questions decide whether you can keep the modules and change the pipeline

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-stack class="step-icon" /><div class="gpu-caption gpu-caption--muted">Modules</div><p>Can I use my Terraform modules without rewriting them?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-puzzle-piece class="step-icon" /><div class="gpu-caption gpu-caption--muted">Extend</div><p>Can I extend what the module builds with real code?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--muted">Credentials</div><p>How do deployments get credentials without stored keys?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-git-pull-request class="step-icon" /><div class="gpu-caption gpu-caption--muted">Pipeline</div><p>What replaces the cron job?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-currency-dollar class="step-icon" /><div class="gpu-caption gpu-caption--muted">Cost</div><p>What does this cost, and which edition do I need?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-git-diff class="step-icon" /><div class="gpu-caption gpu-caption--muted">Drift</div><p>How do I know when the cloud moved under me?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
These six questions are the spine of the talk. Read them in order, one per click: modules without a rewrite, real code next to a module, credentials without stored keys, what replaces the cron job, what it costs, and how you know the cloud moved.
Act 2 takes them in this order, with a recap halfway. The demo answers the last one: you cause drift and catch it.
Prerequisites reminder if anyone just joined: an AWS account where you can create an OIDC identity provider and IAM roles, the AWS CLI, Pulumi Cloud on the Free tier, GitHub, Pulumi CLI 3.272.0 or newer, Node 24 and git.

Time: 1.5 min
-->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Can I use my Terraform modules without rewriting them?</h1>
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
Question one. Short beat: the answer is yes, and the next slide shows how.

Time: 0.25 min
-->
---

# The hcl package runs a Terraform module as a Pulumi component, pinned to a version

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-package class="chain__icon" />
    <div class="gpu-caption">Registry module</div>
    <span>terraform-aws-modules/vpc/aws</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-plugs-connected class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">hcl package</div>
    <span>One command adds it, version pinned</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-code class="chain__icon" />
    <div class="gpu-caption">Typed SDK</div>
    <span>Import it in TypeScript</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="4" />
  <div class="gpu-card chain__node" v-click="4">
    <ph-cloud-check class="chain__icon" />
    <div class="gpu-caption">Pulumi Cloud</div>
    <span>The module is one component in your stack</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="5">
  <p>Your module stays a Terraform module. Pulumi runs it and records the result as a component.</p>
</aside>

<div class="facts" v-click="6">
  <div class="fact"><ph-push-pin /><p>Pinned to a version, 6.7.3 in the demo</p></div>
  <div class="fact"><ph-terminal-window /><p>The package installs OpenTofu to run it</p></div>
  <div class="fact"><ph-database /><p>State lives in Pulumi Cloud</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.chain { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.8rem; }
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
.fact p { margin: 0 !important; font-size: 1.05rem; line-height: 1.35;  }
.fact small { display: block; font-size: 0.9rem; color: var(--p-fg-muted); margin-top: 0.2rem; }
</style>

<!--
This is the answer to question one. The hcl package takes a module from the Terraform registry and gives you a typed SDK for it. You import it in TypeScript like any other package.
Underneath, the package installs OpenTofu and runs the module. The module's resources show up under one component in your stack, and the state lives in Pulumi Cloud, not in a state bucket you run.
Pin the version. We pin 6.7.3 of the community VPC module, and the generated SDK stays out of git; a fresh checkout gets it back with pulumi install.
This is also where Pulumi IaC in two minutes fits: a program, a stack, a preview and an update. You see all four in the demo.
Source: pulumi.com/docs/integrations/terraform/modules and the hcl package page, read 2026-10-27.

Time: 1.5 min
-->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Can I extend what the module builds with real code?</h1>
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
Question two. The module builds a VPC. What if you want a security group that the module does not create?

Time: 0.25 min
-->
---

# A native resource takes a module output like any other input

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-stack class="chain__icon" />
    <div class="gpu-caption">VPC module</div>
    <span>Outputs the VPC id</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-arrow-fat-right class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">vpcId output</div>
    <span>Read in TypeScript</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-shield-check class="chain__icon" />
    <div class="gpu-caption">Native security group</div>
    <span>aws.ec2.SecurityGroup in that VPC</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="4" />
  <div class="gpu-card chain__node" v-click="4">
    <ph-database class="chain__icon" />
    <div class="gpu-caption">One stack</div>
    <span>One preview, one state</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="5">
  <p>The module and your own resources depend on each other, and Pulumi tracks it.</p>
</aside>

<div class="facts" v-click="6">
  <div class="fact"><ph-graph /><p>Dependencies run across the boundary</p></div>
  <div class="fact"><ph-code /><p>Plain TypeScript, loops and config</p></div>
  <div class="fact"><ph-eye /><p>One preview shows both</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.chain { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.8rem; }
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
.fact p { margin: 0 !important; font-size: 1.05rem; line-height: 1.35;  }
.fact small { display: block; font-size: 0.9rem; color: var(--p-fg-muted); margin-top: 0.2rem; }
</style>

<!--
Question two. The module output is a value like any other. You pass the VPC id to a native aws.ec2.SecurityGroup and an SSM parameter, and Pulumi tracks the dependency across the boundary.
One preview shows module resources and native resources together. One state holds them. When the module changes, the security group knows.
Mention that the same program can use loops, config and functions around the module.
Open question to keep in mind: we have not yet confirmed that the Deployments executor runs hcl packages. We come to that on the breaks slide.

Time: 1.5 min
-->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How do deployments get credentials without stored keys?</h1>
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
Question three. Where do the credentials come from when no laptop is involved?

Time: 0.25 min
-->
---

# Pulumi ESC swaps stored AWS keys for a short-lived OIDC login

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card gpu-card--primary chain__node" v-click="1">
    <ph-lock-key class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">ESC environment</div>
    <span>aws-login provider</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card chain__node" v-click="2">
    <ph-identification-card class="chain__icon" />
    <div class="gpu-caption">OIDC token</div>
    <span>Issued by Pulumi Cloud</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-user-gear class="chain__icon" />
    <div class="gpu-caption">AWS IAM role</div>
    <span>Trusts the Pulumi identity provider</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="4" />
  <div class="gpu-card chain__node" v-click="4">
    <ph-timer class="chain__icon" />
    <div class="gpu-caption">Short-lived credentials</div>
    <span>Expire on their own</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="5">
  <p>No access key sits in a secret store, a CI variable or your shell.</p>
</aside>

<div class="facts" v-click="6">
  <div class="fact"><ph-stack /><p>Attached to the stack with an environment block</p></div>
  <div class="fact"><ph-rocket-launch /><p>Deployments read the same block</p></div>
  <div class="fact"><ph-warning /><p>One identity provider per URL per account</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.chain { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.8rem; }
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
.fact p { margin: 0 !important; font-size: 1.05rem; line-height: 1.35;  }
.fact small { display: block; font-size: 0.9rem; color: var(--p-fg-muted); margin-top: 0.2rem; }
</style>

<!--
Question three. A Pulumi ESC environment uses the aws-login provider. Pulumi Cloud issues an OIDC token, AWS trusts the Pulumi identity provider, and a role hands out short-lived credentials. No access key is stored anywhere.
In the demo there are two paths. Path A is pulumi env setup aws, which is experimental: it creates the identity provider, the role and the environment. Path B is the console steps from the ESC guide, then an environment from a file. Say that Path A is experimental, out loud.
Gotcha: AWS allows one OIDC identity provider per URL per account. If someone already has one for api.pulumi.com/oidc, reuse it instead of creating a second.
The role in the demo uses AdministratorAccess because the Pulumi docs call it out for Deployments. In a shared sandbox, scope it down.
Sources: ESC aws-login provider and the OIDC for AWS guide, read 2026-10-27.

Time: 1.5 min
-->
---

# Three questions answered, three to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-stack class="step-icon" /><div class="gpu-caption gpu-caption--accent">Modules</div><p>An hcl package runs the module, pinned</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-puzzle-piece class="step-icon" /><div class="gpu-caption gpu-caption--accent">Extend</div><p>Native resources take module outputs</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">Credentials</div><p>Pulumi ESC and OIDC, short-lived</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-git-pull-request class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Pipeline</div><p>What runs instead of the cron job?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-currency-dollar class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Cost</div><p>Which edition do I need?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-git-diff class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Drift</div><p>How do I know the cloud moved?</p></div>
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
Recap. Modules run as they are. Native code goes next to them. Credentials are short-lived. Three left: what replaces the cron job, what it costs, and how we know the cloud moved.

Time: 0.5 min
-->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What replaces the cron job?</h1>
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
Question four. In the Meta abstract, Argo CD and Kargo took over the apps. Here the loop is a git push.

Time: 0.25 min
-->
---

# A push to main runs the update and a pull request runs a preview

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-git-pull-request class="plan__icon" />
    <p>Open a pull request</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-eye class="plan__icon" />
    <p>A preview runs and shows the diff</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-git-merge class="plan__icon" />
    <p>Merge to main</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-rocket-launch class="plan__icon" />
    <p>An update runs in Pulumi Cloud</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-key class="plan__foot-icon" />
  <p><strong>Same credentials:</strong> the deployment reads the ESC environment from the stack config.</p>
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
Question four. Pulumi Cloud Deployments, with the Pulumi GitHub app: a pull request runs a preview, a push to main runs the update. The preview is posted as a comment on the pull request, so the diff is reviewed before anything changes.
The deployment reads the environment block from the stack config, so the ESC credentials from step 5 apply with no further settings.
Gotchas to say out loud: installing the GitHub app needs admin rights in both the GitHub and the Pulumi organization. If a participant has no org admin, use a personal private repository. Use a private repository either way: the stack config holds your public IP.
Source: Deployments settings docs, read 2026-10-27.

Time: 1.5 min
-->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What does this cost, and which edition do I need?</h1>
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
Question five. People ask this in the first five minutes, so answer it before the demo.

Time: 0.25 min
-->
---

# The loop in this workshop runs on Free, and scheduled drift detection needs Pro or Enterprise

<div class="zoom-content">

<div class="modes">
  <div class="gpu-card gpu-card--primary mode" v-click>
    <div class="mode__head"><ph-rocket-launch class="mode__icon" /><span class="mode__name">Free</span></div>
    <p>Push-to-deploy and previews</p>
    <div class="mode__track"><i /><i /><i /><i /><ph-check-circle /></div>
    <div class="mode__note">Plus ESC credentials and state in Pulumi Cloud</div>
  </div>
  <div class="gpu-card mode" v-click>
    <div class="mode__head"><ph-terminal-window class="mode__icon" /><span class="mode__name">Drift by CLI</span></div>
    <p>You run the check</p>
    <div class="mode__track"><i /><i /><i /><i /><ph-check-circle /></div>
    <div class="mode__note">A command in CI or by hand</div>
  </div>
  <div class="gpu-card gpu-card--accent mode" v-click>
    <div class="mode__head"><ph-calendar-check class="mode__icon" /><span class="mode__name">Pro or Enterprise</span></div>
    <p>Drift runs on a schedule</p>
    <div class="mode__track"><i /><i /><ph-clock /><i /><ph-clock /></div>
    <div class="mode__note">Presenter shows it on a trial</div>
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
Question five. What the Free tier covers for this loop: Pulumi Cloud state, ESC, and Deployments for push-to-deploy and pull request previews. Pulumi Deployments is on the Free tier within 500 workflow minutes. Check pulumi.com/pricing, read 2026-10-27, for the current numbers before you quote any.
Drift by CLI needs no schedule: you run the check yourself, in CI or by hand. A scheduled drift run is a Pro or Enterprise feature. The presenter shows it on a Pro trial; participants on Free will not see it, and that is expected.
Cost of the demo stack: no NAT gateway and no public IPv4 address, so there are no instance or NAT charges. We have not measured the cost; confirm on the AWS bill after the dry run.

Time: 1 min
-->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How do I know when the cloud moved under me?</h1>
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
Question six, and the one the demo answers last.

Time: 0.25 min
-->
---

# Drift is the gap between what the stack recorded and what the cloud holds

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-file-code class="chain__icon" />
    <div class="gpu-caption">Your program</div>
    <span>What you want</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-database class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Stack state</div>
    <span>What Pulumi recorded</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-cloud class="chain__icon" />
    <div class="gpu-caption">AWS</div>
    <span>What is really there</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>A console change moves the cloud. The program and the recorded state stay where they were.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-hand-pointing /><p>A tag added in the console</p></div>
  <div class="fact"><ph-arrows-clockwise /><p>A refresh reads the cloud into the state</p></div>
  <div class="fact"><ph-git-diff /><p>The diff is the drift</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
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
.fact p { margin: 0 !important; font-size: 1.05rem; line-height: 1.35;  }
.fact small { display: block; font-size: 0.9rem; color: var(--p-fg-muted); margin-top: 0.2rem; }
</style>

<!--
Three things can disagree: your program, the state Pulumi recorded, and what is actually in AWS. A console change moves the third one and leaves the others where they were. That gap is drift.
Pulumi can read the cloud and compare it with the state. In the demo the change is small: a tag on the security group, added outside Pulumi.
Sources: the drift pages in the Deployments docs and in stack management, read 2026-10-27.

Time: 1.5 min
-->
---

# One CLI command turns drift into a non-zero exit code

<div class="zoom-content">

<div class="term">
  <div class="term__bar"><span /><span /><span /><div class="term__title">pulumi refresh</div></div>
  <div class="term__row term__row--demo" v-click>
    <code class="term__flag">--preview-only</code>
    <div class="term__desc">reads the cloud, changes nothing</div>
  </div>
  <div class="term__row term__row--demo" v-click>
    <code class="term__flag">--expect-no-changes</code>
    <div class="term__desc">exits non-zero when anything differs</div>
  </div>
  <div class="term__row term__row--demo" v-click>
    <code class="term__flag">up --refresh</code>
    <div class="term__desc">brings the cloud back to the code</div>
  </div>
</div>

<div class="acp" v-click><ph-calendar-check />On Pro or Enterprise the same check runs on a schedule</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.term { border: 1.5px solid var(--p-border); border-radius: 16px; overflow: hidden; background: var(--p-bg-elevated); }
.term__bar { display: flex; align-items: center; gap: 0.45rem; padding: 0.7rem 1.1rem; border-bottom: 1px solid var(--p-border); }
.term__bar > span { width: 0.7rem; height: 0.7rem; border-radius: 999px; background: var(--p-border); }
.term__title { margin-left: 0.6rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 600; color: var(--p-fg-muted); }
.term__row { display: grid; grid-template-columns: 15rem 1fr; align-items: center; gap: 1.2rem; padding: 0.75rem 1.4rem; border-left: 4px solid transparent; }
.term__row + .term__row { border-top: 1px solid var(--p-border); }
.term__row--demo { border-left-color: var(--p-primary); background: var(--p-bg); }
.term__flag { font-size: 1.2rem !important; font-weight: 600; background: transparent !important; padding: 0 !important; }
.term__row:not(.term__row--demo) .term__flag { color: var(--p-fg-muted) !important; }
.term__vals { display: flex; gap: 0.5rem; }
.term__vals span { font-family: var(--slidev-font-mono); font-size: 1rem; padding: 0.2rem 0.7rem; border-radius: 999px; border: 1px solid var(--p-border); color: var(--p-fg); background: var(--p-bg-elevated); }
.term__desc { font-size: 1.2rem; color: var(--p-fg); }
.term__row:not(.term__row--demo) .term__desc { color: var(--p-fg-muted); }
.acp { display: flex; align-items: center; gap: 0.7rem; margin-top: 1.4rem; font-size: 1.2rem; color: var(--p-fg); }
.acp svg { font-size: 1.5rem; color: var(--p-accent); }
</style>

<!--
The check is one command: pulumi refresh with --preview-only and --expect-no-changes. It reads the cloud, shows the diff, changes nothing, and exits non-zero when anything differs. Put it in CI and drift fails a build.
To reconcile, run pulumi up --refresh: it brings the cloud back to what the code says.
On Pro or Enterprise, the same check runs on a schedule, with optional auto-remediation, which runs pulumi up --refresh. The presenter shows that in the console.
Sources: drift docs, read 2026-10-27.

Time: 1 min
-->
---

# Where this breaks today: four things can stop you, and each has a fallback

<div class="zoom-content">

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-hourglass class="step-icon" /><div class="gpu-caption gpu-caption--muted">Not yet confirmed</div><p>hcl in the Deployments executor. Fallback: an executor image with OpenTofu, or a native-only stack</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-folder-dashed class="step-icon" /><div class="gpu-caption gpu-caption--muted">Not yet confirmed</div><p>The executor may not regenerate the ignored <code>sdks/</code> folder. Fallback: <code>pulumi install</code> as a pre-run command</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-identification-badge class="step-icon" /><div class="gpu-caption gpu-caption--muted">One per account</div><p>AWS allows one OIDC identity provider per URL. Reuse yours</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-lock-key-open class="step-icon" /><div class="gpu-caption gpu-caption--muted">Needs admins</div><p>The GitHub app needs org admin. Fallback: a personal private repository</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
State what we have not proven. This workshop was built on a machine without a Pulumi Cloud login or AWS credentials. Type-checks, an install from a clean copy and previews against a local backend ran. Pulumi up, ESC, Deployments, drift and teardown have not been run end to end.
Open question one: does a deployment that uses the hcl package succeed in the Deployments executor? The package docs do not say. Step 6 is the test. Fallbacks: a custom executor image that carries OpenTofu (Settings, Deploy, Advanced settings; private ECR is not supported for these images), or run steps 6 and 7 against a native-only stack.
Open question two: does the executor regenerate the ignored sdks folder? If not, add pulumi install as a pre-run command in the deployment settings.
Also: one OIDC identity provider per URL per account. The GitHub app needs org admin; use a personal private repository if you do not have it. pulumi env setup aws is experimental, so the console path is the backup. The module is pinned to 6.7.3 so a new release cannot change the demo. Scheduled drift is Pro or Enterprise; the presenter is on a trial.
Backup: a pre-built repository with the app installed, and a recording of steps 6 and 7.

Time: 1.5 min
-->
---

# Five questions answered, one to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-stack class="step-icon" /><div class="gpu-caption gpu-caption--accent">Modules</div><p>An hcl package runs the module, pinned</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-puzzle-piece class="step-icon" /><div class="gpu-caption gpu-caption--accent">Extend</div><p>Native resources take module outputs</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">Credentials</div><p>Pulumi ESC and OIDC, short-lived</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-git-pull-request class="step-icon" /><div class="gpu-caption gpu-caption--accent">Pipeline</div><p>Push-to-deploy and pull request previews</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-currency-dollar class="step-icon" /><div class="gpu-caption gpu-caption--accent">Cost</div><p>Free runs the loop, scheduled drift needs Pro</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-git-diff class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Drift</div><p>How do I know the cloud moved?</p></div>
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
Five answered. The last one, how do I know when the cloud moved, we answer by doing it: you cause drift and you catch it in step 7. Next, one picture of what we build.

Time: 0.5 min
-->
---

# By the end you have a module, a native resource, ESC credentials and a push that deploys

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-github-logo class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Your repository</div></div>
    <ul class="zone__list">
      <li><ph-file-ts /><span>A TypeScript program</span></li>
      <li><ph-stack /><span>The VPC module, pinned</span></li>
      <li><ph-shield-check /><span>A native security group</span></li>
      <li><ph-git-pull-request /><span>A push or a pull request</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrow-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption">Pulumi Cloud</div></div>
    <ul class="zone__list">
      <li><ph-database /><span>Stack state</span></li>
      <li><ph-lock-key /><span>ESC credentials</span></li>
      <li><ph-rocket-launch /><span>Deployments</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrow-right /></div>
  <div class="gpu-card gpu-card--accent zone zone--cloud" v-click>
    <div class="zone__head"><ph-cloud-check class="zone__icon" /><div class="gpu-caption gpu-caption--accent">AWS us-west-2</div></div>
    <ul class="zone__list">
      <li><ph-network /><span>VPC and subnets</span></li>
      <li><ph-shield-check /><span>Security group</span></li>
    </ul>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">The loop</div>
  <p>Change in git, preview in the pull request, update on merge, drift check when the cloud moves.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.1; }
.setup { margin-top: 2.5rem; display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: stretch; gap: 1.25rem; }
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
Here is what you will have at the end. A repository with a TypeScript program: the pinned VPC module and a native security group. Pulumi Cloud holds the state, the ESC credentials and the deployments. AWS in us-west-2 holds the VPC, subnets and security group.
The loop on the bottom: change in git, preview in the pull request, update on merge, and a drift check when the cloud moves. No program code on the slide; the editor shows it in the demo.
Region is us-west-2 throughout. Ready? Next is the divider, then the demo.

Time: 1.5 min
-->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Terraform modules in Pulumi.</h1>
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
Divider. Say that from here we type commands. Each numbered folder is the whole project at the end of that step.

Time: 0.5 min
-->
---

# What we are going to do

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-check-circle class="step__icon" /><p>0 · Preflight passes</p></div>
  <div class="gpu-card step" v-click><ph-folder-simple-plus class="step__icon" /><p>1 · An empty TypeScript project</p></div>
  <div class="gpu-card step" v-click><ph-package class="step__icon" /><p>2 · The module becomes a pinned package</p></div>
  <div class="gpu-card step" v-click><ph-network class="step__icon" /><p>3 · The module builds a VPC</p></div>
  <div class="gpu-card step" v-click><ph-shield-check class="step__icon" /><p>4 · A native security group joins it</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-lock-key class="step__icon" /><p>5 · A short-lived role replaces keys</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-git-pull-request class="step__icon" /><p>6 · A push deploys, a pull request previews</p></div>
  <div class="gpu-card gpu-card--accent step" v-click><ph-git-diff class="step__icon" /><p>7 · A console change shows up as drift</p></div>
  <div class="gpu-card step" v-click><ph-trash class="step__icon" /><p>8 · Teardown leaves nothing behind</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem; }
.step { display: flex; flex-direction: column; gap: 0.7rem; padding: 1.2rem 1.3rem; }
.step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.step__icon { font-size: 2rem; color: var(--p-primary); }
</style>

<!--
Nine outcomes, in order. Steps 0 to 4 build the program, 5 adds credentials, 6 deploys from git, 7 is drift, 8 cleans up. Each folder in the repo is the whole project as it looks at the end of that step, so anyone who falls behind copies the next folder forward.
Set WORKSHOP to the path of the workshop folder and stay in us-west-2. Say that steps 5 to 8 need a real Pulumi Cloud organization and AWS account; the presenter has a pre-built repository and a recording as backup.
Stay on this slide for a minute and a half, then start.

Time: 1.5 min
-->
---

# A passing preflight and an empty project are the starting line (steps 0 and 1)

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-check-circle />step 0 · once</div>
    <div class="big-code code-sm">

```bash
"$WORKSHOP"/00-preflight/preflight.sh
```

</div>
    <div class="s1__label"><ph-folder-simple-plus />step 1 · new project</div>
    <div class="big-code code-sm">

```bash
pulumi new typescript --name tf-modules-gitops --stack dev --yes
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-list-checks /><span>Preflight checks CLI versions, Node, AWS CLI and logins</span></li>
    <li><ph-map-pin /><span>Region is us-west-2, @pulumi/aws pinned</span></li>
    <li><ph-cube /><span>One resource: the stack</span></li>
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
Step 0 runs once: the preflight script checks CLI versions, Node, the AWS CLI, the Pulumi Cloud login and AWS credentials. If it fails, fix it now; everything after depends on it.
Step 1: a new TypeScript project, named tf-modules-gitops, stack dev. Then in the README: install @pulumi/aws pinned to 7.51.1, set aws:region to us-west-2, and run a preview, which shows one resource, the stack.
Versions to have: Pulumi CLI 3.272.0 or newer, @pulumi/pulumi 3.272.0, Node 24. Anyone behind copies folder 01.
Fallback: if someone cannot log in to Pulumi Cloud or AWS, pair them with a neighbor and let them watch.

Time: 5 min
-->
---

# One command turns a registry module into a pinned package, and pulumi up builds the VPC (steps 2 and 3)

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-package />step 2 · add the module</div>
    <div class="big-code code-sm">

```bash
pulumi package add hcl module terraform-aws-modules/vpc/aws 6.7.3
```

</div>
    <div class="s1__label"><ph-rocket-launch />step 3 · use the module</div>
    <div class="big-code code-sm">

```bash
pulumi up
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-file-text /><span>Pulumi.yaml gets a packages entry, version 6.7.3</span></li>
    <li><ph-folder /><span>The SDK is generated under sdks/, not committed</span></li>
    <li><ph-network /><span>Two public subnets, no NAT gateway</span></li>
    <li><ph-stack /><span>The resources sit under one component</span></li>
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
Step 2: pulumi package add with hcl, module, the registry address and the version. Show the packages entry in Pulumi.yaml: source, the hcl version 0.18.4, module, 6.7.3. The generated SDK lands in sdks/vpc-aws; it is about 70 MB and not committed. A fresh checkout gets it back with pulumi install.
Step 3: copy index.ts from folder 03. The module builds a VPC with two public subnets and no NAT gateway. pulumi up, then pulumi stack: the module resources are listed under one vpc-aws component. Optional check with the AWS CLI against us-west-2.
Preview resolves the real module from the Terraform registry; that ran on the build machine. pulumi up itself has not run end to end, so keep folder 03 and the recording ready.
Pinned to 6.7.3 so a new release cannot change the demo. Anyone behind copies folder 03.

Time: 8 min
-->
---

# A native security group reads the module's VPC id and lives in the same stack (step 4)

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
pulumi preview --diff
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-shield-check /><div><div class="gpu-caption gpu-caption--accent">1 · Security group</div><code>aws.ec2.SecurityGroup</code></div></div>
  <div class="gpu-card check" v-click><ph-network /><div><div class="gpu-caption gpu-caption--accent">2 · VPC id</div><code>vpcId</code> from the module</div></div>
  <div class="gpu-card check" v-click><ph-sliders-horizontal /><div><div class="gpu-caption gpu-caption--accent">3 · Your IP</div><code>allowedCidr</code>, a /32</div></div>
  <div class="gpu-card check" v-click><ph-text-aa /><div><div class="gpu-caption gpu-caption--accent">4 · Parameter</div>An SSM parameter too</div></div>
  <div class="gpu-card check" v-click><ph-database /><div><div class="gpu-caption gpu-caption--accent">5 · One state</div>Same stack as the module</div></div>
  <div class="gpu-card check" v-click><ph-rocket-launch /><div><div class="gpu-caption gpu-caption--accent">6 · Apply</div><code>pulumi up</code></div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.checks { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.9rem; }
.checks__cmd { margin-bottom: 1.1rem; }
.checks__cmd pre { margin: 0 !important; white-space: pre-wrap; }
.check { display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.2rem; }
.check > svg { flex-shrink: 0; font-size: 1.9rem; color: var(--p-primary); }
.check code { display: inline-block; margin-top: 0.4rem; font-size: 0.9rem !important; background: var(--p-bg) !important; }
.checks__note { display: flex; align-items: center; gap: 0.7rem; margin-top: 1.3rem; }
.checks__icon { font-size: 1.4rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
Step 4: copy index.ts and Pulumi.dev.yaml from folder 04. Set allowedCidr to your own public IP as a /32; the README fetches it from checkip.amazonaws.com. Run pulumi preview --diff: the security group and the SSM parameter depend on the module's vpcId output. Then pulumi up.
Point at the dependency in the diff: the native resources wait for the module. This is question two, answered with code.
Not run end to end yet. If pulumi up fails here, the preview already proves the wiring: 15 resources planned against a local backend with dummy credentials.
Anyone behind copies folder 04.

Time: 7 min
-->
---

# A short-lived role replaces the AWS keys in your shell (step 5)

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
pulumi env setup aws --policy AdministratorAccess
pulumi env run <org>/tf-modules-gitops/aws-oidc -- aws sts get-caller-identity
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-identification-card /><div><div class="gpu-caption gpu-caption--accent">1 · Identity provider</div><code>api.pulumi.com/oidc</code></div></div>
  <div class="gpu-card check" v-click><ph-user-gear /><div><div class="gpu-caption gpu-caption--accent">2 · IAM role</div>Trusts that provider</div></div>
  <div class="gpu-card check" v-click><ph-lock-key /><div><div class="gpu-caption gpu-caption--accent">3 · ESC environment</div><code>aws-oidc</code></div></div>
  <div class="gpu-card check" v-click><ph-plus-circle /><div><div class="gpu-caption gpu-caption--accent">4 · Attach it</div><code>pulumi config env add</code></div></div>
  <div class="gpu-card check" v-click><ph-user-check /><div><div class="gpu-caption gpu-caption--accent">5 · Who am I</div>The role, not your user</div></div>
  <div class="gpu-card check" v-click><ph-terminal-window /><div><div class="gpu-caption gpu-caption--accent">6 · New shell</div>No <code>AWS_*</code> variables</div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.checks { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.9rem; }
.checks__cmd { margin-bottom: 1.1rem; }
.checks__cmd pre { margin: 0 !important; white-space: pre-wrap; }
.check { display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.2rem; }
.check > svg { flex-shrink: 0; font-size: 1.9rem; color: var(--p-primary); }
.check code { display: inline-block; margin-top: 0.4rem; font-size: 0.9rem !important; background: var(--p-bg) !important; }
.checks__note { display: flex; align-items: center; gap: 0.7rem; margin-top: 1.3rem; }
.checks__icon { font-size: 1.4rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
Step 5. Path A: pulumi env setup aws with the AdministratorAccess policy. It is experimental, and it needs CLI 3.261.0 or newer. It creates the identity provider, the IAM role and the ESC environment. Path B: create the provider and role in the AWS console from the ESC OIDC guide, then run create-env.sh with your org and role ARN.
Either way, attach the environment: pulumi config env add tf-modules-gitops/aws-oidc. Check with pulumi env run and aws sts get-caller-identity: it shows the role, not your user. Then open a new shell with no AWS_ variables and run pulumi up: it still works.
Name check: Path A names the environment it creates. If it is not tf-modules-gitops/aws-oidc, use the name it printed in the environment block of Pulumi.dev.yaml.
Gotchas: AWS allows one provider per URL per account; the presenter's sandbox already has the Pulumi one, so creation is skipped. AdministratorAccess is the policy the docs call out for Deployments; scope it down in a shared account.
ESC has not run end to end on the build machine. If it fails, use the presenter's pre-built environment and recording.

Time: 10 min
-->
---

# A push to main deploys, and a pull request gets a preview (step 6)

<div class="zoom-content">

<div class="s5__cmd big-code code-sm">

```bash
git push -u origin add-deploy-tag
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-git-pull-request /><span>Open the pull request: a preview runs</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-git-merge /><span>Merge it: the update runs</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-clock-counter-clockwise /><span>Stack history lists the update from the push</span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">One-time setup</div><p>Install the Pulumi GitHub app, then Settings, Deploy: source GitHub, branch main, previews for pull requests, updates for pushed commits.</p></aside>
    <aside class="info-card" v-click="5"><div class="info-card__label">Needs</div><p>Admin rights in GitHub and in the Pulumi organization.</p></aside>
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
Step 6 is the one with the most moving parts, so go slowly. Create a private GitHub repository and push the project with Pulumi.dev.yaml. In Pulumi Cloud, install the GitHub app: Settings, Version control, Add account, GitHub. Then on the stack, Settings, Deploy: source GitHub, the repository, branch main, and turn on previews for pull requests and updates for pushed commits. The deployment reads the environment block from Pulumi.dev.yaml, so ESC credentials apply.
Then the change: the DeployedBy tag on the security group, in folder 06. git checkout -b add-deploy-tag, commit, push, open the pull request. The preview runs. Merge. The update runs. pulumi stack history lists the update. We have not confirmed live that it names the push as the source.
This step has not run end to end, and it carries both open questions: hcl in the executor, and the regenerated sdks folder. If the deployment fails on the module: use an executor image with OpenTofu, or add pulumi install as a pre-run command, or switch to a native-only stack for steps 6 and 7.
Without org admin, use a personal private repository. Fallback: the presenter's pre-built repository, a copy of folder 06 with the app installed, and a recording of steps 6 and 7. Optional: the deployment-settings project sets the same options as code.

Time: 12 min
-->
---

# A console change fails the drift check, and one command reconciles it (step 7)

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-git-diff />step 7 · drift</div>
    <div class="big-code code-sm">

```bash
bash "$WORKSHOP"/07-drift/make-drift.sh
bash "$WORKSHOP"/07-drift/detect-drift.sh
pulumi up --refresh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-hand-pointing /><span>A tag lands on the security group outside Pulumi</span></li>
    <li><ph-x-circle /><span>The check prints the diff and exits non-zero</span></li>
    <li><ph-arrows-clockwise /><span>The update brings the cloud back to the code</span></li>
    <li><ph-calendar-check /><span>Pro trial: the schedule, shown by the presenter</span></li>
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
Step 7. First cause drift: add any tag to the security group in the AWS console, or run make-drift.sh, which does the same from a script. Then run detect-drift.sh: it wraps pulumi refresh --preview-only --expect-no-changes, prints the diff and exits non-zero. Then pulumi up --refresh reconciles.
If your shell has no AWS credentials, set ESC_ENV to your org/tf-modules-gitops/aws-oidc before running the scripts.
Presenter only: show Stack, Settings, Schedules, Drift on the Pro trial, with auto-remediation, which runs pulumi up --refresh. Participants on Free will not see Schedules; say so first.
Drift has not run end to end on the build machine. If it fails, play the recording of steps 6 and 7.

Time: 8 min
-->
---

# Teardown ends with no workshop VPC in us-west-2 (step 8)

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-trash />step 8 · teardown</div>
    <div class="big-code code-sm">

```bash
bash "$WORKSHOP"/08-teardown/teardown.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-fire /><span>Destroys the stack</span></li>
    <li><ph-x /><span>Removes the stack</span></li>
    <li><ph-magnifying-glass /><span>Checks us-west-2 for leftovers</span></li>
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
The script runs pulumi destroy, pulumi stack rm, then checks us-west-2 for leftovers. Wait for the all-clear.
Then what the script does not remove: the Deployments settings (Settings, Deploy, or pulumi destroy in the deployment-settings folder), the ESC environment (pulumi env rm for aws-oidc), the IAM role, and the identity provider if you created it for this workshop. Say this explicitly; people forget.
Teardown has not run end to end on the build machine.

Time: 3 min
-->
---

# All six questions are answered, and you kept your modules

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-stack class="step-icon" /><div class="gpu-caption gpu-caption--accent">Modules</div><p>An hcl package runs the module, pinned</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-puzzle-piece class="step-icon" /><div class="gpu-caption gpu-caption--accent">Extend</div><p>Native resources take module outputs</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">Credentials</div><p>Pulumi ESC and OIDC, short-lived</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-git-pull-request class="step-icon" /><div class="gpu-caption gpu-caption--accent">Pipeline</div><p>Push-to-deploy and pull request previews</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-currency-dollar class="step-icon" /><div class="gpu-caption gpu-caption--accent">Cost</div><p>Free runs the loop, scheduled drift needs Pro</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-git-diff class="step-icon" /><div class="gpu-caption gpu-caption--accent">Drift</div><p>Drift detection by CLI and on a schedule</p></div>
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
Close the loop. The modules ran as they are. Native code sat next to them. Credentials were short-lived. A push deployed and a pull request previewed. Free covers that loop; scheduled drift needs Pro or Enterprise. And you caused drift and caught it.
Say what is still open, as in the break slide: the Deployments executor and the hcl package, and the regenerated sdks folder. Say which steps you saw work live today.
Go back to the pipeline drawing from earlier. Which box would you change first? Take two answers.

Time: 2 min
-->
---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-4 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/terraform-modules-gitops" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → terraform-modules-gitops</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/integrations/terraform/modules/" dark="#000000" />
    <div class="res-card__title">Use Terraform modules in Pulumi</div>
    <div class="res-card__body">pulumi.com/docs/integrations/terraform/modules</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/esc/guides/configuring-oidc/aws/" dark="#000000" />
    <div class="res-card__title">Configure OIDC for AWS in Pulumi ESC</div>
    <div class="res-card__body">pulumi.com/docs/esc/guides/configuring-oidc/aws</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/iac/operations/stack-management/drift/" dark="#000000" />
    <div class="res-card__title">Detect and reconcile drift</div>
    <div class="res-card__body">pulumi.com/docs/iac/operations/stack-management/drift</div>
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
Resources: the QR codes lead to the workshop repo, the Terraform modules docs, the OIDC for AWS guide in Pulumi ESC and the drift docs. Give people a moment to scan. The repo link resolves once the pull request is merged.

Time: 1.5 min
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
Next steps: Pulumi Neo can help with migration, and the migrating-from-terraform workshop covers bringing existing Terraform into Pulumi. Join the Pulumi Community Slack, sign up for Pulumi Cloud, and look at the next workshops in the Handouts tab.

Time: 1 min
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/terraform-modules-gitops" dark="#000000" /></div>
      <div class="thanks__qr-label">terraform-modules-gitops</div>
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
Questions. Keep the pipeline drawing in mind: which box would you change first? Points to repeat: modules stay, the loop changes; scheduled drift needs Pro or Enterprise; and say again which steps are not yet proven live.

Time: 5.5 min
-->
