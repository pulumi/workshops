# Slides: Defense in Depth as Code

Working file for the deck builders. Slug: `defense-in-depth-kyverno-pulumi-policies`. Deck: `slides/slides.md`. Brief: workshop brief afeeb0b5 (workspace document, read 2026-10-01). Phase: scaffold done; story and demo slides not yet written.

## Story

1. **The moment.** February 2018: researchers at RedLock found hackers had run currency-mining software in a Tesla cloud account. Entry point, in RedLock's words: "The hackers had infiltrated Tesla's Kubernetes console which was not password protected." Source: Dan Goodin, Ars Technica, 2018-02-20, https://arstechnica.com/information-technology/2018/02/tesla-cloud-resources-are-hacked-to-run-cryptocurrency-mining-malware/ (opened 2026-10-01). Brief §2 holds only demand signals, so the moment was found this run.
2. **The tension.** "You can review every manifest." / "You can't review every request that reaches the cluster."
3. **Why it is hard.** A valid manifest is not a safe manifest: the API server accepts a Pod with no resource limits, and the Pod Security Standards' Privileged level is "purposely-open, and entirely unrestricted". Safety needs a rule somebody enforces.
4. **The questions.** Q1 Where does a request get checked? Q2 What does admission control see? Q3 How do I ship that rule as code? Q4 Can the pipeline stop it earlier? Q5 What does each layer miss? Q6 Which layer should catch this?
5. **The answers.** Q1 and Q2: the API server's admission phase, where Kyverno is a webhook (Act 2, section 1). Q3: Kyverno and its ClusterPolicy as Pulumi resources. Q4: Pulumi Policies, evaluated at `pulumi preview`, with enforcement levels. Q5: boundaries, each layer sees a different moment. Q6: answered by the demo and the side-by-side slide.
6. **The proof.** The demo stands up Kyverno with Pulumi, enforces `require-resource-limits`, shows `kubectl apply` rejected at admission, shows `pulumi preview --policy-pack` blocking the same Pod before the cluster sees it, then compares the two. Q6 is answered last.

## Workshop info

- Title: Defense in Depth as Code: Kyverno Admission Control and Pulumi Policies. Length 90 minutes. Audience: platform, DevOps and security engineers, intermediate.
- Speakers: not named in the brief or card; one placeholder speaker in `frame.json`. The pull request must say so.
- Pinned (from the demo folder README): Kyverno chart 3.9.1 (app v1.19.1), `@pulumi/kubernetes` 4.34.2, `@pulumi/policy` 1.21.0, `@pulumi/pulumi` 3.267.0.

## Headlines

Every story and demo slide, in order, between the generated agenda and the generated demo divider (Act 3 follows the divider). Format: number. headline (pattern, minutes). Then the exact content. The frame (title, speaker, housekeeping and agenda, housekeeping, agenda, demo divider, resources, journey, thank you) comes from `deck_frame.py` and is not listed. Pick the pattern markup with `deck_frame.py patterns <name>`; `big-code` is the reference's code block pattern.

1. **A cluster accepted a workload nobody should have approved** (quote-card, 3 min, Act 1)
   Quote (verbatim, Ars Technica 2018-02-20 quoting RedLock researchers): "The hackers had infiltrated Tesla's Kubernetes console which was not password protected." Three facts beside it: (1) "Unprotected Kubernetes administrative console was the entry point"; (2) "Inside one pod, AWS access credentials were exposed" (Ars quote: "Within one Kubernetes pod, access credentials were exposed to Tesla's AWS environment"); (3) "Attackers ran currency-mining software in Tesla's cloud account". Reveal line: "RedLock reported it; the systems were quickly disinfected. Nothing at the door asked what was running." (last sentence is our reading, mark it as such in the note). Source line: arstechnica.com, Dan Goodin, Feb 20, 2018.
2. **You can review every manifest** (big-statement, 1 min, Act 1)
   One line, huge. Pair with the next slide.
