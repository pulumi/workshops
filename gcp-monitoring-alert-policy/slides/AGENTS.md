# Slides notes

## Story

1. The moment: Google Cloud incident of 12 June 2025; its report says customers' own monitoring on Google Cloud failed too, leaving them without a signal (https://status.cloud.google.com/incidents/ow5i3PPK96RduMcb1SsW, read 2026-10-09).
2. Tension: alerts that page on noise, or never exist.
3. Why it is hard: static thresholds and console clicks do not scale across services.
4. Questions: say it in code, when to page, how to see it, how to reuse, how to prove it, how to log in without keys.
5. Answers: SLO and burn-rate policies, log metric and dashboard, component, tests and policy pack, Pulumi ESC OIDC.
6. Proof: the demo, ending on the burn-rate alert. Nothing was run on real Google Cloud; slides say so.

## Sources

marketing-web slidev-deck commit: 9b37f9afe8c7b0d406f19bc9116b16d5689389ce

## Headlines

- Housekeeping
- Today's Agenda
- Customers lost the signal along with the service
- Alerts by hand drift. Alerts from code get reviewed.
- Six questions decide whether you can trust monitoring as code
- 99% becomes a resource, not a sentence in a wiki
- Two alerts: one for fast burns, one for slow ones
- The page comes from the SLO's burn rate, not from a CPU graph
- Errors and a dashboard come from the same program
- Three questions covered, three to go
- One component holds the whole monitoring set
- Pulumi ESC logs in to Google Cloud through OpenID Connect
- Five questions covered, one to go
- A test checks the component. A policy checks the stack.
- A stack with a service and no alert policy is rejected at preview
- Nothing here has run on real Google Cloud yet
- Neo can draft the change. Tests and policy still gate it.
- Every service gets its monitoring from the same component
- What we are going to do
- 1 · One environment holds the login, no key file
- 2 · The service answers 200, and 500 on request
- 3 · The goal becomes an SLO resource
- 4 · Two alert policies watch the burn rate
- 5 · A log metric and a dashboard finish the set
- 6 · The same monitoring becomes one component
- 7 · The test passes, and a second test fails on purpose
- 8 · The policy pack blocks the stack the test could not
- 9 · We break the service and the alert opens
- Resources
- Continue your Pulumi journey!

## Fact-check

Second pass, 2026-10-09. Every source below was opened this run.

| Claim | Source | Result |
| --- | --- | --- |
| Moment quote "For some customers, the monitoring infrastructure ... business and/or infrastructure." (slide 6), verbatim | https://status.cloud.google.com/incidents/ow5i3PPK96RduMcb1SsW | Confirmed, verbatim |
| Outage on 12 June 2025; cause named as invalid or corrupt data in an API management platform | same incident report ("12 Jun 2025") | Confirmed |
| Follow-up: keep monitoring and communication running when primary monitoring products are down | same incident report | Confirmed |
| Burn rate above 1 means the service will be out of SLO if the error rate is sustained over a future compliance period | https://docs.cloud.google.com/stackdriver/docs/solutions/slo-monitoring/alerting-on-budget-burn-rate | Confirmed |
| "A burn rate of zero means no errors" (note, slide 13) | same page | Not found. Removed |
| Fast burn starting point 10x baseline, 1 or 2 hour lookback; slow burn longer lookback, threshold above ideal but not much | same page | Confirmed |
| select_slo_burn_rate is the burn-rate selector | same page | Confirmed |
| Demo values 1 h at 10 and 6 h at 2 are our choice | demo component defaults | Stated as ours in the note |
| gcp-login logs in through OpenID Connect or static credentials; provider reads project and OAuth access token from environment variables | https://www.pulumi.com/docs/esc/providers/login/gcp-login/ | Confirmed |
| pulumi env setup gcp is experimental | `pulumi env setup --help`, CLI v3.268.0 | Confirmed |
| A component is a logical grouping of resources exposed as a single resource | https://www.pulumi.com/docs/iac/concepts/components/ | Confirmed |
| validateStack gives access to all resources in the stack; mandatory policy blocks an update | https://www.pulumi.com/docs/insights/policy/policy-packs/authoring/ | Confirmed |
| Policies run at preview and up | same page | Confirmed (page mentions pulumi preview and --policy-pack) |
| Neo reads the organization's live state in Pulumi Cloud, can open a pull request against IaC code, has policy guardrails and human approvals | https://www.pulumi.com/docs/ai/neo/ | Confirmed |
| gcp.monitoring.Slo supports request-based SLI with goal | https://www.pulumi.com/registry/packages/gcp/api-docs/monitoring/slo/ | Confirmed |
| "five lines" in the component call | 04-component/index.ts | Corrected to "five arguments" |
| Demo commands on slides 33 to 41 | README.md and demo folders | Match, same flags |
| Resources URLs resolve: burn-rate page, slack.pulumi.com, ESC gcp-login, policy authoring, registry Slo, LinkedIn | opened this run | All resolve |
| https://github.com/pulumi/workshops/tree/main/gcp-monitoring-alert-policy | not yet merged | Resolves only after merge (expected) |

Unverifiable until a live run: SLI shape acceptance, Cloud Run filter, burn-rate filter string, zero-second duration, adoptInline, the echo image status-code switch. The deck says so on slides 28 and 34 to 35.
