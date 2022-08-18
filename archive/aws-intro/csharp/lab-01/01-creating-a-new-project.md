# Creating a New Project

Infrastructure in Pulumi is organized into projects. Each project is a single program that, when run, declares the desired infrastructure for Pulumi to manage.

## Step 1 &mdash; Create a Directory

Each Pulumi project lives in its own directory. Create one now and change into it:

```bash
mkdir iac-workshop
cd iac-workshop
```

> Pulumi will use the directory name as your project name by default. To create an independent project, simply name the directory differently.

## Step 2 &mdash; Initialize Your Project

A Pulumi project is just a directory with some files in it. It's possible for you to create a new one by hand. The `pulumi new` command, however, automates the process:

```bash
pulumi new csharp -y
```

This will print output similar to the following with a bit more information and status as it goes:

```
Created project 'iac-workshop'
Created stack 'dev'

.....

Your new project is ready to go! ✨

To perform an initial deployment, run 'pulumi up'
```

## Step 3 &mdash; Inspect Your New Project

Our project is comprised of multiple files:

* **`MyStack.cs`**: your program's file for resource management
* **`Program.cs`**: your program's main entrypoint file
* **`iac-workshop.csproj`**: your project's project file
* **`Pulumi.yaml`**: your project's metadata, containing its name and language

Run `cat MyStack.cs` to see the contents of your project's empty program:

```csharp
using Pulumi;

class MyStack : Stack
{
    public MyStack()
    {
        // Add your resources here
    }
}
```

Feel free to explore the other files, although we won't be editing any of them by hand.

# Next Steps

* [Configuring AWS](./02-configuring-aws.md)
