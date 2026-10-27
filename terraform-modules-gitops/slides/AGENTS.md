# AGENTS.md: the deck's story, headlines and sources

Guidance for anyone editing `slides.md`. Conventions for the whole workshop folder are in `../AGENTS.md`. The opening and closing slides, the demo divider and the Resources cards come from `frame.json` through `deck_frame.py` and are never edited by hand: change `frame.json` and run `deck_frame.py init ... --frame-only`.

## The workshop

"Keep your Terraform modules, change the pipeline: Terraform modules in Pulumi with push-to-deploy and drift detection". 90 minutes: 25 talk, 55 hands-on, 10 wrap-up. Audience: platform and DevOps engineers who run Terraform today and own its pipeline, intermediate level. Speakers: placeholders until announced.

## Story

1. **The moment.** The abstract of a keynote scheduled for KubeCon + CloudNativeCon North America 2026 on Wednesday 2026-11-11 (the talk has not been given yet): "We Have GitOps at Home: How Meta Went from Terraform on Cron to GitOps for AI Infra", Phong Nguyen and Shaun Hopper, Meta. Source: https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/?id=1360829 (read 2026-10-27). The abstract says: about 15 engineers run about 100 Kubernetes clusters for AI research and inference; Terraform does its job of setting up the infrastructure; "Even a one-line Helm values change can take a working day in our monolithic Terraform pipeline, where one stuck app can block dozens of others." Slides say "abstract of a talk scheduled for 2026-11-11" and quote nothing the abstract does not say.
2. **The tension.** "Your Terraform modules are the asset." / "The pipeline around them is the liability."
3. **Why it is hard.** The obvious fix is a rewrite, and the rewrite is the cost most teams will not pay. Before: change the pipeline by rewriting the modules. After: keep the modules, change the loop around them. The abstract shows the same split on the Meta side: Terraform keeps the infrastructure, Argo CD and Kargo take the apps.
4. **The questions.** (1) Can I use my Terraform modules without rewriting them? (2) Can I extend what the module builds with real code? (3) How do deployments get credentials without stored keys? (4) What replaces the cron job? (5) What does this cost, and which edition do I need? (6) How do I know when the cloud moved under me?
5. **The answers.** In the order Act 2 shows them: (1) the hcl package runs a module as a Pulumi component, pinned, state in Pulumi Cloud; (2) native resources take module outputs as inputs; (3) Pulumi ESC with the `aws-login` provider and OIDC; (4) Pulumi Cloud push-to-deploy and pull request previews; (5) Free covers the loop, scheduled drift detection needs Pro or Enterprise; (6) drift detection by CLI and on a schedule.
6. **The proof.** The demo runs the loop end to end: module, native security group, ESC credentials, push-to-deploy, then a console change caught as drift. Question 6 is the one the demo answers last: the audience causes drift and catches it in step 7.

## Headlines

Read in order, the headlines tell the story. Patterns are the names from `deck_frame.py patterns`. Slides 1 to 5, 29 and 39 to 41 are generated frame slides; numbers count the whole deck.

