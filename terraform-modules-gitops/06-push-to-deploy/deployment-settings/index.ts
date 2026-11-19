import * as pulumi from "@pulumi/pulumi";
import * as pulumiservice from "@pulumi/pulumiservice";

const config = new pulumi.Config();
const repository = config.require("repository"); // "<github-owner>/<repo>"
const executorImage = config.get("executorImage"); // optional: custom executor image, see README

// Deployment settings for stack tf-modules-gitops/dev. They live in their own
// project: a stack should not manage its own deployment settings.
new pulumiservice.DeploymentSettings("tf-modules-gitops-dev", {
    organization: pulumi.getOrganization(),
    project: "tf-modules-gitops",
    stack: "dev",
    github: {
        repository,
        deployCommits: true, // "Run updates for pushed commits"
        previewPullRequests: true, // "Run previews for pull requests"
    },
    sourceContext: { git: { branch: "refs/heads/main" } },
    ...(executorImage ? { executorContext: { executorImage } } : {}),
});
