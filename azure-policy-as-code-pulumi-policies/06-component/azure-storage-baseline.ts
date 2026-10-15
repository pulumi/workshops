import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";

const tagContributorRoleId = "/providers/Microsoft.Authorization/roleDefinitions/4a9ae827-6dc8-4573-8ac7-8239d42aa03f";

export interface AzureStorageBaselineArgs {
    /** Name (id) of the management group that holds definitions and assignment. */
    managementGroupId?: pulumi.Input<string>;
    /** Fallback when you have no management group rights: use this subscription id as scope. */
    subscriptionId?: pulumi.Input<string>;
    /** Audit, Deny or Disabled. Defaults to Audit. */
    effect?: pulumi.Input<string>;
    /** Resource ids that get a Waiver exemption. */
    exemptScopes?: pulumi.Input<string>[];
    /** Expiry of every exemption, ISO 8601. */
    exemptionExpiresOn?: pulumi.Input<string>;
    /** Region for the assignment's managed identity. */
    location: pulumi.Input<string>;
}

/**
 * The storage baseline from steps 3 to 5 as one unit: two custom definitions,
 * the initiative, the assignment with its identity, and optional exemptions.
 */
export class AzureStorageBaseline extends pulumi.ComponentResource {
    public readonly assignmentId: pulumi.Output<string>;
    public readonly scope: pulumi.Output<string>;

    constructor(name: string, args: AzureStorageBaselineArgs, opts?: pulumi.ComponentResourceOptions) {
        super("workshop:azure:AzureStorageBaseline", name, {}, opts);
        const parent = { parent: this };
        const atGroup = args.managementGroupId !== undefined;
        if (atGroup === (args.subscriptionId !== undefined)) {
            throw new Error("Set exactly one of managementGroupId or subscriptionId.");
        }
        const scope = atGroup
            ? pulumi.interpolate`/providers/Microsoft.Management/managementGroups/${args.managementGroupId}`
            : pulumi.interpolate`/subscriptions/${args.subscriptionId}`;
        const effect = args.effect ?? "Audit";

        // Old logical names from step 5 (top level of the stack) keep every resource in place.
        const moved = (oldName: string): pulumi.Alias[] => [{ name: oldName, parent: pulumi.rootStackResource }];

        const denyRule = {
            if: {
                allOf: [
                    { field: "type", equals: "Microsoft.Storage/storageAccounts" },
                    { not: { field: "Microsoft.Storage/storageAccounts/allowBlobPublicAccess", equals: "false" } },
                ],
            },
            then: { effect: "[parameters('effect')]" },
        };
        const denyParameters = {
            effect: {
                type: "String",
                metadata: { displayName: "Effect" },
                allowedValues: ["Audit", "Deny", "Disabled"],
                defaultValue: "Audit",
            },
        };
        const tagRule = {
            if: {
                allOf: [
                    { field: "type", equals: "Microsoft.Storage/storageAccounts" },
                    { field: "tags['governed-by']", exists: "false" },
                ],
            },
            then: {
                effect: "modify",
                details: {
                    roleDefinitionIds: [tagContributorRoleId],
                    operations: [{ operation: "add", field: "tags['governed-by']", value: "pulumi" }],
                },
            },
        };

        let denyId: pulumi.Output<string>;
        let tagId: pulumi.Output<string>;
        let baselineId: pulumi.Output<string>;
        const initiativeParameters = {
            effect: { type: "String", allowedValues: ["Audit", "Deny", "Disabled"], defaultValue: "Audit" },
        };
        const references = (deny: pulumi.Input<string>, tag: pulumi.Input<string>) => [
            {
                policyDefinitionId: deny,
                policyDefinitionReferenceId: "deny-public-blob",
                parameters: { effect: { value: "[parameters('effect')]" } },
            },
            { policyDefinitionId: tag, policyDefinitionReferenceId: "tag-governed-by" },
        ];
        const denyCommon = {
            policyDefinitionName: "deny-public-blob-access",
            displayName: "Storage accounts must not allow public blob access",
            policyType: "Custom",
            mode: "Indexed",
            metadata: { category: "Storage" },
            parameters: denyParameters,
            policyRule: denyRule,
        };
        const tagCommon = {
            policyDefinitionName: "tag-governed-by-pulumi",
            displayName: "Storage accounts get the governed-by tag",
            policyType: "Custom",
            mode: "Indexed",
            metadata: { category: "Tags" },
            policyRule: tagRule,
        };
        const setCommon = {
            policySetDefinitionName: "ws-storage-baseline",
            displayName: "Workshop storage baseline",
            policyType: "Custom",
            metadata: { category: "Storage" },
            parameters: initiativeParameters,
        };

        if (atGroup) {
            const managementGroupId = args.managementGroupId!;
            const deny = new azure.authorization.PolicyDefinitionAtManagementGroup(`${name}-deny-public-blob`,
                { ...denyCommon, managementGroupId }, { ...parent, aliases: moved("deny-public-blob-access") });
            const tag = new azure.authorization.PolicyDefinitionAtManagementGroup(`${name}-tag-governed-by`,
                { ...tagCommon, managementGroupId }, { ...parent, aliases: moved("tag-governed-by-pulumi") });
            const set = new azure.authorization.PolicySetDefinitionAtManagementGroup(`${name}-initiative`,
                { ...setCommon, managementGroupId, policyDefinitions: references(deny.id, tag.id) },
                { ...parent, aliases: moved("ws-storage-baseline") });
            denyId = deny.id; tagId = tag.id; baselineId = set.id;
        } else {
            const deny = new azure.authorization.PolicyDefinition(`${name}-deny-public-blob`,
                denyCommon, { ...parent, aliases: moved("deny-public-blob-access") });
            const tag = new azure.authorization.PolicyDefinition(`${name}-tag-governed-by`,
                tagCommon, { ...parent, aliases: moved("tag-governed-by-pulumi") });
            const set = new azure.authorization.PolicySetDefinition(`${name}-initiative`,
                { ...setCommon, policyDefinitions: references(deny.id, tag.id) },
                { ...parent, aliases: moved("ws-storage-baseline") });
            denyId = deny.id; tagId = tag.id; baselineId = set.id;
        }
        void denyId; void tagId;

        const assignment = new azure.authorization.PolicyAssignment(`${name}-assignment`, {
            scope,
            policyAssignmentName: "ws-storage-baseline",
            displayName: "Workshop storage baseline",
            policyDefinitionId: baselineId,
            parameters: { effect: { value: effect } },
            identity: { type: "SystemAssigned" },
            location: args.location,
        }, { ...parent, aliases: moved("ws-storage-baseline-assignment") });

        new azure.authorization.RoleAssignment(`${name}-tag-contributor`, {
            scope,
            principalId: assignment.identity.apply(i => i!.principalId),
            principalType: "ServicePrincipal",
            roleDefinitionId: tagContributorRoleId,
        }, { ...parent, aliases: moved("ws-assignment-tag-contributor") });

        (args.exemptScopes ?? []).forEach((exemptScope, i) => {
            new azure.authorization.PolicyExemption(`${name}-exemption-${i}`, {
                scope: exemptScope,
                policyExemptionName: `ws-waiver-${i}`,
                displayName: "Workshop waiver: legacy storage account",
                policyAssignmentId: assignment.id,
                exemptionCategory: "Waiver",
                expiresOn: args.exemptionExpiresOn,
            }, parent);
        });

        this.assignmentId = assignment.id;
        this.scope = pulumi.output(scope);
        this.registerOutputs({ assignmentId: this.assignmentId, scope: this.scope });
    }
}
