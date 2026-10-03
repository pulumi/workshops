# Deck notes: AI Agents for IT Ops, Custom Agent on AKS with Azure OpenAI

Conventions for anyone (human or agent) editing `slides/`. The deck is Slidev with `@pulumi/slidev-theme` 0.4.0, built on the 1920-pixel canvas. The opening frame, demo divider and closing frame come from `frame.json` through `deck_frame.py`; never edit them by hand.

## Workshop

- Title: AI Agents for IT Ops: Custom Agent on AKS with Azure OpenAI
- Length: 90 minutes. Level: intermediate (basic Kubernetes and Azure knowledge, no Pulumi experience needed).
- Audience: platform and cloud infrastructure engineers on Azure who want to run their own agent workload instead of a managed agent service.
- Promise: provision an AKS cluster and an Azure OpenAI deployment from one Pulumi program, deploy a small containerized agent that calls the model, and tear it all down without leaving a bill running.
- Speakers: placeholder slide in `frame.json`; replace it with real speaker data when it exists.

## Story

1. **The moment.** Microsoft's Digital Crimes Unit, 27 February 2025: members of the group it tracks as Storm-2139 "exploited exposed customer credentials scraped from public sources to unlawfully access accounts with certain generative AI services", including Azure OpenAI Service. The credential was the way in. Source: https://blogs.microsoft.com/on-the-issues/2025/02/27/disrupting-cybercrime-abusing-gen-ai/ (read in full on build day).
2. **The tension.** "An agent needs a credential to do anything." / "A credential you can copy works for whoever copies it."
3. **Why it is hard.** A static key and a federated token look the same in the code that uses them. They differ in what happens when someone else gets hold of them: the key works from anywhere until you rotate it; the token is issued to one pod's service account and expires. Running your own agent means you pick, and a managed service no longer picks for you.
4. **The questions.** (1) Who is the agent acting as? (2) What may it do? (3) Where does it run? (4) How does it reach the model without a key? (5) How do we build and change all of it repeatably? (6) How do we know it works, and that it leaves nothing running when we are done?
5. **The answers**, in order. (1) A user-assigned managed identity, with AKS workload identity mapping the pod's Kubernetes service account to it. (2) One role assignment, Cognitive Services OpenAI User, on the one Azure OpenAI account. (3) An AKS cluster you own, in one namespace. (4) OIDC federation: the cluster's OIDC issuer, a federated credential, `DefaultAzureCredential` in the agent, and Pulumi ESC `azure-login` for Pulumi's own Azure access. (5) One Pulumi program with two providers (azure-native and kubernetes), built as six cumulative folders. (6) The demo.
6. **The proof.** The demo runs from an empty resource group to a real model completion returned to `curl`, grep shows no `accessKey` or `apiKey` anywhere in the program, then `teardown.sh` destroys the stack, checks the resource group and purges the soft-deleted account. It answers question 6 last.

## Inputs, by authority

1. The brief for this workshop (sections 1 to 9). It is the contract.
2. The demo code in the numbered folders of this workshop and the folder `README.md`. Slides match it step for step: same folders, same commands, same flags.
3. The reference deck, `pulumi/workshops` `neo-in-a-docker-sandbox/slides`, for patterns and tone.
4. Product docs read during the build (see Sources).

## Structure and time budget (90 minutes, 41 slides)

| Group | Slides | Minutes |
| --- | --- | --- |
| Opening frame: title, speaker, "Housekeeping and Agenda", Housekeeping, Today's Agenda | 5 | 4.0 |
| Act 1, the pain | 6 | 10.0 |
| Act 2, the tech (5 section openers, 7 claims, 3 recaps, limits) | 16 | 28.0 |
| The solution we will build | 2 | 5.0 |
| Demo divider + Act 3 (overview + 6 steps) | 1 + 7 | 33.0 |
| Closing frame: Resources, Continue your journey, Thank you / Questions | 3 | 10.0 |
| Total | 40 | 90.0 |

(The 40 counts the speaker slide inside the opening frame; with a second speaker the frame grows by one slide and its minutes are taken from Q&A.)

Every slide, frame slides included, carries a speaker note that starts with its time budget, for example `[2.5 min]`. The budgets sum to 90.0.

## Sources (docs read for this build, 2026-10-03 unless noted)

