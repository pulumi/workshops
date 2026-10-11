---
theme: "@pulumi/slidev-theme"
title: "Secret versioning and rotation patterns on AWS"
info: |
  Secret versioning and rotation patterns on AWS: Make an AWS secret rotate on its own, read it without a static key, and block secrets that never rotate.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/secret-versioning-rotation-aws
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
    Secret versioning and rotation patterns on AWS
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Make an AWS secret rotate on its own, read it without a static key, and block secrets that never rotate
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>
<!--
Time: 1 min.
Welcome people, say who you are, say the topic in one line: secrets that rotate on their own.
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
Speaker slide. Placeholder until speakers are confirmed. Replace name, role and handles before the session.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>
<!--
Time: 0.25 min.
Divider. Move on.
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
Time: 0.5 min.
The handouts tab has the repo link. The demo is hands on, so keep a terminal open.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>Why old secrets hurt</li>
  <li>Versions and rotation</li>
  <li>Pulumi ESC and policies</li>
  <li>The system we build</li>
  <li>Live demo</li>
  <li>Questions</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>
<!--
Time: 0.5 min.
Six blocks. About half an hour of slides, fifty minutes of demo, ten for questions. Say the agenda and move on.
-->

---

# Compromised tokens exposed many Salesforce instances

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">Google Threat Intelligence Group</div>
    <p>"the actor targeted Salesforce customer instances through compromised OAuth tokens associated with the Salesloft Drift third-party application."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>As early as Aug. 8, 2025, through at least Aug. 18</li>
      <li>The actor searched the data for secrets, including AWS access keys</li>
      <li>On Aug. 20, Salesloft and Salesforce revoked all active Drift tokens</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span><strong>Psssst…</strong> the advice was to revoke and rotate every credential</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
Time: 1.25 min.
Open on the incident. Read the quote slowly. The group is tracked as UNC6395, and the advisory is from Google Threat Intelligence Group. Be exact about what it says: tokens were compromised, data was exported, and the actor then searched that data for secrets such as AWS access keys. People often add that the tokens were never rotated. The advisory does not say that, so do not say it. What it does say, at the end, is revoke and rotate. That is our topic.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">A secret that never changes stays valuable to whoever steals it.</h1>
</div>

<!--
Time: 0.75 min.
First half of the tension. A stolen copy of a static secret works on the day it is stolen and on every day after. Pause after reading it. Do not explain it yet.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Rotating it by hand breaks the app that reads it.</h1>
</div>

<!--
Time: 0.75 min.
Second half. Both lines pull against each other. If you leave the secret alone you carry the leak risk. If you change it by hand, some reader still holds the old value and fails. Ask who has had a 2am outage after a password change. Hands usually go up.
-->

---

# Doing nothing and doing it by hand both fail

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Never rotate</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2"><li>The same value for years</li><li>A stolen copy keeps working</li><li>Nobody can say when it last changed</li></ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Rotate by hand</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2"><li>One new value, many readers</li><li>One missed reader means an outage</li><li>So the rotation gets postponed</li></ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
Time: 1.25 min.
The contrast. On the left the audit question 'when did this last change' has no answer. On the right the team knows it should rotate and does not, because the change window is scary. Aside: the second column is why the first column persists. This is a process problem as much as a tooling one.
-->

---

# Five questions decide whether you can trust automatic rotation

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-arrows-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--muted">Versions</div><p>What happens to running apps while a secret changes?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-gear class="step-icon" /><div class="gpu-caption gpu-caption--muted">Who</div><p>Who runs the rotation?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--muted">Without a key</div><p>How does the app get the value without a stored key?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-vault class="step-icon" /><div class="gpu-caption gpu-caption--muted">Other credentials</div><p>What about credentials outside Secrets Manager, like an IAM key?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-shield-check class="step-icon" /><div class="gpu-caption gpu-caption--muted">Guardrail</div><p>How do we stop someone shipping a secret that never rotates?</p></div>
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
These five questions are the spine of the talk. Read them once. Act 2 answers them in this order, with a recap after the second and the fourth. The demo then runs all five on a real AWS account. Ask the room which one worries them most; it tells you where to slow down.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What happens to a running app while a secret changes?</h1>
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
Section one. Quick beat, then straight into version labels.
-->

