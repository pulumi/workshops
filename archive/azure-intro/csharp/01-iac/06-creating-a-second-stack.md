# Creating a Second Stack

It is easy to create multiple instances of the same project. This is called a stack. This is handy for multiple development or test environments, staging versus production, and scaling a given infrastructure across many regions.

## Step 1 &mdash; Create and Configure a New Stack

Create a new stack:

```bash
pulumi stack init prod
```

Next, configure its two required variables:

```bash
pulumi config set azure-native:location westeurope
pulumi config set container htmlprod
```

If you are ever curious to see the list of stacks for your current project, run this command:

```bash
pulumi stack ls
```

It will print all stacks for this project that are available to you:

```
NAME   LAST UPDATE     RESOURCE COUNT  URL
dev    30 minutes ago  4               https://app.pulumi.com/myuser/iac-workshop/dev
prod*  3 minutes ago   0               https://app.pulumi.com/myuser/iac-workshop/prod
```

## Step 2 &mdash; Deploy the New Stack

Now deploy all of the changes:

```bash
pulumi up
```

This will create an entirely new set of resources from scratch, unrelated to the existing `dev` stack's resources.

```
Updating (prod):

     Type                         Name               Status
 +   pulumi:pulumi:Stack          iac-workshop-prod  created
 +   ├─ azure-native:resources:ResourceGroup  myrgroup                              create     
 +   ├─ azure-native:storage:StorageAccount   mystorageact                          create     
 +   └─ azure-native:storage:BlobContainer    mycontainer                           create     


Outputs:
    AccountName       : output<string>
    ContainerName     : output<string>
    resourcegroup_name: output<string>

Resources:
    + 4 to create

Do you want to perform this update? yes
Updating (prod)

View Live: https://app.pulumi.com/shaht/my-iac-lab1-azure-csharp-friday/prod/updates/1

     Type                                     Name                                  Status              
 +   pulumi:pulumi:Stack                      my-iac-lab1-azure-csharp-friday-prod  created (26s)       
 +   ├─ azure-native:resources:ResourceGroup  myrgroup                              created (1s)        
 +   ├─ azure-native:storage:StorageAccount   mystorageact                          created (20s)       
 +   └─ azure-native:storage:BlobContainer    mycontainer                           created (0.68s)     


Outputs:
    AccountName       : "mystorageact99257ce4"
    ContainerName     : "htmlwww"
    resourcegroup_name: "myrgroupe48fba8e"

Resources:
    + 4 created

Duration: 28s

More information at: https://app.pulumi.com/myuser/iac-workshop/prod/updates/1
```

A new set of resources has been created for the `prod` stack.

## Next Steps

* [Destroying Your Infrastructure](./07-destroying-your-infrastructure.md)
