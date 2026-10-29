# Lab 1: Measure and cache

Choose one [language program](../../programs) and install its dependencies with that language's package manager. Connect its directory to Pulumi Deployments and configure two disposable stacks with different `environment` values. Keep the source revision, runtime image, and dependency resolution files constant during comparisons.

For TypeScript, run `npm ci` in `programs/typescript`; for Go, run `go mod download`. For .NET, use `dotnet restore --locked-mode`; for Java, use `mvn package`; for Python, use `uv sync --frozen`.

Record a first deployment and a repeated deployment without resource changes. Keep queue time, runner setup, cache restore/save, dependency installation, and the Pulumi operation separate. A new-stack deployment and a no-change update are different workloads.

On Pulumi-managed runners, enable dependency caching for supported runtimes: Go, .NET, Node.js, and Python. Java and YAML require a different cache or image strategy. Managed caches are scoped per stack, so a new stack starts cold even when another stack has already used the same dependencies. Previews consume existing cache entries but do not populate them.

Record these cases:

| Case | Setup | Cache transfer | Dependency preparation | Pulumi operation | Queue | Total |
| --- | --- | --- | --- | --- | --- | --- |
| First update, no managed cache | | | | | | |
| First update with cache enabled | | | | | | |
| Repeated update with cache enabled | | | | | | |
| New stack, same source and dependencies | | | | | | |

Use actual deployment step logs. Do not treat a cache setting or a shorter total as proof of a hit.

Continue to [lab 2](../02-build-once/README.md).
