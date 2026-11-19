# Step 1: stacks and ESC environments

Three stacks, three Pulumi ESC environments (`<org>/kbind-workshop/<stack>`): `provider-dev`, `consumer-a-dev`, `consumer-b-dev`. Each environment logs in to AWS with OIDC and sets `aws:region` to `eu-central-1`. The consumer environments also read the provider stack's `backendUrl` output through the `pulumi-stacks` provider and pass it to the stack as `providerUrl`.

## Commands

```bash
01-stacks-and-esc/preflight.sh
export KBIND_AWS_ROLE_ARN=<role arn trusted for Pulumi OIDC>
01-stacks-and-esc/setup.sh
```

`setup.sh` runs, per stack: `pulumi stack init`, `pulumi env init`, `pulumi env edit --file`, `pulumi config env add`. The last one shows a diff and asks for confirmation; the script does not pass `--yes`.

## Proof (typed by hand, not scripted)

```bash
pulumi config --stack <org>/provider-dev --cwd 02-provider
pulumi env get <org>/kbind-workshop/provider-dev
```

Expect `aws:region` `eu-central-1` in the config and the OIDC login in the environment definition. Not run here.
