---
theme: "@pulumi/slidev-theme"
title: "Certificate and PKI lifecycle as code with cert-manager, AWS Private CA and Vault PKI"
info: |
  Certificate and PKI lifecycle as code with cert-manager, AWS Private CA and Vault PKI: Issue, renew and alert on private certificates from two CAs, all declared in Pulumi IaC.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/pki-lifecycle-cert-manager-private-ca-vault
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
    Certificate and PKI lifecycle as code with cert-manager, AWS Private CA and Vault PKI
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Issue, renew and alert on private certificates from two CAs, all declared in Pulumi IaC
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
[1 min] Welcome. Say what the next hour and a half covers: certificates for workloads in a cluster, from two certificate authorities, declared in Pulumi IaC.
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
[1.5 min] Introduce yourself. Speaker details are a placeholder until the event page is known.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
[0.5 min] Housekeeping and agenda come next.
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
[1 min] Housekeeping. Costs: AWS Private CA is billed monthly per CA, so remind everyone to run the teardown script.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>Why certificates keep expiring</li>
  <li>Private CAs and cert-manager</li>
  <li>Renewal, alerts and Pulumi ESC</li>
  <li>The solution we build</li>
  <li>The demo</li>
  <li>Wrap-up and Q&A</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
[1 min] Agenda. Talk first, then the eight demo steps, then questions.
-->

---

# An expired certificate blinded Equifax for 19 months

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">House Oversight Committee report, December 2018</div>
    <p>"Equifax did not see the data exfiltration because the device used to monitor ACIS network traffic had been inactive for 19 months due to an expired security certificate."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>The device monitored network traffic for the breached ACIS web application</li>
      <li>The report says Equifax let over 300 security certificates expire</li>
      <li>The certificate was renewed on July 29, 2017, and the traffic looked suspicious at once</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span><strong>Source:</strong> the U.S. House Oversight report on the Equifax breach</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.3rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
[2 min] Start here. Nobody hacked a certificate. A certificate expired, a monitoring device went blind, and the company did not see data leaving for nineteen months. The House Oversight report says so in its own words. Point at the last bullet: the day they renewed the certificate, they saw the traffic. Source: oversight.house.gov Equifax-Report.pdf, read 2026-10-24.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Private certificates expire on a calendar nobody owns.</h1>
</div>

<!--
[0.75 min] That is the pattern: a date passed. Ask the room who has a certificate expiry in a shared calendar. Let the hands go up. That is our starting point.
-->

---

# Public certificate lifetimes fall from 398 days to 47

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Until March 2026</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Public TLS certificates: up to 398 days</li>
      <li>One renewal a year, easy to forget</li>
      <li>Calendar reminders still work</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">By March 2029</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Public TLS certificates: 47 days</li>
      <li>Many renewals a year, per certificate</li>
      <li>Only automation keeps up</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1.5 min] This comes from a CA/Browser Forum ballot, SC-081v3. It reduces the maximum validity of public TLS certificates from 398 days to 47 days, in steps: 200 days from March 15, 2026, 100 days from March 15, 2027 and 47 days from March 15, 2029. Be clear it is about public certificates. Our workshop is about private ones, and the ballot does not bind them. My argument, and it is an opinion, is that teams copy the habits of the public web, and the habit is going to be short lifetimes. Sources: cabforum.org ballot SC081v3 page for the 398 to 47 days and March 2026 to March 2029 span, theregister.com 2025-04-14 for the step dates, read 2026-10-24.
-->

---

# Each team keeps its own CA, script and reminder

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Today</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>A CA someone set up once</li>
      <li>A script that renews, sometimes</li>
      <li>A calendar reminder</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">What we want</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>One declared CA per environment</li>
      <li>Renewal that runs by itself</li>
      <li>An alarm when renewal fails</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1.5 min] This is the tension. Certificates get shorter, and each team still has its own CA, its own script and its own reminder. That works until the person who wrote the script leaves. We want the right column, declared in code.
-->

---

# A certificate estate fails in four ways

