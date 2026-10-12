---
theme: "@pulumi/slidev-theme"
title: "Automating the S3 security baseline as code"
info: |
  Automating the S3 security baseline as code: Package the S3 controls into one component and block buckets that skip them before they deploy.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/aws-s3-security-baseline
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
    Automating the S3 security baseline as code
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Package the S3 controls into one component and block buckets that skip them before they deploy
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>
<!--
[0.5 min] Welcome. Title, one sentence on what the next 90 minutes give them.
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
[1 min] Introduce yourself. Speaker details are placeholders until the speakers are confirmed.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>
<!--
[0.25 min] Quick housekeeping, then the agenda.
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
[0.75 min] Chat, Q&A tab, and where the code lives. Questions at the end get ten minutes.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>The pain: public buckets</li>
  <li>Why it keeps happening</li>
  <li>The baseline as a component</li>
  <li>Credentials and policy</li>
  <li>What we build</li>
  <li>The demo</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>
<!--
[0.5 min] Walk the agenda: the pain, the baseline, the component, credentials and policy, what we build, the demo.
-->

---

# A public S3 bucket exposed Verizon customer data

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">UpGuard, June 2017</div>
    <p>"…a cloud-based Amazon S3 data repository that was fully downloadable and configured to allow public access."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>Up to 14 million US customers, says UpGuard. Verizon says 6 million.</li>
      <li>The bucket was run by an engineer at NICE Systems, a Verizon partner</li>
      <li>Found June 8, reported June 13, closed June 22</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span><strong>No hack needed.</strong> Anyone with the S3 URL could download it</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
[1.75 min] Open on the Verizon and NICE Systems exposure, reported by UpGuard in 2017. Read the quote as written. Give both numbers: UpGuard estimated up to fourteen million customers, Verizon said six million. Say who ran the bucket: an engineer at NICE Systems, a Verizon partner. Timeline: found June 8, UpGuard notified Verizon June 13, closed June 22. The point is the last line: the data could be reached just by entering the S3 URL. One missing setting, nobody caught it. Source: UpGuard, Cloud Leak, read this week.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The baseline is six resources per bucket.</h1>
</div>

<!--
[0.5 min] Say it flat. Not one resource. Six, each its own thing in the program. The next slide shows what happens to six things when people copy them.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Copies drift. Review finds out after the deploy.</h1>
</div>

<!--
[0.5 min] Every team copies the baseline from the last project. Somebody drops one. The review catches it after the bucket exists, if it catches it at all. That is the gap we close today.
-->

---

# Each of the six controls closes one gap

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div v-click class="gpu-card gpu-card--muted step-card"><ph-lock-key class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Public access block</div><p>Four settings that stop public ACLs and policies</p></div>
  <div v-click class="gpu-card gpu-card--muted step-card"><ph-user-check class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Ownership controls</div><p>ACLs off, the bucket owner owns every object</p></div>
  <div v-click class="gpu-card gpu-card--muted step-card"><ph-key class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Default encryption</div><p>SSE-S3 is automatic; explicit config is for audit and KMS</p></div>
  <div v-click class="gpu-card gpu-card--muted step-card"><ph-clock-counter-clockwise class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Versioning</div><p>Recover from unintended deletes and overwrites</p></div>
  <div v-click class="gpu-card gpu-card--muted step-card"><ph-hourglass class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Lifecycle rules</div><p>Expire old versions, abort stalled uploads</p></div>
  <div v-click class="gpu-card gpu-card--muted step-card"><ph-shield-check class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">TLS-only policy</div><p>Deny any request that is not HTTPS</p></div>
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
[2.0 min] Walk the six, one line each. Public access block has four independent settings. Ownership controls with bucket owner enforced turn ACLs off. Encryption: S3 already applies SSE-S3 to new objects, since January 2023, so the explicit resource is for audit and for choosing KMS. Versioning lets you recover from unintended actions. Lifecycle keeps old versions from piling up. The TLS-only policy uses the aws:SecureTransport condition AWS recommends. Sources: AWS S3 user guide pages, read this week.
-->

---

