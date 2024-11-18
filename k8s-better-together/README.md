# k8s-better-together

- `eks-cluster` contains an EKS cluster running in a cluster. The stack has the kubeconfig for the cluster as an output and also creates an ESC environment which contains the kubeconfig. Spin up this stack first (before a live demonstration, since it takes about 10 minutes).
- `workload-plain` contains a simple stateless workload (NGINX) that uses the built-in Kubernetes types.
- `workload-yaml` contains the same stateless workload, but demonstrates how the Pulumi Kubernetes provider can consume YAML files.
- `workload-helm` contains a sample workload that demonstrates the use of the Helm Chart resource.
- `crd-example` contains a simple example of `crd2pulumi`, but is more for creating slides than running an actual demo.

To explore the resources running on the K8s cluster with `k9s`:

```bash
pulumi env run k8s-better-together/eks-cluster k9s
```
