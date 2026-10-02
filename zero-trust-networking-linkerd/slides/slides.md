---
theme: "@pulumi/slidev-theme"
title: "Zero-trust networking as code"
info: |
  Zero-trust networking as code: Mutual TLS and traffic policy with Linkerd and Pulumi, root certificate included.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/zero-trust-networking-linkerd
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
    Zero-trust networking as code
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Mutual TLS and traffic policy with Linkerd and Pulumi, root certificate included
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
Time: 1.00 min. Welcome. Say what the hour covers and who it is for: platform and network engineers, no mesh experience needed.
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
Time: 1.50 min. Speaker slide. Placeholder until the speaker is confirmed.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
Time: 0.25 min. Transition to housekeeping.
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
Time: 1.00 min. Housekeeping: repo link, questions during the demo, what to have installed.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>Why a flat cluster network is a risk</li>
  <li>What a mesh adds: identity and policy</li>
  <li>The solution we will build</li>
  <li>Demo: trust anchor to deny</li>
  <li>Wrap-up and Q&A</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
Time: 1.50 min. Walk the agenda: the pain, the tech, the solution, then the demo.
-->

---

# By default, nothing stops one pod calling another

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">The Kubernetes docs, on network policies</div>
    <p>"By default, a pod is non-isolated for ingress; all inbound connections are allowed."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>The same page says it for egress: all outbound connections are allowed</li>
      <li>A network policy selects pods by labels, namespaces and IP blocks</li>
      <li>Nothing in that list is a cryptographic identity</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span><strong>Source:</strong> kubernetes.io, Network Policies concept page</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!-- 1.50 min. Open on the docs, not on an incident. This is the Kubernetes concept page for network policies. Read the quote slowly. A pod with no policy accepts every inbound connection and may open any outbound one. Then the aside: policies match labels, namespaces and IP blocks. Nobody on this list is a certificate. Source is on the slide. -->
---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Inside the cluster, everything can talk to everything.</h1>
</div>

<!-- 0.75 min. First half of the tension. Pause after it. -->
---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">And nobody can prove who is calling.</h1>
</div>

<!-- 0.75 min. Second half. An IP address is an address, not a name. A label is a claim the caller made about itself. Neither is proof. -->
---

# What a network policy sees, and what a mesh sees

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">A network policy</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Matches IPs, labels, namespaces</li>
      <li>Traffic on the wire is plaintext</li>
      <li>Caller identity is a guess</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">A service mesh</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Matches a workload identity</li>
      <li>Traffic is mutual TLS</li>
      <li>Caller identity is a certificate</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!-- 1.75 min. This is the contrast. Left: what the cluster gives you for free. Right: what we are going to add. Do not name the mesh yet. Keep the audience on the gap. -->
---

# Why teams skip it

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">By hand</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Run openssl, copy the PEM files</li>
      <li>Paste keys into a Helm values file</li>
      <li>Nobody remembers where the root lives</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">As code</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Declare the root and the issuer</li>
      <li>Pass them to the chart as outputs</li>
      <li>Preview, review and destroy like any stack</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!-- 1.75 min. Why people skip mTLS: the root of trust is a private key somebody has to create, store and hand to the install. Left is how it usually goes. Right is where this workshop is heading. The root is part of the program, so it gets a diff and a destroy. -->
---

# Six questions before you trust the network

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card step-card" v-click><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>Who is calling me?</p></div>
  <div class="gpu-card step-card" v-click><ph-lock class="step-icon" /><div class="gpu-caption gpu-caption--accent">Private</div><p>Is the traffic encrypted?</p></div>
  <div class="gpu-card step-card" v-click><ph-vault class="step-icon" /><div class="gpu-caption gpu-caption--accent">Root</div><p>Where does the root of trust come from?</p></div>
  <div class="gpu-card step-card" v-click><ph-gavel class="step-icon" /><div class="gpu-caption gpu-caption--accent">Allowed</div><p>Who may call whom?</p></div>
  <div class="gpu-card step-card" v-click><ph-warning class="step-icon" /><div class="gpu-caption gpu-caption--accent">Limits</div><p>Where does this fall short?</p></div>
  <div class="gpu-card step-card" v-click><ph-magnifying-glass class="step-icon" /><div class="gpu-caption gpu-caption--accent">Proof</div><p>How do we prove it, and tear it down?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!-- 2.00 min. These six questions are the spine of the next hour. Read them out. We answer them in this order: identity and encryption first, then the root of trust, then who may call whom, then the limits. The last one, proof and teardown, the demo answers. -->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Who is calling, and is it private?</h1>
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

