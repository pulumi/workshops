# Changed-program experiment status

The cloud comparison is paused because of the [October 30 Pulumi Cloud API and Console incident](https://stspg.io/pvd8jj6fbhk5). No changed-program deployment comparison is complete. The local preparation measurements below are complete.

## Local preparation measurements

The builder used Linux AMD64 through Docker Desktop on an ARM64 host. Each time includes its Docker command's startup overhead. Dedicated volumes retained Go module and build caches across revisions. These are single observations, not medians.

| Revision | Dependency preparation | Compilation | Image assembly | Image publication | Sum |
| --- | ---: | ---: | ---: | ---: | ---: |
| Baseline, empty Go caches | 10.552 | 95.296 | 5.478 | 15.398 | 126.724 |
| Application edit, retained caches | 0.798 | 5.928 | 3.833 | 12.399 | 22.958 |
| Dependency update, retained caches | 0.851 | 12.851 | 4.265 | 13.524 | 31.491 |

Times are seconds. [preparation.json](preparation.json) records the measured stages. The application edit changed an exported version string. The dependency update changed the imported `github.com/hashicorp/go-version` module from 1.8.0 to 1.9.0. The [fixture protocol](../../changed-program/README.md) identifies the exact commits.

The retained Go build cache reused work after both changes. This illustrates incremental compilation, but does not measure a GitHub Actions cache restore. The managed Deployments dependency-change case still needs testing because its changed lock file selects a new outer cache key.

The tools image reused existing local build layers. Its recorded 1.012-second publication was a repeat push after an interrupted local controller. Exclude it from cold-publication claims. Provider inputs also reused the earlier experiment's downloaded archive. Image construction used the existing recipe, without optimizing provider-layer ordering.

## Cloud progress and retained evidence

Three baseline deployments were validated: source stacks 1 and 2 reported cache misses and created the expected resources; image stack 1 succeeded. Their manifests retain deployment IDs, image digests, and verified outputs.

The first baseline on image stack 2 failed during the Pulumi update with an API `502 Bad Gateway`. Its failed record remains in [baseline-image-2.json](baseline-image-2.json), excluded from comparisons. An explicit warmup retry was submitted before the service incident was confirmed. Its ID is `541fe5e4-756f-49a1-953b-1823ad3ff289`; its remote status was not confirmed before local polling stopped.

The controller stopped before submitting any application-edit or dependency-update deployments. Source stack 3 and image stack 3 have not completed baseline setup. No deployment timings from this partial experiment support a source-versus-image conclusion.

## Resume after recovery

1. Check the service incident before resuming.
1. Inspect the retained retry ID before submitting another deployment.
1. Complete baseline setup for all six stacks.
1. Follow the fixture protocol for the code and dependency revisions.
1. Export API timestamps and publish sample counts, phase timings, and ranges.
1. Destroy the test resources and remove the dedicated registry after collecting the results.

The dedicated project is `team-ce/deployment-timings-changes-20261030-psdrj8`. Its six stacks and the ECR repository `deployment-timings-changes-20261030-psdrj8` remain for resumption. Local prepared images and dedicated Go cache volumes also remain. This follow-up created no S3 bucket or Kubernetes cluster.
