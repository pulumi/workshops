import * as pulumi from "@pulumi/pulumi";

export const config = new pulumi.Config();
export const baseName = config.get("baseName") || pulumi.getStack();
export const username = config.get("sqlUsername") || "pulumi";
export const pwd = config.requireSecret("sqlPassword")
