import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import * as eks from "@pulumi/eks";
import * as k8s from "@pulumi/kubernetes";

// Grab some values from the Pulumi configuration (or use default values)
const config = new pulumi.Config();
const minClusterSize = config.getNumber("minClusterSize") || 3;
const maxClusterSize = config.getNumber("maxClusterSize") || 6;
const desiredClusterSize = config.getNumber("desiredClusterSize") || 3;
const eksNodeInstanceType = config.get("eksNodeInstanceType") || "t3.medium";
const vpcNetworkCidr = config.get("vpcNetworkCidr") || "10.0.0.0/16";

// Create a new VPC
const eksVpc = new awsx.ec2.Vpc("eks-vpc", {
    enableDnsHostnames: true,
    cidrBlock: vpcNetworkCidr,
});

// Create the EKS cluster
const eksCluster = new eks.Cluster("eks-cluster", {
    // Put the cluster in the new VPC created earlier
    vpcId: eksVpc.vpcId,
    // Public subnets will be used for load balancers
    publicSubnetIds: eksVpc.publicSubnetIds,
    // Private subnets will be used for cluster nodes
    privateSubnetIds: eksVpc.privateSubnetIds,
    // Change configuration values to change any of the following settings
    instanceType: eksNodeInstanceType,
    desiredCapacity: desiredClusterSize,
    minSize: minClusterSize,
    maxSize: maxClusterSize,
    // Do not give the worker nodes public IP addresses
    nodeAssociatePublicIpAddress: false,
    // Uncomment the next two lines for a private cluster (VPN access required)
    // endpointPrivateAccess: true,
    // endpointPublicAccess: false
});


// Export some values for use elsewhere
export const kubeconfig = eksCluster.kubeconfig;
export const vpcId = eksVpc.vpcId;

const k8sProvider = new k8s.Provider("k8s-provider", {
    kubeconfig: kubeconfig
});


const nginxDeployment = new k8s.apps.v1.Deployment("nginx-deployment", {
    metadata: {
        name: "nginx-deployment",
        labels: { app: "nginx" },
    },
    spec: {
        replicas: 1,
        selector: { matchLabels: { app: "nginx" } },
        template: {
            metadata: { labels: { app: "nginx" } },
            spec: {
                containers: [
                    {
                        name: "nginx",
                        image: "nginx:1.19.10",
                        ports: [{ containerPort: 80 }],
                    },
                ],
            },
        },
    },
}, { provider: k8sProvider });

export const labels = nginxDeployment.metadata.labels;

// Create Nginx LoadBalancer service
const nginxService = new k8s.core.v1.Service("nginx-service", {
    metadata: { name: "nginx-service" },
    spec: {
        selector: { app: "nginx" },
        type: "LoadBalancer",
        ports: [{ port: 80, targetPort: 80 }],
    },
}, { provider: k8sProvider });

export const nginxLoadBalancerAddress = nginxService.status.loadBalancer.ingress[0].hostname;

const frontend = wordpress.getResource("v1/Service", "default/wpdev-wordpress");
export const frontendIp = frontend.status.loadBalancer.ingress[0].ip;
