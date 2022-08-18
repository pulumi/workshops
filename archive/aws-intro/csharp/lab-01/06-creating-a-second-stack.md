# Creating a Second Stack

It is easy to create multiple instances of the same project. This is called a stack. This is handy for multiple development 
or test environments, staging versus production, and scaling a given infrastructure across many regions.

## Step 1 &mdash; Create and Configure a New Stack

Create a new stack:

```bash
pulumi stack init prod
```

Next, configure its two required variables:

```bash
pulumi config set aws:region eu-west-1
pulumi config set iac-workshop:siteDir wwwprod
```

If you are ever curious to see the list of stacks for your current project, run this command:

```bash
pulumi stack ls
```

It will print all stacks for this project that are available to you:

```
NAME   LAST UPDATE     RESOURCE COUNT  URL
dev    30 minutes ago  5               https://app.pulumi.com/joeduffy/iac-workshop/dev
prod*  3 minutes ago   0               https://app.pulumi.com/joeduffy/iac-workshop/prod
```

## Step 2 &mdash; Populate the New Site Directory

It would have been possible to use the existing `www` directory for the `siteDir`. In this example, you will use a 
different `wwwprod` directory, to demonstrate the value of having configurability.

Create this new directory:

```bash
mkdir wwwprod
```

Add a new `index.html` file to it:

```html
<html>
    <body>
        <h1>Hello Pulumi</h1>
        <p>(in production!)</p>
    </body>
</html>
```

## Step 3 &mdash; Deploy the New Stack

Now deploy all of the changes:

```bash
pulumi up
```

This will create an entirely new set of resources from scratch, unrelated to the existing `dev` stack's resources.

```
Updating (prod):

     Type                    Name               Status
 +   pulumi:pulumi:Stack     iac-workshop-prod  created
 +   ├─ aws:s3:Bucket        my-bucket          created
 +   └─ aws:s3:BucketObject  index.html         created

Outputs:
    WebsiteEndpoint: "http://my-bucket-c7318c1.s3-website-eu-west-1.amazonaws.com"
    BucketName    : "my-bucket-c7318c1"

Resources:
    + 3 created

Duration: 28s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/prod/updates/1
```

Now fetch your new website:

```bash
curl $(pulumi stack output WebsiteEndpoint)
```

Notice that it's the new production version of your content:

```
<html>
    <body>
        <h1>Hello Pulumi</h1>
        <p>(in production!)</p>
    </body>
</html>
```

## Next Steps

* [Destroying Your Infrastructure](./07-destroying-your-infrastructure.md)
