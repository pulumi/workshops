# Azure DevOps + Pulumi + ESC: Complete Tutorial

This tutorial demonstrates how to set up a complete CI/CD pipeline using Azure DevOps, Pulumi, and Pulumi ESC (Environments, Secrets, and Configuration) to deploy an Azure Functions application with infrastructure as code.

## Values Used in This Tutorial

This walkthrough uses these specific values for easy copy-paste. **Replace them with your own:**

- **Azure DevOps Organization**: `pulumi-demo`
- **Azure DevOps Project**: `test-project`
- **Azure DevOps Repository**: `test-project`
- **Pulumi Organization**: `adamgordonbell-org`
- **Pulumi Project**: `azure-dev`
- **ESC Environment**: `azure-dev`
- **Full ESC Path**: `azure-dev/azure-dev` (project/environment)

## Prerequisites

Before starting, ensure you have:

- **This repository** cloned locally with:
  - Infrastructure code (Pulumi C# project in `infrastructure/`)
  - Function app code (C# Azure Functions in `function/`)
- **Infrastructure already deployed once** - The PR and merge workflows will perform updates, not initial deployments
- **Azure CLI** installed and authenticated (`az login`)
- **Pulumi CLI** installed (`pulumi` command available)
- **ESC CLI** installed (`esc` command available)
- **Azure subscription** with appropriate permissions
- **Pulumi account** at https://app.pulumi.com
- **Internal reference**: `docs/secrets.md` (contains values for your use, not shared with audience)

## Step 1: Create Azure DevOps Project

1. Go to <https://dev.azure.com/pulumi-demo/>
2. Click **+ New project**
3. Name your project: `test-project`
4. Set visibility (Private or Public)
5. Click **Create**

### Add Azure DevOps as a Remote

Once your project is created, you'll get a Git repository URL. Add it as a remote:

```bash
# Add the Azure DevOps repo as origin2
git remote add origin2 https://pulumi-demo@dev.azure.com/pulumi-demo/test-project/_git/test-project

# Push your code to Azure DevOps
git push origin2 main
```

## Step 2: Get Azure Credentials for ESC

Pulumi ESC will manage your Azure credentials. First, retrieve your Azure service principal details:

### Get your App ID

```bash
export APP_ID=$(az ad sp list --display-name "pulumi-azure-devops" --query "[0].appId" -o tsv)
echo $APP_ID
```

### Create a New Client Secret

```bash
EXPIRY="$(date -u -v+1H '+%Y-%m-%dT%H:%M:%SZ')"
NEW_SECRET="$(az ad app credential reset \
  --id "$APP_ID" \
  --append \
  --display-name "azure-devops-temp-$(date +%Y%m%d%H%M)" \
  --end-date "$EXPIRY" \
  --query password -o tsv)"
echo $NEW_SECRET
```

### Get your Tenant and Subscription IDs

```bash
az account show --query "{tenantId:tenantId, subscriptionId:id}" -o table
```

Save these values - you'll need them in the next step.

## Step 3: Create the ESC Environment

Pulumi ESC (Environments, Secrets, and Configuration) centralizes your secrets and configuration.

1. Go to <https://app.pulumi.com>
2. Navigate to **ESC** → **Environments**
3. Click **Create Environment**
4. Name it `azure-dev/azure-dev` (or create project `azure-dev` first, then environment `azure-dev` within it)
5. Paste this configuration (replace the placeholders with values from Step 2):

```yaml
values:
  azure:
    login:
      fn::open::azure-login:
        clientId: <YOUR_CLIENT_ID>
        clientSecret:
          fn::secret: <YOUR_CLIENT_SECRET>
        tenantId: <YOUR_TENANT_ID>
        subscriptionId: <YOUR_SUBSCRIPTION_ID>

  environmentVariables:
    ARM_CLIENT_ID: ${azure.login.clientId}
    ARM_CLIENT_SECRET: ${azure.login.clientSecret}
    ARM_TENANT_ID: ${azure.login.tenantId}
    ARM_SUBSCRIPTION_ID: ${azure.login.subscriptionId}
    ARM_USE_CLI: "false"
```

6. Click **Save**

## Step 4: Test Locally

Before setting up CI/CD, verify that ESC works locally:

### Run a Preview

```bash
cd infrastructure
esc env run azure-dev/azure-dev -- pulumi preview
```

This should show your infrastructure changes without deploying.

### Deploy (if needed)

```bash
esc env run azure-dev/azure-dev -- pulumi up -y
```

This deploys your infrastructure and function app.

## Step 5: Create Azure DevOps Variable Group

Variable groups store secrets that pipelines can access.

1. In Azure DevOps, go to **Pipelines** → **Library**
2. Click **+ Variable group**
3. Name it **exactly**: `pulumi-credentials` (must match the YAML files)
4. Add two variables:

   | Name | Value | Type |
   |------|-------|------|
   | `PULUMI_ACCESS_TOKEN` | Your Pulumi access token from <https://app.pulumi.com/account/tokens> | Secret (🔒) |
   | `ESC_ENV_NAME` | `azure-dev/azure-dev` | Plain text |

5. Click the **Security** tab
6. Enable: **"Grant access permission to all pipelines"**
   - This allows the pipelines to use this variable group
   - Without this, you'll get authorization errors
7. Click **Save**

## Step 6: Create the Pipelines

The pipeline YAML files are already in the repository. Now create the pipeline definitions in Azure DevOps.

### Create Main Deployment Pipeline

1. Go to **Pipelines** → **Pipelines**
2. Click **New pipeline** (or **Create Pipeline**)
3. **Where is your code?** → Select **Azure Repos Git**
4. **Select repository** → Choose your repository
5. **Configure your pipeline** → Select **Existing Azure Pipelines YAML file**
6. **Select YAML file**:
   - Branch: `main`
   - Path: `/azure-pipelines.yml`
7. Click **Continue**
8. Click **Save** (don't run yet - we'll test the full workflow later)
9. Optionally rename the pipeline to "Deploy" or "Main Deployment"

### Create PR Preview Pipeline

Repeat the process for the PR pipeline:

1. Click **New pipeline** again
2. Follow same steps but select `/azure-pipelines-pr.yml`
3. Click **Continue**
4. Click **Save** (don't run yet)
5. Rename the pipeline to "PR Pipeline" or "PR Preview"

## Step 7: Set Up Build Policy for PR Validation

**Important**: Azure Repos doesn't support the `pr:` trigger in YAML like GitHub does. Instead, you must configure a **Build Validation Policy** on the branch.

### Why Build Policies?

- Azure Repos uses branch policies to trigger PR builds
- The `pr:` section in YAML only works for GitHub repositories
- Build policies ensure every PR to `main` runs the preview pipeline

### Option A: Using Azure CLI (Recommended)

**First, find your repository ID and pipeline ID:**

```bash
# List repositories
az repos list --project test-project --query "[].{name:name, id:id}" -o table

# List pipelines
az pipelines list --project test-project --query "[].{name:name, id:id}" -o table
```

**Then create the build policy (replace `<your-repo-id>` and `<pr-pipeline-id>` with values from above):**

```bash
az repos policy build create \
  --project test-project \
  --repository-id <your-repo-id> \
  --branch main \
  --build-definition-id <pr-pipeline-id> \
  --display-name "PR Preview - Pulumi" \
  --enabled true \
  --blocking true \
  --manual-queue-only false \
  --queue-on-source-update-only false \
  --valid-duration 0
```

### Option B: Using Azure DevOps UI

1. Go to **Project Settings** (bottom left)
2. Under **Repos**, click **Repositories**
3. Select your repository
4. Click **Policies** tab
5. Under **Branch Policies**, select `main`
6. Scroll to **Build Validation**
7. Click **+** to add a build policy
8. Configure:
   - **Build pipeline**: Select "PR Pipeline"
   - **Display name**: "PR Preview - Pulumi"
   - **Trigger**: Automatic
   - **Policy requirement**: Required
   - **Build expiration**: Immediately
9. Click **Save**

## Step 8: Test the Complete PR Workflow

Now let's test the entire workflow from branch creation to deployment.

### Create a Test Branch and Make a Change

```bash
# Create a new branch
git checkout -b test-pr-workflow

# Make a small change (add a comment to the infrastructure code)
# Edit infrastructure/Program.cs and add a comment somewhere

# Commit and push
git add infrastructure/Program.cs
git commit -m "Test PR workflow with minor change"
git push origin2 test-pr-workflow
```

### Create the Pull Request

1. Go to Azure DevOps → **Repos** → **Pull requests**
2. You should see a prompt to create a PR from your pushed branch
3. Click **Create a pull request**
4. Fill in:
   - **Title**: "Test PR workflow"
   - **Description**: Add any notes
5. Click **Create**

### Watch the PR Build Run

Within a few seconds, you should see the build policy kick in:

1. The PR page will show a build status check
2. Click on the build to watch it run
3. The build will:
   - Install .NET 8 SDK
   - Install Pulumi and ESC CLIs
   - Create a placeholder function zip (for preview only)
   - Restore the infrastructure project
   - Select or create the Pulumi stack
   - Run `pulumi preview` via ESC

**Understanding the PR Pipeline (`azure-pipelines-pr.yml`):**

- **Trigger**: None - only runs via branch policy
- **Purpose**: Show infrastructure changes without deploying
- **Key Steps**:
  1. Creates a placeholder zip file (preview doesn't need the actual build)
  2. Runs `esc env run -- pulumi preview` to show what would change
  3. Posts results as build output (viewable in Azure DevOps)
- **What you'll see**: A diff of infrastructure changes (tags, configuration, etc.)

### Merge the Pull Request

Once the build succeeds:

1. Click **Complete** on the PR
2. Choose merge options (default is fine)
3. Click **Complete merge**

### Watch the Main Deployment Pipeline Run

After merging, the main deployment pipeline should automatically trigger:

1. Go to **Pipelines** → **Pipelines**
2. You should see a new run of the "Deploy" pipeline
3. Click it to watch the deployment

**Understanding the Main Pipeline (`azure-pipelines.yml`):**

- **Trigger**: Push to `main` branch
- **Purpose**: Build, package, and deploy everything
- **Key Steps**:
  1. Installs .NET 8 SDK
  2. Builds the function app (`dotnet build`, `dotnet publish`)
  3. Creates a zip file of the function app
  4. Restores the infrastructure project
  5. Runs `esc env run -- pulumi up --yes` to deploy
     - ESC injects Azure credentials automatically
     - Pulumi updates infrastructure
     - Function app zip is uploaded to blob storage
     - Azure Functions pulls the new code via SAS URL
- **Result**: Your infrastructure and function app are deployed to Azure

## Wrap-Up

Congratulations! You've set up a complete CI/CD pipeline with:

✅ **Infrastructure as Code** - Pulumi C# project defining all Azure resources
✅ **Secrets Management** - Pulumi ESC centralizing Azure credentials
✅ **Pull Request Preview** - Every PR shows infrastructure changes before merging
✅ **Automated Deployment** - Merging to main automatically deploys to Azure
✅ **Zero Hardcoded Secrets** - All credentials managed through ESC and Azure DevOps variable groups

### Key Takeaways

1. **Azure Repos requires branch policies** for PR builds (not YAML `pr:` triggers)
2. **ESC simplifies credential management** - no secrets in YAML files
3. **Preview before deploy** - PR builds show changes without applying them
4. **Automated workflow** - Push to main = automatic deployment

### Next Steps

- Add more comprehensive tests to your pipelines
- Set up staging environments with different Pulumi stacks
- Explore Pulumi's policy as code (Pulumi CrossGuard)
- Add deployment approval gates for production
