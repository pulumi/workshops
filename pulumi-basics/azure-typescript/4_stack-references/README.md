# Stack References

Use stack references to pass information from one stack to another.  
There are two project directories:

- base_cluster: stands up a base AKS cluster and exports the kubeconfig.
- app: deploys a simple app on a K8s cluster.

# Stack References
This part of the workshop stands up two stacks, `base-infra` and `app` where `app` references `base-infra`.

To that end, `pulumi up` the `base-infra` stack as-is.

Then refer to EXERCISES.md for what to do.