---

# Every secret version carries a label, and readers ask for a label

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-circle-notch class="chain__icon" />
    <div class="gpu-caption">AWSPENDING</div>
    <span>The new version, being created</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-check-circle class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">AWSCURRENT</div>
    <span>The version readers get by default</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-clock-clockwise class="chain__icon" />
    <div class="gpu-caption">AWSPREVIOUS</div>
    <span>The last known good version</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>A rotation moves AWSCURRENT to the new version and keeps the old one as AWSPREVIOUS.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-circle-notch /><p>The Lambda stores the new value as AWSPENDING first</p></div><div class="fact"><ph-check-circle /><p>finishSecret moves AWSCURRENT, adds AWSPREVIOUS</p></div><div class="fact"><ph-key /><p>Pulumi ESC reads AWSCURRENT unless told otherwise</p></div>
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
.fact p { margin: 0 !important; font-size: 1.05rem; line-height: 1.35;  }
.fact small { display: block; font-size: 0.9rem; color: var(--p-fg-muted); margin-top: 0.2rem; }
</style>

<!--
Time: 1.75 min.
This answers question one. Secrets Manager does not overwrite a value. It adds a version and moves labels. The new value starts as AWSPENDING, the rotation function moves AWSCURRENT to it at the end, and the old version gets AWSPREVIOUS automatically. Readers that ask for the current label never see a half-finished version. Common mistake: people think AWSPREVIOUS is a backup you keep forever. It is only the last one.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Who runs the rotation?</h1>
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
Section two.
-->

---

# Secrets Manager calls your Lambda once for each of four steps

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-plus-circle class="plan__icon" />
    <p>createSecret: write a new version as AWSPENDING</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-wrench class="plan__icon" />
    <p>setSecret: change the credential in the service</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-magnifying-glass class="plan__icon" />
    <p>testSecret: test the new version</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-check-circle class="plan__icon" />
    <p>finishSecret: move AWSCURRENT</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p>The function is code you own, so you decide what each step does.</p>
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
Time: 2 min.
Walk the four steps left to right. createSecret generates the new value. setSecret is where a database rotation would change the password in the database. In our demo the secret is an app signing token that nothing else consumes, so setSecret writes nothing outside Secrets Manager, and the code says so in a comment. testSecret checks the new version. finishSecret moves the label. The generic template fails loudly if a step fails, which is useful on stage. Aside: the Lambda is yours to maintain, which is a cost we come back to at the end.
-->

---

# Pulumi IaC declares the secret, the Lambda and the schedule together

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-lock-key class="plan__icon" />
    <p>A secret with its first version</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-cube class="plan__icon" />
    <p>The rotation Lambda and its permission</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-clock class="plan__icon" />
    <p>SecretRotation: every 1 day</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="4">
  <ph-lightning class="plan__foot-icon" />
  <p>One Pulumi program, so the rotation cannot be forgotten.</p>
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
Time: 1.75 min.
This is why we use Pulumi IaC for it. Without code the rotation is three console clicks that someone forgets on the next secret. In the program the secret, the Lambda, the permission that lets Secrets Manager call it, and the rotation rule sit side by side. We set a one-day schedule for the demo, and we do not rotate immediately at creation. No code on the slide on purpose; you will see it in the editor.
-->

---

# Two questions answered, three to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-arrows-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--accent">Versions</div><p>AWSCURRENT, AWSPREVIOUS, AWSPENDING</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-gear class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>A Lambda you own, deployed with Pulumi IaC</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-key class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Without a key</div><p>How does the app get the value without a stored key?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-vault class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Other credentials</div><p>What about credentials outside Secrets Manager?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-check class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Guardrail</div><p>How do we stop a secret that never rotates?</p></div>
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
Time: 0.5 min.
Quick recap. Two cards lit, three muted. Keep it under a minute.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How does the app read it without a stored key?</h1>
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
Section three.
-->

