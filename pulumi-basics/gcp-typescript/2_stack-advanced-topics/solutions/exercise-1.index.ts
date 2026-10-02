import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const config = new pulumi.Config();
const baseName = config.get("baseName") || `${pulumi.getOrganization()}-${pulumi.getStack()}`.toLowerCase();
const dbUsername = config.get("dbUsername") || "dbadmin";

// Exercise 1 //
//const dbPwd = config.get("dbPassword") || "dbpassword"; // This creates a default password, please change it
const dbPwd = config.requireSecret("dbPassword");
// Exercise 1 //


// Create an CloudSQL resource
const sqlInstance = new gcp.sql.DatabaseInstance(`${baseName}-sqldbinstance`, {
    databaseVersion: "POSTGRES_15",    
    settings: {
        tier: "db-f1-micro",
        diskSize: 20,
        deletionProtectionEnabled: false,
    },
});

// Create a database user, required for postgres
const sqlUser = new gcp.sql.User(`${baseName}-user`, {
    name: dbUsername,
    password: dbPwd,
    instance: sqlInstance.name,
});

export const dbAdmin = dbUsername;
export const dbPassword = dbPwd;