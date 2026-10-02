import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
export const baseName = config.get("baseName") || `${pulumi.getOrganization()}-${pulumi.getStack()}`.toLowerCase();
export const dbUsername = config.get("dbUsername") || "dbadmin";

// Exercise 1 //
export const dbPwd = config.requireSecret("dbPassword");
// Exercise 1 //