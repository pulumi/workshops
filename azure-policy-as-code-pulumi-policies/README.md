# Azure Policy as code with Pulumi

Demo code for the workshop "Azure Policy as code with Pulumi: management groups, initiatives, assignments and preventive Pulumi Policies". You build an Azure Policy baseline for storage accounts in TypeScript, then add a Pulumi Policies pack that blocks the same violation before Azure is called.

Slides follow in `slides/` on this branch.

## What you build

| Step | Folder | End state |
|---|---|---|
| 1 | `01-setup` | `pulumi preview` on an empty program succeeds |
| 2 | `02-management-group` | `pulumi up` completes; management group `ws-governance` is visible with the subscription as child; resource group `rg-policy-ws` exists in westeurope |
| 3 | `03-policy-definition` | custom definition `deny-public-blob-access` exists at management group scope |
| 4 | `04-initiative` | initiative `ws-storage-baseline` references the deny definition and a Modify definition |
| 5 | `05-assignment` | assignment at management group scope, effect Audit, with a system-assigned identity that holds Tag Contributor |
| 6 | `06-component` | steps 3 to 5 live in the `AzureStorageBaseline` component; `pulumi preview` shows no replacement |
| 7 | `07-audit-exempt-remediate` | a public-blob storage account is flagged under Audit, waived by an exemption, tags fixed by remediation; with effect Deny a second account is rejected |
| 8 | `08-policy-pack` | `pulumi preview --policy-pack ./policy-pack` fails before any Azure call |
| 9 | none | discussion: Azure Policy at runtime next to Pulumi Policies at deployment time |

Each numbered folder is a complete Pulumi project and builds on the one before. All of them use the project name `azure-policy-workshop` and the stack `dev`, so run one step after another against the same stack.

## Prerequisites

- An Azure subscription, and a tenant where you may create management groups and assign policy at that scope. If you cannot, set `scopeMode` to `subscription` (see below).
- Azure CLI (`az`), signed in with `az login`.
- Pulumi CLI v3.268.0 and a Pulumi Cloud login (`pulumi login`).
- Node.js v24.22.0.
- Run `scripts/preflight.sh` to check all of this.

Pinned versions: `@pulumi/pulumi` 3.268.0, `@pulumi/azure-native` 3.28.0, `@pulumi/policy` 1.21.0, `typescript` 6.0.3 (TypeScript 7 is not supported by the Pulumi Node.js SDK yet; check the language page before you upgrade).

## Run it

```bash
npm install                       # once, in this folder: one workspace for all steps
cd 01-setup
pulumi stack init dev
pulumi config set azure-native:subscriptionId "$(az account show --query id -o tsv)"
pulumi config set azure-native:location westeurope
pulumi preview
```

For the next step, go to the next folder, run `pulumi stack select dev`, set the same two config values, then `pulumi up`. Stack config lives in `Pulumi.dev.yaml`, which is not committed.

Optional: keep Azure credentials in a Pulumi ESC environment that uses `fn::open::azure-login` (`clientId`, `tenantId`, `subscriptionId`, `oidc: true`) and link it with `pulumi config env add`.

### Config keys

| Key | Default | Used from step | Meaning |
|---|---|---|---|
| `azure-native:subscriptionId` | required | 2 | subscription that moves under the management group |
| `location` | `westeurope` | 2 | region for the resource group, storage accounts and assignment identity |
| `effect` | `Audit` | 5 | `Audit`, `Deny` or `Disabled` for the initiative parameter |
| `scopeMode` | `managementGroup` | 6 | `subscription` skips the management group and assigns at subscription scope |
| `deploySecondAccount` | `false` | 7 | adds a second public-blob storage account |
| `exemptionExpiresOn` | `2026-12-31T00:00:00Z` | 7 | expiry of the waiver |

## Step 7 in order

```bash
cd 07-audit-exempt-remediate
pulumi up                                        # effect Audit: account is created, flagged non-compliant
az policy state trigger-scan                     # start a compliance scan
pulumi config set effect Deny
pulumi config set deploySecondAccount true
pulumi up                                        # Azure rejects the second account at deployment time
```

The `legacy` account is covered by a Waiver exemption with `expiresOn`, so Deny does not touch it. The remediation task applies the Modify definition (tag `governed-by=pulumi`) to existing accounts.

## Step 8

```bash
cd 08-policy-pack
(cd policy-pack && npm test)                     # unit tests for the rule
pulumi preview --policy-pack ./policy-pack       # mandatory violation, nothing is sent to Azure
```

## Subscription scope fallback

If the tenant gives you no management group rights, run `pulumi config set scopeMode subscription` from step 6 on. The component then creates `PolicyDefinition`, `PolicySetDefinition` and `PolicyAssignment` at `/subscriptions/<id>`, and step 7 uses `RemediationAtSubscription`. Steps 2 to 5 are management group only.

## Cost and teardown

Azure Policy has no charge. The only billed resource is one empty `Standard_LRS` storage account, for under two hours.

```bash
cd 07-audit-exempt-remediate        # the step you last deployed
../scripts/teardown.sh
```

The script removes the exemption and remediation, moves the subscription back to its original parent (a management group must be empty before it is deleted), runs `pulumi destroy` and `pulumi stack rm`, then checks that the management group and resource group are gone. Set `ORIGINAL_PARENT` if the subscription did not sit directly under the tenant root group.

## Layout

```text
.
├── README.md
├── AGENTS.md
├── package.json              npm workspace for every step
├── package-lock.json
├── .gitignore
├── .shellcheckrc
├── scripts/
│   ├── preflight.sh
│   └── teardown.sh
├── 01-setup/                 Pulumi.yaml, index.ts, package.json, tsconfig.json
├── 02-management-group/      same four files
├── 03-policy-definition/     same four files
├── 04-initiative/            same four files
├── 05-assignment/            same four files
├── 06-component/             the four files plus azure-storage-baseline.ts
├── 07-audit-exempt-remediate/  the four files plus azure-storage-baseline.ts
└── 08-policy-pack/           the four files plus azure-storage-baseline.ts
    └── policy-pack/
        ├── PulumiPolicy.yaml
        ├── index.ts
        ├── rule.ts
        ├── package.json
        ├── tsconfig.json
        └── test/index.test.ts
```

## Sources

All read on 2026-10-15.

- Pulumi docs: Pulumi Policies (policy packs authoring), `@pulumi/policy` reference, Pulumi ESC `azure-login`, Azure Native installation and configuration, aliases, TypeScript language page.
- Pulumi Registry (azure-native 3.28.0): `management:ManagementGroup`, `management:ManagementGroupSubscription`, `authorization:PolicyDefinitionAtManagementGroup`, `PolicySetDefinitionAtManagementGroup`, `PolicyAssignment`, `PolicyExemption`, `RoleAssignment`, `policyinsights:RemediationAtManagementGroup`, `RemediationAtSubscription`.
- Microsoft Learn: Azure Policy definition structure, effect `modify`, remediation, exemption structure, management groups, built-in role Tag Contributor, built-in definition "Storage accounts should prevent public blob access".
