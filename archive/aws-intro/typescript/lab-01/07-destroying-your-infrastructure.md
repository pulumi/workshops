# Destroying Your Infrastructure

The final step is to destroy all of the resources from the two stacks created.

## Step 1 &mdash;  Destroy Resources

First, destroy the resources in your current stack:

```bash
pulumi destroy
```

This will show you a preview, much like the `pulumi up` command does:

```
Previewing destroy (prod):

     Type                    Name               Plan
 -   pulumi:pulumi:Stack     iac-workshop-prod  delete
 -   ├─ aws:s3:BucketObject  index.html         delete
 -   └─ aws:s3:Bucket        my-bucket          delete

Outputs:
  - bucketEndpoint: "http://my-bucket-c7318c1.s3-website-eu-west-1.amazonaws.com"
  - bucketName    : "my-bucket-c7318c1"

Resources:
    - 3 to delete

Do you want to perform this destroy?
  yes
> no
  details
```

To proceed, select `yes`.

```
Destroying (prod):

     Type                    Name               Status
 -   pulumi:pulumi:Stack     iac-workshop-prod  deleted
 -   ├─ aws:s3:BucketObject  index.html         deleted
 -   └─ aws:s3:Bucket        my-bucket          deleted

Outputs:
  - bucketEndpoint: "http://my-bucket-c7318c1.s3-website-eu-west-1.amazonaws.com"
  - bucketName    : "my-bucket-c7318c1"

Resources:
    - 3 deleted

Duration: 6s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/prod/updates/2
The resources in the stack have been deleted, but the history and configuration
associated with the stack are still maintained. If you want to remove the stack
completely, run 'pulumi stack rm prod'.
```

## Step 2 &mdash;  Remove the Stack

The AWS resources for this stack have been destroyed. Per the message printed at the end, however, the stack itself, however, is still known to Pulumi. This means all past history is still available and you can perform subsequent updates on this stack.

Now, fully remove the stack and all history:

```bash
pulumi stack rm
```

This is irreversible and so asks to confirm that this is your intent:

```
This will permanently remove the 'prod' stack!
Please confirm that this is what you'd like to do by typing ("prod"):
```

Type the name of the stack and hit enter. The stack is now gone.

## Step 3 &mdash;  Select Another Stack, Rinse and Repeat

After destroying `prod`, you still have the `dev` stack. To destroy it too, first select it:

```
pulumi stack select dev
```

Now, go back and repeat steps 1 and 2.

## Step 4 &mdash;  Verify That Stacks are Gone

Verify that all of this projec'ts stacks are now gone:

```bash
pulumi stack ls
```

## Next Steps

Congratulations! :tada: You have completed the first lab.

Now that you're more familiar with infrastructure as code concepts, and how the tool works, you can feel free to explore the more advanced collection of labs. These labs will teach you how to provision and scale virtual machines, containers (including Kubernetes), and serverless workloads. Feel free to do them sequentially, or choose what's most interesting to you &mdash; this first lab will have given you all of the foundational understanding you need to succeed at any of them.

1. [Provisioning EC2 Virtual Machines](../02-app-arch/01-provisioning-vms.md)
2. [Deploying Containers to Elastic Container Service (ECS) "Fargate"](../02-app-arch/02-containers-on-ecs.md)
3. [Deploying Containers to a Kubernetes Cluster](../02-app-arch/03-containers-on-kubernetes.md)
4. [Using AWS Lambda for Serverless Application Patterns](../02-app-arch/04-lambda-serverless.md)
