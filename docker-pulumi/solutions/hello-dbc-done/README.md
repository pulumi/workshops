# Example to build a Docker image with Docker Build Cloud (DBC)

Builds a Docker Image from an NGINX local Dockerfile. This template prompts the user for an existing DBC builder.

Last revision: May 2024.

## 📋 Pre-requisites

- [Docker Build Cloud (DBC) builder](https://build.docker.com/)
- 🚨 You **must** complete the [DBC builder setup steps](https://docs.docker.com/build/cloud/setup/#steps) 🚨
- Docker Desktop / CLI
- [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
- *Recommended* [Pulumi Cloud account](https://app.pulumi.com/signup?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
- [npm](https://www.npmjs.com/get-npm)

## 👩‍🏫 Get started

This Pulumi example is written as a template. It is meant to be copied via `pulumi new` as follows:

```bash
pulumi new https://github.com/pulumi/examples/tree/master/dockerbuild-ts-dbc
npm install
```

Once copied to your machine, feel free to edit as needed.

## 🎬 How to run

To deploy your infrastructure, run:

```bash
$ pulumi up
# select 'yes' to confirm the expected changes
# 🎉 Ta-Da!
```

## 🧹 Clean up

To clean up your infrastructure, run:

```bash
$ pulumi destroy
# select 'yes' to confirm the expected changes
```
