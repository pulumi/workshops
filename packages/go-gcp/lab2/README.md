# Lab 2: Implement the component resource

In lab 1, we defined the full schema of our component resource. In this lab, we will fully implement this component resource in Go.

## Initialise your project

If you followed along with lab 1, you should be all set. If not, copy the files to from the `lab2` folder to an empty directory. To verify the correct setup of all the required build tools, run this command in your terminal:

```bash
# Build and install the provider (plugin copied to $GOPATH/bin)
make install_provider
```

If succesful, your terminal output should contain at least the following lines. More lines are possible when the dependencies haven't been downloaded yet.

```bash
rm -rf /Users/ringods/Projects/pulumi/workshops/packages/go-gcp/lab1/bin/pulumi-resource-ced
cd provider/cmd/pulumi-resource-ced && VERSION=0.0.1 SCHEMA=/Users/ringods/Projects/pulumi/workshops/packages/go-gcp/lab1/schema.yaml go generate main.go
cd provider/cmd/pulumi-resource-ced && go build -o /Users/ringods/Projects/pulumi/workshops/packages/go-gcp/lab1/bin/pulumi-resource-ced -ldflags "-X github.com/pulumi/pulumi-ced/provider/pkg/version.Version=0.0.1" .
cp /Users/ringods/Projects/pulumi/workshops/packages/go-gcp/lab1/bin/pulumi-resource-ced /Users/ringods/Projects/golang/bin
Time: 0h:00m:06s                                                                                                                 
```

## Implement the component

