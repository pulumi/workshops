# AGENTS.md - 05-fleet-cluster

Rules that are easy to break here:

- Never change `agentPoolProfiles` of an existing cluster. The registry page for ManagedCluster says the pool cannot be updated directly, and the demo never needs to.
- Do not set `orchestratorVersion` on the pool, and do not upgrade Kubernetes from this program. The version is set at creation from the ESC environment (`kubernetesVersion`); upgrades come from the fleet update run in `06-update-run/`. Step 8 refreshes the stacks and writes the new version into the ESC environment so the preview shows no diff.
- `group` and `kubernetesVersion` come from the ESC environment `fleet/<cluster>`, `vmSize` and the region from `fleet/azure-base`. Do not also set them in `Pulumi.<stack>.yaml`: an explicit stack value wins over `pulumiConfig`.
- `rollout.ts` and `index.ts` run the same `program.ts`. The driver runs it as an inline program; the CLI runs it through `index.ts`. Both must see the same `@pulumi/pulumi`, which is why the driver lives in this folder.
- `clusters.json` and the list in `../02-esc/lib.sh` must name the same clusters and groups.
- A change to `FleetCluster` that renames a child needs an alias, or the next `up` replaces the cluster.
