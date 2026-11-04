# Customer-managed Kubernetes runners

This experiment measures two things that differ between customer-managed runners on Kubernetes and Pulumi-managed runners: whether a node reuses a custom executor image across deployments, and whether a persistent volume can stand in for managed dependency caching. It complements the [Pulumi-managed comparison](../2026-11-04-recommended/README.md).

The experiment completed on November 4, 2026. All 31 deployments succeeded and were validated. It used the same [changed-program fixture](../../changed-program/README.md) and the same GitHub Actions releases as the Pulumi-managed comparison. The runner was the [customer-managed workflow agent](https://www.pulumi.com/docs/deployments/deployments/customer-managed-agents/) v2.3.2 with the Kubernetes deploy target, on a single-node kind cluster on an EC2 `m7i.xlarge` instance in `us-west-2`. [kubernetes-runner/](../../kubernetes-runner/) contains the manifests, the host setup script, and the [matrix](../../kubernetes-runner/k8s-matrix.py) that ran the deployments.

## Which setting controls the executor pull policy

The agent starts a worker Pod for each deployment. The Pod has an init container, `copy-workflow-runner`, which runs the agent image, and the `pulumi-workflow` container, which runs the executor image. Two probes recorded the pull policy Kubernetes assigned to each container:

| `PULUMI_AGENT_IMAGE_PULL_POLICY` | `imagePullPolicy` on `pulumi-workflow` in the worker Pod template | `copy-workflow-runner` | `pulumi-workflow` |
| --- | --- | --- | --- |
| `Always` | not set | `Always` | `IfNotPresent` |
| `IfNotPresent` | `Always` | `IfNotPresent` | `Always` |

The agent setting applies only to the init container. The executor's pull policy comes from the worker Pod template. When the template does not set one, Kubernetes applies its default, which is `IfNotPresent` for an image referenced by digest.

## Executor image pulls

Each condition deployed a custom executor image to three existing stacks. Pull durations come from the node's `Pulled` events, in [pulls.csv](pulls.csv). The image was 244 MB, in a private Amazon ECR repository in the same region, pulled with an `imagePullSecrets` entry on the runner service account.

| Condition | Pull result | Pull duration | Median job |
| --- | --- | ---: | ---: |
| Cold node (image cache cleared) | Full pull | 4.4–5.1 s | 15.8 s |
| Image on node, `IfNotPresent` | Not pulled | 0 | 10.0 s |
| Image on node, `Always` | Manifest check only | 72–77 ms | 10.7 s |
| New release, base layers on node, `IfNotPresent` | Changed layers only | 0.8–1.0 s | 11.4 s |

On these runners the pull happens after the Deployments setup step finishes and before the executor download step starts, so it appears as time between steps rather than in setup. The median job ratios:

| Comparison | Ratio |
| --- | ---: |
| Cold node ÷ image on node | 1.57 |
| `Always` ÷ `IfNotPresent`, image on node | 1.06 |
| New release ÷ image on node | 1.14 |

With `Always`, the kubelet contacted the registry on every deployment but downloaded no layers, so the cost was a round trip. A new release that shares its base layers with an image already on the node downloaded only the changed layers. A deployment that lands on a node without the image pays the full pull, so a cluster with many nodes, or one that replaces nodes often, sees more cold pulls than this single-node cluster.

## Go cache volume

The worker Pod template mounted a `ReadWriteOnce` PersistentVolumeClaim at `/cache` and set `GOMODCACHE=/cache/go/mod` and `GOCACHE=/cache/go/build`. The comparison template omitted the volume. Source deployments used the agent's default executor image with managed dependency caching disabled.

| Condition | Median job | Dependency installation | Pulumi operation |
| --- | ---: | ---: | ---: |
| Dependency update, no cache volume | 55.2 s | 5.4 s | 41.3 s |
| Dependency update, cache volume | 11.8 s | 0.9 s | 3.4 s |
| First deployment to a new stack, cache volume | 12.9 s | 1.1 s | 3.9 s |
| Custom image, new release (for comparison) | 11.4 s | 0 | 2.7 s |

Without the volume, each deployment downloaded modules and compiled the program during its Pulumi operation. With the volume, the module and build caches persisted across deployments and across stacks.

| Comparison | Ratio |
| --- | ---: |
| Dependency update: no cache volume ÷ cache volume | 4.70 |
| Dependency update: source without cache volume ÷ custom image | 4.83 |
| Dependency update: source with cache volume ÷ custom image | 1.03 |
| New stack: source with cache volume ÷ custom image | 1.12 |

The volume is shared by every stack the agent runs, which is the source of most of the gain. The three cache-volume stacks deployed the dependency update in turn, so only the first had to download the new module and compile against it; the second and third reused that work. The first stack's job took 14.2 seconds, a ratio of 3.9 against the median without the volume. New stacks at the baseline revision found everything already in the cache.

Managed dependency caching is scoped to a stack and keyed on lock files. This volume is neither: one stack's build populates it for all of them, and nothing removes old entries. Go tolerates concurrent use of its module and build caches, so the volume needs no coordination between Go deployments, but it does need a size limit and a cleanup plan. A `ReadWriteOnce` volume also restricts worker Pods to the node where it is attached; a multi-node pool needs `ReadWriteMany` storage or a cache per node.

## Default executor image

Source deployments that do not set an executor image run `public.ecr.aws/pulumi/pulumi:latest` on customer-managed runners. That image includes every language runtime and was 3.45 GB. The first pull on the node took 149 seconds and accounts for the one long seed deployment in [runs.csv](runs.csv). The tag is not pinned, so the Pulumi CLI version in source deployments follows the image's latest release rather than the 3.273.0 used elsewhere in this experiment. Setting a pinned, language-specific image, such as `pulumi/pulumi-go`, in the stack's deployment settings avoids both the size and the drift.

## Queue time

Requests waited a median of 56.6 seconds (range 1.0–60.0) between submission and the start of the job, because the agent picks up work when it polls. Queue time is excluded from every comparison here and in the Pulumi-managed experiment.

## Limits of this experiment

The cluster had one node, so every deployment after the first ran on a node that already had the executor image unless the matrix removed it. Requests ran serially, three samples per condition. The fixture is a small Random-provider program, and the dependency update changed one library. The ECR pull secret contained a 12-hour authorization token; a long-running cluster needs a credential helper or a node IAM role instead.

The raw Pod and event watches are not published, because Pod specs contain job tokens. [analyze.py](../../kubernetes-runner/analyze.py) extracted the allowlisted pull fields into [pulls.csv](pulls.csv).

## Reproduce the calculations

From the workshop directory:

```bash
python3 benchmarks/collect.py \
    --input benchmarks/results/2026-11-04-kubernetes/deployments.json \
    --manifest benchmarks/results/2026-11-04-kubernetes/manifest.json \
    --output /tmp/kubernetes-recalculation
python3 benchmarks/kubernetes-runner/analyze.py summarize \
    --runs-csv /tmp/kubernetes-recalculation/runs.csv \
    --output /tmp/kubernetes-recalculation
```