<div class="zoom-content">

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-hourglass class="step-icon" /><div class="gpu-caption gpu-caption--muted">Expiry</div><p>The certificate lapses unseen</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-identification-card class="step-icon" /><div class="gpu-caption gpu-caption--muted">Wrong issuer</div><p>A workload trusts the wrong CA</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--muted">Lost CA key</div><p>The signing key is gone or exposed</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-arrows-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--muted">Unrotated root</div><p>The root never gets replaced</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[1.5 min] Expiry is the loud one, and Equifax is that case. The other three are quieter. A workload gets a certificate from the wrong issuer. The CA key is lost. The root is never rotated. Today we deal with the first two directly and we show where the CA key lives for each of our two CAs.
-->

---

# Six questions before you trust a private PKI

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--muted">Who</div><p>Who is the CA, and where does its key live?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-package class="step-icon" /><div class="gpu-caption gpu-caption--muted">How</div><p>How does a pod get a certificate without a ticket?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-clock class="step-icon" /><div class="gpu-caption gpu-caption--muted">When</div><p>What renews it, and when?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-bell-ringing class="step-icon" /><div class="gpu-caption gpu-caption--muted">Alert</div><p>How do I know it failed to renew before users do?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--muted">Where</div><p>Where do the credentials for all of this live?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-users-three class="step-icon" /><div class="gpu-caption gpu-caption--muted">Scale</div><p>How do 20 teams do this the same way?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[1.5 min] These six questions are the spine of the next half hour. Read them out slowly. Who is the CA and where is its key. How does a pod get a certificate without a ticket. What renews it and when. How do I find out before users do. Where do credentials live. How do twenty teams do this the same way. At the end I come back to this slide and every card is answered.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Who is the CA, and where does its key live?</h1>
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
[0.25 min] Question one.
-->

---

# AWS Private CA keeps the key managed, Vault PKI keeps it yours

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">AWS Private CA</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Managed service, key held by AWS</li>
      <li>Fee per CA per month</li>
      <li>aws-privateca-issuer plugin</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Vault PKI</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>You run Vault</li>
      <li>Key and policy live in Vault</li>
      <li>Built-in cert-manager Vault issuer</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[2.25 min] Two CAs on purpose, so you can compare. AWS Private CA is a managed service. The AWS pricing page, which I read on 2026-10-24, lists 400 dollars per CA per month in general-purpose mode and 50 dollars in short-lived certificate mode. Check the page before you copy that number, because prices move. Vault PKI you run yourself. cert-manager has a built-in Vault issuer, and the AWS side uses the aws-privateca-issuer plugin from the cert-manager project. Be honest in the room: our demo uses general-purpose CAs, short-lived mode is not implemented in the code.
-->

---

# A root CA signs a subordinate CA

<div class="zoom-content">

<div class="layers">
  <div class="gpu-card gpu-card--primary layer" v-click><ph-seal-check class="layer__icon" /><div><div class="gpu-caption gpu-caption--accent">Root CA</div><p>Created and activated by Pulumi</p></div></div>
  <div class="gpu-card gpu-card--muted layer" v-click><ph-certificate class="layer__icon" /><div><div class="gpu-caption gpu-caption--muted">Subordinate CA</div><p>Signed by the root</p></div></div>
  <div class="gpu-card gpu-card--muted layer" v-click><ph-plugs class="layer__icon" /><div><div class="gpu-caption gpu-caption--muted">cert-manager issuer</div><p>An AWSPCAClusterIssuer in the cluster</p></div></div>
  <div class="gpu-card gpu-card--muted layer" v-click><ph-lock-key class="layer__icon" /><div><div class="gpu-caption gpu-caption--muted">Certificate and Secret</div><p>What the workload mounts</p></div></div>
</div>

<aside class="info-card" v-click>
  <p>The hierarchy is declared in step 03 and 04 of the demo.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.layers { display: flex; flex-direction: column; gap: 0.9rem; }
