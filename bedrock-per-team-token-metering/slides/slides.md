---
theme: "@pulumi/slidev-theme"
title: "Who Spent All the Tokens? Per-Team AI Cost Control as Code"
info: |
  Who Spent All the Tokens? Per-Team AI Cost Control as Code.
  Adam Gordon Bell and Engin Diri, Pulumi. 60 minutes, demo-only.

  Repo: https://github.com/pulumi/workshops/tree/main/bedrock-per-team-token-metering
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
  <h1 class="!text-[5.4rem] !leading-[1.04] !font-semibold !tracking-tight !mb-6 !max-w-[95%]">
    Who Spent All the Tokens?
  </h1>
  <p class="!mt-2 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Per-Team AI Cost Control as Code
  </p>
  <p class="!mt-8 !text-[1.8rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Adam Gordon Bell · Engin Diri · Pulumi
  </p>
</div>

<!--
- Welcome. Sixty minutes, one demo, nothing to follow along with.
- By the end you can say which team spent the tokens on a shared Bedrock account, and stop the next untagged profile before it exists.
-->

---

<div class="absolute inset-0 flex items-center px-24 gap-20">
  <div class="flex-shrink-0">
    <img src="/img/engin-diri.jpg" class="w-[28rem] rounded-2xl shadow-xl border-4" style="border-color: rgba(126,107,255,0.45)" alt="Engin Diri" />
  </div>
  <div class="flex-1">
    <h1 class="!text-[7rem] !leading-[1.02] !font-semibold !tracking-tight !mb-4 !text-[var(--p-primary)]">Engin Diri</h1>
    <p class="!text-[2.5rem] !leading-relaxed !m-0 opacity-90">
      Senior Solutions Architect at <strong class="!text-[var(--p-primary)]">Pulumi</strong>
    </p>
    <div class="!mt-8 flex items-center gap-8 !text-[1.5rem] opacity-70">
      <span class="flex items-center gap-2"><carbon-logo-x /> @_ediri</span>
      <span class="flex items-center gap-2"><carbon-logo-linkedin /> engin-diri</span>
      <span class="flex items-center gap-2"><carbon-logo-github /> dirien</span>
    </div>
    <p class="!mt-10 !text-[1.75rem] !leading-relaxed opacity-70 !m-0">
      Building platform tooling and infrastructure-as-code.<br/>
      Helping teams ship cloud infrastructure faster. With and without agents.
    </p>
  </div>
</div>

<!--
- Engin: Senior Solutions Architect at Pulumi.
- On chat and Q&A throughout; jumps in on the AWS details.
-->

---

<div class="absolute inset-0 flex items-center px-24 gap-20">
  <div class="flex-shrink-0">
    <img src="/img/adam-gordon-bell.png" class="w-[28rem] rounded-2xl shadow-xl border-4" style="border-color: rgba(126,107,255,0.45)" alt="Adam Gordon Bell" />
  </div>
  <div class="flex-1">
    <h1 class="!text-[7rem] !leading-[1.02] !font-semibold !tracking-tight !mb-4 !text-[var(--p-primary)]">Adam Gordon Bell</h1>
    <p class="!text-[2.5rem] !leading-relaxed !m-0 opacity-90">
      Community Engineer at <strong class="!text-[var(--p-primary)]">Pulumi</strong>
    </p>
    <div class="!mt-8 flex items-center gap-8 !text-[1.5rem] opacity-70">
      <span class="flex items-center gap-2"><carbon-logo-x /> @adamgordonbell</span>
      <span class="flex items-center gap-2"><carbon-logo-linkedin /> adamgordonbell</span>
      <span class="flex items-center gap-2"><carbon-logo-github /> adamgordonbell</span>
    </div>
    <p class="!mt-10 !text-[1.75rem] !leading-relaxed opacity-70 !m-0">
      Host of the CoRecursive podcast.<br/>
      Telling the stories behind the code.
    </p>
  </div>
</div>

<!--
- Adam: Community Engineer at Pulumi, host of CoRecursive.
- Drives the demo today.
-->

---

# Housekeeping and agenda

<div class="zoom-content">

<div class="grid grid-cols-2 gap-12 mt-6">
  <div>
    <div class="gpu-caption gpu-caption--accent">Housekeeping</div>
    <ul class="!mt-4 !text-[1.3rem] !leading-relaxed space-y-3">
      <li>Ask questions <strong>any time</strong> in the Q&amp;A tab</li>
      <li>Code, slides and the recording come by email afterwards</li>
    </ul>
  </div>
  <div>
    <div class="gpu-caption gpu-caption--accent">Agenda</div>
    <ul class="!mt-4 !text-[1.3rem] !leading-relaxed space-y-3">
      <li>The problem</li>
      <li>Case study</li>
      <li>Live demo</li>
      <li>Why Pulumi</li>
      <li>Q&amp;A</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
</style>

<!--
- Questions any time in the Q&A tab; Engin answers as we go or pulls them up at the end.
- Code, slides and the recording come by email afterwards, so nothing to copy down.
- One breath on the agenda: the problem, a case study with three teams on one account, the demo, why we did it with Pulumi, questions.
-->

---
routeAlias: stage-problem
bleed: true
---

