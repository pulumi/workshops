import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const baseName = config.get("baseName") || `${pulumi.getOrganization()}-${pulumi.getStack()}`.toLowerCase();
const dbUsername = config.get("dbUsername") || "dbadmin";

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

export const dbAdmin = dbUsername