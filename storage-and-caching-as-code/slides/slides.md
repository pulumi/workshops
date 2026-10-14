---
theme: "@pulumi/slidev-theme"
title: "Storage and caching as code"
info: |
  Storage and caching as code: Provision Longhorn storage and a DragonflyDB cache on Kubernetes with Pulumi, then kill a node.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/storage-and-caching-as-code
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
    Storage and caching as code
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Provision Longhorn storage and a DragonflyDB cache on Kubernetes with Pulumi, then kill a node
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
Welcome people and say what the next 90 minutes are: replicated storage and a cache on Kubernetes, all built with Pulumi IaC, then a node failure.
Time: 1 min
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
Introduce yourself in one sentence. The speaker details are a placeholder in this draft.
Time: 1 min
-->


---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
Two short blocks: housekeeping, then the agenda.
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
Where to ask questions, where the handouts are. Keep it short.
Time: 1 min
-->


---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>The problem with local disks</li>
  <li>Replicated storage</li>
  <li>A cache that speaks Redis</li>
  <li>What we build</li>
  <li>The node failure demo</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
Walk the five agenda items. Say the demo is about a third of the time and the node failure is the centerpiece.
Time: 1 min
-->


---

# Local disks tie data to one node

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">The Kubernetes documentation, "Volumes"</div>
    <p>"If a node becomes unhealthy, then the local volume becomes inaccessible to the Pod. The Pod using this volume is unable to run. Applications using local volumes must be able to tolerate this reduced availability, as well as potential data loss, depending on the durability characteristics of the underlying disk."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>Local volumes depend on one node</li>
      <li>The node goes down and the pod cannot start</li>
      <li>The docs name data loss as a possible cost</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-book-open class="psst__icon" />
  <span><strong>Source:</strong> kubernetes.io/docs/concepts/storage/volumes</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
Start with what the Kubernetes docs say about local volumes. Read the quote slowly. The node goes unhealthy and the pod cannot run, and the docs mention data loss. The rest of the session starts from this paragraph.
Time: 2 min
-->


---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Pods are replaceable.</h1>
</div>

<!--
Say it flat. Delete a stateless pod and the scheduler puts a new one anywhere.
Time: 1 min
-->


---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Their data is not.</h1>
</div>

<!--
Pause after the first line, then give the second. The data does not move when the pod moves.
Time: 1 min
-->


---

# A stateful pod carries a disk that cannot move

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">A stateless pod</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Restarts on any node</li>
      <li>Nothing to copy</li>
      <li>Replace it, done</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">A stateful pod</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Data sits on one node's disk</li>
      <li>New pod needs that same data</li>
      <li>Local disk, node down: pod stuck or data gone</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
Left side is the case people know. Right side is the problem. Ask who has been paged for a stuck pod with a volume.
Time: 2 min
-->


---

# Six questions decide whether you trust a storage setup

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-hard-drives class="step-icon" /><div class="gpu-caption gpu-caption--muted">Where</div><p>Where does the data live?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-copy class="step-icon" /><div class="gpu-caption gpu-caption--muted">Copies</div><p>How many copies exist?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-warning class="step-icon" /><div class="gpu-caption gpu-caption--muted">Failure</div><p>What happens when a node dies?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-gear class="step-icon" /><div class="gpu-caption gpu-caption--muted">Provision</div><p>How is it provisioned?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-lightning class="step-icon" /><div class="gpu-caption gpu-caption--muted">Speed</div><p>How fast can the app read?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-trash class="step-icon" /><div class="gpu-caption gpu-caption--muted">Teardown</div><p>What tears it down?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
We answer these six questions in order. The third one, what happens when a node dies, we answer by killing a node.
Time: 3 min
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
Section one: storage that is not tied to a single node.
Time: 0.5 min
-->


---

# Longhorn copies every write to replicas on other nodes

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-file-text class="plan__icon" />
    <p>The app asks for a volume through a PVC</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-cpu class="plan__icon" />
    <p>Longhorn runs one controller per volume</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-copy class="plan__icon" />
    <p>Replicas on different nodes copy every write</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-check-circle class="plan__icon" />
    <p>A node dies and a replica takes over</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-hard-drives class="plan__foot-icon" />
  <p>Longhorn is a CNCF Incubating Project that provides persistent block storage.</p>
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
The Longhorn docs say it creates a dedicated storage controller for each volume and replicates the volume across multiple replicas on multiple nodes. Walk the four boxes. The app never talks to Longhorn directly, only to the PVC.
Time: 4.5 min
-->


