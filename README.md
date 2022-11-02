# Pulumi Workshops

This is the official repo for public Pulumi workshops. If a workshop is running from Pulumi, you'll likely find the code here!

Each workshop has a directory. Inside the directory is a README with details about the workshop and what to expect and subdirectories with different labs from the workshop. You generally are not expected to clone a repo to do a workshop; code provided is for copying and pasting into your own workspace.

Note that some of the workshops on the stale list may be identical to other workshops currently in use. Use current workshops only! If you're updating a workshop, please update the metadata (i.e., the Markdown front matter in the workshop's README), these tables, and move it out of the `archive` directory so we know it's currently in use.

## 100 Level

Topic | Language | Provider | Link
---|---|---|---
Fundamentals | C# | Docker | [fundamentals/csharp](./fundamentals/csharp/)
Fundamentals | Go | Docker | [fundamentals/go](./fundamentals/go/)
Fundamentals | Java | Docker | [fundamentals/java](./fundamentals/java/)
Fundamentals | Python | Docker | [fundamentals/python](./fundamentals/python/)
Fundamentals | TypeScript | Docker | [fundamentals/typescript](./fundamentals/typescript/)
Fundamentals | YAML | Docker | [fundamentals/yaml](./fundamentals/yaml/)
 ** | | |
Cloud Fundamentals | C# | AWS | Coming soon
Cloud Fundamentals | Go | AWS | Coming soon
Cloud Fundamentals | Java | AWS | [cloud-engineering-with-aws-X/java](./cloud-engineering-with-aws-X/java/)
Cloud Fundamentals | Python | AWS | [cloud-engineering-with-aws-X/python](./cloud-engineering-with-aws-X/python/)
Cloud Fundamentals | TypeScript | AWS | [static-site-workshop/aws-typescript](./static-site-workshop/aws-typescript/)
Cloud Fundamentals | YAML | AWS | Coming soon
 ** | | |
Cloud Fundamentals | C# | Azure | Coming soon
Cloud Fundamentals | Go | Azure | Coming soon
Cloud Fundamentals | Java | Azure | [cloud-engineering-with-azure/java](./cloud-engineering-with-azure/java/)
Cloud Fundamentals | Python | Azure | Coming soon
Cloud Fundamentals | TypeScript | Azure | Coming soon
Cloud Fundamentals | YAML | Azure | Coming soon
 ** | | |
Cloud Fundamentals | C# | GCP | Coming soon
Cloud Fundamentals | Go | GCP | Coming soon
Cloud Fundamentals | Java | GCP | Coming soon
Cloud Fundamentals | Python | GCP | [cloud-engineering-with-gcp/python](./cloud-engineering-with-gcp/python)
Cloud Fundamentals | Python | GCP | [serverless-templates-gcp-application-python](./serverless-templates-gcp-application-python)
Cloud Fundamentals | TypeScript | GCP | Coming soon
Cloud Fundamentals | YAML | GCP | Coming soon

## 200 Level

Topic | Language | Provider | Link
---|---|---|---
Abstractions | C# | Civo | Coming soon
Abstractions | Go | Civo | [building-reusable-abstractions](./building-reusable-abstractions/)
Abstractions | Java | Civo | Coming Soon
Abstractions | Python | Civo | [building-reusable-abstractions](./building-reusable-abstractions/)
Abstractions | TypeScript | Civo | [building-reusable-abstractions](./building-reusable-abstractions/)
Inputs and Outputs | Go | Azure | [building-with-containers/azure-go](./building-with-containers/azure-go/)
Secrets | Go | Azure | [building-with-containers/azure-go](./building-with-containers/azure-go/)
Stacks | Go | Azure | [building-with-containers/azure-go](./building-with-containers/azure-go/)

## 300 Level

Topic | Language | Provider | Link
---|---|---|---
Automation API | C# | AWS | Coming soon
Automation API | Go | AWS | Coming soon
Automation API | Java | AWS | Coming soon
Automation API | Python | AWS | [embedding-pulumi](./embedding-pulumi/)
Automation API | TypeScript | AWS | Coming soon

