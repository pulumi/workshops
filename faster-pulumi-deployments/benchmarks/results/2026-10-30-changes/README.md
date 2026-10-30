# Changed-program deployment measurements

A source-only edit retained most cached build work. Updating one imported dependency changed the managed cache key and caused a miss on every source stack. Prepared images avoided that repeated preparation, but their release-build cost still mattered for the smaller source edit.

The experiment completed on October 30, 2026, with 12 successful comparison deployments across six stacks. Each condition has three samples from distinct stacks. Six successful baseline runs established resources and caches. Two failed baseline attempts remain recorded and excluded.

The fixture used the Pulumi CLI 3.259.0, Go 1.26.0, and Random provider 4.18.2 on managed Linux AMD64 runners. Each stack received the same baseline, application edit, and dependency update in sequence. Resource inputs stayed unchanged. The runner verified cache observations, exported revision values, and the absence of resource changes.

## Deployment durations

All times are seconds. Total duration includes queue/dispatch time. Job duration starts when the job starts and includes setup, source retrieval, preparation, the Pulumi operation, and cache saving.

| Change | Approach | Median total | Total minimum–maximum | Median job |
| --- | --- | ---: | ---: | ---: |
| Application edit | Source, warm cache | 58.887 | 54.605–105.538 | 56.119 |
| Application edit | Prebuilt image | 53.179 | 52.076–57.279 | 51.302 |
| Dependency update | Source, new cache key | 200.728 | 199.814–210.298 | 197.789 |
| Dependency update | Prebuilt image | 50.522 | 48.913–79.576 | 47.529 |

The application edit changed `main.go` while leaving dependency files unchanged. All three source stacks restored their previous cache. Go could reuse compiled dependencies while rebuilding the changed program.

The dependency update changed the imported `github.com/hashicorp/go-version` module from 1.8.0 to 1.9.0. Both its requirement and checksum entries changed. All three source stacks missed the managed cache on their first deployment of that revision. The image approach built the revision once and reused it across the three image stacks.

One application-edit source run spent 45.675 seconds in queue/dispatch. One dependency-update image run spent 30.588 seconds there. Both remain in the results. These delays are not evidence of slower compilation or image startup.

## Phase breakdown

These are independently calculated phase medians. Adding them does not reproduce the median total. [runs.csv](runs.csv) records all phases for every request; each comparison run's phase durations reconcile to its total.

| Change and approach | Setup | Cache restore | Dependency installation | Pulumi operation | Cache save |
| --- | ---: | ---: | ---: | ---: | ---: |
| Application edit, source | 25.770 | 10.112 | 1.267 | 7.439 | 0.396 |
| Application edit, image | 25.588 | 0 | 0 | 14.268 | 0 |
| Dependency update, source | 25.094 | 0.779 | 14.830 | 129.355 | 16.216 |
| Dependency update, image | 24.483 | 0 | 0 | 12.817 | 0 |

The source-only edit did not require a full cold compilation. Its median Pulumi operation was 7.439 seconds. Moving that work into an image therefore had relatively little execution time left to remove.

The dependency update required much more preparation from source. Its operation phase includes compilation, language-host work, provider work, and backend communication; it does not measure compilation alone. The separate local build measurements below isolate the build command more closely.

[summary.csv](summary.csv) includes sample counts and ranges for every phase. [pre-run.csv](pre-run.csv) records configuration time within the pre-run interval. Do not add those nested measurements to deployment totals again.

## Local preparation measurements

The builder used Linux AMD64 through Docker Desktop on an ARM64 host. Each time includes its Docker command's startup overhead. Dedicated volumes retained Go module and build caches across revisions. These are single observations, not medians.

| Revision | Dependency preparation | Compilation | Image assembly | Image publication | Sum |
| --- | ---: | ---: | ---: | ---: | ---: |
| Baseline, empty Go caches | 10.552 | 95.296 | 5.478 | 15.398 | 126.724 |
| Application edit, retained caches | 0.798 | 5.928 | 3.833 | 12.399 | 22.958 |
| Dependency update, retained caches | 0.851 | 12.851 | 4.265 | 13.524 | 31.491 |

Times are seconds. [preparation.json](preparation.json) records the measured stages. The [fixture protocol](../../changed-program/README.md) identifies the exact commits and instructions for reproducing each change.

The retained Go build cache reused work after both changes. This illustrates incremental compilation, but does not measure a GitHub Actions cache restore. The local builder retained its caches across dependency changes; managed Deployments selected a new archive key and missed its cache.

The tools image reused existing local build layers. Its recorded 1.012-second publication was a repeat push after an interrupted local controller. Exclude it from cold-publication claims. Provider inputs also reused the earlier experiment's downloaded archive. Image construction used the existing recipe, without optimizing provider-layer ordering.

## Include preparation when comparing three stacks

This table adds one release's preparation to the sum of its three image job durations. Source jobs already include their dependency preparation and compilation. Queue/dispatch is excluded from both approaches so its observed variation does not become an apparent build improvement.

| Change | Three source jobs | Three image jobs | One image release preparation | Image jobs plus preparation |
| --- | ---: | ---: | ---: | ---: |
| Application edit | 168.631 | 155.799 | 22.958 | 178.757 |
| Dependency update | 602.976 | 143.509 | 31.491 | 175.000 |

For this application edit across three stacks, cached source required less cumulative stage time after image preparation was included. For this dependency update, the prepared image avoided substantial repeated work.

These sums combine elapsed stages on different machines, including the emulated local builder. They are not CPU time, billed runner minutes, or full rollout duration. They exclude baseline setup, common tools-image preparation, and gaps between requests. They do not establish a production break-even stack count.

## Incident handling and limitations

Baseline setup encountered the [October 30 Pulumi Cloud API and Console incident](https://stspg.io/pvd8jj6fbhk5). The first image-stack-2 attempt failed during its update with an API `502 Bad Gateway`. Its first explicit retry failed before execution. Both remain in [baseline-image-2.json](baseline-image-2.json) and the raw export. A subsequent explicit retry succeeded.

Comparison deployments resumed after the service reported a deployed fix and entered monitoring. Service recovery could still affect timings. No comparison sample failed, and the successful runs with long queue/dispatch intervals were not discarded.

Requests ran serially in a fixed order, with three samples per condition. This small Random-provider fixture does not represent production infrastructure or cloud API latency. The edit changed one output string; the dependency update changed one library. Larger code changes or SDK upgrades can behave differently.

Image-layer cache state was not controlled on managed runners. Setup includes runner and image preparation; there is no separate image-pull measurement. This experiment does not measure Kubernetes node-local image caching or GitHub Actions cache performance.

## Reproduce the calculations

[manifest.json](manifest.json) combines the individual run manifests and preserves release metadata. [deployments.json](deployments.json) contains allowlisted API timestamps for all 20 requests. Warmups and failures remain excluded from summary calculations.

From the workshop directory, recalculate the CSV files without cloud access:

```bash
python3 benchmarks/collect.py \
    --input benchmarks/results/2026-10-30-changes/deployments.json \
    --manifest benchmarks/results/2026-10-30-changes/manifest.json \
    --output /tmp/changed-program-recalculation
```

## Cleanup

All resources in the six `team-ce/deployment-timings-changes-20261030-psdrj8` stacks were destroyed. Empty histories remain for audit. The project's managed dependency cache was cleared. The dedicated ECR repository, local image tags, and two dedicated Go cache volumes were removed.

This follow-up created no S3 bucket or Kubernetes cluster. The temporary registry images are no longer available; rebuild the recorded source revisions to repeat cloud execution. The saved API data supports offline recalculation.
