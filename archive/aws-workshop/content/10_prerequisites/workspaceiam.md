---
title: "Update IAM settings for your workspace"
chapter: false
weight: 15
---

## AWS Subscription and CLI

If you will be completing the AWS labs, you will need an AWS account. If you don't already have one, you can [sign up for the free tier here](https://portal.aws.amazon.com/billing/signup). 
The labs have been designed to use the free tier as much as possible, so that the total cost of all resources should be very close to $0. 
If in doubt, please [go here](https://aws.amazon.com/free) to see what services and resource types are available in the free tier.

At various points, you will use the AWS CLI to interact with infrastructure you've provisioned. Installation instructions are 
[available here](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html). As explained further on that page, the 
CLI requires Python.

> If you have multiple AWS accounts, you'll need to configure a profile for the account you're using in these labs. That process is 
>[described here](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html). All Pulumi operations will respect your profile settings.

To verify that everything is working, run:

```bash
$ aws sts get-caller-identity
{
    "UserId": "ABDAII73ZGOGZ5V4QSTWY",
    "Account": "161298451113",
    "Arn": "arn:aws:iam::161298451113:user/joe@pulumi.com"
}
```
