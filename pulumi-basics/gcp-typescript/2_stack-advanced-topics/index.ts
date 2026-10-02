import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const config = new pulumi.Config();
const baseName = config.get("baseName") || `${pulumi.getOrganization()}-${pulumi.getStack()}`.toLowerCase();
const dbUsername = config.get("dbUsername") || "dbadmin";

const dbPwd = config.get("dbPassword") || "dbpassword"; // This creates a default password, please change it


// Create an CloudSQL resource
const sqlInstance = new gcp.sql.DatabaseInstance(`${baseName}-sqldbinstance`, {
    databaseVersion: "POSTGRES_15",
    deletionProtection: false,   
    settings: {
        tier: "db-f1-micro",
        diskSize: 20,
    },
});

// Create a database user, required for postgres
const sqlUser = new gcp.sql.User(`${baseName}-user`, {
    name: dbUsername,
    password: dbPwd,
    instance: sqlInstance.name,
});

export const dbAdmin =dbUsername;
export const dbPassword = dbPwd;