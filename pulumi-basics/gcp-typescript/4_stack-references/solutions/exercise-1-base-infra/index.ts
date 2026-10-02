import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const config = new pulumi.Config();
const baseName = config.get("baseName") || `${pulumi.getOrganization()}-${pulumi.getStack()}`.toLowerCase();

// Create a new network for the virtual machine.
const network = new gcp.compute.Network(`${baseName}-network`, {
    autoCreateSubnetworks: false,
    description: "Network with auto created subnets",
    routingMode: "REGIONAL",
});

// Create a subnet on the network.
const subnet = new gcp.compute.Subnetwork(`${baseName}-subnet`, {
    ipCidrRange: "10.0.1.0/24",
    network: network.id,
});

export const vpcId = network.id;
export const webserverSubnetId =  subnet.id;