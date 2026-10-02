import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import { baseName, dbPwd, dbUsername } from "./config";

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

// Exercise 2 //
export const dbAdmin = pulumi.secret(dbUsername);
// Exercise 2 //
export const dbPassword = dbPwd;

// Exercise 3 //
export const dbEndpointWrong = `DB connection endpoint-> ${sqlInstance.selfLink}`
export const dbEndpointUsingInterpolate = pulumi.interpolate`DB connection endpoint-> ${sqlInstance.selfLink}`
export const dbEndpointUsingApply = sqlInstance.selfLink.apply(selfLink => `DB connection endpoint-> ${selfLink}`)
// Exercise 3 //
