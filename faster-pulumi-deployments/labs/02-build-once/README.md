# Lab 2: Build or prepare once

Run the common builder from the workshop root:

```bash
make build LANGUAGE=typescript
```

Use `typescript`, `python`, `go`, `dotnet`, or `java`. The complete implementation is in [build.sh](../../scripts/build.sh). It also checks that each provider SDK matches [provider-plugins.txt](../../provider-plugins.txt).

The tracks produce different artifacts:

- TypeScript: `tsc` emits JavaScript, then npm installs the production dependency graph beside it. The generated project sets `typescript: false`. Node.js and runtime packages remain necessary.
- Go: `go build` creates a native executable. The generated project uses the `binary` runtime option. The sample has no cgo dependencies.
- .NET: `dotnet publish` creates a framework-dependent DLL and its sidecars. The generated project points `binary` at the DLL. Preserve the entire publish output, not just the DLL.
- Java: Maven shades dependencies and service descriptors into a runnable JAR. The generated project points `binary` at that JAR. The runner still needs Java 17+.
- Python: uv exports hashed requirements and pip downloads compatible wheels. The source and wheels are the artifact; an existing virtual environment is not copied between machines.

For Python, create the runtime environment at its destination:

```bash
PYTHON="$(uv python find 3.12)" bash dist/python/prepare-python.sh
```

The [preparation script](../../scripts/prepare-python.sh) installs from the wheel directory without a package-index connection. Build wheels for the runtime's OS, architecture, and Python version. Use the Linux image workflow in lab 4 when deploying from a Mac or Windows workstation to Linux runners.

Install the provider plugin with the root README commands. Run `make config LANGUAGE=<language>` to create an external project workspace. Then initialize two stacks in `workspaces/<language>` and deploy both with different `environment` values. Verify that the outputs differ while the artifact files stay unchanged. Rebuilds replace `dist/<language>` but preserve this external configuration.

To supply configuration through ESC, create environments using [bench-a.yaml](../../esc/bench-a.yaml) and [bench-b.yaml](../../esc/bench-b.yaml). Import the corresponding environment from each stack's YAML file. The SDK configuration lookup stays the same in every language.

Compare these runs with lab 1, including the initial build cost. Go is one useful executable model, not a requirement to replace an existing language.

Continue to [lab 3](../03-release-artifacts/README.md).
