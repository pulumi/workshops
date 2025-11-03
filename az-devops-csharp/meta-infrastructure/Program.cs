using System.Collections.Generic;
using Pulumi;
using Pulumi.AzureDevOps;

return await Deployment.RunAsync(() =>
{
    // Create an Azure DevOps project
    var project = new Project("demo-project", new ProjectArgs
    {
        Name = "MetaInfraDemo",
        Description = "Demo project with automated repository and pipeline",
        Visibility = "private",
        VersionControl = "Git",
        WorkItemTemplate = "Agile"
    });

    // Create a Git repository within the project
    var repo = new Git("demo-repo", new GitArgs
    {
        ProjectId = project.Id,
        Name = "demo-app",
        DefaultBranch = "refs/heads/main",
        Initialization = new Pulumi.AzureDevOps.Inputs.GitInitializationArgs
        {
            InitType = "Clean"
        }
    });

    // Create a sample azure-pipelines.yml file in the repository
    var pipelineYaml = new GitRepositoryFile("pipeline-yaml", new GitRepositoryFileArgs
    {
        RepositoryId = repo.Id,
        File = "azure-pipelines.yml",
        Content = @"trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

steps:
- script: echo Hello, world!
  displayName: 'Run a one-line script'

- script: |
    echo Add other tasks to build, test, and deploy your project.
    echo See https://aka.ms/yaml
  displayName: 'Run a multi-line script'

- task: DotNetCoreCLI@2
  displayName: 'Build the project'
  inputs:
    command: 'build'
    projects: '**/*.csproj'
",
        Branch = "refs/heads/main",
        CommitMessage = "Add initial pipeline configuration",
        OverwriteOnCreate = true
    });

    // Create a README file
    var readmeFile = new GitRepositoryFile("readme", new GitRepositoryFileArgs
    {
        RepositoryId = repo.Id,
        File = "README.md",
        Content = @"# Demo App

This repository was created automatically using Pulumi infrastructure as code.

## CI/CD Pipeline

This repository includes an Azure DevOps pipeline that runs on every push to main branch.
",
        Branch = "refs/heads/main",
        CommitMessage = "Add README",
        OverwriteOnCreate = true
    });

    // Create the build pipeline
    var buildPipeline = new BuildDefinition("demo-pipeline", new BuildDefinitionArgs
    {
        ProjectId = project.Id,
        Name = "DemoBuild",
        Repository = new Pulumi.AzureDevOps.Inputs.BuildDefinitionRepositoryArgs
        {
            RepoType = "TfsGit",
            RepoId = repo.Id,
            BranchName = "refs/heads/main",
            YmlPath = "azure-pipelines.yml"
        },
        CiTrigger = new Pulumi.AzureDevOps.Inputs.BuildDefinitionCiTriggerArgs
        {
            UseYaml = true
        }
    });

    // Export important values
    return new Dictionary<string, object?>
    {
        ["projectName"] = project.Name,
        ["projectUrl"] = Output.Format($"https://dev.azure.com/{project.Name}"),
        ["repoName"] = repo.Name,
        ["repoUrl"] = repo.WebUrl,
        ["pipelineName"] = buildPipeline.Name,
        ["pipelineUrl"] = Output.Format($"{repo.WebUrl}/_build")
    };
});
