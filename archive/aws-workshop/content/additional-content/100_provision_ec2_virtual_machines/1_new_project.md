+++
title = "Creating a New Project"
chapter = false
weight = 1
+++

## Step 1 &mdash; Create a Directory

Each Pulumi project lives in its own directory. Create one now and change into it:

```bash
mkdir ec2-workshop
cd ec2-workshop
```

> Pulumi will use the directory name as your project name by default. To create an independent project, simply name the directory differently.

## Step 2 &mdash; Initialize Your Project

A Pulumi project is just a directory with some files in it. It's possible for you to create a new one by hand. The `pulumi new` command, however, automates the process:

```bash
pulumi new typescript -y
```

This will print output similar to the following with a bit more information and status as it goes:

```
Created project 'ec2-workshop'
Created stack 'dev'
Saved config
Installing dependencies...
Finished installing dependencies

Your new project is ready to go!
```

This command has created all the files we need, initialized a new stack named `dev` (an instance of our project), and installed the needed package dependencies from NPM.

## Step 3 &mdash; Install pulumi-aws Package

Run the following command to install the AWS package:

```bash
npm install @pulumi/aws
```

The package will be added to `node_modules`, `package.json`, and `package-lock.json`.

## Step 4 &mdash; Setting AWS Region

Configure the AWS region you would like to deploy to:

```bash
pulumi config set aws:region us-west-2
```

Feel free to choose any [AWS region](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-available-regions).

