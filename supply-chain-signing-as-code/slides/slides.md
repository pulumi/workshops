---
theme: "@pulumi/slidev-theme"
title: "Supply chain signing as code"
info: |
  Supply chain signing as code: Sign a container image with Notation, block unsigned images at admission, and scan cluster posture with Kubescape, all provisioned as Pulumi code..
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/supply-chain-signing-as-code
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
    Supply chain signing as code
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Sign a container image with Notation, block unsigned images at admission, and scan cluster posture with Kubescape, all provisioned as Pulumi code.
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
[1 min] Welcome. Ninety minutes: a short story about image trust, the tech that answers it, then we build it.
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
[2 min] Introduce the speakers: who you are and why image trust matters to you.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
[1 min] Housekeeping and agenda come next. Check that everyone can see the screen and has the repo link.
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
[1 min] Housekeeping: questions are welcome any time, the repo is public after the workshop, and the demo runs live.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>The trust gap in container images</li>
  <li>Signing with Notation</li>
  <li>Admission enforcement with Kyverno</li>
  <li>Cluster posture with Kubescape</li>
  <li>Live demo</li>
  <li>Wrap-up and Q&A</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
[2 min] Walk the agenda: the pain, the tech, the solution we build, then the demo.
-->

---

# 1,652 of 250,000 public images were malicious

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">Sysdig Threat Research Team, 2022</div>
    <p>"As expected, cryptomining images are the most common malicious image type."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>Over 250,000 Linux images analysed on Docker Hub</li>
      <li>Official and verified images were excluded</li>
      <li>1,652 were identified as malicious</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span><strong>Source:</strong> sysdig.com, "Analysis of supply chain attacks through public Docker images"</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
[3 min] Start with a number from outside our own world. In 2022 the Sysdig Threat Research Team analysed over 250,000 Linux images on Docker Hub, leaving out official and verified images. They identified 1,652 as malicious. Their own words: cryptomining images are the most common malicious type. Nobody on that list was careless in an exotic way. They pulled an image that looked like the one they wanted.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">61% of all images pulled come from public repositories.</h1>
  <p class="!mt-8 !text-[1.4rem] opacity-70">Sysdig 2022 Cloud-Native Security and Usage Report, as cited in the same article</p>
</div>

<!--
[1.5 min] Same research team, their 2022 usage report: 61% of all images pulled come from public repositories. So the exposure is the default way people get images, not an edge case.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">You can scan an image for what is inside it.</h1>
</div>

<!--
[1.5 min] Here is the tension. Scanners are good at contents. You can look inside a layer and find a miner or an embedded secret. Pause here for a second and let people nod.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">You can't tell who built it.</h1>
</div>

<!--
[1.5 min] A scan says what is in the image. It does not say who published it, or whether it is the same bytes the publisher released. That second question is what the next hour is about.
-->

---

# A pull succeeds whether or not the publisher is known

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">A tag</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Can be overwritten, unless the repository turns on tag immutability</li>
      <li>Says nothing about who pushed it</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">A digest</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Immutable</li>
      <li>What a Notation signature is made over</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[2.5 min] Why is this hard. A tag is a name. Amazon ECR even has a setting to stop tags from being overwritten, which tells you tags can be overwritten otherwise. A digest cannot change. The Notation docs say to always use the digest because it is immutable, and Notation resolves a tag to its digest before it signs. So a signature binds a publisher to exact bytes, which a tag never could.
-->

---

# Six questions decide whether you trust a pipeline

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">1 · Who</div><p>Who built this image?</p></div>
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">2 · Changed</div><p>Has it changed since they signed it?</p></div>
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-shield-warning class="step-icon" /><div class="gpu-caption gpu-caption--accent">3 · Stop</div><p>What stops an unsigned image at deploy?</p></div>
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">4 · Keys</div><p>Where do the keys and trust live?</p></div>
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--accent">5 · Cluster</div><p>Is the cluster itself sound?</p></div>
  <div class="gpu-card gpu-card--primary step-card" v-click><ph-rocket-launch class="step-icon" /><div class="gpu-caption gpu-caption--accent">6 · Rebuild</div><p>Can we rebuild all of it from code?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[2 min] These six questions are the spine of the session. Who built it, has it changed since, what stops an unsigned image, where do keys and trust live, is the cluster sound, and can we rebuild it all from code. Read them out slowly. We answer them in a different order than they are numbered, because the first two share an answer.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">A signature answers who built it and whether it changed.</h1>
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
[0.5 min] Section one covers questions one and two.
-->