# Encryption is on by default, so why configure it?

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Without a resource</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>S3 applies SSE-S3 to every new object</li>
      <li>Nothing in the program says so</li>
      <li>Nobody chose the key</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">With the resource</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>The setting is in code and in review</li>
      <li>An audit finds it in the stack</li>
      <li>KMS is a choice you can make</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1.25 min] People ask this every time. AWS encrypts new objects with SSE-S3 automatically, at no charge, since January 5, 2023. So the explicit resource does not add encryption. It adds a record in code that an audit can read, and the place where you choose KMS instead. Be honest about that.
-->

---

# Versioning protects objects, lifecycle keeps the cost down

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Versioning</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Keeps every version of an object</li>
      <li>Recovers from unintended deletes</li>
      <li>Old versions pile up</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Lifecycle rules</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Expire noncurrent versions after 30 days</li>
      <li>Abort incomplete uploads after 7 days</li>
      <li>The numbers the demo sets</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1.25 min] Versioning is the delete case: someone removes an object by mistake and you get it back. The price is that old versions stay. The lifecycle rule in the demo expires noncurrent versions after thirty days and aborts incomplete multipart uploads after seven. Those are the demo's numbers, not a recommendation for every account.
-->

---

# Five questions before you trust a baseline

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card"><ph-list-checks class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">What</div><p>What is in the baseline?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-package class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">How</div><p>How do we stop every team retyping it?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-prohibit class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Skip</div><p>How do we stop someone skipping it?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-key class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Keys</div><p>How do we run this without static AWS keys?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-users-three class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Reach</div><p>How does it reach every team?</p></div>
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
[1.25 min] These five are the spine of the talk. The first one we just answered: six controls. The other four are the rest of the slides and the demo. Keep them in mind, we come back to this grid three times.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How do we stop each team from retyping it?</h1>
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
[0.25 min] Section one. Question two of five. Short pause, then the component.
-->

---

# One component replaces six resources per bucket

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Without a component</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Seven resources typed per bucket</li>
      <li>Each copy can drop one</li>
      <li>Review reads every file</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">With SecureBucket</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>One resource in the program</li>
      <li>The six companions come with it</li>
      <li>Review reads the component once</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1.75 min] A SecureBucket is a Pulumi IaC component: a ComponentResource written in TypeScript. The caller writes one resource. The component creates the bucket and its six companions. Seven, counting the bucket. Review moves from every file to one place.
-->

---

# Children name the parent, and the order is explicit

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-cube class="plan__icon" />
    <p>SecureBucket is the component, the parent</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-stack class="plan__icon" />
    <p>Each child sets parent: this, so it nests under it</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-lock-key class="plan__icon" />
    <p>The public access block comes first</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-link class="plan__icon" />
    <p>Four more companions wait for it with dependsOn</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-info class="plan__foot-icon" />
  <p>A component calls registerOutputs at the end to say it is done.</p>
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
[1.75 min] The component docs say a component groups resources into one node with children underneath. Every child sets the parent to the component. Then the order: the public access block is created first and ownership, encryption, versioning and the policy use dependsOn on it, and lifecycle waits for versioning, so the order is explicit. Last line of the constructor registers the outputs.
-->

---

# The demo avoids the deprecated V2 resources

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">In old examples</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>BucketV2 and the V2 variants</li>
      <li>The registry marks them deprecated</li>
      <li>Copy them and you copy the debt</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">In this demo</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>aws.s3.Bucket and six companions</li>
      <li>Public access block, ownership, encryption</li>
      <li>Versioning, lifecycle, bucket policy</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[0.75 min] Search results still show the V2 resources. The Pulumi registry marks them deprecated. The demo uses only the current names, so what you copy from the repo is safe to keep.
-->

---

# Two of five answered

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-list-checks class="step-icon" /><div class="gpu-caption gpu-caption--accent">What</div><p>Six controls</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-package class="step-icon" /><div class="gpu-caption gpu-caption--accent">How</div><p>A SecureBucket component</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-prohibit class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Skip</div><p>How do we stop someone skipping it?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-key class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Keys</div><p>How do we run this without static AWS keys?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-users-three class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Reach</div><p>How does it reach every team?</p></div>
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
[0.5 min] Questions one and two are answered. The highlighted cards are done. Three to go.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How do we stop someone from skipping it?</h1>
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
[0.25 min] Section two. A new component does not help if a team never uses it. Pulumi Policies is the answer.
-->

