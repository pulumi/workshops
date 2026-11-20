# AGENTS.md: the deck's brief and sources

This file records what the deck was asked to be and which sources it was built from, so anyone (human or agent) editing `slides.md` works from the same brief. Conventions for the whole workshop folder are in `../AGENTS.md`.

## Story

1. The moment. Datadog, 2023-03-08. Its change process rolls out "region-by-region, cluster-by-cluster, node-by-node", yet a legacy security update channel in the base OS image applied a systemd update in a one-hour window, and it "affected multiple regions at the exact same time". Source: Datadog's own post-mortem, https://www.datadoghq.com/blog/2023-03-08-multiregion-infrastructure-connectivity-issue/ (read 2026-11-20).
2. The tension. "Your change process rolls out one cluster at a time." / "Your clusters can still change all at once."
3. Why it is hard. By hand, every cluster is a little different from the last one, and the order of change lives in people's heads. As code, every cluster starts from one definition and the order is written down.
4. The questions. (1) When is one cluster not enough? (2) What is the smallest unit you can repeat? (3) How do clusters get credentials and config without copied secrets? (4) What stops a bad cluster from shipping? (5) How do you roll out a change in a safe order? (6) How do you remove it all?
5. The answers. (1) A boundary for a customer, a region or an environment. (2) One Pulumi IaC component, one stack per cluster. (3) Pulumi ESC environments with an Azure OIDC login. (4) A mandatory Pulumi Policies pack on `preview`. (5) The Pulumi Automation API runs the stacks in waves; Azure Kubernetes Fleet Manager upgrades in stages with an update run. (6) Teardown in reverse order, shown in the demo.
6. The proof. The demo builds three AKS clusters and upgrades them from 1.35 to 1.36. It answers question 6 last: it destroys the stacks, the fleet, the ESC environments and the app registration, in that order. The last recap before the demo says "five answered, one to go"; the closing returns to all six.

The demo was not run live when this deck was written (no Azure subscription or Pulumi Cloud organization was available to the build). Slides make no claim about live results. Speaker notes say what the presenter should see, taken from the demo README.

## The workshop

"Run a Kubernetes cluster fleet as code: one component, one stack per cluster, staged upgrades with Pulumi". 90 minutes, platform and DevOps engineers who already run Pulumi or Terraform, intermediate level. Speakers and dates are not announced; the deck carries one placeholder speaker slide. The demo is in `../README.md` (nine steps on six numbered folders).

## The original request

The deck was drafted from these inputs, in this order of authority:

1. The workshop brief for this folder (status draft; its section 3 learning outcomes and section 5 story outline). The brief's story questions are the deck's spine.
2. The demo in `../README.md`, which is the source for every command and every end state on the demo slides.
3. The reference deck, the style source of truth for slide patterns: `neo-in-a-docker-sandbox/slides` in https://github.com/pulumi/workshops
4. The workshop-deck, slidev-deck and slidev skills. slidev-deck was read from `pulumi/marketing-web`, `.agents/skills/slidev-deck/SKILL.md`, at commit `9b37f9afe8c7b0d406f19bc9116b16d5689389ce` (2026-11-20). Theme `@pulumi/slidev-theme` 0.4.0, Slidev 0.50.0.

Structure asked for: about 30 minutes of slides, 50 minutes of demo and 10 minutes of questions (90 in total); three acts; steps 1 to 9 of the demo shown only in act 3; no program code on slides.

## Structure and minute budget

44 slides: 9 frame slides, 6 in Act 1, 17 in Act 2, 2 for the solution, 10 in Act 3. Act 3 with its divider is 11 of 44 slides, a quarter. Code budget: no program code; 9 demo commands (plus one `pulumi env open` line on step 2), one to two lines each.

| Part | Slides | Minutes |
| --- | --- | --- |
| Opening frame (slides 1-5) | 5 | 3.5 |
| Act 1: the pain (6-11) | 6 | 7.5 |
| Act 2: the tech (12-28) | 17 | 19 |
| The solution we will build (29-30) | 2 | 3.5 |
| Demo divider and Act 3: the demo (31-41) | 11 | 45 |
| Closing frame, including 10 minutes of questions (42-44) | 3 | 11.5 |
| Total | 44 | 90 |

