# Certificate and PKI lifecycle as code with cert-manager, AWS Private CA and Vault PKI

You build a private certificate hierarchy on AWS with Pulumi IaC, issue certificates to an EKS cluster through cert-manager from two different CAs (AWS Private CA and Vault PKI), force a renewal, wire up expiry alerts, and wrap the pattern in one Pulumi component. Pulumi ESC supplies the AWS login and the Vault token.

No workshop page yet. The Slidev deck follows on this branch (folder `slides/`, not present yet).

## What you build

By the end you can:

1. Create an AWS Private CA (root and subordinate) with a Pulumi program and show the status ACTIVE in the AWS console or CLI.
2. Show a cert-manager Certificate issued by the AWS Private CA issuer and one issued by the Vault PKI issuer, both Ready=True in `kubectl`.
3. Trigger a renewal and show that the Secret holds a new serial number without a redeploy.
4. Show the CloudWatch alarm on the ACM `DaysToExpiry` metric move to ALARM and the SNS email arrive.
5. Read the Vault token and the AWS login from a Pulumi ESC environment instead of a local file, and say where each secret lives.

## Sessions and speakers

Not scheduled yet. Dates, length and speakers are added when the workshop is booked.

## Prerequisites

Participants:

- An AWS account where you can create EKS, IAM roles, ACM, Private CA, CloudWatch and SNS resources (AdministratorAccess in a sandbox account is simplest). Region: `eu-central-1`.
- A Pulumi Cloud account and the Pulumi CLI 3.272.0 or later.
- Node.js and npm, `kubectl`, the Helm CLI, `openssl`, `jq` and the AWS CLI. `cmctl` is optional (step 07 falls back to deleting the Secret without it).
- An email address for the SNS subscription.
- An IAM role that trusts the Pulumi Cloud OIDC issuer, for the ESC `aws-login` provider.
- Read the Private CA cost section below before you create a CA.

Presenter, before the session:

- A sandbox AWS account, or AWS credentials per participant through an ESC environment. Check the Private CA service quota for 2 CAs per account and region.
- The ESC environment template in `01-esc-environment/environment.yaml`, with the OIDC role ARN filled in.
- A rehearsed run from an empty account and an empty stack, with the stack outputs and renewal timings recorded.
- A pre-created cluster and CAs to switch to if a deploy runs long. EKS creation takes 12 to 15 minutes.

## Run the demo

All commands run from the step folder unless a path is shown. The steps use the stack name `dev`.

### Once only

```bash
cd 01-esc-environment
ORG=<your-org> ROLE_ARN=<oidc-role-arn> ./setup.sh
```

`setup.sh` creates the ESC environment `pki-workshop/aws-vault`, installs the npm dependencies at the folder root, creates the stack `dev` for step 01, links the environment, and runs `pulumi up`.

For each of steps 02 to 08, create the stack and link the environment once, then run the step:

```bash
pulumi stack init dev
pulumi config env add pki-workshop/aws-vault --stack dev --yes
pulumi up
```

Later steps read earlier steps through stack references to `<org>/pki-0N-.../dev`, so run the steps in order.

### Between runs

Re-run `pulumi up` in the step you changed. Step 07 and step 08 can be re-run on their own as long as steps 02 to 06 stay deployed.

### Config keys

| Step | Key | How to set it |
| --- | --- | --- |
| 06 | `vaultToken` | `pulumi config set --secret vaultToken root` (Vault dev root token) |
| 06 | `vaultConfigure` | `pulumi config set vaultConfigure true` after the port-forward is up |
| 07 | `alarmEmail` | `pulumi config set alarmEmail <you@example.com>` |
| 07 | `alarmThresholdDays` | `pulumi config set alarmThresholdDays <days>`, default 30 |

## Step by step

### 01 ESC environment and stack

Run `setup.sh` as above. It ends with the commands that prove the end state:

```bash
pulumi env open "${ORG}/pki-workshop/aws-vault" --format json | jq '.environmentVariables | keys'
pulumi config
```

End state: `pulumi env open` returns AWS credentials, and `pulumi config` shows no plaintext secret.

### 02 EKS cluster

`pulumi up` in `02-eks-cluster` creates the cluster with `@pulumi/eks` (2 nodes, public subnets only, so no NAT gateway).

```bash
pulumi stack output kubeconfig --show-secrets > /tmp/pki-kubeconfig.json
export KUBECONFIG=/tmp/pki-kubeconfig.json
kubectl get nodes
```

