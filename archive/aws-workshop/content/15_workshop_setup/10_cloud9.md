---
title: "Cloud9"
chapter: false
weight: 10
---

[AWS Cloud9](https://aws.amazon.com/cloud9/) is a cloud-based integrated development environment (IDE) that Let’s you write, run, and debug your code with just a browser. It includes a code editor, debugger, and terminal. Cloud9 comes prepackaged with essential tools for popular programming languages, including JavaScript, Python, PHP, and more, so you don’t need to install files or configure your development machine to start new projects.

### Add a new Cloud9 IDE environment

1 . Within the AWS console, use the region drop list to select **us-west-2 (Oregon)**.  We are doing this because the workshop script will provsion the resources in this same region.

![image](/images/aws-pick-region.png)

2 . Navigate to the [cloud9 console](https://console.aws.amazon.com/cloud9/home) or just search for it under the **AWS console services** menu.

![image](/images/c9-search.png)

3 . Click the `Create environment` button

![image](/images/c9-create.png)

4 . For the name use `pulumi-workshop`


5 . Keep the default settings and create the environment

![image](/images/c9-settings.png)

{{% notice info %}}
This will take about 1-2 minutes to provision
{{% /notice %}}

### COnfigure Cloud9 IDE environment

When the environment comes up, customize the environment by:

1 . Close the **welcome page** tab

2 . Close the **lower work area** tab

3 . Open a new **terminal** tab in the main work area.

![c9before](/images/c9before.png)

Your workspace should now look like this and can hide the left hand environment explorer by clicking on the left side **environment** tab.

![c9after](/images/c9after.png)

{{% notice tip %}}
If you don't like this dark theme, you can change it from the **View / Themes** Cloud9 workspace menu.
{{% /notice %}}

{{% notice tip %}}
Cloud9 requires third-party-cookies. You can whitelist the [specific domains]( https://docs.aws.amazon.com/cloud9/latest/user-guide/troubleshooting.html#troubleshooting-env-loading).  You are having issues with this, Ad blockers, javascript disablers, and tracking blockers should be disabled for the cloud9 domain, or connecting to the workspace might be impacted.
{{% /notice %}}