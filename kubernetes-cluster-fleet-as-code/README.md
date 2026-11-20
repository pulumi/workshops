# Run a Kubernetes cluster fleet as code: one component, one stack per cluster, staged upgrades with Pulumi

A 90-minute workshop. You build a fleet of three Azure Kubernetes Service (AKS)
clusters as code. One Pulumi IaC component describes a cluster and its baseline,
and each cluster is its own stack. The Pulumi Automation API provisions the
stacks in waves, one canary cluster first and then the rest. Pulumi ESC holds the
shared and per-cluster configuration and the Azure OIDC login. A Pulumi Policies
pack blocks clusters that break the fleet baseline. Azure Kubernetes Fleet
Manager then upgrades Kubernetes in two stages, and you destroy the whole fleet
at the end.

> Platform teams that run more than a handful of clusters need every cluster
> created, configured and upgraded the same way every time. This workshop
> builds that for three clusters and shows where each tool stops.
>
> The workshop page is not published yet.

## Sessions and speakers

Dates are not announced yet. Speakers are not announced yet. The format is 90
minutes: about 30 minutes of slides, 50 minutes of demo and 10 minutes of
questions, for intermediate platform and DevOps engineers who already run Pulumi
or Terraform.

## What attendees learn

1. Write one Pulumi IaC component that creates an AKS cluster, joins it to a fleet and applies a baseline, and instantiate it once per stack.
2. Provision several cluster stacks in waves from a Node.js program with the Pulumi Automation API: inline programs, `createOrSelectStack`, `setConfig`, `preview`, `up`, `outputs`.
3. Compose Pulumi ESC environments (one shared, one per cluster with `imports`), attach them to stacks with the `environment` key, and issue the Azure credentials over OIDC.
4. Write a Pulumi Policies pack in TypeScript that enforces the fleet baseline, and run it against `preview`.
5. Define a Fleet Manager update strategy with two stages, run it to upgrade Kubernetes across the fleet, then reconcile the Pulumi stacks.
6. Tear the fleet down in the right order.

## Layout

```
kubernetes-cluster-fleet-as-code/
├── README.md            this file
├── AGENTS.md            conventions for agents (and humans) editing this folder
├── 01-subscription/     step 1: Entra app registration with a federated credential for ESC (prepare.sh), and its removal (cleanup.sh)
├── 02-esc/              step 2: create the four ESC environments (create.sh), remove them in step 9 (delete.sh)
├── 03-fleet-core/       step 3: Pulumi project fleet-core: resource group, hubless fleet, update strategy two-waves
├── 04-fleet-policies/   step 4: Pulumi Policies pack fleet-baseline, its tests, and try-bad-version.sh
├── 05-fleet-cluster/    steps 5, 6, 8, 9: the FleetCluster component, one stack per cluster, and the Automation API driver rollout.ts
└── 06-update-run/       step 7: Pulumi project fleet-update (UpdateRun), start.sh and the az fallback
```

The numbered folders follow the demo flow. The Automation API driver lives next
to the component, in `05-fleet-cluster/`, because an inline program has to load
the same copy of `@pulumi/pulumi` as the component it runs. Steps 5, 6, 8 and 9
are one driver with four commands: `wave 1`, `wave 2`, `reconcile` and `destroy`.
Step 9 also uses `06-update-run/`, `03-fleet-core/`, `02-esc/delete.sh` and
`01-subscription/cleanup.sh`, in that order.

## Prerequisites

Participants:

