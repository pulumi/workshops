# Recommended configurations compared

This experiment measures the three configurations the companion article recommends, each on Pulumi-managed runners:

- **Source with caching:** the default executor image with managed dependency caching enabled.
- **Custom executor image:** a prepared image in a private Amazon ECR repository, pulled with a registry password, with dependency installation skipped and caching disabled.
- **Release bundle:** a public tools image on Amazon ECR Public plus a program archive in Amazon S3, fetched with credentials from an ESC environment, with dependency installation skipped and caching disabled.

The experiment completed on November 4, 2026. All 36 deployments succeeded and were validated. It used the [changed-program fixture](../../changed-program/README.md): baseline, application edit, and dependency update revisions of one Go program with one Random resource. Pulumi CLI 3.273.0 ran in every configuration; the default image and the custom images are both built on `pulumi/pulumi-go:3.273.0`. Releases were compiled with Go 1.26.10.

## Ratios

Each ratio divides the source approach's time by the other approach's time, so a value above 1 means the other approach finished sooner. The per-deployment column compares median job durations. The other columns compare three deployments, using three times the median job duration, plus one release build on the named host. Queue/dispatch time is excluded throughout.

| Change deployed to three stacks | Approach | Per deployment | Including one build on GitHub Actions | Including one build on EC2 |
| --- | --- | ---: | ---: | ---: |
| Source edit to existing stacks | Custom executor image | 1.04 | 0.86 | 1.00 |
| Source edit to existing stacks | Release bundle | 0.95 | 0.89 | 0.93 |
| Dependency update to existing stacks | Custom executor image | 4.74 | 2.82 | 4.50 |
| Dependency update to existing stacks | Release bundle | 3.58 | 2.64 | 3.46 |
| First deployment to new stacks | Custom executor image | 4.64 | 2.82 | 3.17 |
| First deployment to new stacks | Release bundle | 3.67 | 2.68 | 2.93 |

[ratios.json](ratios.json) holds the medians, ranges, raw three-sample sums, build costs, and phase medians behind each ratio. [analyze.py](../../release/analyze.py) recalculates it from `runs.csv` and the build timings.

## Where deployment time went

Median phase durations in seconds. Each column has its own median, so a row does not add up to the median job.

| Change and approach | Job | Setup | Cache restore | Dependency installation | Pre-run | Pulumi operation | Cache save |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Source edit, source | 48.0 | 1.8 | 12.0 | 11.8 | 3.6 | 8.5 | 0.3 |
| Source edit, image | 46.2 | 22.0 | 0 | 0 | 1.6 | 14.4 | 0 |
| Source edit, bundle | 50.4 | 23.3 | 0 | 0 | 5.1 | 12.1 | 0 |
| Dependency update, source | 202.5 | 2.0 | 0.5 | 29.6 | 4.0 | 136.1 | 22.9 |
| Dependency update, image | 42.7 | 20.8 | 0 | 0 | 1.6 | 11.5 | 0 |
| Dependency update, bundle | 56.5 | 29.1 | 0 | 0 | 6.0 | 11.8 | 0 |
| New stack, source | 208.5 | 2.0 | 0.6 | 27.1 | 5.0 | 138.5 | 25.9 |
| New stack, image | 45.0 | 20.9 | 0 | 0 | 1.6 | 13.4 | 0 |
| New stack, bundle | 56.8 | 27.9 | 0 | 0 | 5.5 | 13.6 | 0 |

The default executor image is pre-cached on Pulumi-managed runners, so source deployments spent about 2 seconds in setup. The custom images were pulled during setup on every deployment: about 21 seconds for the private ECR image and 23–29 seconds for the ECR Public tools image. For the source edit, that pull cost roughly matched the cache restore and dependency installation that the source deployments still performed, so the approaches finished within a few seconds of each other.

The bundle's pre-run step downloaded, verified, extracted, and installed the archive. Its median subdivisions were 2.9 seconds for the download, 0.1 seconds for verification, 0.3 seconds for extraction, and 0.5 seconds for plugin installation. [pre-run.csv](pre-run.csv) has every sample. Together with the slower tools-image pull, this made each bundle deployment 4–14 seconds slower than the image.