<!-- 0.25 min. Section one covers two questions: identity and encryption. -->
---

# A proxy next to every pod gives it an identity

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-cube class="plan__icon" />
    <p>Your pod keeps its own container</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-plugs-connected class="plan__icon" />
    <p>A Linkerd proxy joins the pod</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-seal-check class="plan__icon" />
    <p>The proxy gets a certificate for the pod</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-lock-key class="plan__icon" />
    <p>Pod to pod calls use that certificate</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p>The application code does not change.</p>
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

<!-- 2.00 min. A service mesh puts a small proxy beside each pod. The proxy owns the network side: it holds the identity and does the TLS. Your container does not know. Everything else in the hour is about who hands out those certificates and who decides what they may do. -->
---

# Four projects cover this ground, and we use one

<div class="zoom-content">

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card"><ph-stack class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Istio</div><p>Ambient mode adds a node proxy, ztunnel, and updates the CNI</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-plugs-connected class="step-icon" /><div class="gpu-caption gpu-caption--accent">Linkerd</div><p>Injects by annotation on a running cluster</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-globe class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Cilium</div><p>Mutual authentication, marked beta in its docs, with SPIFFE identities</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-arrows-left-right class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Envoy</div><p>A proxy that Istio's traffic tasks configure</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!-- 1.50 min. A landscape slide, nothing more. These are four names you will hear. I am not ranking them. Istio ambient adds a node-level proxy and touches the CNI. Cilium documents its mutual authentication as beta. Envoy is a proxy that Istio's traffic tasks configure. We pick Linkerd for one reason only. -->
---

# The trade-off we are making

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">What we skip here</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Istio ambient: node proxy and CNI changes</li>
      <li>Cilium: covered elsewhere, not here</li>
      <li>No claim that this choice generalizes</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">What Linkerd gives us today</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Namespace annotation injects the proxy</li>
      <li><code>linkerd check</code> validates the install</li>
      <li>Runs on a plain local kind cluster</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!-- 1.75 min. Be direct about the trade-off. For a laptop and 90 minutes we need a mesh that installs on a cluster that is already running, with a check command to prove it. Linkerd does that. This is a fit for this room, not a verdict on the others. Production choices depend on your cluster and your team. -->
---

# Meshed pods talk mutual TLS without any code change

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-cube class="chain__icon" />
    <div class="gpu-caption">front pod</div>
    <span>Its proxy holds a certificate</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-lock-key class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">mutual TLS</div>
    <span>Both sides present a certificate</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-cube class="chain__icon" />
    <div class="gpu-caption">backend pod</div>
    <span>Its proxy checks who is calling</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>Linkerd applies mTLS to all TCP traffic between meshed pods.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.chain { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.8rem; }
.chain__node { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; padding-block: 1.2rem; }
.chain__node span { font-size: 1.15rem; color: var(--p-fg); }
.chain__icon { font-size: 2.6rem; color: var(--p-primary); }
.chain__arrow { align-self: center; font-size: 1.6rem; color: var(--p-accent); }
.chain__rule { margin-top: 1.2rem; }
.chain__rule p { font-size: 1.3rem; font-weight: 600; }
</style>

<!-- 2.00 min. This answers question one and two. The Linkerd docs say it plainly: Linkerd transparently applies mTLS to all TCP communication between meshed pods. Mutual means both sides prove themselves. The backend learns who called, and the wire is encrypted. The docs also list traffic that is not covered, for example calls from pods outside the mesh. We will show the proof in the demo. -->
---

# Ok, two questions covered, four to go!

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>Workload identity from a certificate</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-lock class="step-icon" /><div class="gpu-caption gpu-caption--accent">Private</div><p>Mutual TLS between meshed pods</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-vault class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Root</div><p>Where does the root of trust come from?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-gavel class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Allowed</div><p>Who may call whom?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-warning class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Limits</div><p>Where does this fall short?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-magnifying-glass class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>How do we prove it, and tear it down?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!-- 0.75 min. Recap. Identity and encryption are answered. Four to go. Next: the root of trust. -->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Where does the root of trust come from?</h1>
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