End state: `kubectl get nodes` shows 2 nodes Ready.

### 03 AWS Private CA

`pulumi up` in `03-private-ca` creates a root CA, its root certificate, a subordinate CA signed by the root, and the CA certificate resources that activate both. `permanentDeletionTimeInDays` is 7.

```bash
aws acm-pca describe-certificate-authority --certificate-authority-arn "$(pulumi stack output rootCaArn)" --query CertificateAuthority.Status
aws acm-pca describe-certificate-authority --certificate-authority-arn "$(pulumi stack output subordinateCaArn)" --query CertificateAuthority.Status
```

End state: both CAs report `ACTIVE`.

### 04 cert-manager and the AWS Private CA issuer

`pulumi up` in `04-cert-manager-pca-issuer` installs cert-manager (chart v1.21.2, CRDs enabled) and aws-privateca-issuer (chart v1.11.0) as Helm releases, binds the issuer service account to an IAM role through IRSA, and declares an `AWSPCAClusterIssuer`.

```bash
kubectl get awspcaclusterissuer
```

End state: the issuer shows Ready=True.

### 05 First certificate

`pulumi up` in `05-first-certificate` declares a Certificate for `demo.internal.example` with `duration: 2h` and `renewBefore: 1h`.

```bash
./verify.sh
```

End state: the Secret `demo-internal-tls` exists and `openssl x509` shows the Private CA as issuer.

### 06 Vault PKI and second issuer

Install Vault first, then configure the PKI mount through the Vault provider over a port-forward.

```bash
pulumi config set --secret vaultToken root
pulumi up                                  # phase 1: Vault dev server (chart 0.34.1)
./port-forward.sh                          # keep running in its own terminal
pulumi config set vaultConfigure true && pulumi up   # phase 2, other terminal: PKI mount, root cert, role, Issuer, Certificate
kubectl get certificate --namespace default
```

End state: `demo-internal` and `demo-vault` are Ready=True, and the two Secrets carry different issuers. Compare them with the `openssl x509 -noout -issuer` pipe used in `05-first-certificate/verify.sh`, run once for `demo-internal-tls` and once for `demo-vault-tls`.

If the port-forward drops, restart `./port-forward.sh` and re-run `pulumi up`.

### 07 Renewal and expiry alerts

`pulumi up` in `07-renewal-and-monitoring` creates an ACM certificate signed by the Private CA, an SNS topic with an email subscription, a CloudWatch alarm on `DaysToExpiry` (namespace `AWS/CertificateManager`), kube-prometheus-stack (chart 92.11.0) and a PrometheusRule on `certmanager_certificate_expiration_timestamp_seconds`. Confirm the SNS subscription from the email AWS sends.

Force a renewal and watch the serial change:

```bash
./renew.sh demo-internal
```

End state: the script prints a `before:` and an `after:` serial that differ, with no redeploy.

`renew.sh` uses `cmctl renew` to mark the Certificate for renewal. This replaces lowering `renewBefore` by hand.

To show the alarm, set `alarmThresholdDays` above the certificate's remaining days and re-run `pulumi up`:

```bash
pulumi config set alarmThresholdDays 400 && pulumi up
aws cloudwatch describe-alarms --query 'MetricAlarms[].[AlarmName,StateValue]'
```

End state: the alarm is created, and with the threshold above the remaining days it enters ALARM during the session. CloudWatch gets `DaysToExpiry` data points only twice a day per certificate, so the alarm cannot be shown by waiting. The state shown in the session is a forced state, and you say so.

### 08 Component used twice

`pulumi up` in `08-pki-component` creates two `PkiCertificate` components: `checkout` through the AWS Private CA issuer and `payments` through the Vault issuer. Each wraps the Certificate and, for `checkout`, the alarm.

```bash
pulumi up
pulumi preview
```

End state: the second `pulumi preview` shows no diff, and a third certificate needs 5 lines of code (see the two calls in `index.ts`).

## Teardown and cost

```bash
ORG=<your-org> scripts/teardown.sh
```

The script destroys steps 08 down to 02 in reverse order. Step 01 (ESC environment and stack) is kept; remove it with `pulumi env rm` and `pulumi stack rm` if you want.

