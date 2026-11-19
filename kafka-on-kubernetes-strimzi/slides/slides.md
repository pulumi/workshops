---
theme: "@pulumi/slidev-theme"
title: "Running Apache Kafka on Kubernetes with the Strimzi operator and Pulumi"
info: |
  Running Apache Kafka on Kubernetes with the Strimzi operator and Pulumi: Provision a KRaft Kafka cluster with Pulumi, send messages through it, then scale and upgrade it live.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/kafka-on-kubernetes-strimzi
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
    Running Apache Kafka on Kubernetes with the Strimzi operator and Pulumi
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Provision a KRaft Kafka cluster with Pulumi, send messages through it, then scale and upgrade it live
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
Time: 1 min
Welcome and introductions. Topic: Kafka on Kubernetes, run by an operator and driven by Pulumi.
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
Time: 1 min
Speaker slide. Introduce yourself.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
Time: 0.5 min
Housekeeping and agenda divider.
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
Time: 1 min
Housekeeping: repo link, prerequisites, ask questions any time.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>Why Kafka on Kubernetes hurts</li>
  <li>What the Strimzi operator does</li>
  <li>Provisioning it with Pulumi</li>
  <li>The demo</li>
  <li>Wrap-up and Q&A</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
Time: 1 min
Agenda: the pain, the operator, Pulumi, then the demo.
-->

---

# Strimzi's own docs describe the pain

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">From the Strimzi overview</div>
    <p>"Running Kafka on Kubernetes without native support from Strimzi can be complex … the process is often error-prone and time-consuming. This is especially true for operations like upgrades and configuration updates."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>The setup it describes: <code>StatefulSet</code> and <code>Service</code></li>
      <li>The hard part it names: upgrades and config changes</li>
      <li>The fix it offers: a Kubernetes-native operator</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-book-open class="psst__icon" />
  <span><strong>Source:</strong> strimzi.io/docs/operators/latest/overview, section 1.4</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
