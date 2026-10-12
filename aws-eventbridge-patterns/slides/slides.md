---
theme: "@pulumi/slidev-theme"
title: "Event routing as code on AWS"
info: |
  Event routing as code on AWS: Build a tested, policy-checked EventBridge bus that never silently drops an event.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/aws-eventbridge-patterns
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
    Event routing as code on AWS
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Build a tested, policy-checked EventBridge bus that never silently drops an event
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
[1 min] Welcome. Say the promise: a tested, policy-checked EventBridge bus that never silently drops an event.
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
[2 min] Introduce yourself and who is on the call.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
[0.25 min] Short divider.
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
[1 min] Housekeeping: questions in chat, where the code lives, what you need to follow along.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>The lost event</li>
  <li>How EventBridge delivers</li>
  <li>A component with safety built in</li>
  <li>Tests and policies</li>
  <li>Archive and replay</li>
  <li>Live demo</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
[1.5 min] Walk the agenda: the lost event, how EventBridge delivers, a component with safety built in, tests and policies, archive and replay, then the demo.
-->

---

# AWS says it plainly: the event is dropped.

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">The EventBridge user guide</div>
    <p>"If an event isn't delivered after all retry attempts are exhausted, the event is dropped and EventBridge doesn't continue to process it."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>By default EventBridge retries for 24 hours and up to 185 times</li>
      <li>Retries use exponential backoff and jitter</li>
      <li>A dead-letter queue is how you keep the event</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-quotes class="psst__icon" />
  <span><strong>Source:</strong> "How EventBridge retries delivering events", AWS docs</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
[1.5 min] Start with AWS's own words, not ours. Read the quote out loud. The default is generous: 24 hours, up to 185 attempts, with backoff. That sounds safe. Then the last step: all attempts used up, event dropped. The docs name the fix in the next paragraph: a dead-letter queue. Everything today is about making sure that fix is never forgotten.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Events are cheap to publish.</h1>
</div>

<!--
[0.5 min] First half of the tension. Publishing an event is a small thing. Nobody thinks hard about it.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">And easy to lose.</h1>
</div>

<!--
[0.5 min] Second half. The retry and dead-letter settings sit on each target, so one forgotten setting is enough.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The safety net should not depend on memory.</h1>
</div>

<!--
[0.5 min] Short beat before the questions. A rule that depends on someone remembering is not a rule.
-->

---

# The safety settings live on every target, not on the bus

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Where the settings are</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Retry policy: set per target</li>
      <li>Dead-letter queue: chosen per target</li>
      <li>Defaults: 24 hours, up to 185 attempts</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">What one forgotten setting does</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>The target is down for longer than the retry window</li>
      <li>The event is dropped</li>
      <li>Every new rule is another chance to forget</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1.5 min] On the left, where the settings live. The AWS docs say you set the retry policy and the DLQ when you add a target. That is per target. On the right, what happens when someone skips it. Ask the room how many rules their team has. Each rule target is its own chance to forget.
-->

---

# Before you trust an event bus with orders

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-arrows-split class="step-icon" /><div class="gpu-caption gpu-caption--muted">Routing</div><p>How do rules decide who gets an event?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-arrows-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--muted">Failure</div><p>What happens when a target is down?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-puzzle-piece class="step-icon" /><div class="gpu-caption gpu-caption--muted">Reuse</div><p>How do we stop each team repeating the setup?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-seal-check class="step-icon" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>How do we prove the safety setting is always on?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-clock-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--muted">Recovery</div><p>Can we recover events we already lost?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--muted">Credentials</div><p>How do we run this without long-lived AWS keys?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[1.5 min] Six questions. These are the spine of the workshop. Five get answered in the next section with slides. The sixth, credentials, you will see answered in the first demo step. Keep them in mind; we come back to them twice.
-->

---

# A custom bus, rules and targets are the parts you wire

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-cloud class="plan__icon" />
    <p>Custom bus: where your app publishes events</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-arrows-split class="plan__icon" />
    <p>Rules: an event pattern each</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-lightning class="plan__icon" />
    <p>Targets: Lambda functions or SQS queues</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-package class="plan__icon" />
    <p>DLQ: one SQS queue per target for failures</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p><strong>Five parts, one failure mode:</strong> a target without a DLQ.</p>
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
[1.5 min] Name the parts once so the rest makes sense. A custom bus, rules with event patterns, targets such as Lambda or SQS, and a dead-letter queue per target. Nothing here is hard. The risk is only in the repetition.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How do rules decide who gets an event?</h1>
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

