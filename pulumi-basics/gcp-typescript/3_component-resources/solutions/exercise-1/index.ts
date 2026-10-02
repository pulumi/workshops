import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import { Webserver } from "./webserver-component";

// Import the program's configuration settings.
const config = new pulumi.Config();
const baseName = config.get("baseName") || `${pulumi.getOrganization()}-${pulumi.getStack()}`.toLowerCase();

// Create a new network for the virtual machine.
const network = new gcp.compute.Network(`${baseName}-network`, {
    autoCreateSubnetworks: false,
});

// Create a subnet on the network.
const subnet = new gcp.compute.Subnetwork(`${baseName}-subnet`, {
    ipCidrRange: "10.0.1.0/24",
    network: network.id,
});

const webServer = new Webserver(baseName, {
    vpcId: network.id,
    subnetId: subnet.id,
    size: "small",
    message: "Hi from component resource",
  });


export const ip = webServer.serverIp;
export const name = webServer.serverName;
export const url = webServer.serverUrl;