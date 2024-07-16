# Build and deploy a Static Website in Google Cloud Storage using Python

In the second lab of this workshop, we're going to deploy some static HTML files to a GCP Storage bucket.

## Step 1 &mdash; Create a Bucket

We'll first create the GCP storage bucket that will store our HTML files. Before we do that, we need to import the GCP provider

1. Add the following to the top of `__main__.py`, with the other `import` directive:

    ```python
    import pulumi_gcp as gcp
    ```

    Now that we've imported our GCP provider, we can create our bucket.

2. Add the following to the bottom of `__main__.py`:

    ```python
    bucket = gcp.storage.Bucket(
        "website",
        location="US"
    )
    ```

    <details>
    <summary> 🕵️ Code Check. Expand to see the full `__main.py__` contents so far </summary>
    At this stage, your `__main__.py` file should match the following code:

    ```python
    """A Python Pulumi program"""

    import pulumi
    import pulumi_gcp as gcp

    bucket = gcp.storage.Bucket(
        "website",
        location="US"
    )
    ```

    </details>

## Step 2 &mdash; Create Website Files

1. Create a directory as a subdirectory of your project:

    ```bash
    mkdir www
    ```

2. Create a file `www/index.html` with the following contents:

    ```html
    <html>

    <head>
    <meta charset="UTF-8">
    <title>Hello, Pulumi!</title>
    </head>

    <body>
    <p>Hello, S3!</p>
    <p>Made with ❤️ with <a href="https://pulumi.com">Pulumi</a> and Python</p>
    <p>Hosted with ❤️ by GCP!</p> </br>
    <!-- IMAGE NEEDED, SEE NEXT STEP -->
    <img src="pulumipus.png" />
    </body>
    </html>
    ```

3. Download an image to the `www` directory:

    ```bash
    curl https://www.pulumi.com/logos/brand/pulumipus-8bit.png -o www/pulumipus.png
    ```

## Step 3 &mdash; Configure the ACLs for the Bucket Object

When we upload the HTML files to our bucket, we want them to be publicly accessible. To make sure every file we place in the bucket gets the desired accessibility, we need to set a default access control list (ACL).

1. Create a default ACL:

    ```python
    acl = gcp.storage.DefaultObjectAccessControl(
        'website',
        bucket=bucket.name,
        role="READER",
        entity="allUsers"
    )
    ```

    <details>
    <summary>🕵️ Code Check. Expand to see the full `__main.py__` contents so far </summary>
    At this stage, your `__main__.py` file should match the following code:

    ```python
    """A Python Pulumi program"""

    import pulumi
    import pulumi_gcp as gcp

    bucket = gcp.storage.Bucket(
        "website",
        location="US"
    )

    acl = gcp.storage.DefaultObjectAccessControl(
        "website",
        bucket=bucket.name,
        role="READER",
        entity="allUsers"
    )
    ```

    </details>

## Step 4 &mdash; Upload Bucket Objects

Now we need to upload the files that comprise our website so we can view them. Because Pulumi uses real programming languages, we can use constructs like `for` loops. Let's use a `for` loop to iterate over the files in the `www` directory in this repo and upload them using the `BucketObject` resource.

First, we need to import the `os` Python library. Note that a major advantage of Pulumi's design of using real programming languages is that we can make use of both standard libraries and external packages when defining our infrastructure.

1. Add the following statement near the top of your `__main__.py` near your other imports:

    ```python
    import os
    ```

2. Add the following at the bottom of your `__main.py__`:

    ```python
    content_dir = "www"
    for file in os.listdir(content_dir):
        filepath = os.path.join(content_dir, file)
        gcp.storage.BucketObject(
            file,
            bucket=bucket.name,
            name=file,
            source=pulumi.FileAsset(filepath),
            opts=pulumi.ResourceOptions(depends_on=[acl])
        )
    ```

Notice the use of `depends_on`. This tells Pulumi that our `BucketObjects` should not be created until our `DefaultObjectAccessControl` has been fully provisioned. The `depends_on` is necessary because there's no _explicit_ dependency between the files and the ACL (i.e., there's no output from the `DefaultObjectAccessControl` resource passed to the `BucketObject` inputs). If we didn't explicitly specify `depends_on`, our files may get uploaded before the default ACL is applied, and our files would not get created with the right default permissions.

---