<div class="bleed">
  <img src="/img/techcrunch-uber-cap.png" alt="TechCrunch: Uber caps employee AI spending after blowing through budget in four months" />
  <p class="bleed__src">techcrunch.com, 2 June 2026, citing Bloomberg, The Information and Forbes</p>
</div>

<!--
- Uber rolled Claude Code out to about five thousand engineers in December. Leaderboards ranked people by usage. By April the whole year's budget was gone.
- The fix came in June: a cap of fifteen hundred dollars a month per employee per tool. That is a per-person brake, after the fact.
- Nobody in the coverage can say which team spent it. Hold that thought.
-->

---

# It is not an Uber story

<div class="zoom-content">

<div class="quote">
  <img class="quote__photo" src="/img/gergely-orosz.png" alt="Gergely Orosz" />
  <div class="quote__text">
    <blockquote class="quote__q">
      <p>Some developers are now spending <strong>$500 a day</strong> on Claude Code.</p>
      <p>The initial plan to have strict limits (say, $100 per user) is breaking when reality hits.</p>
    </blockquote>
    <p class="quote__who">Gergely Orosz, The Pragmatic Engineer<br />
    <span>"The Pulse: token spend breaks budgets, what next?", 30 April 2026, after talking to fifteen companies</span></p>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.quote { display: flex; align-items: center; gap: 2.4rem; max-width: 62rem; margin: 1.2rem auto 0; }
.quote__photo { width: 11rem; height: 11rem; border-radius: 50%; object-fit: cover; flex: none; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18); }
.quote__q { margin: 0 !important; padding: 0 0 0 1.2rem !important; border-left: 5px solid var(--p-primary) !important; background: none !important; }
.quote__q p { font-size: 1.55rem !important; line-height: 1.4 !important; color: var(--p-fg) !important; margin: 0 0 0.7rem !important; font-style: normal !important; }
.quote__q strong { color: var(--p-primary); }
.quote__who { margin: 1.1rem 0 0 1.5rem !important; font-size: 1.05rem !important; font-weight: 700; color: var(--p-fg); }
.quote__who span { display: block; font-weight: 400; font-size: 0.9rem; color: var(--p-fg-muted); margin-top: 0.2rem; }
</style>

<!--
- Gergely Orosz talked to fifteen companies the week after the Uber story. Token spend up ten times in six months at one; fifteen times at another; budgets raised several times in one month.
- The two lines on the slide are the two halves of our problem: individual spend nobody expected, and the per-user cap that was supposed to contain it breaking in days. Every company found out from the bill.
-->

---
bleed: true
---

<div class="bleed">
  <img src="/img/dn42-agent-bill.png" alt="Lan Tian's blog: AI Agent Bankrupted Their Operator While Trying to Scan DN42. An AI agent tried to join the DN42 hobbyist network, bankrupted its operator with a $6531.30 AWS bill, the operator is begging for donations." />
  <p class="bleed__src">lantian.pub, 13 May 2026 · 1,467 points on Hacker News</p>
</div>

<!--
- Not a company this time. A hobbyist handed an agent an AWS key and asked it to join DN42, a hobby network, and index it. The agent decided the right tool was five m8g.12xlarge instances and kept redeploying them.
- Six and a half thousand dollars in under a week, on a pet project, and the operator ended up asking the community for donations. The agent asked for confirmation several times; the operator said keep going without reading the plan.
- Same shape as Uber, with the budget of one person: a key, a meter nobody was watching, and the bill as the first signal.
-->

---
bleed: true
---

<div class="bleed">
  <img src="/img/register-bedrock-30k.png" alt="The Register: Bedrock and a hard place: Claude adventure leaves AWS user staring down $30K invoice" />
  <p class="bleed__src">theregister.com, Richard Speed, 14 May 2026</p>
</div>

<!--
- This one is on our turf. A Register reader running Claude Opus through Bedrock. Activate credits covered the first eight thousand, then the invoice: thirty thousand for April.
- The alarm they trusted, Cost Anomaly Detection, does not cover Marketplace charges, and Anthropic models on Bedrock bill through Marketplace. AWS pointed them at AWS Budgets.
- A key, a model id, and nothing between the two. That is the default Bedrock setup.
-->

---
bleed: true
---

<div class="bleed">
  <img src="/img/register-gemini-82k.png" alt="The Register: Dev stunned by $82K Gemini bill after unknown API key thief goes to town" />
  <p class="bleed__src">theregister.com, Jessica Lyons, 3 March 2026</p>
</div>

<!--
- Different provider, same lesson. A key is a spending instrument. This one leaked, and in two days someone else spent four hundred times the company's monthly bill.
- Google's answer was the shared responsibility model. The scope of a key, and what it can reach, is on you.
- And half the callers on a key are not people. A support bot, a CI agent, two agents in a loop: a process with a key has nobody at the keyboard to notice the bill. The people stories have a person who can stop; these do not.
- So: a key that can only call one profile, and a counter on that profile. That is where we are going.
-->

---

# Possible solutions

<div class="zoom-content">

