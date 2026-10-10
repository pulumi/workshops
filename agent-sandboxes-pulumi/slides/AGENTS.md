# AGENTS.md — the deck's brief and sources

This file records what the deck was asked to be and which sources it was built from, so anyone (human or agent) editing `slides.md` works from the same brief. Conventions for the whole workshop folder are in `../AGENTS.md`.

## Story

1. **The moment.** Two conference scenes, both read on 2026-10-10. AI Engineer World's Fair 2026 (San Francisco, June 29 to July 2, 2026) lists at least ten sessions with "sandbox" in the title (ten counted by a title match), for example "Sandboxes Aren't Optional: Runtime Isolation Patterns for Coding Agents at Scale" and "Your agent needs a sandbox, not a desert". KubeCon + CloudNativeCon North America 2026 opens Tuesday, November 10 with the keynote "Sandbox Your Agents" (Jessica Forrester, 9:55 AM to 10:00 AM). Its abstract says: "A problematic agent with too much access, either through choice or a lack of knowledge, can take down entire production stacks and wipe databases." Sources: https://ai.engineer/worldsfair/2026/sessions.json and https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/?id=1301749. There is no single named incident in the brief; the scene is the conference programme itself, and the slide says so.
2. **The tension.** "An agent with your long-lived key is an incident waiting for a prompt." / "A shared, wide-open sandbox is the same incident, slower." (brief §5).
3. **Why it is hard.** A shared sandbox looks safe and is not: every task sees every other task's data, the credential outlives the task, and nobody owns cleanup. The contrast slide sets one shared sandbox against one environment per task.
4. **The questions.** Five, in the order the deck answers them: (1) What does an agent need to work, and nothing more? (2) How do credentials expire without anyone remembering to rotate them? (3) How do you prove a sandbox follows the rules before it exists? (4) Where does the audit trail live? (5) How do you stop sandboxes piling up?
5. **The answers.** (1) One Pulumi stack per task through the Automation API, plus an IAM role under a permissions boundary. (2) Pulumi ESC `aws-login` through OIDC, one-hour credentials. (3) A Pulumi Policies pack that runs at preview. (4) Pulumi Cloud: one stack, one update history, one set of tags per sandbox. (5) Expiry tags and a reaper; TTL stacks are the managed option and need the Pro or Enterprise edition.
6. **The proof.** The demo builds all of it and ends on question 5: the reaper deletes the expired sandbox and leaves the other three. Along the way it shows a denied cross-sandbox read (question 1) and a bad sandbox failing at preview (question 3).

## The workshop

"Disposable Cloud Sandboxes for AI Agents: One Pulumi Stack per Task". 90 minutes. Sessions, dates and speakers: not decided yet, so the deck has one placeholder speaker slide. Pulumi owns the deck and the demo.

## The original request

The deck was built from these inputs, in this order of authority:

1. The workshop brief, "Workshop brief: Disposable cloud sandboxes for AI agents, one Pulumi stack per agent task with short-lived credentials and automatic teardown" (workspace document). Its §1 sets the length, §2 and §5 the story, §4 the demo steps, §9 the checklist.
2. The demo in this folder (`../README.md` and folders `01-setup` to `09-teardown`), which is the source of every command on a slide.
3. The reference deck, `../../neo-in-a-docker-sandbox/slides/slides.md`, for the story moves and the slide patterns.
4. The workshop-deck skill and `deck_frame.py` (frame, patterns, check).

## Structure and time budget

Total 90 minutes over 40 slides. Every slide's speaker notes carry its budget.

- Opening frame: 5 slides, 3.75 min
- Act 1, the pain: 6 slides, 11.25 min
- Act 2, the tech: 12 slides, 16.25 min
- The solution we will build: 3 slides, 6 min
- Demo divider: 1 slide, 0.25 min
- Act 3, the demo: 10 slides, 46.5 min (a quarter of the deck)
- Closing frame: 3 slides, 6 min (Resources 1, Continue your journey 0.5, Thank you / Questions 4.5)

## Sources

Read on 2026-10-10 unless noted.