Speaker notes carry the budget of each slide; the budgets sum to 90.0.

## Sources

Facts on slides and in notes come from these pages, all read on 2026-11-20. A claim without a row here does not belong on a slide.

| Claim | Source |
| --- | --- |
| Datadog outage began 2023-03-08 06:03 UTC and affected the US1, EU1, US3, US4 and US5 regions across all services | https://www.datadoghq.com/blog/2023-03-08-multiregion-infrastructure-connectivity-issue/ |
| "a security update to systemd was automatically applied to a number of VMs"; "This affected tens of thousands of nodes in our fleet between 06:00 and 07:00" | same page |
| "we do so region-by-region, cluster-by-cluster, node-by-node"; the base OS image "had a legacy security update channel enabled"; "Thus it affected multiple regions at the exact same time" | same page |
| All services operational in all regions on 2023-03-09 08:58 UTC | same page |
| A component is "a logical grouping of Pulumi resources that is exposed as a single Pulumi resource" | https://www.pulumi.com/docs/iac/concepts/components/ |
| A stack is "an isolated, independently configurable instance of a Pulumi program" | https://www.pulumi.com/docs/iac/concepts/stacks/ |
| ESC `azure-login` with `oidc: true` returns credentials consumed through the `ARM_*` variables by azure-native | https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/azure-login/ |
| A stack lists ESC environments in an `environment` block; `pulumiConfig` values reach the program as config; ESC requires the Pulumi Cloud backend | https://www.pulumi.com/docs/esc/integrations/infrastructure/pulumi-iac/ |
| An environment can import other environments with `imports`; the current values win over imported ones | https://www.pulumi.com/docs/esc/environments/imports/ |
| Enforcement levels advisory, mandatory, remediate, disabled; a mandatory policy blocks an update from proceeding; enforcement runs during `preview` and `update` | https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/ |
| The Automation API drives the Pulumi engine from a program; it needs the Pulumi CLI at runtime | https://www.pulumi.com/docs/iac/concepts/automation-api/ |
| `LocalWorkspace` is marked `Alpha` in the Node.js reference (v3.277.0) | https://www.pulumi.com/docs/reference/pkg/nodejs/pulumi/pulumi/classes/automation.LocalWorkspace.html |
| Update runs consist of stages, groups and strategies; stages apply sequentially; groups in a stage update in parallel; wait times and gates are available | https://learn.microsoft.com/en-us/azure/kubernetes-fleet/concepts-update-orchestration |
| A fleet without a hub cluster supports Kubernetes and node image updates, and has no workload placement; it costs nothing | https://learn.microsoft.com/en-us/azure/kubernetes-fleet/concepts-choosing-fleet |
| Fleet Manager overview: safe multi-cluster updates through update runs with reusable strategies | https://learn.microsoft.com/en-us/azure/kubernetes-fleet/overview |
| `agentPoolProfiles` cannot be updated directly through the Azure API | https://www.pulumi.com/registry/packages/azure-native/api-docs/containerservice/managedcluster/ |
| AKS 1.35 is supported until Mar 2027, 1.36 until Jun 2027, 1.37 is GA | https://learn.microsoft.com/en-us/azure/aks/supported-kubernetes-versions |
| Every demo command and end state | `../README.md` |

Cost: the README's $1.49 total (three clusters, three hours, retail prices from the Azure retail price API read 2026-11-20) was not confirmed in the Azure Pricing Calculator. If a slide or note states it, it says so.

Not read this run, so not used on slides: the two conference session pages in the brief (KubeCon North America, KubeCon Japan). The deck makes no claim about what those sessions said.

Pulumi terminology (brand guidelines): Pulumi Neo, Pulumi ESC, Pulumi Cloud, Pulumi IaC, Pulumi console, Pulumi Policies; never Copilot, Pulumi Service, Insights, CrossGuard as a product name.

## Deviations from the brief

Logged so the reviewer can see every place the deck differs from the brief's section 5.