<div class="grid grid-cols-3 gap-8 mt-4">
  <div class="gpu-card sol" v-click="1">
    <ph-user class="sol__icon" />
    <div class="gpu-caption">Seat plans</div>
    <p>Claude Team, ChatGPT Business: a cap per person, per tool.</p>
    <p class="sol__but">Works for people in coding tools. Not for bots, services or internal apps on a key.</p>
  </div>
  <div class="gpu-card sol" v-click="2">
    <ph-receipt class="sol__icon" />
    <div class="gpu-caption">Spend caps on AWS</div>
    <p>AWS Budgets, Cost Anomaly Detection.</p>
    <p class="sol__but">Fire off the bill, a day late, for the whole account. Marketplace charges slip past.</p>
  </div>
  <div class="gpu-card gpu-card--primary sol" v-click="3">
    <ph-git-branch class="sol__icon" />
    <div class="gpu-caption gpu-caption--accent">Per-team metering and a stop, as code</div>
    <p>A profile and a role per team. Tokens counted per minute. A cutoff when a team goes over.</p>
    <p class="sol__but">Today.</p>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.sol { display: flex; flex-direction: column; gap: 0.6rem; padding: 1.3rem 1.4rem; }
.sol p { margin: 0 !important; font-size: 1.05rem; line-height: 1.4; }
.sol__but { color: var(--p-fg-muted); }
.sol__icon { font-size: 2rem; color: var(--p-primary); }
</style>

<!--
- Three ways to stop the next Uber bill.
- Seat plans: Claude Team at twenty to a hundred and twenty-five a seat, ChatGPT Business with Codex. The vendor meters each person. Fine for engineers in a coding tool; a seat cannot sit in a cron job, and the support bot, the CI agent and the internal Slack assistant all run on keys.
- Spend caps on AWS: Budgets and Cost Anomaly Detection. They read the bill, so they fire a day late and for the whole account, and the Register reader found out Anomaly Detection skips Marketplace charges, which is how Anthropic on Bedrock bills.
- Ours: give each team its own profile and role, count tokens as the calls happen, and cut a team off when it passes its limit. All of it as code. That is the rest of the hour.
- Pricing moves monthly; the shape is what matters. Check the vendor pages before quoting a number.
-->

---

# The problem: one account, one bill, one line

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-4 items-start">
  <div class="bill" v-click="1">
    <div class="gpu-caption gpu-caption--muted">Invoice, this month</div>
    <div class="bill__row"><span>Amazon Bedrock</span><span class="bill__amt">$ ▮▮,▮▮▮</span></div>
    <div class="bill__row bill__row--dim"><span>Every team, one shared role</span><span>one line</span></div>
  </div>
  <div class="gaps">
    <div class="gap" v-click="2"><ph-question class="gap__icon" /><div><strong>Who?</strong> Nobody can say which team spent it.</div></div>
    <div class="gap" v-click="3"><ph-hand-palm class="gap__icon" /><div><strong>Stop?</strong> Nothing stops a team from spending it.</div></div>
    <div class="gap" v-click="4"><ph-clock-counter-clockwise class="gap__icon" /><div><strong>When?</strong> The cost-tag answer arrives a day late.</div></div>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
.bill { border: 1.5px solid var(--p-border); border-radius: 14px; padding: 1.1rem 1.3rem; background: var(--p-bg-elevated); }
.bill__row { display: flex; justify-content: space-between; align-items: baseline; font-size: 1.35rem; font-weight: 600; margin-top: 0.9rem; padding-bottom: 0.5rem; border-bottom: 1px dashed var(--p-border); }
.bill__row--dim { font-size: 0.95rem; font-weight: 400; color: var(--p-fg-muted); border-bottom: none; padding-bottom: 0; }
.bill__amt { font-family: var(--slidev-font-mono); color: var(--p-primary); }
.gaps { display: flex; flex-direction: column; gap: 0.9rem; }
.gap { display: flex; align-items: flex-start; gap: 0.8rem; font-size: 1.15rem; line-height: 1.4; }
.gap__icon { flex-shrink: 0; font-size: 1.7rem; color: var(--p-primary); }
.gap strong { color: var(--p-primary); }
</style>

<!--
- Our org builds on AWS, so the models come through Bedrock. One account, one bill, one line that says Amazon Bedrock.
- Three gaps. Nobody can say which team spent it. Nothing stops a team from spending it. And the cost allocation tags that would answer the first question arrive on the bill a day later.
- The obvious setup is one role and the model id. It works, and it tells you nothing about who called.
-->

---

# Case study: three teams, one AWS account

<div class="zoom-content">

<div class="teams">
  <div class="gpu-card gpu-card--primary team" v-click="1">
    <ph-magnifying-glass class="team__icon" />
    <div class="team__name">search</div>
    <p>Internal Slack assistant answering questions over company docs (RAG)</p>
    <div class="team__meta">Nova 2 Lite · cc-1001</div>
  </div>
  <div class="gpu-card gpu-card--primary team" v-click="2">
    <ph-headset class="team__icon" />
    <div class="team__name">support</div>
    <p>Customer-support ticket triage bot on ECS</p>
    <div class="team__meta">Nova 2 Lite · cc-2002</div>
  </div>
  <div class="gpu-card gpu-card--muted team" v-click="3">
    <ph-terminal-window class="team__icon" />
    <div class="team__name">dev</div>
    <p>Engineers running Claude Code on Bedrock, pinned to the team's profile ARN via <code>ANTHROPIC_MODEL</code> and <code>CLAUDE_CODE_USE_BEDROCK=1</code></p>
    <div class="team__meta">Claude Code</div>
  </div>
</div>

