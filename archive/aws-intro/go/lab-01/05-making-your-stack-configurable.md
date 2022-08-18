# Making Your Stack Configurable

Right now, the bucket's contents are hard-coded. Next, you'll make the location of the contents configurable, and add 
support for populating the bucket with an entire directory's worth of contents.

## Step 1 &mdash; Adding a Config Variable

Instead of hard-coding the `"site"` directory, we will use configuration to make it easy to change the location without editing the program.

Firstly, add an import to your `main.go` file:

```go
...
"github.com/pulumi/pulumi/sdk/go/pulumi/config"
...
```

Add this to your `main.go` file:

```go
conf := config.New(ctx, "")
siteDir := conf.Get("siteDir")
```

We need to run `dep ensure` to get the new dependency on the config part of the SDK.

## Step 2 &mdash; Populating the Bucket Based on Config


And replace the hard-coded `"site"` parameter with this imported `siteDir` variable:

```go
bucketFile := filepath.Join(siteDir, "index.html")
mimeType := mime.TypeByExtension(path.Ext(bucketFile))
_, err = s3.NewBucketObject(ctx, "index.html", &s3.BucketObjectArgs{
    Bucket:      bucket.Bucket,
    Source:      pulumi.NewFileAsset(bucketFile),
    Acl:         pulumi.String("public-read"),
    ContentType: pulumi.String(mimeType),
})
```

> :white_check_mark: After these changes, your `main.go` should [look like this](./code/05-making-your-stack-configurable/step2.go).

To make matters interesting, rename the `site` directory to `www`:

```bash
mv site www
```

## Step 3 &mdash; Deploying the Changes

Now, deploy your changes. To do so, first configure your stack. If you don't, you'll get an error:

```bash
pulumi up
```

This results in an error like the following:

```
    error: an unhandled error occurred: program exited with non-zero exit code: 1

    error: program failed: rpc error: code = Unknown desc = failed to compute asset hash: failed to open asset file 'index.html': open index.html: no such file or directory
    exit status 1
```

Configure the `iac-workshop:siteDir` variable very much like the `aws:region` variable:

```bash
pulumi config set iac-workshop:siteDir www
```

Pulumi has deteched that there are no changes as it's the same file that has been compiled by our go application:

```
Previewing update (dev):
     Type                 Name              Plan
     pulumi:pulumi:Stack  iac-workshop-dev

Resources:
    3 unchanged
```

## Step 4 &mdash; Add More Files

Instead of hard-coding the set of files, you will now change the program to read the entire contents of the `www` directory. 

Add a new file, `about.html`, to the `www` directory:

```
<html>
    <p>Infrastructure as code using real languages is powerful.</p>
</html>
```

Now replace the object allocation code with:

```go
// For each file in the directory, create an S3 object stored in `bucket`
files, err := ioutil.ReadDir(siteDir)
if err != nil {
    return err
}
for _, item := range files {
    name := item.Name()
    if _, err := s3.NewBucketObject(ctx, name, &s3.BucketObjectArgs{
        Bucket:      bucket.Bucket,                                       // reference to the s3.Bucket object
        Source:      pulumi.NewFileAsset(filepath.Join(siteDir, name)),   // use FileAsset to point to a file
        ContentType: pulumi.String(mime.TypeByExtension(path.Ext(name))), // set the MIME type of the file
        Acl:         pulumi.String("public-read"),
    }); err != nil {
        return err
    }
}
```

> :white_check_mark: After these changes, your `main.go` should [look like this](./code/05-making-your-stack-configurable/step4.go).

Perform a deployment:

```bash
pulumi up
```

You will see a single new object created for the `www/about.html` file:

```
Updating (dev):

     Type                    Name              Status
     pulumi:pulumi:Stack     iac-workshop-dev
 +   └─ aws:s3:BucketObject  about.html        created
...
```

Now fetch it:

```bash
curl $(pulumi stack output bucket_endpoint)/about.html
```

And you will see the contents added above.

## Next Steps

* [Creating a Second Stack](./06-creating-a-second-stack.md)