---

# A signature is tied to an image digest in the registry

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-package class="plan__icon" />
    <p>Push the image to the registry</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-seal-check class="plan__icon" />
    <p><code>notation sign</code> resolves the tag to a digest</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-cloud-check class="plan__icon" />
    <p>The signature is associated with the image</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-check-circle class="plan__icon" />
    <p>Verification checks it against a trust policy</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p>The image must be in the registry before there is a digest to sign.</p>
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
[3.5 min] Notation is the Notary Project's CLI. You sign a container image that lives in a registry such as Amazon ECR, and notation ls lists the signatures associated with that image. That is why the demo pushes first and signs second. If you pass a tag, Notation resolves it to the digest and signs the digest. Verification then runs against a trust policy, which is the next section.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Trust is a policy you write down.</h1>
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
[0.5 min] Section two covers question four: where keys and trust live.
-->

---

# A trust policy says which signatures count

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-package class="chain__icon" />
    <div class="gpu-caption">Scope</div>
    <code>registryScopes</code>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-vault class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Certificates</div>
    <code>trustStores</code>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-user-circle class="chain__icon" />
    <div class="gpu-caption">Signers</div>
    <code>trustedIdentities</code>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>The doc's example sets <code>signatureVerification</code> to level <code>strict</code>.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
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
[3 min] The Notary Project docs show the shape of a trust policy as JSON. It has a name, the registry scopes it applies to, a signature verification level, the trust stores that hold certificates, and the trusted identities. The doc's example uses level strict. Key point: trust is explicit and lives in a file you can review and version, not in someone's memory.
-->

---

# The demo signs with a local test key

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--muted zone" v-click>
    <div class="zone__head"><ph-laptop class="zone__icon" /><div class="gpu-caption gpu-caption--muted">Demo</div></div>
    <ul class="zone__list">
      <li><ph-key /><span>A test key from <code>notation cert generate-test</code></span></li>
      <li><ph-certificate /><span>A self-signed certificate</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--primary zone zone--cloud" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption gpu-caption--accent">AWS Signer</div></div>
    <ph-seal-check class="zone__hero" />
    <p>A Signer profile defines the signing environment</p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">The limit</div>
  <p>A self-signed test certificate proves the flow, not production trust.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
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
[3 min] Be honest about what is real here. The Notation quickstart generates a test key and a self-signed certificate, and that is what we use, so the demo runs on a laptop. For AWS, Amazon's docs say AWS Signer gives security administrators one place to define the signing environment, including which IAM role can sign, and that you can sign container images in Amazon ECR with the Notation CLI. The demo's Pulumi program creates the profile. Production would put a real certificate authority behind it.
-->

---

# Three questions covered, three to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">1 · Who</div><p>A Notation signature</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">2 · Changed</div><p>A signature over the digest</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-warning class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">3 · Stop</div><p>What stops an unsigned image at deploy?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">4 · Keys</div><p>Trust policy and trust store</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-cube class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">5 · Cluster</div><p>Is the cluster itself sound?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-rocket-launch class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">6 · Rebuild</div><p>Can we rebuild all of it from code?</p></div>
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
[1 min] Recap. Questions one, two and four are answered. Signatures say who and whether it changed, the trust policy says which signatures we accept. Three to go.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Kyverno stops an unsigned image at admission.</h1>
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
[0.5 min] Section three covers question three.
-->

---

# Kyverno rejects the pod before it runs

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-terminal-window class="chain__icon" />
    <div class="gpu-caption">You</div>
    <code>kubectl apply</code>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-shield-check class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Kyverno</div>
    <span>Admission webhook checks the signature</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-cube class="chain__icon" />
    <div class="gpu-caption">Cluster</div>
    <span>Signed pods run</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>Kyverno docs: a pod with an unsigned image is blocked.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
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
[3 min] This is the enforcement point. The Kyverno docs have a Notary page with a verifyImages rule, and they show that running a pod with an unsigned image is blocked, with an error from the admission webhook that says the request was denied. The check happens at admission, so the unsigned pod never starts.
-->