<aside class="info-card teams__foot" v-click="4">
  <p><strong>Goal:</strong> per-team limits and alerts on Bedrock spend, on one account.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.teams { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem; }
.team { display: flex; flex-direction: column; gap: 0.6rem; padding: 1.2rem 1.3rem; }
.team p { margin: 0 !important; font-size: 1.05rem; line-height: 1.4; flex: 1; }
.team code { font-size: 0.85em !important; }
.team__icon { font-size: 2.2rem; color: var(--p-primary); }
.team__name { font-family: var(--slidev-font-mono); font-size: 1.4rem; font-weight: 700; color: var(--p-primary); }
.team__meta { font-family: var(--slidev-font-mono); font-size: 0.85rem; color: var(--p-fg-muted); margin-top: 0.3rem; }
.teams__foot { margin-top: 1.3rem; }
.teams__foot p { font-size: 1.15rem; }
</style>

<!--
- Three teams on the same account. Search is a Slack bot over company docs. Support triages tickets from a service on ECS. Dev is engineers in Claude Code, pointed at Bedrock.
- Three different clients: a RAG app, a container, a developer tool on a laptop. The mechanism does not care which.
- The goal: a limit and an alert per team, on the one AWS account, without touching any of the three clients.
- Today's demo deploys search and support, cost centers 1001 and 2002. Dev is one more entry in the teams list.
-->

---
routeAlias: stage-idea
---

# What we'll build

<div class="zoom-content">

<div class="dia">
  <img src="/img/diagrams/architecture.png" alt="Three clients, each through its own role and tagged profile into Amazon Bedrock; the invocation log feeds per-team metric filters and an alarm" />
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
.dia { margin-top: 1.4rem; display: flex; justify-content: center; }
.dia img { width: 100%; height: auto; object-fit: contain; }
.dia__cap { text-align: center; font-size: 1.15rem !important; color: var(--p-fg-muted); margin-top: 1.2rem !important; }
</style>

<!--
- A role and a tagged profile per team; the log counts tokens whatever the client is. Left to right. Three clients: a Slack bot, a container on ECS, a developer in Claude Code. Each one assumes its team's role, and that role can invoke exactly one application inference profile.
- The profile is the unit of attribution. It carries the Team and CostCenter tags, and its ARN goes wherever the model id would go.
- Bedrock invocation logging writes one record per call with the caller's ARN, the profile, and the input and output token counts. It does this for any client, so nothing is installed on the bot, the container, or the laptop.
- Two metric filters per team turn those records into token metrics, and two alarms watch output tokens, one per minute and one per day. When either fires it calls a function that denies that team's role further calls. That is the stop, and we watch it happen in the demo.
- The whole picture is one Pulumi stack. A team is one entry in a list.
-->

---

# What is in the repo

<div class="diagram-slide">
  <img src="/img/diagrams/code-map.png" alt="Code map: Pulumi.dev.yaml, the teams list, feeds index.ts, the program. index.ts maps each team onto meteredModelAccess.ts, one team, five resources, and creates tokenCutoff.ts, the stop, whose handler cutoff/index.mjs turns ALARM into a Deny. policy/rules.ts, two guardrails, runs at preview. scripts/ call, trip, check and restore on the AWS side." />
</div>

<style scoped>
.diagram-slide { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; }
.diagram-slide img { max-width: 94%; max-height: 100%; object-fit: contain; }
</style>

<!--
- Six files, about five hundred lines. Left to right is the order we will read them.
- The teams list is the only thing most people in your org ever touch: a name and a cost center per team. index.ts maps that list onto one component per team, and the component is five AWS resources: profile, role, two metric filters, an alarm.
- Below it, the stop: a Lambda and its forty-line handler that turns an alarm into a Deny on the team role.
- Dotted line: the policy pack. Two rules, checked at preview; the org enforces it, so nobody has to remember a flag.
- scripts/ is the AWS side only: call Bedrock as a team, trip the alarm, check the cutoff, restore. Each one prints the AWS command it runs.
-->

---
routeAlias: stage-demo
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Per-team Bedrock metering.</h1>
  </div>
  <StageMap size="lg" />
  <div class="demo-links">
    <div class="demo-links__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/bedrock-per-team-token-metering" /></div>
    <div class="demo-links__text">
      <span class="demo-links__label">code</span>
      <a href="https://app.pulumi.com/adamgordonbell-org/bedrock-metering/dev" target="_blank" rel="noopener">Pulumi Cloud ↗</a>
      <a href="https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#alarmsV2:" target="_blank" rel="noopener">AWS console ↗</a>
    </div>
  </div>
</div>

<style scoped>
.sec { position: absolute; inset: 0; overflow: hidden; }
.sec__lines { position: absolute; width: 30rem; height: auto; opacity: 0.55; pointer-events: none; }
.sec__lines--tr { top: 0; right: 0; }
.sec__lines--bl { bottom: 0; left: 0; }
.sec__inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 5rem; }
.sec__inner h1 { text-wrap: balance; }
.demo-links { position: absolute; right: 2.6rem; bottom: 8.2rem; display: flex; align-items: center; gap: 0.9rem; opacity: 0.85; }
.demo-links__qr { width: 6.2rem; height: 6.2rem; }
.demo-links__text { display: flex; flex-direction: column; gap: 0.35rem; font-family: var(--slidev-font-mono); font-size: 0.85rem; line-height: 1.2; }
.demo-links__label { color: var(--p-fg-muted); letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.75rem; }
.demo-links a { color: var(--p-primary); text-decoration: none; border-bottom: 1px dotted var(--p-primary); width: max-content; }
</style>