---

# The enforcement level decides what a violation does

<div class="zoom-content">

<div class="grid grid-cols-2 gap-6 mt-4">
  <div v-click class="gpu-card gpu-card--muted step-card"><ph-warning class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Advisory</div><p>Prints a warning, the update goes on</p></div>
  <div v-click class="gpu-card gpu-card--primary step-card"><ph-hand-palm class="step-icon" /><div class="gpu-caption gpu-caption--accent">Mandatory</div><p>Blocks the update before it runs</p></div>
  <div v-click class="gpu-card gpu-card--muted step-card"><ph-wrench class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Remediate</div><p>Fixes the violation</p></div>
  <div v-click class="gpu-card gpu-card--muted step-card"><ph-prohibit class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Disabled</div><p>The policy is switched off</p></div>
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
[0.75 min] Pulumi Policies packs have four enforcement levels, from the policy SDK. Advisory warns. Mandatory blocks. Remediate fixes the violation. Disabled turns it off. The demo's three policies are all mandatory, so a violation stops the preview.
-->

---

# A stack policy sees the whole graph, a resource policy sees one

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Resource validation</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Runs once per resource</li>
      <li>Checks that bucket's own inputs</li>
      <li>Cannot ask what else exists</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Stack validation</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Runs once with every resource</li>
      <li>Finds companions of a bucket</li>
      <li>Can say what is missing</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1.25 min] The SDK has two kinds. Resource validation looks at one resource at a time. Stack validation gets all resources in the stack. We need the second kind to say that a bucket is missing its companions. At preview it sees the dependency from each companion to its bucket. The pack's three policies: has-baseline, public access block all on, versioning enabled.
-->

---

# Three policies, all mandatory, make up the pack

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div v-click class="gpu-card gpu-card--primary step-card"><ph-list-checks class="step-icon" /><div class="gpu-caption gpu-caption--accent">s3-bucket-has-baseline</div><p>Every bucket has the six companion resources</p></div>
  <div v-click class="gpu-card gpu-card--primary step-card"><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">s3-public-access-block-all-on</div><p>A public access block keeps all four settings on</p></div>
  <div v-click class="gpu-card gpu-card--primary step-card"><ph-clock-counter-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--accent">s3-versioning-enabled</div><p>Bucket versioning is Enabled</p></div>
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
[1.25 min] These are the three policies in the demo's pack. The first is the big one: it reports one violation per missing companion. The other two check values: all four public access settings on, versioning enabled. All three are mandatory.
-->

---

# The pack runs at preview, before anything is created

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-code class="plan__icon" />
    <p>Your program describes the stack</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-list-checks class="plan__icon" />
    <p>Pulumi IaC computes the resource graph</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-shield-check class="plan__icon" />
    <p>The pack checks the graph</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-x-circle class="plan__icon" />
    <p>A mandatory violation stops the preview</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-info class="plan__foot-icon" />
  <p>Pulumi Neo can draft a policy pack, says the authoring page. We only mention it today.</p>
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
[1.25 min] The pack runs locally with the policy-pack flag on pulumi preview. Preview already builds the resource graph, and the pack checks it. A mandatory violation stops it before any AWS call to create a bucket. The authoring page also says Pulumi Neo can generate pack content. That is a mention, we do not demo it.
-->

---

# Three of five answered

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-list-checks class="step-icon" /><div class="gpu-caption gpu-caption--accent">What</div><p>Six controls</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-package class="step-icon" /><div class="gpu-caption gpu-caption--accent">How</div><p>A SecureBucket component</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-prohibit class="step-icon" /><div class="gpu-caption gpu-caption--accent">Skip</div><p>A policy pack that fails preview</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-key class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Keys</div><p>How do we run this without static AWS keys?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-users-three class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Reach</div><p>How does it reach every team?</p></div>
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
[0.5 min] Three answered. Next: credentials. Two to go.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How do we run this without static AWS keys?</h1>
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
[0.25 min] Section three. The pack and the component need AWS credentials. No keys on disk.
-->

---

