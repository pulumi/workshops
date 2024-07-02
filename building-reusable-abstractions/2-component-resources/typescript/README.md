# ComponentResources with TypeScript

## Install Dependencies

```shell
npm install
```

## Solutions

### 1. Create an Empty `Cluster` ComponentResource

<details><summary>Click to show</summary><p>

```typescript
// index.ts
const cluster = new Cluster("production");
```

```typescript
// component.ts
import * as pulumi from "@pulumi/pulumi";
import * as civo from "@pulumi/civo";
import * as kubernetes from "@pulumi/kubernetes";

class Cluster extends pulumi.ComponentResource {
  constructor(name, opts) {
    super("workshop:cluster:Cluster", name, {}, opts);
  }
}
```

</p></details>

### 2. Add a Civo `KubernetesCluster` Resource

<details><summary>Click to show</summary><p>

```typescript
// component.ts
interface ClusterArgs {
  numTargetNodes: number;
  targetNodesSize: string;
  applications: string;
}

class Cluster extends pulumi.ComponentResource {
  private network: civo.Network;
  private firewall: civo.Firewall;
  private cluster: civo.KubernetesCluster;

  constructor(name, args: ClusterArgs, opts) {
    super("workshop:cluster:Cluster", name, {}, opts);

    this.network = new civo.Network(
      name,
      {
        label: name,
      },
      {
        parent: this,
      }
    );

    this.firewall = new civo.Firewall(
      name,
      {},
      {
        parent: this,
      }
    );

    this.cluster = new civo.KubernetesCluster(
      name,
      {
        name,
        networkId: this.network.id,
        firewallId: this.firewall.id,
        applications: args.applications,
        pools: {
          nodeCount: args.numTargetNodes,
          size: args.targetNodesSize,
        },
      },
      {
        parent: this,
      }
    );
  }
}

```

```typescript
// index.ts
const cluster = new Cluster("production", {
    numTargetNodes: 2,
    targetNodesSize: "g4s.kube.xsmall",
    applications: "metrics-server,-Traefik-v2-nodepool"
});
```

</p></details>

### 3. Allow for the `KubernetesCluster` to Deploy Workloads

<details><summary>Click to show</summary><p>

```typescript
// component.ts
// Add WorkloadArgs interface
interface WorkloadArgs {
  replicas: number;
  image: string;
  port: number;
}

// and allow our Cluster class to contain a list of workloads (Deployments for this)
private workloads: kubernetes.apps.v1.Deployment[];

// we also need to create a Provider inside our constructor
private provider: kubernetes.Provider;

// constructor
this.provider = new kubernetes.Provider(name, {
    kubeconfig: this.cluster.kubeconfig,
}, {
    parent: this,
})
```

Then we can add a new method to our class.

```typescript
public addWorkload(name: string, args: WorkloadArgs) {
this.workloads.push(
    new kubernetes.apps.v1.Deployment(
    name,
    {
        spec: {
        replicas: args.replicas,
        selector: { matchLabels: { app: name } },
        template: {
            metadata: {
            labels: { app: name },
            },
            spec: {
            containers: [
                {
                name,
                image: args.image,
                ports: [{ containerPort: args.port }],
                },
            ],
            },
        },
        },
    },
    {
        provider: this.provider,
        parent: this.cluster,
    }
    )
);
}
```

```typescript
// index.ts
cluster.AddWorkload("nginx", {
    replicas: 1,
    image:    "nginx:1.14.2",
    port:     80,
})
```

</p></details>

### 4. Allow Exposing Workloads as a Service

<details><summary>Click to show</summary><p>

```typescript
// component.ts
// Cluster component properties
private network: civo.Network;
private firewall: civo.Firewall;
private cluster: civo.KubernetesCluster;
private provider: kubernetes.Provider;
private services: kubernetes.core.v1.Service[];
private workloads: kubernetes.apps.v1.Deployment[];

// Extend interface with services
interface WorkloadArgs {
  replicas: number;
  image: string;
  port: number;
  expose: boolean;
  exposeType: string;
}
```

```typescript
// component.ts
// add to addWorkload
if (args.expose) {
    this.expose(name, args.exposeType);
}

// New function
private expose(name: string, type: string, port: number) {
    this.services.push(
        new kubernetes.core.v1.Service(
        "nginx",
        {
            spec: {
            type,
            selector: { app: name },
            ports: [{ protocol: "TCP", port }],
            },
        },
        {
            provider: this.provider,
            parent: this,
        }
        )
    );
}
```

</p></details>

### 5. Add a Convenience Method that Returns the Kubeconfig

<details><summary>Click to show</summary><p>

```typescript
// component.ts
public getKubeconfig(): pulumi.Output<string> {
return this.cluster.kubeconfig;
}
```

</p></details>

## Complete Solution

```typescript
// component.ts
import * as pulumi from "@pulumi/pulumi";
import * as civo from "@pulumi/civo";
import * as kubernetes from "@pulumi/kubernetes";

interface ClusterArgs {
  numTargetNodes: number;
  targetNodesSize: string;
  applications: string;
}

interface WorkloadArgs {
  replicas: number;
  image: string;
  port: number;
  expose?: boolean;
  exposeType?: string;
}

export class Cluster extends pulumi.ComponentResource {
  private network: civo.Network;
  private firewall: civo.Firewall;
  private cluster: civo.KubernetesCluster;
  private provider: kubernetes.Provider;
  private services: kubernetes.core.v1.Service[] = [];
  private workloads: kubernetes.apps.v1.Deployment[] = [];

  constructor(
    name: string,
    args: ClusterArgs,
    opts: pulumi.CustomResourceOptions
  ) {
    super("workshop:cluster:Cluster", name, {}, opts);

    this.network = new civo.Network(
      name,
      {
        label: name,
      },
      {
        parent: this,
      }
    );

    this.firewall = new civo.Firewall(
      name,
      {},
      {
        parent: this,
      }
    );

    this.cluster = new civo.KubernetesCluster(
      name,
      {
        name,
        networkId: this.network.id,
        firewallId: this.firewall.id,
        applications: args.applications,
        pools: {
          nodeCount: args.numTargetNodes,
          size: args.targetNodesSize,
        },
      },
      {
        parent: this,
      }
    );

    this.provider = new kubernetes.Provider(
      name,
      {
        kubeconfig: this.cluster.kubeconfig,
      },
      {
        parent: this,
      }
    );
  }

  public addWorkload(name: string, args: WorkloadArgs) {
    this.workloads.push(
      new kubernetes.apps.v1.Deployment(
        name,
        {
          spec: {
            replicas: args.replicas,
            selector: { matchLabels: { app: name } },
            template: {
              metadata: {
                labels: { app: name },
              },
              spec: {
                containers: [
                  {
                    name,
                    image: args.image,
                    ports: [{ containerPort: args.port }],
                  },
                ],
              },
            },
          },
        },
        {
          provider: this.provider,
          parent: this.cluster,
        }
      )
    );

    if (args.expose && args.exposeType) {
      this.expose(name, args.exposeType, args.port);
    }
  }

  public getKubeconfig(): pulumi.Output<string> {
    return this.cluster.kubeconfig;
  }

  private expose(name: string, type: string, port: number) {
    this.services.push(
      new kubernetes.core.v1.Service(
        "nginx",
        {
          spec: {
            type,
            selector: { app: name },
            ports: [{ protocol: "TCP", port }],
          },
        },
        {
          provider: this.provider,
          parent: this.cluster,
        }
      )
    );
  }
}
```