- Microsoft On the Issues, "Disrupting a global cybercrime network abusing generative AI", 27 Feb 2025 (the moment).
- https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/azure-login/
- https://www.pulumi.com/registry/packages/azure-native/api-docs/containerservice/managedcluster/
- https://www.pulumi.com/registry/packages/azure-native/api-docs/cognitiveservices/deployment/
- https://learn.microsoft.com/en-us/azure/aks/workload-identity-overview
- https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/managed-identity
- Brief section 8 (read 2026-09-22 by the brief author): Pulumi CLI 3.263.0, pulumi-azure-native v3.28.0, AKS and Azure OpenAI pricing pages (cost slide uses the brief's directional range, roughly $150 to $300 for a month if left running, a few dollars with immediate teardown).
- slidev-deck skill, `pulumi/marketing-web` `.agents/skills/slidev-deck/SKILL.md`, commit 9b37f9afe8c7b0d406f19bc9116b16d5689389ce.

## Deviations from the brief (section 5 outline)

- The brief's 14-slide outline is replaced by the workshop-deck structure above (frame, three acts). All its topics appear: why a custom agent (Act 1), architecture and program shape (solution), steps 2 to 6 (Act 3), credentials (Act 2), cost (Act 3 and step 6), production changes ("Where this breaks today"), recap (final recap), Q&A.
- The brief numbers the demo steps 1 to 5 plus teardown; the demo folders are `01` to `06`. The deck follows the folders.
- The demo pins the model to gpt-4o 2024-11-20, as the demo code states; the brief only says "GPT-4o-class".
- The deck shows `--stack dev` where the demo does.

## Headlines

Every content slide as a claim, with its pattern and time. Frame slides are generated.

### Act 1: the pain (6 slides, 10 min)

1. A key scraped from public sources was all it took — pattern: quote-card — 2.0
2. An agent needs a credential to do anything — pattern: big-statement — 0.5
3. A credential you can copy works for whoever copies it — pattern: big-statement — 0.5
4. A key works from anywhere; a federated token works for one pod — pattern: compare — 2.5
5. Run your own agent and you answer the questions a managed service answered for you — pattern: big-statement — 1.0
6. Six questions decide whether you can trust it — pattern: card-grid — 3.5

### Act 2: the tech (16 slides, 28 min)

7. Who is the agent acting as? — pattern: section-opener — 0.5
8. The agent gets its own identity, not a person's login — pattern: flow — 2.5
9. What may it do? — pattern: section-opener — 0.5
10. One role on one account is the whole permission set — pattern: boundaries — 2.5
11. Two questions covered, four to go — pattern: recap-grid — 1.5
12. Where does it run? — pattern: section-opener — 0.5
13. The cluster is yours, and so is the blast radius — pattern: zones — 2.5
14. One namespace holds the agent and nothing else — pattern: stack — 2.5
15. How does it reach the model without a key? — pattern: section-opener — 0.5
16. The pod's token is exchanged for a model token, and no key exists — pattern: chain — 2.5
17. Pulumi ESC gives Pulumi the same keyless access to Azure — pattern: flow — 2.5
18. Four questions covered, two to go — pattern: recap-grid — 1.5
19. How do we build and change it repeatably? — pattern: section-opener — 0.5
20. One Pulumi program describes the cluster, the model and the pod — pattern: options — 2.5
21. Where this breaks today — pattern: compare — 3.0
22. Five questions answered, one to go — pattern: recap-grid — 2.0

Question 6 is opened by the demo divider and Act 3, not by an Act 2 section opener.

### The solution we will build (2 slides, 5 min)

23. The agent, the model and the identity between them sit in one resource group — pattern: flow — 3.0
24. Under ten lines of Python declare the pod's access to the model — pattern: big-code (one slide, 10 lines at most; program shape only, no imports) — 2.0

### Demo (divider generated, 7 slides, 33 min including the divider)

25. What we are going to do — pattern: demo-overview — 2.5
26. Step 1: the project starts as one resource group — pattern: demo-step — 2.0 (folder `01-empty-program`)
27. Step 2: the cluster comes up from the same program — pattern: demo-step — 7.0 (folder `02-aks-cluster`, 5 to 10 minutes of waiting)
28. Step 3: the model deployment lands beside it — pattern: demo-step — 4.0 (folder `03-azure-openai`)
29. Step 4: the identity has one role and no key — pattern: demo-checks — 5.0 (folder `04-workload-identity`)
30. Step 5: the agent answers with a real model completion — pattern: demo-outcome — 5.0 (folder `05-agent-deployment`)
31. Step 6: destroy, verify and purge leave nothing billable — pattern: demo-checks — 7.0 (folder `06-teardown`)

The divider adds 0.5 min, so the demo group is 0.5 + 32.5 = 33.0.

Slide numbers above are planned positions inside the story and demo parts, not final page numbers.

### Code budget

Program code: slide 24 only, ten lines at most. Commands: one per demo slide, copied from the demo folder (`pulumi up --stack dev` in steps 2 to 5; `curl` call in step 5; `06-teardown/teardown.sh` in step 6). Whole deck: twenty lines of code and commands at most.
