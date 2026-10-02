import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
export const baseName = config.get("baseName") || pulumi.getStack();