Time: 1.5 min
Start with the people who maintain the operator. Their overview page says it plainly: deploying Kafka with a StatefulSet and a Service is possible, and it is error-prone, especially for upgrades and config changes. Nobody here needs convincing that a Kafka upgrade is stressful. Ask who has done a rolling Kafka restart by hand.
-->
---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[5.5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">You can deploy Kafka with a StatefulSet.</h1>
</div>

<!--
Time: 1 min
First line of the tension. It works. People run it that way, and the Strimzi docs say so too.
-->
---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[5.5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Upgrades and config changes are where it hurts.</h1>
</div>

<!--
Time: 1 min
Second line. Day one is easy. The risk sits in day two: the upgrade, the config change, the new broker. That is what this workshop is about.
-->
---

# The operator takes over the day-two work

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">StatefulSet and Service</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Possible to deploy</li>
      <li>Error-prone and time-consuming</li>
      <li>Upgrades and config updates by hand</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Strimzi operators</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Kafka, KafkaTopic and KafkaUser as custom resources</li>
      <li>Rolling upgrades and recovery automated</li>
      <li>Partition rebalancing through Cruise Control</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
Time: 1.5 min
Left side is what the overview calls the manual route. Right side is the list of advantages from the same page: custom resources, automated rolling upgrades and recovery, and partition reassignment with Cruise Control. We will see each of them run today.
-->
---

# Six questions before we trust it with our topics

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-file-code class="step-icon" /><div class="gpu-caption gpu-caption--muted">What</div><p>What describes the cluster?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-hard-drives class="step-icon" /><div class="gpu-caption gpu-caption--muted">Where</div><p>Where does the data live?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-arrows-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--muted">How</div><p>Who does the rolling upgrade?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-scales class="step-icon" /><div class="gpu-caption gpu-caption--muted">Capacity</div><p>How do we add a broker?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-plugs-connected class="step-icon" /><div class="gpu-caption gpu-caption--muted">Pulumi</div><p>How does Pulumi drive all of it?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-shield-check class="step-icon" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>Did we lose a message?</p></div>
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
Time: 2 min
These six questions are the spine of the talk. We answer the first five with slides and the last one live, by counting messages while the cluster scales and upgrades. Read each question aloud and pause on the last one.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What describes the cluster?</h1>
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
Time: 0.5 min
Question one.
-->
---

# Kafka becomes a Kubernetes custom resource

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-hard-drives class="step-icon" /><div class="gpu-caption gpu-caption--muted">Kafka</div><p>The cluster, declared as YAML</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-list-bullets class="step-icon" /><div class="gpu-caption gpu-caption--muted">KafkaTopic</div><p>Topics, managed the same way</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-users class="step-icon" /><div class="gpu-caption gpu-caption--muted">KafkaUser</div><p>Users too, no separate admin step</p></div>
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
Time: 1.5 min
Strimzi extends the Kubernetes API with custom resources such as Kafka, KafkaTopic and KafkaUser. You describe the cluster at a high level and the operators manage the Kubernetes resources underneath. The same page says this supports an infrastructure as code workflow.
-->
---

# Kafka 4.0 removed ZooKeeper, so there is less to describe

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Before 4.0</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Brokers plus a separate ZooKeeper ensemble</li>
      <li>Two systems to deploy and keep running</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Kafka 4.0 and later</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>KRaft mode by default</li>
      <li>The first major release without ZooKeeper</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
Time: 1.5 min
Kafka 4.0 is the first major release to run entirely without ZooKeeper, in KRaft mode by default. The release announcement says this removes the work of maintaining a separate ZooKeeper ensemble. Our cluster has controllers and brokers and nothing else.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Where does the data live?</h1>
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
Time: 0.5 min
Question two.
-->
---

# Node pools give brokers and controllers their own role

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Brokers</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Message streaming</li>
      <li>Storage</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Controllers</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Cluster state</li>
      <li>Metadata</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
Time: 1.5 min
A Kafka cluster is nodes with KRaft roles. Brokers stream messages and store them. Controllers manage cluster state and metadata. A node can do both, and we separate them with two KafkaNodePool resources: three controllers and three brokers.
-->
---

# Volumes outlive the pods unless you say otherwise

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">deleteClaim: false (default)</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>The claim stays when a node is deleted</li>
      <li>You clean up by hand</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">deleteClaim: true (the demo)</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>The claim goes with the node</li>
      <li>Teardown leaves nothing behind</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
Time: 1.5 min
The storage setting deleteClaim defaults to false in the Strimzi reference. For production that is the safe choice. The demo sets it to true, so the teardown script finds no leftover volumes. Say this out loud, because it is a demo shortcut.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Who does the rolling upgrade?</h1>
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
Time: 0.5 min
Question three.
-->
---

# An upgrade is one edit and a rolling update

<div class="zoom-content">

<div class="plan" style="grid-template-columns: 1fr auto 1fr auto 1fr">
  <div class="gpu-card plan__step" v-click="1"><span class="plan__num">1</span><ph-pencil-simple class="plan__icon" /><p>Change <code>version</code> on the Kafka resource</p></div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2"><span class="plan__num">2</span><ph-arrows-clockwise class="plan__icon" /><p>The operator rolls the pods</p></div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="3"><span class="plan__num">3</span><ph-package class="plan__icon" /><p>Each pod starts on the new binaries</p></div>
</div>

<aside class="info-card" v-click="4"><div class="info-card__label">Per the Strimzi upgrade steps</div><p>You wait for the rolling updates to finish.</p></aside>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
.plan { display: grid; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.9rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
Time: 2 min
The documented procedure: edit spec.kafka.version, then wait for the rolling updates. They make sure each pod uses the broker binaries of the new version. In the demo the edit is a Pulumi config value, which we set next to a running producer.
-->
---

# The metadata version stays put while the binaries mix

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">During the roll</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Some brokers run old binaries</li>
      <li>Others already run the new ones</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">metadataVersion unchanged</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Brokers and controllers keep talking</li>
      <li>The upgrade stays a pure binary roll</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
Time: 1.5 min
The Strimzi procedure says to leave metadataVersion at the current setting while you change the Kafka version. Otherwise old and new nodes could not talk to each other mid-roll. In our run, version goes from 4.2.1 to 4.3.1 and metadataVersion stays at 4.2-IV1.
-->
---

# Three questions covered, three to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-file-code class="step-icon" /><div class="gpu-caption gpu-caption--accent">What</div><p>Custom resources, KRaft only</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-hard-drives class="step-icon" /><div class="gpu-caption gpu-caption--accent">Where</div><p>Node pools with roles, volumes you control</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-arrows-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--accent">How</div><p>Edit the version, the operator rolls</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-scales class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Capacity</div><p>How do we add a broker?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-plugs-connected class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Pulumi</div><p>How does Pulumi drive all of it?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-check class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>Did we lose a message?</p></div>
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
Time: 1 min
Quick recap. Three answered. Next, capacity, then Pulumi.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How do we add a broker?</h1>
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
Time: 0.5 min
Question four.
-->
---

# A new broker needs a replica count and a rebalance

<div class="zoom-content">

<div class="plan" style="grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr">
  <div class="gpu-card plan__step" v-click="1"><span class="plan__num">1</span><ph-plus-circle class="plan__icon" /><p>Raise the broker pool replicas</p></div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2"><span class="plan__num">2</span><ph-file-code class="plan__icon" /><p>Create a <code>KafkaRebalance</code> in <code>add-brokers</code> mode</p></div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3"><span class="plan__num">3</span><ph-chart-bar class="plan__icon" /><p>Cruise Control writes a proposal</p></div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4"><span class="plan__num">4</span><ph-hand-palm class="plan__icon" /><p>You approve it with an annotation</p></div>
</div>

<aside class="info-card" v-click="5"><div class="info-card__label">Who moves the data</div><p>The Cruise Control executor applies approved proposals.</p></aside>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.plan { display: grid; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.9rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
Time: 2 min
Strimzi scales through node pools and uses Cruise Control for partition reassignment. A KafkaRebalance in add-brokers mode produces an optimization proposal, shown as ProposalReady. You approve by setting the strimzi.io/rebalance annotation to approve. Only then does the executor move partitions.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How does Pulumi drive all of it?</h1>
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
Time: 0.5 min
Question five.
-->
---

# Each Strimzi resource is a CustomResource in the program

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-hard-drives class="step-icon" /><div class="gpu-caption gpu-caption--muted">Kafka</div><p>One CustomResource, version as a config value</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--muted">KafkaNodePool</div><p>Two of them: controller and broker</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-list-bullets class="step-icon" /><div class="gpu-caption gpu-caption--muted">KafkaTopic</div><p>demo-events, declared next to the cluster</p></div>
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
Time: 1.5 min
The Pulumi Kubernetes provider has a CustomResource type for an instance of a CRD. We use it for every Strimzi resource, so the cluster is TypeScript, with config values and dependencies, and Pulumi tracks it like any other resource.
-->
---

# Three Pulumi projects stack up, each reading the one below

<div class="zoom-content">

<div class="plan" style="grid-template-columns: 1fr auto 1fr auto 1fr">
  <div class="gpu-card plan__step" v-click="1"><span class="plan__num">1</span><ph-cube class="plan__icon" /><p><code>01-cluster</code>: kind and the operator</p></div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2"><span class="plan__num">2</span><ph-hard-drives class="plan__icon" /><p><code>02-kafka</code>: node pools and Kafka</p></div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3"><span class="plan__num">3</span><ph-list-bullets class="plan__icon" /><p><code>03-topic</code>: topic and client pod</p></div>
</div>

<aside class="info-card" v-click="4"><div class="info-card__label">StackReference</div><p>A stack reads another stack's outputs, which creates a dependency between them.</p></aside>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
.plan { display: grid; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.9rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
Time: 2 min
Three projects, three stacks. The Kafka project reads the namespace and kubeconfig from the cluster stack through a StackReference. The Pulumi docs describe a stack reference as access to the outputs of another stack. That is also why scaling touches only the Kafka project.
-->
---

# Pulumi waits for the operator to report Ready

<div class="zoom-content">

<div class="plan" style="grid-template-columns: 1fr auto 1fr auto 1fr">
  <div class="gpu-card plan__step" v-click="1"><span class="plan__num">1</span><ph-note-pencil class="plan__icon" /><p><code>pulumi up</code> applies the Kafka resource</p></div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2"><span class="plan__num">2</span><ph-hourglass class="plan__icon" /><p>The annotation <code>pulumi.com/waitFor</code> is <code>condition=Ready</code></p></div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="3"><span class="plan__num">3</span><ph-check-circle class="plan__icon" /><p>The update finishes when the cluster is Ready</p></div>
</div>

<aside class="info-card" v-click="4"><div class="info-card__label">Same syntax as kubectl</div><p><code>condition=</code> matches <code>kubectl wait --for=condition=...</code>.</p></aside>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
.plan { display: grid; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.9rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
Time: 1.5 min
The Pulumi Kubernetes provider reads the waitFor annotation. A value starting with condition= works like kubectl wait for a condition. So pulumi up does not return while the operator is still creating pods. That makes the demo steps safe to chain.
-->
---

# Scaling and upgrading are two config values

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Scale to four brokers</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li><code>brokerReplicas</code> goes from 3 to 4</li>
      <li>Then the rebalance</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Upgrade to 4.3.1</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li><code>kafkaVersion</code> goes from 4.2.1 to 4.3.1</li>
      <li><code>metadataVersion</code> stays at 4.2-IV1</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
Time: 1.5 min
Both day-two changes are one pulumi config set and one pulumi up in the Kafka project. The scripts wrap exactly that. The rebalance after scaling is a separate Strimzi resource, which we apply in the script.
-->
---

# Where this breaks today

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--muted">Controllers</div><p>Strimzi uses static quorums: scaling controllers needs downtime</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-package class="step-icon" /><div class="gpu-caption gpu-caption--muted">Metadata version</div><p>A separate step, left alone in the demo</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-laptop class="step-icon" /><div class="gpu-caption gpu-caption--muted">This demo</div><p>One laptop and kind: no real failure domains</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
Time: 1.5 min
Be plain about limits. The Strimzi docs say Strimzi uses static controller quorums for all deployments, and with a static quorum scaling the controllers requires downtime. Migration to dynamic quorums is not supported by Apache Kafka yet. The demo leaves the metadata version alone. And kind on a laptop shows the mechanics but not real availability zones.
-->
---

# The cluster we build: kind, the operator, Kafka, a topic

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--muted zone" v-click>
    <div class="zone__head"><ph-laptop class="zone__icon" /><div class="gpu-caption gpu-caption--muted">01-cluster</div></div>
    <ul class="zone__list">
      <li><ph-cube /><span>A kind cluster</span></li>
      <li><ph-package /><span>The Strimzi operator</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrow-right /></div>
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-hard-drives class="zone__icon" /><div class="gpu-caption gpu-caption--accent">02-kafka</div></div>
    <ul class="zone__list">
      <li><ph-cube /><span>3 controllers, 3 brokers</span></li>
      <li><ph-chart-bar /><span>Cruise Control</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrow-right /></div>
  <div class="gpu-card gpu-card--muted zone" v-click>
    <div class="zone__head"><ph-list-bullets class="zone__icon" /><div class="gpu-caption gpu-caption--muted">03-topic</div></div>
    <ul class="zone__list">
      <li><ph-note /><span><code>demo-events</code></span></li>
      <li><ph-terminal-window /><span>A client pod</span></li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.setup { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: stretch; gap: 1.25rem; }
.zone__head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.1rem; }
.zone__icon { font-size: 1.6rem; color: var(--p-primary); }
.zone__list { list-style: none; padding: 0; margin: 0; }
.zone__list li { display: flex; align-items: center; gap: 0.8rem; margin: 0 0 0.85rem; }
.zone__list li:last-child { margin-bottom: 0; }
.zone__list li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
.setup__link { display: flex; align-items: center; font-size: 2.2rem; color: var(--p-accent); }
</style>

<!--
Time: 1.5 min
This is what we end up with. Three Pulumi projects, three stacks. First a kind cluster with the operator installed. Then the Kafka cluster with two node pools and Cruise Control. Then a topic and a client pod. Each project reads the one before it through a stack reference.
-->
---

# Five questions answered, one to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-file-code class="step-icon" /><div class="gpu-caption gpu-caption--accent">What</div><p>Custom resources, KRaft only</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-hard-drives class="step-icon" /><div class="gpu-caption gpu-caption--accent">Where</div><p>Node pools with roles, volumes you control</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-arrows-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--accent">How</div><p>Edit the version, the operator rolls</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-scales class="step-icon" /><div class="gpu-caption gpu-caption--accent">Capacity</div><p>Replicas plus an approved rebalance</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-plugs-connected class="step-icon" /><div class="gpu-caption gpu-caption--accent">Pulumi</div><p>CustomResource, stack references, waitFor</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-check class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>Did we lose a message?</p></div>
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
Time: 1 min
Five answered. The last one only the demo can answer: we send numbered messages during a scale-up and an upgrade, and then count them.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Kafka on Kubernetes with Strimzi.</h1>
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
Time: 0.5 min
Demo divider. Switch to the terminal.
-->

---

# What we are going to do

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--muted">1 Cluster</div><p>kind plus the operator</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-hard-drives class="step-icon" /><div class="gpu-caption gpu-caption--muted">2 Kafka</div><p>Node pools and the Kafka resource</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-list-bullets class="step-icon" /><div class="gpu-caption gpu-caption--muted">3 Topic</div><p>demo-events and a client pod</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-paper-plane-tilt class="step-icon" /><div class="gpu-caption gpu-caption--muted">4 Clients</div><p>Produce 100, consume them</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-scales class="step-icon" /><div class="gpu-caption gpu-caption--muted">5 Scale</div><p>Four brokers under traffic</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-arrows-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--muted">6 Upgrade</div><p>4.2.1 to 4.3.1 under traffic</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
Time: 1.5 min
Steps one to six on this slide, teardown is step seven. Steps five and six run with a producer in a second terminal, so we can count messages afterwards.
-->
---

# 1 · The operator installs through Pulumi

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="big-code code-sm">

```bash
cd 01-cluster && pulumi up --yes
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-check-circle /><span>One deployment: <code>strimzi-cluster-operator</code></span></li>
    <li><ph-cube /><span>Ready is <code>1/1</code></span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.45fr 1fr; gap: 2rem; align-items: center; }
.s1__steps pre { margin: 0 !important; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
Time: 3 min
Run it. This is the slowest step the first time because of image pulls, so it was rehearsed. Check the operator deployment shows one of one.
-->
---

# 2 · One resource describes the whole Kafka cluster

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="big-code code-sm">

```bash
cd 02-kafka && pulumi up --yes
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-hard-drives /><span><code>kafka</code> shows READY True</span></li>
    <li><ph-cube /><span>Three controller and three broker pods</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.45fr 1fr; gap: 2rem; align-items: center; }
.s1__steps pre { margin: 0 !important; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
Time: 6 min
Pulumi waits for the Ready condition, so the command returns when the cluster is up. Show the pods afterwards with kubectl get pods.
-->
---

# 3 · A topic is one more resource

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="big-code code-sm">

```bash
cd 03-topic && pulumi up --yes
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-list-bullets /><span><code>demo-events</code> READY True</span></li>
    <li><ph-scales /><span>3 partitions, 3 replicas</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.45fr 1fr; gap: 2rem; align-items: center; }
.s1__steps pre { margin: 0 !important; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
Time: 2 min
The topic project reads both earlier stacks. Three partitions and three replicas.
-->
---

# 4 · Messages go in and come out

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="big-code code-sm">

```bash
04-clients/produce.sh 100
04-clients/consume.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-paper-plane-tilt /><span><code>demo-1</code> to <code>demo-100</code></span></li>
    <li><ph-arrows-split /><span>Order holds per partition, and there are three</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.45fr 1fr; gap: 2rem; align-items: center; }
.s1__steps pre { margin: 0 !important; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
Time: 3 min
Produce one hundred, consume them. Point out the order only holds within one partition.
-->
---

# 5 · A fourth broker joins and takes partitions

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="big-code code-sm">

```bash
05-day2/traffic.sh 300
05-day2/scale.sh 4
05-day2/check.sh 300
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-plus-circle /><span>A fourth broker pod</span></li>
    <li><ph-chart-bar /><span><code>KafkaRebalance</code> reaches Ready</span></li>
    <li><ph-check-circle /><span>300 of 300 messages</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.45fr 1fr; gap: 2rem; align-items: center; }
.s1__steps pre { margin: 0 !important; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
Time: 9 min
Traffic runs in terminal A, scale in terminal B. The script sets brokerReplicas, runs pulumi up, applies the rebalance, waits for the proposal and approves it. Afterwards check counts messages.
-->
---

# 6 · The rolling upgrade loses no message

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="big-code code-sm">

```bash
05-day2/traffic.sh 600
05-day2/upgrade.sh 4.3.1
05-day2/check.sh 600
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-arrows-clockwise /><span>Brokers restart one at a time</span></li>
    <li><ph-seal-check /><span>Status shows <code>4.3.1</code></span></li>
    <li><ph-check-circle /><span>Every message counted</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.45fr 1fr; gap: 2rem; align-items: center; }
.s1__steps pre { margin: 0 !important; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
Time: 12 min
Same pattern. This takes several minutes, so fill with the metadata version explanation. The script changes the binary version only. The count at the end is the answer to the last question.
-->
---

# 7 · Teardown leaves nothing behind

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="big-code code-sm">

```bash
06-teardown/teardown.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-trash /><span>Stacks destroyed in reverse order</span></li>
    <li><ph-hard-drives /><span>No PVCs left, since deleteClaim is true</span></li>
    <li><ph-cube /><span>The kind cluster is gone</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.45fr 1fr; gap: 2rem; align-items: center; }
.s1__steps pre { margin: 0 !important; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
Time: 2 min
One script. It reports any leftovers; we expect none.
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-4 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/kafka-on-kubernetes-strimzi" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → kafka-on-kubernetes-strimzi</div>
  </div>
  <div class="res-card">
    <QRCode data="https://strimzi.io/docs/operators/latest/deploying" dark="#000000" />
    <div class="res-card__title">Strimzi documentation</div>
    <div class="res-card__body">strimzi.io/docs</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/registry/packages/kubernetes/" dark="#000000" />
    <div class="res-card__title">Pulumi Kubernetes provider</div>
    <div class="res-card__body">pulumi.com/registry/kubernetes</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/iac/concepts/stacks/" dark="#000000" />
    <div class="res-card__title">Pulumi stacks and stack references</div>
    <div class="res-card__body">pulumi.com/docs/stacks</div>
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
Time: 1 min
Resources. Scan the QR codes.
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
Time: 1 min
Next steps after the workshop.
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/kafka-on-kubernetes-strimzi" dark="#000000" /></div>
      <div class="thanks__qr-label">kafka-on-kubernetes-strimzi</div>
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
Time: 8 min
Questions and wrap-up.
-->
