# Creating a New Project

Infrastructure in Pulumi is organized into projects. Each project is a single program that, when run, declares the desired infrastructure for Pulumi to manage.

## Step 1 &mdash; Create a Directory

Each Pulumi project lives in its own directory. From the root of this repository, create a new directory and change into it:

```bash
mkdir my-k8s-cluster && cd my-k8s-cluster
```

## Step 2 &mdash; Initialize Your Project

A Pulumi project is just a directory with some files in it. It's possible for you to create a new one by hand. The `pulumi new` command, however, automates the process:

```bash
pulumi new kubernetes-azure-csharp
```

Answer the project setting prompts:

- **project name:** (default)
- **project description:** (default)
- **stack name:** (default)
- **azure-native:location:** Choose a location near you.
- **kubernetesVersion:** (default)
- **mgmtGroupId:** Enter the group ID of an Azure AD group to which you have access.
- **nodeVmSize:** (default)
- **numWorkerNodes:** 1, to limit costs. Feel free to create a 3-node cluster (the default size) if you want.
- **prefixForDns:** (default)
- **sshPubKey:** Enter your SSH public key. To copy to the clipboard in macOS from the command line:

    ```bash
    cat ~/.ssh/id_pub.rsa | pbcopy
    ```

## Step 3 &mdash; Inspect Your New Project

Our project is comprised of multiple files:

- **`Program.cs`**: your program's main entry point
- **`Pulumi.dev.yaml`**: the configuration for the `dev` stack we initialized when we set up the project
- **`Pulumi.yaml`**: your project's metadata, containing its name and language
- **`my-k8s-cluster.proj`**: our .NET project file
- The `bin` and `obj` directories we expect with any .NET project.

## Next Steps

- [Exploring the generated code](../module-02/README.md)
