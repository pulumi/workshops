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
const clusterName = "kafka-workshop-demo";

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
// `pulumi preview` run offline in an environment with no live cluster, no
// kind, and no docker/kubectl installed (this sandbox). It is never
// combined with `context` on the same provider: exactly one of the two
// sourcing modes is active per run.
const config = new pulumi.Config();
const renderYamlToDirectory = config.get("renderYamlToDirectory");
const provider = renderYamlToDirectory
    ? new k8s.Provider("k8s", { renderYamlToDirectory })
    : new k8s.Provider("k8s", { context: kubeconfigContext }, { dependsOn: [cluster] });

// The Strimzi Cluster Operator watches this namespace for Kafka, KafkaNodePool,
// and KafkaTopic custom resources across the rest of this workshop.
const kafkaNamespace = new k8s.core.v1.Namespace("kafka", {
    metadata: { name: "kafka" },
}, { provider });

// The Strimzi Cluster Operator's Helm chart is distributed only as an OCI
// artifact as of 1.2.0 -- there is no HTTP Helm repository to `helm repo
// add` any more. `chart: "oci://..."` plus `version` is the documented form
// for an OCI chart reference on `helm.v4.Chart`, matching what the operator
// project's own install instructions show for the plain `helm` CLI.
// https://strimzi.io/docs/operators/latest/deploying (read 2026-09-27)
// https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/ (read 2026-09-27)
const strimziOperatorChart = new k8s.helm.v4.Chart("strimzi-cluster-operator", {
    chart: "oci://quay.io/strimzi-helm/strimzi-kafka-operator",
    version: "1.2.0",
    namespace: kafkaNamespace.metadata.name,
}, { provider });

// `02-kafka` and later projects read these via `pulumi.StackReference`
// rather than hardcoding the cluster name or namespace a second time.
export { kubeconfigContext, clusterName };
export const namespace = kafkaNamespace.metadata.name;
