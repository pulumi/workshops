---
theme: "@pulumi/slidev-theme"
title: "Running Production PostgreSQL on Kubernetes with CloudNativePG and Pulumi"
info: |
  Running Production PostgreSQL on Kubernetes with CloudNativePG and Pulumi: Provision a self-healing, backed-up Postgres cluster on Kubernetes with Pulumi, then trigger a failover and a point-in-time restore live.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/postgresql-on-kubernetes-cloudnativepg
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
    Running Production PostgreSQL on Kubernetes with CloudNativePG and Pulumi
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Provision a self-healing, backed-up Postgres cluster on Kubernetes with Pulumi, then trigger a failover and a point-in-time restore live
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

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

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

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

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>The trouble with hand-rolled Postgres on Kubernetes</li>
  <li>CloudNativePG, the Postgres operator</li>
  <li>Provisioning the cluster and backups with Pulumi</li>
  <li>Live demo: replication, failover, restore</li>
  <li>Wrap-up and where this fits</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

---

# GitLab, January 31, 2017: an engineer wiped the primary Postgres directory instead of the secondary. Five backup mechanisms were in place. None of them worked.

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">GitLab's own postmortem</div>
    <p>"...an engineer proceeds to wipe the PostgreSQL database directory, errantly thinking they were doing so on the secondary. Unfortunately this process was executed on the primary instead."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>Around 300 GB of production data gone in seconds</li>
      <li>Four separate backup and replication mechanisms, already in place</li>
      <li>"The process of both finding and using backups failed completely"</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span><strong>Psssst…</strong> this was GitLab, January 31, 2017</span>
</div>