3. **You can't review every request that reaches the cluster** (big-statement, 1 min, Act 1)
   One line, huge. Second half of the tension.
4. **A valid manifest is not a safe manifest** (compare, 2 min, Act 1)
   Left card "Valid": the API server accepts it, schema is fine, a Pod named unsafe-pod with image nginx:1.27 reads as normal in a diff. Right card "Safe": needs a rule somebody enforces: every container sets resources.limits.cpu and resources.limits.memory; the Pod Security Standards "Privileged" level is "purposely-open, and entirely unrestricted" (kubernetes.io, Pod Security Standards).
5. **Six questions decide whether you can trust a guard** (card-grid, 2 min, Act 1)
   Six cards, one per question, caps label Q1..Q6: Where does a request get checked? / What does admission control see? / How do I ship that rule as code? / Can the pipeline stop it earlier? / What does each layer miss? / Which layer should catch this?. Icons: ph-door, ph-eye, ph-code, ph-git-branch, ph-warning, ph-scales (check each renders).
6. **Q1: Where does a request get checked?** (section-opener, 0.5 min, Act 2)
   Opener with Q1 text.
7. **Every request passes the API server before it is stored** (chain, 4 min, Act 2)
   chain: kubectl apply > API server > mutating admission > validating admission > etcd (stored). Summary line: "Admission control runs in two phases, mutating then validating" (kubernetes.io admission controllers page).
8. **Kyverno is a webhook the API server calls** (zones, 3 min, Act 2)
   Zone 1 "Kubernetes control plane": API server. Zone 2 "In the cluster": Kyverno (admission controller). Arrow label "validating and mutating admission webhook callbacks" (kyverno.io how Kyverno works). Callout: "Kyverno applies matching policies and returns results that enforce admission policies or reject requests."
9. **A ClusterPolicy is match, validate, reject** (flow, 2.5 min, Act 2)
   flow, 3 steps: (1) match: kind Pod; (2) validate: resources.limits.cpu and resources.limits.memory are set on every container; (3) failureAction Enforce: reject the request with the policy message. Callout: policy name require-resource-limits. No code block.
10. **Two questions answered, four to go** (recap-grid, 1 min, Act 2)
   recap-grid: Q1 and Q2 highlighted. Q1 answer "At the API server, before storage". Q2 answer "The Pod spec, via a webhook". Q3 to Q6 muted.
11. **Q3: How do I ship that rule as code?** (section-opener, 0.5 min, Act 2)
   Opener with Q3 text.
12. **Kyverno and its policy are Pulumi resources** (chain, 2.5 min, Act 2)
   chain: Helm chart (kubernetes.helm.v4.Chart, kyverno 3.9.1) > Kyverno running > ClusterPolicy (kubernetes.apiextensions.CustomResource) > Pod blocked. Summary: "One program, one pulumi up, one preview".
13. **The rule goes through preview like any other resource** (big-statement, 1.5 min, Act 2)
   One line: "The rule goes through preview like any other resource."
14. **Q4: Can the pipeline stop it earlier?** (section-opener, 0.5 min, Act 2)
   Opener with Q4 text.
15. **Pulumi Policies checks resources before anything changes** (flow, 2.5 min, Act 2)
   flow, 4 steps: pulumi preview > policy pack evaluates the declared resources > mandatory violation stops the deployment > the cluster never sees the Pod. Source: pulumi.com/docs/insights/policy ("evaluates policies against the resources a Pulumi program declares during pulumi preview and pulumi up, before anything changes in your cloud provider"; "A violation of a mandatory policy stops the deployment"). Callout: policies written in TypeScript, JavaScript, Python or OPA (Rego).
16. **The enforcement level decides what a violation does** (options, 2 min, Act 2)
   Three option cards from the docs: advisory "reports a violation as a warning"; mandatory "blocks the deployment" (highlight: the demo uses it); remediate "fixes the resource automatically". Visual track: warn, block, fix.
