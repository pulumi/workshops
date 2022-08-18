# Making Your Stack Configurable

Right now, the bucket's contents are hard-coded. Next, you'll make the location of the contents configurable, and add 
support for populating the bucket with an entire directory's worth of contents.

## Step 1 &mdash; Adding a Config Variable

Instead of hard-coding the `"site"` directory, we will use configuration to make it easy to change the location without editing the program.

Firstly, add an import to your `MyStack.cs` file:

Add this to your `main.go` file:

```go
 var config = new Pulumi.Config();
        var siteDir = config.Get("siteDir");
```

## Step 2 &mdash; Populating the Bucket Based on Config


And replace the hard-coded `"site"` parameter with this imported `siteDir` variable:

```cs
var bucketFile = Path.Combine(siteDir, "index.html");
var bucketObject = new Aws.S3.BucketObject("index.html", new BucketObjectArgs
{
    Bucket = bucket.BucketName,
    Source = new FileAsset(bucketFile),
    Acl = "public-read",
    ContentType = "text/html",
});
```

> :white_check_mark: After these changes, your `MyStack.cs` should [look like this](./code/05-making-your-stack-configurable/step2.cs).

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
    System.Reflection.TargetInvocationException: Exception has been thrown by the target of an invocation.
         ---> System.ArgumentNullException: Value cannot be null. (Parameter 'path1')
           at System.IO.Path.Combine(String path1, String path2)
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

```cs
foreach (var file in Directory.EnumerateFiles(siteDir))
{
    var name = Path.GetFileName(file);
    var bucketObject = new Aws.S3.BucketObject(name, new BucketObjectArgs
    {
        Bucket = bucket.BucketName,
        Source = new FileAsset(Path.Combine(siteDir, Path.GetFileName(file))),
        Acl = "public-read",
        ContentType = "text/html",
    });
}
```

> :white_check_mark: After these changes, your `MyStack.cs` should [look like this](./code/05-making-your-stack-configurable/step4.cs).

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
curl $(pulumi stack output WebsiteEndpoint)/about.html
```

And you will see the contents added above.

## Next Steps

* [Creating a Second Stack](./06-creating-a-second-stack.md)