# A rule matches an event pattern and picks a target

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-paper-plane-tilt class="plan__icon" />
    <p>An app puts an event on the custom bus</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-magnifying-glass class="plan__icon" />
    <p>Each rule tests it against its event pattern</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-package class="plan__icon" />
    <p>Matching rules send it to their targets</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-note-pencil class="plan__icon" />
    <p>An input transformer can reshape it for SQS</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p><strong>Demo steps 2 and 3:</strong> two rules, one to Lambda, one to SQS.</p>
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
[1.5 min] An event goes on a custom bus. Each rule on the bus holds an event pattern. If the event matches, the rule sends it to its targets. In the demo, order.created goes to Lambda and order.cancelled goes to an SQS queue. For SQS we reshape the message with an input transformer. Point out that a non-matching event simply does not reach that rule.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What happens when a target is down?</h1>
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

# Retries, then a dead-letter queue, or the event is gone

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-arrows-clockwise class="plan__icon" />
    <p>Delivery fails, EventBridge retries with backoff</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-clock class="plan__icon" />
    <p>Default: up to 24 hours and 185 attempts</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-prohibit class="plan__icon" />
    <p>Retries exhausted: the event is dropped</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-shield-check class="plan__icon" />
    <p>With a DLQ the failed event lands in an SQS queue</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p><strong>Demo step 4:</strong> we break the Lambda permission on purpose and find the event in the DLQ.</p>
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
[1.5 min] This is the heart of the story. Step one and two are the AWS defaults from the quote. Step three is what happens without a DLQ. Step four is what we add. In the demo we break a permission on purpose and set a short retry window so you do not wait 24 hours.
-->

---

# The DLQ keeps the event and tells you why

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-package class="step-icon" /><div class="gpu-caption gpu-caption--muted">Queue</div><p>A DLQ is a standard SQS queue</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-file-text class="step-icon" /><div class="gpu-caption gpu-caption--muted">Attributes</div><p>Each message carries RULE_ARN, TARGET_ARN and ERROR_CODE</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-arrows-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--muted">Retry policy</div><p>Set maximum age and attempts per target</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-eye class="step-icon" /><div class="gpu-caption gpu-caption--muted">Look</div><p>The demo reads the queue about a minute later</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-wrench class="step-icon" /><div class="gpu-caption gpu-caption--muted">Fix</div><p>Restore the permission and deploy again</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-seal-check class="step-icon" /><div class="gpu-caption gpu-caption--muted">Result</div><p>The failed event was never lost</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[1.5 min] What a dead-letter queue is: a standard SQS queue. Each message gets three attributes: the rule, the target and an error code. That is enough to see why delivery failed. We shorten the retry policy for the demo, so the event reaches the queue in about a minute. Do not promise this timing in production.
-->

---

# Production keeps the default, the demo shortens it

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Production default</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Retry for up to 24 hours</li>
      <li>Up to 185 attempts</li>
      <li>Exponential backoff with jitter</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">In the demo</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Maximum event age: 60 seconds</li>
      <li>Maximum retry attempts: 2</li>
      <li>So the DLQ fills in about a minute</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1 min] The 24 hours and 185 attempts come from AWS. The demo component sets 60 seconds and 2 attempts so you do not wait a day. Say clearly that this is a demo setting, not advice.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How do we stop each team repeating the setup?</h1>
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

# One EventRouter component builds the bus, the rules and the safety net

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-puzzle-piece class="plan__icon" />
    <p>A Pulumi IaC component groups related resources</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-arrows-split class="plan__icon" />
    <p>You list routes: a pattern and a target</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-shield-check class="plan__icon" />
    <p>The component adds a DLQ and retry policy to each target</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-check-circle class="plan__icon" />
    <p>Children keep stable names, aliases avoid replacement</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p><strong>Demo step 5:</strong> preview first, nothing should be replaced.</p>
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
[1.5 min] A component is a ComponentResource: one class that groups related resources. Ours is called EventRouter. You give it routes. It builds the bus, the rules, the targets and a DLQ with a retry policy on every target. When we refactor in the demo, the children carry aliases to their old parents. So preview shows no replacement. We check that before we deploy.
-->

