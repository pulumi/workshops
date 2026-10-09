# Monitoring as code on Google Cloud: SLOs, burn-rate alerts and a policy that blocks unmonitored services

A 90-minute Pulumi workshop. You describe the availability of a Cloud Run service as a request-based SLO, add fast and slow burn-rate alert policies, a log-based metric and a dashboard, and package all of it as one Pulumi IaC component. A unit test and a Pulumi Policies rule then stop any stack that has a custom service without an alert policy. Credentials come from Pulumi ESC through OIDC, so no service account key sits on disk.

> Every service gets alerts when someone remembers to add them. The services nobody remembered fail silently. This session turns the alerts into code you can test, reuse and enforce, so a service without an alert policy cannot be deployed.
>
> Workshop page: not published yet

## Sessions and speakers

| Session | Date | Length |
|---|---|---|
| To be decided | TBD | 90 min (slides about 35, demo about 50, questions 5) |

Speakers: TBD.

## What attendees learn

1. Deploy a Cloud Run service and describe its availability as a request-based SLO (a goal over a rolling period) in Pulumi code.
2. Create burn-rate alert policies on that SLO and explain what a burn rate above 1 means.
3. Add a log-based metric that counts application errors and chart it on a dashboard defined in `dashboardJson`.
4. Package the custom service, SLO, alert policies, notification channel, log metric and dashboard as one Pulumi IaC component, and consume it with the few settings `04-component/index.ts` takes.
5. Write a unit test and a Pulumi Policies rule that fail when a stack has a custom service without an alert policy.
6. Break the service on purpose, watch the burn rate rise, and read the alert.

## Layout

```
gcp-monitoring-alert-policy/
├── .gitignore                                ignores working documents; allows README.md, AGENTS.md, slides/slides.md
├── .shellcheckrc                             shellcheck settings for the scripts
├── 00-setup/
│   ├── enable-apis.sh                        enable the Cloud Run, Cloud Monitoring and Cloud Logging APIs
│   └── lib.sh                                helpers the scripts source (require, require_var)
├── 01-esc/
│   ├── create-env.sh                         step 1: create or update the ESC environment
│   └── gcp-oidc.yaml                         step 1: ESC environment with fn::open::gcp-login (edit the placeholders)
├── 02-service/
│   ├── .gitignore                            ignores bin, dist, node_modules, .state
│   ├── AGENTS.md                             conventions for agents editing this project
│   ├── Pulumi.dev.yaml                       dev stack config, imports the ESC environment
│   ├── Pulumi.yaml                           Pulumi project file
│   ├── index.ts                              step 2: Cloud Run service on the echo image
│   ├── package-lock.json                     lockfile
│   ├── package.json                          dependencies, pinned
│   └── tsconfig.json                         TypeScript settings
├── 03-inline/
│   ├── .gitignore                            ignores bin, dist, node_modules, .state
│   ├── AGENTS.md                             conventions for agents editing this project
│   ├── Pulumi.dev.yaml                       dev stack config, imports the ESC environment
│   ├── Pulumi.yaml                           Pulumi project file
│   ├── dashboard.ts                          step 5: dashboardJson for the dashboard
│   ├── index.ts                              steps 3 to 5: SLO, alert policies, log metric (stage switch)
│   ├── package-lock.json                     lockfile
│   ├── package.json                          dependencies, pinned
│   └── tsconfig.json                         TypeScript settings
├── 04-component/
│   ├── .gitignore                            ignores bin, dist, node_modules, .state
│   ├── AGENTS.md                             conventions for agents editing this project
│   ├── Pulumi.dev.yaml                       dev stack config, imports the ESC environment
│   ├── Pulumi.yaml                           Pulumi project file
│   ├── dashboard.ts                          step 6: dashboardJson used by the component
│   ├── index.ts                              step 6: consumes the component
│   ├── monitoring.ts                         step 6: the ServiceMonitoring component
│   ├── package-lock.json                     lockfile
│   ├── package.json                          dependencies, pinned
│   ├── test/
│   │   ├── helpers.ts                        step 7: mocks for the unit tests
│   │   ├── monitoring.test.ts                step 7: tests that pass
│   │   └── plain.test.ts                     step 7: test that fails by design
│   └── tsconfig.json                         TypeScript settings
├── 05-policy/
│   ├── .gitignore                            ignores bin, dist, node_modules, .state
│   ├── AGENTS.md                             conventions for agents editing this project
│   ├── PulumiPolicy.yaml                     step 8: policy pack metadata
│   ├── index.ts                              step 8: the policy pack (mandatory)
│   ├── package-lock.json                     lockfile
│   ├── package.json                          dependencies, pinned
│   ├── rules.ts                              step 8: the rule logic, shared with the test
│   ├── test/
│   │   └── rules-test.ts                     step 8: policy unit tests
│   └── tsconfig.json                         TypeScript settings
├── 06-break/
│   └── send-requests.sh                      step 9: send good or failing requests
├── 07-teardown/
│   └── teardown.sh                           step 10: destroy, remove the stack, check nothing is left
├── AGENTS.md                                 conventions for agents (and humans) editing this folder
└── README.md                                 this file
```