---

# Four fields in one rule decide what gets blocked

<div class="zoom-content">

<div class="bounds">
  <div class="bound" v-click><ph-seal-check /><div class="bound__want"><code>type: Notary</code></div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Verify Notary signatures</div></div>
  <div class="bound" v-click><ph-package /><div class="bound__want"><code>imageReferences</code></div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Which images the rule covers</div></div>
  <div class="bound" v-click><ph-shield-warning /><div class="bound__want"><code>failureAction: Enforce</code></div><ph-arrow-right class="bound__arrow" /><div class="bound__by">A failed check blocks the pod</div></div>
  <div class="bound" v-click><ph-vault /><div class="bound__want"><code>attestors</code></div><ph-arrow-right class="bound__arrow" /><div class="bound__by">The certificate that must have signed</div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
.bounds { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem 1.4rem; }
.bound { display: grid; grid-template-columns: auto 9.5rem auto 1fr; align-items: center; gap: 0.7rem; padding: 0.8rem 1rem; border: 1.5px solid var(--p-border); border-radius: 14px; background: var(--p-bg-elevated); }
.bound > svg:first-child { font-size: 1.5rem; color: var(--p-primary); }
.bound__want { font-family: var(--slidev-font-mono); font-size: 0.92rem; font-weight: 600; color: var(--p-fg-muted); }
.bound__arrow { font-size: 1.1rem; color: var(--p-accent); }
.bound__by { font-size: 1.05rem; line-height: 1.3; color: var(--p-fg); }
</style>

<!--
[2.5 min] These four fields come straight from the Kyverno docs example for Notary. The type, which images the rule covers, the failure action Enforce, and the attestors with the certificate. Nothing hidden: the policy is a short YAML document, and in our demo it is Pulumi code that emits it.
-->

---

# Four questions covered, two to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">1 · Who</div><p>A Notation signature</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">2 · Changed</div><p>A signature over the digest</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-shield-warning class="step-icon" /><div class="gpu-caption gpu-caption--accent">3 · Stop</div><p>Kyverno verifyImages at admission</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">4 · Keys</div><p>Trust policy and trust store</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-cube class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">5 · Cluster</div><p>Is the cluster itself sound?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-rocket-launch class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">6 · Rebuild</div><p>Can we rebuild all of it from code?</p></div>
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
[1 min] Four down. An unsigned image cannot enter. The cluster that enforces this still has to be sound, and we still have to rebuild it all from code.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Kubescape reports how sound the cluster is.</h1>
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
[0.5 min] Section four covers question five.
-->

---

# A Kubescape scan counts controls that failed, passed or need setup

<div class="zoom-content">

<div class="modes">
  <div class="gpu-card gpu-card--primary mode" v-click>
    <div class="mode__head"><ph-shield-warning class="mode__icon" /><code class="mode__name">12</code></div>
    <p>controls failed: at least one object did not meet them</p>
  </div>
  <div class="gpu-card mode" v-click>
    <div class="mode__head"><ph-check-circle class="mode__icon" /><code class="mode__name">10</code></div>
    <p>controls passed</p>
  </div>
  <div class="gpu-card gpu-card--accent mode" v-click>
    <div class="mode__head"><ph-wrench class="mode__icon" /><code class="mode__name">2</code></div>
    <p>controls need configuration before they can be evaluated</p>
  </div>
</div>

<div class="gates" v-click>
  <div class="gpu-caption gpu-caption--accent">Kubescape docs: NSA framework example, 24 controls</div>
  <ph-caret-right class="gates__sep" />
  <span class="gate"><ph-eye /><code>--verbose</code> shows the fix</span>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.modes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; align-items: stretch; }
.mode { display: flex; flex-direction: column; gap: 0.9rem; padding-inline: 1.4rem; }
.mode p { margin: 0 !important; font-size: 1.15rem; line-height: 1.35; }
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
[2.5 min] The Kubescape getting-started page walks through an NSA framework scan. In that example the framework has 24 controls: 12 failed, 10 passed, and 2 need configuration before they can be evaluated. A failed control means at least one object in the cluster did not meet it. Run again with verbose and you get Kubescape's suggestion for how to fix each failure. These numbers are from the docs example, not from our cluster. We will see our own numbers in the demo.
-->

---

