import * as AWS from "aws-sdk";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";

const hits = new aws.dynamodb.Table("hits", {
    attributes: [{ name: "Site", type: "S" }],
    hashKey: "Site",
    billingMode: "PAY_PER_REQUEST",
});
