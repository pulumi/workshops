import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import { ComponentResource, ComponentResourceOptions, Input, Output } from "@pulumi/pulumi";

// Import the program's configuration settings.
const config = new pulumi.Config();
let machineType2 = config.get("machineType") || "f1-micro";
const osImage = config.get("osImage") || "debian-11";
const instanceTag = config.get("instanceTag") || "webserver";
const servicePort = config.get("servicePort") || "80";

export interface WebserverArgs {
    vpcId: Input<string>;
    subnetId: Input<string>;
    size: string;
    message: string;
};

export class Webserver extends ComponentResource {
    //public readonly serverIp: Output<string>;
    public readonly serverIp: pulumi.Output<string>;
    public readonly serverName: pulumi.Output<string>;
    public readonly serverUrl: pulumi.Output<string>;

    // Must have a constructor that defines the parameters and namespace - "custom:x:Webserver" in this case.
    constructor(name: string, args: WebserverArgs, opts?: ComponentResourceOptions) {
        super("custom:x:Webserver", name, args, opts);

        /////
        // Declare the children resources (i.e. security group, instance) be sure to include a resource option of "parent:this".
        /////

        // Create an instance running a simple web server.
        // Create a firewall allowing inbound access over ports 80 (for HTTP) and 22 (for SSH).
    const firewall = new gcp.compute.Firewall(`${name}-firewall`, {
        network: args.vpcId,
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
    }, {parent: this, aliases: [{ parent: pulumi.rootStackResource }]});

    
        
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
    

            if (args.size === "large") {
                machineType2 = "n1-standard-4";
            } else if (args.size === "medium") {
                machineType2 = "n1-standard-2";
            }    
                                                       

    // Create the virtual machine.
    const webServer = new gcp.compute.Instance(`${name}-instance`, {
        machineType: machineType2,
        
        bootDisk: {
            initializeParams: {
                image: osImage,
            },
        },
        networkInterfaces: [
            {
                network: args.vpcId,
                subnetwork: args.subnetId,
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
    }, { dependsOn: firewall,parent: this, aliases: [{ parent: pulumi.rootStackResource }] });

    // Export the instance's IP address.
        this.serverIp = webServer.networkInterfaces.apply(interfaces => {
            return interfaces[0].accessConfigs![0].natIp;});
        this.serverName = webServer.name;
        this.serverUrl = pulumi.interpolate`http://${this.serverIp}:${servicePort}`;
        // End with this. It is used for display purposes.
        this.registerOutputs();
    };
};
