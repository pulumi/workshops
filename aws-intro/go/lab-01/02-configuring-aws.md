# Configuring AWS

Now that you have a basic project, let's configure AWS support for it.

## Step 1 &mdash; Install the AWS Package

We can edit the contents of our Gopkg.toml file to install the AWS Package. Add the following:

```toml
[[constraint]]
  name = "github.com/pulumi/pulumi-aws"
  version = "1.27.0"
```

## Step 2 &mdash; Import the AWS Package

Now that the AWS package is installed, add the following line to our imports in `main.go` to import it:

```go
github.com/pulumi/pulumi-aws/sdk/go/aws/s3
```


> :white_check_mark: After this change, your `main.go` should [look like this](code/02-configuring-aws/step2.go).

## Step 3 &mdash; Configure an AWS Region

Configure the AWS region you would like to deploy to:

```bash
pulumi config set aws:region us-east-1
```

> If you are doing an interactive lab, please use the recommended region. This will ensure AWS limits are not exceeded during the labs.

Feel free to choose any AWS region that supports the services used in these labs ([see this table](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-available-regions) for a list of available regions).

## (Optional) Step 4 &mdash; Configure an AWS Profile

If you're using an alternative AWS profile, you can tell Pulumi which to use in one of two ways:

* Using an environment variable: `export AWS_PROFILE=<profile name>`
* Using configuration: `pulumi config set aws:profile <profile name>`

## Next Steps

* [Provisioning a S3 Bucket](./03-provisioning-infrastructure.md)
