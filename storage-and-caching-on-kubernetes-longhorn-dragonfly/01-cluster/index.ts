import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import * as pulumi from "@pulumi/pulumi";
import * as command from "@pulumi/command";
import * as k8s from "@pulumi/kubernetes";

// kind has no Pulumi provider: there is no `kind.Cluster` resource to
// declare. This project models the cluster's lifecycle explicitly with
// `@pulumi/command`'s `local.Command`, running `kind create cluster` on
// create and `kind delete cluster` on delete, so `pulumi destroy` genuinely
// removes the cluster rather than leaving it running underneath a stack
// that claims to be gone.
//
// This is a deliberate, demo-only shortcut: `local.Command` has no real
// "read" or "diff" step, so Pulumi cannot detect drift (someone deleting the
// cluster by hand outside of `pulumi destroy`, for instance). The
// `triggers` below cover the one drift case that matters for this
// workshop: editing `kind.yaml` between runs.
const clusterName = "storage-caching-workshop-demo";

const kindConfigPath = path.join(__dirname, "kind.yaml");
const kindConfigContent = fs.readFileSync(kindConfigPath, "utf-8");
const kindConfigHash = crypto
    .createHash("sha256")
    .update(kindConfigContent)
    .digest("hex");

// A demo re-run assumes teardown happened first (see the README's "Run the
// demo" reset section); a duplicate-name `kind create cluster` fails loudly
// rather than silently reusing whatever cluster is already there, which is
// the right failure mode for a workshop where the cluster's actual node
// count and taints matter to the failover drill in 05.
const cluster = new command.local.Command("kind-cluster", {
    create: `kind create cluster --config kind.yaml --name ${clusterName} --wait 120s`,
    delete: `kind delete cluster --name ${clusterName}`,
    dir: __dirname,
    triggers: [kindConfigHash, clusterName],
});

// kind names every cluster's kubeconfig context `kind-<name>` and writes it
// straight into `~/.kube/config` (kind's own default location; no
// `--kubeconfig` flag is passed anywhere in this workshop, so nothing
// overrides it). This is the base project that creates the cluster, so the
// provider below is built from this context string directly rather than a
// `pulumi.StackReference` -- there is no upstream stack to read it from.
const kubeconfigContext = `kind-${clusterName}`;

// `renderYamlToDirectory` lets `npx tsc --noEmit` and a config-driven
// `pulumi preview`/`up` run offline in an environment with no live cluster,
// no kind, and no docker/kubectl installed (this build workstation). It is
// never combined with `context` on the same provider: exactly one of the
// two sourcing modes is active per run.
const config = new pulumi.Config();
const renderYamlToDirectory = config.get("renderYamlToDirectory");
const provider = renderYamlToDirectory
    ? new k8s.Provider("k8s", { renderYamlToDirectory })
    : new k8s.Provider("k8s", { context: kubeconfigContext }, { dependsOn: [cluster] });

// Two namespaces: `longhorn-system` is where the Longhorn Helm chart lands
// (02-longhorn), `caching-workshop` holds the workshop's own application
// resources (the writer workload in 04, the failover drill's targets, and
// the Dragonfly cache in 06/07). Longhorn's own chart does not document a
// `createNamespace` argument on `helm.v4.Chart` -- see 02-longhorn's
// AGENTS.md -- so this project creates both namespaces explicitly up front
// rather than relying on chart or provider auto-creation.
const longhornNamespace = new k8s.core.v1.Namespace("longhorn-system", {
    metadata: { name: "longhorn-system" },
}, { provider });

const workshopNamespace = new k8s.core.v1.Namespace("caching-workshop", {
    metadata: { name: "caching-workshop" },
}, { provider });

// 02-longhorn, 03-storage-class, 04-stateful-app, 06-dragonfly and
// 07-cache-client all read these via `pulumi.StackReference` rather than
// hardcoding the cluster name or namespace names a second time.
export { kubeconfigContext, clusterName };
export const longhornNamespaceName = longhornNamespace.metadata.name;
export const workshopNamespaceName = workshopNamespace.metadata.name;
