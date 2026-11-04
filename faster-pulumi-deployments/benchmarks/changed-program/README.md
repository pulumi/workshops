# Changed-program benchmark

This fixture separates an application edit from a dependency update. It keeps the Random resource inputs unchanged, so cloud resource replacement does not obscure preparation time. Both source and image runs verify the exported `revision` value.

## Recorded revisions

| Revision | Source commit | Change | Expected output |
| --- | --- | --- | --- |
| Baseline | `239dc32154d35e30e1246d492437e23fa742c7db` | Initial fixture using `go-version` 1.8.0 | `1.0.0` |
| Application edit | `32ccc693f3bb3d4749be4804a6325bbe9a1e6768` | Change the version string in `main.go`; leave dependency files unchanged | `1.1.0` |
| Dependency update | `3609b0c5d3ede1b4965bde6c33a24cf052f872a1` | Update the imported `go-version` library to 1.9.0; leave application code unchanged | `1.1.0` |

The dependency update changes only that module's requirement and checksum entries. Pulumi CLI, Pulumi SDK, Go toolchain, and Random provider versions remain fixed.

## Reproduce the sequence

Use the [benchmark preparation instructions](../README.md#prepare-the-benchmark) with this program directory. Retrieve each source revision from Git before building its image. Record dependency preparation, compilation, image assembly, and publication separately. Keep the prepared image and binary hash associated with their source commit.

Create three source stacks and three image stacks in a dedicated `deployment-timings-<run-id>` project. Each pair follows the same revision sequence. Requests run serially.

For each source stack, deploy the baseline with `cache-population`. For each image stack, deploy the baseline with `seed`. These six runs establish resources and source caches; exclude them from the changed-program comparison.

Next, deploy the application edit once to every stack. Use `source-cache-warm` for source stacks and `prebuilt-image` for image stacks. Set `--cohort controlled-code-change`.

Finally, deploy the dependency update once to every stack. Use `source-cache-miss` for source stacks and `prebuilt-image` for image stacks. Set `--cohort controlled-dependency-change`. Each source stack must report a cache miss on this first deployment of its new dependency key. Repeating the same dependency update would instead measure a warm key.

Use a separate configuration and manifest for each stack and revision. Set these additional configuration fields:

```json
{
  "prepare_script": "../prepare.py",
  "expected_revision": "1.1.0"
}
```

Use `1.0.0` for the baseline. Set `source.repoDir` to `faster-pulumi-deployments/benchmarks/changed-program`, and use the full source commit above. Run one sample per stack:

```bash
python3 benchmarks/run.py \
    --config /path/to/code-source-1.json \
    --manifest /path/to/code-source-1-manifest.json \
    --variants source-cache-warm \
    --samples 1 \
    --cohort controlled-code-change
```

The three stacks provide three first-change samples. Keep these distinct from three repeats after the change has already populated a cache.

The local image builder may retain Go caches across revisions. Report that separately from managed Deployments cache restoration. A persistent local builder does not reproduce GitHub Actions cache-key behavior or cache transfer time.