**⭐️ OPTIONAL ⭐️** Show [Authenticating with GCP Provider](https://www.pulumi.com/registry/packages/gcp/installation-configuration/#authentication-methods?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)

<details>
<summary> Show how to configure GCP OIDC via Pulumi ESC </summary>

There are multiple ways of configuring the GCP Provider with credentials. While most folks will configure the `gcloud` CLI as a getting-started solution; a more secure way is to fetch dynamic credentials from an external secrets manager solution. I'm going to use Pulumi ESC to do OIDC. In your sandbox environment, I've copied a reference code on how to configure this and if there're any questions here, please post them in the Q&A tab.

Presenter: Please add the following to an `oidc-gcp` ESC Environment:

```yaml
# NOTE THIS IS HERE JUST FOR REFERENCE.
#
# I HAVE **NOT** AUTHORIZED THIS PULUMI ORGANIZATION
# TO USE MY GOOGLE CLOUD OIDC
# TO DO SO, I'D HAVE TO UPDATE MY AUDIENCE LIST ON GCP
#
# ALSO, NOTE THE GCP PROJECT NEEDS TO BE NUMERICAL VALUE
values:
  gcp:
    login:
      fn::open::gcp-login:
        project: 5631433690
        oidc:
          workloadPoolId: prod-pool
          providerId: pulumi-cloud-oidc
          serviceAccount: pulumi-cloud@pulumi-workshops-project.iam.gserviceaccount.com
  environmentVariables:
    GOOGLE_PROJECT: ${gcp.login.project}
    CLOUDSDK_AUTH_ACCESS_TOKEN: ${gcp.login.accessToken}
    GOOGLE_REGION: us-central1
    PULUMI_GCP_SKIP_REGION_VALIDATION: true
  pulumiConfig:
    gcp:accessToken: ${gcp.login.accessToken}
    gcp:region: us-central1
    gcp:project: pulumi-workshops-project
```

We're going to [add a reference to GCP OIDC config environment in my Dev stack via the Pulumi CLI](https://www.pulumi.com/docs/cli/commands/pulumi_config_env_add/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)

```bash
pulumi config env add oidc-gcp
```

</details>

---

## Step 5 &mdash; Run `pulumi up`

Now that we've defined our infrastructure, we can use the Pulumi CLI to create the resources we've defined.

1. Run the following command in your project directory:

    ```bash
    pulumi up
    ```

    ou should see output similar to the following:

    ```text
    Previewing update (dev)

    View Live: https://app.pulumi.com/jkodroff/my-first-gcp-app/dev/previews/8e2d59f2-bf22-4491-ac44-208bcc485ebc

        Type                                       Name                  Plan
    +   pulumi:pulumi:Stack                        my-first-gcp-app-dev  create
    +   ├─ gcp:storage:Bucket                      website               create
    +   ├─ gcp:storage:DefaultObjectAccessControl  website               create
    +   ├─ gcp:storage:BucketObject                index.html            create
    +   └─ gcp:storage:BucketObject                python.png            create
    ```

    You can examine the details of the resources that will be created. When you're happy, move the arrow to `yes` and watch as Pulumi creates your resources!

## Step 6 &mdash; Export the Bucket URL

Our final step is to build our static site URL and add it as a [stack output](https://www.pulumi.com/learn/building-with-pulumi/stack-outputs/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops). Stack outputs allow us to consume values from the command line or other Pulumi programs. In this case, we will consume our output from the command line.

First, we assemble the output's value using `pulumi.Output.concat`.

1. Add the following to your `__main__.py`:

    ```python
    static_site_url = pulumi.Output.concat(
        "https://storage.googleapis.com/", bucket.name, "/index.html")
    ```

    We use `pulumi.Output.concat` instead of standard Python string concatenation because `bucket.name` is a Pulumi Output&mdash;a value that isn't known until after a resource has been created. For more information on Pulumi Inputs and Outputs, reference [Inputs and Outputs](https://www.pulumi.com/docs/intro/concepts/inputs-outputs/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) in the Pulumi docs.

    Now we can export the value as a stack output, which will allow us to view its value from outside of our Pulumi program via the command line.

2. Add the following to your `__main__.py`:

    ```python
    pulumi.export("static_site_url", static_site_url)
    ```

  <details>
  <summary>🕵️ Code Check. Expand to see the full `__main.py__` contents </summary>
   At the end of this lab, your `__main__.py` should look like this:

```python
"""A Python Pulumi program"""

import pulumi
import pulumi_gcp as gcp
import os

bucket = gcp.storage.Bucket(
    "website",
    location="US"
)

acl = gcp.storage.DefaultObjectAccessControl(
    'website',
    bucket=bucket.name,
    role="READER",
    entity="allUsers"
)

content_dir = "www"
for file in os.listdir(content_dir):
    filepath = os.path.join(content_dir, file)
    gcp.storage.BucketObject(
        file,
        bucket=bucket.name,
        name=file,
        source=pulumi.FileAsset(filepath),
        opts=pulumi.ResourceOptions(depends_on=[acl])
    )

static_site_url = pulumi.Output.concat(
    "https://storage.googleapis.com/", bucket.name, "/index.html")

pulumi.export("static_site_url", static_site_url)
```

</details>

3. Obtain the value of our URL by running `pulumi up` again, which will create the stack output:

    ```bash
    pulumi up --yes
    ```

4. Curl your url

    ```bash
    curl $(pulumi stack output static_site_url)
    ```

    You should see the contents of `index.html`.

## Step 7 &mdash; Tear Down

Now that we've demonstrated creating a static site using Pulumi, it's time to tear down our infrastructure now that we no longer need it.

1. Run the following command at the command line:

    ```bash
    pulumi destroy
    ```

    You will be presented with a preview indicating that all resources in the stack will be destroyed by continuing. Select `yes` to continue and your infrastructure will be deleted.

2. If you'd like to remove your now-empty stack completely, you can optionally run the following command and confirm when asked if you're sure:

    ```bash
    pulumi stack rm dev
    ```

That's it! We've now explored all the basics of creating and deleting infrastructure with Pulumi! Now we can move on to a slightly more advanced example: running containers on Google Cloud Run.

## Next Steps

[Build and Deploy a Container on Google Cloud Run](../lab-03/README.md)
