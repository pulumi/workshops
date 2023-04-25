import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as network from "@pulumi/azure-native/network";
import * as containerservice from "@pulumi/azure-native/containerservice";
import * as k8s from "@pulumi/kubernetes";

// Grab some values from the Pulumi stack configuration (or use defaults)
const projCfg = new pulumi.Config();
const numWorkerNodes = projCfg.getNumber("numWorkerNodes") || 3;
const k8sVersion = projCfg.get("kubernetesVersion") || "1.24.3";
const prefixForDns = projCfg.get("prefixForDns") || "pulumi";
const nodeVmSize = projCfg.get("nodeVmSize") || "Standard_DS2_v2";
// The next two configuration values are required (no default can be provided)
const mgmtGroupId = projCfg.require("mgmtGroupId");
const sshPubKey = projCfg.require("sshPubKey");

// Create a new Azure Resource Group
const resourceGroup = new resources.ResourceGroup("resourceGroup", {});

// Create a new Azure Virtual Network
const virtualNetwork = new network.VirtualNetwork("virtualNetwork", {
    addressSpace: {
        addressPrefixes: ["10.0.0.0/16"],
    },
    resourceGroupName: resourceGroup.name,
});

// Create three subnets in the virtual network
const subnet1 = new network.Subnet("subnet1", {
    addressPrefix: "10.0.0.0/22",
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: virtualNetwork.name,
});

const subnet2 = new network.Subnet("subnet2", {
    addressPrefix: "10.0.4.0/22",
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: virtualNetwork.name,
});

const subnet3 = new network.Subnet("subnet3", {
    addressPrefix: "10.0.8.0/22",
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: virtualNetwork.name,
});

// Create an Azure Kubernetes Cluster
const managedCluster = new containerservice.ManagedCluster("managedCluster", {
    aadProfile: {
        enableAzureRBAC: true,
        managed: true,
        adminGroupObjectIDs: [mgmtGroupId],
    },
    addonProfiles: {},
    // Use multiple agent/node pool profiles to distribute nodes across subnets
    agentPoolProfiles: [{
        availabilityZones: ["1", "2", "3"],
        count: numWorkerNodes,
        enableNodePublicIP: false,
        mode: "System",
        name: "systempool",
        osType: "Linux",
        osDiskSizeGB: 30,
        type: "VirtualMachineScaleSets",
        vmSize: nodeVmSize,
        // Change next line for additional node pools to distribute across subnets
        vnetSubnetID: subnet1.id,
    }],
    // Change authorizedIPRanges to limit access to API server
    // Changing enablePrivateCluster requires alternate access to API server (VPN or similar)
    apiServerAccessProfile: {
        authorizedIPRanges: ["0.0.0.0/0"],
        enablePrivateCluster: false,
    },
    dnsPrefix: prefixForDns,
    enableRBAC: true,
    identity: {
        type: "SystemAssigned",
    },
    kubernetesVersion: k8sVersion,
    linuxProfile: {
        adminUsername: "azureuser",
        ssh: {
            publicKeys: [{
                keyData: sshPubKey,
            }],
        },
    },
    networkProfile: {
        networkPlugin: "azure",
        networkPolicy: "azure",
        serviceCidr: "10.96.0.0/16",
        dnsServiceIP: "10.96.0.10",
    },
    resourceGroupName: resourceGroup.name,
});

// Build a Kubeconfig to access the cluster
const creds = containerservice.listManagedClusterAdminCredentialsOutput({
    resourceGroupName: resourceGroup.name,
    resourceName: managedCluster.name,
});
const encoded = creds.kubeconfigs[0].value;
const decoded = encoded.apply(enc => Buffer.from(enc, "base64").toString());

// Export some values for use elsewhere
export const rgName = resourceGroup.name;
export const networkName = virtualNetwork.name;
export const clusterName = managedCluster.name;
export const kubeconfig = pulumi.secret(decoded);

const k8sProvider = new k8s.Provider("k8s-provider", {
    kubeconfig: kubeconfig,
});

// Deploy the latest version of the bitnami/wordpress chart.
const wordpress = new k8s.helm.v3.Chart("wpdev", {
    fetchOpts: {
        repo: "https://charts.bitnami.com/bitnami"
    },
    chart: "wordpress",
}, {
    provider: k8sProvider,
});

// Export the public IP for WordPress.
const frontend = wordpress.getResource("v1/Service", "default/wpdev-wordpress");
export const frontendIp = frontend.status.loadBalancer.ingress[0].ip;
