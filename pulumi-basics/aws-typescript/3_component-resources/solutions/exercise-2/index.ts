import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";

import { Webserver } from "./webserver-component";

const config = new pulumi.Config();
const baseName = config.get("baseName") || `${pulumi.getOrganization()}-${pulumi.getStack()}`.toLowerCase();

// Use Pulumi-provided AWSX package for easy VPC and related resource creation.
const vpc = new awsx.ec2.Vpc(`${baseName}-net`)

const webServer = new Webserver(baseName, {
  vpcId: vpc.vpcId,
  subnetId: vpc.publicSubnetIds[0],
  size: "small",
  message: "Hi from component resource",
}, {protect: true});

export const url = pulumi.interpolate`http://${webServer.serverIp}`;
