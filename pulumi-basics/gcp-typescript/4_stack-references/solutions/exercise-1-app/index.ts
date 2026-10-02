import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

// Import the program's configuration settings.
const config = new pulumi.Config();
const machineType = config.get("machineType") || "f1-micro";
const osImage = config.get("osImage") || "debian-11";
const instanceTag = config.get("instanceTag") || "webserver";
const servicePort = config.get("servicePort") || "80";

const baseName = config.get("baseName") || `${pulumi.getOrganization()}-${pulumi.getStack()}`.toLowerCase();

// Need to create a stack reference that points to the dev stack for the "base-infra" project.
// And then get the applicable outputs from the "base-infra" stack and use them when creating the "app" stack resources.
// Note, you have to do the following first on the cli in the folder where the base infra project is running:  
// pulumi stack ls to get the org/project/stackname
// i.e. team-ce/stack_references_base_infra/dev 
// Then set it via pulumi config set baseInfraProjectName team-ce/stack_references_base_infra/dev on the cli here

// The app stack can't run without the base infra stack, so require this configuration item.
const baseInfraProjectName = config.require("baseInfraProjectName");
// Now create a stack reference using the base infra stack name.
const baseInfraStackRef = new pulumi.StackReference(baseInfraProjectName);
// And now get the applicable outputs from the base stack needed to deploy the app stack.
const vpcId = baseInfraStackRef.getOutput("vpcId");
const webserverSubnetId = baseInfraStackRef.getOutput("webserverSubnetId");


// Create a firewall allowing inbound access over ports 80 (for HTTP) and 22 (for SSH).
const firewall = new gcp.compute.Firewall(`${baseName}-firewall`, {
    network: vpcId,
    allows: [
        {
            protocol: "tcp",
            ports: [
                "22",
                servicePort,
            ],
        },
    ],
    direction: "EGRESS",
    sourceRanges: [
        "0.0.0.0/0",
    ],
    targetTags: [
        instanceTag,
    ],
});

// Define a script to be run when the VM starts up.
const metadataStartupScript = `#!/bin/bash
    echo '<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Hello, world!</title>
    </head>
    <body>
        <h1>Hello, world! 👋</h1>
        <p>Deployed with 💜 by <a href="https://pulumi.com/">Pulumi</a>.</p>
    </body>
    </html>' > index.html
    sudo python3 -m http.server ${servicePort} &`;

// Create the virtual machine.
const instance = new gcp.compute.Instance(`${baseName}-instance`, {
    machineType,
    bootDisk: {
        initializeParams: {
            image: osImage,
        },
    },
    networkInterfaces: [
        {
            network: vpcId,
            subnetwork: webserverSubnetId,
            accessConfigs: [
                {},
            ],
        },
    ],
    serviceAccount: {
        scopes: [
            "https://www.googleapis.com/auth/cloud-platform",
        ],
    },
    allowStoppingForUpdate: true,
    metadataStartupScript,
    tags: [
        instanceTag,
    ],
}, { dependsOn: firewall });

const instanceIP = instance.networkInterfaces.apply(interfaces => {
    return interfaces[0].accessConfigs![0].natIp;
});

// Export the instance's name, public IP address, and HTTP URL.
export const name = instance.name;
export const ip = instanceIP;
export const url = pulumi.interpolate`http://${instanceIP}:${servicePort}`;