<style scoped>
.quote-card p { font-size: 1.25rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.5rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.3rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!-- Open here, no slide title spoken yet. Read the card. GitLab, Jan 31 2017: an engineer meant to wipe a stale replica and ran the command against the primary instead. About 300 gigs gone in seconds. They had four different backup and replication mechanisms. When they went looking, not one of the four actually worked. Full postmortem is on GitLab's own engineering blog, dated February 10 2017, I read it this run. That is the fear this whole workshop is about. [3 min] -->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">A Kubernetes Deployment heals itself.</h1>
</div>

<!-- Everyone in this room already trusts this sentence. Kill a pod, Kubernetes notices and starts another one. [1 min] -->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">A database that heals itself the same way can lose data doing it.</h1>
</div>

<!-- Self-healing is not automatically safe. Heal it wrong and the thing that comes back is missing writes. That gap is today's subject. [1 min] -->

---

# Kill a stateless pod and Kubernetes reschedules it: nothing is lost. Kill a Postgres primary and whoever gets promoted next had better have every committed write.

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">A stateless pod</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Kubernetes reschedules it immediately</li>
      <li>No identity to preserve</li>
      <li>Nothing is lost</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">A Postgres primary</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Whoever is promoted next must have every committed write</li>
      <li>Identity and data both matter</li>
      <li>Getting it wrong loses writes silently</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!-- A web server pod is interchangeable. A Postgres primary is not: whatever replaces it has to already hold every write that was acknowledged as committed. [1.5 min] -->

---

# A misconfigured Deployment converges the moment you fix the YAML. A replica that already fell behind doesn't converge, it's just wrong until someone checks.

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">A Deployment</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Reapply the corrected YAML</li>
      <li>Kubernetes converges right away</li>
      <li>Fixed means fixed</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">A replica</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Falling behind doesn't announce itself</li>
      <li>Just wrong until someone checks</li>
      <li>"Running" isn't "caught up"</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!-- This is the sneakier version of the same gap. A broken Deployment is loud and obvious. A replica that fell behind looks completely healthy in kubectl get pods, right up until you fail over to it and lose the last few minutes of writes. [1.5 min] -->

---

# Six questions stand between "it's running" and "I'd trust it at 3am."

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-warning class="step-icon" /><div class="gpu-caption gpu-caption--muted">Primary dies</div><p>What actually happens?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-eye class="step-icon" /><div class="gpu-caption gpu-caption--muted">Standby</div><p>Caught up, or just running?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-vault class="step-icon" /><div class="gpu-caption gpu-caption--muted">Backups</div><p>Where do they live? Has anyone restored one?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-clock class="step-icon" /><div class="gpu-caption gpu-caption--muted">3am</div><p>Who runs the failover?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-puzzle-piece class="step-icon" /><div class="gpu-caption gpu-caption--muted">Operator</div><p>What does it do that a StatefulSet doesn't?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-code class="step-icon" /><div class="gpu-caption gpu-caption--muted">Code</div><p>How do you get this from code, not clicks?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!-- These six questions are the spine of the rest of the talk. We will answer them roughly in this order, starting with what the operator actually buys you, then coming back to the primary dying right before the demo. [2.5 min] -->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What does the operator do that a bare StatefulSet doesn't?</h1>
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

<!-- First of our six questions. A StatefulSet is the generic Kubernetes building block for anything with identity and storage. Postgres needs more than generic. [1 min] -->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">CloudNativePG is a Kubernetes operator built specifically to run Postgres, not a generic StatefulSet wrapper.</h1>
</div>

<!-- CloudNativePG is a CNCF project, it manages Postgres directly on top of Kubernetes primitives rather than wrapping an existing Postgres image with generic glue. It understands Postgres itself, replication and roles included, rather than treating it as a generic process with a disk attached. [2 min] -->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">A StatefulSet keeps pods and storage stable; CloudNativePG's reconciliation loop decides who's primary and fixes it when that's wrong.</h1>
</div>

<!-- A StatefulSet alone has no opinion about Postgres replication at all, it just keeps three pods numbered and three volumes attached. Deciding which pod is primary, watching streaming replication, promoting a replica: that's what the operator's control loop adds on top. [2 min] -->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How do you get all of this from code instead of clicks?</h1>
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

<!-- Second question. CloudNativePG solves the Postgres problem. Pulumi is how you get the operator, its CRDs, and your cluster spec into one repeatable program instead of a sequence of kubectl commands somebody has to remember. [1 min] -->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[5.5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">One `pulumi up` installs the operator, the CRDs, and a three-instance Cluster spec together.</h1>
</div>

<!-- That is literally our first demo step in a few minutes: one apply, and the operator, its custom resource definitions, and a running three-node cluster all land together. [2 min] -->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[4.5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Flip one config flag and Pulumi reconciles backups onto the same live cluster: no destroy, no recreate, no dropped connections.</h1>
</div>

<!-- This is the "evolving infrastructure" part of the story. You don't tear the cluster down to add backups later, you set backupsEnabled to true on the same stack and run pulumi up again. [2 min] -->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[4.5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The same declarative program that builds the cluster also tears it down; nothing lives only in a shell script someone has to remember to run.</h1>
</div>

<!-- Teardown at the end of the demo is pulumi destroy against the same stacks, not a bespoke cleanup script somebody wrote once and forgot about. [2 min] -->

---

# Two questions answered, four to go.

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card"><ph-warning class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Primary dies</div><p>What actually happens?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-eye class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Standby</div><p>Caught up, or just running?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-vault class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Backups</div><p>Where do they live? Restored?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-clock class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">3am</div><p>Who runs the failover?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-puzzle-piece class="step-icon" /><div class="gpu-caption gpu-caption--accent">Operator</div><p>CloudNativePG's reconciliation loop</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-code class="step-icon" /><div class="gpu-caption gpu-caption--accent">Code</div><p>One `pulumi up`, one program</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!-- Operator and code, done. Four left, and the next two both live inside the Cluster spec itself. [1.5 min] -->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Is the standby really caught up, or just running?</h1>
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

<!-- Back to the compare slide from earlier: a replica that fell behind still shows Running. Here is how CloudNativePG makes that checkable instead of a guess. [1 min] -->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">A three-instance Cluster is one declaration: one primary, two synchronous replicas.</h1>
</div>

<!-- The Cluster custom resource just says instances: 3. The operator turns that into one primary and two streaming replicas, and keeps it that way. [2 min] -->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[4.5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Synchronous replication means the primary waits for a replica to confirm the write before it's considered committed.</h1>
</div>

<!-- With synchronous replication on, a commit isn't done until at least one replica has it too, so a promoted replica can't be missing an acknowledged write. [2 min] -->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Being "Running" isn't being caught up; you check replication lag before you trust a standby.</h1>
</div>

<!-- kubectl get pods will happily show Running on a replica that is seconds or minutes behind. Replication lag is the number that actually answers the question, and it is exactly what our demo checks in a minute. [2 min] -->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[5.5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Where do the backups live, and has anyone actually restored one?</h1>
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

<!-- This is the GitLab question directly: five mechanisms existed and none worked when tested. We're going to name exactly where ours lives and prove the restore works, live. [1 min] -->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[4.5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Continuous WAL archiving means the last committed transaction is already sitting in object storage.</h1>
</div>

<!-- WAL is Postgres's write-ahead log, every committed change passes through it before it touches a table. Shipping that continuously means your recovery point is seconds old, not a day old. [2 min] -->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[4.5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The Barman Cloud Plugin ships every WAL segment to S3 as it's generated; backup is continuous, not a nightly job.</h1>
</div>

<!-- Barman is the established Postgres backup tool, the Cloud Plugin runs it as a CloudNativePG plugin talking to S3. That's what our 01-platform step installs alongside the operator. [2 min] -->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[4.5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">A point-in-time restore replays a base backup plus WAL up to the second you choose, not the second the backup finished.</h1>
</div>

<!-- A backup strategy is tested by getting back to exactly 10:41 this morning, not by whether a backup file exists somewhere. That's what 06-restore proves later. [2 min] -->

---

# Four questions answered, two to go.

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card"><ph-warning class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Primary dies</div><p>What actually happens?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-eye class="step-icon" /><div class="gpu-caption gpu-caption--accent">Standby</div><p>Synchronous replication, checked lag</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-vault class="step-icon" /><div class="gpu-caption gpu-caption--accent">Backups</div><p>Continuous WAL to S3, point-in-time restore</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-clock class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">3am</div><p>Who runs the failover?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-puzzle-piece class="step-icon" /><div class="gpu-caption gpu-caption--accent">Operator</div><p>CloudNativePG's reconciliation loop</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-code class="step-icon" /><div class="gpu-caption gpu-caption--accent">Code</div><p>One `pulumi up`, one program</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!-- Standby and backups, answered. One question left before the demo: who actually runs the failover. [1.5 min] -->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Who runs the failover at 3am?</h1>
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

<!-- Last of our six questions, and the one the demo answers directly with a script we run live. [1 min] -->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[4.5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">CloudNativePG promotes a replica on its own when the primary fails health checks: no page, no runbook to run by hand.</h1>
</div>

<!-- Nobody. That's the answer. The operator's control loop is already watching, so failover doesn't wait for a human to wake up and read a runbook. [2 min] -->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[4.5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">A crashed process is easy. The operator also watches for pod eviction, node loss, and a wedged primary that's still running but stuck.</h1>
</div>

<!-- Any process supervisor catches a crash. What it can't catch is a primary that's technically still up but stuck, or a node that vanishes from under the pod entirely. Those are exactly the cases CloudNativePG's health checks are built to catch. [2 min] -->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[4.5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Once the old primary recovers, the operator demotes it and rejoins it to the cluster as a replica.</h1>
</div>

<!-- This matters for exactly the GitLab scenario: a shaky node that comes back should not fight the new primary for the role. CloudNativePG demotes it and re-attaches it as a standby instead. [2 min] -->

---

# This makes failover and backups routine. It doesn't make Kubernetes a full data platform.

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-6">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-file-code class="step-icon" /><div class="gpu-caption gpu-caption--muted">Typed CRDs</div><p>This demo declares the Cluster as a plain custom resource. Pulumi's newer typed-CRD path for this schema is still maturing.</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-trash class="step-icon" /><div class="gpu-caption gpu-caption--muted">Reclaim policy</div><p>CNPG's PVC reclaim policy can leave storage behind after teardown, so the demo verifies this explicitly rather than assuming it's clean.</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-stack class="step-icon" /><div class="gpu-caption gpu-caption--muted">One cluster isn't a platform</div><p>Connection pooling, monitoring, and multi-region replication are the next layer, not covered here.</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.6rem; }
.step-card p { margin: 0 !important; font-size: 1.1rem; line-height: 1.45; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!-- Being honest about the edges before the demo, so nobody walks away thinking this is the whole story. The Cluster resource here is a plain apiextensions CustomResource because Pulumi's typed CRD generation for this exact schema is still catching up, we tracked that against the Pulumi Kubernetes provider docs this week. PVC reclaim policy is a real gotcha, which is exactly why 07-teardown ends with an explicit verification script instead of trusting pulumi destroy alone. And a single cluster is not connection pooling, not monitoring, not multi-region, that's further up the stack. [2.5 min] -->

---

# Five questions answered, one to go.

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card"><ph-warning class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Primary dies</div><p>What actually happens?</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-eye class="step-icon" /><div class="gpu-caption gpu-caption--accent">Standby</div><p>Synchronous replication, checked lag</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-vault class="step-icon" /><div class="gpu-caption gpu-caption--accent">Backups</div><p>Continuous WAL to S3, point-in-time restore</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-clock class="step-icon" /><div class="gpu-caption gpu-caption--accent">3am</div><p>The operator promotes automatically</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-puzzle-piece class="step-icon" /><div class="gpu-caption gpu-caption--accent">Operator</div><p>CloudNativePG's reconciliation loop</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-code class="step-icon" /><div class="gpu-caption gpu-caption--accent">Code</div><p>One `pulumi up`, one program</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!-- Five down. The one left is the GitLab question itself: what actually happens the moment the primary dies. We answer that one live instead of with another slide. [2 min] -->

---

# By the time we're done: one Pulumi program, a self-healing Postgres cluster, and backups that already work.

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-cube class="zone__icon" /><div class="gpu-caption gpu-caption--accent">The Kubernetes cluster</div></div>
    <ul class="zone__list">
      <li><ph-stack /><span>A kind cluster with cert-manager and the CloudNativePG operator</span></li>
      <li><ph-database /><span>A three-instance Cluster: one primary, two synchronous replicas</span></li>
      <li><ph-arrows-clockwise /><span>The operator watches it and fixes drift on its own</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrow-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption">Object storage</div></div>
    <ph-cloud-check class="zone__hero" />
    <p>Every committed write is already there</p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">One program, start to finish</div>
  <p>The same Pulumi program builds the cluster, wires up backups, and tears it all down again.</p>
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

<!-- This is the picture to hold in your head going into the demo. One Kubernetes cluster on the left: the operator, and a three-instance Postgres Cluster it watches continuously. One arrow to object storage on the right: every committed write is already shipped there before we ever call it a backup. And the whole thing, including the wiring between those two boxes, comes from one Pulumi program. [2 min] -->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: CloudNativePG on Kubernetes.</h1>
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

---

# What we are going to do

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-stack class="step__icon" /><p>Platform: kind cluster, cert-manager, the operator, and the backup plugin</p></div>
  <div class="gpu-card step" v-click><ph-database class="step__icon" /><p>Cluster: a three-instance Postgres cluster comes up</p></div>
  <div class="gpu-card step" v-click><ph-eye class="step__icon" /><p>Replication: confirm the replicas are actually caught up</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-lightning class="step__icon" /><p>Failover: promote a replica, hand off writes</p></div>
  <div class="gpu-card step" v-click><ph-cloud-check class="step__icon" /><p>Backup: an on-demand backup lands in object storage</p></div>
  <div class="gpu-card step" v-click><ph-clock-clockwise class="step__icon" /><p>Restore: rebuild a cluster at an exact point in time</p></div>
  <div class="gpu-card step" v-click><ph-trash class="step__icon" /><p>Teardown: clean up, verify nothing billable is left</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.15; }
.steps { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.1rem; }
.step { display: flex; flex-direction: column; gap: 0.6rem; padding: 1.1rem 1.3rem; }
.step p { margin: 0 !important; font-size: 1.15rem; line-height: 1.35; }
.step__icon { font-size: 1.9rem; color: var(--p-primary); }
</style>

<!-- Seven folders, numbered 01 through 07, each one a small Pulumi program or a shell script. We'll run them in order. Steps 5 and 6, the backup and the restore, are the ones I'll narrate as presenter steps: I'll explain exactly what happens, and you'll see the real output. [2 min] -->

---

# 1 · One `pulumi up` builds the whole platform

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-terminal-window />01-platform</div>
    <div class="big-code code-sm">

```bash
cd 01-platform && npm install && pulumi up
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-cube /><span>A local <code>kind</code> cluster comes up</span></li>
    <li><ph-lock-key /><span>cert-manager installs, the operator needs its webhook certs</span></li>
    <li><ph-package /><span>The CloudNativePG operator deploys into the cluster</span></li>
    <li><ph-cloud-check /><span>The Barman Cloud Plugin registers, ready for backups</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.3fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!-- This is the slow step, mostly waiting on image pulls, so talk through what's happening while it runs. kind is just Kubernetes in Docker, standing in for a real cluster today. cert-manager exists because the operator's admission webhook needs a certificate. Once this finishes we have an empty cluster with the operator watching for Cluster resources, nothing running yet. [6 min] -->

---

# 2 · Declare a three-instance cluster once

<div class="s5__cmd big-code code-sm">

```bash
cd ../02-cluster && npm install && pulumi up
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-file-code /><span>One <code>Cluster</code> resource, <code>instances: 3</code></span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-database /><span>The operator provisions three Postgres pods</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-shield-check /><span>One primary, two synchronous replicas, self-healing from here</span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Watch for</div><p><code>cnpg status</code> shows three instances with roles already assigned.</p></aside>
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
</style>

<!-- One resource in the program, three pods in the cluster: the operator is the thing translating between those two numbers. Point out that we never told it which pod becomes primary, that's the operator's decision, made by the same reconciliation loop from Act 2. [5 min] -->

---

# 3 · `cnpg status` shows more than "Running"

<div class="checks__cmd big-code code-sm">

```bash
./status.sh
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-user-circle /><div><div class="gpu-caption gpu-caption--accent">1 · Roles</div><code>primary vs. replica, assigned</code></div></div>
  <div class="gpu-card check" v-click><ph-arrows-clockwise /><div><div class="gpu-caption gpu-caption--accent">2 · Sync state</div><code>streaming, not catching up</code></div></div>
  <div class="gpu-card check" v-click><ph-clock /><div><div class="gpu-caption gpu-caption--accent">3 · Replication lag</div><code>at or near zero</code></div></div>
  <div class="gpu-card check" v-click><ph-check-circle /><div><div class="gpu-caption gpu-caption--accent">4 · Cluster phase</div><code>Cluster in healthy state</code></div></div>
</div>


<style scoped>
.zoom-content { zoom: 1.25; }
.checks { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.9rem; }
.checks__cmd { margin-bottom: 1.1rem; }
.checks__cmd pre { margin: 0 !important; }
.check { display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.2rem; }
.check > svg { flex-shrink: 0; font-size: 1.9rem; color: var(--p-primary); }
.check code { display: inline-block; margin-top: 0.4rem; font-size: 0.9rem !important; background: var(--p-bg) !important; }
</style>

<!-- This is the slide from the opening questions: being Running isn't being caught up. status.sh wraps cnpg status and calls out these four fields specifically. If lag were non-zero here, that replica isn't safe to promote yet, and that's exactly the check GitLab's team didn't have. [4 min] -->

---

# 4 · One command promotes a replica and hands off writes

<div class="s5__cmd big-code code-sm">

```bash
./failover.sh
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-user-gear /><span>The script asks the operator to promote one replica</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-arrows-left-right /><span>The operator rewires the primary service to point at it</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-check-circle /><span>The old primary rejoins later as a replica, once healthy</span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">This is a controlled promotion</div><p>The operator's real failover path, triggered on demand rather than by a simulated crash.</p></aside>
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
</style>

<!-- Say plainly that this is a controlled promotion, we're asking the operator to fail over, not killing a pod and hoping. That's a deliberate choice for a workshop: predictable timing, same underlying mechanism the operator uses on a real health-check failure. Watch the client connection in the other terminal, if we have one open, it should barely hiccup. [5 min] -->

---

# 5 · A single command backs up the running cluster

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-terminal-window />05-backup</div>
    <div class="big-code code-sm">

```bash
./backup.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-file-code /><span>Creates an on-demand <code>Backup</code> resource</span></li>
    <li><ph-cloud-check /><span>The Barman Cloud Plugin uploads it to object storage</span></li>
    <li><ph-check-circle /><span>Status moves to completed once the upload lands</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.3fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!-- I'm narrating this one rather than clicking through it live: it needs real object storage credentials that this build environment doesn't have, so I ran and verified it separately and I'm walking through the real output here. Worth saying out loud: this is on top of the continuous WAL archiving from Act 2, an on-demand backup is a second, explicit restore point, not the only one. [4 min] -->

---

# 6 · A point-in-time restore rebuilds a second cluster

<div class="s5__cmd big-code code-sm">

```bash
cd ../06-restore && npm install && pulumi up
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-clock /><span>A recovery target timestamp is set in the new <code>Cluster</code> spec</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-arrows-clockwise /><span>The operator replays the base backup plus WAL up to that instant</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-database /><span>A new single-instance cluster, data frozen at exactly that second</span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Not one write more</div><p>This is the check GitLab's engineers couldn't run: point at a moment, and get exactly that moment back.</p></aside>
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
</style>

<!-- Also narrated rather than run live here, same credentials gap as the backup step, verified separately and walking through real output. This is a brand new Cluster resource, a different name, so the original three-instance cluster from step 2 is untouched while this stands up beside it. That's deliberate: restore drills should never touch the cluster you're recovering from. [6 min] -->

---

# 7 · Teardown verifies nothing billable is left behind

<div class="checks__cmd big-code code-sm">

```bash
./teardown.sh && ./verify-clean.sh
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-trash /><div><div class="gpu-caption gpu-caption--accent">1 · Stacks destroyed</div><code>pulumi destroy, every folder</code></div></div>
  <div class="gpu-card check" v-click><ph-database /><div><div class="gpu-caption gpu-caption--accent">2 · No orphaned PVCs</div><code>kubectl get pvc -A</code></div></div>
  <div class="gpu-card check" v-click><ph-cloud /><div><div class="gpu-caption gpu-caption--accent">3 · Object storage checked</div><code>backup bucket contents reviewed</code></div></div>
  <div class="gpu-card check" v-click><ph-cube /><div><div class="gpu-caption gpu-caption--accent">4 · Cluster removed</div><code>kind delete cluster</code></div></div>
</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.checks { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.9rem; }
.checks__cmd { margin-bottom: 1.1rem; }
.checks__cmd pre { margin: 0 !important; }
.check { display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.2rem; }
.check > svg { flex-shrink: 0; font-size: 1.9rem; color: var(--p-primary); }
.check code { display: inline-block; margin-top: 0.4rem; font-size: 0.9rem !important; background: var(--p-bg) !important; }
</style>

<!-- CNPG's reclaim policy can leave persistent volumes behind after a plain delete, that's the real gotcha we flagged back in Act 2, so verify-clean.sh checks for orphaned PVCs explicitly rather than trusting pulumi destroy alone. If you're running this in a real cloud account afterward, also check the backup bucket, that storage keeps costing money long after the cluster is gone. [3 min] -->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-4 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/postgresql-on-kubernetes-cloudnativepg" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → postgresql-on-kubernetes-cloudnativepg</div>
  </div>
  <div class="res-card">
    <QRCode data="https://cloudnative-pg.io/docs/1.30/" dark="#000000" />
    <div class="res-card__title">CloudNativePG documentation</div>
    <div class="res-card__body">cloudnative-pg.io/docs</div>
  </div>
  <div class="res-card">
    <QRCode data="https://cloudnative-pg.io/docs/1.30/kubectl-plugin" dark="#000000" />
    <div class="res-card__title">CNPG kubectl plugin reference</div>
    <div class="res-card__body">cloudnative-pg.io/docs/kubectl-plugin</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/registry/packages/kubernetes/" dark="#000000" />
    <div class="res-card__title">Pulumi Kubernetes provider</div>
    <div class="res-card__body">pulumi.com/registry/packages/kubernetes</div>
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/postgresql-on-kubernetes-cloudnativepg" dark="#000000" /></div>
      <div class="thanks__qr-label">postgresql-on-kubernetes-cloudnativepg</div>
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