<!-- 0.25 min. Section two: the root. -->
---

# The root of trust is a few resources in a Pulumi program

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-key class="plan__icon" />
    <p>A private key and a self-signed trust anchor</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-seal-check class="plan__icon" />
    <p>An issuer certificate signed by the anchor</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-package class="plan__icon" />
    <p>Both go into the Helm chart values</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-shield-check class="plan__icon" />
    <p>The control plane signs each proxy certificate</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p>Everything here is a resource: preview it, diff it, destroy it.</p>
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

<!-- 2.00 min. In this repo the trust anchor is a TLS private key and a self-signed certificate, both Pulumi resources from the tls provider. An issuer certificate is signed by the anchor. Those PEM strings become Helm values for the control plane. The identity service then signs a certificate for each proxy. The root is no longer a file on someone laptop. -->
---

# One program installs the chart, the CRDs and the policy

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card step-card" v-click><ph-package class="step-icon" /><div class="gpu-caption gpu-caption--accent">Helm</div><p><code>helm.v4.Chart</code> installs the CRDs chart, then the control plane</p></div>
  <div class="gpu-card step-card" v-click><ph-file-code class="step-icon" /><div class="gpu-caption gpu-caption--accent">Custom resources</div><p><code>CustomResource</code> declares Server and AuthorizationPolicy</p></div>
  <div class="gpu-card step-card" v-click><ph-stack class="step-icon" /><div class="gpu-caption gpu-caption--accent">Stacks</div><p>Five small stacks, one per concern</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!-- 1.50 min. Pulumi IaC installs the Linkerd charts with the Helm v4 Chart resource and declares the policy objects as custom resources. The program is split into small stacks, one per step, so the demo can go step by step and tear down in reverse. -->
---

# Ok, three questions covered, three to go!

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>Workload identity from a certificate</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-lock class="step-icon" /><div class="gpu-caption gpu-caption--accent">Private</div><p>Mutual TLS between meshed pods</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-vault class="step-icon" /><div class="gpu-caption gpu-caption--accent">Root</div><p>A trust anchor declared in Pulumi IaC</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-gavel class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Allowed</div><p>Who may call whom?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-warning class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Limits</div><p>Where does this fall short?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-magnifying-glass class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>How do we prove it, and tear it down?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!-- 0.75 min. Recap. The root is answered. Three to go: who may call whom, the limits, and the proof. -->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Who may call whom?</h1>
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

<!-- 0.25 min. Section three: authorization. -->
---

# Authentication and authorization are two steps

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Authentication</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>mTLS proves the caller identity</li>
      <li>Every meshed call has one</li>
      <li>It says nothing about permission</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Authorization</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Policy decides which identities may call</li>
      <li>Written as Kubernetes objects</li>
      <li>Can deny everything else</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!-- 1.75 min. People mix these up. Authentication is who you are. Authorization is what you may do. mTLS gives you the first. Linkerd policy gives you the second. With only the first, every meshed workload can still call every other one. -->
---

# Three small objects say who may reach the backend

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-cube class="plan__icon" />
    <p>Server: names the backend port</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-user-circle class="plan__icon" />
    <p>MeshTLS<wbr>Authentication: names the front identity</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-gavel class="plan__icon" />
    <p>AuthorizationPolicy: ties the two together</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-prohibit class="plan__icon" />
    <p>Everyone else gets a 403</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p>The Linkerd docs let you set the default inbound policy to deny.</p>
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

<!-- 2.00 min. Server selects the port on the backend. MeshTLSAuthentication names the identity we accept, here the front service account. AuthorizationPolicy connects them. The Linkerd server policy docs say the default inbound policy can be set to deny. In our demo the policy objects are what turn on enforcement for that port. -->
---

# Ok, four questions covered, two to go!

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>Workload identity from a certificate</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-lock class="step-icon" /><div class="gpu-caption gpu-caption--accent">Private</div><p>Mutual TLS between meshed pods</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-vault class="step-icon" /><div class="gpu-caption gpu-caption--accent">Root</div><p>A trust anchor declared in Pulumi IaC</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-gavel class="step-icon" /><div class="gpu-caption gpu-caption--accent">Allowed</div><p>Server, MeshTLSAuthentication, AuthorizationPolicy</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-warning class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Limits</div><p>Where does this fall short?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-magnifying-glass class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>How do we prove it, and tear it down?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!-- 0.75 min. Recap. Authorization is answered. Two to go: the limits, then the proof. -->
---