---

# The cluster asks and Longhorn answers on the worker disks

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-cube class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Kubernetes</div></div>
    <ul class="zone__list">
      <li><ph-package /><span>The pod mounts a volume</span></li>
      <li><ph-file-text /><span>A PersistentVolumeClaim asks for 1Gi</span></li>
      <li><ph-sliders-horizontal /><span>A StorageClass names the provisioner and the replica count</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrows-left-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-hard-drives class="zone__icon" /><div class="gpu-caption">Longhorn</div></div>
    <ph-database class="zone__hero" />
    <p>Replicas on the worker disks</p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">What the app sees</div>
  <p>A normal volume. The copies are Longhorn's job.</p>
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
Left is what Kubernetes objects you write. Right is where bytes land. The StorageClass is the bridge, and it is where the replica count lives.
Time: 4 min
-->


---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Two replicas let one node fail.</h1>
</div>

<!--
The StorageClass asks for two replicas, and Longhorn places them on separate nodes in this four-node cluster. Lose one node and one copy is still running. Lose two at once and this setup does not cover you.
Time: 1.5 min
-->


---

# Longhorn is block storage, Rook brings Ceph

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Rook</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Kubernetes Operator for Ceph</li>
      <li>File, block and object storage</li>
      <li>CNCF graduated project</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Longhorn</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Block storage</li>
      <li>One controller per volume</li>
      <li>What this workshop uses</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
Rook is the usual alternative. It is a bigger system with more storage types. We picked Longhorn because one volume, one controller is small enough to explain in a workshop.
Time: 4 min
-->


---

# Three questions covered, three to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-hard-drives class="step-icon" /><div class="gpu-caption gpu-caption--accent">Where</div><p>On Longhorn volumes</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-copy class="step-icon" /><div class="gpu-caption gpu-caption--accent">Copies</div><p>Replicas on several nodes</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-warning class="step-icon" /><div class="gpu-caption gpu-caption--accent">Failure</div><p>Design answer: a replica takes over</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-gear class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Provision</div><p>How is it provisioned?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-lightning class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Speed</div><p>How fast can the app read?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-trash class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Teardown</div><p>What tears it down?</p></div>
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
Quick recap. Where, how many, and what happens on failure have a design answer. We have not proven the third yet.
Time: 2.5 min
-->


---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Provision it with code</h1>
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
Section two: how the setup gets built and removed.
Time: 0.5 min
-->


---

# The program decides what lands in the cluster

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-file-code class="chain__icon" />
    <div class="gpu-caption">Program</div>
    <span>TypeScript, in git</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-terminal-window class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Pulumi IaC</div>
    <span>Preview, then up</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-cube class="chain__icon" />
    <div class="gpu-caption">Kubernetes provider</div>
    <span>Longhorn is a Helm chart, pinned to 1.13.0</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>The chart version and the StorageClass live in the same repo as the cluster.</p>
</aside>

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
Program, Pulumi IaC, Kubernetes provider. Longhorn itself is a Helm chart and we pin it to 1.13.0, so everyone installs the same thing. Pulumi IaC shows a preview before anything changes.
Time: 4 min
-->


---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Replica count is one line of code.</h1>
</div>

<!--
The StorageClass in the demo keeps two replicas. Changing that number is a code change with a preview, not a UI click. Destroy runs in reverse order, which answers the teardown question.
Time: 3 min
-->


---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">A cache that speaks Redis</h1>
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
Section three: the cache. Say clearly that this is DragonflyDB from dragonflydb.io.
Time: 0.5 min
-->


---

# The client keeps its Redis commands

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Your client</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Same Redis commands</li>
      <li>No code changes</li>
      <li>Same client library</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">DragonflyDB</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Redis and Memcached APIs</li>
      <li>Multi-threaded</li>
      <li>Shared-nothing architecture</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
The DragonflyDB docs describe it as fully compatible with Redis and Memcached APIs and say it requires no code changes. Aside: do not confuse it with the CNCF project Dragonfly at d7y.io. Different product.
Time: 4 min
-->