AWS Private CA is the large cost item. The AWS pricing page (https://aws.amazon.com/private-ca/pricing/, read 2026-10-24) lists $400 per CA per month in general-purpose mode and $50 per month in short-lived certificate mode, plus $0.75 per certificate for the first 1,000. It also states that the fee is pro-rated for partial months and stops after deletion. The demo creates two general-purpose CAs, which is $800 per month at the list rate. Prices change, so confirm them on the AWS pricing page before the session. The EKS control plane and two t3.medium nodes add well under $1 for a 3 hour run at list prices; confirm those on the AWS pricing pages too.

A Private CA cannot be deleted at once. It is disabled and scheduled for deletion with a restore window, set to 7 days in step 03, and billed until the window ends. After teardown check that no EKS cluster, load balancer, ACM certificate or SNS topic is left, and that both CAs show `DELETED`:

```bash
aws acm-pca list-certificate-authorities --query 'CertificateAuthorities[].[Arn,Status]'
```

## Known unverified items

Checked: `npm install` with the exact pins, `tsc --noEmit -p .` at the folder root, `shellcheck` on all scripts, and an offline `pulumi preview` of step 03.

Not run live:

- `pulumi preview` for steps 01, 02 and 04 to 08 did not complete offline. Steps 01 and 02 call real AWS at preview time. For steps 04, 05, 06 and 08 the Kubernetes provider hung offline, so the Helm and Certificate manifests were never rendered. Step 07 needs real AWS.
- The ACM PCA `templateArn` strings (`RootCACertificate/V1`, `SubordinateCACertificate_PathLen0/V1`) are not on the Pulumi registry page. Confirm them in a rehearsal.
- Short-lived CA mode is not implemented. Both CAs use general-purpose mode.
- Whether ACM accepts a private CA for this certificate and domain is unconfirmed.
- The `DaysToExpiry` namespace, dimension and twice-daily publishing come from the brief. The AWS metrics page was not read in this build.
- The `cmctl renew` flags, the `kubectl` and `openssl` output, the ServiceMonitor port name `tcp-prometheus-servicemonitor`, the Vault dev root token through `devRootToken`, and the role `maxTtl` value `"7200"` are unverified.
- The cert-manager metrics page does not list `certmanager_certificate_expiration_timestamp_seconds`. Confirm the name at the controller's `/metrics` endpoint.
- The proving commands in steps 02, 03 and 07 and in the teardown check (`pulumi stack output kubeconfig`, `aws acm-pca`, `aws cloudwatch`) were not run.
- No bill from a real run exists yet, and no renewal timings are recorded.

## Layout

```
.
├── .gitignore
├── .shellcheckrc
├── 01-esc-environment
│   ├── Pulumi.yaml
│   ├── environment.yaml
│   ├── index.ts
│   └── setup.sh
├── 02-eks-cluster
│   ├── Pulumi.yaml
│   └── index.ts
├── 03-private-ca
│   ├── Pulumi.yaml
│   └── index.ts
├── 04-cert-manager-pca-issuer
│   ├── Pulumi.yaml
│   └── index.ts
├── 05-first-certificate
│   ├── Pulumi.yaml
│   ├── index.ts
│   └── verify.sh
├── 06-vault-pki
│   ├── Pulumi.yaml
│   ├── index.ts
│   └── port-forward.sh
├── 07-renewal-and-monitoring
│   ├── Pulumi.yaml
│   ├── index.ts
│   └── renew.sh
├── 08-pki-component
│   ├── Pulumi.yaml
│   ├── index.ts
│   └── pki-certificate.ts
├── AGENTS.md
├── README.md
├── package-lock.json
├── package.json
├── scripts
│   └── teardown.sh
└── tsconfig.json
```

## Sources

Read 2026-10-24 unless noted.

- Pulumi registry: aws acmpca CertificateAuthority and Certificate, aws acm Certificate, aws cloudwatch MetricAlarm, kubernetes helm v3 Release, vault Mount and pkiSecret resources, eks Cluster (https://www.pulumi.com/registry/).
- Pulumi ESC aws-login provider: https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/aws-login/
- AWS Private CA pricing: https://aws.amazon.com/private-ca/pricing/
- ACM CloudWatch metrics: https://docs.aws.amazon.com/acm/latest/userguide/cloudwatch-metrics.html (read 2026-10-23)
- cert-manager: https://cert-manager.io/docs/usage/certificate/ and https://cert-manager.io/docs/configuration/vault/
- aws-privateca-issuer: https://github.com/cert-manager/aws-privateca-issuer
- Chart and package versions: npm registry, https://charts.jetstack.io, https://cert-manager.github.io/aws-privateca-issuer, https://helm.releases.hashicorp.com, https://prometheus-community.github.io/helm-charts