# Where this breaks today

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card step-card" v-click><ph-stack class="step-icon" /><div class="gpu-caption gpu-caption--accent">Not covered</div><p>Istio ambient and Cilium are covered elsewhere, not here</p></div>
  <div class="gpu-card step-card" v-click><ph-package class="step-icon" /><div class="gpu-caption gpu-caption--accent">Edge channel</div><p>The demo pins the edge charts at 2026.6.3</p></div>
  <div class="gpu-card step-card" v-click><ph-laptop class="step-icon" /><div class="gpu-caption gpu-caption--accent">Local only</div><p>A single-node kind cluster is not production</p></div>
  <div class="gpu-card step-card" v-click><ph-vault class="step-icon" /><div class="gpu-caption gpu-caption--accent">Root key in state</div><p>The issuer key sits in Pulumi state, so protect the state</p></div>
  <div class="gpu-card step-card" v-click><ph-clock class="step-icon" /><div class="gpu-caption gpu-caption--accent">Certificates expire</div><p>Linkerd documents rotation, and this demo does not rotate</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!-- 2.00 min. Be plain about the limits. We did not cover Istio ambient or Cilium. Charts come from the edge channel, pinned to 2026.6.3. It runs on one kind node, not on production. The issuer key is a Pulumi resource, so it ends up in state and the state needs the same care as any secret store. Certificates expire. Linkerd documents rotation, and the demo does not do it. -->
---

# Five questions answered, one to go!

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">Who</div><p>Workload identity from a certificate</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-lock class="step-icon" /><div class="gpu-caption gpu-caption--accent">Private</div><p>Mutual TLS between meshed pods</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-vault class="step-icon" /><div class="gpu-caption gpu-caption--accent">Root</div><p>A trust anchor declared in Pulumi IaC</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-gavel class="step-icon" /><div class="gpu-caption gpu-caption--accent">Allowed</div><p>Server, MeshTLSAuthentication, AuthorizationPolicy</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-warning class="step-icon" /><div class="gpu-caption gpu-caption--accent">Limits</div><p>Where this breaks today</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-magnifying-glass class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>How do we prove it, and tear it down?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!-- 0.75 min. The last question is proof and teardown. The demo answers it. -->
---

# The cluster ends with a trust anchor, a mesh and a policy

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-key class="chain__icon" />
    <div class="gpu-caption">02 + 03</div>
    <span>Trust anchor, then linkerd-crds and linkerd-control-plane</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-cube class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">04 + 05</div>
    <span>front and backend in mesh-demo (<code>linkerd.io/inject: enabled</code>), then Linkerd viz</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-gavel class="chain__icon" />
    <div class="gpu-caption">06</div>
    <span>Server, MeshTLSAuthentication, AuthorizationPolicy</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>All of it runs in one local kind cluster.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.chain { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.8rem; }
.chain__node { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; padding-block: 1.2rem; }
.chain__node span { font-size: 1.15rem; color: var(--p-fg); }
.chain__icon { font-size: 2.6rem; color: var(--p-primary); }
.chain__arrow { align-self: center; font-size: 1.6rem; color: var(--p-accent); }
.chain__rule { margin-top: 1.2rem; }
.chain__rule p { font-size: 1.3rem; font-weight: 600; }
</style>

<!-- 2.00 min. This is what we build, in order. Step one is the cluster itself, then five Pulumi stacks. Stacks 02 and 03 are the trust anchor and the control plane. 04 deploys front and backend into a namespace that is annotated for injection. 05 adds the viz extension so we can see the edges. 06 adds the policy. Then 07 shows a deny, and 08 tears everything down in reverse. -->
---

# The trust anchor and the chart are plain resources

<div class="zoom-content">

<div class="big-code code-sm">

```ts
const anchor = new tls.SelfSignedCert("identity-trust-anchor", {
    privateKeyPem: anchorKey.privateKeyPem,
    isCaCertificate: true,
});
new k8s.helm.v4.Chart("linkerd-control-plane", {
    chart: "linkerd-control-plane", version: "2026.6.3",
    values: { identityTrustAnchorsPEM: anchor.certPem },
});
```

</div>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
</style>

