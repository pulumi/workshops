# AGENTS.md - kbind-service-sharing-across-clusters

Guidance for coding agents (and humans) working in this workshop folder of `pulumi/workshops`.

## What this folder is

The demo code for the workshop on sharing Kubernetes APIs across clusters with kbind and Pulumi IaC. See `README.md` for the layout, the pins and the open points.

The repo carries what an attendee or a future presenter needs: the demo code and these notes. Working documents stay on the presenter's machine; `.gitignore` keeps every `*.md` out except `README.md`, `AGENTS.md`, the step READMEs (`0*/README.md`, `fallback/kind/README.md`) and `slides/slides.md`. A new working document is ignored by default; that is deliberate, do not force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders in this repo.
- Facts about Pulumi IaC, Pulumi ESC and Pulumi Cloud come from pulumi.com/docs read in the current run. kbind facts come from the kbind-dev/kbind repository at the pinned tag. If a source is unclear, write the question in `README.md` under "Open points" instead of guessing.
- Canonical names: Pulumi IaC, Pulumi ESC, Pulumi Cloud, Pulumi Neo, Pulumi console (lowercase console). Never "Copilot", "Pulumi Service", "Insights", "CrossGuard".
- Every command shown on a slide or in a step README is a command a script here runs, with the same flags. Change the script and the README together.
- Never pass `--yes` to `pulumi config env add`. Mutating commands ask unless `KBIND_DEMO_YES=1`.
- Pins live in `01-stacks-and-esc/lib.sh` (shell) and `package.json` / `02-provider/kbind-provider.ts` (TypeScript). Change all places together.
- Conventional Commits scoped to this folder, e.g. `feat(kbind-service-sharing-across-clusters): ...`.
- Do not commit credentials, `node_modules/`, `.state/`, kubeconfigs or Pulumi state. Kubeconfig outputs are secrets and are written only to `.state/`.

## Checks

```bash
shellcheck -x $(find . -name '*.sh' -not -path '*/node_modules/*')
(cd 02-provider && npm install && npx tsc --noEmit)
(cd 05-consumer && npm install && npx tsc --noEmit)
```

Neither check proves the demo works; that needs AWS and a run of every step.

## Story

1. The moment: the kbind project's own sentence, "While Kubernetes has amazing ecosystem, it lacks a native way to provide APIs as services." (kbind.dev, read 2026-10-24). No incident or quote found.
2. The tension: "One service. Many clusters."
3. Why it is hard: a CRD alone is only a schema; something must act on it, and consumers should not run that operator.
4. The questions: who provides the API, what is shared, how a consumer binds, which credentials each side holds, how the next consumer is added, where the object lives.
5. The way out: kbind exports the API, the konnector syncs it, Pulumi IaC builds the clusters, Pulumi ESC and Pulumi Cloud carry credentials and outputs.
6. The close: four questions answered by slides, two by the demo, then the recap.

## Fact-check

Read 2026-10-24. No incident or practitioner quote was found for this topic; the Act 1 moment is the project's own published sentence. No AWS EKS, NLB or Helm claims appear on the slides beyond "a Helm release" and "a load balancer address".

