# Build a Self-Service Platform for Oracle Cloud with Pulumi

## Prerequisites

This workshop assumes you have a basic understanding of TypeScript as Backstage is written in TypeScript. If you are new
to TypeScript, you can learn more about it [here](https://www.typescriptlang.org/).

Additionally, you will need to have the following tools installed:

- [Node.js](https://nodejs.org/en/download/)
- [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
- [Docker](https://docs.docker.com/get-docker/)
- [Oracle Cloud CLI](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm)

Additionally, you will need to have an Oracle Cloud account. If you do not have one, you can sign up for a free trial

## Instructions

### Step 1: Authenticate to Oracle Cloud

In this workshop, we will use the Oracle Cloud CLI to authenticate to Oracle Cloud. To authenticate, run the following
command:

```shell
oci session authenticate
```

or follow the instructions [here](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/clitoken.htm)

### Step 2: Clone the Repository

As setting up Backstage from scratch can be time-consuming, I have provided you with a ready-to-use Backstage app. All
you need to do is clone the repository and install the dependencies.

```shell
git clone
https://github.com/pulumi/workshops.git
cd workshops/build-a-self-service-platform-for-oracle-cloud-with-pulumi/00-backstage
```

> Note: If you want to use your own Backstage app, you can follow the
> instructions [here](https://backstage.io/docs/getting-started) and check the Pulumi Backstage plugin
> documentation [here](https://github.com/pulumi/pulumi-backstage-plugin)

From here you can now initialize the Pulumi project.

```shell
pulumi stack init <stack name>
pulumi config set oci:region <region>
pulumi config set username <username> # for the Oracle Container Registry
pulumi config set auth-token <password> --secret # for the Oracle Container Registry
pulumi config set github-token --secret <github-token>
pulumi config set pulumi-pat --secret <pulumi-pat>
```

This command will create a new Pulumi stack and set the Oracle Cloud region, Oracle Container Registry username,
password, GitHub token, and Pulumi token as configuration values.

### Step 3: Deploy the Infrastructure

Now that we have set up the Pulumi project, we can deploy the infrastructure. To do this, run the following command:

```shell
pulumi up
```

This command will deploy the infrastructure to Oracle Cloud. Once the deployment is complete, you will see the URL of
the
Backstage app.

```
...
Outputs:
  backstageUrl: "http://<ip-address>:7007"
```

You can now access the Backstage app by navigating to the URL in your browser.

### Step 3: Understand the Demo Backstage Software Template

In the folder `templates` in next to the `backstage` folder, you will find a template for a Backstage software catalog.
This template will be used to create a simple static page using Oracle Cloud Infrastructure (OCI) Bucket and puts
a `index.html` file in the bucket. The content of the `index.html` will be populated with the input provided by the user
in the Backstage app.

```yaml
name: ${{ values.name }}
runtime: yaml
description: A minimal Pulumi YAML program

resources:
  bucket:
    type: oci:ObjectStorage:Bucket
    properties:
      compartmentId: ${compartmentId}
      namespace: ${namespace.namespace}
      accessType: "ObjectReadWithoutList"

  object:
    type: oci:ObjectStorage:StorageObject
    properties:
      bucket: ${bucket.name}
      namespace: ${namespace.namespace}
      object: "index.html"
      content: |
        ${{values.content}}
      contentType: "text/html"

variables:
  compartmentId: ocid1.compartment.oc1..aaaaaaaavt4axn32mx65ryw7cnnh6hctn3rwosbrudrovfpdah5diluehb5a
  namespace:
    fn::oci:ObjectStorage/getNamespace:getNamespace:

outputs:
  bucketURL: https://${bucket.namespace}.objectstorage.${oci:region}.oci.customer-oci.com/n/${bucket.namespace}/b/${bucket.name}/o/${object.object}
```

To provide the crenetials for the Oracle Cloud Infrastructure, I use Pulumi ESC for it. In
the `Pulumi.${{values.stack}}.yaml` file, you can see the configuration values for the Oracle Cloud Infrastructure.

```yaml
environment:
- ${{values.esc}}
```

Head over to `https://apps.pulumi.com/` and create a new environment called `oracle-backstage-demo`. Add the
following `yaml` to the environment.

```yaml
# values is a required top-level key
values:
  oracle:
    default:
      userOcid: <user-ocid>
      fingerprint: <fingerprint>
      tenancyOcid: <tenancy-ocid>
      region: <region>
      privateKey: |
        -----BEGIN PRIVATE KEY-----
        ...
  # Configuration nested under the "pulumiConfig" key will be available to Pulumi stacks that
  # reference this Environment during `pulumi up/preview/refresh/destroy`
  pulumiConfig:
    oci:userOcid: ${oracle.default.userOcid}
    oci:fingerprint: ${oracle.default.fingerprint}
    oci:tenancyOcid: ${oracle.default.tenancyOcid}
    oci:region: ${oracle.default.region}
    oci:privateKey: ${oracle.default.privateKey}
```

As we are referencing the `oracle-backstage-demo` environment in `template.yaml`:

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: oci-static-website
  title: Create a new OCI Static Website
  description: |
    This template creates a new OCI Static Website using Pulumi.
  tags:
  - pulumi
  - oci
  - static-website
  - serverless
spec:
  owner: group:infrastructure
  type: serverless
  parameters:
  - title: Provide project information
    required:
    - name
    - owner
    properties:
      name:
        title: Name
        type: string
        description: Unique name of the Pulumi project.
        ui:
          field: EntityNamePicker
      description:
        title: Description
        type: string
        description: Tell us more about this project.
      owner:
        title: Owner
        type: string
        description: Owner of the component
        ui:field: OwnerPicker
        ui:options:
          catalogFilter:
          - kind: Group,User

  - title: Configure Pulumi template
    required:
    - stack
    - organization
    - esc
    - content
    properties:
      organization:
        title: Organization
        type: string
        description: The Pulumi organization to use for the Pulumi project
      esc:
        title: Pulumi ESC
        type: string
        enum:
        - oracle-backstage-demo
        default: oracle-backstage-demo
        description: |
          The Pulumi ESC to use for the Pulumi project
      stack:
        title: Select stack
        type: string
        enum:
        - dev
        - staging
        - prod
        enumNames:
        - Development
        - Staging
        - Production
        description: The pulumi stack to use
      content:
        title: Website Content
        type: string
        ui:widget: textarea
        ui:options:
          rows: 10
        description: |
          The content of the website
          This will be written to the index.html file
          You can use html tags here
  - title: Choose a GitHub repository location
    required:
    - repoUrl
    properties:
      repoUrl:
        title: Repository Location
        type: string
        ui:field: RepoUrlPicker
        ui:options:
          allowedHosts:
          - github.com
  steps:
  - id: fetch-base
    name: Fetch Base
    action: fetch:template
    input:
      url: ./template
      values:
        name: ${{parameters.name}}
        description: ${{ parameters.description }}
        destination: ${{ parameters.repoUrl | parseRepoUrl }}
        organization: ${{parameters.organization}}
        stack: ${{ parameters.stack }}
        owner: ${{ parameters.owner }}
        system: ${{ parameters.system }}
        esc: ${{parameters.esc}}
        content: ${{parameters.content}}

  - id: wait
    name: Wait for template to be fetched
    action: debug:wait
    input:
      seconds: 10

  - id: pulumi-deploy-infrastructure
    name: Deploy the infrastructure using Pulumi CLI
    action: pulumi:up
    input:
      deployment: false
      name: ${{ parameters.name }}
      repoUrl: "https://github.com/${{ (parameters.repoUrl | parseRepoUrl)['owner'] }}/${{ (parameters.repoUrl | parseRepoUrl)['repo'] }}"
      repoProjectPath: .
      organization: ${{parameters.organization}}
      outputs:
      - bucketURL
      stack: ${{ parameters.stack }}
      suppressProgress: true

  - id: publish
    name: Publish to GitHub
    action: publish:github
    input:
      allowedHosts: ["github.com"]
      repoVisibility: public
      description: "This repository contains the infrastructure code for the ${{ parameters.name }} component"
      repoUrl: ${{ parameters.repoUrl }}
      defaultBranch: main
      requiredApprovingReviewCount: 0
      protectDefaultBranch: false

  - id: wait-again
    name: Wait for the repository to be created
    action: debug:wait
    input:
      seconds: 15

  - id: register
    name: Registering the Catalog Info Component
    action: catalog:register
    input:
      repoContentsUrl: ${{ steps['publish'].output.repoContentsUrl }}
      catalogInfoPath: '/catalog-info.yaml'

  output:
    links:
    - title: Open the Source Code Repository
      url: ${{ steps['publish'].output.repoContentsUrl }}
    - title: Open the Catalog Info Component
      icon: catalog
      entityRef: ${{ steps['register'].output.entityRef }}
    - title: URL
      url: ${{ steps['pulumi-deploy-infrastructure'].frontendURL.url }}
```

### Step 4: Clean up

To clean up the resources, run `pulumi destroy`.

```shell
pulumi destroy
```

You will be prompted to confirm the deletion. Type `yes` and press `Enter`.

After the resources are deleted, you can remove the stack by running `pulumi stack rm`.

```shell
pulumi stack rm dev

```

Congratulations! You have successfully deployed a Backstage app to Oracle Cloud using Pulumi and delivered the first
service to your team.