17. **Four questions answered, two to go** (recap-grid, 1 min, Act 2)
   recap-grid: Q1 to Q4 highlighted. Q3 answer "Helm chart and ClusterPolicy as resources". Q4 answer "Pulumi Policies at preview". Q5, Q6 muted.
18. **Q5: What does each layer miss?** (section-opener, 0.5 min, Act 2)
   Opener with Q5 text.
19. **Each layer sees a different moment** (boundaries, 4 min, Act 2)
   Rows "guarded by": (1) manifest applied with kubectl > Kyverno at admission; (2) resource declared in a Pulumi program > Pulumi Policies at preview and up; (3) resource created outside Pulumi > only admission sees it; (4) rule violated in a program nobody runs through the policy pack > only admission sees it. Rows 3 and 4 follow from the docs (policies evaluate "the resources a Pulumi program declares"); fact-check them.
20. **Five questions answered, one to go** (recap-grid, 1 min, Act 2)
   recap-grid: Q1 to Q5 highlighted with a short answer each ("Q5: Admission misses the pipeline view, the pipeline misses live applies"). Q6 muted: "The demo answers it".
21. **Where this breaks today** (card-grid, 4 min, Act 2)
   Four cards, plain limits of THIS demo: (1) "One rule: resource limits only" (the brief also names privileged containers, the demo code does not enforce it); (2) "Pod only" (Kyverno rule matches kind Pod; the policy pack validates kubernetes:core/v1:Pod, not Deployments); (3) "Local kind cluster" (single node, not a production setup); (4) "Order matters" (Kyverno must be Ready before the ClusterPolicy applies; the demo waits with wait-for-kyverno.sh).
22. **Two guards, one program model, one local cluster** (zones, 3 min, Solution)
   Zone 1 "Pulumi pipeline": program, policy pack, pulumi preview. Zone 2 "kind cluster policy-demo": API server, Kyverno, ClusterPolicy require-resource-limits. Arrow: pulumi up. Callout: "kubectl apply by hand hits the cluster door; the Pulumi program hits the policy pack first".
23. **The whole install is about ten lines of Pulumi** (big-code, 2 min, Solution)
   ONE code slide, 9 lines, abridged from 02-kyverno/index.ts and 03-cluster-policy/index.ts: const kyverno = new k8s.helm.v4.Chart("kyverno", { chart: "kyverno", version: "3.9.1", repositoryOpts: { repo: "https://kyverno.github.io/kyverno/" } }); then new k8s.apiextensions.CustomResource("require-resource-limits", { apiVersion: "kyverno.io/v1", kind: "ClusterPolicy", spec: { /* validate limits.cpu + limits.memory, Enforce */ } }); Lay out as 9 lines. Say "abridged" in the note. Only program code in the deck.
24. **What we are going to do** (demo-overview, 2 min, Act 3)
   Outcomes, one per step: "A local cluster is ready"; "Kyverno runs, installed by Pulumi"; "The ClusterPolicy is Ready"; "kubectl apply is rejected"; "pulumi preview is blocked"; "Nothing is left running". Not commands.
25. **A local cluster is ready before anyone arrives** (demo-step, 3 min, Act 3)
   Folder 01-cluster. Command: 01-cluster/create-cluster.sh (presenter ran it, plus 01-cluster/preflight.sh, before the session). See: kind cluster policy-demo, kubectl get nodes shows Ready.
26. **Kyverno comes up as a Pulumi-managed chart** (demo-step, 5 min, Act 3)
   Folder 02-kyverno. Commands (2 lines): pulumi up / kubectl --context kind-policy-demo get pods -n kyverno. See: Kyverno pods Running and ready.
27. **The rule is Ready in enforce mode** (demo-step, 5 min, Act 3)
   Folder 03-cluster-policy. Commands (3 lines): ./wait-for-kyverno.sh / pulumi up / kubectl --context kind-policy-demo get clusterpolicy. See: require-resource-limits READY True.