.layer { display: flex; align-items: center; gap: 1.1rem; padding: 0.9rem 1.3rem; }
.layer p { margin: 0.3rem 0 0 !important; font-size: 1.2rem; line-height: 1.35; }
.layer__icon { font-size: 2.1rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
[2.25 min] The usual two-level hierarchy. A root CA, a subordinate signed by the root, and the issuer in the cluster. In the demo, step 03 builds the root, its certificate, the subordinate and the resources that activate both. Say clearly: the ACM PCA template ARN strings in the code are not on the registry page and I have not run them yet. We confirm them in rehearsal.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How does a pod get a certificate without a ticket?</h1>
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

# A Certificate resource becomes a Secret on its own

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-file-text class="plan__icon" />
    <p>You declare a Certificate</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-envelope-simple class="plan__icon" />
    <p>cert-manager asks the issuer</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-seal-check class="plan__icon" />
    <p>The CA signs it</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-lock-key class="plan__icon" />
    <p>A Secret holds key and certificate</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p>No ticket, no human in the loop.</p>
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
[2.25 min] This is the heart of cert-manager. You declare a Certificate resource with a DNS name and an issuer reference. cert-manager creates the request, the issuer asks the CA to sign, and the result lands in a Kubernetes Secret that your pod mounts. No ticket to a PKI team.
-->

---

# Each issuer proves itself to its CA in its own way

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">AWS Private CA issuer</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Runs under an IAM role</li>
      <li>IRSA binds the service account</li>
      <li>No access keys in the cluster</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Vault issuer</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Token, AppRole or Kubernetes auth</li>
      <li>Demo uses a dev server token</li>
      <li>Production needs a real auth method</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[2.25 min] The AWS issuer can use an EC2 instance role or IAM Roles for Service Accounts. The demo binds the issuer service account to an IAM role through IRSA. The Vault issuer in cert-manager supports AppRole, token and Kubernetes auth, per the cert-manager Vault page I read on 2026-10-24. Our demo uses a dev-mode Vault with a root token, which is fine for a workshop and wrong for production.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What renews it, and when?</h1>
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

# cert-manager renews a certificate before it expires

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-calendar-check class="plan__icon" />
    <p>Certificate issued</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-hourglass class="plan__icon" />
    <p>renewBefore window opens</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-arrows-clockwise class="plan__icon" />
    <p>cert-manager reissues</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-lock-key class="plan__icon" />
    <p>The Secret gets a new certificate</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p>The cert-manager docs example: 90 days duration, renews 15 days before expiry.</p>
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
[2.25 min] The Certificate has a duration and a renewBefore. The cert-manager docs show a 90-day certificate that renews 15 days before expiry. When the renewal window opens, cert-manager reissues and updates the same Secret. In the demo the numbers are tiny so we can see it: duration two hours, renewBefore one hour.
-->

---

# Three questions covered, three to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>Who is the CA, and where does its key live?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-package class="step-icon" /><div class="gpu-caption gpu-caption--accent">How</div><p>How does a pod get a certificate without a ticket?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-clock class="step-icon" /><div class="gpu-caption gpu-caption--accent">When</div><p>What renews it, and when?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-bell-ringing class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Alert</div><p>How do I know it failed to renew before users do?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-key class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Where</div><p>Where do the credentials for all of this live?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-users-three class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Scale</div><p>How do 20 teams do this the same way?</p></div>
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
[0.75 min] Quick recap. The CA and its key: two CAs, one managed, one yours. The pod gets a certificate through a Certificate resource. renewBefore decides when it renews. Next: how do we know when renewal fails.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How do I know it failed to renew?</h1>
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

# Four signals watch one certificate

<div class="zoom-content">

<div class="layers">
  <div class="gpu-card gpu-card--primary layer" v-click><ph-chart-line class="layer__icon" /><div><div class="gpu-caption gpu-caption--accent">CloudWatch alarm</div><p>On the ACM DaysToExpiry metric</p></div></div>
  <div class="gpu-card gpu-card--muted layer" v-click><ph-envelope-simple class="layer__icon" /><div><div class="gpu-caption gpu-caption--muted">SNS email</div><p>Reaches a person</p></div></div>
  <div class="gpu-card gpu-card--muted layer" v-click><ph-gauge class="layer__icon" /><div><div class="gpu-caption gpu-caption--muted">cert-manager metric</div><p>Expiration timestamp in Prometheus</p></div></div>
  <div class="gpu-card gpu-card--muted layer" v-click><ph-bell-ringing class="layer__icon" /><div><div class="gpu-caption gpu-caption--muted">PrometheusRule</div><p>Alerts from the cluster side</p></div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.layers { display: flex; flex-direction: column; gap: 0.9rem; }
.layer { display: flex; align-items: center; gap: 1.1rem; padding: 0.9rem 1.3rem; }
.layer p { margin: 0.3rem 0 0 !important; font-size: 1.2rem; line-height: 1.35; }
.layer__icon { font-size: 2.1rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
[2.25 min] Two paths. The AWS path: an ACM certificate signed by our Private CA, a CloudWatch alarm on its DaysToExpiry metric, and an SNS topic that sends email. The cluster path: cert-manager exposes a certificate expiration timestamp metric and a PrometheusRule alerts on it. One caveat for the room: the cert-manager.io metrics page I read does not list the metric name. The cert-manager metrics package on pkg.go.dev lists certificate_expiration_timestamp_seconds, so we confirm the full name on the controller's /metrics endpoint in rehearsal.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The expiry metric updates twice a day.</h1>
</div>

<!--
[1.25 min] The AWS docs for ACM metrics say DaysToExpiry is published twice per day for every certificate. So you cannot watch an alarm flip by waiting. In the demo we raise the threshold above the remaining days so the alarm moves to ALARM, and I tell the audience that is a forced state. Source: docs.aws.amazon.com ACM CloudWatch metrics page, read 2026-10-24.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Where do the credentials live?</h1>
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

# Pulumi ESC hands the AWS login to the stack

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-vault class="plan__icon" />
    <p>Pulumi ESC environment</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-identification-badge class="plan__icon" />
    <p>OIDC login to AWS</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-stack class="plan__icon" />
    <p>Stack config</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-cloud-check class="plan__icon" />
    <p>Pulumi IaC program</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p>No access keys on laptops.</p>
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
[2.25 min] Pulumi ESC holds the AWS login through its aws-login provider, which uses OIDC, and the Vault token as a secret value. The stack reads both from the environment, so nobody pastes access keys into a shell. In the demo, step 01 creates the environment and links it to the stack. Be straight about the Vault token: it is the dev server root token for the workshop.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How do 20 teams do this the same way?</h1>
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
[0.25 min] Question six.
-->

---

# A component turns issuer, certificate and alarm into one resource

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Without a component</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Every team writes its own YAML</li>
      <li>Naming differs per team</li>
      <li>Alerts get forgotten</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">With a Pulumi component</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>One resource, one interface</li>
      <li>Same shape everywhere</li>
      <li>The alert ships with the certificate</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[2.25 min] Ours is called PkiCertificate. It wraps the Certificate and, when you give it an ACM certificate ARN and a topic ARN, the alarm. Teams call it instead of copying manifests. We do not demo a policy in this workshop.
-->

---

# Where this breaks today

<div class="zoom-content">

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-shield-warning class="step-icon" /><div class="gpu-caption gpu-caption--muted">Dev Vault</div><p>A dev server and a root token</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-currency-dollar class="step-icon" /><div class="gpu-caption gpu-caption--muted">CA fees</div><p>Two general-purpose CAs bill by the month</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-flask class="step-icon" /><div class="gpu-caption gpu-caption--muted">Unverified strings</div><p>Template ARNs and cmctl flags not yet run live</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-timer class="step-icon" /><div class="gpu-caption gpu-caption--muted">Alarm timing</div><p>The ALARM state is forced</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[2.25 min] Honesty slide. The Vault is a dev server with a root token. Two general-purpose CAs cost money by the month. Check the pricing page for what happens after deletion. The code has not been run live: the template ARN strings are unverified and the cmctl script has not run. And the alarm you see is forced. The README of the repo lists every unverified item.
-->

---

# One stack per step builds the whole estate

<div class="zoom-content">

<div class="layers">
  <div class="gpu-card gpu-card--primary layer" v-click><ph-vault class="layer__icon" /><div><div class="gpu-caption gpu-caption--accent">Pulumi ESC</div><p>AWS login and Vault token</p></div></div>
  <div class="gpu-card gpu-card--muted layer" v-click><ph-cube class="layer__icon" /><div><div class="gpu-caption gpu-caption--muted">EKS cluster</div><p>cert-manager and both issuers</p></div></div>
  <div class="gpu-card gpu-card--muted layer" v-click><ph-seal-check class="layer__icon" /><div><div class="gpu-caption gpu-caption--muted">Two CAs</div><p>AWS Private CA and Vault PKI</p></div></div>
  <div class="gpu-card gpu-card--muted layer" v-click><ph-bell-ringing class="layer__icon" /><div><div class="gpu-caption gpu-caption--muted">Alerts</div><p>ACM certificate, alarm, SNS, PrometheusRule</p></div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.layers { display: flex; flex-direction: column; gap: 0.9rem; }
.layer { display: flex; align-items: center; gap: 1.1rem; padding: 0.9rem 1.3rem; }
.layer p { margin: 0.3rem 0 0 !important; font-size: 1.2rem; line-height: 1.35; }
.layer__icon { font-size: 2.1rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
[2.5 min] This is what we build. Eight Pulumi projects, one per demo step. ESC at the top for credentials, an EKS cluster with cert-manager, two CAs with their issuers, and the alerting. 
-->

---

# A new certificate is one component call

<div class="zoom-content">

<div class="s1">
  <div class="big-code code-sm">

```typescript
const payments = new PkiCertificate("payments", {
    dnsName: "payments.internal.example",
    issuerGroup: "cert-manager.io",
    issuerKind: "Issuer",
    issuerName: "vault-pki",
}, { providers: [provider] });
```

</div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-certificate /><span>One component, one certificate</span></li>
    <li><ph-vault /><span>Here it uses the Vault issuer</span></li>
    <li><ph-copy /><span>The checkout call looks the same</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.6fr 1fr; gap: 2rem; align-items: center; }
.s1 pre { margin: 0 !important; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[1.5 min] This is the one place with program code, seven lines from step 08. The same component handles checkout through AWS Private CA and payments through Vault. A third certificate is another call like this one.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Certificate and PKI lifecycle as code.</h1>
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
[0.5 min] Hands on now. Eight steps, one folder each.
-->

---

# What we are going to do

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-vault class="step__icon" /><p>01 · Pulumi ESC holds the AWS login</p></div>
  <div class="gpu-card step" v-click><ph-cube class="step__icon" /><p>02 · An EKS cluster, two nodes</p></div>
  <div class="gpu-card step" v-click><ph-seal-check class="step__icon" /><p>03 · AWS Private CA: root and subordinate</p></div>
  <div class="gpu-card step" v-click><ph-plugs class="step__icon" /><p>04 · cert-manager and the AWS issuer</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-certificate class="step__icon" /><p>05 · A first certificate, two hours long</p></div>
  <div class="gpu-card step" v-click><ph-lock-key class="step__icon" /><p>06 · Vault PKI as a second issuer</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-bell-ringing class="step__icon" /><p>07 · Force a renewal, watch the alarm</p></div>
  <div class="gpu-card step" v-click><ph-package class="step__icon" /><p>08 · One component for both</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.15; }
.steps { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.step { display: flex; align-items: center; gap: 1rem; padding: 0.9rem 1.2rem; }
.step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.3; }
.step__icon { font-size: 2rem; flex-shrink: 0; color: var(--p-primary); }
</style>

<!--
[2 min] Eight steps, each its own folder and its own Pulumi project. Steps 02 and 03 take the longest to create, so start the cluster early. Keep a pre-built cluster stack as a fallback for the room.
-->

---

# 1 · The AWS login comes from Pulumi ESC

<div class="zoom-content">

<div class="s1 s1--stack">
  <div class="big-code code-sm">

```bash
pulumi env open "${ORG}/pki-workshop/aws-vault" --format json \
  | jq '.environmentVariables | keys'
```

</div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-key /><span>AWS credentials come back from the environment</span></li>
    <li><ph-lock /><span>Run it with the values hidden from the room</span></li>
    <li><ph-shield-check /><span><code>pulumi config</code> shows no plaintext secret</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.6fr 1fr; gap: 2rem; align-items: center; }
.s1 pre { margin: 0 !important; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
.s1--stack { grid-template-columns: 1fr; gap: 1rem; }
.s1--stack .s1__facts { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
.s1--stack .s1__facts li { margin: 0; font-size: 1.05rem; }
</style>

<!--
[5 min] Step 01. Run setup.sh first, it creates the environment and the stack. This command only proves it works. Pipe through jq keys so no secret value shows on the projector. The Vault token is stored as a secret in the environment. Not run live yet: preview for this step did not complete offline, so we rehearse.
-->

---

# 2 · The cluster has two Ready nodes

<div class="zoom-content">

<div class="s1">
  <div class="big-code code-sm">

```bash
kubectl get nodes
```

</div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-hourglass /><span>EKS create takes a while</span></li>
    <li><ph-cube /><span>Two nodes, public subnets only</span></li>
    <li><ph-check /><span>Both should say Ready</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.6; }
.s1 { display: grid; grid-template-columns: 1.6fr 1fr; gap: 2rem; align-items: center; }
.s1 pre { margin: 0 !important; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[6 min] Step 02. pulumi up in 02-eks-cluster, then export the kubeconfig. The cluster uses public subnets only so there is no NAT gateway to pay for. Talk through the next step while it creates.
-->

---

# 3 · Both CAs report ACTIVE

<div class="zoom-content">

<div class="s1 s1--stack">
  <div class="big-code code-sm">

```bash
aws acm-pca describe-certificate-authority \
  --certificate-authority-arn "$(pulumi stack output rootCaArn)" \
  --query CertificateAuthority.Status
```

</div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-seal-check /><span>Root CA first</span></li>
    <li><ph-certificate /><span>Then the subordinate, same command with its ARN</span></li>
    <li><ph-warning /><span>General-purpose mode, billed monthly</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.6fr 1fr; gap: 2rem; align-items: center; }
.s1 pre { margin: 0 !important; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
.s1--stack { grid-template-columns: 1fr; gap: 1rem; }
.s1--stack .s1__facts { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
.s1--stack .s1__facts li { margin: 0; font-size: 1.05rem; }
</style>

<!--
[6 min] Step 03. The Pulumi program creates the root CA, its certificate, the subordinate and the resources that activate both. Run the same command with subordinateCaArn for the second. The permanentDeletionTimeInDays is 7. The template ARN strings were not on the registry page when I built this, so if activation fails, that is the first place to look.
-->

---

# 4 · The AWS issuer is Ready

<div class="zoom-content">

<div class="s1">
  <div class="big-code code-sm">

```bash
kubectl get awspcaclusterissuer
```

</div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-package /><span>Two Helm releases: cert-manager and the issuer</span></li>
    <li><ph-identification-badge /><span>The service account maps to an IAM role</span></li>
    <li><ph-check /><span>Ready should read True</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.6; }
.s1 { display: grid; grid-template-columns: 1.6fr 1fr; gap: 2rem; align-items: center; }
.s1 pre { margin: 0 !important; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[6 min] Step 04. cert-manager chart v1.21.2 with CRDs enabled, and aws-privateca-issuer chart v1.11.0. IRSA binds the issuer's service account to an IAM role. Then the AWSPCAClusterIssuer is declared. Preview hung offline for this step, so the Helm release was never rendered before the rehearsal.
-->

---

# 5 · The first certificate names the Private CA as issuer

<div class="zoom-content">

<div class="s1">
  <div class="big-code code-sm">

```bash
./verify.sh
```

</div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-file-text /><span>A two-hour certificate for demo.internal.example</span></li>
    <li><ph-seal-check /><span>The issuer line shows the Private CA</span></li>
    <li><ph-clock /><span>Not Before and Not After are two hours apart</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.6; }
.s1 { display: grid; grid-template-columns: 1.6fr 1fr; gap: 2rem; align-items: center; }
.s1 pre { margin: 0 !important; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[6 min] Step 05. verify.sh gets the certificate, decodes the Secret and prints subject, issuer and dates with openssl. Point at the issuer line. Duration two hours, renewBefore one hour.
-->

---

# 6 · The second issuer is Vault PKI

<div class="zoom-content">

<div class="s1">
  <div class="big-code code-sm">

```bash
kubectl get certificate --namespace default
```

</div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-lock-key /><span>Vault dev server, chart 0.34.1</span></li>
    <li><ph-plugs /><span>Two phases, with a port-forward in between</span></li>
    <li><ph-users /><span>demo-internal and demo-vault both Ready</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.6; }
.s1 { display: grid; grid-template-columns: 1.6fr 1fr; gap: 2rem; align-items: center; }
.s1 pre { margin: 0 !important; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[7 min] Step 06. Two phases: install Vault, then run the port-forward in its own terminal and set vaultConfigure to true. Then compare the issuers on the two Secrets using the same openssl pipe as verify.sh. If the port-forward drops, restart it and run pulumi up again. The Vault is a dev server with root as the token.
-->

---

# 7 · A renewal changes the serial number

<div class="zoom-content">

<div class="s1">
  <div class="big-code code-sm">

```bash
./renew.sh demo-internal
```

</div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-hash /><span>Prints the serial before and after</span></li>
    <li><ph-arrows-clockwise /><span>cmctl renew marks the Certificate</span></li>
    <li><ph-bell-ringing /><span>The alarm is a separate pulumi up</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.6; }
.s1 { display: grid; grid-template-columns: 1.6fr 1fr; gap: 2rem; align-items: center; }
.s1 pre { margin: 0 !important; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[8 min] Step 07. renew.sh runs cmctl renew, or deletes the Secret if cmctl is missing, then waits for Ready and prints both serials. No redeploy. For the alarm, set alarmThresholdDays to 400 above the remaining days, run pulumi up, then describe-alarms. This forces the ALARM state. No certificate expires, and DaysToExpiry updates only twice a day. cmctl renew is documented on cert-manager.io, but this script has not run live.
-->

---

# 8 · One preview shows no diff

<div class="zoom-content">

<div class="s1">
  <div class="big-code code-sm">

```bash
pulumi preview
```

</div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-package /><span>Two <code>PkiCertificate</code> components</span></li>
    <li><ph-seal-check /><span>Checkout through the AWS issuer</span></li>
    <li><ph-lock-key /><span>Payments through Vault</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.6; }
.s1 { display: grid; grid-template-columns: 1.6fr 1fr; gap: 2rem; align-items: center; }
.s1 pre { margin: 0 !important; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[6 min] Step 08. pulumi up, then pulumi preview. The second preview should show no diff. Show index.ts: a third certificate is a call like the payments one. Preview hung offline for this step, so we confirm in rehearsal.
-->

---

# Six questions, six answers

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>Who is the CA, and where does its key live?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-package class="step-icon" /><div class="gpu-caption gpu-caption--accent">How</div><p>How does a pod get a certificate without a ticket?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-clock class="step-icon" /><div class="gpu-caption gpu-caption--accent">When</div><p>What renews it, and when?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-bell-ringing class="step-icon" /><div class="gpu-caption gpu-caption--accent">Alert</div><p>How do I know it failed to renew before users do?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">Where</div><p>Where do the credentials for all of this live?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-users-three class="step-icon" /><div class="gpu-caption gpu-caption--accent">Scale</div><p>How do 20 teams do this the same way?</p></div>
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
[2.5 min] Come back to the six questions. Who is the CA: two CAs, one managed, one yours. How does a pod get a certificate: a Certificate resource. What renews it: cert-manager, before expiry. How do I know it failed: an alarm and an alert rule. Where do credentials live: Pulumi ESC. How do 20 teams do it the same way: one component. Then teardown: scripts/teardown.sh, and check that both CAs show DELETED.
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/pki-lifecycle-cert-manager-private-ca-vault" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → pki-lifecycle-cert-manager-private-ca-vault</div>
  </div>
  <div class="res-card">
    <QRCode data="https://cert-manager.io/docs/" dark="#000000" />
    <div class="res-card__title">cert-manager documentation</div>
    <div class="res-card__body">cert-manager.io/docs</div>
  </div>
  <div class="res-card">
    <QRCode data="https://docs.aws.amazon.com/privateca/latest/userguide/PcaWelcome.html" dark="#000000" />
    <div class="res-card__title">AWS Private CA user guide</div>
    <div class="res-card__body">docs.aws.amazon.com/privateca</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/esc/" dark="#000000" />
    <div class="res-card__title">Pulumi ESC documentation</div>
    <div class="res-card__body">pulumi.com/docs/esc</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/iac/concepts/resources/components/" dark="#000000" />
    <div class="res-card__title">Pulumi components</div>
    <div class="res-card__body">pulumi.com/docs/iac/components</div>
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
[0.5 min] Resources are on this slide. The repo has the README with the known unverified items.
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
[0.5 min] Point to where to go next.
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/pki-lifecycle-cert-manager-private-ca-vault" dark="#000000" /></div>
      <div class="thanks__qr-label">pki-lifecycle-cert-manager-private-ca-vault</div>
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
[7.5 min] Questions. Keep this time free for them.
-->
