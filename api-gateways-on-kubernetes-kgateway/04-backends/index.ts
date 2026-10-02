import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const config = new pulumi.Config();
const installStackRefName = config.get("installStackRef") || "<org>/api-gateways-workshop-install/dev";
const gatewayStackRefName = config.get("gatewayStackRef") || "<org>/api-gateways-workshop-gateway/dev";
const installStackRef = new pulumi.StackReference(installStackRefName);
const gatewayStackRef = new pulumi.StackReference(gatewayStackRefName);
const kubeconfigContext = installStackRef.getOutput("kubeconfigContext");
const namespace = gatewayStackRef.getOutput("namespace");

const renderYamlToDirectory = config.get("renderYamlToDirectory");
const provider = renderYamlToDirectory
    ? new k8s.Provider("k8s", { renderYamlToDirectory })
    : new k8s.Provider("k8s", { context: kubeconfigContext });

// `hashicorp/http-echo` is a single tiny binary that answers every request
// with a fixed text body, pinned to a released tag rather than `latest` --
// exactly the "distinguishable text" the brief's routing scenarios need,
// with nothing else in the container to configure or go wrong.
// https://hub.docker.com/r/hashicorp/http-echo/tags (read 2026-09-28)
const echoImage = "hashicorp/http-echo:1.0.0";
const echoPort = 5678;

function backend(nameSuffix: string, text: string) {
    const labels = { app: `app-${nameSuffix}` };
    const deployment = new k8s.apps.v1.Deployment(`app-${nameSuffix}`, {
        metadata: {
            name: `app-${nameSuffix}`,
            namespace,
        },
        spec: {
            replicas: 1,
            selector: { matchLabels: labels },
            template: {
                metadata: { labels },
                spec: {
                    containers: [{
                        name: "http-echo",
                        image: echoImage,
                        args: [`-text=${text}`, `-listen=:${echoPort}`],
                        ports: [{ containerPort: echoPort }],
                    }],
                },
            },
        },
    }, { provider });

    const service = new k8s.core.v1.Service(`app-${nameSuffix}-svc`, {
        metadata: {
            name: `app-${nameSuffix}-svc`,
            namespace,
        },
        spec: {
            selector: labels,
            ports: [{ port: echoPort, targetPort: echoPort }],
        },
    }, { provider, dependsOn: [deployment] });

    return { deployment, service };
}

const appA = backend("a", "app-a");
const appB = backend("b", "app-b");

export { kubeconfigContext, namespace };
export const appAServiceName = appA.service.metadata.name;
export const appBServiceName = appB.service.metadata.name;
export const backendPort = echoPort;