<!--
- Bottom right: the repo QR for anyone who wants to follow in the code, and the two links to click during the demo, the stack in Pulumi Cloud and the CloudWatch alarms in the AWS console.
- Switch to the terminal. TUTORIAL.md in the repo is the exact path.
- First the finished thing: the YAML, two defaults and three teams, then one `pulumi up`. While it builds, the program, the component, the cutoff function, the two policy rules. Then the outputs: a role and a profile per team, no key. Then the stack in Pulumi Cloud.
- Then each team calls Bedrock as itself, we read the log, and we push search over its limit and walk away from it.
- Then the list: a fourth team is eight resources in the preview. Then the boundary and the two mistakes the policy pack refuses.
- Then the stop: the alarm has fired, search's own call fails, support's still works, and one command lifts it.
-->

---

# What we just saw

<div class="zoom-content">

<div class="lanes">
  <div class="lane" v-click="1">
    <div class="gpu-caption gpu-caption--accent">At preview</div>
    <img src="/img/diagrams/stop-preview.png" alt="A code change goes through pulumi preview and the policy pack: tagged with no wildcard reaches pulumi up; an untagged profile or a wildcard invoke fails the preview and nothing reaches AWS" />
  </div>
  <div class="lane" v-click="2">
    <div class="gpu-caption gpu-caption--accent">At call time</div>
    <img src="/img/diagrams/stop-call.png" alt="Team support calls Bedrock: through its own profile the call is logged and metered; through the search profile IAM returns AccessDenied" />
  </div>
  <div class="lane" v-click="3">
    <div class="gpu-caption gpu-caption--accent">At the minute mark</div>
    <img src="/img/diagrams/stop-minute.png" alt="Team search goes over the token threshold: the alarm calls the cutoff function, which puts a Deny on the search role, and the next call gets AccessDenied" />
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.1; }
.lanes { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.2rem; }
.lane { display: flex; flex-direction: column; gap: 0.1rem; }
.lane img { width: 58%; height: auto; object-fit: contain; object-position: left center; display: block; }
.lane:nth-child(2) img { width: 52%; }
.lane:nth-child(3) img { width: 74%; }
</style>

<!--
- Back from the terminal. Three places it stopped, and we saw each one once.
- At preview: the policy pack's two rules, tags on every profile and no wildcard invoke. The two mistakes failed the preview and never became resources.
- At call time: the role names the profile ARN. Support asking for the search profile got AccessDenied from IAM, not from a convention.
- At the minute mark: search's alarm watched output tokens per minute. It fired, called the cutoff function, and the function put a Deny on the search role. The same Converse call that worked for support came back AccessDenied for search, and support kept working. Nothing lifts it on its own; one command did.
- The clocks: the first log record within about 15 seconds, metrics within a minute, the alarm 40 to 90 seconds after the last call, the Deny the same second. The invoice, with the cost allocation tags, takes up to a day.
- Three config entries did all of it: three profiles, three roles, six filters, six alarms, twenty-four resources from the list in the YAML. The daily alarm is the same stop on a longer clock.
-->

---
routeAlias: stage-further
---

# Go further

<div class="zoom-content">

<div class="ways">
  <div class="gpu-card way" v-click="1">
    <ph-broadcast class="way__icon" />
    <div class="way__name">Telemetry from the client</div>
    <p>Claude Code emits OpenTelemetry. AWS ships a collector into CloudWatch.</p>
    <div class="way__url">github.com/aws-solutions-library-samples/guidance-for-claude-code-with-amazon-bedrock</div>
  </div>
  <div class="gpu-card way" v-click="2">
    <ph-arrows-split class="way__icon" />
    <div class="way__name">An LLM gateway</div>
    <p>A virtual key and a budget per team, across providers.</p>
    <div class="way__url">docs.litellm.ai</div>
  </div>
  <div class="gpu-card way" v-click="3">
    <ph-receipt class="way__icon" />
    <div class="way__name">Tags and AWS Budgets</div>
    <p>The dollars, a day later. The enableBudget flag in the repo.</p>
    <div class="way__url">docs.aws.amazon.com/bedrock → cost-mgmt-application-inference-profiles</div>
  </div>
  <div class="gpu-card way" v-click="4">
    <ph-lightning class="way__icon" />
    <div class="way__name">Bedrock Mantle Projects</div>
    <p>The same idea for the OpenAI-shaped endpoint.</p>
    <div class="way__url">docs.aws.amazon.com/bedrock → cost-mgmt-projects</div>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.15; }
.ways { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.2rem; }
.way { display: flex; flex-direction: column; gap: 0.5rem; padding: 1.2rem 1.4rem; }
.way p { margin: 0 !important; font-size: 1.1rem; line-height: 1.4; flex: 1; }
.way__icon { font-size: 2rem; color: var(--p-primary); }
.way__name { font-size: 1.35rem; font-weight: 700; color: var(--p-primary); }
.way__url { font-family: var(--slidev-font-mono); font-size: 0.8rem; color: var(--p-fg-muted); word-break: break-all; margin-top: 0.3rem; }
</style>

