# Stack References

Use stack references to pass information from one stack to another.  
There are two project directories:

- base_cluster: stands up a base AKS cluster and exports the kubeconfig.
- app: deploys a simple app on a K8s cluster.

# Set Up Environment

- Create two directories for each project: `mkdir base_cluster app`
- Pull down the base_infra project:
  - `cd base_cluster`
  - `pulumi new <base_cluster-URL>`
  - `pulumi up`
- Pull down the app project:
  - `cd ../app`
  - `pulumi new <app-URL>`
  - See EXERCISES.md for the exercises.
  - See the `solutions` folder for the answers.