28. **The cluster refuses a Pod with no limits** (demo-outcome, 4 min, Act 3)
   Folder 04-admission-denied. Command (1 line): 04-admission-denied/try-apply.sh. See: Kyverno admission error naming require-resource-limits and the message "Every container must set resources.limits.cpu and resources.limits.memory."; script prints "rejected as expected". Note: script always exits 0, read the output.
29. **The pipeline blocks the same Pod before the cluster sees it** (demo-checks, 6 min, Act 3)
   Folder 05-pipeline-policy/workload. Command (1 line): pulumi preview --policy-pack ../policy-pack. See: violation of containers-must-set-resource-limits (mandatory) for Container "app" in Pod "unsafe-workload"; preview stops; nothing created in the cluster. Capture the REAL output from the demo run if available; otherwise state that it was not run.
30. **Same rule, two moments of failure** (compare, 3 min, Act 3)
   Left "Admission (Kyverno)": fails at kubectl apply, the request reaches the API server and is refused; sees any client. Right "Pipeline (Pulumi Policies)": fails at pulumi preview, nothing reaches the cluster; sees only Pulumi programs. Answers Q6: keep both; the pipeline gives fast feedback, admission is the backstop.
31. **Six questions, six answers** (recap-grid, 2 min, Act 3)
   recap-grid, all six highlighted with one-line answers; Q6 "Both: pipeline for early feedback, admission for the backstop".
32. **Teardown leaves nothing running** (demo-outcome, 2 min, Act 3)
   Command (1 line): ./teardown.sh. See: docker ps shows no policy-demo-control-plane; kubectl config get-contexts no longer lists kind-policy-demo.

Counts: 32 story and demo slides plus 10 frame slides (title, 1 speaker, 3 opening, demo divider, 3 closing) = 42 slides. Act 3 has 9 slides, 21% of the deck (limit 25%).

Code budget: program code on slide 23 only (9 lines). Demo commands: slide 26 two lines, slide 27 three, the rest one. Whole deck under 20 lines of code and commands once slide 23 is counted; recount after writing.

## Structure and time budget

| Part | Slides | Minutes |
| --- | --- | --- |
| Act 1 | 5 | 9 |
| Act 2 | 16 | 31 |
| Solution | 2 | 5 |
| Act 3 | 9 | 32 |
| Frame (title 1, speaker 2, opening divider 0.5, housekeeping 1, agenda 1.5, demo divider 0.5, resources 1, journey 0.5, thank you and questions 5) | 10 | 13 |
| Total | 42 | 90 |

Every slide, frame included, carries its minutes in its speaker note; they must add up to 90.

## Inputs by authority

1. The brief (never edited): topic, 8 demo steps, 12 slide titles as guidance. 2. The demo folders `01-cluster` to `05-pipeline-policy` and `README.md`: commands and flags on slides are copied from them. 3. The reference deck `neo-in-a-docker-sandbox/slides` and `deck_frame.py patterns`. 4. Docs opened this run (below).

## Sources (read 2026-10-01)

- https://arstechnica.com/information-technology/2018/02/tesla-cloud-resources-are-hacked-to-run-cryptocurrency-mining-malware/ (the moment)
- https://kyverno.io/docs/introduction/how-kyverno-works/ (Kyverno as admission controller, webhook callbacks)
- https://kyverno.io/docs/ (resource link)
- https://www.pulumi.com/docs/insights/policy/ (evaluation at preview, enforcement levels, languages)
- https://www.pulumi.com/docs/insights/policy/get-started/ (opened)
- https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/ (two phases)
- https://kubernetes.io/docs/concepts/security/pod-security-standards/ (Privileged level)

slidev-deck skill read from pulumi/marketing-web, commit 9b37f9afe8c7b0d406f19bc9116b16d5689389ce (2026-10-01).

## Deviations from the brief

