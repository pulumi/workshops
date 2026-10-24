# kbind: service sharing across clusters

Demo code for a 90-minute workshop: stand up both sides of kbind (formerly kube-bind, a CNCF Sandbox project) with Pulumi IaC. A provider cluster exports a Kubernetes API, and consumer clusters bind it and create objects that the provider receives. The consumer clusters never run the provider's operator.

By the end the participant has two EKS clusters from one Pulumi program family, one exported API (`mangodb`), and a consumer creating `MangoDB` objects that show up on the provider. A second consumer joins without any change to the provider stack.

> **Status of this folder.** The code was written and statically checked (`shellcheck`, `tsc --noEmit`, `npm install`). It has **not** been run against AWS: no cluster, no `pulumi up`, no `kubectl bind`. See [What was and was not run](#what-was-and-was-not-run).

## Layout

```
01-stacks-and-esc/   ESC environment definitions, lib.sh, preflight.sh, setup.sh (stacks, environments, links)
02-provider/         Pulumi project kbind-provider: EKS, kbind backend Helm release, exported API (steps 2 to 4)
05-consumer/         Pulumi project kbind-consumer: a consumer EKS cluster (steps 5 and 8)
06-bind/             kubectl-bind install, bind script, proof commands (step 6)
07-create-object/    one MangoDB object on consumer A, proof on both clusters (step 7)
08-second-consumer/  consumer B end to end, provider stack unchanged (step 8)
09-teardown/         ordered destroy, AWS verification, cleanup (step 9)
fallback/kind/       two local kind clusters with kubectl bind dev create, if AWS is not available
```

Numbered folders follow the demo flow. Steps 2 to 4 share one folder because they are stages of one Pulumi program, switched on with stack config. Every step folder has its own README with the commands it runs and a proof command.

## Prerequisites

- [Pulumi CLI](https://www.pulumi.com/docs/iac/download-install/) **>= 3.200** (`pulumi env` and `pulumi config env`), logged in to Pulumi Cloud. An organization: `pulumi org set-default <org>` or `export KBIND_DEMO_ORG=<org>`.
- An IAM role in your AWS account that trusts the Pulumi Cloud OIDC issuer, with rights for EKS, EC2, IAM and ELB. `export KBIND_AWS_ROLE_ARN=<role arn>`. No static AWS keys.
- Node.js **>= 20** and npm.
- AWS CLI v2 (the EKS kubeconfig calls `aws eks get-token`) and `kubectl`.
- `curl` and `tar`. A browser on the machine that runs `06-bind/bind.sh`: the kbind CLI opens a login page and a local callback.
- Optional: `helm` (only for the OCI fallback in `02-provider/pull-chart.sh`), Docker and `kind` (only for `fallback/kind`).

Check them with `01-stacks-and-esc/preflight.sh`.

## Run the demo

Steps run in order. Every script prints each command before it runs it, and these are the commands the slides show.

```bash
01-stacks-and-esc/preflight.sh
01-stacks-and-esc/setup.sh                 # step 1: provider-dev and consumer-a-dev
02-provider/deploy.sh cluster              # step 2: EKS
02-provider/check.sh cluster
02-provider/deploy.sh backend              # step 3: kbind backend, phase one
02-provider/deploy.sh address              # step 3b: phase two, externalAddress
02-provider/check.sh backend
02-provider/deploy.sh export               # step 4: exported API
02-provider/check.sh export
05-consumer/deploy.sh                      # step 5: consumer-a-dev
05-consumer/check.sh
06-bind/install-plugin.sh                  # step 6: kubectl-bind 0.8.1
06-bind/bind.sh
06-bind/check.sh
07-create-object/create.sh                 # step 7
08-second-consumer/run.sh                  # step 8
08-second-consumer/check.sh
09-teardown/teardown.sh                    # step 9
09-teardown/verify.sh
09-teardown/cleanup.sh
```

Cluster creation takes several minutes per cluster. Set `KBIND_DEMO_YES=1` to skip the confirmation prompts of `pulumi up`, `pulumi destroy` and `pulumi env rm` in rehearsals. `pulumi config env add` always asks: the setup script never passes `--yes` to it.

## Pins

| Item | Pin |
| --- | --- |
| kbind backend chart | `oci://ghcr.io/kbind-dev/charts/backend` version `0.8.1` |
| Backend image | `ghcr.io/kbind-dev/backend:v0.8.1` (set as `backend.image.repository` and `backend.image.tag`) |
| Konnector image | `ghcr.io/kbind-dev/konnector:v0.8.1` (`--konnector-image`) |
| kubectl-bind | release v0.8.1 tarball, checksum verified |
| `@pulumi/eks` | 4.4.0 (exact) |
| `@pulumi/aws` | 7.51.1 (exact) |
| `@pulumi/kubernetes` | 4.34.2 (exact) |
| Kubernetes on EKS | 1.35 |
| Region | eu-central-1 |
| Nodes | managed node group, 2 x t3.medium, public subnets |

## What was and was not run

Run in the build environment (no AWS, no cluster):

- `shellcheck -x -S warning` on every script: clean.
- `npm install` and `npx tsc --noEmit` in `02-provider` and `05-consumer`: clean.
- `helm pull oci://ghcr.io/kbind-dev/charts/backend --version 0.8.1` and `helm template` with the values the component sets: the chart renders and the Service is named `backend`.

**Not run:** `pulumi preview`/`up`/`destroy`, the ESC environments (OIDC login), the EKS clusters, the Pulumi Helm Release against the OCI chart, the kbind backend on a cluster, `kubectl bind login`, `kubectl bind`, the konnector, object sync, the teardown and AWS verification, `fallback/kind`. Every output described in the step READMEs is what the command is expected to show, not something observed here. Run the whole flow once before presenting.

## Open points

1. **mangodb example location.** The brief says the mangodb example files are in `deploy/examples`. In v0.8.1 they are not: the example exists only as a template inside the backend chart (`examples.enabled`). The component therefore declares the CRD (labelled `kube-bind.io/exported: "true"`) and the `APIServiceExportTemplate` itself, as Pulumi resources in `02-provider/mangodb.ts`, using the chart template's content. A `Collection` named `mangodb` is added (not part of the chart template; v0.8.1 ships a Collection example only for cowboys and sheriffs). The chart's own `examples.enabled` stays off, so the two do not collide.
2. **Image repository.** The chart default `ghcr.io/kube-bind/backend` is not pullable anonymously (403), and the default tag is `0.8.1` without `v`. The component always sets `backend.image.repository=ghcr.io/kbind-dev/backend` and `backend.image.tag=v0.8.1`. The konnector image is hard-coded to the same unreachable repository in v0.8.1; `bind.sh` passes the hidden `--konnector-image` flag. The backend's one-click konnector path in the web UI is not covered by that flag.
3. **OCI chart in the Pulumi Helm Release.** The Pulumi docs for `kubernetes.helm.v3.Release` show only `repositoryOpts.repo` examples and do not mention `oci://`. The component passes the OCI URL as `chart`. If preview or up rejects it, run `02-provider/pull-chart.sh`: it pulls the chart to `02-provider/.state/chart/backend` and sets `chartPath`, which the component then uses.
4. **Two-phase address.** The backend needs its own external address and OIDC callback URL, which exist only after the load balancer has a hostname. Phase one installs without them; `deploy.sh address` reads `backendHost`, sets `externalAddress` and updates the release. The callback path is `/api/callback`; confirm it against the live backend on the first run.
5. **Load balancer.** The chart has no annotation values for the Service. The default Service type `LoadBalancer` is used; `loadBalancerType` (`nlb` default, `clb`) is handled through a Service patch in the component. Verify the result with `02-provider/check.sh backend`.
6. **Binding is interactive.** `kubectl bind` opens a web UI and a browser sign-in. Whether `kubectl bind apiservice` can bind non-interactively with templates in v0.8.1 was not verified, so step 6 is a browser step.
7. **Newer releases.** Stable v0.8.2 exists (chart 0.8.2 resolves) but its images are not published under the v0.8.2 tag, so the pin stays 0.8.1. There is no stable v2.0.0 (latest is the v2.0.0-rc7 prerelease, and there is no matching chart tag).
8. **Plugin docs.** The v0.8.1 docs still point at `github.com/kube-bind/kube-bind`; the repository now lives at `github.com/kbind-dev/kbind`, which is where the scripts download from.

## Sources

Read 2026-10-23 and 2026-10-24:

- https://github.com/kbind-dev/kbind (releases, v0.8.1 docs and source)
- https://www.pulumi.com/docs/esc/providers/pulumi-stacks/
- https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/aws-login/
- https://www.pulumi.com/docs/iac/cli/commands/pulumi_config_env_add/
- https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v3/release/
- https://www.pulumi.com/registry/packages/eks/api-docs/cluster/