- AI Engineer World's Fair 2026 sessions list: https://ai.engineer/worldsfair/2026/sessions.json
- KubeCon + CloudNativeCon NA 2026, "Sandbox Your Agents": https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/?id=1301749
- Pulumi Automation API guide: https://www.pulumi.com/docs/iac/guides/building-extending/automation-api/
- Pulumi ESC, configuring OIDC for AWS: https://www.pulumi.com/docs/esc/environments/configuring-oidc/aws/
- Pulumi Policies, policy as code: https://www.pulumi.com/docs/discovery-governance/concepts/policy-as-code/
- TTL stacks: https://www.pulumi.com/docs/deployments/concepts/ttl/
- Everything else in the brief §4 and §8 (registry pages, PyPI and npm versions), read by the brief's author and the demo build on 2026-10-10.
- Slide-level claims are logged under "Fact-check" at the end of this file.

## Deviations from the brief

- Brief §5 outlines about 30 slides; §9 allows 25 to 40 and the workshop-deck skill caps Act 3 at a quarter of the deck. One slide per demo folder plus an overview makes ten Act 3 slides, so the deck has 40.
- The brief lists the questions with "stop sandboxes piling up" third and "audit trail" fifth. The deck puts piling up last so the demo (the reaper) answers the final question. The same five questions, a different order.
- The brief's "hallway question" is not a quote. It appears as our own framing, not attributed to anyone.
- The TTL stacks versus reaper slide sits in "The solution we will build", not in Act 2, because it is the reason for the design and it keeps question 5 open for the demo.
- The brief's outline has no code; the deck has one slide with the shape of the orchestrator (four lines), as the workshop-deck skill allows.
- Brief §6 prerequisites go into the Housekeeping slide notes and the demo overview notes, not a slide of their own.
- Speakers, session dates and event page are unknown, so the deck has one placeholder speaker slide and the repo QR code only.
- Brief §7 risks go into the speaker notes of the slides where they bite: ESC and setup (steps 1 and 2 run beforehand, with a recorded fallback), the retry on STS assume (step 6), three tasks only (step 5), TTL needs Pro (solution section).

## Rules that bind

- Pulumi names: Pulumi Neo, Pulumi ESC, Pulumi Cloud, Pulumi IaC, Pulumi Policies, Pulumi console in lowercase. No Docker and no Neo content: that workshop is `neo-in-a-docker-sandbox`.
- Every command on a slide is one the demo runs, with the same flags (see "Headlines" and `../README.md`).
- Code budget: program code on one slide, four lines; commands on demo slides at most three lines each; twenty lines of code and commands in the whole deck at most.
- The frame (opening, demo divider, closing) comes from `deck_frame.py` and `frame.json`. Change `frame.json` and run `init --frame-only`; never edit those slides by hand.
- Story and demo slides are copies of the reference patterns. No theme layout except `image`, no Mermaid.
- Speaker notes are spoken, carry a time budget, and have been through the humanizer.
- Credentials, `node_modules/`, `dist/`, `export-pages/`, PDFs and state never enter a commit.
- If the demo code is wrong, the slides stay true to the code and the PR says so; the demo is not changed from this folder's deck work.

## Marketing-web skill

The `slidev-deck` skill lives in the private repository `pulumi/marketing-web`. On 2026-10-10 `gh` on the build machine was not logged in, so it could not be read and no commit sha is recorded. The theme package `@pulumi/slidev-theme` 0.4.0 was used instead (`node_modules/@pulumi/slidev-theme/README.md`, `starter.md`, `layouts/*.vue`), as the skill's own fallback says.

## Headlines

Every slide, in order, with its pattern and time budget. Read alone, the headlines tell the story.

### Opening frame (generated)

1. Title: Disposable Cloud Sandboxes for AI Agents — pattern: frame — 0.5 min
2. Speaker (placeholder) — pattern: frame — 1 min
3. Housekeeping and Agenda (divider) — pattern: frame — 0.25 min
4. Housekeeping — pattern: frame — 1 min
5. Today's Agenda — pattern: frame — 1 min

### Act 1: the pain

