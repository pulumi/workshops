import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import * as eks from "@pulumi/eks";
import * as kubernetes from "@pulumi/kubernetes";


const minClusterSize = 3;
const maxClusterSize = 6;
const desiredClusterSize = 3;
const eksNodeInstanceType = "t3.medium";
const vpcNetworkCidr = "10.0.0.0/16";

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
});


const k8sProvider = new kubernetes.Provider("k8s-provider", {
    kubeconfig: eksCluster.kubeconfig,
    enableServerSideApply: true,
})

const externalSecretsNamespace = new kubernetes.core.v1.Namespace("external-secrets-namespace", {
    metadata: {
        name: "external-secrets",
    }
}, {provider: k8sProvider});

const externalSecretsRelease = new kubernetes.helm.v3.Release("external-secrets-release", {
    chart: "external-secrets",
    version: "0.10.4",
    namespace: externalSecretsNamespace.metadata.apply(metadata => metadata.name),
    repositoryOpts: {
        repo: "https://charts.external-secrets.io",
    },
}, {provider: k8sProvider});

const config = new pulumi.Config();

const patSecret = new kubernetes.core.v1.Secret("patSecret", {
    metadata: {
        namespace: externalSecretsNamespace.metadata.apply(metadata => metadata.name),
        name: "pulumi-access-token",
    },
    stringData: {
        "pulumi-access-token": config.require("pulumi-pat"),
    },
    type: "Opaque",
}, {provider: k8sProvider});

const clusterSecretStore = new kubernetes.apiextensions.CustomResource("cluster-secret-store", {
    apiVersion: "external-secrets.io/v1beta1",
    kind: "ClusterSecretStore",
    metadata: {
        name: "secret-store",
    },
    spec: {
        provider: {
            pulumi: {
                organization: pulumi.getOrganization(),
                project: "dirien",
                environment: "hello-world",
                accessToken: {
                    secretRef: {
                        name: patSecret.metadata.name,
                        key: "pulumi-access-token",
                        namespace: patSecret.metadata.namespace,
                    },
                },
            },
        },
    },
}, {dependsOn: externalSecretsRelease, provider: k8sProvider});

const externalSecret = new kubernetes.apiextensions.CustomResource("external-secret", {
    apiVersion: "external-secrets.io/v1beta1",
    kind: "ExternalSecret",
    metadata: {
        name: "secret",
        namespace: "default",
    },
    spec: {
        data: [
            {
                secretKey: "esc-secret",
                remoteRef: {
                    key: "hello",
                }
            }
        ],
        refreshInterval: "20s",
        secretStoreRef: {
            kind: clusterSecretStore.kind,
            name: clusterSecretStore.metadata.name,
        }
    },
}, {dependsOn: externalSecretsRelease, provider: k8sProvider});

export const kubeconfig = eksCluster.kubeconfig;

const secretsStoreCSIDriver = new kubernetes.helm.v4.Chart("secrets-store-csi-driver", {
    chart: "secrets-store-csi-driver",
    namespace: "kube-system",
    repositoryOpts: {
        repo: "https://kubernetes-sigs.github.io/secrets-store-csi-driver/charts",
    },
    values: {
        nodeSelector: {
            "kubernetes.io/os": "linux",
        },
    },
}, {provider: k8sProvider});

const secretsStoreCSIPulumiESCProvider = new kubernetes.helm.v4.Chart(
    "secrets-store-csi-pulumi-esc-provider",
    {
        chart: "oci://ghcr.io/pulumi/helm-charts/pulumi-esc-csi-provider",
        namespace: "kube-system",
        values: {
            nodeSelector: {
                "kubernetes.io/os": "linux",
            },
        },
    },
    {dependsOn: secretsStoreCSIDriver, provider: k8sProvider},
);

const secretProviderClass = new kubernetes.apiextensions.CustomResource(
    "example-provider-pulumi-esc",
    {
        apiVersion: "secrets-store.csi.x-k8s.io/v1",
        kind: "SecretProviderClass",
        metadata: {
            name: "example-provider-pulumi-esc",
            namespace: "default",
        },
        spec: {
            provider: "pulumi",
            parameters: {
                apiUrl: "https://api.pulumi.com/api/esc",
                organization: "dirien",
                project: "esc-secrets-store-csi-driver-demo",
                environment: "csi-secrets-store-app",
                authSecretName: patSecret.metadata.name,
                authSecretNamespace: patSecret.metadata.namespace,
                secrets: `- secretPath: "/"
  fileName: "hello"
  secretKey: "app.hello"
`,
            },
        },
    },
    {dependsOn: secretsStoreCSIPulumiESCProvider, provider: k8sProvider},
);

const deployment = new kubernetes.apps.v1.Deployment("example-provider-pulumi-esc", {
    metadata: {
        name: "example-provider-pulumi-esc",
        namespace: "default",
        labels: {
            app: "example-provider-pulumi-esc",
        },
    },
    spec: {
        replicas: 1,
        selector: {
            matchLabels: {
                app: "example-provider-pulumi-esc",
            },
        },
        template: {
            metadata: {
                labels: {
                    app: "example-provider-pulumi-esc",
                },
            },
            spec: {
                containers: [
                    {
                        name: "client",
                        image: "busybox:latest",
                        command: ["sh", "-c"],
                        args: [
                            `set -eux
                            ls /run/secrets
                            find /run/secrets/ -mindepth 1 -maxdepth 1 -not -name '.*' | xargs -t -I {} sh -c 'echo "$(cat "{}")"'
                            tail -f /dev/null`,
                        ],
                        volumeMounts: [
                            {
                                name: "data",
                                mountPath: "/run/secrets",
                            },
                        ],
                    },
                ],
                volumes: [
                    {
                        name: "data",
                        csi: {
                            driver: "secrets-store.csi.k8s.io",
                            readOnly: true,
                            volumeAttributes: {
                                secretProviderClass: secretProviderClass.metadata.name,
                            },
                        },
                    },
                ],
            },
        },
    },
}, {dependsOn: secretsStoreCSIPulumiESCProvider, provider: k8sProvider});
