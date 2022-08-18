## Webhosting and Pipeline Setup

**Purpose:** Instructions for hosting the website and creating a pipeline that automatically builds new static html files and uploads them to the appropriate S3 Bucket.

### 1. Edit and deploy the CloudFront site in cloudfront-s3-website.yaml.  

You should only need to change the parameter for WorkshopHostname.  Once that is complete run a command similar to the following but change the stackname

> Stack takes about 20 minutes
```
### DO NOT FORGET TO CHANGE THE STACK NAME
aws cloudformation create-stack --stack-name MY-Workshop --template-body file://cloudfront-s3-website.yaml
```

### 2. Edit and deploy the pipeline in pipeline.yaml.  

In this one you will probably want to change the first 5 parameters.  ProjectName should match whatever you put for WorkshopHostname in the cloudfront-s3-website.yaml. Set the `CloudFrontDistroId` to the distribution ID generated from the first stack.

> Stack completes in about 1-2 minutes  
```
### DO NOT FORGET TO CHANGE THE STACK NAME
aws cloudformation create-stack --stack-name MY-Website-Pipeline --template-body file://pipeline.yaml --capabilities CAPABILITY_NAMED_IAM
```

If you check the Build Pipeline and Build logs you should see files successfully copied to your S3 bucket.