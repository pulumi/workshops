# Deck notes: chaos-experiments-as-code-aws-fis

## Story

1. **The moment.** PlatformCon 2026 session "Beyond backups: Building cloud resilience with DR-as-code" (Ido Neeman, Firefly): over 90% of enterprises report that one hour of downtime costs more than $300,000. Source: https://2026.platformcon.com/sessions/beyond-backups-building-cloud-resilience-with-dr-as-code (opened and read 2026-10-23). It is a vendor speaker's claim and the deck says so.
2. **The tension.** "You can codify the recovery." / "You can't review the experiment that tests it."
3. **Why it is hard.** A console experiment leaves nothing to review (clicks, a limit in someone's head, no record) against the same experiment as code (a diff, the stop condition in the template, policy before deploy). Three failure modes: blast radius, drift, untested stop rules.
4. **The questions.** Six: what does an experiment look like as a resource; how does the tool log in to AWS without stored keys; how do teams reuse one safe pattern; how do we block an experiment with no stop condition; where do Litmus and Chaos Mesh fit next to FIS; how do we know the stop condition works.
5. **The answers.** Pulumi IaC with aws.fis.ExperimentTemplate; Pulumi ESC with OIDC; a Pulumi component; Pulumi Policies mandatory policy; the Litmus and Chaos Mesh comparison; the all-tasks experiment ending in state stopped.
6. **The proof.** Demo steps 7 and 8: one task stops and traffic keeps returning 200; all tasks stop and the alarm ends the experiment in state stopped. The questions return on the Questions? slide.

## Headlines

| # | Pattern | Headline |
| --- | --- | --- |
| 1-5 | frame | Title, speaker, Housekeeping and Agenda, Housekeeping, Today's Agenda |
| 6 | quote-card | One hour of downtime costs more than $300,000 |
| 7 | big-statement | You can codify the recovery. |
| 8 | big-statement | You can't review the experiment that tests it. |
| 9 | compare | A console experiment leaves nothing to review |
| 10 | card-grid | Unmanaged experiments fail in three ways |
| 11 | card-grid | You leave with a working safe experiment |
| 12 | card-grid | Six questions before you trust it |
| 13 | section-opener | Fault injection, in AWS terms. |
| 14-20 | chain / card-grid | FIS template, vocabulary, targets, actions, stop condition, role, Pulumi IaC resource |
| 21, 24, 28, 31, 35 | recap-grid | N questions covered, M to go |
| 22, 25, 29, 32 | section-opener | ESC, component, Policies, Litmus and Chaos Mesh |
| 23, 26, 27, 30, 33, 34 | chain / compare / card-grid | One answer or claim per slide, ending with "Where this breaks today" |
| 36, 37 | chain / terminal | The solution and the six-line component call |
| 38 | section-opener | Demo: Chaos experiments as code. |
| 39 | demo-overview | What we are going to do |
| 40-48 | demo-step | One slide per demo step 1 to 9 |
| 49-51 | frame | Resources, Continue your Pulumi journey!, Questions? |

Act 3 is slides 39 to 48, 10 of 51 slides, under one quarter.

## Fact-check

Sources read 2026-10-23. 17 claims checked, 1 corrected.

- PlatformCon quote, speaker, date, length (platformcon page): confirmed.
- FIS template holds actions, targets, stop conditions; stop condition is a CloudWatch alarm; a stopped experiment cannot be resumed (AWS FIS user guide): confirmed.
- Targets by tags or ARNs; selection modes ALL and COUNT(n) (FIS targets page): confirmed.
- aws:ecs:stop-task exists; aws:fis:wait runs one minute to 12 hours with no permissions (FIS actions reference): confirmed.
- Role trusts fis.amazonaws.com (FIS IAM service role page): confirmed.
- AWSFaultInjectionSimulatorECSAccess is an AWS managed policy for ECS actions: confirmed. Corrected: slide 19 said the role touches "ECS and nothing else"; the policy also includes SSM and EC2 describe and tag lookup actions. Slide now says "scoped to ECS fault actions, not an admin role".
- ESC OIDC: short-lived credentials, no long-lived keys (ESC AWS login docs); duration 1h matches the demo environment: confirmed.
- Policy enforcement levels advisory, mandatory, remediate, disabled; mandatory blocks deployment (Pulumi Policies docs): confirmed.
- Aliases keep identity on rename or reparent (Pulumi aliases docs): confirmed.
- Litmus is Kubernetes-native with chaos intent in custom resources; Chaos Mesh is a cloud-native chaos platform for Kubernetes (their docs): confirmed.
- ALB billed per hour or partial hour (AWS ELB pricing): confirmed. The earlier "under 3 USD" estimate was removed; the notes use the brief's 5 USD budget.
- Steady state, hypothesis, blast radius (principlesofchaos.org): confirmed.
