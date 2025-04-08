# Advanced Secrets Management on Kubernetes

## Prerequisites

This workshop is using the Pulumi Typescript SDK. You will need to have the following installed:

- [Node.js](https://nodejs.org/en/download/)
- [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

And you should have the following accounts:

- [AWS](https://aws.amazon.com/free/)
- [Pulumi](https://app.pulumi.com/signup)

## Instructions

### Create a new Pulumi project

```bash
pulumi new aws-typescript --name advanced-secrets-management-on-kubernetes --force
```

This command will create a new Pulumi project using the AWS TypeScript template. You will be prompted to enter a stack
name, which you can leave as the default (`dev`), and a project name, which you can also leave as the default (
`advanced-secrets-management-on-kubernetes`). For the AWS region, you can choose any region you like, but for this
workshop, we will use `eu-central-1`.

Now we need to install the required dependencies. Run the following command to install the Pulumi EKS and Kubernetes
libraries:

```bash
npm install @pulumi/eks @pulumi/kubernetes --save
```

Additionally, we need to provide the Pulumi PAT token to our project. You can do this by running the following command:

```bash
pulumi config set pulumi-pat --secret
```

This will prompt you to enter your Pulumi PAT token. You can find your token in the Pulumi console under the "Settings"
tab. You can also use Pulumi ESC to manage your secrets.

```bash
pulumi config env init
```

This will convert your existing Pulumi project configuration to use Pulumi ESC.

### Create a new EKS cluster

Now replace the contents of `index.ts` with the following code:

```typescript
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
```

This code will create a new EKS cluster with some default settings. You can change the settings to fit your needs, or
move them to ESC/config.

### Deploy the EKS cluster

First, you need to set up your AWS credentials. You can do this by running the following command:

```bash
aws configure
```

or

```bash
aws sso login
```

Depending on your AWS setup.

Run the following command to deploy the EKS cluster:

```bash
pulumi up
```

This will take some time, so relax and wait for the deployment to finish.

### Deploy the External Secrets Operator

Now that we have our EKS cluster up and running, we can deploy the External Secrets Operator.

Add the following code to the end of `index.ts`:

```typescript
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
```

This code will create a new namespace for the External Secrets Operator and deploy the operator using Helm. It will also
create a new secret in the namespace with the Pulumi PAT token.

Run the following command to deploy the External Secrets Operator:

```bash
pulumi up
```

### Fetch Secrets from ECS

Now that we have the External Secrets Operator deployed, we can fetch secrets from Pulumi ESC. We going first deploy a
`ClusterSecretStore` and then a `ClusterExternalSecret` to fetch the secret.

Add the following code to the end of `index.ts`:

```typescript
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
```

Deploy the `ClusterSecretStore` and `ClusterExternalSecret`:

```bash
pulumi up
```

### Verify the secret

Before we can verify the secret we need to export the kubeconfig file. You can do by adding the code to your `index.ts`:

```typescript
export const kubeconfig = eksCluster.kubeconfig;
```

Then run the following command to export the kubeconfig file:

```bash
pulumi up
pulumi stack output kubeconfig --show-secrets  > kubeconfig.yaml
```

Now you can use the `kubectl` command to verify the secret:

```bash
export KUBECONFIG=$(pwd)/kubeconfig.yaml
kubectl get secret secret -o yaml -n default -o jsonpath='{.data.esc-secret}' | base64 --decode
```

And you should see the secret value set in Pulumi ESC.

### Deploy the CSI Secret Store Driver

Now that we have the External Secrets Operator deployed, we can deploy the CSI Secret Store Driver to fetch secrets from
and have a comparison with the External Secrets Operator.

Add the following code to the end of `index.ts`:

```typescript
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
```

Now we can add the `SecretProviderClass` to fetch the secret from Pulumi ESC. Add the following code to the end of
`index.ts`:

```typescript
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
```

### Fetch the secret via the CSI Secret Store Driver

Now we can deploy the `Pod` to fetch the secret via the CSI Secret Store Driver. Add the following code to the end of
`index.ts`:

```typescript
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
```

Now you can run the following command to deploy the `Pod`:

```bash
pulumi up
```

### Verify the secret

After deploying the stack, you can get the logs of the busybox pod to see that the secret was successfully mounted:

```bash
NAME=$(kubectl get pods -o name | grep example-provider-pulumi-esc | cut -d'/' -f2)
kubectl logs $NAME
```

You should see the following output:

```bash
+ ls /run/secrets
hello
+ find /run/secrets/ -mindepth 1 -maxdepth 1 -not -name '.*'
+ xargs -t -I '{}' sh -c 'echo "$(cat "{}")"'
sh -c echo "$(cat "/run/secrets/hello")"
world
+ tail -f /dev/null
```

### Clean up

To clean up the resources created by this workshop, run the following command:

```bash
pulumi destroy
```
