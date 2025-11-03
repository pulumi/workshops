# Azure Native C# Pulumi Template

A minimal, end-to-end Pulumi template for C# that provisions a Resource Group and Storage Account in Microsoft Azure using the Azure Native provider.

## Overview

This template demonstrates a simple Pulumi program written in C# that:
- Creates an Azure Resource Group
- Creates an Azure Storage Account (Standard_LRS, StorageV2)
- Retrieves the primary Storage Account key and exports it as a secret output

Use this template as a foundation for building more complex Azure infrastructure in C#.

## Prerequisites

- .NET SDK 6.0 or higher
- Pulumi CLI (v3.x or later)
- An Azure subscription
- Azure CLI or other authentication method (run `az login` to authenticate)

## Quickstart

1. Create a new project from this template:
   ```bash
   pulumi new azure-csharp
   ```
2. (Optional) Review or override the default region:
   ```bash
   pulumi config set azure-native:location WestUS2
   ```
3. Preview and deploy your stack:
   ```bash
   pulumi preview
   pulumi up
   ```
4. When no longer needed, destroy the stack to clean up resources:
   ```bash
   pulumi destroy
   ```

## Project Layout

```
./
├── Pulumi.yaml             # Pulumi project configuration
├── Program.cs              # C# code defining Azure resources
├── <ProjectName>.csproj    # .NET project file
├── bin/                    # Build output (auto-generated)
└── obj/                    # Build artifacts (auto-generated)
```

## Configuration

| Key                   | Description                     | Default |
|-----------------------|---------------------------------|---------|
| azure-native:location | Azure region for resource group | WestUS2 |

## Outputs

- `primaryStorageKey` (secret): The primary key of the Storage Account

## Next Steps

- Extend `Program.cs` to add more Azure services (Virtual Networks, App Services, SQL Databases, and more)
- Explore the [Pulumi Azure Native provider documentation](https://www.pulumi.com/docs/reference/pkg/azure-native/)
- Check out other templates in the [Pulumi Templates repository](https://github.com/pulumi/templates)

## Getting Help

- Join the Pulumi Community on Slack: https://pulumi.com/slack
- Browse or file issues: https://github.com/pulumi/pulumi-azure-native/issues
- Pulumi Docs: https://www.pulumi.com/docs/