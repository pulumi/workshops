import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import * as pulumi from "@pulumi/pulumi";
import * as command from "@pulumi/command";

// kind has no Pulumi provider: there is no `kind.Cluster` resource to declare.
// This project models the cluster's lifecycle explicitly with
// `@pulumi/command`'s `local.Command`, running `kind create cluster` on
// create and `kind delete cluster` on delete, so `pulumi destroy` genuinely
// removes the cluster rather than leaving it running underneath a stack that
// claims to be gone. See the root README's "Is `kind` modeled in Pulumi?"
// section for the full rationale.
//
// This is a deliberate, demo-only shortcut: `local.Command` has no real
// "read" or "diff" step, so Pulumi cannot detect drift (someone deleting the
// cluster by hand outside of `pulumi destroy`, for instance). `triggers`
// below covers the one drift case that matters for this workshop: editing
// `kind.yaml` between runs.

const config = new pulumi.Config();
const resolvedClusterName = config.get("clusterName") ?? "vms-workshop-demo";

const kindConfigPath = path.join(__dirname, "kind.yaml");
const kindConfigContent = fs.readFileSync(kindConfigPath, "utf-8");
const kindConfigHash = crypto
    .createHash("sha256")
    .update(kindConfigContent)
    .digest("hex");

// A demo re-run assumes teardown happened first (see `07-teardown`); a
// duplicate-name `kind create cluster` fails loudly rather than silently
// reusing whatever cluster is already there, which is the right failure
// mode for a workshop where the cluster's actual contents matter.
const cluster = new command.local.Command("kind-cluster", {
    create: `kind create cluster --config kind.yaml --name ${resolvedClusterName} --wait 90s`,
    delete: `kind delete cluster --name ${resolvedClusterName}`,
    dir: __dirname,
    triggers: [kindConfigHash, resolvedClusterName],
});

// `03-kubevirt` and `04-vm` build their `kubernetes.Provider` from this
// context: kind names every cluster's kubeconfig context `kind-<name>`, and
// writes that context straight into `~/.kube/config` (kind's own default
// location; it takes no `--kubeconfig` flag in this workshop, so nothing
// overrides it). Both downstream projects read `kubeconfigContext` from this
// stack's outputs via `pulumi.StackReference` rather than hardcoding the
// name a second time.
export const clusterName = cluster.stdout.apply(() => resolvedClusterName);
export const kubeconfigContext = `kind-${resolvedClusterName}`;
export const kubeconfigPath = "~/.kube/config";
