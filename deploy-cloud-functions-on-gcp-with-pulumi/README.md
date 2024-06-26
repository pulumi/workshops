# Getting Started with Infrastructure as Code on GCP

This folder contains the code for the workshop "Getting Started with Infrastructure as Code on GCP". The workshop will
guide you through deploying a Cloud Function on Google Cloud Platform using Pulumi.

In this workshop, you will learn how to set up a Cloud Function that is triggered whenever a new file is uploaded to a
specific Google Cloud Storage bucket.

## Prerequisites

- If you don't have an GCPC account, you can create one [here](https://cloud.google.com/).
- Make sure your User has the necessary permissions to create the resources.
- Install gcloud CLI by following the instructions [here](https://cloud.google.com/sdk/docs/install).
- Install the [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/).

## Instructions

### Step 1: Authenticate with Google Cloud

Run the following command to authenticate with Google Cloud:

```bash
gcloud auth application-default login
```

### Step 2 - Configure the Pulumi CLI

> If you run Pulumi for the first time, you will be asked to log in. Follow the instructions on the screen to
> login. You may need to create an account first, don't worry it is free.

To initialize a new Pulumi project, run `pulumi new` and select from all the available templates the `yaml`.

> **Note**: If you run this command in an existing directory, you may need to pass the `--force` flag to
> the `pulumi new` command.

You will be guided through a wizard to create a new Pulumi project. You can use the following values:

```shell
pulumi gcp-yaml --force
This command will walk you through creating a new Pulumi project.

Enter a value or leave blank to accept the (default), and press <ENTER>.
Press ^C at any time to quit.

project name (deploy-cloud-functions-on-gcp-with-pulumi):  
project description (A minimal Google Cloud Pulumi YAML program):  
Created project 'deploy-cloud-functions-on-gcp-with-pulumi'

Please enter your desired stack name.
To create a stack in an organization, use the format <org-name>/<stack-name> (e.g. `acmecorp/dev`).
stack name (dev):  
Created stack 'dev'

gcp:project: The Google Cloud project to deploy into: <project-id>
Saved config

Your new project is ready to go! ✨

To perform an initial deployment, run `pulumi up`
```

### Step 3 - Check Google APIs are enabled

Make sure the following APIs are enabled in your Google Cloud project:

```shell
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable eventarc.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable cloudrun.googleapis.com
gcloud services enable pubsub.googleapis.com
gcloud services enable cloudstorage.googleapis.com
gcloud services enable cloudlogging.googleapis.com
gcloud services enable cloudmonitoring.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable cloudcode.googleapis.com
```

### Step 4 - Deploy the Cloud Function

We will deploy following Pulumi resources:

- Bucket for file uploads: The bucket where the files will be uploaded.
- Bucket for Cloud Function source code: The bucket where the Cloud Function source code will be uploaded.
- Cloud Function: The Cloud Function that will be triggered when a new file is uploaded to the bucket.

The folder structure should look like this:

```shell
.
├── Pulumi.dev.yaml
├── Pulumi.yaml
├── README.md
└── src
    └── main.py

2 directories, 4 files
```

### Step 5 - Python Code

The Python code for the Cloud Function is in the `src/main.py` file. The code is a simple function that prints the
name of the file that was uploaded to the bucket.

```python
def fileUpload(event, context):
    file_data = event

    # Extract relevant information from the event
    bucket_name = file_data['bucket']
    file_name = file_data['name']
    file_size = file_data['size']

    # Perform desired operations on the uploaded file
    # For example, you can process the file, store metadata, or trigger other actions

    print(f"File uploaded: {file_name} in bucket: {bucket_name}")
    print(f"File size: {file_size} bytes")

    # Add your custom logic here

    # Return a response (optional)
    return "File processing completed"
```

### Step 6 - Deploy the Cloud Function

Let's flesh out the Pulumi program to deploy the Cloud Function. The `Pulumi.yaml` file should look like this:

```yaml
name: deploy-cloud-functions-on-gcp-with-pulumi
runtime: yaml
description: Example of deploying a Cloud Function on GCP with Pulumi
```

This sets up the Pulumi project with the necessary metadata and defines the runtime as `yaml`.

#### Step 6.1 - Define the Variables

Define the variables in the `Pulumi.yaml` file:

```yaml
variables:
  region: europe-west2
  project:
    fn::invoke:
      function: gcp:projects/getProject:getProject
      arguments:
        filter: "name:${gcp:project}"
  functionCode:
    fn::fileArchive: src/
```

This variable defines the region where the Cloud Function will be deployed, the Google Cloud project, and zips all files
in the `src/` directory. You remember that the `src/` directory contains the Python code for the Cloud Function.

#### Step 6.2 - Define the Resources

First we create the bucket where the cloud function source code will be uploaded:

```yaml
resources:
  cloudFunctionBucket:
    type: gcp:storage:Bucket
    properties:
      name: "cloud-function-${project.projects[0].projectId}"
      location: ${region}
      project: ${project.projects[0].projectId}
      forceDestroy: true
      uniformBucketLevelAccess: true
```

Next, we create the bucket where the files will be uploaded:

```yaml
  fileUploadBucket:
    type: gcp:storage:Bucket
    properties:
      name: "file-upload-${project.projects[0].projectId}"
      location: ${region}
      project: ${project.projects[0].projectId}
      forceDestroy: true
      uniformBucketLevelAccess: true
```

Finally, we create bucket for the files that will be uploaded:

```yaml
  inputBucket:
    type: gcp:storage:Bucket
    properties:
      name: "input-${project.projects[0].projectId}"
      location: ${region}
      project: ${project.projects[0].projectId}
      forceDestroy: true
      uniformBucketLevelAccess: true
```

Now we define the `BucketObject` resource that will upload the Cloud Function source code to the bucket:

```yaml
  functionSourceZip:
    type: gcp:storage:BucketObject
    properties:
      name: "src-code.zip"
      bucket: ${cloudFunctionBucket.name}
      source: ${functionCode}
      contentType: "application/zip"
    options:
      dependsOn:
      - ${cloudFunctionBucket}
```

Now we head over to some IAM magic, we create an `Account` resource that will be used to deploy the Cloud Function and
attach the necessary roles to it, in this case, the `roles/run.invoker` and `roles/eventarc.eventReceiver` roles:

```yaml
  account:
    type: gcp:serviceaccount:Account
    properties:
      accountId: pulumi-workshop
      project: ${project.projects[0].projectId}
      displayName: Test Service Account

  invoking:
    type: gcp:projects:IAMMember
    properties:
      project: ${project.projects[0].projectId}
      role: roles/run.invoker
      member: serviceAccount:${account.email}
    options:
      dependsOn:
      - ${account}

  eventReceiving:
    type: gcp:projects:IAMMember
    properties:
      project: ${project.projects[0].projectId}
      role: roles/eventarc.eventReceiver
      member: serviceAccount:${account.email}
    options:
      dependsOn:
      - ${account}
```

With this out of the way, we can now define the Cloud Function, have a close look how we define the `eventTrigger` and
the `source` properties:

```yaml
  cloudFunction:
    type: gcp:cloudfunctionsv2:Function
    properties:
      name: "cloud-function-trigger-using-pulumi-gen2"
      location: ${region}
      description: "Cloud function gen2 trigger using Pulumi"
      project: ${project.projects[0].projectId}
      buildConfig:
        runtime: "python39"
        entryPoint: "fileUpload"
        environmentVariables:
          BUILD_CONFIG_TEST: "build_test"
        source:
          storageSource:
            bucket: ${cloudFunctionBucket.name}
            object: ${functionSourceZip.name}
      serviceConfig:
        maxInstanceCount: 3
        minInstanceCount: 1
        availableMemory: "256M"
        timeoutSeconds: 60
        environmentVariables:
          SERVICE_CONFIG_TEST: "config_test"
        ingressSettings: "ALLOW_INTERNAL_ONLY"
        allTrafficOnLatestRevision: true
        serviceAccountEmail: ${account.email}
      eventTrigger:
        triggerRegion: ${region}
        eventType: "google.cloud.storage.object.v1.finalized"
        retryPolicy: "RETRY_POLICY_RETRY"
        serviceAccountEmail: ${account.email}
        eventFilters:
        - attribute: "bucket"
          value: ${inputBucket.name}
    options:
      dependsOn:
      - ${inputBucket}
      - ${functionSourceZip}
      - ${account}
      - ${invoking}
      - ${eventReceiving}
```

Run `pulumi up` to deploy the infrastructure.

  ```shell
  pulumi up
  ```

After the deployment is finished, you will see the URL where you can access the application.

  ```shell
pulumi up -y -f
Updating (dev)

View in Browser (Ctrl+O): https://app.pulumi.com/dirien/deploy-cloud-functions-on-gcp-with-pulumi/dev/updates/37

     Type                              Name                                           Status              
 +   pulumi:pulumi:Stack               deploy-cloud-functions-on-gcp-with-pulumi-dev  created (92s)       
 +   ├─ gcp:storage:Bucket             cloudFunctionBucket                            created (2s)        
 +   ├─ gcp:storage:Bucket             inputBucket                                    created (1s)        
 +   ├─ gcp:serviceaccount:Account     account                                        created (3s)        
 +   ├─ gcp:storage:BucketObject       functionSourceZip                              created (0.83s)     
 +   ├─ gcp:projects:IAMMember         invoking                                       created (9s)        
 +   ├─ gcp:projects:IAMMember         eventReceiving                                 created (9s)        
 +   └─ gcp:cloudfunctionsv2:Function  cloudFunction                                  created (72s)       

Outputs:
    function_url: "https://europe-west2-minectl-fn.cloudfunctions.net/cloud-function-trigger-using-pulumi-gen2"

Resources:
    + 8 created

Duration: 1m33s
```

You may spot the URL where you can access the Cloud Function, this is done by the `function_url` output. Add this
snippet to the `Pulumi.yaml` file to expose the URL as an output:

```yaml
outputs:
  function_url: ${cloudFunction.url}
```

### Step 7 - Test the Cloud Function

To test the Cloud Function, upload a file to the `inputBucket` bucket. You can use the Google Cloud Console or
the `gsutil` for this.

You should see the following output in the logs:

```shell
File uploaded: test.txt in bucket: input-<project-id>
File size: 0 bytes
```

### Step 8 - Clean Up

To clean up the resources, run `pulumi destroy`.

```shell
pulumi destroy
```

You will be prompted to confirm the deletion. Type `yes` and press `Enter`.

After the resources are deleted, you can remove the stack by running `pulumi stack rm`.

```shell
pulumi stack rm dev
```