# Pulumi ESC trades a short-lived token for AWS credentials

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-cloud class="plan__icon" />
    <p>Pulumi Cloud issues a short-lived OIDC token</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-identification-badge class="plan__icon" />
    <p>It assumes an IAM role in your account</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-key class="plan__icon" />
    <p>AWS returns temporary credentials</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-terminal-window class="plan__icon" />
    <p>pulumi env run hands them to one command</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-info class="plan__foot-icon" />
  <p>No long-lived keys to store or rotate. The role must trust Pulumi Cloud first.</p>
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
[1.25 min] The ESC aws-login provider: Pulumi Cloud exchanges a short-lived OIDC token for temporary AWS credentials by assuming an IAM role. So there are no long-lived keys to store or rotate. The command carries them into a single child process. Setup needs the OIDC identity provider and the role in the sandbox account, the presenter prepared it.
-->

---

# Four of five answered

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-list-checks class="step-icon" /><div class="gpu-caption gpu-caption--accent">What</div><p>Six controls</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-package class="step-icon" /><div class="gpu-caption gpu-caption--accent">How</div><p>A SecureBucket component</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-prohibit class="step-icon" /><div class="gpu-caption gpu-caption--accent">Skip</div><p>A policy pack that fails preview</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">Keys</div><p>Pulumi ESC with OIDC</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-users-three class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Reach</div><p>How does it reach every team?</p></div>
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
[0.5 min] Four answered, one to go. The last one we show: how the pack reaches every team.
-->

---

# Three ways to reach every team

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div v-click class="gpu-card gpu-card--muted step-card"><ph-folder class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Local pack</div><p>Run it from a path with the policy-pack flag</p></div>
  <div v-click class="gpu-card gpu-card--primary step-card"><ph-buildings class="step-icon" /><div class="gpu-caption gpu-caption--accent">Policy group</div><p>Publish the pack, enforce it on stacks. Two docs pages list different editions</p></div>
  <div v-click class="gpu-card gpu-card--muted step-card"><ph-package class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Component package</div><p>Publish SecureBucket so teams import it</p></div>
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
[1.25 min] Three routes. The local pack is what we use first, it needs no Pulumi Cloud edition. A policy group in Pulumi Cloud enforces a published pack on chosen stacks. Be careful with the edition: the policy groups page says Pro and Enterprise, the policy overview adds Essentials, so the demo step is optional and shown on the presenter's org only. And the component can be published as a package so teams import it.
-->

---

# Where this breaks today

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">What it does not cover</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Buckets created outside Pulumi programs</li>
      <li>Anything beyond the six controls</li>
      <li>The edition question for policy groups</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">What to do about it</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Run it where every bucket is created</li>
      <li>Grow the pack one control at a time</li>
      <li>Ask Pulumi before you promise a group</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1.25 min] Be plain. The pack checks what Pulumi previews, so a bucket made by hand in the console is not seen. Six controls are a baseline, not all of S3 security. And the policy group edition needs checking, because two docs pages list different editions.
-->

---

# The program and the pack run on your machine

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-laptop class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Your machine, before anything is created</div></div>
    <ul class="zone__list">
      <li><ph-folder-open /><span>The Pulumi IaC program and SecureBucket</span></li>
      <li><ph-shield-check /><span>The local policy pack</span></li>
      <li><ph-terminal-window /><span>The <code>pulumi preview</code> that runs both</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption">Pulumi Cloud</div></div>
    <ph-key class="zone__hero" />
    <p>The ESC environment and the stack</p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">Then AWS</div>
  <p>The bucket is created in eu-central-1, with the baseline attached.</p>
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
[1.0 min] One more picture of the same build. On your machine: the program, the component, the pack, and the preview that runs them. In Pulumi Cloud: the ESC environment that holds the OIDC setup, and the stack. AWS only sees a bucket with its baseline attached, after the pack allows it.
-->

---

# The demo builds one guarded path to a secure bucket

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-key class="plan__icon" />
    <p>ESC gives short-lived AWS credentials</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-cube class="plan__icon" />
    <p>SecureBucket creates the bucket and six companions</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-shield-check class="plan__icon" />
    <p>The pack blocks a bare bucket at preview</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-cloud-check class="plan__icon" />
    <p>Pulumi IaC deploys it to eu-central-1</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="5" />
  <div class="gpu-card plan__step" v-click="5">
    <span class="plan__num">5</span>
    <ph-terminal-window class="plan__icon" />
    <p>The AWS CLI reads every control back</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="6">
  <ph-info class="plan__foot-icon" />
  <p>Five parts, one flow. Question five closes with the optional policy group.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.15; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
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
[1.25 min] This is what we build. Credentials from ESC. The SecureBucket component. The pack as the gate. Deploy to Frankfurt. Then read every control back with the AWS CLI.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: S3 security baseline.</h1>
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
[0.25 min] Demo time. Fifty minutes. Terminal and editor, slides are the map.
-->

