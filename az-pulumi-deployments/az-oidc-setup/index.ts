import * as pulumi from "@pulumi/pulumi";
import * as azuread from "@pulumi/azuread";
import * as auth from "@pulumi/azure-native/authorization";
import * as pcloud from "@pulumi/pulumiservice";

const config = new pulumi.Config();

export const org = config.get("pulumiOrg") ?? pulumi.getOrganization();
export const project = config.require("pulumiProject");
export const stack = config.get("pulumiStack") ?? "dev";

const githubRepo = config.require("githubRepo");
export const defaultBranch = config.get("defaultBranch") ?? "main";

const appName = `pulumi-deployments-${org}`;
const app = new azuread.Application(appName, {
  displayName: appName,
  requiredResourceAccesses: [
    // TODO: refactor this to use well-known IDs. See:
    // https://www.pulumi.com/registry/packages/azuread/api-docs/approleassignment/
    //
    // Grant Microsoft Graph the User.Read permission. When an Application is
    // created through the Azure Console, this is permission is granted
    // automatically. It's not clear whether this permission is actually
    // necessary - need to test.:
    {
      resourceAccesses: [{
        id: "e1fe6dd8-ba31-4d61-89e7-88639da4683d",
        type: "Scope",
      }],
      resourceAppId: "00000003-0000-0000-c000-000000000000",
    },
  ],
  // Authentication Tab:
  web: {
    implicitGrant: {
      accessTokenIssuanceEnabled: true,
    },
  },
});

// This is created automatically when creating an Application through the Azure Portal:
const servicePrincipal = new azuread.ServicePrincipal(appName, {
  applicationId: app.applicationId,
});

const CONTRIBUTOR_ROLE_DEFINITION_ID = "b24988ac-6180-42a0-ab88-20f7382dd24c";

const currentClient = auth.getClientConfigOutput();
const subscriptionId = currentClient.subscriptionId;
const fullSubId = pulumi.interpolate`subscriptions/${subscriptionId}`;

new auth.RoleAssignment("pulumi-oidc-contributor", {
  principalId: servicePrincipal.id,
  principalType: "ServicePrincipal",
  roleDefinitionId: `${fullSubId}/providers/Microsoft.Authorization/roleDefinitions/${CONTRIBUTOR_ROLE_DEFINITION_ID}`,
  scope: fullSubId,
});

for (let operation of ["preview", "update", "refresh", "destroy"]) {
  const subject = `pulumi:deploy:org:${org}:project:${project}:stack:${stack}:operation:${operation}:scope:write`;

  new azuread.ApplicationFederatedIdentityCredential(`cred-${org}-${project}-${stack}-${operation}`, {
    applicationObjectId: app.id,
    audiences: [org],
    displayName: operation,
    issuer: "https://api.pulumi.com/oidc",
    subject: subject,
  });
}

new pcloud.DeploymentSettings("deployment_settings", {
  organization: org,
  project: project,
  stack: stack,
  github: {
    repository: githubRepo,
    deployCommits: true,
    previewPullRequests: true,
  },
  sourceContext: {
    git: {
      branch: `refs/heads/${defaultBranch}`,
    }
  },
  operationContext: {
    oidc: {
      azure: {
        clientId: app.applicationId,
        tenantId: currentClient.tenantId,
        subscriptionId: subscriptionId
      }
    },
  },
});
