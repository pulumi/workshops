# Pre Class Notes
To ensure the most efficient use of workshop time, each student should go through the following steps to set up the environment to use for the workshop.

## Prerequisites
1. Go through the AWS getting started for python found here: https://www.pulumi.com/docs/get-started/aws/ 

## Set Up Workshop Environments
The following steps will install the base workshop code and related python packages. 
When done you should have a directory structure like this:
```
aws-python-workshop
|- stack-basics
|- stack-advanced-topics
|- component-resources
|- stack-references
   |- base_infra
   |- app
```

**NOTE:** When running `pulumi new` below, if you are going to use your Pulumi organization account instead of your personal Pulumi account, use `YOUR-ORGANIZATION-NAME/YOUR-NAME` when prompted for a stack name. This will create the stack in your organization and by using your name will avoid stack naming conflicts.

```bash
mkdir aws-python-workshop && cd aws-python-workshop

mkdir stack-basics && cd stack-basics
pulumi new https://github.com/pulumi/training/tree/main/aws-python/1_stack-basics
cd ..

mkdir stack-advanced-topics && cd stack-advanced-topics
pulumi new https://github.com/pulumi/training/tree/main/aws-python/2_stack-advanced-topics
cd ..

mkdir component-resources && cd component-resources
pulumi new https://github.com/pulumi/training/tree/main/aws-python/3_component-resources
cd ..

mkdir stack-references && cd stack-references

mkdir base-infra && cd base-infra
pulumi new https://github.com/pulumi/training/tree/main/aws-python/4_stack-references/base-infra
cd ..

mkdir app && cd app
pulumi new https://github.com/pulumi/training/tree/main/aws-python/4_stack-references/app


