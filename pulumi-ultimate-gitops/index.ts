import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import * as eks from "@pulumi/eks";
import * as kubernetes from "@pulumi/kubernetes";
import {ArgoCD} from "./argocd";

const minClusterSize = 3;
const maxClusterSize = 6;
const desiredClusterSize = 3;
const eksNodeInstanceType = "t3.medium";
const vpcNetworkCidr = "10.0.0.0/16";

const config = new pulumi.Config();

const eksVpc = new awsx.ec2.Vpc("eks-vpc", {
    enableDnsHostnames: true,
    cidrBlock: vpcNetworkCidr,
});

const eksCluster = new eks.Cluster("eks-cluster", {
    vpcId: eksVpc.vpcId,
    authenticationMode: eks.AuthenticationMode.Api,
    publicSubnetIds: eksVpc.publicSubnetIds,
    privateSubnetIds: eksVpc.privateSubnetIds,
    instanceType: eksNodeInstanceType,
    desiredCapacity: desiredClusterSize,
    minSize: minClusterSize,
    maxSize: maxClusterSize,
    nodeAssociatePublicIpAddress: false,
    endpointPrivateAccess: false,
    endpointPublicAccess: true,
    corednsAddonOptions: {
        enabled: false,
    }
});

let initialObjects = new pulumi.asset.FileAsset("./argocd-initial-objects.yaml");

const k8sProvider = new kubernetes.Provider("k8s-provider", {
    kubeconfig: eksCluster.kubeconfig,
    enableServerSideApply: true,
})


const argocdNS = new kubernetes.core.v1.Namespace("argocd", {
    metadata: {
        name: "argocd",
    }
}, {provider: k8sProvider});

const argocd = new ArgoCD("argocd", {
    initialObjects: initialObjects,
    name: "argocd",
    version: "8.6.3",
    namespace: argocdNS.metadata.name,
}, {
    providers: {
        kubernetes: k8sProvider,
    },
})

const pulumiOperatorNS = new kubernetes.core.v1.Namespace("pulumi-operator", {
    metadata: {
        name: "pulumi-operator",
    }
}, {provider: k8sProvider});


const doToken = new kubernetes.core.v1.Secret("pulumi-operator-secrets", {
    metadata: {
        namespace: pulumiOperatorNS.metadata.name,
        name: "pulumi-operator-secrets",
    },
    stringData: {
        "do-token": config.require("do-token"),
        "pulumi-access-token": config.require("pulumi-pat"),
    },
    type: "Opaque",
}, {provider: k8sProvider});

export const kubeconfig = pulumi.secret(eksCluster.kubeconfig);