| Claim | Source | Date read | Outcome |
|---|---|---|---|
| Act 1 moment: 'Kubernetes lacks a native way to provide APIs as services' is the project's own sentence (site text: 'While Kubernetes has amazing ecosystem, it lacks a native way to provide APIs as services.') | https://kbind.dev/ | 2026-10-24 | confirmed (notes now quote the grammar exactly) |
| Goal: a service provider who can securely provide centrally operated kube-native services | https://kbind.dev/ | 2026-10-24 | changed (notes said Kubernetes-native; now quotes kube-native) |
| kbind is a CNCF Sandbox project | https://kbind.dev/ | 2026-10-24 | confirmed |
| kbind was formerly kube-bind | https://kbind.dev/ | 2026-10-24 | confirmed |
| Rename happened this year (2026) | https://github.com/cncf/sandbox/issues/464 | 2026-10-24 | confirmed (rename comment 2026-04-16) |
| CNCF sandbox vote passed 2026-03-12, 8 in favour, 0 against | https://github.com/cncf/sandbox/issues/464 | 2026-10-24 | confirmed |
| v2.0.0-rc7 pre-release on 2026-08-20; release candidates rc2 to rc7 | https://github.com/kbind-dev/kbind/releases | 2026-10-24 | confirmed |
| v0.8.2 is latest stable, 2026-07-03; v0.8.1 exists (2026-05-18) | https://github.com/kbind-dev/kbind/releases | 2026-10-24 | confirmed |
| Provider exports APIs; consumer imports; konnector connects, syncs, handles permissions | https://docs.kbind.dev/main/usage/ | 2026-10-24 | confirmed |
| Consumer authenticates through OAuth2 flows | https://docs.kbind.dev/main/usage/ | 2026-10-24 | confirmed |
| Provider exports CRDs plus permission claims | https://docs.kbind.dev/main/ | 2026-10-24 | confirmed |
| Provider does not run an operator in the consumer; consumer has the CRD (S8, S14) | https://docs.kbind.dev/main/ | 2026-10-24 | changed (S8 note reworded to the docs home page text: no controllers or operators injected) |
| Four-step binding on the slide folds the docs' five steps; step 5 is bidirectional sync via konnector agents | https://docs.kbind.dev/main/usage/api-concepts/ | 2026-10-24 | confirmed |
| Object names: APIServiceExportTemplate, APIServiceExportRequest, APIServiceBinding, APIServiceNamespace | https://docs.kbind.dev/main/usage/api-concepts/ | 2026-10-24 | confirmed |
| Owners: template = provider, request = consumer, namespace mapping = konnector | https://docs.kbind.dev/main/usage/api-concepts/ | 2026-10-24 | confirmed |
| APIServiceBinding applies the CRD on the consumer | https://docs.kbind.dev/main/usage/api-concepts/ | 2026-10-24 | changed (docs: created automatically by consumer konnector agents; slide row now says Konnector) |
| Permission claims on the template select extra resources, by label or by name | https://docs.kbind.dev/main/usage/api-concepts/ | 2026-10-24 | confirmed |
| Three isolation modes: Prefixed (consumer id prefix), Namespaced (dedicated namespaces), None (dedicated provider cluster) | https://docs.kbind.dev/main/usage/api-concepts/ | 2026-10-24 | confirmed |
| API version is v1alpha2 | https://docs.kbind.dev/main/usage/api-concepts/ | 2026-10-24 | changed (slide said API group; v1alpha2 is the version, group is kube-bind.io) |
| Embedded OIDC server accepts any credentials, development only (S33 note, S33 slide 'development OIDC page') | https://docs.kbind.dev/main/setup/helm/ | 2026-10-24 | changed (no source for any-credentials; docs confirm embedded OIDC exists and production needs a real OIDC provider; slide now says embedded OIDC page) |
| kubectl bind login and kubectl bind --konnector-image in the bind step | 06-bind/bind.sh in the demo folder (read 2026-10-24) | 2026-10-24 | confirmed against script |
| A component is a logical grouping of resources exposed as a single resource; children nested under it in the tree | https://www.pulumi.com/docs/iac/concepts/resources/components/ | 2026-10-24 | confirmed |
| ESC aws-login: OIDC is the recommended way; Pulumi Cloud exchanges a short-lived token for temporary AWS credentials via an IAM role; no long-lived keys | https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/aws-login/ | 2026-10-24 | confirmed |
| Environment requests a one hour duration and sets AWS environment variables for the Pulumi AWS provider | https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/aws-login/ | 2026-10-24 | confirmed |
| pulumi-stacks provider: stack named project/stack; outputs resolve under the stack name | https://www.pulumi.com/docs/esc/providers/pulumi-stacks/ | 2026-10-24 | confirmed |
| Linking an environment uses pulumi config env add and asks for confirmation; script never passes --yes | 01-stacks-and-esc/setup.sh (demo folder) | 2026-10-24 | confirmed against script |
| Prerequisites: Pulumi CLI 3.200 or newer, Node.js 20, AWS CLI v2, kubectl, browser | README.md prerequisites (demo folder) | 2026-10-24 | confirmed against README |
| Demo commands on slides (deploy.sh cluster|backend|export, 05-consumer/deploy.sh, bind.sh, create.sh, run.sh, teardown.sh) | scripts in the demo folders | 2026-10-24 | confirmed, names and arguments exist |
| run.sh ends with pulumi preview --expect-no-changes on provider-dev | 08-second-consumer/check.sh | 2026-10-24 | confirmed |
| Teardown order: consumer-b-dev, consumer-a-dev, provider-dev; asks before each destroy | 09-teardown/teardown.sh | 2026-10-24 | confirmed |
| Product names and Pulumi products (Pulumi IaC, ESC, Cloud) used correctly; no Copilot, Pulumi Service, Insights, CrossGuard | slides.md grep | 2026-10-24 | confirmed |

Total 31 claims, 5 changed, 0 removed.
