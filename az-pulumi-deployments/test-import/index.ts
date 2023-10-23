import * as pulumi from "@pulumi/pulumi";
import * as azuread from "@pulumi/azuread";

const pulumi_deployments_oidc = new azuread.Application("pulumi-deployments-oidc", {
  displayName: "pulumi-deployments-oidc",
  featureTags: [{}],
  owners: ["251257f6-8fae-4c6a-a56d-bb0f52bfbf4c"], // Evan
  requiredResourceAccesses: [
    {
      resourceAccesses: [{
        id: "41094075-9dad-400e-a0bd-54e686782033",
        type: "Scope",
      }],
      resourceAppId: "797f4846-ba00-4fd7-ba43-dac1f8f63013",
    },
    {
      resourceAccesses: [{
        id: "e1fe6dd8-ba31-4d61-89e7-88639da4683d",
        type: "Scope",
      }],
      resourceAppId: "00000003-0000-0000-c000-000000000000",
    },
  ],
  tags: [
    "webApp",
    "apiConsumer",
  ],
  web: {
    implicitGrant: {
      accessTokenIssuanceEnabled: true,
    },
  },
}, {
  protect: true,
});

const test = new azuread.ApplicationFederatedIdentityCredential("test", {
  applicationObjectId: "460a3fef-5e71-4c19-846d-6b6049aca841",
  audiences: ["pulumi"],
  displayName: "pulumi-deployments-oidc",
  issuer: "https://api.pulumi.com/oidc",
  subject: "pulumi:deploy:org:pulumi:project:pulumi-cloud-import-azure:stack:pulumi-westus2:operation:preview:scope:write",
}, {
  protect: true,
});