---

# What we are going to do

<div class="zoom-content mt-10">

<div class="steps">
  <div class="gpu-card step" v-click><ph-folder-plus class="step__icon" /><p>An empty project and a stack</p></div>
  <div class="gpu-card step" v-click><ph-key class="step__icon" /><p>ESC hands over AWS credentials</p></div>
  <div class="gpu-card step" v-click><ph-identification-card class="step__icon" /><p>The caller identity proves it</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-warning class="step__icon" /><p>A bare bucket fails the pack</p></div>
  <div class="gpu-card step" v-click><ph-shield-check class="step__icon" /><p>Three policies, one message per gap</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-cube class="step__icon" /><p>SecureBucket passes the same pack</p></div>
  <div class="gpu-card step" v-click><ph-git-merge class="step__icon" /><p>A mixed stack blocks only the bare one</p></div>
  <div class="gpu-card step" v-click><ph-rocket-launch class="step__icon" /><p>Deploy to eu-central-1</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-magnifying-glass class="step__icon" /><p>Read every control back from AWS</p></div>
  <div class="gpu-card step" v-click><ph-trash class="step__icon" /><p>Destroy and confirm no bucket is left</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.0; }
.steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.9rem; }
.step { display: flex; flex-direction: column; gap: 0.7rem; padding: 0.9rem 1rem; }
.step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.step__icon { font-size: 2rem; color: var(--p-primary); }
</style>

<!--
[0.75 min] This is the map. Ten outcomes, left to right, top to bottom. Step eleven, the policy group, is optional and sits behind the edition question. Everything runs through pulumi env run, so no static key appears anywhere. Set ORG once at the start.
-->

---

# 1 · An empty project has nothing to block

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />01-new-project</div>
    <div class="big-code code-sm">

```bash
pulumi preview
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-package /><span>Only the stack resource shows</span></li>
    <li><ph-map-pin /><span>Region is eu-central-1</span></li>
    <li><ph-check /><span>Node 22 or newer</span></li>
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
[2.25 min] Step one. Show the empty program, then preview. Only the stack appears. Pinned versions are in the README.
-->

---

# 2 and 3 · ESC hands over credentials, the caller identity proves it

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />03-verify-credentials</div>
    <div class="big-code code-sm">

```bash
./03-verify-credentials/verify-identity.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-identification-badge /><span>The role trusts Pulumi Cloud</span></li>
    <li><ph-user /><span>The ARN shows an assumed role</span></li>
    <li><ph-lock /><span>No key in the repo</span></li>
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
[5.5 min] Steps two and three. Open environment.yaml first, then run the script. The role ARN is the presenter's own. Then verify-identity.sh runs aws sts get-caller-identity through pulumi env run. Point at the assumed-role ARN. No static key is in the repository.
-->

---

# 4 and 5 · A bare bucket fails the pack with six violations

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />04-bare-bucket</div>
    <div class="big-code code-sm">

```bash
pulumi preview \
  --policy-pack ../05-policy-pack/policy
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-cube /><span>One aws.s3.Bucket, nothing else</span></li>
    <li><ph-x-circle /><span>Six s3-bucket-has-baseline violations</span></li>
    <li><ph-hand-palm /><span>Mandatory: the preview fails</span></li>
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
[7.5 min] Steps four and five. Open index.ts: one bare bucket, never deployed. Then open the pack: three policies, all mandatory. Run the preview with the pack. Six violations, one message per missing companion.
-->

---

# 6 and 7 · SecureBucket creates the bucket and six companions, the pack passes

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />06-secure-bucket</div>
    <div class="big-code code-sm">

```bash
pulumi preview \
  --policy-pack ../05-policy-pack/policy
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-cube /><span>Stack, component, bucket, six companions</span></li>
    <li><ph-check-circle /><span>The same pack passes</span></li>
    <li><ph-file-code /><span>secureBucket.ts holds the six</span></li>
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
[10.0 min] Steps six and seven share a folder. Write the component in secureBucket.ts, then use it in index.ts. The preview shows nine resources. Then run the pack on it with the same command as step five: it passes. That is the contrast we came for.
-->

