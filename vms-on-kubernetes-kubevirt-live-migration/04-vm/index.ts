import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

// This VM is booted from a `containerDisk` with `cloudInitNoCloud`, not a
// `DataVolume`/PVC. KubeVirt's own live-migration guide is explicit that a
// PVC-backed VM needs shared storage to be migratable: "Virtual machines
// using a PersistentVolumeClaim (PVC) must have a shared ReadWriteMany (RWX)
// access mode to be live migrated"
// (https://kubevirt.io/user-guide/compute/live_migration/, read 2026-09-26).
// A stock `kind` cluster's default `local-path` storage class is
// ReadWriteOnce, so a `DataVolume`-backed VM here would not be migratable and
// would break this workshop's own promise. A `containerDisk` bakes the disk
// image into a container image with no PVC involved, so it is migratable on
// any storage class, including `kind`'s. The `DataVolume`/CDI path is a
// documented next step for participants who need a persistent-disk VM; see
// this file's `AGENTS.md`.

const config = new pulumi.Config();
const vmName = config.get("vmName") ?? "demo-vm";
const memoryRequest = config.get("memoryRequest") ?? "256Mi";

// The provider talks to the `kind` cluster `02-cluster` created. There is no
// automated dependency edge between this stack and `02-cluster` or
// `03-kubevirt`: Pulumi `StackReference`s read another stack's outputs, they
// do not create the `dependsOn` ordering that resources within one program
// get. This stack must be `pulumi up`'d only after `03-kubevirt` reports
// `Deployed` (KubeVirt operator ready); see the workshop README's "Run the
// demo" section, which already sequences the four Pulumi projects correctly.
const clusterStackRefName =
    config.get("clusterStackRef") ?? "<org>/vms-cluster/dev";
const clusterStackRef = new pulumi.StackReference(clusterStackRefName);
// `02-cluster` exports `kubeconfigContext` (a plain string, kind's own
// `kind-<name>` naming convention), not raw kubeconfig content: kind writes
// to the default `~/.kube/config` and this project selects the right entry
// in it by context name, the same pattern `03-kubevirt` uses.
const kubeconfigContext = clusterStackRef.getOutput("kubeconfigContext");

// Optional passthrough so this stack's manifests can be rendered offline
// (no live cluster needed) the same way `03-kubevirt` supports it, via
// https://www.pulumi.com/registry/packages/kubernetes/api-docs/provider/.
// The provider rejects `context` and `renderYamlToDirectory` together
// (verified: "context arg is not compatible with renderYamlToDirectory
// arg"), so `context` is only passed when rendering is not requested.
const renderYamlToDirectory = config.get("renderYamlToDirectory");

const provider = renderYamlToDirectory
    ? new k8s.Provider("kind", { renderYamlToDirectory })
    : new k8s.Provider("kind", { context: kubeconfigContext });

// A minimal cloud-init payload: it only sets a hostname. Cirros's documented
// default login is out of scope for this build — do not invent undocumented
// credentials. Guest access for this demo is via `virtctl console`, which
// authenticates through the Kubernetes API and does not need SSH or a known
// password at all; see `05-console/console.sh`.
const cloudInitUserData = `#cloud-config
hostname: ${vmName}
`;

const vm = new k8s.apiextensions.CustomResource(
    "vm",
    {
        apiVersion: "kubevirt.io/v1",
        kind: "VirtualMachine",
        metadata: {
            name: vmName,
        },
        spec: {
            running: true,
            template: {
                metadata: {
                    labels: {
                        // KubeVirt's own convention for labeling the VMI's
                        // pod; the Service below selects on this label.
                        "kubevirt.io/domain": vmName,
                    },
                },
                spec: {
                    // Prefer live migration over deletion under node
                    // pressure (e.g. `kubectl drain`), per
                    // https://kubevirt.io/user-guide/cluster_admin/node_maintenance/.
                    evictionStrategy: "LiveMigrate",
                    domain: {
                        devices: {
                            disks: [
                                { name: "containerdisk", disk: { bus: "virtio" } },
                                { name: "cloudinitdisk", disk: { bus: "virtio" } },
                            ],
                            // Standard pod-network binding KubeVirt VMs use
                            // by default: the VM shares the pod's network
                            // namespace through a NAT'd (masquerade) interface.
                            interfaces: [{ name: "default", masquerade: {} }],
                        },
                        resources: {
                            requests: {
                                memory: memoryRequest,
                            },
                        },
                    },
                    networks: [{ name: "default", pod: {} }],
                    volumes: [
                        {
                            name: "containerdisk",
                            containerDisk: {
                                // No pinned tag is documented for this image
                                // by KubeVirt (see the labs manifest,
                                // https://kubevirt.io/labs/manifests/vm.yaml);
                                // `:latest` is used here and should be
                                // reconfirmed and pinned by digest before a
                                // live session if reproducibility matters.
                                image: "quay.io/kubevirt/cirros-container-disk-demo:latest",
                            },
                        },
                        {
                            name: "cloudinitdisk",
                            cloudInitNoCloud: {
                                userData: cloudInitUserData,
                            },
                        },
                    ],
                },
            },
        },
    },
    { provider },
);

// NodePort Service for port 22. This assumes the containerDisk image's
// cloud-init brings up an SSH server; bare cirros images are not guaranteed
// to run sshd out of the box. The guaranteed connectivity path for this demo
// is `virtctl console` (see `05-console/console.sh`), which talks to the VMI
// through the Kubernetes API and needs no guest network service at all. Treat
// this Service's SSH reachability as something to verify during a real
// rehearsal, not something to assume from this code.
const service = new k8s.core.v1.Service(
    "vm-ssh",
    {
        metadata: {
            name: `${vmName}-ssh`,
        },
        spec: {
            type: "NodePort",
            selector: {
                "kubevirt.io/domain": vmName,
            },
            ports: [{ port: 22, targetPort: 22, protocol: "TCP" }],
        },
    },
    { provider },
);

export const exportedVmName = vmName;
export const serviceName = service.metadata.name;
// `05-console/console.sh` and `06-live-migration/*.sh` discover the assigned
// NodePort at run time with:
//   kubectl get svc "${serviceName}" -o jsonpath='{.spec.ports[0].nodePort}'
// rather than hardcoding it, since NodePort is allocated by the cluster
// unless pinned.