---

# Where this breaks today

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">On kind</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Longhorn needs open-iscsi on every node</li>
      <li>A node failure here is a cordon and a pod delete</li>
      <li>Small volumes, laptop disks</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">On real clusters</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Rebuild time depends on your data</li>
      <li>DragonflyDB is licensed BSL 1.1</li>
      <li>It is not the CNCF project d7y.io</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
Be plain about limits. Our node failure is simulated with a cordon and a pod delete, not a power cut. On real clusters, rebuild time depends on how much data there is. DragonflyDB is source-available under BSL 1.1.
Time: 4 min
-->


---

# Five questions answered, one to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-hard-drives class="step-icon" /><div class="gpu-caption gpu-caption--accent">Where</div><p>On Longhorn volumes</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-copy class="step-icon" /><div class="gpu-caption gpu-caption--accent">Copies</div><p>Two replicas in the StorageClass</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-warning class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Failure</div><p>What happens when a node dies?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-gear class="step-icon" /><div class="gpu-caption gpu-caption--accent">Provision</div><p>Pulumi IaC, step by step</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-lightning class="step-icon" /><div class="gpu-caption gpu-caption--accent">Speed</div><p>DragonflyDB, same Redis commands</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-trash class="step-icon" /><div class="gpu-caption gpu-caption--accent">Teardown</div><p>Destroy in reverse order</p></div>
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
Only the failure question is open. The demo answers it.
Time: 2 min
-->


---

# Four pieces make one stateful setup

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-cube class="plan__icon" />
    <p>kind cluster with Longhorn on three workers</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-copy class="plan__icon" />
    <p>StorageClass keeps two replicas</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-database class="plan__icon" />
    <p>A record-keeper writes to a 1Gi PVC</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-lightning class="plan__icon" />
    <p>DragonflyDB serves the cache</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-stack class="plan__foot-icon" />
  <p>Every box is a Pulumi project in its own folder.</p>
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
This is the picture we end with. Four Pulumi projects, built in order, one folder each. No program code on slides, we read it in the editor.
Time: 4.5 min
-->


---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Storage and caching.</h1>
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
The divider. From here we build it live. Everyone with the repo can follow along.
Time: 0.5 min
-->


---

# What we are going to do

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-desktop class="step__icon" /><p>Four nodes run in kind</p></div>
  <div class="gpu-card step" v-click><ph-hard-drives class="step__icon" /><p>Longhorn runs on the workers</p></div>
  <div class="gpu-card step" v-click><ph-sliders-horizontal class="step__icon" /><p>A StorageClass keeps two replicas</p></div>
  <div class="gpu-card step" v-click><ph-database class="step__icon" /><p>A 1Gi volume holds a record</p></div>
  <div class="gpu-card gpu-card--accent step" v-click><ph-warning class="step__icon" /><p>A node fails and the record survives</p></div>
  <div class="gpu-card step" v-click><ph-lightning class="step__icon" /><p>DragonflyDB answers PING</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-arrows-left-right class="step__icon" /><p>A client writes and reads five keys</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.1; }
.steps { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 3rem; }
.step { display: flex; flex-direction: column; gap: 0.7rem; padding: 1.2rem 1.3rem; }
.step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.step__icon { font-size: 2rem; color: var(--p-primary); }
</style>

<!--
Seven steps. The first four build, step five is the node failure, six and seven add the cache. All commands are in the repo README.
Time: 1.5 min
-->


---

# 1 · Four nodes come up in kind

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
01-cluster/scripts/cluster-up.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-check-circle /><span><code>kubectl get nodes</code>: 4 Ready</span></li>
    <li><ph-cube /><span>1 control plane, 3 workers</span></li>
    <li><ph-package /><span>The script installs open-iscsi and nfs-common in every node</span></li>
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
Run the script, then the Pulumi project in 01-cluster. The packages are there because Longhorn needs iSCSI on each node.
Time: 2.5 min
-->


---

# 2 · Longhorn runs on every worker

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-hard-drives />02-longhorn</div>
    <div class="big-code code-sm">