| # | Act | Pattern | Headline | Min |
| --- | --- | --- | --- | --- |
| 1 | Opening | title (frame) | Keep your Terraform modules, change the pipeline | 0.5 |
| 2 | Opening | speaker (frame) | Speaker placeholder | 0.5 |
| 3 | Opening | section (frame) | Housekeeping and Agenda | 0.5 |
| 4 | Opening | housekeeping (frame) | Housekeeping | 1 |
| 5 | Opening | agenda (frame) | Today's Agenda | 1 |
| 6 | Act 1 | quote-card | At Meta, a one-line Helm values change can take a working day in the Terraform pipeline | 1.5 |
| 7 | Act 1 | zones | Meta left Terraform with the infrastructure and gave the apps to Argo CD and Kargo | 1 |
| 8 | Act 1 | big-statement | Your Terraform modules are the asset. | 0.5 |
| 9 | Act 1 | big-statement | The pipeline around them is the liability. | 0.5 |
| 10 | Act 1 | compare | Rewriting the modules to change the pipeline is a cost most teams will not pay | 1.5 |
| 11 | Act 1 | card-grid | Six questions decide whether you can keep the modules and change the pipeline | 1.5 |
| 12 | Act 2 | section-opener | Can I use my Terraform modules without rewriting them? | 0.25 |
| 13 | Act 2 | chain | The hcl package runs a Terraform module as a Pulumi component, pinned to a version | 1.5 |
| 14 | Act 2 | section-opener | Can I extend what the module builds with real code? | 0.25 |
| 15 | Act 2 | chain | A native resource takes a module output like any other input | 1.5 |
| 16 | Act 2 | section-opener | How do deployments get credentials without stored keys? | 0.25 |
| 17 | Act 2 | chain | Pulumi ESC swaps stored AWS keys for a short-lived OIDC login | 1.5 |
| 18 | Act 2 | recap-grid | Three questions answered, three to go | 0.5 |
| 19 | Act 2 | section-opener | What replaces the cron job? | 0.25 |
| 20 | Act 2 | flow | A push to main runs the update and a pull request runs a preview | 1.5 |
| 21 | Act 2 | section-opener | What does this cost, and which edition do I need? | 0.25 |
| 22 | Act 2 | options | The loop in this workshop runs on Free, and scheduled drift detection needs Pro or Enterprise | 1 |
| 23 | Act 2 | section-opener | How do I know when the cloud moved under me? | 0.25 |
| 24 | Act 2 | chain | Drift is the gap between what the stack recorded and what the cloud holds | 1.5 |
| 25 | Act 2 | terminal | One CLI command turns drift into a non-zero exit code | 1 |
| 26 | Act 2 | card-grid | Where this breaks today: four things can stop you, and each has a fallback | 1.5 |
| 27 | Act 2 | recap-grid | Five questions answered, one to go | 0.5 |
| 28 | Solution | zones | By the end you have a module, a native resource, ESC credentials and a push that deploys | 1.5 |
| 29 | Act 3 | divider (frame) | Demo: Terraform modules in Pulumi | 0.5 |
| 30 | Act 3 | demo-overview | What we are going to do | 1.5 |
| 31 | Act 3 | demo-step | A passing preflight and an empty project are the starting line (steps 0 and 1) | 5 |
| 32 | Act 3 | demo-step | One command turns a registry module into a pinned package, and pulumi up builds the VPC (steps 2 and 3) | 8 |
| 33 | Act 3 | demo-checks | A native security group reads the module's VPC id and lives in the same stack (step 4) | 7 |
| 34 | Act 3 | demo-checks | A short-lived role replaces the AWS keys in your shell (step 5) | 10 |
| 35 | Act 3 | demo-outcome | A push to main deploys, and a pull request gets a preview (step 6) | 12 |
| 36 | Act 3 | demo-step | A console change fails the drift check, and one command reconciles it (step 7) | 8 |
| 37 | Act 3 | demo-step | Teardown ends with no workshop VPC in us-west-2 (step 8) | 3 |
| 38 | Act 3 | recap-grid | All six questions are answered, and you kept your modules | 2 |
| 39 | Closing | resources (frame) | Resources | 1.5 |
| 40 | Closing | journey (frame) | Continue your Pulumi journey! | 1 |
| 41 | Closing | thank-you (frame) | Thank you / Questions? | 5.5 |

Totals: 41 slides, 90 minutes. Opening 5, Act 1 6, Act 2 16, solution 1, Act 3 10 (divider included, 24.4% of the deck), closing frame 3. Minutes: talk 25 (slides 1 to 28), hands-on 55 (slides 29 to 37), wrap-up 10 (slides 38 to 41).

Slide 38 puts the six questions back as an all-answered recap after the last demo step, so the close returns to the spine. Slide 27 is the "five answered, one to go" recap before the demo.

## Merges and omissions from the brief outline

The brief's 32-slide outline is a list of topics, not a script. What changed:

- The brief's slides 3, 4 and 7 (the Meta story, one line and one working day, what Meta changed) became slides 6 and 7, limited to what the abstract says.
- Omitted: "Terraform on cron: what it looks like in most teams" and "Three failure modes: stuck run, silent drift, shared credentials". No source read this run backs them. The stuck-run case is in the abstract and stays on slide 6.
- Omitted: the "draw your pipeline" audience exercise. It is a facilitation move, not a claim; it goes in the notes of slide 10.
- "Pulumi IaC in two minutes" folded into slide 13, "what runs underneath", "typed SDK" and "pin the version" into slide 13, and "dependencies across the boundary" into slide 15.
- "Pull request previews and review stacks" folded into slide 20.
- Drift: "desired, current and actual state" is slide 24; the CLI and Pulumi Cloud editions are slides 22 and 25.
- Omitted: a slide with the shape of the Pulumi program. The editor shows it in the demo, and the deck stays under its code budget.
- The brief's next steps ("migration with Neo", the `migrating-from-terraform` workshop) go on the Continue your Pulumi journey! slide notes, not on a slide of their own.
- Demo steps 0 and 1 share a slide, as do 2 and 3, to keep Act 3 under a quarter of the deck.

## Rules that bind