# Five questions answered, one to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">1 · Who</div><p>A Notation signature</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">2 · Changed</div><p>A signature over the digest</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-shield-warning class="step-icon" /><div class="gpu-caption gpu-caption--accent">3 · Stop</div><p>Kyverno verifyImages at admission</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">4 · Keys</div><p>Trust policy and trust store</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--accent">5 · Cluster</div><p>A Kubescape scan</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-rocket-launch class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">6 · Rebuild</div><p>The demo answers this one</p></div>
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
[1 min] Five answered. The last question, can we rebuild all of it from code, is the demo.
-->

---

# Where this breaks today

<div class="zoom-content">

<div class="term">
  <div class="term__bar"><span /><span /><span /><div class="term__title">limits of this demo</div></div>
  <div class="term__row term__row--demo" v-click>
    <code class="term__flag">test key</code>
    <div class="term__desc">self-signed certificate, not a production CA</div>
  </div>
  <div class="term__row term__row--demo" v-click>
    <code class="term__flag">ClusterPolicy</code>
    <div class="term__desc">marked deprecated in the Kyverno docs</div>
  </div>
  <div class="term__row term__row--demo" v-click>
    <code class="term__flag">Kubescape</code>
    <div class="term__desc">reports findings, Kyverno does the blocking</div>
  </div>
  <div class="term__row" v-click>
    <code class="term__flag">kind</code>
    <div class="term__desc">a local cluster, not a managed one</div>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
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
[3 min] Four limits, stated plainly. The key is a test key with a self-signed certificate, so this proves the flow and not production trust. Kyverno's current docs list ClusterPolicy as deprecated, with ImageValidatingPolicy as the newer policy type, and we still use the ClusterPolicy verifyImages form because it is documented and works. Kubescape tells you what failed, and Kyverno is the part that blocks. And the cluster is kind on a laptop. Say these out loud, because trust comes from naming limits.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Pulumi IaC answers the last question.</h1>
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
[1 min] Last section. Can we rebuild all of it from code? One Pulumi program says yes. Short pause here.
-->

---

# One Pulumi program builds the registry, the cluster and the policy

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-laptop class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Your machine</div></div>
    <ul class="zone__list">
      <li><ph-cube /><span>A kind cluster</span></li>
      <li><ph-shield-check /><span>Kyverno and the image-verification policy</span></li>
      <li><ph-terminal-window /><span>The <code>notation</code> and <code>kubescape</code> CLIs</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption">AWS</div></div>
    <ul class="zone__list">
      <li><ph-package /><span>An ECR repository</span></li>
      <li><ph-seal-check /><span>An AWS Signer profile</span></li>
    </ul>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">The state lives in</div>
  <p>Pulumi Cloud, one stack.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
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
[2.5 min] Here is what we build. A single Pulumi TypeScript program creates the ECR repository and the Signer profile in AWS, a kind cluster on the laptop, the Kyverno Helm chart, and the verification policy. The notation and kubescape CLIs are installed on the presenter machine. Pulumi's docs describe resources as the units that make up your infrastructure, for example a storage bucket or a Kubernetes cluster, and that is the model here.
-->

---

# The policy is ordinary Pulumi code

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-code />01-platform/index.ts, abridged</div>
    <div class="big-code code-sm">