After a dependency update or on a new stack, the source deployments missed the cache. Each one downloaded modules and compiled the program during its Pulumi operation, then saved a new cache entry.

One new-stack source deployment, `source-new-stack-2`, took 433 seconds; its Pulumi operation took 335 seconds against about 135 seconds for the other two. It remains in the data. The totals use medians so that it does not dominate the three-stack comparison; the raw sums in [ratios.json](ratios.json) include it.

## Release build costs

Each revision was built twice: once in a [GitHub Actions workflow](../../../../.github/workflows/deployment-timings-20261104.yml) on `ubuntu-latest` (4 vCPUs), and once on an EC2 `m7i.xlarge` instance (4 vCPUs) in `us-west-2` using [ec2-user-data.sh](../../release/ec2-user-data.sh). Both ran the same [build script](../../release/build-release.sh). The deployments used the GitHub Actions releases. Times are seconds, from single observations.

| Revision | Host | Go cache | Compilation | Image assembly and publication | Bundle packaging and publication | Image release total | Bundle release total |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| Baseline | GitHub Actions | Miss | 53.7 | 29.2 | 5.7 | 86.6 | 63.0 |
| Baseline | EC2 | Empty | 37.1 | 21.6 | 2.9 | 62.2 | 43.5 |
| Application edit | GitHub Actions | Hit | 5.3 | 22.4 | 5.8 | 28.0 | 11.4 |
| Application edit | EC2 | Retained | 1.3 | 4.1 | 2.8 | 5.4 | 4.1 |
| Dependency update | GitHub Actions | Miss | 50.8 | 31.4 | 5.3 | 87.1 | 61.0 |
| Dependency update | EC2 | Retained | 3.1 | 3.8 | 2.8 | 7.0 | 6.0 |

Release totals also include dependency preparation and the provider plugin download; [builds/](builds/) has every stage. The tools image used by the bundle is a common cost and is excluded: it took 42.4 seconds to build and publish once on GitHub Actions. EC2 host setup (Docker, buildx, Go, and the repository clone) took 45.9 seconds and is also excluded.

`actions/setup-go` keys its cache on `go.sum`, so the dependency update missed the GitHub Actions cache the same way it missed the managed Deployments cache, and compiled almost from scratch. The EC2 host retained its Go build cache across revisions and recompiled only the affected packages. The BuildKit GitHub Actions cache made image assembly take 20–30 seconds even when the program layer was the only change. The EC2 host's local layer cache brought that below 2 seconds after the first build.

## Limits of this experiment

Requests ran serially in a fixed order, with three samples per condition. The fixture is a small Random-provider program; it does not represent slow cloud APIs, large dependency graphs, or concurrent rollouts. The edit changed one output string, and the dependency update changed one library. The release builds are single observations.

The private ECR image was pulled with a 12-hour ECR authorization token supplied with each deployment request. That works for a short experiment but not for ongoing use, because Pulumi-managed runners accept only static registry credentials. A registry that accepts long-lived credentials could have different pull times.

The ratios combine elapsed time on different machines. They are not CPU time or billed runner minutes, and they do not establish a production break-even stack count.

## Reproduce the calculations

[manifest.json](manifest.json) combines the per-stack manifests in [runs/](runs/) with the release metadata. [deployments.json](deployments.json) contains allowlisted API timestamps for all 36 requests. From the workshop directory:

```bash
python3 benchmarks/collect.py \
    --input benchmarks/results/2026-11-04-recommended/deployments.json \
    --manifest benchmarks/results/2026-11-04-recommended/manifest.json \
    --output /tmp/recommended-recalculation
python3 benchmarks/release/analyze.py \
    --runs /tmp/recommended-recalculation/runs.csv \
    --builds benchmarks/results/2026-11-04-recommended/builds \
    --output /tmp/recommended-recalculation
```

To repeat the cloud experiment, run [run-matrix.py](../../release/run-matrix.py) against new releases from the build workflow.