---

# The component turns a copy-paste checklist into one block

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Without a component</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Each team copies bus, rules and queues</li>
      <li>The DLQ is one more thing to remember</li>
      <li>Reviewers check every target by eye</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">With EventRouter</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Teams pass a list of routes</li>
      <li>Every target gets a DLQ and retry policy</li>
      <li>A new team starts from the same block</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1 min] This is the reuse argument. Same resources, written once. The consumer lists routes and gets the safety net by default.
-->

---

# Three questions covered, three to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-arrows-split class="step-icon" /><div class="gpu-caption gpu-caption--accent">Routing</div><p>Event patterns on the rule</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-arrows-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--accent">Failure</div><p>Retry policy and a DLQ per target</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-puzzle-piece class="step-icon" /><div class="gpu-caption gpu-caption--accent">Reuse</div><p>One EventRouter component</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-seal-check class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Proof</div><p>How do we prove the safety setting is always on?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-clock-clockwise class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Recovery</div><p>Can we recover events we already lost?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-key class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Credentials</div><p>How do we run this without long-lived AWS keys?</p></div>
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
[0.75 min] Quick recap. Routing, failure and reuse are answered. Proof, recovery and credentials are still open.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How do we prove the safety setting is always on?</h1>
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

# A unit test swaps the Pulumi engine for mocks

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-plugs-connected class="plan__icon" />
    <p>Mocks replace the engine and the provider calls</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-laptop class="plan__icon" />
    <p>Answers come from inside the same process</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-lightning class="plan__icon" />
    <p>No cloud calls, so the test runs fast</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-check-circle class="plan__icon" />
    <p>Our test fails on a target with no deadLetterConfig</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p><strong>Demo step 6:</strong> <code>npm test</code> passes, then fails with a plain target.</p>
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
[1.5 min] The Pulumi docs describe it: unit tests cut the channel to the engine and replace it with mocks. The mocks answer inside the same process and return placeholder data. So tests are fast and need no AWS account. Our test inspects the targets the component creates.
-->

---

# A unit test guards the component, a policy guards every stack

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Unit test</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Runs on mocks, in one process</li>
      <li>Fails when a target has no deadLetterConfig</li>
      <li>Checks the component you wrote</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Pulumi Policies</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>A mandatory policy stops the deployment</li>
      <li>Written in TypeScript, Python or OPA</li>
      <li>Checks any stack, whatever wrote the target</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1.5 min] Two different guards. The unit test uses mocks, so no AWS calls, and checks the component. The policy is a Pulumi Policies rule at mandatory level: a violation stops the deployment. It checks every stack that uses the pack. In the demo, the same mistake, a plain target with no DLQ, fails the test in step 6 and is blocked at preview in step 7.
-->

---

# A Pulumi policy has one of four enforcement levels

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-info class="step-icon" /><div class="gpu-caption gpu-caption--muted">Advisory</div><p>Reports a violation as a warning</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-gavel class="step-icon" /><div class="gpu-caption gpu-caption--muted">Mandatory</div><p>Blocks the deployment</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-wrench class="step-icon" /><div class="gpu-caption gpu-caption--muted">Remediate</div><p>Fixes the resource automatically</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-prohibit class="step-icon" /><div class="gpu-caption gpu-caption--muted">Disabled</div><p>Turns the policy off</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-code class="step-icon" /><div class="gpu-caption gpu-caption--muted">Languages</div><p>TypeScript, JavaScript, Python or OPA (Rego)</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-magnifying-glass class="step-icon" /><div class="gpu-caption gpu-caption--muted">When</div><p>At pulumi preview and pulumi up, before anything changes</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[1.5 min] These four levels are from the Pulumi Policies docs. Our rule uses mandatory, so a target without a DLQ stops the run. Policies are written in TypeScript, JavaScript, Python or OPA. They are checked at preview and at update.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Can we recover events we already lost?</h1>
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

# Archive events now, replay them to a rule later

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-package class="plan__icon" />
    <p>An archive stores events from the bus</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-clock class="plan__icon" />
    <p>AWS advises waiting 10 minutes before a replay</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-arrows-clockwise class="plan__icon" />
    <p>A replay sends archived events back to a rule</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-warning class="plan__icon" />
    <p>Archive and replay are billed</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p><strong>Demo step 8:</strong> replay is an AWS CLI call, the Pulumi AWS provider has no replay resource.</p>
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
[1.5 min] An archive keeps events from one source bus. AWS recommends delaying a replay by 10 minutes so every event has reached the archive. A replay sends events back to the source bus; the demo targets one rule. We seed the archive before the session so you do not wait ten minutes.
-->