6. At least ten conference sessions this summer had 'sandbox' in the title — pattern: quote-card — 2.75 min
7. An agent with your long-lived key is an incident waiting for a prompt. — pattern: big-statement — 0.5 min
8. A shared, wide-open sandbox is the same incident, slower. — pattern: big-statement — 0.5 min
9. Disposable means one environment per task, scoped and deleted on schedule — pattern: compare — 2.5 min
10. Every sandbox has three ways to be too open — pattern: boundaries — 2 min
11. Five questions decide whether you can trust a sandbox — pattern: card-grid — 3 min

### Act 2: the tech

12. Q1. What does an agent need to work, and nothing more? — pattern: section-opener — 0.25 min
13. One stack per task makes a sandbox something you can create and delete — pattern: flow — 2 min
14. A permissions boundary caps what the task's role can ever do — pattern: chain — 2.5 min
15. Q2. How do credentials expire without anyone remembering to rotate them? — pattern: section-opener — 0.25 min
16. ESC trades an OIDC token for one-hour AWS credentials — pattern: flow — 2.5 min
17. Two questions covered, three to go — pattern: recap-grid — 0.75 min
18. Q3. How do you prove a sandbox follows the rules before it exists? — pattern: section-opener — 0.25 min
19. Policies run at preview, before any resource exists — pattern: zones — 2.5 min
20. Q4. Where does the audit trail live? — pattern: section-opener — 0.25 min
21. Pulumi Cloud keeps one record per sandbox — pattern: stack — 2 min
22. Four questions answered, one to go — pattern: recap-grid — 1 min
23. Where this breaks today: the sandbox is S3 and IAM, nothing more — pattern: compare — 2 min

### The solution we will build

24. TTL stacks need Pro, so we build our own reaper — pattern: options — 2 min
25. One orchestrator, three stacks, one reaper — pattern: zones — 2 min
26. The orchestrator is a handful of Automation API calls — pattern: terminal — 2 min

### Demo divider (generated)

27. Demo: Agent Sandboxes — pattern: frame — 0.25 min

### Act 3: the demo

28. Nine steps take us from an empty account to a reaped sandbox — pattern: demo-overview — 1.5 min
29. Step 1 (01-setup): One base role is the only thing we create by hand — pattern: demo-checks — 4 min
30. Step 2 (02-esc): The ESC environment hands out one-hour credentials — pattern: demo-step — 4 min
31. Step 3 (03-boundary): The boundary is a ceiling the agent's role cannot exceed — pattern: demo-step — 4 min
32. Step 4 (04-sandbox): One task previews as five resources — pattern: demo-step — 5 min
33. Step 5 (05-orchestrator): Three tasks spawn at once, each with its own stack — pattern: demo-outcome — 7 min
34. Step 6 (06-agent): An agent writes to its bucket and is denied its neighbour's — pattern: demo-checks — 5 min
35. Step 7 (07-policy): A sandbox without a boundary fails at preview — pattern: demo-step — 5 min
36. Step 8 (08-reaper): The reaper deletes the expired sandbox and keeps the other three — pattern: demo-outcome — 7 min
37. Step 9 (09-teardown): Teardown leaves nothing behind — pattern: demo-step — 4 min

### Closing frame (generated)

38. Resources — pattern: frame — 1 min
39. Continue your Pulumi journey! — pattern: frame — 0.5 min
40. Thank you / Questions? — pattern: frame — 4.5 min

### Demo commands (copied from `../README.md`)

1. `01-setup/setup.sh`
2. `02-esc/create-env.sh`
3. `03-boundary/apply.sh`
4. `cd 04-sandbox && pulumi stack init demo`, `pulumi config set taskId a && pulumi config set boundaryArn "$(cat ../.state/boundary-arn)"`, `pulumi preview`
5. `python 05-orchestrator/orchestrator.py spawn task-a task-b task-c --ttl-minutes 30`
6. `python 06-agent/agent.py task-a task-b`
7. `python 05-orchestrator/orchestrator.py spawn bad-task --noncompliant --policy-pack 07-policy`
8. `python 05-orchestrator/orchestrator.py spawn short --ttl-minutes 2`, then `python 08-reaper/reaper.py`
9. `09-teardown/teardown.sh`, then `09-teardown/leftovers.sh`

### Questions return at the close

Slide 22 ("Four questions answered, one to go") and the step 8 slide (question 5 answered). The closing notes name all five.

## Fact-check

Filled in after the humanizer pass: claim, link, date read, outcome.
