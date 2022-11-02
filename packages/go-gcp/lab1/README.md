# Lab 1: Define the Pulumi component schema

This workshop lab shows the creation of a Pulumi Package, developped in Go and consumed by our YAML support.

## Initialise your project

Copy the files to from the `lab1` folder to an empty directory. To verify the correct setup of all the required build tools, run this command in your terminal:

```bash
# Build and install the provider (plugin copied to $GOPATH/bin)
make install_provider
```

If succesful, your terminal output should contain at least the following lines. More lines are possible when the dependencies haven't been downloaded yet.

```
rm -rf /Users/ringods/Projects/pulumi/workshops/packages/go-gcp/lab1/bin/pulumi-resource-ced
cd provider/cmd/pulumi-resource-ced && VERSION=0.0.1 SCHEMA=/Users/ringods/Projects/pulumi/workshops/packages/go-gcp/lab1/schema.yaml go generate main.go
cd provider/cmd/pulumi-resource-ced && go build -o /Users/ringods/Projects/pulumi/workshops/packages/go-gcp/lab1/bin/pulumi-resource-ced -ldflags "-X github.com/pulumi/pulumi-ced/provider/pkg/version.Version=0.0.1" .
cp /Users/ringods/Projects/pulumi/workshops/packages/go-gcp/lab1/bin/pulumi-resource-ced /Users/ringods/Projects/golang/bin
Time: 0h:00m:06s                                                                                                                 
```

## Define component dependencies

If we want correctly working SDKs for the different programming languages, we need to feed the required dependencies to the code generator. We can do this using the `language` section in the Pulumi `schema.yaml` file. This section controls the SDK generation including the language specific package descriptor file. For example, for NodeJS that is the file named `package.json`.

In our component, we will create Google Cloud and Kubernetes resources. Let's add the required dependencies for each client SDK:

```yaml
language:
  csharp:
    packageReferences:
      Pulumi: 3.*
      Pulumi.Gcp: 6.*
      Pulumi.Kubernetes: 3.*
  go:
    generateResourceContainerTypes: true
    importBasePath: github.com/pulumi/pulumi-ced/sdk/go/ced
  nodejs:
    dependencies:
      "@pulumi/gcp": "^6.0.0"
      "@pulumi/kubernetes": "^3.0.0"
    devDependencies:
      typescript: "^3.7.0"
  python:
    requires:
      pulumi: ">=3.0.0,<4.0.0"
      pulumi-gcp: ">=6.0.0,<7.0.0"
      pulumi-kubernetes: ">=3.0.0,<4.0.0"
```

For each of the language specific ecosystems, we define the package dependencies in the form that the package descriptor needs it.

## Define the component resource

When using Google Kubernetes Engine, the more secure way to allow your workloads to access other Google Cloud services is to use [Workload Identity](https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity). For this to work, we need a well constructed pair of a [Google Cloud Service Account](https://www.pulumi.com/registry/packages/gcp/api-docs/serviceaccount/account/) and a [Kubernetes Service Account](https://www.pulumi.com/registry/packages/kubernetes/api-docs/core/v1/serviceaccount/).

We will create a `ServiceIdentity` component resource which will create the pair of service accounts with all the additional requirements that Workload Identity prescribes.

We start by adding `resources` section to our schema file and define our `ServiceIdentity` resource as a component:

```yaml
resources:
  ced:iam:ServiceIdentity:
    isComponent: true
```

The `resources` section contains a list of resource definitions. The key of each resource is the type identifier. Each identifier has three parts: `<packageName>:<moduleName>:<resourceType>`. Since we chose `ced` as the name of our package, it comes back as the `packageName` in each resource type we define.

The `moduleName` allows for grouping resource types. It also influences the code generation for the client SDKs. Some example resource types:

* `ced:index:Dummy` will generate the NodeJS type: `ced.Dummy`
* `ced:iam:ServiceIdentity` will generate the NodeJS type: `ced.iam.ServiceIdentity`

The [Pulumi Schema](https://www.pulumi.com/docs/guides/pulumi-packages/schema/) documentation provides more information how it can influence the code generation of the client SDKs.

Each resource usually takes input properties and can have some output properties. Both classes of properties can have optional and mandatory properties. Our `ServiceIdentity` component will create a Kubernetes service account. We want to make it configurable in which Kubernetes namespace this service account will be created:

```yaml
resources:
  ced:iam:ServiceIdentity:
    isComponent: true
    inputProperties:
      nameSpace:
        type: string
        description: the name of the namespace in which to create the Kubernetes service account.
    requiredInputs:
      - nameSpace
```

Similar to the input properties, we define the IDs of the two service accounts as outputs and define them to be required after the component is created:

```yaml
resources:
  ced:iam:ServiceIdentity:
    isComponent: true
    inputProperties:
      nameSpace:
        type: string
        description: the name of the namespace in which to create the Kubernetes service account.
    requiredInputs:
      - nameSpace
    properties:
      gcpServiceAccount:
        type: string
        description: The Google Cloud Service Account ID.
      gkeServiceAccount:
        type: string
        description: The Kubernetes Service Account ID.
    required:
      - gcpServiceAccount
      - gkeServiceAccount
```

<details><summary>The complete Pulumi schema can be seen here</summary>

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/pulumi/pulumi/master/pkg/codegen/schema/pulumi.json
---
name: ced
resources:
  ced:iam:ServiceIdentity:
    isComponent: true
    inputProperties:
      nameSpace:
        type: string
        description: the name of the namespace in which to create the Kubernetes service account.
    requiredInputs:
      - nameSpace
    properties:
      gcpServiceAccount:
        type: string
        description: The Google Cloud Service Account ID.
      gkeServiceAccount:
        type: string
        description: The Kubernetes Service Account ID.
    required:
      - gcpServiceAccount
      - gkeServiceAccount
language:
  csharp:
    packageReferences:
      Pulumi: 3.*
      Pulumi.Gcp: 6.*
      Pulumi.Kubernetes: 3.*
  go:
    generateResourceContainerTypes: true
    importBasePath: github.com/pulumi/pulumi-ced/sdk/go/ced
  nodejs:
    dependencies:
      "@pulumi/gcp": "^6.0.0"
      "@pulumi/kubernetes": "^3.0.0"
    devDependencies:
      typescript: "^3.7.0"
  python:
    requires:
      pulumi: ">=3.0.0,<4.0.0"
      pulumi-gcp: ">=6.0.0,<7.0.0"
      pulumi-kubernetes: ">=3.0.0,<4.0.0"
```
</details>

Let's continue with the implementation of this component resource in [lab 2](../lab2)