---

# Archive and replay are billed

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">What AWS bills</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Archive processing, per gigabyte</li>
      <li>Archive storage, per gigabyte-month</li>
      <li>Replayed events, as custom events</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">What that means for you</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Archive only the events you would replay</li>
      <li>Set a retention period if you do not need them forever</li>
      <li>Check the AWS pricing page for current rates</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1 min] Keep this short. The pricing page lists archive processing, storage and replay, and says a replay is billed like custom events. Do not quote prices; they change. The retention point comes from the archive docs: the default is to keep events indefinitely.
-->

---

# Five questions answered, one to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-arrows-split class="step-icon" /><div class="gpu-caption gpu-caption--accent">Routing</div><p>Event patterns on the rule</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-arrows-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--accent">Failure</div><p>Retry policy and a DLQ per target</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-puzzle-piece class="step-icon" /><div class="gpu-caption gpu-caption--accent">Reuse</div><p>One EventRouter component</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-seal-check class="step-icon" /><div class="gpu-caption gpu-caption--accent">Proof</div><p>Unit test and a mandatory policy</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-clock-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--accent">Recovery</div><p>Archive, then replay from the CLI</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-key class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Credentials</div><p>How do we run this without long-lived AWS keys?</p></div>
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
[0.75 min] Five answered. The last one, credentials, is the first thing the demo does: Pulumi ESC and OIDC, so there are no long-lived AWS keys on disk.
-->

---

# Where this breaks today

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">What the demo works around</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Replay is a CLI step, not a Pulumi resource</li>
      <li>A replay only reaches the bus its archive belongs to</li>
      <li>AWS advises waiting 10 minutes before a replay</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">What it does not do</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>The retry window is shortened for the demo, production keeps the default</li>
      <li>Policy runs as a local pack, no Pulumi Cloud policy group</li>
      <li>We did not run the demo on a live AWS account for this deck</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[1.5 min] Be plain about the limits. Replay is a CLI call. A replay only goes to the bus its archive belongs to. The archive needs a delay. And be clear about the demo: the retry window is short on purpose and the policy runs locally.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Make the safe path the easy path.</h1>
</div>

<!--
[1 min] Turn from the problem to the answer. Do not ask people to remember a setting. Put it in code they reuse.
-->

---

# The demo ends with one stack that holds every safeguard

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-cloud class="plan__icon" />
    <p>ESC hands out short-lived AWS credentials</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-puzzle-piece class="plan__icon" />
    <p>EventRouter builds the bus, rules and DLQs</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-shield-check class="plan__icon" />
    <p>A test and a policy pack reject a target without a DLQ</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-clock-clockwise class="plan__icon" />
    <p>An archive and a schedule on the same bus</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p><strong>Ten steps</strong> take us from an empty account to this and back to empty.</p>
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
[2 min] This is what we end with. Credentials from Pulumi ESC. The EventRouter component. A unit test and a Pulumi Policies pack that both reject a target without a DLQ. An archive for replay and a schedule as a heartbeat. Then we destroy it and check that nothing is left.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Event routing as code.</h1>
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
[0.25 min] Switch to the terminal.
-->

---

# What we are going to do

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-key class="step__icon" /><p>Short-lived AWS credentials from ESC</p></div>
  <div class="gpu-card step" v-click><ph-arrows-split class="step__icon" /><p>A bus, a rule and a Lambda target</p></div>
  <div class="gpu-card step" v-click><ph-package class="step__icon" /><p>A second rule to SQS with a transformer</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-prohibit class="step__icon" /><p>A broken permission lands the event in a DLQ</p></div>
  <div class="gpu-card step" v-click><ph-puzzle-piece class="step__icon" /><p>The same setup as a component, no replacement</p></div>
  <div class="gpu-card step" v-click><ph-check-circle class="step__icon" /><p>A unit test that fails on a plain target</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-shield-warning class="step__icon" /><p>A policy blocks the plain target at preview</p></div>
  <div class="gpu-card step" v-click><ph-clock-clockwise class="step__icon" /><p>Archived events replayed from the CLI</p></div>
  <div class="gpu-card step" v-click><ph-clock class="step__icon" /><p>A five-minute heartbeat from a schedule</p></div>
  <div class="gpu-card gpu-card--accent step" v-click><ph-trash class="step__icon" /><p>Destroy, then check that nothing is left</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.15; }
