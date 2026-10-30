# Deployment timing measurements

Keep functional validation separate from performance measurement. The historical export records what happened during earlier debugging; it is not the baseline for a controlled comparison.

The [October 29 controlled results](results/2026-10-29-controlled/README.md) include 29 managed deployments, phase breakdowns, and preparation costs. The [historical export](results/2026-10-28-functional/README.md) preserves earlier functional observations separately.

The [changed-program follow-up](results/2026-10-30-changes/README.md) records incremental local build costs. Its cloud comparison is paused during a service incident. The [fixture protocol](changed-program/README.md) separates source edits from dependency changes.

## Export retained deployment history

Supply a Pulumi access token through the process environment, then run the read-only collector:

```bash
python3 benchmarks/collect.py \
    --stack <org>/<project>/<stack> \
    --output benchmarks/results/my-run
```

Use repeated `--stack` arguments for several stacks. A `--manifest` file can supply specific deployment IDs, labels, and comparison eligibility. By default, no run is included in a statistical comparison until explicitly classified.

Outputs:

- `deployments.json`: allowlisted deployment and step timestamps. Configuration, credentials, logs, and user profiles are excluded.
- `runs.csv`: one row per deployment, including unsuccessful or skipped requests.
- `summary.csv`: count, median, minimum, and maximum per phase for successful, explicitly included runs.
- `pre-run.csv`: instrumented configuration, download, verification, extraction, and plugin-installation measurements when the manifest includes them. These are subdivisions of pre-run time, not extra deployment time to add again.

The collector supports the normal one-job Deployments workflow. It rejects overlapping steps rather than counting overlapping time twice. A skipped request has blank durations, not a zero-second deployment.

Use `--input /path/to/deployments.json` with the original manifest to recalculate CSV exports offline. This makes published calculations reproducible without access to the source organization.

## What each duration means

The queue/dispatch estimate is the time from deployment creation to job start. It can include polling and orchestration delays; it is not a dedicated scheduler metric.

Setup is the API's named setup interval. On managed runners this includes runner and image preparation. Customer-managed startup can also appear between recorded steps, so retain that unattributed time. The API does not provide a separate image-pull timer. The Pulumi operation includes program execution, provider work, and backend communication; it is not exclusively cloud resource provisioning.

The breakdown also records executor download, source retrieval, cache restore/save, dependency installation, and pre-run commands. `between_steps_s` is the portion of the job not assigned to those step intervals. Queue/dispatch plus step durations plus between-step time reconciles to total elapsed time.

## Controlled comparison

### Distinguish the caches

Go maintains downloaded modules in `GOMODCACHE` and compiled package outputs in `GOCACHE`. Use `go env GOMODCACHE GOCACHE` to find their actual locations. A source change invalidates affected build outputs; unchanged dependencies can remain reusable.

A restored archive is not proof that every package is current. Go checks its build inputs and recompiles affected packages. An unchanged outer cache key can restore an older application build while still supplying useful compiled dependencies.

Managed Deployments dependency caching archives both directories. A later deployment restores them onto its runner. A source-only change can retain the same outer cache key, while a changed `go.sum` selects another entry. Restore and save logs establish whether that deployment actually used a cache. Customer-managed runners instead need persistence that you configure, such as the [Kubernetes cache setup](../labs/05-kubernetes-cache/README.md).