```ts
new k8s.apiextensions.CustomResource("verify-notation-signature", {
  kind: "ClusterPolicy",
  spec: { rules: [{ verifyImages: [{
    type: "Notary",
    imageReferences: [pulumi.interpolate`${repository.repositoryUrl}*`],
    failureAction: "Enforce",
    attestors: [{ entries: [{ certificates: { cert: signingCert } }] }],
  }] }] },
});
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-package /><span>The registry URL comes from the ECR resource</span></li>
    <li><ph-vault /><span>The certificate comes from the demo key</span></li>
    <li><ph-shield-check /><span>Enforce blocks unsigned images</span></li>
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
[2 min] This is the only program code in the deck, and it is abridged. Same fields as the Kyverno example, but the image reference is built from the ECR repository's URL and the certificate comes from the key we generate. Because it is code in a Pulumi program, the registry and the policy that protects it are created together and stay in step.
-->

---

# pulumi up creates or updates every resource in the stack

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-note-pencil class="plan__icon" />
    <p>Describe resources in TypeScript</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-rocket-launch class="plan__icon" />
    <p><code>pulumi up</code> in one stack</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-cloud-check class="plan__icon" />
    <p>Registry, cluster, policy exist</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-check-circle class="plan__icon" />
    <p>The demo proves they work</p>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
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
[2 min] Question six. The pulumi up docs say the command creates or updates the resources in a stack. So the answer to can we rebuild all of it from code is yes, and the demo is the proof: one pulumi up, then we sign, deploy and scan.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The demo shows the whole pipeline end to end.</h1>
</div>

<!--
[1 min] Hand over to the demo. Everything on the next slides is a folder in the repo, and every command is the one we run.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Supply chain signing.</h1>
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
[1 min] Divider. From here the slides are a map and the terminal is the show.
-->

---

# What we are going to do

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-key class="step__icon" /><p>Local test key, trust policy in place</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-rocket-launch class="step__icon" /><p>One <code>pulumi up</code> builds registry, cluster, policy</p></div>
  <div class="gpu-card step" v-click><ph-package class="step__icon" /><p>The hello image builds</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-seal-check class="step__icon" /><p>The image is signed and verifies locally</p></div>
  <div class="gpu-card step" v-click><ph-package class="step__icon" /><p>A second image goes up unsigned</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-shield-check class="step__icon" /><p>Kyverno admits the signed pod</p></div>
  <div class="gpu-card gpu-card--accent step" v-click><ph-shield-warning class="step__icon" /><p>Kyverno rejects the unsigned pod</p></div>
  <div class="gpu-card step" v-click><ph-magnifying-glass class="step__icon" /><p>Kubescape scans the cluster</p></div>
  <div class="gpu-card step" v-click><ph-trash class="step__icon" /><p>One script tears it all down</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.step { display: flex; flex-direction: row; align-items: center; gap: 0.8rem; padding: 0.9rem 1rem; }
.step p { margin: 0 !important; font-size: 1.05rem; line-height: 1.3; }
.step__icon { font-size: 2rem; color: var(--p-primary); }
</style>

<!--
[1 min] Nine steps, each one a folder in the repo. Read the list as outcomes. Everything after step zero runs from the repo root. The presenter already ran the key step and a backup image build before the session, as the README advises.
-->

---

# A local test key and a trust policy exist

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-terminal-window />host</div>
    <div class="big-code code-sm">

```bash
00-signing-key/generate.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-package /><span>Notation generates a test key and certificate</span></li>
    <li><ph-seal-check /><span>The script exports the self-signed certificate</span></li>
    <li><ph-lightning /><span>It writes a trust policy for this registry</span></li>
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
[2 min] Step zero is a presenter pre-step, so show it briefly. The script runs notation cert generate-test and writes a trust policy. Expect log lines saying it is generating the key pair, exporting the certificate and writing the trust policy.
-->

---

# One pulumi up builds the registry, the cluster and the policy

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-terminal-window />host</div>
    <div class="big-code code-sm">

```bash
cd 01-platform && pulumi up && cd -
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-package /><span>Preview first, then approve</span></li>
    <li><ph-seal-check /><span>ECR, Signer profile, kind, Kyverno, policy</span></li>
    <li><ph-lightning /><span>Outputs include the repository URL</span></li>
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
[7 min] Run pulumi up in the platform folder. Read the preview, say yes. While it runs, talk through the resources on the previous slide. The stack outputs the repository URL, the cluster context, the policy name and the signing profile name, and the later scripts read them.
-->

---

# The hello image builds locally

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-terminal-window />host</div>
    <div class="big-code code-sm">

```bash
02-image/build.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-package /><span>A plain docker build</span></li>
    <li><ph-seal-check /><span>Tagged local/hello:demo</span></li>
    <li><ph-lightning /><span>Nothing is signed yet</span></li>
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
[2 min] A plain Docker build of a small web server. Nothing Pulumi-specific. It is here so we have bytes to sign.
-->

---

# The image is pushed, signed and verified

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-terminal-window />host</div>
    <div class="big-code code-sm">

