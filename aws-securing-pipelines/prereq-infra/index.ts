import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import * as pcloud from "@pulumi/pulumiservice";
import * as github from "@pulumi/github";
import * as fs from "fs";
import * as path from "path";

const vpc = new awsx.ec2.Vpc("aws-securing-pipelines", {
  natGateways: {
    strategy: "Single"
  }
});

const envYaml = `
values:
  stackRefs:
    fn::open::pulumi-stacks:
      stacks:
        vpcInfra:
          stack: ${pulumi.getProject()}/${pulumi.getStack()}
  pulumiConfig:
    vpcId: \${stackRefs.vpcInfra.vpcId}
    publicSubnetIds: \${stackRefs.vpcInfra.publicSubnetIds}
    privateSubnetIds: \${stackRefs.vpcInfra.privateSubnetIds}
`;

new pcloud.Environment("stack-ref-env", {
  organization: pulumi.getOrganization(),
  name: "vpc-stackref",
  project: "aws-securing-pipelines",
  yaml: new pulumi.asset.StringAsset(envYaml),
});

export const vpcId = vpc.vpcId;
export const publicSubnetIds = vpc.publicSubnetIds;
export const privateSubnetIds = vpc.privateSubnetIds;

const repo = new github.Repository("aws-securing-pipelines-infra");

const token = new pcloud.OrgAccessToken("github-actions-token", {
  name: "aws-securing-pipelines-gh-actions-2",
  organizationName: pulumi.getOrganization(),
  admin: true,
  description: "Used by GitHub Actions to run CI/CD for Pulumi pipelines"
});

new github.ActionsSecret("pulumi-cloud-token-gh-secret", {
  repository: repo.name,
  secretName: "PULUMI_ACCESS_TOKEN",
  plaintextValue: token.value,
});

function readFilesRecursively(dir: string): Array<{ filePath: string, content: string; }> {
  let results: Array<{ filePath: string, content: string; }> = [];

  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(readFilesRecursively(filePath));
    } else {
      const content = fs.readFileSync(filePath, 'utf8');
      results.push({ filePath: filePath.replace("repository_files/", ""), content });
    }
  });

  return results;
}

const files = readFilesRecursively("repository_files");

files.forEach((file) => {
  new github.RepositoryFile(file.filePath, {
    repository: repo.name,
    file: file.filePath,
    content: Buffer.from(file.content).toString(),
  });
});

export const repoUrl = repo.sshCloneUrl;