<!-- 2.00 min. The only program code in the deck, trimmed from the 02 and 03 folders. Imports, the issuer certificate, the repository option and the dependency on the CRDs chart are left out. You will see the full files in the editor during the demo. -->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Zero-trust networking as code.</h1>
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
Time: 0.50 min. Demo divider. Switch to the terminal and the editor.
-->

---

# What we are going to do

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card  step" v-click><ph-hard-drives class="step__icon" /><p>A kind cluster comes up</p></div>
  <div class="gpu-card  step" v-click><ph-key class="step__icon" /><p>Pulumi declares the trust anchor</p></div>
  <div class="gpu-card  step" v-click><ph-package class="step__icon" /><p>Linkerd runs from two Helm charts</p></div>
  <div class="gpu-card  step" v-click><ph-cube class="step__icon" /><p>front and backend get proxies</p></div>
  <div class="gpu-card  step" v-click><ph-lock-key class="step__icon" /><p>Edges show front to backend as secured</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-gavel class="step__icon" /><p>Policy admits only front</p></div>
  <div class="gpu-card gpu-card--accent step" v-click><ph-prohibit class="step__icon" /><p>An unknown client gets a 403</p></div>
  <div class="gpu-card  step" v-click><ph-trash class="step__icon" /><p>Five stacks and the cluster go away</p></div>
</div>

<div class="big-code code-sm ov__cmd">

```bash
pulumi up   # steps 2 to 6, in each folder
```

</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.2rem; }
.step { display: flex; flex-direction: column; gap: 0.7rem; padding: 1.2rem 1.3rem; }
.step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.step__icon { font-size: 2rem; color: var(--p-primary); }
.ov__cmd { margin-top: 1.4rem; }
.ov__cmd pre { margin: 0 !important; }
</style>

<!--
Time: 1.00 min. Eight steps, each ends in something you can see. Steps two to six are all pulumi up in their own folder, so I show the command once, here. Steps one, five, six, seven and eight have their own scripts. Each step slide gives the folder and what you should see.
-->
---

# 1 · A local cluster is the only prerequisite

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-hard-drives />01-cluster</div>
    <div class="big-code code-sm">

```bash
./create-cluster.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-cube /><span>kind starts one node named mesh-demo</span></li>
    <li><ph-seal-check /><span>The node image is pinned</span></li>
    <li><ph-list-checks /><span>The script ends with kubectl get nodes</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
Time: 2.00 min. Folder 01-cluster. The script runs kind create cluster with the pinned node image and our kind config, then lists the nodes. You should see one node, Ready. Everything after this is a Pulumi stack.
-->
---

# 2 · The trust anchor is created before any cluster resource

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-key />02-trust-anchor</div>
    <div class="big-code code-sm">

```bash
pulumi up
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-seal-check /><span>Folder 02-trust-anchor, certificates only</span></li>
    <li><ph-file-code /><span>Exports: trustAnchorPem, issuerCertPem, issuerKeyPem</span></li>
    <li><ph-eye-slash /><span>The issuer key lives in Pulumi state</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
Time: 3.50 min. Folder 02. Run pulumi up. You get a trust anchor and an issuer certificate, nothing in Kubernetes yet. Open the outputs: the anchor certificate, the issuer certificate and the issuer key. Point out that the key lives in state, which is why the limits slide tells you to protect it.
-->
---

# 3 · The control plane starts from those certificates

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-package />03-control-plane</div>
    <div class="big-code code-sm">

```bash
kubectl --context kind-mesh-demo -n linkerd get pods
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-check-circle /><span>identity, destination and proxy-injector are Running</span></li>
    <li><ph-package /><span>Two charts: linkerd-crds, then linkerd-control-plane</span></li>
    <li><ph-tag /><span>Chart version 2026.6.3</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
Time: 8.00 min. Folder 03. Run pulumi up. It installs the CRDs chart, then the control plane chart with the certificates from step two as values. Then list the pods in the linkerd namespace. You should see identity, destination and proxy-injector Running. This is the longest wait of the demo, so talk through the architecture slide again while it runs.
-->
---

# 4 · One namespace annotation puts a proxy in every pod

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-cube />04-meshed-services</div>
    <div class="big-code code-sm">

```bash
kubectl --context kind-mesh-demo -n mesh-demo get pods
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-number-two /><span>front and backend show 2/2</span></li>
    <li><ph-tag /><span>Namespace mesh-demo carries linkerd.io/inject: enabled</span></li>
    <li><ph-plugs-connected /><span>Container two is the linkerd proxy</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
