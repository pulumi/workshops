# Static Site on AWS Workshop using TypeScript

## Prerequisites

To go through this workshop with us, here is what you need

1. A Pulumi account, head to [app.pulumi.com](https://app.pulumi.com/signup/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops) and follow the sign-up process.
2. An [access token](https://www.pulumi.com/docs/intro/pulumi-service/accounts/#access-tokens?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops) from your Pulumi account.
3. The Pulumi CLI installed in your development environment. Simply follow [this guide](https://www.pulumi.com/docs/get-started/install/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops).
4. Link the CLI to your account by running `pulumi login` and using your access token.
5. Finally, [Set up your local credentials](https://www.pulumi.com/registry/packages/aws/installation-configuration/#credentials) with the `aws` CLI.

## Part 1 - Using the Pulumi template

### Make a new directory

```bash
mkdir my-site && cd my-site
```

### Using a template

We're going to use a template to generate our program's scaffolding. Run the following command in your terminal.

```bash
pulumi new static-website-aws-typescript
```

### Explore the code

Each time your create a new Pulumi app, here are the files to look for

1. `Pulumi.yaml` contains the project and top level configuration
2. `Pulumi.<stackName>.yaml` is the stack configuration file
3. `index.ts` is your Pulumi application entrypoint


### First deployment

Let's deploy our Pulumi application

```bash
pulumi up
```

Access the `cdnUrl` and confirm your website is accessible


## Part 2 - Improving our deployment

### Update the Bucket ACL

Let's change the Bucket ACL from `public-read` to `private`.

```ts
const bucket = new aws.s3.Bucket("bucket", {
    acl: "private",
    website: {
        indexDocument: indexDocument,
        errorDocument: errorDocument,
    },
});
```

And let's do the same for our website files

```ts
const bucketFolder = new synced_folder.S3BucketFolder("bucket-folder", {
    path: path,
    bucketName: bucket.bucket,
    acl: "private",
});
```

### Block public access on our Bucket

As we set ACLs on our Bucket and files, let's make sure no futher public access is possible on this Bucket.

```ts
const bucketPublicAccessBlock = new aws.s3.BucketPublicAccessBlock("bucket-public-access-block", {
    bucket:  bucket.id,
    blockPublicAcls: true,
    blockPublicPolicy: true,
    restrictPublicBuckets: true,
    ignorePublicAcls: true,
});
```

### Create an Origin Access Identity

An origin access identity is a special CloudFront user that you can associate with Amazon S3 origins, so that you can secure all or just some of your Amazon S3 content.

```ts
const originAccessIdentity = new aws.cloudfront.OriginAccessIdentity("origin-access-identity", {
    comment: pulumi.interpolate`Access Origin Identity to access bucket ${bucket.id}`
});
```

### Grant CloudFront access to the Bucket

We create a Bucket policy to grant our CloudFront distribution access to our S3 bucket.

As shown below, the policy only grants `s3:GetObject` access on our S3 bucket.

```ts
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
```

### Create an origin ID

A CloudFront Origin Id is a unique identifier and its value value must be unique within the distribution.

To create one, will use the `Random` provider.

```bash
npm install --save "@pulumi/random"
```

```ts
import * as random from "@pulumi/random";

/*
 ...
*/

const originId = new random.RandomString("origin-id", {
    special: false,
    length: 12,
    lower: true,
    upper: true,
    number: true,
});
```

### CloudFront distribution update

We finally update our CloudFront distribution update to communicate with our Bucket using the S3 Rest API.

```ts
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
```

### Deployment update

Let's review our changes.

```bash
pulumi preview --diff
```

Everything looks good, we're now ready to deploy our changes to production.

```bash
pulumi up
```

Once the deployment has completed, access the `cdnUrl` and confirm your website is correctly accessible.

## Part 3 - Resource clean up

Once you've completed this workshop, run the following command to delete the resources we previously created.

```bash
pulumi destroy
```