---

# Pulumi ESC logs in with OIDC, so no AWS key is stored

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card gpu-card--primary chain__node" v-click="1">
    <ph-cloud-check class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">ESC environment</div>
    <span>aws-login names a role ARN</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card chain__node" v-click="2">
    <ph-shield-check class="chain__icon" />
    <div class="gpu-caption">IAM role</div>
    <span>Trusts the Pulumi OIDC provider</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-vault class="chain__icon" />
    <div class="gpu-caption">Secrets Manager</div>
    <span>aws-secrets reads the secret</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>The role needs secretsmanager:GetSecretValue on the secret.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-lock-key /><p>The login is an assumed role, not a stored key</p></div><div class="fact"><ph-key /><p>kms:Decrypt too when a customer managed key is used</p></div><div class="fact"><ph-eye-slash /><p>Secret values stay marked as secrets in ESC</p></div>
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
.fact p { margin: 0 !important; font-size: 1.05rem; line-height: 1.35;  }
.fact small { display: block; font-size: 0.9rem; color: var(--p-fg-muted); margin-top: 0.2rem; }
</style>

<!--
Time: 2 min.
Question three. An ESC environment uses the aws-login provider with an OIDC role. Pulumi Cloud presents a token, AWS trusts the provider you registered, and you get session credentials. Nothing static sits in the environment. Then aws-secrets reads the secret with that login. The role must be allowed to call GetSecretValue on the secret, and Decrypt on the key if you use a customer managed key. Common mistake: forgetting the key policy and blaming ESC for an access denied.
-->

---

# ESC reads the current and the previous version of the same secret

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Default</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2"><li>aws-secrets returns AWSCURRENT</li><li>Maps to the app's current token</li><li>Moves on its own after a rotation</li></ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Pinned</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2"><li>versionStage: AWSPREVIOUS reads the value before the last rotation</li><li>versionId pins one immutable version</li><li>Maps to the app's previous token</li></ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
Time: 1.75 min.
Both options come from the aws-secrets page. By default you get AWSCURRENT. With versionStage you select by label, for example AWSPREVIOUS for the value from before the most recent rotation. With versionId you pin an immutable version. Why would an app want the previous value? A client that cached the old token for a minute can still be validated during the swap. In the demo we read both and show they differ.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What about credentials outside Secrets Manager?</h1>
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
Section four.
-->

---

# The ESC aws-iam rotator swaps an IAM user's access keys

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-terminal-window class="chain__icon" />
    <div class="gpu-caption">You</div>
    <span>pulumi env rotate</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-cloud-check class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">ESC rotator</div>
    <span>fn::rotate::aws-iam with the user ARN</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-vault class="chain__icon" />
    <div class="gpu-caption">ESC state</div>
    <span>current and previous key pair</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>The previous key stays in state next to the current one.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-key /><p>The rotator needs a login: an OIDC role or static keys</p></div><div class="fact"><ph-clock /><p>IAM allows two access keys per user</p></div><div class="fact"><ph-hand-palm /><p>We run it by hand in the demo</p></div>
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
.fact p { margin: 0 !important; font-size: 1.05rem; line-height: 1.35;  }
.fact small { display: block; font-size: 0.9rem; color: var(--p-fg-muted); margin-top: 0.2rem; }
</style>

<!--
Time: 2 min.
Question four. An IAM user's access key is not a Secrets Manager secret, so the Lambda route does not apply. ESC has rotators for this. The aws-iam rotator holds the keys in the environment state as current and previous. We run pulumi env rotate by hand. Aside: IAM allows two keys per user, so if you hit the limit you delete the old one first, which the teardown script also does before it deletes the user.
-->

