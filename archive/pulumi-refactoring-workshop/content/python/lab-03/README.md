# Restructuring projects

Now we know how to refactor programs in place using aliases, we can start to break this code into separate projects.

In this particular example, we're going to extract the cluster from the base project, and move it into a new project.

## Step 1 - Create a new project

Firstly, in the workspace directory, create a new project called cluster:

```bash
mkdir cluster
cd cluster
pulumi new azure-python
```

We now have an empty project to use for our cluster resource.

## Step 2 - "Disown" the cluster

The next thing we need to do is remove the cluster code from our original project.

Remove the code you copied from that project and run `pulumi preview`.

You'll notice because the code no longer exists, pulumi wants to remove it:

```bash
Previewing update (dev)

View Live: https://app.pulumi.com/jaxxstorm/refactor-workshop-ws/dev/previews/2e852cbc-6a03-4bc0-8842-5f3e05282e73

     Type                                             Name                      Plan
     pulumi:pulumi:Stack                              refactor-workshop-ws-dev
 -   └─ azure-native:containerservice:ManagedCluster  workshop-cluster          delete

Resources:
    - 1 to delete
    5 unchanged
```

This is not our desired state, we want to leave the cluster as is. So we need to remove the cluster from pulumi's state. This _will not_ affect the running cluster in Azure, only remove Pulumi management of it.

## Step 3 - Remove resource from state

Let's remove the resource from the Pulumi state.

Grab it's urn using `pulumi stack --show-urns`:

```
pulumi stack --show-urns
Current stack is dev:
    Owner: jaxxstorm
    Last updated: 9 minutes ago (2022-04-06 11:23:57.921315 -0700 PDT)
    Pulumi version: v3.28.0
Current stack resources (7):
    TYPE                                             NAME
    pulumi:pulumi:Stack                              refactor-workshop-ws-dev
    │  URN: urn:pulumi:dev::refactor-workshop-ws::pulumi:pulumi:Stack::refactor-workshop-ws-dev
    ├─ cluster:index:Network                         workshop
    │  │  URN: urn:pulumi:dev::refactor-workshop-ws::cluster:index:Network::workshop
    │  └─ azure-native:network:VirtualNetwork        workshop
    │     │  URN: urn:pulumi:dev::refactor-workshop-ws::cluster:index:Network$azure-native:network:VirtualNetwork::workshop
    │     └─ azure-native:network:Subnet             workshop
    │           URN: urn:pulumi:dev::refactor-workshop-ws::cluster:index:Network$azure-native:network:VirtualNetwork$azure-native:network:Subnet::workshop
    ├─ azure-native:resources:ResourceGroup          workshop
    │     URN: urn:pulumi:dev::refactor-workshop-ws::azure-native:resources:ResourceGroup::workshop
    ├─ azure-native:containerservice:ManagedCluster  workshop-cluster
    │     URN: urn:pulumi:dev::refactor-workshop-ws::azure-native:containerservice:ManagedCluster::workshop-cluster
    └─ pulumi:providers:azure-native                 default_1_62_0
          URN: urn:pulumi:dev::refactor-workshop-ws::pulumi:providers:azure-native::default_1_62_0
```

And then delete the resource from the pulumi state:

```
pulumi state delete "urn:pulumi:dev::refactor-workshop-ws::azure-native:containerservice:ManagedCluster::workshop-cluster"
```

If you rerun `pulumi preview` now you'll notice Pulumi no longer wants to make any changes.

You now have a running cluster but no management of it using infrastructure as code.

## Step 3 - Import the cluster

We need to get the cluster back under pulumi's management in the new project.

In your new project, use the `pulumi import` command to import the cluster:

```bash
pulumi import azure-native:containerservice:ManagedCluster cluster <resourceid>
```

Pulumi will now:

- Import the cluster into the Pulumi state
- Generate the code you need in order to manage the cluster
- Protect the resource from deletion

Congratulations, you've removed the resource from the state!