- The brief's nine demo steps run on six numbered folders. Steps 5, 6, 8 and 9 are one driver (`05-fleet-cluster`, `node bin/rollout.js wave 1 | wave 2 | reconcile | destroy`). Step 9 also uses `06-update-run`, `03-fleet-core`, `02-esc/delete.sh` and `01-subscription/cleanup.sh`. Slides follow the README.
- Step 1's end-state proof (`pulumi env open $PULUMI_ORG/fleet/azure-base`) comes after step 2 creates the base environment, as the README says. The step 1 slide shows `01-subscription/prepare.sh` and says so in the notes.
- Demo slides show the one command that matters; the setup lines the README puts before it (`npm ci`, `pulumi stack init`) are in the notes.
- The brief says "no code on slides". Honoured: there is no program code, only the demo commands.
- Act sizes follow the workshop-deck skill (Act 1 of 6, Act 2 of 17, 2 solution slides, Act 3 of 10), not the brief's 8, 14 and 8. The brief's total of 25 to 35 slides becomes 35 story, solution and demo slides plus the 9 frame slides.
- Minutes: slides take about 33.5 minutes and the demo about 45 (the brief says 30 and 50). Questions keep 10 minutes.
- The brief's Open questions 1 to 4 are unanswered because the build had no Azure subscription. Notes on step 7 carry the fallbacks (recorded backup, `06-update-run/fallback-az.sh`, `LOCATION=swedencentral 02-esc/create.sh`).
- The moment is not in the brief, which only has conference sessions. It was found this run (Datadog) and is cited above.

## Rules that still bind

- Facts come from the sources above, not memory. Unclear docs become an open question, not a guess.
- Every command on a slide is one the demo runs, with the same flags.
- Say plainly that the Automation API is Alpha in the Node.js reference.
- No slide claims a live result. Nothing about prices or quotas is stated as confirmed.
- One idea per slide. Headlines are claims. Every story and demo slide is built from a pattern in `deck_frame.py patterns`; no theme layout except `image`, no Mermaid. The frame slides come from `frame.json` through `deck_frame.py init --frame-only`, never by hand.
- Slidev needs a blank line after every `---` separator.
- Every slide carries speaker notes with its minutes; the minutes sum to 90.0.

## Headlines

One line per slide, in order. Read alone they tell the story.

1. Run a Kubernetes cluster fleet as code: one component, one stack per cluster, staged upgrades with Pulumi — pattern: frame: title — 0.5 min
2. Speaker (placeholder, speakers not announced) — pattern: frame: speaker — 0.5 min
3. Housekeeping and Agenda — pattern: frame: housekeeping-and-agenda — 0.5 min
4. Housekeeping — pattern: frame: housekeeping — 1 min
5. Today's Agenda — pattern: frame: agenda — 1 min
6. A routine security update took five Datadog regions offline in the same hour. — pattern: quote-card — 2 min
7. Datadog's own post-mortem: "it affected multiple regions at the exact same time". — pattern: big-quote — 1 min
8. Your change process rolls out one cluster at a time. — pattern: big-statement — 0.5 min
9. Your clusters can still change all at once. — pattern: big-statement — 0.5 min
10. By hand, every cluster ends up a little different from the last one; as code, every cluster starts from one definition. — pattern: compare — 1.5 min
11. Six questions decide whether a cluster fleet is safe to run. — pattern: card-grid — 2 min
12. When is one cluster not enough? — pattern: section-opener — 0.5 min
13. A new cluster earns its place when a customer, a region or an environment needs its own boundary. — pattern: options — 1.5 min
14. What is the smallest unit you can repeat? — pattern: section-opener — 0.5 min
15. One component describes a cluster and its baseline as a single resource. — pattern: stack — 1.5 min
16. Each cluster is its own stack, with its own state and its own configuration. — pattern: zones — 1.5 min
17. Two questions answered, four to go. — pattern: recap-grid — 1 min
18. How do clusters get credentials and config without copied secrets? — pattern: section-opener — 0.5 min
19. The stack asks Pulumi ESC for short-lived Azure credentials over OIDC, so no secret is copied. — pattern: chain — 1.5 min
20. One shared environment holds the login, and each cluster's environment imports it. — pattern: flow — 1.5 min
21. What stops a bad cluster from shipping? — pattern: section-opener — 0.5 min
22. A mandatory policy pack fails the preview before the cluster exists. — pattern: boundaries — 1.5 min
23. Four questions answered, two to go. — pattern: recap-grid — 1 min
24. How do you roll out a change in a safe order? — pattern: section-opener — 0.5 min
25. The Automation API runs the cluster stacks in waves: the canary first, then the rest. — pattern: flow — 1.5 min
26. Fleet Manager upgrades the clusters in stages and groups, with a wait between the stages. — pattern: zones — 1.5 min
27. Three limits shape the design: an Alpha Automation API, a fixed agent pool and a fleet without a hub. — pattern: compare — 1.5 min
28. Five questions answered, one to go. — pattern: recap-grid — 1 min
29. The fleet we will build is one core stack, three cluster stacks and one update run. — pattern: zones — 2 min
30. Six numbered folders hold the whole demo, in run order. — pattern: stack — 1.5 min
31. Demo: Kubernetes cluster fleet as code. — pattern: frame: demo-divider — 0.5 min
32. Nine steps take three clusters from nothing to upgraded to gone. — pattern: demo-overview — 2 min
33. Step 1: The Azure subscription trusts Pulumi ESC through a federated credential. — pattern: demo-step — 3.5 min
34. Step 2: Four ESC environments give each cluster its merged configuration. — pattern: demo-checks — 4 min
35. Step 3: One pulumi up creates the fleet and its two-stage update strategy. — pattern: demo-step — 4.5 min
36. Step 4: A bad Kubernetes version stops at preview. — pattern: demo-outcome — 4.5 min
37. Step 5: Wave 1 creates one canary cluster at Kubernetes 1.35. — pattern: demo-step — 5.5 min
38. Step 6: Wave 2 creates the other two clusters in parallel. — pattern: demo-checks — 4.5 min
39. Step 7: One update run moves the canary first and the rest 60 seconds later. — pattern: demo-outcome — 8 min
40. Step 8: After the upgrade, reconcile leaves no diff on any stack. — pattern: demo-step — 4 min
41. Step 9: Teardown runs in reverse order and leaves nothing behind. — pattern: demo-checks — 4 min
42. Resources — pattern: frame: resources — 1 min
43. Continue your Pulumi journey! — pattern: frame: journey — 0.5 min
44. Thank you / Questions? — pattern: frame: thank-you — 10 min