---

# Two layers rotate two kinds of secret

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Secrets Manager rotation</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2"><li>A Lambda you own</li><li>Version labels move</li><li>Schedule set in days on the secret</li></ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">ESC rotators</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2"><li>The aws-iam rotator for IAM user keys</li><li>State holds current and previous</li><li><code>pulumi env rotate</code> swaps the key</li></ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
Time: 1.75 min.
Why both? They cover different things. A Secrets Manager secret rotates through its Lambda and its schedule. An IAM user key lives outside Secrets Manager, so the ESC rotator handles it. ESC reads the first kind and rotates the second kind. If someone asks which one to pick: ask where the secret lives today.
-->

---

# Four questions answered, one to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-arrows-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--accent">Versions</div><p>AWSCURRENT and AWSPREVIOUS</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-gear class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>A Lambda, deployed with Pulumi IaC</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">Without a key</div><p>Pulumi ESC aws-login with OIDC</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-vault class="step-icon" /><div class="gpu-caption gpu-caption--accent">Other credentials</div><p>The ESC aws-iam rotator</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-check class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Guardrail</div><p>How do we stop a secret that never rotates?</p></div>
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
Time: 0.5 min.
Recap number two. One card left.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How do we stop a secret that never rotates?</h1>
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
Section five.
-->

---

# A policy pack fails the preview for a secret with no rotation

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-terminal-window class="plan__icon" />
    <p>Run the pack on preview with --policy-pack</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-magnifying-glass class="plan__icon" />
    <p>validateStack sees every resource in the stack</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-shield-warning class="plan__icon" />
    <p>A secret without a rotation fails</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-check-circle class="plan__icon" />
    <p>Add the rotation and the preview passes</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p>The check runs before anything deploys.</p>
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
Time: 2 min.
Question five. A Pulumi policy pack can run on preview. The stack-level rule, validateStack, sees all resources in the stack, so it can ask whether each secret has a rotation next to it. The preview fails with the policy message. Add a SecretRotation and it passes. Aside: at preview time a secret id can still be unknown, so the rule matches on resource names and the rotation's parent. We tested that matching offline; say so if asked.
-->

---

# Where this breaks today

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Secrets Manager side</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2"><li>The rotation Lambda is yours to maintain</li><li>The generic template has no setSecret target</li><li>The policy matches names, because ids are unknown at preview</li></ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Pulumi ESC side</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2"><li>Rotation connectors for private networks need Pro or Enterprise</li><li>We rotate by hand in the demo</li><li>IAM allows two keys per user</li></ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
Time: 1.75 min.
Say the limits plainly. You maintain the Lambda and its runtime. The generic template does not change a credential in another service, which is fine for our token and wrong for a database. The policy depends on naming. On the ESC side, the demo rotates by hand with pulumi env rotate. Rotation connectors, for databases in private networks, are a Pro and Enterprise feature.
-->

---

# The system we build: rotation in AWS, reads through ESC, a gate in front

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card gpu-card--primary chain__node" v-click="1">
    <ph-terminal-window class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Pulumi IaC</div>
    <span>Secret, Lambda, rotation, IAM user</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card chain__node" v-click="2">
    <ph-vault class="chain__icon" />
    <div class="gpu-caption">AWS</div>
    <span>Secrets Manager and the IAM user</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-cloud-check class="chain__icon" />
    <div class="gpu-caption">Pulumi ESC</div>
    <span>Current, previous, and the access keys</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="4" />
  <div class="gpu-card chain__node" v-click="4">
    <ph-cube class="chain__icon" />
    <div class="gpu-caption">The app</div>
    <span>Runs with pulumi env run</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="5">
  <p>A policy pack checks the program before it deploys.</p>
</aside>

