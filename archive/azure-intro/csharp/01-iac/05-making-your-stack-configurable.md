# Making Your Stack Configurable

Right now, the container's name is hard-coded. Next, you'll make the name configurable.

## Step 1 &mdash; Adding a Config Variable

Instead of hard-coding the `"files"` container, we will use configuration to make it easy to change the name without editing the program.

Create a file `Config.cs` and add this to it:

```csharp
using Pulumi;

static class Settings
{
    static Settings()
    {
        var config = new Config();
        ContainerName = config.Require("container");
    }

    public static string ContainerName { get; }
}
```

## Step 2 &mdash; Populating the Container Based on Config

Replace the hard-coded `"Name"` property value with the one from configuration:

```csharp
var container = new Azure.Storage.Container("mycontainer", new Azure.Storage.ContainerArgs
{
    Name = Settings.ContainerName,
    StorageAccountName = storageAccount.Name
});
```

> :white_check_mark: After these changes, your `MyStack.cs` should [look like this](./code/05-making-your-stack-configurable/step2.cs).

## Step 3 &mdash; Deploying the Changes

Now, deploy your changes. To do so, first configure your stack. If you don't, you'll get an error:

```bash
pulumi up
```

This results in an error like the following:

```
...
ConfigMissingException: Missing Required configuration variable 'iac-workshop:container'
    	please set a value using the command `pulumi config set iac-workshop:container <value>`
...
```

Configure the `iac-workshop:container` variable very much like the `azure:location` variable:

```bash
pulumi config set iac-workshop:container html
```

To make things interesting, I set the name to `html` which is different from the previously hard-coded value `files`.

Run `pulumi up` again. This detects that the container has changed and will perform a simple update:

```
Updating (dev):

     Type                        Name              Status      Info
     pulumi:pulumi:Stack         iac-workshop-dev
  +- └─ azure:storage:Container  mycontainer       replaced    [diff: ~name]

Outputs:
    AccountName: "mystorage872202e1"

Resources:
    +-1 replaced
    3 unchanged

Duration: 10s

Permalink: https://app.pulumi.com/myuser/iac-workshop/dev/updates/5
```

And you will see the contents added above.

## Next Steps

* [Creating a Second Stack](./06-creating-a-second-stack.md)