## 400 Level

Topic | Language | Provider | Link
---|---|---|---
Coming soon

## Partner-Focused

Topic | Language | Provider | Link
---|---|---|---
Coming soon

<details>
<summary><h2>Stale or Deprecated Workshops</h2></summary>

Topic | Language | Provider | Link | Old Repo
---|---|---|---|---
Automation API | .. | .. | [pulumi-automationapi-workshop](./archive/pulumi-automationapi-workshop/) | [jaxxstorm/pulumi-automationapi-workshop](https://github.com/jaxxstorm/pulumi-automationapi-workshop)
Basics | Python | Docker | [iac-intro/python](./archive/iac-intro/python/) | [pulumi/infrastructure-as-code-workshop](https://github.com/pulumi/infrastructure-as-code-workshop/tree/master/labs/intro/python)
Basics | Python | Docker | [introduction-to-pulumi](./archive/introduction-to-pulumi/) | [pulumi/introduction-to-pulumi](https://github.com/pulumi/introduction-to-pulumi)
Basics | TypeScript | Docker | [iac-intro/typescript](./archive/iac-intro/typescript/) | [pulumi/infrastructure-as-code-workshop](https://github.com/pulumi/infrastructure-as-code-workshop/tree/master/labs/intro/typescript)
Basics | TypeScript | Docker | [introduction-to-pulumi](./archive/introduction-to-pulumi/) | [pulumi/introduction-to-pulumi](https://github.com/pulumi/introduction-to-pulumi)
Basics | TypeScript | AWS | [qcon-workshop](./archive/qcon-workshop/) | [pulumi/qcon-workshop](https://github.com/pulumi/qcon-workshop)
CI/CD | TypeScript | AWS, Kubernetes, Helm | [deploying-argocd-to-amazon-eks](./archive/deploying-argocd-to-amazon-eks/) | [aws-samples/aws-modernization-with-pulumi](https://github.com/aws-samples/aws-modernization-with-pulumi/tree/master/content)
CI/CD and GitOps | TypeScript | Civo, GitHub, Kubernetes | [cicd-with-gha-and-pulumi-operator](./archive/cicd-with-gha-and-pulumi-operator/) | [pulumi/workshops](https://github.com/pulumi/workshops/tree/efd4e76a923aa9e34b671d55935d5ec3b7361aff/cicd-with-gha-and-pulumi-operator)
Cloud Basics | C# | AWS | [aws-intro/csharp](./archive/aws-intro/csharp/) | [pulumi/infrastructure-as-code-workshop](https://github.com/pulumi/infrastructure-as-code-workshop/tree/master/labs/aws/in-person/csharp)
Cloud Basics | C# | Azure | [azure-intro/csharp](./archive/azure-intro/csharp/) | [pulumi/infrastructure-as-code-workshop](https://github.com/pulumi/infrastructure-as-code-workshop/tree/master/labs/azure/csharp)
Cloud Basics | Go | AWS | [aws-intro/go](./archive/aws-intro/go/) | [pulumi/infrastructure-as-code-workshop](https://github.com/pulumi/infrastructure-as-code-workshop/tree/master/labs/aws/in-person/go)
Cloud Basics | Python | AWS | [aws-intro/python](./archive/aws-intro/python/) | [pulumi/infrastructure-as-code-workshop](https://github.com/pulumi/infrastructure-as-code-workshop/tree/master/labs/aws/in-person/python)
Cloud Basics | Python | AWS | [pulumi-on-aws/python](./archive/pulumi-on-aws/python/) | [pulumi/infrastructure-as-code-workshop](https://github.com/pulumi/infrastructure-as-code-workshop/tree/master/labs/aws/pulumi-in-practice/python)
Cloud Basics | Python | Azure | [azure-intro/python](./archive/azure-intro/python/) | [pulumi/infrastructure-as-code-workshop](https://github.com/pulumi/infrastructure-as-code-workshop/tree/master/labs/azure/python)
Cloud Basics | TypeScript | AWS | [modern-infrastructure-as-code-ts](./archive/modern-infrastructure-as-code-ts/) | [aws-samples/aws-modernization-with-pulumi](https://github.com/aws-samples/aws-modernization-with-pulumi/tree/master/content)
Cloud Basics | TypeScript | AWS | [deploying-containers-to-ecs](./archive/deploying-containers-to-ecs/) | [aws-samples/aws-modernization-with-pulumi](https://github.com/aws-samples/aws-modernization-with-pulumi/tree/master/content)
Cloud Basics | TypeScript | AWS | [provision-ec2-virtual-machines](./archive/provision-ec2-virtual-machines/) | [aws-samples/aws-modernization-with-pulumi](https://github.com/aws-samples/aws-modernization-with-pulumi/tree/master/content)
Cloud Basics | TypeScript | AWS | [aws-intro/typescript](./archive/aws-intro/typescript/) | [pulumi/infrastructure-as-code-workshop](https://github.com/pulumi/infrastructure-as-code-workshop/tree/master/labs/aws/in-person/typescript)
Cloud Basics | .. | AWS | [introduction-to-pulumi](./archive/introduction-to-pulumi/) | [pulumi/introduction-to-pulumi](https://github.com/pulumi/introduction-to-pulumi)
Cloud Basics | .. | AWS | [aws-workshop](./archive/aws-workshop/) | [pulumi/aws-workshop](https://github.com/pulumi/aws-workshop)
Cloud Basics | TypeScript | Azure Native | [pulumi-azurenative-workshop](./archive/pulumi-azurenative-workshop/) | [jaxxstorm/pulumi-azurenative-workshop](https://github.com/jaxxstorm/pulumi-azurenative-workshop)
Cloud Basics | TypeScript | GCP | [pulumi-gcp-workshop](./archive/pulumi-gcp-workshop/) | [jaxxstorm/pulumi-gcp-workshop](https://github.com/jaxxstorm/pulumi-gcp-workshop)
Components | Python | Kubernetes | [pulumi-component-workshop](./archive/pulumi-component-workshop/) | [jaxxstorm/pulumi-component-workshop](https://github.com/jaxxstorm/pulumi-component-workshop)
GitOps | TypeScript | AWS | [gitops-for-socks-shop](./archive/gitops-for-socks-shop/) | [aws-samples/aws-modernization-with-pulumi](https://github.com/aws-samples/aws-modernization-with-pulumi/tree/master/content)
Platform Engineering | TypeScript, Python, Go | AWS | [building-a-kubernetes-platform-in-amazon-eks](./archive/archive/building-a-kubernetes-platform-in-amazon-eks/) | [aws-samples/aws-modernization-with-pulumi](https://github.com/aws-samples/aws-modernization-with-pulumi/tree/master/content)
Refactoring | Python | Azure | [pulumi-refactoring-workshop](./archive/pulumi-refactoring-workshop/) | [jaxxstorm/pulumi-refactoring-workshop](https://github.com/jaxxstorm/pulumi-refactoring-workshop)
Serverless | TypeScript | AWS | [lambda-for-serverless-application-patterns](./archive/lambda-for-serverless-application-patterns/) | [aws-samples/aws-modernization-with-pulumi](https://github.com/aws-samples/aws-modernization-with-pulumi/tree/master/content)
Testing/QA | .. | AWS | [testing-your-infrastructure](./archive/testing-your-infrastructure/) | [aws-samples/aws-modernization-with-pulumi](https://github.com/aws-samples/aws-modernization-with-pulumi/tree/master/content)
.. | TypeScript | Kubernetes, Digital Ocean, AWS | [pulumi-eksplatform-workshop](./archive/pulumi-eksplatform-workshop/) | [jaxxstorm/pulumi-component-workshop](https://github.com/jaxxstorm/pulumi-component-workshop)

</details>
