# Platform Engineering with Microsoft Azure Deployment Environments and Pulumi

## Prerequisites

- If you don't have an Azure subscription, create an Azure free account before you begin.
- Install the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli).
- Install the [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops).
- Provision an instance of Azure Deployment Environments ([sample Pulumi app](https://github.com/pulumi/azure-deployment-environments/tree/main/Provisioning/ade)), setup its catalog to point to this environment definition.

## Overview

This sample demonstrates how to use Pulumi to deploy a simple web application to an Azure Deployment Environment (ADE). The sample uses the [Azure Deployment Environments](https://github.com/pulumi/azure-deployment-environments) project to provision the environment.

The `environment.yaml` file instructs ADE how to deploy the Pulumi program as a new environment. It points to the `pulumi/azure-deployment-environments` custom runner image, that we ship in [this repo](https://github.com/pulumi/azure-deployment-environments/tree/main/Runner-Image). The image is an extension that adapts ADE commands to corresponding Pulumi operations.

For the rest, the environment definition is a regular Pulumi program. It defines a sample Container App using the Azure Native provider and C#. It accepts the contain image name (supplied by end developers as an ADE parameter) and a resource group name (provisioned by ADE automatically) as configuration values.
