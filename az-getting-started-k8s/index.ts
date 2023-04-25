import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as network from "@pulumi/azure-native/network";
import * as containerservice from "@pulumi/azure-native/containerservice";
import * as keyvault from "@pulumi/azure-native/keyvault";
import * as authorization from "@pulumi/azure-native/authorization";
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
    addonProfiles: {
        azureKeyvaultSecretsProvider: {
            config: {
                enableSecretRotation: "true",
            },
            enabled: true,
        },
    },
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

const addonProfile = managedCluster.addonProfiles.apply(x => x!["azureKeyvaultSecretsProvider"]);
export const clientId = addonProfile.apply(x => x.identity.clientId!);
export const objectId = addonProfile.apply(x => x.identity.objectId!);

const auth = authorization.getClientConfig();
const tenantId = auth.then(x => x.tenantId);

const keyVault = new keyvault.Vault("keyVault", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    properties: {
        sku: {
            family: "A",
            name: "standard",
        },
        tenantId: tenantId,
        accessPolicies: [{
            objectId: objectId,
            tenantId: tenantId,
            permissions: {
                secrets: ["get"],
            },
        }],
        enabledForDeployment: true,
        enabledForDiskEncryption: true,
        enabledForTemplateDeployment: true,
    },
});

const kvSecret = new keyvault.Secret("secret", {
    vaultName: keyVault.name,
    secretName: "mySecret",
    properties: {
        value: "MySecretValue!"
    },
    resourceGroupName: resourceGroup.name,
});

// It looks like the Azure API may have changed so that
// listManagedClusterUserCredentialsOutput now defaults to device login, which
// requires authenticating against a web page with a one-time code. Device login
// does not work for programmatically creating K8s resources, so we must use
// listManagedClusterAdminCredentialsOutput, which gives us a more vanilla
// kubeconfig output:
const creds = containerservice.listManagedClusterAdminCredentialsOutput({
    resourceGroupName: resourceGroup.name,
    resourceName: managedCluster.name,
});

const encoded = creds.kubeconfigs[0].value;
export const kubeconfig = encoded.apply(enc => Buffer.from(enc, "base64").toString());

const k8sProvider = new k8s.Provider("k8s-provider", {
    kubeconfig: kubeconfig,
    // renderYamlToDirectory: "yaml"
});

const yamlProvider = new k8s.Provider("yaml-provider", {
    renderYamlToDirectory: "yaml"
});


const k8sSecretName = "aks-secret";
const k8sSecretKey = "demosecret";

const secretProviderName = "kv-secret-provider";
new k8s.apiextensions.CustomResource("secret-provider", {
    apiVersion: "secrets-store.csi.x-k8s.io/v1",
    kind: "SecretProviderClass",
    metadata: {
        name: secretProviderName
    },
    spec: {
        provider: "azure",
        secretObjects: [{
            secretName: k8sSecretName,
            type: "Opaque",
            data: [{
                objectName: kvSecret.name,
                key: k8sSecretKey,
            }]
        }],
        parameters: {
            usePodIdentity: "false",
            useVMManagedIdentity: "true",
            userAssignedIdentityID: clientId,
            keyvaultName: keyVault.name,
            // objects: `|
            //     array:
            //         - |
            //             objectName: ${k8sSecretKey} # name of secret in key vault
            //             objectType: secret # object types: secret, key, or cert
            //             objectVersion:
            // `,
            objects: pulumi.jsonStringify([{
                objectName: kvSecret.name,
                objectType: "secret",
                objectVersion: ""
            }]),
            tenantId: tenantId,
        }
    }
}, {
    provider: yamlProvider,
});

const secretVolumeName = "secret-volume";
new k8s.core.v1.Pod("pod", {
    metadata: {
        name: "docker-getting-started"
    },
    spec: {
        containers: [{
            name: "docker-getting-started",
            image: "docker/getting-started",
            env: [{
                name: "MY_KV_SECRET",
                valueFrom: {
                    secretKeyRef: {
                        name: k8sSecretName,
                        key: k8sSecretKey,
                    },
                }
            }],
            volumeMounts: [{
                name: secretVolumeName,
                mountPath: "/mnt/secrets",
                readOnly: true,
            }]
        }],
        volumes: [{
            name: secretVolumeName,
            csi: {
                driver: "secrets-store.csi.k8s.io",
                readOnly: true,
                volumeAttributes: {
                    secretProviderClass: secretProviderName
                }
            }
        }]
    }
}, {
    provider: yamlProvider
});

// Export some values for use elsewhere
// export const rgName = resourceGroup.name;
// export const networkName = virtualNetwork.name;
// export const clusterName = managedCluster.name;
// export const kubeconfig = decoded;
