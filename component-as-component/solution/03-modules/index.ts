import * as pulumi from "@pulumi/pulumi";
import * as bucketmod from '@pulumi/bucketmod';
import * as modrandom from "@pulumi/modrandom";

const cfg = new pulumi.Config();
const prefix = cfg.get("prefix") ?? pulumi.getStack();

const myBucket = new bucketmod.Module('test-bucket', {
  bucket_prefix: `test-bucket-${prefix}`,
  force_destroy: true
});

export const bucketName = myBucket.s3_bucket_id;

const myPet = new modrandom.Module('test-random', {
    keeper_key: "test-random",
});
export const petName = myPet.pet;