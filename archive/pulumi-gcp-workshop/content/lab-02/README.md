# Deploy a Static Website

In the second lab of this workshop, we're going to deploy some static HTML files to a GCP storage Bucket

## Step 1 &mdash; Create a Bucket

We'll first create the GCP storage bucket that will store our HTML files. Before we do that, we need to import the GCP provider into our project

```typescript
import * as gcp from "@pulumi/gcp";
```

Now we've imported our GCP provider, we can create our bucket. Declare a constant called `bucket` and create a new bucket like so:

```typescript
const bucket = new gcp.storage.Bucket("website", {
  location: "US",
});
```

You'll notice we've set a location parameter here, for our bucket.

> At this stage, your `index.ts` file should look like this:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/gcp";

const bucket = new gcp.storage.Bucket("website", {
  location: "US",
});
```

## Step 2 &mdash; Configure the ACLs for the Bucket Object

When we upload the HTML files to our bucket, we want them to be publically accessible. In order to make sure every file uploaded gets this public permission, we need to set a default ACL.

Create an `acl` variable and assign the `DefaultObjectAccessControl` resource to it, like so:

```typescript
const acl = new gcp.storage.DefaultObjectAccessControl("website", {
  bucket: bucket.name,
  role: "READER",
  entity: "allUsers",
});
```

> At this stage, your `index.ts` file should look like this:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/gcp";

const bucket = new gcp.storage.Bucket("website", {
  location: "US",
});

const acl = new gcp.storage.DefaultObjectAccessControl("website", {
  bucket: bucket.name,
  role: "READER",
  entity: "allUsers",
});
```

## Step 3 &mdash; Upload your Objects

Now we need to upload the files that are already in the repo to the bucket, so we can view them! We can use standard programming constructs like loops, or in this case, TypeScript's `map` function to loop through the files and upload them use the `BucketObject` resource.

It looks a little bit like this:

```typescript
["index.html", "404.html"].map(
  (name) =>
    new gcp.storage.BucketObject(name, {
      bucket: bucket.name,
      name: name,
      source: new pulumi.asset.FileAsset(`../wwwroot/${name}`),
      
    }, { dependsOn: acl })
);
```

You'll notice there's an extra part here. We tell the `BucketObject` resource to that it `dependsOn` the `DefaultObjectAccessControl` resource. The reason for this is because there's no _explicit_ dependency between these resources (ie, there's no output from the `DefaultObjectAccessControl` resource passed to the `BucketObject` inputs, but we need to make sure the objects don't get uploaded before `DefaultObjectAccessControl` has been created, otherwise they won't have the right permissions!

## Step 4 &mdash; Export the Bucket URL

Our final step is to build our static site URL. We can do this using `pulumi.interpolate`

```typescript
export const url = pulumi.interpolate`http://storage.googleapis.com/${bucket.name}/index.html`
```

`pulumi.interpolate` is a mechanism that allows us to interpolate standard strings with evetual strings. For more information about this, see [this](https://www.leebriggs.co.uk/blog/2021/05/09/pulumi-apply.html) page.

## Step 5 &mdash; Run `pulumi up`

Now we've defined our infrastructure, we use the pulumi CLI to create the resources.

Run `pulumi up` within your project directory. You should see something like this:

```
pulumi up
Previewing update (dev)

View Live: https://app.pulumi.com/jaxxstorm/static_site/dev/previews/b5ce861f-16ac-4930-ada4-1e9547e02eb1

     Type                                       Name             Plan
 +   pulumi:pulumi:Stack                        static_site-dev  create
 +   ├─ gcp:storage:Bucket                      website          create
 +   ├─ gcp:storage:DefaultObjectAccessControl  website          create
 +   ├─ gcp:storage:BucketObject                404.html         create
 +   └─ gcp:storage:BucketObject                index.html       create

Resources:
    + 5 to create

Do you want to perform this update?  [Use arrows to move, enter to select, type to filter]
  yes
> no
```

You can examine the details of the resources that will be created. When you're happy, move the arrow to `yes` and watch as Pulumi creates your resources!

# Next Steps

* [Deploy with Docker](../lab-03/README.md)
