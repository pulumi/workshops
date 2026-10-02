import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

// Exercise 2 //
const config = new pulumi.Config()
const baseName = config.require("baseName")
// Exercise 2 //

// Create a GCP resource (Storage Bucket)
const bucket = new gcp.storage.Bucket(`${baseName}-bucket`, {
    location: "US"
});
// Exercise 2 //

// Exercise 1 //
// Export the DNS name of the bucket
export const bucketUrl = bucket.url;
// Export the name of the bucket
export const bucketName = bucket.id;
// Exercise 1 //