- Facts come from the docs listed in `../README.md` under Sources and from the abstract above, read in the run that edits the slide. A doc that is unclear becomes an open question in the pull request, not a guess.
- Every command on a slide is one the demo runs, with the same flags (`../README.md`, "Run the demo"). At most three lines per demo slide, none in Act 1.
- What is not proven live: `pulumi up`, ESC, Deployments, drift and teardown. Slides do not claim these ran; the speaker notes carry the fallbacks.
- No program code outside the demo; at most twenty lines of code and commands in the deck.
- Headlines are claims. Canonical names: Pulumi Neo, Pulumi ESC, Pulumi Cloud, Pulumi IaC, Pulumi console.
- Speaker notes carry the story and a time budget per slide; the budgets add up to 90.

## Skills and sources read for this deck

- workshop-deck, presentation-design, slidev-deck, slidev, and the marketing-web slidev-deck skill (commit 9b37f9afe8c7b0d406f19bc9116b16d5689389ce, read 2026-10-27).
- Reference deck: `../../neo-in-a-docker-sandbox/slides/slides.md` and its `AGENTS.md`.
- Tools: `deck_frame.py` and `deck_patterns.json`, SHA-256 5244a42ae48fef2a174b8a5b65988cf8c991fc6253a1933392e51af72f1d20db and 3fbfed29ba2b29508d6f980c13f0f3c2ed5b24f927dca3559f90580f67edca6a.
- Resource links on the Resources slide were opened on 2026-10-27: Terraform modules, ESC OIDC for AWS, and drift in stack management.

## Check before committing

```bash
python3 ~/.workprentice/workshop-deck/deck_frame.py check .
npm run build && npm run export
```

## Fact-check

Sources read 2026-10-27. Demo-side facts (script behaviour, resource counts, sdks size) come from the demo README and the build-machine runs, not from this table.

