import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

// Create a GCP resource (Storage Bucket)
const bucket = new gcp.storage.Bucket("my-bucket", {
    location: "US"
});

// Exercise 1 //
// Export the DNS name of the bucket
export const bucketUrl = bucket.url;
// Export the name of the bucket
export const bucketName = bucket.id;
// Exercise 1 //
