import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const baseName = config.get("baseName") || `${pulumi.getOrganization()}-${pulumi.getStack()}`.toLowerCase();
const dbUsername = config.get("dbUsername") || "dbadmin";

// Exercise 1 //
const dbPwd = config.requireSecret("dbPassword");
export const dbPassword = dbPwd;
// Exercise 1 //

// Create an RDS resource
const db = new aws.rds.Instance(`${baseName}-rds`, {
  instanceClass: "db.t3.micro",
  allocatedStorage: 20,
  engine: "mariadb",
  engineVersion: "10.6",
  password: dbPwd,
  username: dbUsername,
  skipFinalSnapshot: true,
});

// Exercise 2 //
export const dbAdmin = pulumi.secret(dbUsername);
// Exercise 2 //

// Exercise 3 //
export const dbEndpointWrong = `DB connection endpoint-> ${db.endpoint}`
export const dbEndpointUsingInterpolate = pulumi.interpolate`DB connection endpoint-> ${db.endpoint}`
export const dbEndpointUsingApply = db.endpoint.apply(endpoint => `DB connection endpoint-> ${endpoint}`)
// Exercise 3 //