| Claim | Source | Read | Outcome |
|---|---|---|---|
| Keynote 1360829 is by Phong Nguyen and Shaun Hopper (Meta), scheduled Wed 2026-11-11, KubeCon + CloudNativeCon NA 2026, Salt Lake City | https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/?id=1360829 | 2026-10-27 | confirmed |
| ~15 engineers run ~100 Kubernetes clusters for AI research and inference | https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/?id=1360829 | 2026-10-27 | confirmed |
| Quote: one-line Helm values change can take a working day in a monolithic Terraform pipeline; one stuck app can block dozens | https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/?id=1360829 | 2026-10-27 | confirmed |
| Quotes: Terraform "exceeds expectations at its job: setting up infra"; "its side gig: deploying the k8s apps"; "Terraform didn't get fired, just reorged" | https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/?id=1360829 | 2026-10-27 | confirmed |
| Kargo and Argo CD take over the apps; routine update live and healthy in minutes; Terraform installs Argo CD | https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/?id=1360829 | 2026-10-27 | confirmed |
| Speaker note "nobody rewrote the Terraform" | https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/?id=1360829 | 2026-10-27 | removed (abstract does not say it; replaced with the reorged quote) |
| Talk not yet given, so slides quote only the abstract | https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/?id=1360829 | 2026-10-27 | confirmed (page lists it as upcoming) |
| hcl package runs a Terraform module as a Pulumi component resource, state in the Pulumi backend | https://www.pulumi.com/registry/packages/hcl/ | 2026-10-27 | confirmed |
| Package installs and manages OpenTofu to run the module; outputs exposed as Pulumi outputs | https://www.pulumi.com/docs/integrations/terraform/modules/ | 2026-10-27 | confirmed |
| `pulumi package add hcl module <source> <version>`; Pulumi.yaml gets a packages entry with source hcl, version 0.18.4, parameters; package named vpc-aws | https://www.pulumi.com/docs/integrations/terraform/modules/ | 2026-10-27 | confirmed |
| terraform-aws-modules/vpc/aws 6.7.3 exists (published 2026-09-18, source terraform-aws-modules/terraform-aws-vpc) | https://registry.terraform.io/modules/terraform-aws-modules/vpc/aws/6.7.3 (read via registry API v1, the page needs JavaScript) | 2026-10-27 | confirmed |
| @pulumi/pulumi 3.272.0, @pulumi/aws 7.51.1, @pulumi/hcl 0.18.4 exist | npm registry, `npm view` | 2026-10-27 | confirmed |
| ESC aws-login provider with OIDC returns short-lived credentials, no long-lived keys to store | https://www.pulumi.com/docs/esc/providers/login/aws-login/ | 2026-10-27 | confirmed |
| Pulumi Cloud issues the OIDC token; identity provider api.pulumi.com/oidc; IAM role trusts it | https://www.pulumi.com/docs/esc/guides/configuring-oidc/aws/ | 2026-10-27 | confirmed |
| `pulumi env setup aws --policy AdministratorAccess` is experimental, needs CLI 3.261.0+, creates provider, role and environment; AdministratorAccess required for Deployments | https://www.pulumi.com/docs/esc/guides/configuring-oidc/aws/ | 2026-10-27 | confirmed |
| Slide card "Valid for the run only" | https://www.pulumi.com/docs/esc/providers/login/aws-login/ | 2026-10-27 | corrected (docs show a session duration, 1h in the example; now "Expire on their own") |
| AWS allows one IAM OIDC provider per URL per account | https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html | 2026-10-27 | confirmed |
| Deployments read the ESC environment imported into the stack | https://www.pulumi.com/docs/deployments/deployments/cloud-credentials/ | 2026-10-27 | confirmed (docs: import the environment into your stack); not proven live |
| Push to deploy: preview on pull request, `pulumi up` on merge to branch; toggles "Run previews for pull requests", "Run updates for pushed commits" | https://www.pulumi.com/docs/deployments/concepts/triggers/ and https://www.pulumi.com/docs/deployments/concepts/settings/source/ | 2026-10-27 | confirmed |
| Deployment settings under Settings > Deploy | https://www.pulumi.com/docs/deployments/concepts/settings/ | 2026-10-27 | confirmed |
| GitHub app install: Settings > Version control > Add account > GitHub; needs admin in both GitHub and Pulumi org; preview posted as PR comment | https://www.pulumi.com/docs/integrations/version-control/github-app/ | 2026-10-27 | confirmed |
| Speaker note "Review stacks and previews live in the pull request" | https://www.pulumi.com/docs/integrations/version-control/github-app/ | 2026-10-27 | corrected (review stacks are a separate feature; now says the preview is a PR comment) |
| Custom executor image under Settings > Deploy > Advanced settings; private ECR not supported | https://www.pulumi.com/docs/deployments/concepts/settings/custom-executor-images/ | 2026-10-27 | confirmed |
| Pre-run commands run shell commands before a deployment (used for the `pulumi install` fallback) | https://www.pulumi.com/docs/deployments/concepts/settings/pre-run-commands/ | 2026-10-27 | confirmed that pre-run commands exist; the fallback itself is unproven and stays hedged |
| "Stack history shows the push as the source" and notes claim | https://www.pulumi.com/docs/integrations/version-control/github-app/ | 2026-10-27 | corrected (docs say CLI sends commit metadata with the update; slide now says history lists the update, notes say source naming is not confirmed live) |
| Free edition includes Pulumi Deployments, IaC state, basic Pulumi ESC, up to 500 workflow minutes; OIDC support on all editions | https://www.pulumi.com/pricing/ | 2026-10-27 | confirmed |
| Drift detection and remediation is Pro and Enterprise (not Free) | https://www.pulumi.com/pricing/ and https://www.pulumi.com/docs/deployments/concepts/drift/ | 2026-10-27 | confirmed |
| `pulumi refresh --preview-only` detects drift; `--expect-no-changes` exits non-zero on drift; `pulumi up --refresh` remediates | https://www.pulumi.com/docs/iac/operations/stack-management/drift/ | 2026-10-27 | confirmed |
| Scheduled drift at Stack > Settings > Schedules > Drift; auto-remediation runs `pulumi up --refresh` | https://www.pulumi.com/docs/deployments/concepts/drift/ | 2026-10-27 | confirmed |
| Drift is the gap between what Pulumi recorded and what the cloud holds | https://www.pulumi.com/docs/iac/operations/stack-management/drift/ | 2026-10-27 | confirmed |
| Demo stack costs nothing while it runs (speaker note) | none found | 2026-10-27 | corrected (now says no instance or NAT charges and that cost was not measured) |
| Pulumi Neo can help with migration | https://www.pulumi.com/docs/iac/guides/migration/migrating-to-pulumi/from-terraform/ | 2026-10-27 | confirmed (docs recommend Neo for converting Terraform code) |
| migrating-from-terraform workshop exists | https://github.com/pulumi/workshops (folder list via gh api) | 2026-10-27 | confirmed |

### Open questions

- Does the Deployments executor run hcl packages (OpenTofu present)? The hcl and modules docs do not say. Step 6 is the test.
- Does the executor regenerate the git-ignored `sdks/` folder? Not documented in the pages read.
- Is a Pro trial available for the presenter to show scheduled drift? The pricing page does not mention a trial.
- The pricing page lists "OIDC and org access tokens" under Essentials but "OIDC support" with a tick on Free in the comparison table. The deck follows the table; confirm the Free edition covers ESC OIDC login before delivery.
- Does stack history name the push as the update source for a Deployments run? Not confirmed.
- up, ESC, Deployments, drift and teardown were not run live (no Pulumi Cloud or AWS on the build machine).