The numbered folders follow the demo flow. `slides/` is not in this folder yet; see [Run the slides](#run-the-slides).

## Prerequisites

Participants:

- A Google Cloud project with billing enabled, or a presenter-provided project. The Cloud Run, Cloud Monitoring and Cloud Logging APIs must be enabled (`00-setup/enable-apis.sh` does that).
- A [Pulumi Cloud](https://app.pulumi.com/signup) account (free).
- Pulumi CLI 3.268.0, Node.js (current LTS), the `gcloud` CLI, `curl` and a code editor.
- Pulumi Cloud policy groups are not needed; the demo uses `--policy-pack` locally.

Presenter, before the session:

- A Google Cloud workload identity pool, provider and service account for Pulumi ESC, and the ESC environment from `01-esc`. [Configuring OIDC for Google Cloud](https://www.pulumi.com/docs/esc/environments/configuring-oidc/gcp/) describes the setup. The `pulumi env setup gcp` command can create the Google Cloud side (see Run the demo; it is experimental and was not run for this folder).
- The component deployed once on the day as a dry run.
- The failure loop of step 9 started at least 15 minutes before it is shown, so the alert has fired.

Pinned versions: `@pulumi/pulumi` 3.268.0, `@pulumi/gcp` 10.1.0, `@pulumi/policy` 1.21.0. The policy pack's `tsconfig.json` sets `skipLibCheck` because the `proxy.d.ts` file in `@pulumi/policy` 1.21.0 is empty and fails type checking otherwise.

## Run the slides

`slides/` arrives in a follow-up commit on this branch. This section will hold the Slidev commands then.

## Run the demo

The demo is ten steps. Steps 0 and 1 are done once. Steps 2 to 9 build on each other; every project folder has its own `dev` stack. The demo region is `europe-west3` (Frankfurt), set in each `Pulumi.dev.yaml`.

```bash
# Once only: Google Cloud APIs, then the ESC environment
GCP_PROJECT_ID=<id> 00-setup/enable-apis.sh
pulumi env setup gcp --org <org> --policy roles/editor --project-id <id>   # experimental, creates the OIDC trust
# edit 01-esc/gcp-oidc.yaml: project number, pool, provider, service account
PULUMI_ORG=<org> 01-esc/create-env.sh                                       # step 1

# Per project folder (02-service, 03-inline, 04-component), once
npm install
pulumi stack init dev
pulumi config set gcp:project <id>

# Step 2, in 02-service: a service to watch
pulumi up
curl "$(pulumi stack output url)"                                           # 200
curl "$(pulumi stack output url)?x-set-response-status-code=500"            # 500

# Steps 3 to 5, in 03-inline: SLO, then alert policies, then log metric and dashboard
pulumi config set stage slo     && pulumi up
pulumi config set stage alerts  && pulumi up
pulumi config set stage full    && pulumi up

# Step 6, in 04-component: the same monitoring as a component
pulumi preview          # if the stack came from 03-inline, first: pulumi config set adoptInline true

# Step 7, in 04-component: unit tests
npm test                # passes
npm run test:plain      # fails by design: a custom service with no alert policy

# Step 8, in 05-policy: the policy pack
npm install
npm test
# in 03-inline with stage=slo (no alert policy yet): blocked
pulumi preview --policy-pack ../05-policy
# in 04-component: passes
pulumi preview --policy-pack ../05-policy

# Step 9: break the service on purpose, at least 15 minutes before showing the alert
06-break/send-requests.sh <url> fail 200
```

`<url>` is the output of `pulumi stack output url`. Without the `fail` argument the script sends successful requests. Commands under steps 2 to 8 run inside the folder named in the comment; the `06-break` and setup scripts run from this folder.

Between runs: run `pulumi config set stage slo` in `03-inline` and `pulumi up` to return to the SLO-only state, or tear down and start again. The component and the inline project describe the same resources, so deploy only one of them per Google Cloud project at a time, or use `adoptInline` as in step 6.

### Teardown and cost

```bash
PULUMI_ORG=<org> GCP_PROJECT_ID=<id> 07-teardown/teardown.sh 04-component dev
```

The script runs `pulumi destroy` and `pulumi stack rm` through the ESC environment, then lists Cloud Run services and alert policies named `hello-api`. Both lists must come back empty. Use `03-inline` as the folder argument if that is what you deployed.

The demo creates one Cloud Run service, one custom service with an SLO, two alert policies, one email channel, one log-based metric and one dashboard. Check current prices before a larger run: [Cloud Monitoring pricing](https://cloud.google.com/stackdriver/pricing) and [Cloud Run pricing](https://cloud.google.com/run/pricing). The brief notes that Cloud Monitoring alerting becomes billable no sooner than 2027-09-01.

### Not verified live

Nothing in this folder has run against real Google Cloud. The `gcloud`-based scripts were only run through `shellcheck`. These points are unproven until the first live `pulumi preview` and `pulumi up`:

- The nested `requestBasedSli.goodTotalRatio` shape and the Cloud Run request filter of the `Slo`.
- The burn-rate filter string `select_slo_burn_rate(...)` and the alert `duration` of `0s`.
- That `adoptInline` in step 6 updates the state without replacing resources.
- That Cloud Run pulls `docker.io/mendhak/http-https-echo:42` and that the `x-set-response-status-code` switch works there.
- `pulumi env setup gcp` is experimental and was not run.

## Sources

Facts in this folder come from these pages, read on 2026-10-09:

- Pulumi ESC gcp-login provider: https://www.pulumi.com/docs/esc/providers/login/gcp-login/
- Pulumi ESC OIDC for Google Cloud: https://www.pulumi.com/docs/esc/environments/configuring-oidc/gcp/
- `pulumi env setup gcp`: https://www.pulumi.com/docs/iac/cli/commands/pulumi_env_setup_gcp/
- Registry `gcp.monitoring.Slo`: https://www.pulumi.com/registry/packages/gcp/api-docs/monitoring/slo/
- Registry `gcp.cloudrunv2.Service`: https://www.pulumi.com/registry/packages/gcp/api-docs/cloudrunv2/service/
- Unit testing Pulumi programs: https://www.pulumi.com/docs/iac/guides/testing/unit/
- Authoring policy packs: https://www.pulumi.com/docs/insights/policy/policy-packs/authoring/
- Echo image: https://github.com/mendhak/docker-http-https-echo
- Cloud Run, deploying container images: https://cloud.google.com/run/docs/deploying
- Cloud Monitoring pricing: https://cloud.google.com/stackdriver/pricing
- Cloud Run pricing: https://cloud.google.com/run/pricing
