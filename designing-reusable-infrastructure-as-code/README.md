# Designing Reusable Infrastructure as Code 🛠️

Welcome to the hands‑on workshop that shows you how to **package, publish, and reuse** your infrastructure logic with Pulumi Components. By the end, you will have:

* Written a Source‑based Component in Go and TypeScript
* Consumed that component from another Pulumi program (in a different language!)
* Reused existing Terraform modules inside Pulumi

> **Time investment**: about 30minutes.

---

## 🚀What you will build

1. **Talos Kubernetes cluster on DigitalOcean** – wrapped as a reusable `ComponentResource` in Go.
2. **Cross‑language consumption** – import the Go component into a TypeScript Pulumi program.
3. **Terraform interop** – call public and local TF modules straight from Pulumi.

Every shell step and code block below is copy‑paste ready.

---

## 🔧Prerequisites

Make sure these tools are installed and on your PATH:

* Pulumi CLI
* [Node.js](https://nodejs.org/)20+
* [Go](https://go.dev/doc/install)1.20+

That is it. Let’s dive in.

---

## Create a Pulumi Component (Go)

We will create a Talos K8s Cluster on DigitalOcean as a `ComponentResource`.

### Create a new Pulumi project

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

### Scaffold component directory

```bash
mkdir -p pkg/talos
touch pkg/talos/talos.go
```

### Add provider SDKs

```bash
go get github.com/pulumiverse/pulumi-talos/sdk/go/talos
go get github.com/pulumi/pulumi-digitalocean/sdk/v4/go/digitalocean
go get github.com/pulumi/pulumi-tls/sdk/v5/go/tls
```

### Write the component

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

Pulumi supports `ComponentResource` in every supported language. More details: [https://www.pulumi.com/docs/iac/concepts/resources/components/](https://www.pulumi.com/docs/iac/concepts/resources/components/).

### Use the component

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

---

## Consume the Component from another language

### Package the component

```bash
mkdir 02-consume
cd 02-consume
cp -r ../01-create/talos-go-component .
```

Create `PulumiPlugin.yaml` to let Pulumi know this directory exports resources:

```yaml
runtime: go
```

Change `main.go` to:

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

### Consume in TypeScript

```bash
mkdir ts-consume
cd ts-consume
pulumi new --force typescript
```

Add the component as a dependency:

```bash
pulumi package add ../talos-go-component   
```

You can now import and use it just like any other Pulumi package.

---

## Bonus – reuse Terraform modules in Pulumi

### Call a public TF module

```bash
mkdir 03-modules
cd 03-modules
pulumi new --force aws-typescript
```

When prompted, pick your preferred AWS region (for example `eu-central-1`).

Install the S3 module:

```bash
pulumi package add terraform-module terraform-aws-modules/s3-bucket/aws 4.6.0 bucketmod
```

Pulumi will scaffold an SDK and print something like:

```
Downloading provider: terraform-module
Successfully generated a Nodejs SDK for the bucketmod package

...

You can then import the SDK in your TypeScript code with:

  import * as bucketmod from "@pulumi/bucketmod";
```

Replace `index.ts`:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as bucketmod from '@pulumi/bucketmod';

const cfg = new pulumi.Config();
const prefix = cfg.get("prefix") ?? pulumi.getStack();

const myBucket = new bucketmod.Module('test-bucket', {
  bucket_prefix: `test-bucket-${prefix}`,
  force_destroy: true
});

export const bucketName = myBucket.s3_bucket_id;
```

Log into AWS, then run `pulumi up`. You should see the bucket name in the outputs.

### Consume a local TF module

```bash
cp -R ../tf-mod-minecraft .

pulumi package add terraform-module "$PWD/tf-mod-minecraft" modminecraft
```

Add to `index.ts`:

```typescript
import * as modminecraft from "@pulumi/modminecraft";

const server = new modminecraft.Module("minecraft-server", {
    name: "minecraft-server",
    public_key_path: "<path to your public key>.pub",
});

export const serverIP = server.minecraft_instance_public_ip;
```

Deploy with `pulumi up` and note the `serverIP` output.

When finished:

```bash
pulumi destroy
pulumi stack rm dev
```

---

## 🎉You are done

You have built a reusable Pulumi Component, consumed it across languages, and mixed Terraform modules into the mix. Keep experimenting and share what you create!
