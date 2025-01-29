# migrating-from-terraform

## Quick Demo: Secrets Handling in TF vs. Pulumi

This quick demo illustrates the differences in handling sensitive values between Pulumi and Terraform:

1. Run the Terraform config that creates an AWS Secrets Manager secret:

    ```bash
    cd terraform-aws-secret
    terraform init && terraform apply --auto-approve
    ```

1. Open `terraform.tfstate` and note that the value for `secret_string` is in plaintext in the TF state file.

    Also, Terraform does not have an out-of-the-box solution for handling secrets in config files - it requires using TF Cloud or TF Enterprise.

1. Now, run the comparable Pulumi program, starting with setting a secret in the stack config file:

    ```bash
    cd ../pulumi-aws-secret
    pulumi config set mySecretValue password123 --secret
    ```

    Show the contents of `Pulumi.dev.yaml`: The value is stored only as ciphertext.

1. Run the Pulumi program and dump the stack file:

    ```bash
    pulumi stack output > pulumi-stack.json
    ```

    Note again that the value of the secret is only stored in ciphertext in the Pulumi state file.

## Demo: Coexist with Terraform by consuming Terraform state file outputs

1. Deploy the Terraform config that contains a VPC:

    ```bash
    cd terraform-vpc
    terraform init && terraform apply -auto-approve
    ```

1. Create a new Pulumi program:

    ```bash
    pulumi new typescript -y --dir pulumi-tf-outputs # or pulumi new python -y
    ```

1. Install the Pulumi Terraform Provider and the Pulumi AWS Provider:

    ```bash
    cd pulumi-tf-outputs
    npm i @pulumi/terraform @pulumi/aws
    ```

1. In your Pulumi program, use the `terraform.state.RemoteStateReference` resource to reference the TF state file on disk, read the value of the `vpc_id` (a string) and `private_subnet_ids` (an array of strings) outputs, and store them in local variables.

1. Using the outputs from the previous step, provision an EC2 workload in one of the private subnets. Use the `vpc_id` output to create a security group and the `private_subnet_ids` output to place the EC2 instance. (Simple examples of workloads would be a t3.micro instance running NGINX, or a t3.micro running SSM Systems Manager.)

Hint: Ensure the US region used in the Pulumi Stack matches that of the VPC.

1. Finally, delete the stack with the imported resources:

    ```bash
    pulumi stack rm dev --force
    ```

## Demo: Replace Terraform via `pulumi convert` and `pulumi import`

In this exercise, you will take a Terraform program containing a VPC and convert it to Pulumi code in the language of your choice:

1. Ensure you have the latest version of the Pulumi Terraform converter:

    ```bash
    pulumi plugin install converter terraform
    ```

1. Ensure you have the latest version of Terraform:

    ```bash
    brew tap hashicorp/tap
    brew install hashicorp/tap/terraform
    ```

1. Deploy the Terraform config:

    ```bash
    cd terraform && terraform init && terraform apply -auto-approve
    # Wait for the resource creation
    ```

1. Convert the Terraform code to Pulumi

    ```bash
    pulumi convert --from terraform --out ../pulumi-convert-tf --language typescript
    ```

    This command will generate code, but the resources will not yet be under Pulumi management because they have not been imported to your Pulumi state.

1. Import the resources from your TF state file into your Pulumi state file:

    ```bash
    cd ../pulumi-convert-tf-ts # or cd ../pulumi-convert-tf-py
    pulumi stack init dev
    pulumi import --from terraform ../terraform-vpc/terraform.tfstate --protect=false --generate-code=false # Because we already have the code
    ```

1. Check to see whether there any additional massaging is necessary.

    Run the following command to see whether there is any drift between your Pulumi state file and your resources as declared in your Pulumi program:

    ```bash
    pulumi preview --diff
    ```

    Once all drift is resolved, you'll see output like the following:

    ```text
    Resources:
        29 unchanged
    ```

At this point, your resources are under Pulumi control and in a production scenario the Terraform state file should be archived to avoid any confusion as to the source of truth for your the state of your resources.
