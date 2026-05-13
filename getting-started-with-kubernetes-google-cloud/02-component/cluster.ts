// GkeWorkshopCluster — a reusable, production-close GKE cluster.
//
// Encapsulates VPC + subnet + Cloud Router + NAT, the GKE cluster itself
// (via the terraform-google-modules/kubernetes-engine private-cluster
// module imported through the @pulumi/gke terraform-module bridge),
// three node pools (system / workload / workload-spot), Dataplane V2 +
// Hubble metrics, Backup-for-GKE, and a kubernetes Provider built from
// the cluster's endpoint + CA + a short-lived OAuth token.
//
// Workshop-specific bits (Vertex IAM, Flux, monitoring dashboards) stay
// in the consumer.

import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as gke from "@pulumi/gke";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

export interface GkeWorkshopClusterArgs {
    /** GCP project the cluster lives in. */
    projectId: pulumi.Input<string>;
    /** GCP region for the regional cluster (3 zones). */
    region: pulumi.Input<string>;

    /** Cluster + VPC base name. Default: "gke-workshop". */
    clusterName?: pulumi.Input<string>;

    /** Primary subnet CIDR. Default: "10.10.0.0/20". */
    vpcCidr?: pulumi.Input<string>;
    /** Pod IP range CIDR. Default: "10.20.0.0/14". */
    podsCidr?: pulumi.Input<string>;
    /** Service IP range CIDR. Default: "10.24.0.0/20". */
    servicesCidr?: pulumi.Input<string>;
    /** Master IPv4 CIDR for the private control plane. Default: "172.16.0.0/28". */
    masterCidr?: pulumi.Input<string>;

    /** Workload node pool machine type. Default: "e2-standard-4". */
    nodeMachineType?: pulumi.Input<string>;
    /** Workload node pool min count per zone. Default: 1. */
    nodeMinCount?: pulumi.Input<number>;
    /** Workload node pool max count per zone. Default: 5. */
    nodeMaxCount?: pulumi.Input<number>;
    /** Provision the workload-spot node pool (Spot VMs, autoscale 0–5). Default: true. */
    enableSpotPool?: pulumi.Input<boolean>;

    /** Provision the Backup-for-GKE addon + daily backup plan. Default: true. */
    enableBackup?: pulumi.Input<boolean>;
    /** How long to retain backups, in days. Default: 7. */
    backupRetentionDays?: pulumi.Input<number>;
    /** Cron schedule for the backup plan. Default: "0 2 * * *" (02:00 UTC). */
    backupCronSchedule?: pulumi.Input<string>;

    /** Enable Dataplane V2 metrics + Hubble relay. Default: true. */
    enableDataplaneV2Metrics?: pulumi.Input<boolean>;
    /** Enable Managed Prometheus. Default: true. */
    enableManagedPrometheus?: pulumi.Input<boolean>;
}

export class GkeWorkshopCluster extends pulumi.ComponentResource {
    public readonly clusterId: pulumi.Output<string>;
    public readonly clusterName: pulumi.Output<string>;
    public readonly clusterEndpoint: pulumi.Output<string>;
    public readonly clusterCaCertificate: pulumi.Output<string>;
    public readonly vpcName: pulumi.Output<string>;
    public readonly subnetName: pulumi.Output<string>;
    public readonly kubeconfig: pulumi.Output<string>;
    public readonly kubeconfigPath: pulumi.Output<string>;
    public readonly backupPlanId: pulumi.Output<string | undefined>;

