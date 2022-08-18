import * as eks from "@pulumi/eks"

// Create an EKS cluster with the default VPC, and default node group with 
// two t2.medium node instances.
const cluster = new eks.Cluster("eks", {
    deployDashboard: false,
});
