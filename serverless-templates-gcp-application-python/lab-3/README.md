# Lab 3: Create Pulumi Google Cloud Resources and Deploy the Function
Create all the Google Cloud Resources and deploy the function

## Add all the import statements
Go back to where the `Pulumi.dev.yaml` file is located.

Clear out the contents in `__main__.py` and replace all of it with the following:

```python
"""A Google Cloud Function Python Pulumi program"""
from cProfile import run
from pip import main
import pulumi
import pulumi_gcp as gcp
import pulumi_synced_folder as synced
```  

## Import the program's configuration settings
We want to use what we added via `pulumi config` in this program.
More details are at [Accessing Configuration from Code](https://www.pulumi.com/docs/intro/concepts/config/#code?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops)

Append the following to `__main__.py`
```python
# Import the program's configuration settings.
config = pulumi.Config()
site_path = config.get("sitePath", "./www")
app_path = config.get("appPath", "./app")
index_document = config.get("indexDocument", "index.html")
error_document = config.get("errorDocument", "error.html")
```

## Create A Storage Bucket and Configure it as a Site

Append the following to `__main__.py`
```python
# Create a storage bucket and configure it as a web site.
site_bucket = gcp.storage.Bucket(
    "site-bucket",
    gcp.storage.BucketArgs(
        location="US",
        website=gcp.storage.BucketWebsiteArgs(
            main_page_suffix=index_document,
            not_found_page=error_document,
        ),
    ),
)

pulumi.export("site_bucket_name", site_bucket.name)
pulumi.export("site_bucket_url", site_bucket.url)
```

We want to know the name of the site bucket we created.

Run `pulumi up` and select `yes`
Once the resources are up, check the output of the storage bucket.

Check the outputs:
```bash
pulumi stack output
```

## Create an IAM binding to allow public read access to the bucket
Append the following to `__main__.py`

```python
# Create an IAM binding to allow public read access to the bucket.
site_bucket_iam_binding = gcp.storage.BucketIAMBinding(
    "site-bucket-iam-binding",
    gcp.storage.BucketIAMBindingArgs(
        bucket=site_bucket.name, role="roles/storage.objectViewer", members=["allUsers"]
    ),
)
```

## Use a synced folder to manage the files of the site
Append the following to `__main__.py`
```python
# Use a synced folder to manage the files of the site.
synced_folder = synced.GoogleCloudFolder(
    "synced-folder",
    synced.GoogleCloudFolderArgs(
        path=site_path,
        bucket_name=site_bucket.name,
    ),
)
```

## Create another storage bucket for the serverless app
Append the following to `__main__.py`
```python
# Create another storage bucket for the serverless app.
app_bucket = gcp.storage.Bucket(
    "app-bucket",
    gcp.storage.BucketArgs(
        location="US",
    ),
)

pulumi.export("app_bucket_name", app_bucket.name)
pulumi.export("app_bucket_url", app_bucket.url)
```

We want to know the name of the app bucket we created.

Run `pulumi up` and select `yes`
Once the resources are up, check the output of the storage bucket.

Check the outputs:
```bash
pulumi stack output
```

## Upload the serverless app to the storage bucket
Append the following to `__main__.py`
```python
# Upload the serverless app to the storage bucket.
app_archive = gcp.storage.BucketObject(
    "app-archive",
    gcp.storage.BucketObjectArgs(
        bucket=app_bucket.name,
        source=pulumi.asset.FileArchive(app_path),
    ),
)
```
## Create a Cloud Function that returns some data

Append the following to `__main__.py`
```python
# Create a Cloud Function that returns some data.
data_function = gcp.cloudfunctions.Function(
    "data-function",
    gcp.cloudfunctions.FunctionArgs(
        source_archive_bucket=app_bucket.name,
        source_archive_object=app_archive.name,
        runtime="python310",
        entry_point="data",
        trigger_http=True,
    ),
)

pulumi.export("data_function_name", data_function.name)
```

We want to know the name of the function we created.

Run `pulumi up` and select `yes`
Once the resources are up, check the output of the storage bucket.

Check the outputs:
```bash
pulumi stack output
```

## Create an IAM member to invoke the function
Append the following to `__main__.py`
```python
# Create an IAM member to invoke the function.
invoker = gcp.cloudfunctions.FunctionIamMember(
    "data-function-invoker",
    gcp.cloudfunctions.FunctionIamMemberArgs(
        project=data_function.project,
        region=data_function.region,
        cloud_function=data_function.name,
        role="roles/cloudfunctions.invoker",
        member="allUsers",
    ),
)
```

## Create a JSON configuration file for the site

Append the following to `__main__.py`
```python
# Create a JSON configuration file for the site.
site_config = gcp.storage.BucketObject(
    "site-config",
    gcp.storage.BucketObjectArgs(
        name="config.json",
        bucket=site_bucket.name,
        content_type="application/json",
        source=data_function.https_trigger_url.apply(
            lambda url: pulumi.StringAsset('{ "api": "' + url + '" }')
        ),
    ),
)
```

## Export the URLs of the site and serverless endpoint

We have to call [apply](https://www.pulumi.com/docs/intro/concepts/inputs-outputs/#apply) to
create the URL that we need to hit.

Append the following to `__main__.py`

```python
# Export the URLs of the website and serverless endpoint.
pulumi.export(
    "siteURL",
    site_bucket.name.apply(
        lambda name: f"https://storage.googleapis.com/{name}/index.html"
    ),
)
pulumi.export("apiURL", data_function.https_trigger_url.apply(lambda url: url))
```

We want to know the name of the function we created.

Run `pulumi up` and select `yes`
Once the resources are up, check the output of the storage bucket.

Check the outputs:
```bash
pulumi stack output siteURL
```

Load the `siteURL` into a browser and see what you built!

## Destroy the Resources - Critical Step to avoid cloud charges
```bash
pulumi destroy -y
```

## SHORTCUT - Pulumi Templates
[Pulumi Templates](https://www.pulumi.com/templates/) are the fastest way to deploy infrastructure to AWS, Azure, and Google Cloud. After deploying, you can easily modify the infrastructure by updating the code in TypeScript, Python, Go, Java, .NET/C#, or YAML.

This entire workshop can be reduced by following the [Google Cloud Serverless Application](https://www.pulumi.com/templates/serverless-application/gcp/) template to:

```bash
mkdir my-serverless-app && cd my-serverless-app
pulumi new serverless-gcp-python -y
pulumi up -y
open $(pulumi stack output siteURL)
```

Remember to clean up your resources
```bash
pulumi destroy -y
```