<div class="facts" v-click="6">
  <div class="fact"><ph-clock /><p>Rotation every day, started by hand in the demo</p></div><div class="fact"><ph-lock-key /><p>No stored AWS key between ESC and AWS</p></div><div class="fact"><ph-shield-check /><p>Policy blocks the unrotated secret</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
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
Time: 1.5 min.
The picture of what we build in the next block. Left to right: the Pulumi program creates the AWS pieces, ESC reads them with an OIDC login, the app consumes the values with pulumi env run. The policy pack sits in front of the program. Keep this slide up while you start the first deploy in the background, because the Lambda deploy takes about a minute.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Secret rotation on AWS.</h1>
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
The demo divider. Switch to the terminal.
-->

---

# What we are going to do

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-hammer class="step__icon" /><p>Foundation and a first secret</p></div>
  <div class="gpu-card step" v-click><ph-clock class="step__icon" /><p>A Lambda that rotates it</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-arrows-clockwise class="step__icon" /><p>Rotate now, watch the labels</p></div>
  <div class="gpu-card step" v-click><ph-cloud-check class="step__icon" /><p>Read both versions through ESC</p></div>
  <div class="gpu-card step" v-click><ph-key class="step__icon" /><p>Swap an IAM user's keys</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-shield-warning class="step__icon" /><p>Block the secret with no rotation</p></div>
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
Time: 2 min.
Every step as an outcome. Steps one to four are setup, run in one Pulumi project staged by a config value. Tell people the Lambda deploy is the slow one. Cleanup comes at the end and takes a minute. The code was checked offline before today's delivery, so say so if something behaves differently.
-->

---

# 1 · Foundation, secret and rotation deploy in three stages

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-hammer />host</div>
    <div class="big-code code-sm">

```bash
pulumi config set demoStep 2 && pulumi up
pulumi config set demoStep 3 && pulumi up
pulumi config set demoStep 4 && pulumi up
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-cloud-check /><span>Stage 2: OIDC provider and roles</span></li>
    <li><ph-lock-key /><span>Stage 3: the secret, one version</span></li>
    <li><ph-clock /><span>Stage 4: Lambda and rotation enabled</span></li>
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
Run the three stages in one folder. After stage three, run describe-secret if people want to see one version. After stage four rotation is enabled on the secret. If the account already has an OIDC provider for the Pulumi URL, set the existing ARN config, because IAM allows one per URL. Start stage four before the next explanation.
-->

---

# 2 · Rotate now and watch the labels move

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
./05-trigger-rotation/rotate.sh
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-clock-clockwise /><div><div class="gpu-caption gpu-caption--accent">1 · Before</div><code>one AWSCURRENT</code></div></div>
  <div class="gpu-card check" v-click><ph-arrows-clockwise /><div><div class="gpu-caption gpu-caption--accent">2 · Rotate</div><code>rotate-secret</code></div></div>
  <div class="gpu-card check" v-click><ph-check-circle /><div><div class="gpu-caption gpu-caption--accent">3 · After</div><code>CURRENT + PREVIOUS</code></div></div>
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
Time: 8 min.
The script describes the secret, calls rotate-secret and polls until AWSPENDING is gone and AWSPREVIOUS exists. Ask the room to read the labels aloud: one AWSCURRENT, one AWSPREVIOUS, no AWSPENDING. If the Lambda fails in testSecret, show the CloudWatch log. The generic template fails loudly, and that is a teaching point. Stagger this step by table if throttling shows up.
-->

---

# 3 · Both versions arrive through ESC

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-cloud-check />host</div>
    <div class="big-code code-sm">

```bash
./06-esc-environment/create-env.sh <org>
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-key /><span>aws-login with OIDC, no stored key</span></li>
    <li><ph-arrows-clockwise /><span>AWSCURRENT as the token</span></li>
    <li><ph-clock-clockwise /><span>AWSPREVIOUS as the previous token</span></li>
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
Time: 7 min.
The script renders the environment file with the role and secret ARNs, creates it and prints it. Secret values show as secret in the output. The two values should differ after the rotation. Aside: if the previous value equals the current one, rotation has not run yet.
-->

