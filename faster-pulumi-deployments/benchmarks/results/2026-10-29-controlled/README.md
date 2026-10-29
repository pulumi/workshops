# Controlled deployment measurements

Warm dependency caching produced the largest reduction in repeated-update time in this experiment. Adding artifacts did not improve every subsequent measurement. Use these results to identify work you can remove, then measure your own program.

The experiment completed on October 29, 2026. It used one Go program with one Random resource, Pulumi CLI 3.259.0, Go 1.26.0, and Random provider 4.18.2. Managed deployments ran Linux AMD64. The source revision was `d75621fdc6bdff47f3190d1cd7a0701dc0aa4e6a`.

All 29 deployments succeeded. Two warmup runs were excluded from comparisons. Each measured condition has three samples. The runner checked resource changes and expected cache hits before accepting each sample.

## Repeated updates without resource changes

These 21 updates used the same existing stack and inputs. Times are seconds from deployment creation to completion, including queue/dispatch time.

| Variant | Samples | Median | Minimum–maximum |
| --- | ---: | ---: | ---: |
| Source, cache disabled | 3 | 180.807 | 175.186–191.150 |
| Source, warm cache | 3 | 52.229 | 50.867–54.418 |
| Program artifact, warm cache | 3 | 57.852 | 54.993–58.520 |
| Complete artifact, warm cache | 3 | 60.168 | 54.181–64.628 |
| Complete artifact, installation disabled | 3 | 57.266 | 52.358–58.050 |
| Complete artifact, installation and cache disabled | 3 | 51.067 | 50.005–53.114 |
| Prebuilt image, installation and cache disabled | 3 | 49.874 | 49.567–54.623 |

The separate cache-population update took 226.941 seconds. That cost belongs to this stack. Managed dependency caches are per stack; another stack must populate its own cache.

The warm-source and prebuilt-image ranges overlap. Three samples cannot establish a reliable ranking between those approaches. Artifact delivery added work while the warm cache already removed most compilation work.

## Where deployment time went

This table shows median API phase durations for the repeated updates. Each column has its own median, so adding a row does not reproduce the median total.

| Variant | Setup | Source | Cache restore | Dependency installation | Pre-run | Pulumi operation | Cache save |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Source, cache disabled | 24.368 | 7.159 | 0 | 15.422 | 1.590 | 126.899 | 0 |
| Source, warm cache | 22.165 | 6.235 | 9.581 | 1.139 | 1.632 | 5.874 | 0.322 |
| Program artifact | 22.880 | 6.956 | 10.393 | 1.217 | 5.090 | 4.390 | 0.431 |
| Complete artifact | 24.257 | 6.646 | 9.523 | 1.328 | 5.245 | 4.439 | 0.389 |
| Installation disabled | 25.630 | 6.701 | 9.715 | 0 | 5.208 | 4.174 | 0.303 |
| Installation and cache disabled | 23.476 | 6.320 | 0 | 0 | 5.120 | 13.323 | 0 |
| Prebuilt image | 25.188 | 6.506 | 0 | 0 | 1.652 | 12.806 | 0 |

[runs.csv](runs.csv) includes every phase, queue/dispatch, executor download, and unattributed time between steps. Those components reconcile to each deployment's total. [summary.csv](summary.csv) gives the count and range for every phase.

Setup includes runner and image preparation. The API does not expose a separate image-pull timer. The Pulumi operation includes language-host, provider, and backend work; it is not a timer for compilation alone.

Removing the cache reduced transfer time, but the operation phase increased. These phase measurements do not isolate the cause of that increase. A smaller installation phase therefore does not guarantee the same reduction in total time.

[pre-run.csv](pre-run.csv) records configuration, download, checksum verification, extraction, and plugin installation within pre-run commands. Those measurements are already inside the API pre-run interval. Do not add them to deployment totals again.

## First deployments to separate stacks

Each sample below used a new stack. The runner verified two creates in each update result. These six deployments are separate from the no-change comparison.

| Variant | Samples | Median total | Minimum–maximum | Median dependency installation | Median operation |
| --- | ---: | ---: | ---: | ---: | ---: |
| Source, cache disabled | 3 | 176.927 | 172.631–178.045 | 15.725 | 126.276 |
| Prebuilt image | 3 | 49.984 | 49.894–51.828 | 0 | 13.631 |

The prepared image reused one program build across all three stacks. External configuration remained separate from the release. These measurements cover the fixture's first deployment, not AWS account provisioning or production infrastructure.

## Preparation and publication costs

Moving work into a release build still has a cost. [preparation.json](preparation.json) retains the measured command durations and version information.

| Preparation step | Seconds | Scope |
| --- | ---: | --- |
| Tools image build | 33.246 | Common base for both approaches |
| Tools image publication | 68.672 | Common base for both approaches |
| Program dependencies | 11.043 | One prepared program |
| Program compilation | 86.824 | One prepared program |
| Provider archive download | 3.587 | Artifact and prepared-image input |
| Archive packaging | 5.218 | Both archive variants together |
| Artifact publication | 13.677 | Both archive variants together |
| Prepared image assembly | 4.893 | Reused tools-image layers |
| Prepared image publication | 18.303 | Published after the tools image |

The program build ran Linux AMD64 through Docker Desktop on an ARM64 host. Its emulation and local hardware differ from managed runners. Preparation times are single observations, not repeated measurements.

For the three fresh stacks, source deployment durations sum to 527.603 seconds. Image deployment durations sum to 151.706 seconds. Applicable image preparation adds 124.650 seconds: dependencies, compilation, provider download, image assembly, and image publication. That gives a measured-stage budget of 276.356 seconds for the prepared-image approach.

Both budgets exclude the same 101.918 seconds for the common tools-image build and publication. They also exclude authentication setup, test-storage creation, stack creation, and gaps between requests. Archive packaging and publication do not belong in the image budget.

These sums combine elapsed work on different machines. They are neither CPU measurements nor billed runner minutes. No dollar-cost or production break-even claim follows from them.

## Reproduce the calculations

From the workshop directory, recalculate the exports without cloud access:

```bash
python3 benchmarks/collect.py \
    --input benchmarks/results/2026-10-29-controlled/deployments.json \
    --manifest benchmarks/results/2026-10-29-controlled/manifest.json \
    --output /tmp/deployment-timing-recalculation
```

[manifest.json](manifest.json) identifies each deployment, source revision, image digest, cache observation, and comparison eligibility. [deployments.json](deployments.json) contains allowlisted API timestamps. The [benchmark instructions](../../README.md) describe how to run a new experiment.

## Limits of this experiment

Requests ran serially in a fixed order. Conditions were not randomized, and managed image-layer caches could not be cleared. All variants retrieved source and opened the same ESC environment. The prepared image used the same tools base as the source runner.

The workload creates a small local-provider resource. It does not represent slow cloud APIs, large dependency graphs, or hundreds of concurrent deployments. The language tracks have separate functional validation; this experiment does not compare language performance.

The [historical export](../2026-10-28-functional/README.md) retains earlier debugging runs, including failures and artificial delays. Those observations are excluded from every table above.

## Cleanup

All seven benchmark stacks were destroyed after measurement. Their empty stack histories remain available for audit. The dedicated S3 bucket and ECR repository were deleted, along with the two local benchmark image tags. This benchmark created no Kubernetes cluster or customer-managed runner capacity.

The published data remains sufficient for offline recalculation. To repeat the cloud experiment, build and publish new artifacts and images. The recorded image digests identify the measured releases; their temporary registry is no longer available.
