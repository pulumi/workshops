# Designing Reusable Infrastructure as Code

This workshop guides you through creating and consuming a Source-based Pulumi Component
You'll learn how to:

- Create a Source-based Pulumi Component in TypeScript
- Reference and use the component in Pulumi YAML
- Bonus: Learn how to reuse TF modules in Pulumi Programs

**Estimated time**: 30 minutes

## Prerequisites

Before starting this workshop, ensure you have:

- Pulumi CLI installed
- [Node.js](https://nodejs.org/) 20+ installed
- [Go](https://go.dev/doc/install) 1.20+ installed

## Create a Pulumi Component

For a workshop, we will create a Talos K8s Cluster on DigitalOcean as a `ComponentResource`

## Create a New Pulumi Project

First, let's create a new Pulumi project using the Go template:

```bash
mkdir 01-create && cd 01-create
mkdir talos-go-component && cd talos-go-component
pulumi new --force go
This command will walk you through creating a new Pulumi project.

Enter a value or leave blank to accept the (default), and press <ENTER>.
Press ^C at any time to quit.

Project name (talos-go-component):  
Project description (A minimal Go Pulumi program):  
Created project 'talos-go-component'

Please enter your desired stack name.
To create a stack in an organization, use the format <org-name>/<stack-name> (e.g. `acmecorp/dev`).
Stack name (dev): dev 
Created stack 'dev'

Installing dependencies...

Finished installing dependencies

Your new project is ready to go! ✨

To perform an initial deployment, run `pulumi up`
```

Now create a `pkg/talos` directory and a `talos.go` file in it:

```bash
mkdir -p pkg/talos
touch pkg/talos/talos.go
```

Add the talos go module and DigitalOcean provider to your `go.mod` file:

```bash
go get github.com/pulumiverse/pulumi-talos/sdk/go/talos
go get github.com/pulumi/pulumi-digitalocean/sdk/v4/go/digitalocean
go get github.com/pulumi/pulumi-tls/sdk/v5/go/tls
```

With this in place, we can start creating our component resource. I will not go into to much of the details of how the
Talos provider is working. More importantly, is the use of the `ComponentResource` and how we can use it to create a
reusable component.

```go
type TalosClusterArgs struct {
	ClusterName       pulumi.StringInput `pulumi:"clusterName"`
	Version           pulumi.StringInput `pulumi:"version"`
	Region            pulumi.StringInput `pulumi:"region"`
	CountControlPlane int                `pulumi:"countControlPlane"`
	CountWorker       int                `pulumi:"countWorker"`
	Size              pulumi.StringInput `pulumi:"size"`
}

type TalosCluster struct {
	pulumi.ResourceState
	TalosClusterArgs
	Kubeconfig pulumi.StringOutput `pulumi:"kubeconfig"`
}

func NewTalosCluster(ctx *pulumi.Context, name string, talosClusterArgs TalosClusterArgs, opts ...pulumi.ResourceOption) (*TalosCluster, error) {
	myComponent := &TalosCluster{}
	err := ctx.RegisterComponentResource("pkg:index:TalosCluster", name, myComponent, opts...)
	if err != nil {
		return nil, err
	}
	// Omit the rest of the code for brevity
    err = ctx.RegisterResourceOutputs(myComponent, pulumi.Map{
        "kubeconfig": clusterKubeconfig.KubeconfigRaw,
    })
    if err != nil {
        return nil, err
    }
    myComponent.Kubeconfig = clusterKubeconfig.KubeconfigRaw
    return myComponent, nil
    }
}
```

First we define the `TalosClusterArgs` struct, which contains the arguments we want to pass to our component. This is our interface
for the component. We also define the `TalosCluster` struct, which contains the state of our component and the output we want to return. We also 
want to return the inputs as outputs, so we can use them in the future. We also define the `NewTalosCluster` function, which is the constructor for our component. This function takes the context, name, and arguments as input and returns a pointer to the `TalosCluster` struct.

Pulumi supports `ComponentResource` for all supported languages. The example above is in Go, but you can also use TypeScript, Python, and C#. 
Check https://www.pulumi.com/docs/iac/concepts/resources/components/ for details.

Now we can use this component in our main program. We will create a new stack and use the component to create a Talos cluster.

```go
package main

import (
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"talos-go-component/pkg/talos"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		component, err := talos.NewTalosCluster(ctx, "talos-cluster", talos.TalosClusterArgs{
			ClusterName:       pulumi.String("talos-cluster"),
			Version:           pulumi.String("v1.9.5"),
			Region:            pulumi.String("lon1"),
			CountControlPlane: 3,
			CountWorker:       1,
			Size:              pulumi.String("s-2vcpu-4gb"),
		})
		if err != nil {
			return err
		}
		ctx.Export("kubeconfig", component.Kubeconfig)
		return nil
	})
}
```

## Consume a Component Resource from a different language

Let's create a new folder for this section and copy the `go` component to it:

```bash
mkdir 02-consume
cd 02-consume
cp -r ../01-create/talos-go-component .
```

We need to tell Pulumi this directory contains exportable resources.

Create a `PulumiPlugin.yaml` file in the same directory:

```yaml
runtime: go
```

And change the `main.go` file to:

```go
package main

import (
    "github.com/pulumi/pulumi-go-provider/infer"
)

func main() {
    err := infer.NewProviderBuilder().
            WithName("go-components").
            WithNamespace("your-org-name").
            WithComponents(
                infer.Component(MyComponent),
            ).
            BuildAndRun()

    if err != nil {
        panic(err)
    }
}
```