Time: 6.00 min. Folder 04. Run pulumi up, then list the pods. Both show 2 of 2: the app container and the proxy. We never touched the pod specs. The annotation is on the namespace, and the injector webhook did the rest.
-->
---

# 5 · The edges show front to backend as secured

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-lock-key />05-mtls-proof</div>
    <div class="big-code code-sm">

```bash
./verify-mtls.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-arrows-left-right /><span>Runs linkerd viz edges for mesh-demo</span></li>
    <li><ph-lock-key /><span>front to backend shows SECURED</span></li>
    <li><ph-package /><span>pulumi up in the folder first installs the viz chart</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
Time: 8.00 min. Folder 05. Run ./wait-for-control-plane.sh first, then pulumi up for the viz extension, then ./verify-mtls.sh. It sends one request and prints the edges table. Look for the SECURED column on the front to backend row. The script also prints a tap command as a fallback. We do not run it.
-->
---

# 6 · Policy objects exist, and front still gets through

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-gavel />06-authorization-policy</div>
    <div class="big-code code-sm">

```bash
./verify-policy.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-cube /><span>Server for the backend port</span></li>
    <li><ph-user-circle /><span>MeshTLSAuthentication for front</span></li>
    <li><ph-gavel /><span>AuthorizationPolicy joins them</span></li>
    <li><ph-check-circle /><span>front to backend still succeeds</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
Time: 6.00 min. Folder 06. Run pulumi up for the policy, then the script. It lists the Server, the MeshTLSAuthentication and the AuthorizationPolicy, and repeats the front to backend call. That call must still work.
-->
---

# 7 · An unknown client gets a 403, front still gets a 200

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-prohibit />07-deny-in-action</div>
    <div class="big-code code-sm">

```bash
./run-deny-demo.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-prohibit /><span>curl-client to backend: HTTP status 403</span></li>
    <li><ph-check-circle /><span>front to backend: HTTP 200</span></li>
    <li><ph-user-circle /><span>The difference is the service account</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
Time: 6.00 min. Folder 07. The script creates a throwaway client with its own service account, calls the backend and prints the status: 403. Then it repeats the call from front: 200. The backend and the network are the same. Only the identity differs. That is the answer to who may call whom. Say out loud which identity each call used.
-->
---

# 8 · Teardown removes everything in reverse order

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-trash />08-teardown</div>
    <div class="big-code code-sm">

```bash
./teardown.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-stack /><span>Destroys stacks 06, 05, 04, 03, 02</span></li>
    <li><ph-hard-drives /><span>Then runs kind delete cluster --name mesh-demo</span></li>
    <li><ph-list-checks /><span>Nothing stays behind</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
Time: 3.50 min. Folder 08. The script removes the test client, runs pulumi destroy in reverse order, and deletes the cluster. This answers the last half of question six: you can tear it all down with one command.
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-4 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/zero-trust-networking-linkerd" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → zero-trust-networking-linkerd</div>
  </div>
  <div class="res-card">
    <QRCode data="https://linkerd.io/2.19/reference/authorization-policy/" dark="#000000" />
    <div class="res-card__title">Linkerd authorization policy reference</div>
    <div class="res-card__body">linkerd.io/2.19/reference/authorization-policy</div>
  </div>
  <div class="res-card">
    <QRCode data="https://linkerd.io/2.19/features/server-policy/" dark="#000000" />
    <div class="res-card__title">Linkerd server policy</div>
    <div class="res-card__body">linkerd.io/2.19/features/server-policy</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/" dark="#000000" />
    <div class="res-card__title">Pulumi Kubernetes Helm v4 Chart</div>
    <div class="res-card__body">pulumi.com/registry/.../helm/v4/chart</div>
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
Time: 1.00 min. Resources. The repo QR code resolves once the pull request is merged.
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
Time: 1.00 min. Continue your Pulumi journey. Point to the docs and the community.
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/zero-trust-networking-linkerd" dark="#000000" /></div>
      <div class="thanks__qr-label">zero-trust-networking-linkerd</div>
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
Time: 5.50 min. Questions. Leave the last demo slide up if you can.
-->
