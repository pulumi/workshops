+++
title = "Testing Cluster Access"
chapter = false
weight = 30
+++

Extract the kubeconfig from the stack output and point the `KUBECONFIG`
environment variable at your cluster configuration file:

```bash
pulumi stack output kubeconfig > kubeconfig.json
export KUBECONFIG=$PWD/kubeconfig.json
```

To test out connectivity, run `kubectl cluster-info`. You should see information similar to this:

```
Kubernetes master is running at https://E7CD24CD6FADEBA48CA1DE87B4E6A260.gr7.us-west-2.eks.amazonaws.com
CoreDNS is running at https://E7CD24CD6FADEBA48CA1DE87B4E6A260.gr7.us-west-2.eks.amazonaws.com/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
```

Check the nodes and pods:

```bash
kubectl get nodes -o wide --show-labels
kubectl get pods -A -o wide
```
