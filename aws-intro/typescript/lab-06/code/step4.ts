import * as AWS from "aws-sdk";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";

const hits = new aws.dynamodb.Table("hits", {
    attributes: [{ name: "Site", type: "S" }],
    hashKey: "Site",
    billingMode: "PAY_PER_REQUEST",
});

const handlerRole = new aws.iam.Role("handler-role", {
    assumeRolePolicy: {
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Principal: {
                Service: "lambda.amazonaws.com"
            },
            Effect: "Allow",
            Sid: "",
        }],
    },
});

const handlerPolicy = new aws.iam.RolePolicy("handler-policy", {
    role: handlerRole,
    policy: hits.arn.apply(arn => JSON.stringify({
        Version: "2012-10-17",
        Statement: [
            {
                Action: [
                    "dynamodb:UpdateItem",
                    "dynamodb:PutItem",
                    "dynamodb:GetItem",
                    "dynamodb:DescribeTable",
                ],
                Resource: arn,
                Effect: "Allow",
            },
            {
                Action: ["logs:*", "cloudwatch:*"],
                Resource: "*",
                Effect: "Allow",
            },
        ],
    })),
});

const site = new awsx.apigateway.API("site", {
    routes: [{
        path: "/",
        method: "GET",
        eventHandler: new aws.lambda.Function("get-handler", {
            runtime: aws.lambda.NodeJS10dXRuntime,
            code: new pulumi.asset.AssetArchive({
                ".": new pulumi.asset.FileArchive("handler"),
            }),
            handler: "index.handler",
            role: handlerRole.arn,
            environment: {
                variables: {
                    "HITS_TABLE": hits.name,
                },
            },
        }, { dependsOn: handlerPolicy }),
    }],
});
export const url = site.url;