    constructor(
        name: string,
        args: GkeWorkshopClusterArgs,
        opts?: pulumi.ComponentResourceOptions,
    ) {
        super("gke-workshop:index:GkeWorkshopCluster", name, {}, opts);

        const clusterName = args.clusterName ?? "gke-workshop";
        const vpcCidr = args.vpcCidr ?? "10.10.0.0/20";
        const podsCidr = args.podsCidr ?? "10.20.0.0/14";
        const servicesCidr = args.servicesCidr ?? "10.24.0.0/20";
        const masterCidr = args.masterCidr ?? "172.16.0.0/28";
        const nodeMachineType = args.nodeMachineType ?? "e2-standard-4";
        const nodeMinCount = args.nodeMinCount ?? 1;
        const nodeMaxCount = args.nodeMaxCount ?? 5;
        const enableSpotPool = args.enableSpotPool ?? true;
        const enableBackup = args.enableBackup ?? true;
        const backupRetentionDays = args.backupRetentionDays ?? 7;
        const backupCronSchedule = args.backupCronSchedule ?? "0 2 * * *";
        const enableDataplaneV2Metrics = args.enableDataplaneV2Metrics ?? true;
        const enableManagedPrometheus = args.enableManagedPrometheus ?? true;

        // ----------------------------------------------------------------
        // Network — VPC, subnet (with secondary ranges for pods/services),
        //           Cloud Router, Cloud NAT
        // ----------------------------------------------------------------

        const vpc = new gcp.compute.Network(
            `${name}-vpc`,
            {
                name: pulumi.interpolate`${clusterName}-vpc`,
                autoCreateSubnetworks: false,
            },
            { parent: this },
        );

        const subnet = new gcp.compute.Subnetwork(
            `${name}-subnet`,
            {
                name: pulumi.interpolate`${clusterName}-subnet`,
                region: args.region,
                network: vpc.id,
                ipCidrRange: vpcCidr,
                secondaryIpRanges: [
                    { rangeName: "pods", ipCidrRange: podsCidr },
                    { rangeName: "services", ipCidrRange: servicesCidr },
                ],
                privateIpGoogleAccess: true,
            },
            { parent: this },
        );

        const router = new gcp.compute.Router(
            `${name}-router`,
            {
                name: pulumi.interpolate`${clusterName}-router`,
                region: args.region,
                network: vpc.id,
            },
            { parent: this },
        );

        new gcp.compute.RouterNat(
            `${name}-nat`,
            {
                name: pulumi.interpolate`${clusterName}-nat`,
                router: router.name,
                region: args.region,
                natIpAllocateOption: "AUTO_ONLY",
                sourceSubnetworkIpRangesToNat: "ALL_SUBNETWORKS_ALL_IP_RANGES",
            },
            { parent: this },
        );

        // ----------------------------------------------------------------
        // GKE — private regional cluster via the terraform-module bridge.
        // ----------------------------------------------------------------

        const nodePools: any[] = [
            {
                name: "system",
                machine_type: "e2-standard-2",
                min_count: 1,
                max_count: 2,
                initial_node_count: 1,
                disk_size_gb: 50,
                disk_type: "pd-balanced",
                image_type: "COS_CONTAINERD",
                auto_repair: true,
                auto_upgrade: true,
            },
            {
                name: "workload",
                machine_type: nodeMachineType,
                min_count: nodeMinCount,
                max_count: nodeMaxCount,
                initial_node_count: 1,
                disk_size_gb: 50,
                disk_type: "pd-balanced",
                image_type: "COS_CONTAINERD",
                auto_repair: true,
                auto_upgrade: true,
            },
        ];

        const nodePoolsOauthScopes: { [k: string]: pulumi.Input<string>[] } = {
            system: ["https://www.googleapis.com/auth/cloud-platform"],
            workload: ["https://www.googleapis.com/auth/cloud-platform"],
        };

        const nodePoolsLabels: { [k: string]: { [k: string]: pulumi.Input<string> } } = {
            system: { pool: "system" },
            workload: { pool: "workload" },
        };

        const nodePoolsMetadata: { [k: string]: { [k: string]: pulumi.Input<string> } } = {
            system: { "disable-legacy-endpoints": "true" },
            workload: { "disable-legacy-endpoints": "true" },
        };

        if (enableSpotPool) {
            nodePools.push({
                name: "workload-spot",
                machine_type: nodeMachineType,
                spot: true,
                min_count: 0,
                max_count: nodeMaxCount,
                initial_node_count: 0,
                disk_size_gb: 50,
                disk_type: "pd-balanced",
                image_type: "COS_CONTAINERD",
                auto_repair: true,
                auto_upgrade: true,
            });
            nodePoolsOauthScopes["workload-spot"] = [
                "https://www.googleapis.com/auth/cloud-platform",
            ];
            nodePoolsLabels["workload-spot"] = { pool: "workload-spot" };
            nodePoolsMetadata["workload-spot"] = { "disable-legacy-endpoints": "true" };
        }

        const cluster = new gke.Module(
            `${name}-gke`,
            {
                project_id: args.projectId,
                name: clusterName,
                region: args.region,
                regional: true,

                network: vpc.name,
                subnetwork: subnet.name,
                ip_range_pods: "pods",
                ip_range_services: "services",

                release_channel: "REGULAR",

                enable_private_nodes: true,
                enable_private_endpoint: false,
                master_ipv4_cidr_block: masterCidr,

                // Workshop convenience — restrict in production.
                master_authorized_networks: [
                    { cidr_block: "0.0.0.0/0", display_name: "workshop-open" },
                ],

                datapath_provider: "ADVANCED_DATAPATH",
                monitoring_enable_observability_metrics: enableDataplaneV2Metrics,
                monitoring_enable_observability_relay: enableDataplaneV2Metrics,
                enable_cilium_clusterwide_network_policy: true,

                identity_namespace: pulumi.interpolate`${args.projectId}.svc.id.goog`,
                horizontal_pod_autoscaling: true,
                enable_vertical_pod_autoscaling: true,
                enable_shielded_nodes: true,
                remove_default_node_pool: true,
                initial_node_count: 1,
                deletion_protection: false,

                gke_backup_agent_config: enableBackup,

                logging_enabled_components: [
                    "SYSTEM_COMPONENTS",
                    "WORKLOADS",
                    "APISERVER",
                    "CONTROLLER_MANAGER",
                    "SCHEDULER",
                ],

                monitoring_enabled_components: [
                    "SYSTEM_COMPONENTS",
                    "APISERVER",
                    "SCHEDULER",
                    "CONTROLLER_MANAGER",
                    "STORAGE",
                    "HPA",
                    "POD",
                    "DAEMONSET",
                    "DEPLOYMENT",
                    "STATEFULSET",
                    "KUBELET",
                    "CADVISOR",
                ],
                monitoring_enable_managed_prometheus: enableManagedPrometheus,

                node_pools: nodePools,
                node_pools_oauth_scopes: nodePoolsOauthScopes,
                node_pools_labels: nodePoolsLabels,
                node_pools_metadata: nodePoolsMetadata,
                node_pools_taints: {
                    system: [
                        {
                            key: "components.gke.io/gke-managed-components",
                            value: "true",
                            effect: "NO_SCHEDULE",
                        },
                    ],
                },
            },
            { parent: this },
        );

        // ----------------------------------------------------------------
        // Kubeconfig — built from the cluster endpoint + CA + a
        // short-lived OAuth token from the gcp provider's ADC.
        //
        // Note: we expose `kubeconfig` as an Output<string>, NOT a
        // k8s.Provider. Cross-package resource references (a
        // @pulumi/kubernetes Provider exported by a non-kubernetes
        // package) are not representable in the multi-language Pulumi
        // schema, so the consumer constructs its own
        // `new k8s.Provider("gke", { kubeconfig: cluster.kubeconfig })`.
        // Two extra lines on the consumer side; clean schema in return.
        // ----------------------------------------------------------------

        const clientConfig = gcp.organizations.getClientConfigOutput();

        const kubeconfig = pulumi
            .all([
                cluster.endpoint,
                cluster.ca_certificate,
                clientConfig.accessToken,
                clusterName,
            ])
            .apply(([endpoint, ca, token, ctxName]) => {
                return yaml.dump({
                    apiVersion: "v1",
                    kind: "Config",
                    clusters: [
                        {
                            name: ctxName,
                            cluster: {
                                server: `https://${endpoint}`,
                                "certificate-authority-data": ca,
                            },
                        },
                    ],
                    contexts: [
                        {
                            name: ctxName,
                            context: { cluster: ctxName, user: ctxName },
                        },
                    ],
                    "current-context": ctxName,
                    users: [{ name: ctxName, user: { token: token } }],
                });
            });

        // Mirror of the pre-component `local_file.kubeconfig` behaviour:
        // write the kubeconfig YAML to disk at apply time so consumers
        // can `export KUBECONFIG=$(pulumi stack output kubeconfig_path)`
        // without piping the secret output. Side-effect `apply` runs
        // only when inputs are known (skipped during preview).
        //
        // process.cwd() resolves to the consumer's project root (where
        // `pulumi up` was invoked from), not the component package
        // directory — so the file lands next to the consumer's
        // Pulumi.yaml.
        const kubeconfigFilePath = path.join(process.cwd(), "kubeconfig");
        kubeconfig.apply((content) => {
            fs.writeFileSync(kubeconfigFilePath, content, { mode: 0o600 });
        });

        // ----------------------------------------------------------------
        // Backup for GKE — daily plan, configurable retention.
        // ----------------------------------------------------------------

        let backupPlanId: pulumi.Output<string | undefined>;
        if (enableBackup) {
            const backupPlan = new gcp.gkebackup.BackupPlan(
                `${name}-backup`,
                {
                    name: pulumi.interpolate`${clusterName}-daily`,
                    cluster: pulumi.interpolate`projects/${args.projectId}/locations/${args.region}/clusters/${clusterName}`,
                    location: args.region,
                    backupConfig: {
                        includeVolumeData: true,
                        includeSecrets: true,
                        allNamespaces: true,
                    },
                    backupSchedule: {
                        cronSchedule: backupCronSchedule,
                    },
                    retentionPolicy: {
                        backupDeleteLockDays: 0,
                        backupRetainDays: backupRetentionDays,
                    },
                },
                { parent: this, dependsOn: [cluster] },
            );
            backupPlanId = backupPlan.id;
        } else {
            backupPlanId = pulumi.output(undefined as string | undefined);
        }

        // ----------------------------------------------------------------
        // Outputs.
        // ----------------------------------------------------------------

        this.clusterId = cluster.cluster_id.apply((id) => id ?? "");
        this.clusterName = cluster.name.apply((n) => n ?? "");
        this.clusterEndpoint = cluster.endpoint.apply((e) => e ?? "");
        this.clusterCaCertificate = cluster.ca_certificate.apply((c) => c ?? "");
        this.vpcName = vpc.name;
        this.subnetName = subnet.name;
        this.kubeconfig = pulumi.secret(kubeconfig);
        this.kubeconfigPath = pulumi.output(kubeconfigFilePath);
        this.backupPlanId = backupPlanId;

        this.registerOutputs({
            clusterId: this.clusterId,
            clusterName: this.clusterName,
            clusterEndpoint: this.clusterEndpoint,
            clusterCaCertificate: this.clusterCaCertificate,
            vpcName: this.vpcName,
            subnetName: this.subnetName,
            kubeconfig: this.kubeconfig,
            kubeconfigPath: this.kubeconfigPath,
            backupPlanId: this.backupPlanId,
        });
    }
}
