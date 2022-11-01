import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as synced_folder from "@pulumi/synced-folder";
import * as random from "@pulumi/random";

// Import the program's configuration settings.
const config = new pulumi.Config();
const path = config.get("path") || "./www";
const indexDocument = config.get("indexDocument") || "index.html";
const errorDocument = config.get("errorDocument") || "error.html";

// Create an S3 bucket and configure it as a website.
const bucket = new aws.s3.Bucket("bucket", {
    acl: "private",
    website: {
        indexDocument: indexDocument,
        errorDocument: errorDocument,
    },
});

// Use a synced folder to manage the files of the website.
const bucketFolder = new synced_folder.S3BucketFolder("bucket-folder", {
    path: path,
    bucketName: bucket.bucket,
    acl: "private",
});

const bucketPublicAccessBlock = new aws.s3.BucketPublicAccessBlock("bucket-public-access-block", {
    bucket:  bucket.id,
    blockPublicAcls: true,
    blockPublicPolicy: true,
    restrictPublicBuckets: true,
    ignorePublicAcls: true,
});

const originAccessIdentity = new aws.cloudfront.OriginAccessIdentity("origin-access-identity", {
    comment: pulumi.interpolate`Access Origin Identity to access bucket ${bucket.id}`
});

const bucketPolicy = new aws.s3.BucketPolicy("bucket-policy", {
    bucket: bucket.id,
    policy: pulumi.all([bucket.arn, originAccessIdentity.iamArn]).apply(([bucketArn, originAccessIdentityArn]) => JSON.stringify({
        Version: '2012-10-17',
        Id: 'PolicyForCloudFrontPrivateContent',
        Statement: [
            {
                Effect: "Allow",
                Principal: {
                    AWS: originAccessIdentityArn
                },
                Action: 's3:GetObject',
                Resource: [
                    `${bucketArn}`,
                    `${bucketArn}/*`,
                ]
            }
        ]
    }))
});

const originId = new random.RandomString("origin-id", {
    special: false,
    length: 12,
    lower: true,
    upper: true,
    number: true,
});

// Create a CloudFront CDN to distribute and cache the website.
const cdn = new aws.cloudfront.Distribution("cdn", {
    enabled: true,
    origins: [{
        domainName: bucket.bucketRegionalDomainName,
        originId: originId.result,
        s3OriginConfig: {
            originAccessIdentity: originAccessIdentity.cloudfrontAccessIdentityPath
        }
    }],
    defaultCacheBehavior: {
        targetOriginId: originId.result,
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: [
            "GET",
            "HEAD",
            "OPTIONS",
        ],
        cachedMethods: [
            "GET",
            "HEAD",
            "OPTIONS",
        ],
        defaultTtl: 600,
        maxTtl: 600,
        minTtl: 600,
        forwardedValues: {
            queryString: true,
            cookies: {
                forward: "all",
            },
        },
    },
    orderedCacheBehaviors: [{
        pathPattern: "/*",
        allowedMethods: [
            "GET",
            "HEAD"
        ],
        cachedMethods: [
            "GET",
            "HEAD",
        ],
        targetOriginId: originId.result,
        forwardedValues: {
            queryString: false,
            headers: ["Origin"],
            cookies: {
                forward: "none"
            }
        },
        minTtl: 0,
        defaultTtl: 60,
        maxTtl: 60,
        compress: true,
        viewerProtocolPolicy: "redirect-to-https"
    }],
    defaultRootObject: "index.html",
    priceClass: "PriceClass_100",
    customErrorResponses: [{
        errorCode: 404,
        responseCode: 404,
        responsePagePath: `/${errorDocument}`,
    }],
    restrictions: {
        geoRestriction: {
            restrictionType: "none",
        },
    },
    viewerCertificate: {
        cloudfrontDefaultCertificate: true,
    },
});

// Export the URLs and hostnames of the bucket and distribution.
export const originURL = pulumi.interpolate`http://${bucket.websiteEndpoint}`;
export const originHostname = bucket.websiteEndpoint;
export const cdnURL = pulumi.interpolate`https://${cdn.domainName}`;
export const cdnHostname = cdn.domainName;