```bash
pulumi up
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-check-circle /><span><code>kubectl -n longhorn-system get pods</code></span></li>
    <li><ph-cube /><span>A manager on every worker</span></li>
    <li><ph-seal-check /><span>CSI and UI pods Running</span></li>
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
The Helm chart takes a minute or two. Wait for all pods before moving on.
Time: 2 min
-->


---

# 3 · The StorageClass keeps two replicas

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-copy />03-storageclass</div>
    <div class="big-code code-sm">

```bash
pulumi up
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-check-circle /><span><code>kubectl get storageclass</code> lists longhorn-workshop</span></li>
    <li><ph-plugs-connected /><span>Provisioner driver.longhorn.io</span></li>
    <li><ph-copy /><span>Not the default, 2 replicas</span></li>
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
Show the two replicas in the code, then in the output.
Time: 1.5 min
-->


---

# 4 · A record written to a volume reads back

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-database />04-stateful-app</div>
    <div class="big-code code-sm">

```bash
pulumi up
```

</div>
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
04-stateful-app/scripts/write-record.sh "hello from Longhorn"
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-check-circle /><span>PVC <code>record-data</code> is Bound, 1Gi</span></li>
    <li><ph-hard-drives /><span>Read it with <code>read-record.sh</code></span></li>
    <li><ph-cube /><span>The record shows the node that wrote it</span></li>
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
Note the node name in the record. We will compare it after the failure.
Time: 2.5 min
-->


---

# 5 · A killed node does not lose the record

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-warning />05-node-failure</div>
    <div class="big-code code-sm">

```bash
05-node-failure/simulate-failure.sh
```

</div>
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
05-node-failure/restore-node.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-lock-key /><span>Cordons the node hosting the pod</span></li>
    <li><ph-trash /><span>Deletes the pod, waits for the rollout</span></li>
    <li><ph-cube /><span>New pod lands on a different node</span></li>
    <li><ph-check-circle /><span>The record from step 4 is still there</span></li>
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
This is the main step. Predict out loud where the new pod will land. The script allows two attempts at most for the rollout. Print the record and compare the node name with step 4. Then run restore-node.sh to uncordon.
Time: 8 min
-->


---

# 6 · The cache answers PING

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-lightning />06-dragonfly</div>
    <div class="big-code code-sm">

```bash
pulumi up
```

</div>
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
06-dragonfly/scripts/ping.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-check-circle /><span>The script prints <code>PONG</code></span></li>
    <li><ph-plugs-connected /><span>DragonflyDB, same protocol as Redis</span></li>
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
Same flow as before. PONG shows the cache is up.
Time: 1 min
-->


---

# 7 · A Redis client works without changes

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-desktop />host</div>
    <div class="big-code code-sm">

```bash
07-cache-client/roundtrip.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-check-circle /><span>Writes workshop:key:1 to 5</span></li>
    <li><ph-arrows-left-right /><span>Reads them back</span></li>
    <li><ph-seal-check /><span>The log ends with <code>round trip ok</code></span></li>
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
Last step. The client uses plain Redis commands and it is unmodified.
Time: 1 min
-->


---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/storage-and-caching-as-code" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → storage-and-caching-as-code</div>
  </div>
  <div class="res-card">
    <QRCode data="https://longhorn.io/docs/latest/concepts/" dark="#000000" />
    <div class="res-card__title">Longhorn concepts</div>
    <div class="res-card__body">longhorn.io/docs</div>
  </div>
  <div class="res-card">
    <QRCode data="https://rook.io/" dark="#000000" />
    <div class="res-card__title">Rook</div>
    <div class="res-card__body">rook.io</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.dragonflydb.io/docs" dark="#000000" />
    <div class="res-card__title">DragonflyDB docs</div>
    <div class="res-card__body">dragonflydb.io/docs</div>
  </div>
  <div class="res-card">
    <QRCode data="https://kubernetes.io/docs/concepts/storage/volumes/" dark="#000000" />
    <div class="res-card__title">Kubernetes volumes</div>
    <div class="res-card__body">kubernetes.io/docs</div>
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
Point at the repo QR code and the docs links. Everything from the demo is in the repo.
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
Community Slack, Pulumi Cloud sign-up, the next workshops.
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/storage-and-caching-as-code" dark="#000000" /></div>
      <div class="thanks__qr-label">storage-and-caching-as-code</div>
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
Open the floor. This slide carries the Q&A buffer. Use the time for questions and for repeating any step people want to see again.
Time: 15 min
-->

