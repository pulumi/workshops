# Refactoring in Place

We're now going to refactor this code to create a [Component](https://www.pulumi.com/docs/intro/concepts/resources/components/) for the networking part of the stack.

In Pulumi, all resources get a [urn](https://www.pulumi.com/docs/intro/concepts/resources/names/#urns) assigned to them. This urn consists of information like the name of the resource, and where it lives inside the stack.

By moving the resource we defined in our original Pulumi project into a Component, the urn is going to change.

However, we don't want to recreate the resources, because this means we'll experience downtime in our application! Let's refactor this code into a component, without downtime.

## Step 1 - Create the component

In the [workspace]](../../../workspace/project) you'll notice a `clusternetwork.py` file has been created for you, but it currently contains no resources. We'll update this file to include our `VirtualNetwork` and `Subnet`.

Update the `clusternetwork.py` file and add the following code:

```python
class ClusterNetwork(pulumi.ComponentResource):
    vnet: network.VirtualNetwork
    subnet: network.Subnet

    def __init__(self, name: str, args: ClusterNetworkArgs, opts: pulumi.ResourceOptions = None):
        super().__init__("cluster:index:Network", name, {}, opts)

        self.vnet = network.VirtualNetwork(
            "workshop",
            address_space=network.AddressSpaceArgs(
                address_prefixes=[args.vnet_cidr],
            ),
            resource_group_name=args.resource_group_name,
            opts=pulumi.ResourceOptions(parent=self)
        )

        self.subnet = network.Subnet(
            "workshop",
            virtual_network_name=self.vnet.name,
            resource_group_name=args.resource_group_name,
            address_prefix=args.subnet_cidr,
            opts=pulumi.ResourceOptions(parent=self.vnet)
        )
        
        self.register_outputs({
            "vnet": self.vnet,
            "subnet": self.subnet
        })
```

You should only need to modify the `ClusterNetwork` class.

Now, modify the `__main__.py` to remove the network definitions. In particular, remove this code:

```python
vnet = network.VirtualNetwork(
    "workshop",
    address_space=network.AddressSpaceArgs(
        address_prefixes=[vnet_cidr],
    ),
    resource_group_name=rg.name,
    tags=tags,
)

subnet = network.Subnet(
    "workshop", virtual_network_name=vnet.name, resource_group_name=rg.name, address_prefix=subnet_cidr
)
```

You'll now need to instantiate the component.

Add the following import to the top of the file:

```python
import clusternetwork
```

and then instantiate the clusternetwork:

```python
nw = clusternetwork.ClusterNetwork(
    "workshop",
    clusternetwork.ClusterNetworkArgs(
        vnet_cidr=vnet_cidr,
        subnet_cidr=subnet_cidr,
        resource_group_name=rg.name,
    ),
)
```

Finally, update the `cluster` resource to retrieve the network configuration from our component:

```python
vnet_subnet_id=nw.subnet.id,
```

Now, run `pulumi preview`:

```bash

```

You'll notice here that Pulumi wants to replace all of the resources in this stack.

The network itself hasn't changed, but because the `urn` is now different, Pulumi needs to rename the resources.

This is not what we want, so we need to modify the code.

## Step 2 - Alias the resources

We now need to alias the resources. There are two ways to do this.

### Get the resource urns

Run `pulumi stack --show-urns`

This will output all the resources in the stack, and show what their urns are. You can now use this information to alias the resources.

### Alias the subnet with an explict urn

In `clusternetwork.py`, modify the `subnet` resource to include the urn of the resource:

```python
self.subnet = network.Subnet(
            "workshop",
            virtual_network_name=self.vnet.name,
            resource_group_name=args.resource_group_name,
            address_prefix=args.subnet_cidr,
            opts=pulumi.ResourceOptions(parent=self.vnet, aliases=["urn:pulumi:dev::refactor-workshop::azure-native:network:Subnet::workshop"])
        )
```

Note, we're updating the resource options here to add the urn of the original subnet inside the stack

### Alias the virtual network resource with a named urn

You may not want to include the entire urn inside the project. Pulumi allows you to include just the name of the resource like so.

Update the virtual network resource and include the `name` property:

```python
self.vnet = network.VirtualNetwork(
            "workshop",
            address_space=network.AddressSpaceArgs(
                address_prefixes=[args.vnet_cidr],
            ),
            resource_group_name=args.resource_group_name,
            opts=pulumi.ResourceOptions(parent=self, aliases=[pulumi.Alias(name="workshop", parent=None)])
        )
```

Notice here that we're also setting `parent=None`. We do this to let Pulumi know the original resource had no explicit parent, as it was part of the root stack

### Run `pulumi preview`

Now you can run `pulumi preview` again. You should see one resource to be created:

```bash

```

This indicates that the component itself will be added to the stack, but now resource changes will actually happen! Pulumi now knows that you're aliasing the resources, and will act accordingly.

### Run `pulumi up`

Run your `pulumi up` and apply the changes. Pulumi will move the resources inside the state so that no changes occur.

## [Optional] Step 3 - remove the alias

Now that you've modified the state, you can remove the aliases from the resource options if you wish. This step is optional, and leaving the aliases will not have any effect on the way pulumi works.

# Next Steps

* [Refactor into distinct projects](../lab-03/README.md)

