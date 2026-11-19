# Steps 2 to 4: the provider stack

One Pulumi project, `kbind-provider`, with a local component `KbindProvider`. Config flags turn on one stage at a time.

- Step 2, `cluster`: EKS cluster (`@pulumi/eks` 4.4.0, Kubernetes 1.35, managed node group, 2 x t3.medium, public subnets).
- Step 3, `backend`: Helm release of `oci://ghcr.io/kbind-dev/charts/backend` 0.8.1 with `backend.image.repository=ghcr.io/kbind-dev/backend`, `backend.image.tag=v0.8.1`, embedded OIDC and a LoadBalancer Service. Then `address`: the load balancer hostname becomes `externalAddress` and `/api/callback` the OIDC callback URL.
- Step 4, `export`: the `mangodb` CRD, `APIServiceExportTemplate` and `Collection`.

Exports: `backendUrl`, `backendHost`, `clusterName`, `kubeconfig` (secret).

## Commands

```bash
02-provider/deploy.sh cluster
02-provider/deploy.sh backend
02-provider/deploy.sh address
02-provider/deploy.sh export
```

Each stage runs `pulumi config set <flag>`, `pulumi preview` and `pulumi up` for `<org>/provider-dev`. If the Helm Release rejects the OCI chart: `02-provider/pull-chart.sh` (runs `helm pull ... --version 0.8.1 --untar`), then repeat `deploy.sh backend`.

## Proof

```bash
02-provider/check.sh cluster   # kubectl get nodes: 2 Ready, v1.35
02-provider/check.sh backend   # kubectl get pods -n kube-bind; curl <backendUrl>/healthz
02-provider/check.sh export    # kubectl get apiserviceexporttemplates
```

Not run here.
