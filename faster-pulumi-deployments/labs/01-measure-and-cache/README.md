# Lab 1: Measure and cache

Choose one [language program](../../programs) and install its dependencies with that language's package manager. Connect its directory to Pulumi Deployments and configure two disposable stacks with different `environment` values. Keep the source revision, runtime image, and dependency resolution files constant during comparisons.

For TypeScript, run `npm ci` in `programs/typescript`; for Go, run `go mod download`. For .NET, use `dotnet restore --locked-mode`; for Java, use `mvn package`; for Python, use `uv sync --locked`.

Record a first deployment and a repeated deployment without resource changes. Keep queue time, runner setup, cache restore/save, dependency installation, and the Pulumi operation separate. A new-stack deployment and a no-change update are different workloads.

On Pulumi-managed runners, enable dependency caching for supported runtimes: Go, .NET, Node.js, and Python. Java and YAML require a different cache or image strategy. Managed caches are scoped per stack, so a new stack starts cold even when another stack has already used the same dependencies. Previews consume existing cache entries but do not populate them.

Record these cases:

| Case | Setup | Cache transfer | Dependency preparation | Pulumi operation | Queue | Total |
| --- | --- | --- | --- | --- | --- | --- |
| First update, no managed cache | | | | | | |
| First update with cache enabled | | | | | | |
| Repeated update with cache enabled | | | | | | |
| Source edit, unchanged dependency files | | | | | | |
| First update after a dependency change | | | | | | |
| New stack, same source and dependencies | | | | | | |

Use actual deployment step logs. Do not treat a cache setting or a shorter total as proof of a hit.

For Go, the managed cache includes downloaded modules and compiled package outputs. A source edit can reuse compiled dependencies, while a changed `go.sum` selects another managed cache entry. Record the first deployment after that dependency change separately from repeats that can restore the new entry.

The [changed-program protocol](../../benchmarks/changed-program/README.md) tests those cases on three distinct stacks per approach. Its [results](../../benchmarks/results/2026-10-30-changes/README.md) include release preparation costs and keep queue delays separate from job execution. Use those measurements as a method to reproduce, not a prediction for your program.

Continue to [lab 2](../02-build-once/README.md).