---

# 4 · The app sees the token without a key in the shell

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-terminal-window />host</div>
    <div class="big-code code-sm">

```bash
./07-env-run/run-app.sh <org>
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-terminal-window /><span>pulumi env run injects the variables</span></li>
    <li><ph-eye-slash /><span>The script prints only the length</span></li>
    <li><ph-lock-key /><span>No AWS key in the shell history</span></li>
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
The script runs pulumi env run and prints the length of the token and the previous token, never the value. Point at the shell history afterwards: nothing secret is in it.
-->

---

# 5 · The aws-iam rotator swaps an IAM user's keys

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-key />host</div>
    <div class="big-code code-sm">

```bash
./08-iam-rotator/rotate.sh <org>
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-key /><span>Creates the rotator environment</span></li>
    <li><ph-arrows-clockwise /><span>Runs pulumi env rotate</span></li>
    <li><ph-clock-clockwise /><span>Old key moves to previous</span></li>
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
The script runs pulumi env rotate and lists the access keys on the demo user. Run it twice if you want to show the pair move. If IAM refuses with a key limit, delete the old key first and rerun.
-->

---

# 6 · The policy pack blocks the secret with no rotation

<div class="zoom-content">

<div class="s5__cmd big-code code-sm">

```bash
pulumi preview --policy-pack ../09-require-rotation
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-terminal-window /><span>Preview with an unrotated extra secret</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step s5__step--stop" v-click="2"><ph-shield-warning /><span>The policy fails the preview</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step" v-click="3"><ph-check-circle /><span>Add a rotation and it passes</span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Set before the run</div><p>extraSecret to unrotated, then to rotated.</p></aside>
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
Time: 8 min.
Run the preview with the unrotated extra secret first and read the policy message. Then switch the config value and run again. Note the exact config steps are in the README. We tested the matching offline, so if the live preview behaves differently, say so and show the test.
-->

---

# 7 · Teardown leaves nothing behind

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-trash />host</div>
    <div class="big-code code-sm">

```bash
./10-teardown/teardown.sh <org>
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-key /><span>Deletes IAM access keys first</span></li>
    <li><ph-cloud-check /><span>Removes both ESC environments</span></li>
    <li><ph-check-circle /><span>Lists must come back empty</span></li>
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
The script deletes the keys, removes the environments, destroys the stack and prints two lists that should be empty. Secrets Manager keeps a deleted secret for a recovery window, so the program sets that window to zero. Ask everyone to run it.
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/secret-versioning-rotation-aws" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → secret-versioning-rotation-aws</div>
  </div>
  <div class="res-card">
    <QRCode data="https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets_lambda-functions.html" dark="#000000" />
    <div class="res-card__title">AWS rotation Lambda functions</div>
    <div class="res-card__body">docs.aws.amazon.com</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/esc/providers/aws-secrets/" dark="#000000" />
    <div class="res-card__title">Pulumi ESC aws-secrets provider</div>
    <div class="res-card__body">pulumi.com/docs/esc</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/esc/providers/rotators/" dark="#000000" />
    <div class="res-card__title">Pulumi ESC rotators</div>
    <div class="res-card__body">pulumi.com/docs/esc</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/" dark="#000000" />
    <div class="res-card__title">Write a Pulumi policy pack</div>
    <div class="res-card__body">pulumi.com/docs</div>
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
Time: 0.5 min.
The four links are pages I read while preparing. The repo QR code goes to the workshop folder, which resolves after the pull request merges.
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
Time: 0.25 min.
Point to the community and docs. Keep it short.
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/secret-versioning-rotation-aws" dark="#000000" /></div>
      <div class="thanks__qr-label">secret-versioning-rotation-aws</div>
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
Time: 10 min.
Questions. If nobody asks, offer the common one: what if the rotation Lambda fails? Answer: it fails loudly and the AWSCURRENT version stays in place; look at the CloudWatch log.
-->
