import * as k8s from "@pulumi/kubernetes";

// Step 4: two plain HTTP echo services, meshed by namespace annotation
// alone — no per-pod sidecar configuration, no manifest surgery. The
// `linkerd.io/inject: enabled` annotation on the namespace is what the
// Linkerd proxy-injector admission webhook looks for; every pod created in
// this namespace after the control plane is up gets the linkerd-proxy
// sidecar automatically.
// Source: https://linkerd.io/docs/features/proxy-injection/ (read 2026-09-25).
const provider = new k8s.Provider("kind", {});

const namespace = new k8s.core.v1.Namespace(
    "mesh-demo",
    {
        metadata: {
            name: "mesh-demo",
            annotations: { "linkerd.io/inject": "enabled" },
        },
    },
    { provider },
);

// A small, well-known echo image keeps this step about the mesh, not about
// the application. Both "front" and "backend" run the same image; only
// "front" calls "backend", so the traffic pattern step 6-7 authorizes and
// then blocks is unambiguous.
const ECHO_IMAGE = "ealen/echo-server:0.9.2";

function echoService(
    name: string,
): { deployment: k8s.apps.v1.Deployment; service: k8s.core.v1.Service } {
    const labels = { app: name };

    // A distinct ServiceAccount per workload, not the namespace's `default`.
    // Linkerd's mesh identity is derived from the pod's ServiceAccount
    // (`<sa>.<namespace>.serviceaccount.identity.linkerd.cluster.local`), so
    // sharing `default` between front and backend would make step 6's
    // identity-based AuthorizationPolicy unable to tell them apart, and
    // step 7's unauthorized test pod indistinguishable from an authorized
    // one if it landed in the same namespace.
    // Source: https://linkerd.io/docs/reference/authorization-policy/#meshtlsauthentication
    // (read 2026-09-25).
    const serviceAccount = new k8s.core.v1.ServiceAccount(
        name,
        { metadata: { namespace: namespace.metadata.name, name } },
        { provider, dependsOn: [namespace] },
    );

    const deployment = new k8s.apps.v1.Deployment(
        name,
        {
            metadata: { namespace: namespace.metadata.name, name },
            spec: {
                replicas: 1,
                selector: { matchLabels: labels },
                template: {
                    metadata: { labels },
                    spec: {
                        serviceAccountName: serviceAccount.metadata.name,
                        containers: [
                            {
                                name: "echo",
                                image: ECHO_IMAGE,
                                ports: [{ name: "http", containerPort: 80 }],
                            },
                        ],
                    },
                },
            },
        },
        { provider, dependsOn: [namespace, serviceAccount] },
    );

    const service = new k8s.core.v1.Service(
        name,
        {
            metadata: { namespace: namespace.metadata.name, name },
            spec: {
                selector: labels,
                ports: [{ name: "http", port: 80, targetPort: 80 }],
            },
        },
        { provider, dependsOn: [namespace] },
    );

    return { deployment, service };
}

const front = echoService("front");
const backend = echoService("backend");

export const meshNamespace = namespace.metadata.name;
export const frontServiceName = front.service.metadata.name;
export const backendServiceName = backend.service.metadata.name;
export const frontServiceAccount = "front";
export const backendServiceAccount = "backend";