- An Azure subscription with quota for 6 vCPUs in the DSv5 family in westeurope, and rights to create a Microsoft Entra app registration and a role assignment.
- A [Pulumi Cloud](https://app.pulumi.com/signup) account.
- Pulumi CLI 3.277.0, Node.js 24.22.3, the Azure CLI (with the `fleet` extension, which `06-update-run/` adds when it is missing), kubectl.

Presenter, in addition:

- A Pulumi Cloud organization where Pulumi ESC and Pulumi Policies are usable. Which edition the organization needs is an open question (see the pull request).
- The app registration from step 1, a dry run of steps 1 to 9 the day before, and a recorded run of step 7 as backup.

Export `PULUMI_ORG` (your Pulumi Cloud organization) before any script in this
folder. The Pulumi project `fleet-cluster` and its stacks use Pulumi Cloud as the
state backend, because ESC environments can only be attached to stacks stored there.

## Run the slides

The deck is a Slidev deck in `slides/`, built from the demo flow below. The demo
steps on the slides are the commands in the table in the next section.

```bash
cd slides
npm install
npm run dev      # present from slides.md
npm run build    # static build into dist/
npm run export   # export to PDF (needs Playwright's Chromium)
```

## Run the demo

The demo has nine steps. Steps 1 and 2 are the once-only setup; steps 3 to 8 are
the run; step 9 resets everything. After step 9 the whole demo can start again at step 1.
All commands run from this folder.

| Step | What | Command | End state |
|---|---|---|---|
| 1 | Prepare the subscription | `01-subscription/prepare.sh`, then export the three values it prints | App registration with a federated credential and Contributor on the subscription. Proof comes after step 2 creates the base environment: `pulumi env open $PULUMI_ORG/fleet/azure-base` returns the `ARM_*` values |
| 2 | Create the ESC environments | `02-esc/create.sh` | Four environments exist. `pulumi env open $PULUMI_ORG/fleet/canary-1` shows the merged config |
| 3 | Deploy the fleet core | `cd 03-fleet-core && npm ci && pulumi stack init $PULUMI_ORG/fleet && pulumi up` | Fleet `fleet-workshop` and strategy `two-waves` exist: `az fleet show --resource-group rg-fleet-workshop --name fleet-workshop` |
| 4 | Break the baseline on purpose | `(cd 04-fleet-policies && npm ci) && (cd 05-fleet-cluster && npm ci) && 04-fleet-policies/try-bad-version.sh` | The preview fails with the mandatory violation of `aks-supported-version`. The script puts 1.35 back |
| 5 | Wave 1: the canary | `cd 05-fleet-cluster && npm run build && node bin/rollout.js wave 1` | One AKS cluster at 1.35 in the fleet, group `canary`, namespace `platform` present, outputs printed |
| 6 | Wave 2: the rest | `node bin/rollout.js wave 2` | `rest-1` and `rest-2` created in parallel: `az fleet member list --resource-group rg-fleet-workshop --fleet-name fleet-workshop -o table` shows three members in two groups, all at 1.35 |
| 7 | Upgrade with an update run | `cd 06-update-run && npm ci && pulumi stack init $PULUMI_ORG/upgrade && pulumi up && ./start.sh` | Canary reaches 1.36, the run waits 60 seconds, then both rest clusters reach 1.36, and the run reports Completed |
| 8 | Reconcile | `cd 05-fleet-cluster && node bin/rollout.js reconcile --version 1.36` | Refresh, then 1.36 in the ESC environments, then preview: no diff on all three stacks |
| 9 | Tear down | see below | The resource group is gone, `az aks list` returns nothing, no ESC environment and no app registration is left |

Teardown, in this order, because each stack needs the ESC environment and the fleet that come after it:

```bash
(cd 06-update-run && pulumi destroy --stack "$PULUMI_ORG/upgrade")
(cd 05-fleet-cluster && node bin/rollout.js destroy)     # rest-1 and rest-2 in parallel, then canary-1
(cd 03-fleet-core && pulumi destroy --stack "$PULUMI_ORG/fleet")
02-esc/delete.sh
01-subscription/cleanup.sh
```

Cost: three clusters with one Standard_D2ds_v5 node each for three hours cost 3 x 3 x
$0.136 = $1.22 in westeurope. Each cluster also gets a managed outbound public IP
(Standard IPv4 static, $0.005 per hour) and a Standard load balancer ($0.025 per hour
for the included rules), which adds $0.27 for the same nine cluster-hours: about
$1.49 in total. These are retail list prices read from the Azure retail price API
on 2026-11-20. OS disks, data processed and any extra outbound IPs are not
priced here, and the figure has not been confirmed in the Azure Pricing Calculator.
The AKS Free tier and a fleet without a hub add no charge. Run step 9 when you are done.

Fallbacks:

- If the UpdateRun resource misbehaves, run `06-update-run/fallback-az.sh` instead of `pulumi up` in that folder. It creates and starts the same run with `az fleet updaterun create` and `start`.
- If Standard_D2ds_v5 has no capacity in westeurope, run `LOCATION=swedencentral 02-esc/create.sh`. The region lives only in the `fleet/azure-base` environment.
- The demo never changes an agent pool after the cluster exists: the registry page says `agentPoolProfiles` cannot be updated directly.
- The Automation API is marked Alpha in the Node.js reference. Say so on the slide.

Offline checks that need no Azure account are in [`AGENTS.md`](AGENTS.md). With a local backend,
`node bin/rollout.js wave 1 --offline --preview-only` previews a cluster stack without ESC.

## Sources

All pages were read on 2026-11-20 unless stated otherwise.

- Sessions: [KubeCon + CloudNativeCon North America 2026, "N Clusters, One kubectl"](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/?id=1247848) (read 2026-10-26); [KubeCon + CloudNativeCon Japan 2026, "Don't Start With 500 Clusters"](https://kubecon-cloudnativecon-japan-2026.sessionize.com/session/1191836)
- Pulumi registry, azure-native containerservice: [ManagedCluster](https://www.pulumi.com/registry/packages/azure-native/api-docs/containerservice/managedcluster/), [Fleet](https://www.pulumi.com/registry/packages/azure-native/api-docs/containerservice/fleet/), [FleetMember](https://www.pulumi.com/registry/packages/azure-native/api-docs/containerservice/fleetmember/), [FleetUpdateStrategy](https://www.pulumi.com/registry/packages/azure-native/api-docs/containerservice/fleetupdatestrategy/), [UpdateRun](https://www.pulumi.com/registry/packages/azure-native/api-docs/containerservice/updaterun/), [listManagedClusterUserCredentials](https://www.pulumi.com/registry/packages/azure-native/api-docs/containerservice/listmanagedclusterusercredentials/)
- Pulumi docs: [Automation API](https://www.pulumi.com/docs/iac/concepts/automation-api/), [LocalWorkspace](https://www.pulumi.com/docs/reference/pkg/nodejs/pulumi/pulumi/classes/automation.LocalWorkspace.html), [Stack](https://www.pulumi.com/docs/reference/pkg/nodejs/pulumi/pulumi/classes/automation.Stack.html), [components](https://www.pulumi.com/docs/iac/concepts/components/), [build a component](https://www.pulumi.com/docs/iac/guides/building-extending/components/build-a-component/), [Azure login for ESC](https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/azure-login/), [configuring OIDC for Azure](https://www.pulumi.com/docs/esc/environments/configuring-oidc/azure/), [ESC with Pulumi IaC](https://www.pulumi.com/docs/esc/integrations/infrastructure/pulumi-iac/), [ESC imports](https://www.pulumi.com/docs/esc/environments/imports/), [`pulumi env init`](https://www.pulumi.com/docs/iac/cli/commands/pulumi_env_init/), [`pulumi env set`](https://www.pulumi.com/docs/iac/cli/commands/pulumi_env_set/), [`pulumi config env add`](https://www.pulumi.com/docs/iac/cli/commands/pulumi_config_env_add/), [write a policy pack](https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/), [enforce policy as code](https://www.pulumi.com/docs/discovery-governance/get-started/enforce-policy-as-code/)
- Microsoft Learn: [supported Kubernetes versions](https://learn.microsoft.com/en-us/azure/aks/supported-kubernetes-versions), [Free and Standard tiers](https://learn.microsoft.com/en-us/azure/aks/free-standard-pricing-tiers), [Fleet Manager overview](https://learn.microsoft.com/en-us/azure/kubernetes-fleet/overview), [choosing a fleet type](https://learn.microsoft.com/en-us/azure/kubernetes-fleet/concepts-choosing-fleet), [update orchestration concepts](https://learn.microsoft.com/en-us/azure/kubernetes-fleet/concepts-update-orchestration), [update orchestration how-to](https://learn.microsoft.com/en-us/azure/kubernetes-fleet/update-orchestration), [`az fleet updaterun`](https://learn.microsoft.com/en-us/cli/azure/fleet/updaterun)
- Versions: [npm registry](https://registry.npmjs.org/), [pulumi/pulumi releases](https://api.github.com/repos/pulumi/pulumi/releases/latest), [Node.js releases](https://nodejs.org/dist/index.json)
- Prices: [Azure retail prices API](https://prices.azure.com/api/retail/prices)