## Check before committing

```bash
python3 ~/.workprentice/workshop-deck/deck_frame.py check kubernetes-cluster-fleet-as-code/slides
npm run build && npm run export     # both must pass
```

## Fact-check

Second pass, adversarial, 2026-11-20. Every source below was opened in this pass.

| Claim | Source | Date read | Outcome |
|---|---|---|---|
| Outage began 2023-03-08 06:03 UTC; US1, EU1, US3, US4, US5; all services | https://www.datadoghq.com/blog/2023-03-08-multiregion-infrastructure-connectivity-issue/ | 2026-11-20 | Supported |
| Quote: "a security update to systemd was automatically applied to a number of VMs" | https://www.datadoghq.com/blog/2023-03-08-multiregion-infrastructure-connectivity-issue/ | 2026-11-20 | Supported (verbatim) |
| "tens of thousands of nodes" between 06:00 and 07:00 | https://www.datadoghq.com/blog/2023-03-08-multiregion-infrastructure-connectivity-issue/ | 2026-11-20 | Partially supported: source says affected, not changed. Corrected |
| "A routine security update" (slide 6 title) | https://www.datadoghq.com/blog/2023-03-08-multiregion-infrastructure-connectivity-issue/ | 2026-11-20 | Unsupported word: source says an automatic update via a legacy channel. Corrected to "automatic" |
| All services operational in all regions 2023-03-09 08:58 UTC | https://www.datadoghq.com/blog/2023-03-08-multiregion-infrastructure-connectivity-issue/ | 2026-11-20 | Supported |
| Quote: "Thus it affected multiple regions at the exact same time"; "legacy security update channel enabled"; "region-by-region, cluster-by-cluster, node-by-node" | https://www.datadoghq.com/blog/2023-03-08-multiregion-infrastructure-connectivity-issue/ | 2026-11-20 | Supported (verbatim) |
| Component = logical grouping exposed as a single Pulumi resource | https://www.pulumi.com/docs/iac/concepts/components/ | 2026-11-20 | Supported (verbatim) |
| Stack = isolated, independently configurable instance of a program | https://www.pulumi.com/docs/iac/concepts/stacks/ | 2026-11-20 | Supported (verbatim) |
| ESC azure-login with OIDC, ARM_* variables | https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/azure-login/ | 2026-11-20 | Supported |
| pulumiConfig reaches program as config; ESC needs Pulumi Cloud backend; short-lived credentials | https://www.pulumi.com/docs/esc/integrations/infrastructure/pulumi-iac/ | 2026-11-20 | Supported (page now at /docs/esc/guides/pulumi-iac/) |
| Imported environment values are overridden by the importing environment | https://www.pulumi.com/docs/esc/environments/imports/ | 2026-11-20 | Supported |
| Enforcement levels advisory/mandatory/remediate/disabled; mandatory blocks; runs at preview and update | https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/ | 2026-11-20 | Supported |
| Automation API needs the Pulumi CLI at runtime | https://www.pulumi.com/docs/iac/concepts/automation-api/ | 2026-11-20 | Supported |
| LocalWorkspace marked Alpha, @pulumi/pulumi v3.277.0 | https://www.pulumi.com/docs/reference/pkg/nodejs/pulumi/pulumi/classes/automation.LocalWorkspace.html | 2026-11-20 | Supported for LocalWorkspace only. Slides said the whole Automation API: narrowed (slide 27 text, title and notes; closing note) |
| agentPoolProfiles cannot be updated directly | https://www.pulumi.com/registry/packages/azure-native/api-docs/containerservice/managedcluster/ | 2026-11-20 | Supported |
| Update runs: stages sequential, groups in a stage parallel, wait times and gates | https://learn.microsoft.com/en-us/azure/kubernetes-fleet/concepts-update-orchestration | 2026-11-20 | Supported |
| Hubless fleet: updates yes, workload placement no, no cost | https://learn.microsoft.com/en-us/azure/kubernetes-fleet/concepts-choosing-fleet | 2026-11-20 | Supported |
| AKS 1.35 end of life Mar 2027, 1.36 Jun 2027, 1.37 GA | https://learn.microsoft.com/en-us/azure/aks/supported-kubernetes-versions | 2026-11-20 | Supported (1.37 GA Oct 2026) |
| Fleet Manager overview, member clusters | https://learn.microsoft.com/en-us/azure/kubernetes-fleet/overview | 2026-11-20 | Supported |
| Policy pack fleet-baseline, four mandatory rules (aks-supported-version 1.35/1.36, aks-rbac-enabled, aks-fleet-tag fleet=workshop, aks-one-small-pool) | 04-fleet-policies/index.ts, PulumiPolicy.yaml | 2026-11-20 | Supported by demo code |
| Strategy two-waves: stage canary, wait 60 s, stage rest; fleet-workshop in rg-fleet-workshop, no hub | 03-fleet-core/index.ts | 2026-11-20 | Supported by demo code |
| Wave 1 canary-1 alone, wave 2 rest-1 and rest-2 in parallel; destroy rest first, then canary; reconcile refresh, env set, preview | 05-fleet-cluster/rollout.ts, clusters.json | 2026-11-20 | Supported by demo code |
| Step 4 sets 1.33, restores 1.35; baseline namespace platform; 1.35 start, 1.36 target; four ESC envs; Azure OIDC base holds login, region, VM size | try-bad-version.sh, fleetCluster.ts, 02-esc/, 06-update-run/ | 2026-11-20 | Supported by demo code |
| Cost about $1.49 (3 clusters, 3 h) | README.md; https://prices.azure.com/api/retail/prices | 2026-11-20 | Partially verified: D2ds_v5 $0.136/h and Standard IPv4 $0.005/h confirmed westeurope; load balancer $0.025/h not found by API query. Arithmetic checks. Slide already says estimate |

Overall confidence: high for the Datadog, Pulumi and Azure claims. Medium for the cost figure (load balancer rate unverified). Demo behaviour is verified against the code, not by a live run.

Corrections made:
- Slide 6 title: "routine" became "automatic".
- Slide 6 bullet and note: nodes "changed" became "affected" (note adds "in their fleet").
- Slide 27 and its note, plus the closing note: the Alpha mark applies to LocalWorkspace, not the whole Automation API.