In GitHub Actions, [actions/setup-go](https://github.com/actions/setup-go#caching-dependency-files-and-build-outputs) can restore both Go caches before your build. Caching is enabled by default. Set `cache-dependency-path` explicitly for a program in a subdirectory. The current action uses an exact key incorporating the dependency-file hash, Go version, and platform. A changed dependency file can therefore lose the outer cache even when most Go packages remain unchanged. A custom `actions/cache` configuration can use fallback restore keys; keep platform and toolchain compatibility in those keys.

[BuildKit's GitHub Actions cache](https://docs.docker.com/build/cache/backends/gha/) reuses image-build results through `cache-from: type=gha` and `cache-to: type=gha,mode=max`. This speeds image construction. It does not preload the resulting image onto a separate deployment runner. Host Go caches also do not automatically become caches inside a Docker build.

The final image is distributed through a registry. Kubernetes nodes cache its downloaded layers independently. Those layers can survive replacement job Pods on the same node. See [executor image caching](../labs/05-kubernetes-cache/README.md#reuse-executor-image-layers-on-the-nodes).

### Hold the workload constant

The included runner measures one fixed Go/Random program, not language performance. Keep the source commit, program inputs, provider version, CLI, toolchain, and base image fixed. Seed the stack before measuring no-change updates. The runner checks resource-change results and observed cache hits before accepting a sample.

| Variant | Program | Managed cache | Automatic installation | Change from previous stage |
| --- | --- | --- | --- | --- |
| `source-no-cache` | Source | Disabled | Enabled | Baseline |
| `cache-population` | Source | Cold | Enabled | Populate the cache; report separately |
| `source-cache-warm` | Source | Warm | Enabled | Restore the populated cache |
| `program-artifact` | Downloaded executable | Warm | Enabled | Move compilation into the release build |
| `complete-artifact` | Executable and plugin archives | Warm | Enabled | Add explicit plugin distribution |
| `skip-install` | Same complete artifact | Warm | Disabled | Remove redundant installation |
| `skip-cache` | Same complete artifact | Disabled | Disabled | Remove redundant cache transfers |
| `prebuilt-image` | Same program and installed plugins in image | Disabled | Disabled | Change release delivery mechanism |

The final image is built from the same tools stage used by the other variants. Image layers are not force-cleared on managed runners, so image-cache state is not controlled. Record the measured setup cost and avoid calling a run image-cold or image-warm without separate evidence.

Use three or more repeats and publish their range as well as the median. A cache population run is not part of the warm median. Tests on newly created stacks belong in a separate cohort from no-change updates. Do not combine these observations into one speedup number.

## Prepare the benchmark

1. Create a dedicated project named `deployment-timings-<run-id>` and a test stack. The runtime helper writes that project name before executing the unchanged Go program.
1. Build the `tools` target of [image/Dockerfile](image/Dockerfile) for Linux AMD64. Record its digest and CLI/Go versions.
1. Compile the selected source revision inside that image. Place the executable at `benchmarks/image/payload/infra` and its matching Linux AMD64 plugin archive under `payload/plugins/`.
1. Create `program.tar.gz` containing `infra`, and `complete.tar.gz` containing the same `infra` plus `plugins/`. Generate `.sha256` files with the companion checksum tool.
1. Build the `prepared` image target from the same tools inputs. Publish both images and both archives under immutable references.
1. Fill in [config.example.json](config.example.json). Keep registry passwords and cloud credentials out of that file.
1. Run the benchmark with AWS credentials available to obtain a short-lived ECR pull password, and with `PULUMI_ACCESS_TOKEN` available for the API:

```bash
python3 benchmarks/run.py --config /path/to/config.json \
    --manifest benchmarks/results/my-run/manifest.json --samples 3
```

The configured ESC environment must supply the runner with S3 read credentials. Each variant opens that same environment so credential preparation does not become an uncontrolled difference. The runner is specific to ECR/S3 and this Go fixture; the timing collector works with other language runtimes too.

Requests are serialized, and the manifest is saved after each request and result. Repeating the command resumes an existing request instead of launching it again. A changed configuration requires a new manifest. Failed measurements stop the experiment instead of being silently retried or included.

After investigating a failed seed or cache-population run, use `--retry-failed-warmup` to request another warmup explicitly. The failed record remains excluded in the manifest. This option cannot repeat a failed comparison sample. Read-only API timeouts receive bounded retries; deployment creation requests never retry automatically.

For a new-stack comparison, create separate stacks named `source-no-cache-1` through `source-no-cache-3` and `prebuilt-image-1` through `prebuilt-image-3`. Use `--cohort controlled-new-stack --variants source-no-cache prebuilt-image` with the same configuration and manifest.

## Record preparation and publication costs

Wrap each build or upload command with [time_command.py](time_command.py):

```bash
python3 benchmarks/time_command.py --label program-build \
    --output /path/to/costs.json --log /path/to/build.log \
    -- <build-command> <arguments>
```

Use environment-based authentication; the recorder stores command arguments but never captures environment variables. Keep logs private and review data before publication. Record program dependency preparation, compilation, archive creation, image assembly, and publication separately. If a parent timer contains child timers, do not add both to the total.

For a rollout of N environments, compare the applicable one-time preparation cost plus the sum of N deployment durations. Distinguish measured totals from estimates that multiply a sample median. Common tools-image costs belong to both approaches. Do not amortize a per-stack dependency-cache population cost across different stacks.

After measurement, destroy test resources and remove dedicated artifact storage and runner capacity. Retain the timing exports and any stack history needed to audit the results.