```bash
03-sign-and-push/push-and-sign.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-package /><span>Logs in to ECR and pushes the signed tag</span></li>
    <li><ph-seal-check /><span>Notation signs it with the local test key</span></li>
    <li><ph-lightning /><span>Notation verifies it against the trust policy</span></li>
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
[4 min] The script pushes the image to ECR first, then runs notation sign, then notation verify. Push first because the registry has to hold the image before there is a digest to sign. If verify prints a success line we have a signed image.
-->

---

# A second image goes up with no signature

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-terminal-window />host</div>
    <div class="big-code code-sm">

```bash
04-unsigned-image/push-unsigned.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-package /><span>Same image, different tag</span></li>
    <li><ph-seal-check /><span>Pushed and never signed</span></li>
    <li><ph-lightning /><span>Registry accepts it without complaint</span></li>
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
[2 min] Same bytes, tag unsigned. The registry is happy to hold it. That is the point of the tension slides: the registry does not care who built it.
-->

---

# Kyverno admits the pod with the signed image

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-terminal-window />host</div>
    <div class="big-code code-sm">

```bash
05-admit-signed/apply.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-package /><span>Creates an image pull secret for ECR</span></li>
    <li><ph-seal-check /><span>Applies a pod that references the signed tag</span></li>
    <li><ph-lightning /><span>The pod is admitted</span></li>
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
[4 min] Apply a pod that references the signed image. The script watches the pod. We expect it to be admitted. If the image pull is slow, narrate the policy while we wait.
-->

---

# Kyverno rejects the pod with the unsigned image

<div class="zoom-content">

<div class="s5__cmd big-code code-sm">

```bash
06-reject-unsigned/apply.sh
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-terminal-window /><span>The script applies the unsigned pod</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-shield-check /><span>Kyverno checks the signature at admission</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-shield-warning /><span>kubectl prints the webhook's denial</span></div>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
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
[5 min] The payoff. Apply the pod that references the unsigned tag. The kubectl output is Kyverno's admission-webhook rejection message, so read it aloud. Compare it with the error text shown on the Kyverno slide.
-->

---

# Kubescape reports the cluster posture

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-terminal-window />host</div>
    <div class="big-code code-sm">

```bash
07-kubescape-scan/scan.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-package /><span>Writes a JSON report to the slide folder</span></li>
    <li><ph-seal-check /><span>Prints a summary of controls</span></li>
    <li><ph-lightning /><span>Findings are reports, nothing is blocked</span></li>
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
[4 min] Run the scan against the kind cluster. It writes a JSON report and then prints a summary. Our numbers will differ from the docs example. Pick one failed control and read what it says. Offer the verbose flag for fix suggestions.
-->

---

# One script tears the whole stack down

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-terminal-window />host</div>
    <div class="big-code code-sm">

```bash
08-teardown/teardown.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-package /><span>Deletes images from the ECR repository</span></li>
    <li><ph-seal-check /><span>Runs pulumi destroy with the stack</span></li>
    <li><ph-lightning /><span>Removes the local Notation key material</span></li>
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
[2 min] Teardown deletes the images from ECR first, runs pulumi destroy in the platform folder, then removes the local key material. Do not skip it: it avoids leftover cost.
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/supply-chain-signing-as-code" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → supply-chain-signing-as-code</div>
  </div>
  <div class="res-card">
    <QRCode data="https://notaryproject.dev/docs/" dark="#000000" />
    <div class="res-card__title">Notary Project docs</div>
    <div class="res-card__body">notaryproject.dev/docs</div>
  </div>
  <div class="res-card">
    <QRCode data="https://kyverno.io/docs/policy-types/cluster-policy/verify-images/notary/" dark="#000000" />
    <div class="res-card__title">Kyverno: verify images (Notary)</div>
    <div class="res-card__body">kyverno.io/docs</div>
  </div>
  <div class="res-card">
    <QRCode data="https://kubescape.io/docs/" dark="#000000" />
    <div class="res-card__title">Kubescape docs</div>
    <div class="res-card__body">kubescape.io/docs</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/iac/" dark="#000000" />
    <div class="res-card__title">Pulumi IaC docs</div>
    <div class="res-card__body">pulumi.com/docs/iac</div>
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
[1 min] Point at the QR codes. Everything is in the repo.
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
[1 min] Mention where to go next.
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/supply-chain-signing-as-code" dark="#000000" /></div>
      <div class="thanks__qr-label">supply-chain-signing-as-code</div>
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
[1 min] Thank the room and take questions.
-->
