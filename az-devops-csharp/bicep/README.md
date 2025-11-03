# Bicep Deployment

Bicep version of the Dad Joke Function App infrastructure.

## Deploy

```bash
./deploy.sh "my-resource-group-name"
```

## Tear Down

```bash
az group delete --name "my-resource-group-name" --yes --no-wait
```

## Limitations

Bicep isn't a proper programming language, so we lose declarativeness by having to handle complex logic (file uploads, dynamic computations) in shell scripts. This creates platform dependencies and reduces the elegance of infrastructure-as-code.

## Better Alternative: Pulumi

For a fully declarative, programming language-based approach, see the `../infrastructure/` folder for the Pulumi version.

**Migrating from ARM/Bicep to Pulumi?** Check out: https://www.pulumi.com/arm2pulumi/