.steps { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.7rem; }
.step { display: flex; flex-direction: row; align-items: center; gap: 0.9rem; padding: 0.6rem 1.1rem; }
.step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.step__icon { font-size: 2rem; color: var(--p-primary); }
</style>

<!--
[2 min] Ten steps, as outcomes. Each has its own folder, numbered 01 to 10. Every AWS call goes through pulumi env run, so no keys are on disk. The archive needs about ten minutes of events, so we seed it before the session.
-->

---

# 1 · Short-lived credentials, no keys on disk

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />folder 01-credentials</div>
    <div class="big-code code-sm">

```bash
pulumi env run <org>/aws-eventbridge-patterns/dev -- aws sts get-caller-identity
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-lock-key /><span>The ESC environment holds an OIDC role, not an access key</span></li>
    <li><ph-cloud-check /><span>The call returns the assumed-role identity</span></li>
    <li><ph-eye-slash /><span>Nothing is written to disk</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; white-space: pre-wrap !important; word-break: break-all; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { min-width: 0; display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[4 min] Folder 01-credentials. ESC logs in to AWS with OIDC. pulumi env run injects the credentials into one command. Show the caller identity. Use your own role ARN in the environment file. Answers question six.
-->

---

# 2 · One rule sends an event to Lambda

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />folder 02-bus-and-rule</div>
    <div class="big-code code-sm">

```bash
pulumi env run <org>/aws-eventbridge-patterns/dev -- ./send-event.sh order.created
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-paper-plane-tilt /><span>Put order.created on the custom bus</span></li>
    <li><ph-file-text /><span>The Lambda log shows the event</span></li>
    <li><ph-clock /><span>Wait about 30 seconds after the first deploy for IAM</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; white-space: pre-wrap !important; word-break: break-all; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { min-width: 0; display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[5 min] Folder 02. Run pulumi up in the folder first. Send the event, then tail the logs. The log shows the event the rule matched.
-->

---

# 3 · The second rule sends a transformed message to SQS

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />folder 03-sqs-and-transformer</div>
    <div class="big-code code-sm">

```bash
pulumi env run <org>/aws-eventbridge-patterns/dev -- ../02-bus-and-rule/send-event.sh order.cancelled
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-note-pencil /><span>The input transformer reshapes the message</span></li>
    <li><ph-prohibit /><span>order.created is not in this queue</span></li>
    <li><ph-eye /><span>Read the queue with read-queue.sh</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; white-space: pre-wrap !important; word-break: break-all; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { min-width: 0; display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[5 min] Folder 03. Run pulumi up. Send order.cancelled. Read the queue: the transformed message is there and order.created is not. That shows the pattern routing.
-->

---

# 4 · A broken permission still keeps the event

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />folder 04-dlq-and-retry</div>
    <div class="big-code code-sm">

```bash
pulumi config set breakLambdaPermission true
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-arrows-clockwise /><span>Deploy again, then send an event</span></li>
    <li><ph-package /><span>About a minute later the event is in the DLQ</span></li>
    <li><ph-wrench /><span>Remove the setting and deploy to repair</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; white-space: pre-wrap !important; word-break: break-all; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { min-width: 0; display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[7 min] Folder 04. Deploy with a DLQ and a short retry policy first. Set the switch, deploy, send an event. Read the DLQ about a minute later and show the error attributes. Then remove the switch and deploy.
-->

---

# 5 · The component replaces nothing

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />folder 05-component</div>
    <div class="big-code code-sm">

```bash
pulumi preview
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-arrows-left-right /><span>Same resources, new parent</span></li>
    <li><ph-shield-check /><span>Aliases keep the old identities</span></li>
    <li><ph-check-circle /><span>Read the preview before pulumi up</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; white-space: pre-wrap !important; word-break: break-all; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { min-width: 0; display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[5 min] Folder 05. The same stack as a component. Show the preview first and point out there is no replace. Then deploy.
-->

---

# 6 · The unit test fails on a plain target

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />folder 06-unit-test</div>
    <div class="big-code code-sm">

```bash
PLAIN_TARGET=1 npm test
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-check /><span>npm test passes for the component</span></li>
    <li><ph-warning /><span>With PLAIN_TARGET=1 it fails</span></li>
    <li><ph-list-numbers /><span>The message names the target without deadLetterConfig</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; white-space: pre-wrap !important; word-break: break-all; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { min-width: 0; display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[4 min] Folder 06. Run npm test and show it passes. Then run with PLAIN_TARGET=1 and show the failure.
-->

---

# 7 · The policy blocks the plain target at preview

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />folder 07-policy</div>
    <div class="big-code code-sm">

```bash
pulumi preview --policy-pack ../07-policy
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-gavel /><span>The pack runs locally, no policy group</span></li>
    <li><ph-prohibit /><span>addPlainTarget true is blocked by eventbridge-target-has-dlq</span></li>
    <li><ph-check /><span>Without it the preview passes</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; white-space: pre-wrap !important; word-break: break-all; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { min-width: 0; display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[5 min] Folder 07. Build the pack, deploy the step 6 code, then preview with the pack. Set addPlainTarget and preview again: it is blocked. Remove the setting.
-->

---

# 8 · Archived events replay from the CLI

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />folder 08-archive-replay</div>
    <div class="big-code code-sm">

```bash
pulumi env run <org>/aws-eventbridge-patterns/dev -- ./replay.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-clock /><span>The archive needs about ten minutes of events</span></li>
    <li><ph-terminal-window /><span>Replay is an AWS CLI call in a script</span></li>
    <li><ph-eye /><span>The Lambda log shows the replayed events</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; white-space: pre-wrap !important; word-break: break-all; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { min-width: 0; display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[5 min] Folder 08. Use the stack seeded before the session. Run the replay and tail the logs.
-->

---

# 9 · A schedule sends a heartbeat every five minutes

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />folder 09-schedule</div>
    <div class="big-code code-sm">

```bash
pulumi env run <org>/aws-eventbridge-patterns/dev -- ../02-bus-and-rule/tail-logs.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-clock /><span>Five minutes between heartbeats</span></li>
    <li><ph-eye /><span>The Lambda log shows each one</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; white-space: pre-wrap !important; word-break: break-all; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { min-width: 0; display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[3 min] Folder 09. Deploy, then tail the logs and wait for the first heartbeat. If the Scheduler check fails in eu-central-1, use us-east-1.
-->

---

# 10 · Destroy it and check nothing is left

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />folder 10-teardown</div>
    <div class="big-code code-sm">

```bash
pulumi destroy
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-check-circle /><span>check-clean.sh lists bus, queues, functions, roles</span></li>
    <li><ph-lock-key /><span>Run it before removing the ESC environment</span></li>
    <li><ph-trash /><span>Then delete the environment</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; white-space: pre-wrap !important; word-break: break-all; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { min-width: 0; display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
[3 min] Folder 10. Destroy the stacks, run check-clean.sh with the environment, then remove it.
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/aws-eventbridge-patterns" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → aws-eventbridge-patterns</div>
  </div>
  <div class="res-card">
    <QRCode data="https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-rule-dlq.html" dark="#000000" />
    <div class="res-card__title">EventBridge dead-letter queues (AWS docs)</div>
    <div class="res-card__body">docs.aws.amazon.com</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/iac/concepts/components/" dark="#000000" />
    <div class="res-card__title">Pulumi IaC components</div>
    <div class="res-card__body">pulumi.com/docs/iac/concepts/components</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/discovery-governance/concepts/policy-as-code/" dark="#000000" />
    <div class="res-card__title">Pulumi Policies</div>
    <div class="res-card__body">pulumi.com/docs/discovery-governance</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/esc/guides/configuring-oidc/aws/" dark="#000000" />
    <div class="res-card__title">Pulumi ESC: OIDC for AWS</div>
    <div class="res-card__body">pulumi.com/docs/esc</div>
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
[0.75 min] The links are the AWS and Pulumi docs pages used in this workshop. The repo card points to the workshop folder.
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
[0.5 min] Pointers for what to try next.
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/aws-eventbridge-patterns" dark="#000000" /></div>
      <div class="thanks__qr-label">aws-eventbridge-patterns</div>
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
[5 min] Questions.
-->
