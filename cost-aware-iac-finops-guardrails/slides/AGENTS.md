# Slides: cost-aware-iac-finops-guardrails

## Story
1. The moment: the FinOps Foundation's Allocation page names "Monthly challenges identifying the owners of unknown, untagged, unidentified accounts" as a typical problem. It is a framework statement, not an incident. Source: https://www.finops.org/framework/capabilities/allocation/, re-opened 2026-10-04; quote confirmed verbatim.
2. The tension: the bill arrives after the deploy. The tagging cleanup arrives after the bill.
3. Why it is hard: cleanup finds the owner after the spend; a gate finds it before.
4. The questions: how much and when do we hear about it, who owns it, what if nobody tags it, what about what is already deployed, what stops an oversized instance.
5. The answers: a budget with an 80% alert as code, a CostCenter tag, a mandatory policy pack at preview, audit mode in Pulumi Cloud for existing resources, a size guardrail in the demo.
6. The proof: the demo blocks an untagged instance and a t3.2xlarge at preview, before anything reaches AWS. It answers the last question.

## Workshop
90 minutes, intermediate platform and DevOps engineers. AWS only, Python, Pulumi CLI 3.264.0, pulumi-aws 7.48.0, pulumi-policy 1.21.0.

## Original request
Order of authority: brief first (workshop brief, handoff Status ready), then the demo on disk (branch anvil/cost-aware-iac-finops-guardrails), then the workshop-deck skill. Speakers are unknown, so one placeholder speaker.

## Structure and minute budget (90 min)
Frame (title to agenda, resources, closing, Q&A): 14 min 45 sec. Act 1 the pain, slides 6 to 11: 9 min 35 sec. Act 2 the tech, slides 12 to 24: 25 min 25 sec. Solution, slides 25 and 26: 3 min 30 sec. Demo, slides 27 to 34: 44 min 20 sec incl. divider. Speaker notes carry the budget per slide and sum to 90 min. 37 slides, 7 demo-step slides (19%).

## Sources
- pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/, read 2026-10-04
- pulumi.com/docs/insights/policy/, read 2026-10-04
- pulumi.com/registry/packages/aws/api-docs/budgets/budget/, read 2026-10-04
- docs.aws.amazon.com cost allocation tags page, read 2026-10-04
- FinOps Foundation Allocation page via notes/moment.md
- marketing-web slidev-deck skill, commit 9b37f9afe8c7b0d406f19bc9116b16d5689389ce

## Deviations from brief section 5
The brief's outline puts the problem and market signal first and a single demo block after. The deck follows the workshop-deck three-act structure instead and drops the conference-signal and supply-gap slides, which are internal rationale. Teardown is a demo slide as in the brief.

## Rules
Frame comes from frame.json via deck_frame.py. Patterns copied whole, no theme layouts except image, no Mermaid, no hard-coded colours. Program code on one slide (6 lines). One command per demo slide with the demo's flags.

## Headlines
6. The FinOps Foundation says: set ownership at creation
7. "Monthly challenges identifying the owners of unknown, untagged, unidentified accounts"
8. The bill arrives after the deploy.
9. The tagging cleanup arrives after the bill.
10. Cleanup finds the owner after the spend; a gate finds it before
11. Six questions before you trust a cost guardrail
12. A budget is a resource, so it lives in code.
13. A budget carries its limit and its alert in one resource
14. A forecast alert fires before the money is spent
15. Every resource needs an owner.
16. A tag is not a cost allocation tag until you activate it
17. Three questions covered, three to go
18. What if nobody tags it?
19. Policies run on the preview, before the cloud is touched
20. Four enforcement levels: advisory warns, mandatory blocks
21. What about what is already deployed?
22. Preventative blocks at preview; audit reports what already exists
23. Where this breaks today
24. Five questions answered, one to go
25. One policy pack sits between your code and the cloud
26. The tag rule is a few lines of Python
27. Demo: Cost-aware IaC.
28. What we are going to do
29. 1 · The budget exists before the spend
30. 2 · An untagged instance deploys cleanly
31. 3 · The tag policy blocks it at preview
32. 4 · A tagged instance passes the same pack
33. 5 · The size guardrail blocks t3.2xlarge
34. Teardown leaves no budget behind

## Fact-check
Separate pass on 2026-10-04, after the humanizer pass. 38 claims checked: 33 confirmed, 4 corrected, 1 removed, 0 unverified on a slide.

Confirmed (source, read 2026-10-04):
- Moment quote "Shifting Left in Allocation means ownership and metadata standards are enforced at the point a resource is created, not reconstructed later through tagging cleanup": verbatim. Crawl "recorded manually and inconsistently after deployment", Walk "required ownership and metadata fields as a precondition for provisioning", Crawl bullets "Tagging strategy compliance is inconsistent" and "Monthly challenges identifying the owners of unknown, untagged, unidentified accounts" (6 claims). https://www.finops.org/framework/capabilities/allocation/
- Policies enforced during preview and up before anything changes in the cloud; a mandatory violation stops the deployment; four levels advisory, mandatory, remediate, disabled with the stated meanings; preventative vs audit groups; audit needs Pulumi Cloud; `--policy-pack` flag on preview and up; policy groups apply packs without the flag (9 claims). https://www.pulumi.com/docs/insights/policy/
- `ResourceValidationPolicy`, `EnforcementLevel.MANDATORY` (Python SDK name), `enforcement_level=`, name and description fields (4 claims). https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/
- `aws.budgets.Budget` with limitAmount, timeUnit, budgetType, notifications with thresholdType, subscriberEmailAddresses, subscriberSnsTopicArns, ACTUAL and FORECASTED types (3 claims). https://www.pulumi.com/registry/packages/aws/api-docs/budgets/budget/
- Tags organize resources; cost allocation tags track costs; user-defined tags must be activated separately before they appear in Cost Explorer or the cost allocation report (3 claims). https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html
- Budgets alert on actual (after accruing) and forecasted (before accruing) spend; notify by email and SNS (2 claims). https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html
- Against the demo code on disk (6 claims): 50 USD monthly limit, 80% ACTUAL threshold, SNS topic plus email subscriber; budget name cost-aware-iac-workshop; policy names cost-center-tag-required and instance-size-guardrail; allowed sizes t3.nano to t3.large; the slide 26 code is identical to 03-tagging-policy/__main__.py; every command and flag on slides 29 to 34 matches README.md steps 1 to 5 and teardown.

Corrected:
- Slide 29: "Five resources: budget, SNS topic, email subscriber" listed three of five. Now stack, budget, SNS topic and policy, email subscriber (01-budget/__main__.py; README preview plans five).
- Slide 14 notes: "a budget informs, it does not block" generalised. Now "our budget informs and does not block".
- Slide 8 notes: "weeks later" had no source. Now "after it".
- Slide 9 notes: "the person has moved teams" was an invented detail. Now "the owner is hard to find".

Removed:
- Slide 34 and notes: "AWS Budgets has no soft delete". Not found in the AWS docs read. Slide now says the budget is real until destroyed.

Unverified and not on a slide: none. Limits of the check: the demo's `pulumi up` and `pulumi destroy` against AWS were not run (no AWS account); the README lists what was and was not run. The Pulumi Cloud audit group behaviour is stated from the docs and is not demonstrated.