---

# 8 · A mixed stack blocks only the bare bucket

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />08-mixed-stack</div>
    <div class="big-code code-sm">

```bash
pulumi preview \
  --policy-pack ../05-policy-pack/policy
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-cube /><span>SecureBucket plus one bare bucket</span></li>
    <li><ph-x-circle /><span>Six violations, bare bucket only</span></li>
    <li><ph-check /><span>The secure one passes</span></li>
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
[4.5 min] Step eight. A stack with both. Preview with the pack: it blocks only the bare bucket. Ten resources in the preview.
-->

---

# 9 · Deploy goes through the pack and ESC

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />09-deploy</div>
    <div class="big-code code-sm">

```bash
./09-deploy/deploy.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-lock /><span>Credentials via pulumi env run</span></li>
    <li><ph-shield-check /><span>The pack runs on pulumi up</span></li>
    <li><ph-rocket-launch /><span>The bucket lands in eu-central-1</span></li>
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
[5.5 min] Step nine. The script runs pulumi up with the policy pack, through ESC.
-->

---

# 10 · AWS confirms every control

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />10-verify-controls</div>
    <div class="big-code code-sm">

```bash
./10-verify-controls/verify-controls.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-lock-key /><span>Public access block</span></li>
    <li><ph-key /><span>Default encryption and versioning</span></li>
    <li><ph-shield-check /><span>TLS-only policy denies plain HTTP</span></li>
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
[8.0 min] Step ten. Six aws s3api reads: public access block, encryption, versioning, lifecycle, policy, ownership. Then a plain HTTP upload that must be denied.
-->

---

# 11 · Optional: publish the pack to a policy group

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />11-policy-group</div>
    <div class="big-code code-sm">

```bash
./11-policy-group/publish-policy.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-warning /><span>Optional: two docs pages list different editions</span></li>
    <li><ph-buildings /><span>Needs a Pulumi Cloud org</span></li>
    <li><ph-hand-palm /><span>Enforces the pack on a stack</span></li>
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
[3.5 min] Step eleven is optional. Say the edition conflict out loud, then run only if the org allows it.
-->

---

# 12 · Teardown leaves no bucket behind

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />12-teardown</div>
    <div class="big-code code-sm">

```bash
./12-teardown/teardown.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-trash /><span>Destroys the stack and the environment</span></li>
    <li><ph-list-bullets /><span>list-buckets shows what is left</span></li>
    <li><ph-check /><span>Nothing from the demo remains</span></li>
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
[2.5 min] Step twelve. The script destroys, removes the stack, lists buckets with the AWS CLI, then removes the environment.
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/aws-s3-security-baseline" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → aws-s3-security-baseline</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/insights/policy/policy-packs/authoring/" dark="#000000" />
    <div class="res-card__title">Write your own policy packs</div>
    <div class="res-card__body">pulumi.com/docs/insights/policy</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/iac/concepts/components/" dark="#000000" />
    <div class="res-card__title">Component resources</div>
    <div class="res-card__body">pulumi.com/docs/iac/concepts/components</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/aws-login/" dark="#000000" />
    <div class="res-card__title">Pulumi ESC: AWS login with OIDC</div>
    <div class="res-card__body">pulumi.com/docs/esc</div>
  </div>
  <div class="res-card">
    <QRCode data="https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html" dark="#000000" />
    <div class="res-card__title">AWS: S3 security best practices</div>
    <div class="res-card__body">docs.aws.amazon.com/AmazonS3</div>
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
[0.5 min] Four links to open after the session. The repo QR codes resolve once the pull request is merged.
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
[0.5 min] Where to go next with Pulumi.
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/aws-s3-security-baseline" dark="#000000" /></div>
      <div class="thanks__qr-label">aws-s3-security-baseline</div>
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
[10.25 min] Thank them. Ten minutes of questions. Park anything about the optional policy group edition in the repo issues.
-->