- The brief's 12 slide titles are folded into the story deck; its 8 demo steps map to slides 25 to 32 (step 1 to 25, steps 2 and 3 to 26, step 4 to 27, step 5 to 28, step 6 to 29, step 7 to 30 and 31, step 8 to 32).
- The brief names no privileged-container rule in its steps; the demo enforces resource limits only. Slide 21 says so.
- The moment (Tesla 2018) is about an unprotected console, not resource limits; slides frame it as an unguarded cluster, nothing more.
- No speakers named: placeholder.

## Fact-check

Run 2026-10-01. All sources opened that day. Claims: 19. Confirmed: 17. Partial (inference, labelled as such on the slide or in the note): 2. Removed: 0 claims. Wording removed: two closers in speaker notes (humanizer pass).

Slide 35 was checked with a real run: `pulumi preview --policy-pack ../policy-pack` in 05-pipeline-policy/workload, offline (file backend, no Pulumi Cloud login). It printed the policy require-resource-limits, the mandatory violation containers-must-set-resource-limits, and "preview failed". Not run: slides 31 to 34 and 38 (they need a kind cluster and Docker); their claims are checked against the demo scripts only.

| Claim | Source | Outcome |
|---|---|---|
| Tesla Kubernetes console was not password protected (quoted, RedLock via Ars) | https://arstechnica.com/information-technology/2018/02/tesla-cloud-resources-are-hacked-to-run-cryptocurrency-mining-malware/ | confirmed |
| Credentials to Tesla's AWS environment exposed inside one pod | same Ars article | confirmed |
| Currency-mining software ran in Tesla's cloud account | same Ars article (headline and body) | confirmed |
| RedLock reported it; systems quickly disinfected; article by Dan Goodin, Feb 20, 2018 | same Ars article | confirmed |
| 'Nothing at the door asked what was running' (slide 6) | none: presenter's reading, labelled as such in the note | partial (inference, labelled) |
| Privileged level is 'purposely-open, and entirely unrestricted' | https://kubernetes.io/docs/concepts/security/pod-security-standards/ | confirmed |
| Admission control runs mutating then validating phases | https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/ | confirmed |
| Kyverno receives validating and mutating admission webhook callbacks from the API server and returns results that enforce or reject | https://kyverno.io/docs/introduction/how-kyverno-works/ | confirmed |
| Pulumi Policies written in TypeScript, JavaScript, Python or OPA (Rego) | https://www.pulumi.com/docs/insights/policy/ | confirmed |
| Policies evaluate resources a Pulumi program declares, before they are provisioned | https://www.pulumi.com/docs/insights/policy/ | confirmed |
| Enforcement levels: advisory warns, mandatory blocks, remediate fixes | https://www.pulumi.com/docs/insights/policy/ | confirmed |
| Gap claims on slide 24 (resource created outside Pulumi, or a program run without the pack, is not seen by the pack) | follows from the declared-resources sentence in the Pulumi Policies doc; not stated verbatim | partial (inference, labelled in note) |
| Kyverno chart 3.9.1 via kubernetes.helm.v4.Chart, repo kyverno.github.io/kyverno | demo 02-kyverno/index.ts | confirmed |
| ClusterPolicy is a kubernetes.apiextensions.CustomResource, failureAction Enforce, message text | demo 03-cluster-policy/index.ts | confirmed |
| try-apply.sh prints 'rejected as expected' and always exits 0 | demo 04-admission-denied/try-apply.sh | confirmed |
| Unsafe pod named unsafe-pod, image nginx:1.27 | demo 04-admission-denied/unsafe-pod.yaml | confirmed |
| teardown.sh deletes cluster; docker ps / get-contexts checks | demo teardown.sh | confirmed |
| Slide 35 output: mandatory violation containers-must-set-resource-limits for Container app in Pod unsafe-workload; preview stops | real offline run 2026-10-01: local file backend, pulumi v3.267.0, policy pack built with tsc | confirmed (run) |
| Slide 26 limits (one rule, Pod only, single kind node, ordering) | demo code and README | confirmed |