On the implementation side, the implementation of our component follows the practices defined for Pulumi [Component Resources](https://www.pulumi.com/docs/intro/concepts/resources/components/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops). Similar to every Pulumi resource, creating a (component) resource in Go is via a `NewXXX` function taking 4 arguments:

* `ctx`: a Pulumi context object
* `name`: the name of the resource
* `args`: a Go struct defining the resource specific input properties
* `opts`: the Pulumi resources options struct.

The implementation of this component is in `provider/pkg/provider/serviceIdentity.go`. Let's first create [the skeleton](https://www.pulumi.com/docs/intro/concepts/resources/components/#authoring-a-new-component-resource?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops):

```go
type ServiceIdentityArgs struct {
}

// The ServiceIdentity component resource.
type ServiceIdentity struct {
  pulumi.ResourceState
}

// NewServiceIdentity creates a new ServiceIdentity component resource.
func NewServiceIdentity(ctx *pulumi.Context,
	name string, args *ServiceIdentityArgs, opts ...pulumi.ResourceOption) (*ServiceIdentity, error) {

  component := &ServiceIdentity{}
	err := ctx.RegisterComponentResource("ced:iam:ServiceIdentity", name, component, opts...)
	if err != nil {
		return nil, err
	}

  return component, nil
}
```

The schema defined input and output properties. We need to map these to the Go types, which happens using annotations in the Go `struct`s. For the inputs, we map the struct attribute to the name of the input property from the schema:

```go
type ServiceIdentityArgs struct {
	NameSpace pulumi.StringInput `pulumi:"nameSpace"`
}
```

Similarly for the output properties, this becomes:

```go
type ServiceIdentity struct {
	pulumi.ResourceState

	GcpServiceAccount pulumi.StringOutput `pulumi:"gcpServiceAccount"`
	GkeServiceAccount pulumi.StringOutput `pulumi:"gkeServiceAccount"`
}
```

Before the final `return` statement, we construct both service accounts as required by the Workload Identity documentation:

```go
	// Create a Google Cloud ServiceAccount.
	gcpServiceAccount, err := serviceaccount.NewAccount(ctx, name, &serviceaccount.AccountArgs{
		AccountId:   pulumi.String(name),
		DisplayName: pulumi.String(name),
	}, pulumi.Parent(component))
	if err != nil {
		return nil, err
	}

	// Create a Kubernetes ServiceAccount
	gkeServiceAccount, err := core.NewServiceAccount(ctx, name, &core.ServiceAccountArgs{
		AutomountServiceAccountToken: pulumi.Bool(true),
		Metadata: meta.ObjectMetaArgs{
			Namespace: args.NameSpace,
			Annotations: pulumi.StringMap{
				"iam.gke.io/gcp-service-account": gcpServiceAccount.Email,
			},
		},
	}, pulumi.Parent(component))
	if err != nil {
		return nil, err
	}
```

Following this section, and still before the final `return` statement, we wire up everything in the component:

```go
	component.GkeServiceAccount = pulumi.StringOutput(gkeServiceAccount.Metadata.Name())
	component.GcpServiceAccount = gcpServiceAccount.AccountId

	if err := ctx.RegisterResourceOutputs(component, pulumi.Map{
		"gkeServiceAccount": component.GkeServiceAccount,
		"gcpServiceAccount": component.GcpServiceAccount,
	}); err != nil {
		return nil, err
	}
```

<details><summary>The complete Pulumi component file can be seen here</summary>

```go
// Copyright 2016-2022, Pulumi Corporation.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package provider

import (
	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/serviceaccount"
	core "github.com/pulumi/pulumi-kubernetes/sdk/v3/go/kubernetes/core/v1"
	meta "github.com/pulumi/pulumi-kubernetes/sdk/v3/go/kubernetes/meta/v1"

	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

type ServiceIdentityArgs struct {
	NameSpace pulumi.StringInput `pulumi:"nameSpace"`
}

// The ServiceIdentity component resource.
type ServiceIdentity struct {
	pulumi.ResourceState

	GcpServiceAccount pulumi.StringOutput `pulumi:"gcpServiceAccount"`
	GkeServiceAccount pulumi.StringOutput `pulumi:"gkeServiceAccount"`
}

// NewServiceIdentity creates a new ServiceIdentity component resource.
func NewServiceIdentity(ctx *pulumi.Context,
	name string, args *ServiceIdentityArgs, opts ...pulumi.ResourceOption) (*ServiceIdentity, error) {
	if args == nil {
		args = &ServiceIdentityArgs{
			NameSpace: pulumi.String("default"),
		}
	}

	component := &ServiceIdentity{}
	err := ctx.RegisterComponentResource("ced:iam:ServiceIdentity", name, component, opts...)
	if err != nil {
		return nil, err
	}

	// Create a Google Cloud ServiceAccount.
	gcpServiceAccount, err := serviceaccount.NewAccount(ctx, name, &serviceaccount.AccountArgs{
		AccountId:   pulumi.String(name),
		DisplayName: pulumi.String(name),
	}, pulumi.Parent(component))
	if err != nil {
		return nil, err
	}

	// Create a Kubernetes ServiceAccount
	gkeServiceAccount, err := core.NewServiceAccount(ctx, name, &core.ServiceAccountArgs{
		AutomountServiceAccountToken: pulumi.Bool(true),
		Metadata: meta.ObjectMetaArgs{
			Namespace: args.NameSpace,
			Annotations: pulumi.StringMap{
				"iam.gke.io/gcp-service-account": gcpServiceAccount.Email,
			},
		},
	}, pulumi.Parent(component))
	if err != nil {
		return nil, err
	}

	component.GkeServiceAccount = pulumi.StringOutput(gkeServiceAccount.Metadata.Name())
	component.GcpServiceAccount = gcpServiceAccount.AccountId

	if err := ctx.RegisterResourceOutputs(component, pulumi.Map{
		"gkeServiceAccount": component.GkeServiceAccount,
		"gcpServiceAccount": component.GcpServiceAccount,
	}); err != nil {
		return nil, err
	}

	return component, nil
}
```

</details>

## Wire the component in the provider

The provider makes this component resource available in the `construct` function in `provider/pkg/provider/provider.go`. When `construct` is called and the `typ` argument is `ced:iam:ServiceIdentity`, we create an instance of the `ServiceIdentity` component resource and return its `URN` and state.

Since we receive generic `ConstructInputs` over the gRPC bridge into our provider, we need to convert these to our own Go datatypes. The Go annotations in the structs are at work during this conversion.

```go
func constructServiceIdentity(ctx *pulumi.Context, name string, inputs provider.ConstructInputs,
	options pulumi.ResourceOption) (*provider.ConstructResult, error) {

	args := &ServiceIdentityArgs{}
	if err := inputs.CopyTo(args); err != nil {
		return nil, errors.Wrap(err, "setting args")
	}

	// Create the component resource.
	serviceIdentity, err := NewServiceIdentity(ctx, name, args, options)
	if err != nil {
		return nil, errors.Wrap(err, "creating component ServiceIdentity")
	}

	// Return the component resource's URN and state. `NewConstructResult` automatically sets the
	// ConstructResult's state based on resource struct fields tagged with `pulumi:` tags with a value
	// that is convertible to `pulumi.Input`.
	return provider.NewConstructResult(serviceIdentity)
}
```

Now we can wire up the `construct` function to the `constructServiceIdentity` function based on the resource type:

```go
func construct(ctx *pulumi.Context, typ, name string, inputs provider.ConstructInputs,
	options pulumi.ResourceOption) (*provider.ConstructResult, error) {
	switch typ {
	case "ced:iam:ServiceIdentity":
		return constructServiceIdentity(ctx, name, inputs, options)
	default:
		return nil, errors.Errorf("unknown resource type %s", typ)
	}
}
```

<details><summary>The complete Pulumi provider file can be seen here</summary>

```go
// Copyright 2016-2022, Pulumi Corporation.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package provider

import (
	"github.com/pkg/errors"

	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi/provider"
)

func construct(ctx *pulumi.Context, typ, name string, inputs provider.ConstructInputs,
	options pulumi.ResourceOption) (*provider.ConstructResult, error) {
	switch typ {
	case "ced:iam:ServiceIdentity":
		return constructServiceIdentity(ctx, name, inputs, options)
	default:
		return nil, errors.Errorf("unknown resource type %s", typ)
	}
}

func constructServiceIdentity(ctx *pulumi.Context, name string, inputs provider.ConstructInputs,
	options pulumi.ResourceOption) (*provider.ConstructResult, error) {

	args := &ServiceIdentityArgs{}
	if err := inputs.CopyTo(args); err != nil {
		return nil, errors.Wrap(err, "setting args")
	}

	// Create the component resource.
	serviceIdentity, err := NewServiceIdentity(ctx, name, args, options)
	if err != nil {
		return nil, errors.Wrap(err, "creating component")
	}

	// Return the component resource's URN and state. `NewConstructResult` automatically sets the
	// ConstructResult's state based on resource struct fields tagged with `pulumi:` tags with a value
	// that is convertible to `pulumi.Input`.
	return provider.NewConstructResult(serviceIdentity)
}
```

</details>

## Build the component plugin

With `provider.go` and `serviceIdentity.go` completed, we can now build the plugin binary:

```bash
# Build and install the provider (plugin copied to $GOPATH/bin)
make install_provider
```

This should create the binary for your platform and install the binary in `${GOPATH}/bin/pulumi-resource-ced`. Make sure `${GOPATH}/bin` is also added to your `PATH` environment variable. It is needed to consume the resource type.

Let's continue with consuming this component resource in [lab 3](../lab3)
