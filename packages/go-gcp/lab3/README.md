# Lab 3: Consume the component resource

We completed the implementation of the component resource in lab 2. Now is the time to test it. A full multi-language component would require the generation of the client SDKs for the languages we want to support. However, for our [YAML support](https://www.pulumi.com/docs/intro/languages/yaml/), this is not needed. We can directly work with the plugin binary.

## Initialise a Pulumi YAML project

We create a new Pulumi YAML project using the CLI:

```bash
$ pulumi new yaml
This command will walk you through creating a new Pulumi project.

Enter a value or leave blank to accept the (default), and press <ENTER>.
Press ^C at any time to quit.

project name: gcp-services-with-workload-identity
project description: GCP services using a Go based component Service Identity
Created project 'gcp-services-with-workload-identity'

Please enter your desired stack name.
To create a stack in an organization, use the format <org-name>/<stack-name> (e.g. `acmecorp/dev`).
stack name: (dev) team-ce/ringo
Created stack 'team-ce/ringo'

Your new project is ready to go! ✨

To perform an initial deployment, run `pulumi up`

Time: 0h:00m:16s

$ ls -l
total 8
8 -rw-r--r--    1 ringods  wheel   126  2 Nov 22:25 Pulumi.yaml
```

You should have a `Pulumi.yaml` file similar to:

```yaml
name: gcp-services-with-workload-identity
runtime: yaml
description: GCP services using a Go based component Service Identity
```

## Define the needed configuration

For this lab, we assume that we have another stack with a stack output named `kubeconfig` which contains a working Kubernetes cluster configuration. We will read the name of the stack reference from stack configuration.

Our component requires a Kubernetes namespace name as an input arg, so we also make it configurable in this project.

For our YAML program to support stack configuration for these two values, we add a `configuration` section to your `Pulumi.yaml` file:

```yaml
configuration:
  stackRef:
    type: String
  nameSpace:
    type: String
```

## Configure the Kubernetes provider

Before we can consume our component resource, we need to set up our Kubernetes provider using the `kubeconfig` retrieved from the stack reference:

```yaml
resources:
  gkestack:
    type: pulumi:pulumi:StackReference
    properties:
      name: ${stackRef}
  k8sprovider:
    type: pulumi:providers:kubernetes
    properties:
      kubeconfig: ${gkestack.outputs["kubeconfig"]}
```

`gkestack` is the name of the stack reference. We then define an explicit Kubernetes provider and feed the `kubeconfig` stack output to it.

Now define the name of the stack reference in your stack config:

```bash
pulumi config set stackRef <stack-reference-name>
```

## Configure the Google Cloud (GCP) provider

We do not define an explicit Google Cloud provider, but we set the default provider configuration in the stack configuration:

```bash
pulumi config set gcp:project <name-of-your-gcp-project>
```

With both providers correctly configured, you should now be able to run `pulumi up` without having errors.

## Consume the ServiceIdentity component

Now is the time to add our component resource. From our schema and implementation, we know we had to provide a Kubernetes namespace name. We add a resource named `validate` (to validate our implementation), add the `nameSpace` input property and retrieve the value from the stack configuration:

```yaml
  validate:
    type: ced:iam:ServiceIdentity
    properties:
      nameSpace: ${nameSpace}
    options:
      providers:
        - ${k8sprovider}
```

Because we set up an explicit Kubernetes provider, we pass this provider to the Pulumi [`providers` resource option](https://www.pulumi.com/docs/intro/concepts/resources/options/providers/).

Running `pulumi up` should now create our component resource, with the two service accounts as child resources of the component.

To test our `ServiceIdentity` component, we will add a sample workload and pass the `gkeServiceAccount` output to the pod spec of the `Deployment`:

```yaml
  workloadtest:
    type: kubernetes:apps/v1:Deployment
    properties:
      metadata:
        name: workload-identity-test
        namespace: ${nameSpace}
        labels:
            app: workload-identity-test
      spec:
        replicas: 1
        selector:
          matchLabels:
            app: workload-identity-test
        template:
          metadata:
            labels:
              app: workload-identity-test
          spec:
            serviceAccountName: ${validate.gkeServiceAccount}
            containers:
              - image: gcr.io/google.com/cloudsdktool/google-cloud-cli:384.0.1
                name: workload-identity-test
                command: ["sleep","infinity"]
    options:
      providers:
        - ${k8sprovider}
```

<details><summary>The complete `Pulumi.yaml` project file can be seen here</summary>

```yaml
name: gcp-services-with-workload-identity
runtime: yaml
description: GCP services using a Go based component Service Identity
configuration:
  stackRef:
    type: String
  nameSpace:
    type: String
resources:
  gkestack:
    type: pulumi:pulumi:StackReference
    properties:
      name: ${stackRef}
  k8sprovider:
    type: pulumi:providers:kubernetes
    properties:
      kubeconfig: ${gkestack.outputs["kubeconfig"]}
  validate:
    type: ced:iam:ServiceIdentity
    properties:
      nameSpace: ${nameSpace}
    options:
      providers:
        - ${k8sprovider}
  workloadtest:
    type: kubernetes:apps/v1:Deployment
    properties:
      metadata:
        name: workload-identity-test
        namespace: ${nameSpace}
        labels:
            app: workload-identity-test
      spec:
        replicas: 1
        selector:
          matchLabels:
            app: workload-identity-test
        template:
          metadata:
            labels:
              app: workload-identity-test
          spec:
            serviceAccountName: ${validate.gkeServiceAccount}
            containers:
              - image: gcr.io/google.com/cloudsdktool/google-cloud-cli:384.0.1
                name: workload-identity-test
                command: ["sleep","infinity"]
    options:
      providers:
        - ${k8sprovider}
```
</details>