<!--
- Four roads from here, each with a link. We are not walking any of them today.
- From the client: Claude Code emits OpenTelemetry metrics, and the AWS Solutions Library guidance for Claude Code on Bedrock has a collector that lands them in CloudWatch. It needs the client to cooperate; the invocation log needs nothing on the client, which is why the ECS bot and the laptop look the same to it.
- A gateway: LiteLLM, Portkey, Bifrost. A virtual key per team with a budget, and it spans providers. It is another service to run, and credentials only stop at team boundaries if the requests are tagged.
- Cost allocation tags and AWS Budgets are the real-money answer: activate the Team tag, wait up to a day, and only spend after activation is tagged. The enableBudget flag in the repo adds the budget; it is not part of today's demo.
- Mantle is Bedrock's OpenAI-shaped endpoint. Invocation logging and application profiles do not reach it; its unit is a tagged Project, with per-project metrics and CloudTrail data events. Same idea, tag the unit and scope IAM to it. Claude Code on Bedrock uses bedrock-runtime unless someone sets CLAUDE_CODE_USE_MANTLE.
- Caveats if asked: Bedrock Agents and Knowledge Bases call under a service role, so make that the team role. Prompt-cache tokens are reported as their own counts, so count them. The Responses API on bedrock-runtime rejects application profiles with a 400; Invoke, Converse and Chat Completions take them. One profile per team and model. The demo cutoff is sticky and silent; in production add a notification and decide who lifts it.
-->

---
routeAlias: stage-pulumi
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Why Pulumi?</h1>
  </div>
  <StageMap size="lg" />
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
- Everything in the demo was cloud resources: profiles, roles, filters, alarms, a logging setting. Four reasons we built it with Pulumi, each one something you just watched.
-->

---

# Not a config DSL

<div class="zoom-content">

<div class="why">
  <p v-click="1"><ph-code class="why__icon" />TypeScript, Python, Go, .NET, Java, YAML</p>
  <p v-click="2"><ph-repeat class="why__icon" />Loops, conditions, tests</p>
  <p v-click="3"><ph-robot class="why__icon" />The language your coding agents already write</p>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
.why { display: flex; flex-direction: column; gap: 1.6rem; margin-top: 2.4rem; }
.why p { display: flex; align-items: center; gap: 1.4rem; font-size: 2.4rem !important; line-height: 1.25 !important; font-weight: 600; letter-spacing: -0.01em; margin: 0 !important; }
.why__icon { flex-shrink: 0; font-size: 2.8rem; color: var(--p-primary); }
.why__foot { margin-top: 2.2rem; }
.why__foot p { font-size: 1.5rem; }
</style>

<!--
- Pick the language your team already speaks. The program you saw is TypeScript: a config value, a map over the teams list, a component per entry.
- Real languages mean loops, conditions and tests. The policy rules are plain functions with unit tests that run without Pulumi Cloud.
- It matters more now. Coding agents already write these languages fluently. A config DSL puts a translation layer between intent and execution; the agent that wrote the bot can also write its metering.
-->

---

# A team is one entry in a list

<div class="zoom-content">

<div class="comp">
  <div class="gpu-card gpu-card--primary comp__entry" v-click="1">
    <ph-list-bullets class="comp__icon" />
    <div class="comp__title">Config entry</div>
    <div class="comp__sub">name, cost center, limits</div>
  </div>
  <ph-arrow-right class="comp__arrow" v-click="2" />
  <div class="gpu-card comp__box" v-click="2">
    <div class="gpu-caption gpu-caption--accent">One component</div>
    <div class="comp__chips">
      <span><ph-tag />Tagged profile</span>
      <span><ph-identification-badge />Scoped role</span>
      <span><ph-funnel />Input filter</span>
      <span><ph-funnel />Output filter</span>
      <span><ph-bell />Two alarms</span>
    </div>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
.comp { display: flex; align-items: center; justify-content: center; gap: 2.4rem; margin-top: 2.6rem; }
.comp__entry { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 2rem 2.6rem; }
.comp__icon { font-size: 3rem; color: var(--p-primary); }
.comp__title { font-size: 1.7rem; font-weight: 700; }
.comp__sub { font-family: var(--slidev-font-mono); font-size: 1rem; color: var(--p-fg-muted); }
.comp__arrow { font-size: 3.2rem; color: var(--p-primary); flex-shrink: 0; }
.comp__box { padding: 1.6rem 2rem; }
.comp__chips { display: grid; grid-template-columns: repeat(2, auto); gap: 0.8rem 2rem; margin-top: 1rem; }
.comp__chips span { display: inline-flex; align-items: center; gap: 0.6rem; font-size: 1.5rem; font-weight: 600; }
.comp__chips span svg { color: var(--p-primary); font-size: 1.8rem; }
.comp__foot { margin-top: 2.4rem; }
.comp__foot p { font-size: 1.5rem; }
</style>

<!--
- A component bundles a chunk of infrastructure into one reusable unit. Ours is MeteredModelAccess: the tagged profile, the scoped role, two metric filters and two alarms, a minute and a day, already wired to the cutoff function the stack shares.
- The program maps the teams list over it and fills in the defaults. Adding a team is adding an entry; dev, the Claude Code team, is one more entry with its own burst limit and no new code.
- The fourth team in the preview was eight resources under one parent, from two lines of YAML.
-->

