# vms-vm

Pulumi TypeScript project: one `VirtualMachine` custom resource
(`kubernetes.apiextensions.CustomResource`, `kubevirt.io/v1`) and one
`NodePort` `Service` selecting it, in `index.ts`. This is the demo VM for the
"VMs on Kubernetes as Code" workshop, provisioned on top of the kind cluster
(`../02-cluster`) and KubeVirt install (`../03-kubevirt`).

## How to work here

- containerDisk, not DataVolume: KubeVirt's live-migration guide says "Virtual
  machines using a PersistentVolumeClaim (PVC) must have a shared
  ReadWriteMany (RWX) access mode to be live migrated"
  (https://kubevirt.io/user-guide/compute/live_migration/, read 2026-09-26).
  `kind`'s default `local-path` storage class is ReadWriteOnce, so a
  `DataVolume`/PVC-backed VM here would not be migratable and would break
  this workshop's own promise. This project boots the VM from a
  `containerDisk` (the disk image baked into a container image, no PVC
  involved) with `cloudInitNoCloud` for guest configuration instead. The
  `DataVolume`/CDI path is where this workshop goes next for participants who
  need a persistent-disk VM; it is not built here.
- `evictionStrategy: LiveMigrate` on the VMI template spec is what makes the
  scheduler prefer migrating this VM over deleting it under node pressure
  (https://kubevirt.io/user-guide/cluster_admin/node_maintenance/).
- The container disk image is `quay.io/kubevirt/cirros-container-disk-demo`,
  from KubeVirt's own labs manifest reference
  (https://kubevirt.io/labs/manifests/vm.yaml). KubeVirt does not document a
  pinned tag for this image, so `:latest` is used; reconfirm and pin by
  digest before a live session if reproducibility matters.
- SSH caveat: the `NodePort` Service exposes port 22 on the assumption that
  the containerDisk image's cloud-init brings up an SSH server. A bare cirros
  image is not guaranteed to run sshd. The guaranteed connectivity path for
  this demo is `virtctl console` (`../05-console/console.sh`), which talks to
  the VMI through the Kubernetes API and needs no guest network service at
  all. Verify SSH reachability during a real rehearsal; do not assume it from
  this code.
- No automated cross-stack ordering: this stack must be `pulumi up`'d only
  after `../03-kubevirt` reports `Deployed`. Pulumi `StackReference`s read
  another stack's outputs, they do not create a `dependsOn` edge across
  separately-run `pulumi up` invocations. The workshop `README.md`'s "Run the
  demo" section already sequences this correctly.
- Config: `vmName` (default `demo-vm`), `memoryRequest` (default `256Mi`),
  `clusterStackRef` (the `02-cluster` stack reference, e.g.
  `<org>/vms-cluster/dev`), and optional `renderYamlToDirectory` for offline
  manifest rendering without a live cluster.

## Verification

- `npx tsc --noEmit` must pass.
- Once the VM is up, `kubectl get vmi demo-vm` should show phase `Running`
  (the workshop's learning outcome 1).
- To find which node the VM is running on:
  `kubectl get vmi demo-vm -o wide`.
