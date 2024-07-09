# Functions with Go

## Install Dependencies

```shell
go get ./...
```

## Solutions

### 1. Create an Empty `Cluster` ComponentResource

<details><summary>Click to show</summary><p>

```go
// main.go
_, err := NewCluster(ctx, "cluster")
if err != nil {
    return err
}
```

```go
// component.go
type Cluster struct {
    pulumi.ResourceState
}

func NewCluster(ctx *pulumi.Context, name string, opts ...pulumi.ResourceOption) (*Cluster, error) {
    component := &Cluster{}

    err := ctx.RegisterComponentResource("workshop:cluster:Cluster", name, component, opts...)
    if err != nil {
        return nil, err
    }

    return cluster, nil
}
```

</p></details>

### 2. Add a Civo `KubernetesCluster` Resource

<details><summary>Click to show</summary><p>

```go
// component.go
type Cluster struct {
	pulumi.ResourceState

	network *civo.Network
	cluster *civo.KubernetesCluster
}

type ClusterArgs struct {
	NodePoolSize     int
	NodePoolNodeType string
    Applications string
}

func NewCluster(ctx *pulumi.Context, name string, args *ClusterArgs, opts ...pulumi.ResourceOption) (*Cluster, error) {
	component := &Cluster{}

	err := ctx.RegisterComponentResource("workshop:cluster:Cluster", name, component, opts...)
	if err != nil {
		return nil, err
	}

	component.network, err = civo.NewNetwork(ctx, "network-two", &civo.NetworkArgs{
		Label: pulumi.String("pulumi-workshop"),
	}, pulumi.ResourceOption(pulumi.Parent(component)))

	if err != nil {
		return nil, err
	}

	component.cluster, err = civo.NewKubernetesCluster(ctx, "cluster", &civo.KubernetesClusterArgs{
		Name:            pulumi.String(name),
		NetworkId:       component.network.ID(),
		NumTargetNodes:  pulumi.Int(args.NodePoolSize),
		TargetNodesSize: pulumi.String(args.NodePoolNodeType),
		Applications:    pulumi.String(args.Applications),
	}, pulumi.ResourceOption(pulumi.Parent(component)))

	if err != nil {
		return nil, err
	}

	return component, nil
}
```

```go
// main.go
_, err := NewCluster(ctx, "production", &ClusterArgs{
    NodePoolSize:     2,
    NodePoolNodeType: "g4s.kube.xsmall",
    Applications: "metrics-server,-Traefik-v2-nodepool",
})
```

</p></details>

### 3. Allow for the `KubernetesCluster` to Deploy Workloads

<details><summary>Click to show</summary><p>

```go
// component.go
type Cluster struct {
	pulumi.ResourceState

	network   *civo.Network
	cluster   *civo.KubernetesCluster
    provider  *kubernetes.Provider
	workloads *appsv1.Deployment
}
```

```go
// component.go inside NewCluster
component.provider, err = kubernetes.NewProvider(ctx, "kubernetesProvider", &k8s.ProviderArgs{
    Kubeconfig: component.cluster.Kubeconfig,
})

if err != nil {
    return nil, err
}
```

```go
// component.go - new function
func (c *Cluster) AddWorkload(ctx *pulumi.Context, name string, args *WorkloadArgs) error {
    deployment, err := appsv1.NewDeployment(ctx, name, &appsv1.DeploymentArgs{
        Metadata: &metav1.ObjectMetaArgs{
            Labels: pulumi.StringMap{
                "app": pulumi.String(name),
            },
        },
        Spec: &appsv1.DeploymentSpecArgs{
            Replicas: pulumi.Int(args.Replicas),
            Selector: &metav1.LabelSelectorArgs{
                MatchLabels: pulumi.StringMap{
                    "app": pulumi.String(name),
                },
            },
            Template: &corev1.PodTemplateSpecArgs{
                Metadata: &metav1.ObjectMetaArgs{
                    Labels: pulumi.StringMap{
                        "app": pulumi.String(name),
                    },
                },
                Spec: &corev1.PodSpecArgs{
                    Containers: corev1.ContainerArray{
                        &corev1.ContainerArgs{
                            Name:  pulumi.String(name),
                            Image: pulumi.String(args.Image),
                            Ports: corev1.ContainerPortArray{
                                &corev1.ContainerPortArgs{
                                    ContainerPort: pulumi.Int(args.Port),
                                },
                            },
                        },
                    },
                },
            },
        },
    }, pulumi.Parent(c), pulumi.Provider(c.provider))

    if err != nil {
        return err
    }

    c.workloads = append(c.workloads, deployment)

    return nil
    }
```

```go
// main.go
cluster.AddWorkload(ctx, "nginx", &WorkloadArgs{
    Replicas: 1,
    Image:    "nginx:1.14.2",
    Port:     80,
})
```
</p></details>

### 4. Allow Exposing Workloads as a Service

<details><summary>Click to show</summary><p>

```go
// component.go
type Cluster struct {
	pulumi.ResourceState

	network   *civo.Network
	cluster   *civo.KubernetesCluster
	provider  *kubernetes.Provider
	workloads []*appsv1.Deployment
	services  []*corev1.Service
}

type WorkloadArgs struct {
    Replicas   int
    Image      string
    Port       int
    Expose     bool
    ExposeType string
}
```

```go
// component.go
// add to AddWorkload
if args.Expose {
    return c.expose(ctx, name, args.ExposeType, args.Port)
}

// New function
func (c *Cluster) expose(ctx *pulumi.Context, name string, typ string, port int) error {
    service, err := corev1.NewService(ctx, name, &corev1.ServiceArgs{
        Spec: &corev1.ServiceSpecArgs{
            Type: pulumi.String(typ),
            Selector: pulumi.StringMap{
                "app": pulumi.String(name),
            },
            Ports: corev1.ServicePortArray{
                &corev1.ServicePortArgs{
                    Protocol: pulumi.String("TCP"),
                    Port:     pulumi.Int(port),
                },
            },
        },
    }, pulumi.Parent(c.cluster), pulumi.Provider(c.provider))

    if err != nil {
        return err
    }

    c.services = append(c.services, service)

    return nil
}
```

</p></details>

### 5. Add a Convenience Method that Returns the Kubeconfig

<details><summary>Click to show</summary><p>

```go
// component.go
func (c *Cluster) GetKubeconfig() pulumi.StringOutput {
	return c.cluster.Kubeconfig
}
```

</p></details>