---

# ESC: no key to leak

<div class="zoom-content">

<div class="why">
  <p v-click="1"><ph-key class="why__icon" />Short-lived AWS credentials over OIDC</p>
  <p v-click="2"><ph-laptop class="why__icon" />Nothing in a file, nothing on a laptop</p>
  <p v-click="3"><ph-users class="why__icon" />Humans and agents run the same command</p>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
.why { display: flex; flex-direction: column; gap: 1.6rem; margin-top: 2.4rem; }
.why p { display: flex; align-items: center; gap: 1.4rem; font-size: 2.4rem !important; line-height: 1.25 !important; font-weight: 600; letter-spacing: -0.01em; margin: 0 !important; }
.why__icon { flex-shrink: 0; font-size: 2.8rem; color: var(--p-primary); }
.why__foot { margin-top: 2.2rem; }
.why__foot p { font-size: 1.5rem; }
</style>

<!--
- Remember the $82,000 Gemini bill. That was a static key in a repository. There was no static key anywhere in this demo.
- Pulumi ESC mints short-lived AWS credentials over OIDC. The stack config references the environment by name; nothing lives in a dotenv file or on a laptop.
- A new teammate, or an agent, runs the same pulumi up with nothing set up locally. Credentials and config live in one place.
-->

---

# And there is so much more

<div class="zoom-content">

<div class="plat-ring" v-click="5"><span class="plat-ring__label">The Pulumi platform</span></div>

<div class="plat">
  <div class="gpu-card plat__card" v-click="1">
    <ph-robot class="plat__icon" />
    <div class="plat__name">Pulumi Neo</div>
    <p>Your AI platform engineer</p>
  </div>
  <div class="gpu-card gpu-card--primary plat__card plat__hub" v-click="0">
    <ph-code class="plat__icon plat__icon--hub" />
    <div class="plat__name plat__name--hub">Pulumi IaC</div>
    <p>Infrastructure as code in any language</p>
  </div>
  <div class="gpu-card plat__card" v-click="2">
    <ph-lock-key class="plat__icon" />
    <div class="plat__name">Pulumi ESC</div>
    <p>Secrets and configuration</p>
  </div>
  <div class="gpu-card plat__card" v-click="3">
    <ph-magnifying-glass class="plat__icon" />
    <div class="plat__name">Pulumi Insights</div>
    <p>Discovery and governance</p>
  </div>
  <div class="gpu-card plat__card" v-click="4">
    <ph-squares-four class="plat__icon" />
    <div class="plat__name">Pulumi IDP</div>
    <p>Self-service infrastructure</p>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.plat-ring { position: absolute; inset: -1.6rem -1.4rem -1.4rem; border: 3px solid var(--p-primary); border-radius: 22px; pointer-events: none; }
.plat-ring__label { position: absolute; top: -0.85rem; left: 1.6rem; padding: 0 0.6rem; background: #fff; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--p-primary); }
.zoom-content { position: relative; margin-top: 1.2rem; }
.plat { display: grid; grid-template-columns: 1fr 1.25fr 1fr; grid-template-rows: 1fr 1fr; gap: 1.2rem; align-items: stretch; }
.plat__card { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 0.5rem; padding: 1.4rem 1.2rem; }
.plat__hub { grid-column: 2; grid-row: 1 / span 2; }
.plat__card:nth-child(3) { grid-column: 3; grid-row: 1; }
.plat__card:nth-child(4) { grid-column: 1; grid-row: 2; }
.plat__card:nth-child(5) { grid-column: 3; grid-row: 2; }
.plat__icon { font-size: 2.4rem; color: var(--p-primary); }
.plat__icon--hub { font-size: 3.6rem; }
.plat__name { font-size: 1.35rem; font-weight: 700; color: var(--p-primary); }
.plat__name--hub { font-size: 1.9rem; }
.plat__card p { margin: 0 !important; font-size: 1rem; line-height: 1.4; color: var(--p-fg-muted); }
</style>

<!--
- IaC in the middle is what we used today, policy pack included. Around it: Neo, the agent that investigates and changes infrastructure with your Pulumi Cloud permissions. ESC, which we just covered. Insights, discovery and governance across every account, including the ones nobody wrote code for. IDP, self-service with templates and guardrails.
- Then the ring: together these are the Pulumi platform, one account, one set of permissions. The platform is bigger than what fits in an hour.
-->

---
routeAlias: stage-wrap
---

# Where we will be next

<div class="zoom-content">

<div class="ev">
  <div class="gpu-card gpu-card--primary ev__card" v-click="1">
    <div class="ev__when">Nov 9 to 12 · Salt Lake City</div>
    <div class="ev__name">KubeCon + CloudNativeCon NA</div>
    <p>The Pulumi booth, Platform Engineering Day on the 9th, and Adam's talk: I Built an AI Running Coach, a personal kagent agent in production.</p>
  </div>
  <div class="gpu-card ev__card" v-click="2">
    <div class="ev__when">Nov 18 · online</div>
    <div class="ev__name">Next workshop</div>
    <p>Beyond the Cluster: orchestrating Kubernetes and everything around it with Pulumi.</p>
  </div>
  <div class="gpu-card gpu-card--primary ev__card" v-click="3">
    <div class="ev__when">Nov 30 to Dec 4 · Las Vegas</div>
    <div class="ev__name">AWS re:Invent</div>
    <p>Booth 1432. Bring your Bedrock bill.</p>
  </div>
  <div class="gpu-card ev__card" v-click="4">
    <div class="ev__when">Nov 30 and Dec 1 · Berlin</div>
    <div class="ev__name">Enterprise DevOps Summit</div>
    <p>Pulumi on stage and on the floor.</p>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.ev { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.2rem; }
.ev__card { display: flex; flex-direction: column; gap: 0.4rem; padding: 1.2rem 1.4rem; }
.ev__when { font-family: var(--slidev-font-mono); font-size: 0.9rem; color: var(--p-fg-muted); }
.ev__name { font-size: 1.35rem; font-weight: 700; color: var(--p-primary); }
.ev__card p { margin: 0 !important; font-size: 1.05rem; line-height: 1.4; }
</style>

<!--
- Where to find us in person over the next month. KubeCon in Salt Lake City next week: the booth, Platform Engineering Day on the Monday, and Adam's talk on the running coach agent.
- The next workshop in this series is the eighteenth, after KubeCon: Kubernetes and everything around it, with Pulumi.
- Then re:Invent at the end of the month, booth 1432, and the Enterprise DevOps Summit in Berlin the same week.
- pulumi.com/events has all of them with registration links.
-->

---

# Continue your Pulumi journey!

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-6">
  <div class="gpu-card gpu-card--primary journey-card" v-click>
    <carbon-logo-slack class="journey-card__icon" />
    <div class="journey-card__title">Join the Pulumi Community Slack!</div>
    <p class="journey-card__body">
      <a class="text-[var(--p-primary)]" href="https://slack.pulumi.com/">slack.pulumi.com</a>
    </p>
  </div>
  <div class="gpu-card gpu-card--primary journey-card" v-click>
    <ph-cloud class="journey-card__icon" />
    <div class="journey-card__title">Sign up for a Pulumi Cloud account!</div>
    <p class="journey-card__body">
      Everything in the repo runs on the free edition
    </p>
  </div>
  <div class="gpu-card gpu-card--accent journey-card" v-click>
    <ph-calendar-check class="journey-card__icon" />
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
.journey-card__icon { font-size: 2.6rem; color: var(--p-primary); margin-bottom: 0.9rem; }
.journey-card__title { font-size: 1.5rem; font-weight: 600; line-height: 1.25; margin-bottom: 0.9rem; color: var(--p-fg); }
.journey-card__body { font-size: 1.15rem; line-height: 1.55; margin: 0 !important; color: var(--p-fg); }
</style>

<!--
- Name the next step: clone the repo, run it in your own account, and bring questions to Slack.
- The free edition includes basic ESC, 25 secrets, and the policy pack runs locally with the policy-pack flag. Today the organization enforced it with no flag; that organization-wide enforcement is a paid feature.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-16">
  <div class="thanks__kicker">Thank you</div>
  <h1 class="!text-[4.5rem] !leading-[1.02] !font-semibold !tracking-tight !mt-3 !mb-12 text-center">Questions?</h1>
  <div class="thanks">
    <div class="thanks__person">
      <img class="thanks__avatar" src="/img/adam-gordon-bell.png" alt="Adam Gordon Bell" />
      <div class="thanks__name">Adam Gordon Bell</div>
      <div class="thanks__org">Community Engineer, Pulumi</div>
      <div class="thanks__handles">
        <span><carbon-logo-x />@adamgordonbell</span>
        <span><carbon-logo-github />adamgordonbell</span>
      </div>
      <div class="thanks__qr"><QRCode data="https://www.linkedin.com/in/adamgordonbell/" dark="#000000" /></div>
      <div class="thanks__qr-label"><carbon-logo-linkedin />adamgordonbell</div>
    </div>
    <div class="thanks__person">
      <img class="thanks__avatar" src="/img/engin-diri.jpg" alt="Engin Diri" />
      <div class="thanks__name">Engin Diri</div>
      <div class="thanks__org">Senior Solutions Architect, Pulumi</div>
      <div class="thanks__handles">
        <span><carbon-logo-x />@_ediri</span>
        <span><carbon-logo-github />dirien</span>
      </div>
      <div class="thanks__qr"><QRCode data="https://www.linkedin.com/in/engin-diri/" dark="#000000" /></div>
      <div class="thanks__qr-label"><carbon-logo-linkedin />engin-diri</div>
    </div>
    <div class="thanks__person">
      <div class="thanks__avatar thanks__avatar--icon"><carbon-logo-github /></div>
      <div class="thanks__name">Workshop repo</div>
      <div class="thanks__org">slides · demo</div>
      <div class="thanks__handles">
        <span>pulumi/workshops</span>
      </div>
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/bedrock-per-team-token-metering" dark="#000000" /></div>
      <div class="thanks__qr-label">bedrock-per-team-token-metering</div>
    </div>
  </div>
</div>

<style scoped>
.thanks__kicker { font-family: var(--slidev-font-mono); font-size: 1.15rem; font-weight: 700; letter-spacing: 0.6em; text-transform: uppercase; color: var(--p-fg-muted); }
.thanks { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5rem; justify-items: center; }
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
- Questions. Engin reads the queue from the Q&A tab; Adam answers from the terminal where it helps.
-->
