# Benchmark infrastructure

This program creates the temporary infrastructure that the timing benchmarks use, and schedules its own destruction. Each `pulumi up` sets a [TTL schedule](https://www.pulumi.com/docs/deployments/concepts/ttl/) `ttlHours` from the time of the update, so a later update extends the deadline. When the schedule fires, Pulumi Deployments runs `pulumi destroy` from this directory on the configured branch and then deletes the stack.

It creates:

- An S3 bucket for release bundles, timing exports, and host logs, with public access blocked.
- A private Amazon ECR repository for prepared executor images, and an Amazon ECR Public repository for the bundle tools image.
- A Pulumi Cloud runner pool for the customer-managed Kubernetes runner, with its token stored in an SSM SecureString parameter.
- An IAM role and instance profile for the EC2 hosts, allowing access to the bucket, the ECR repository, the token parameter, and Systems Manager.
- Optionally, the Kubernetes runner host, which runs [host-setup.sh](../kubernetes-runner/host-setup.sh) as user data.
- Optionally, the release build host, which runs [ec2-user-data.sh](../release/ec2-user-data.sh) and terminates itself when the builds finish. Run `pulumi refresh` afterward to remove it from the stack state.
- The stack's own deployment settings and its TTL schedule.

## Configuration

| Key | Default | Description |
| --- | --- | --- |
| `runId` | `deployment-timings-20261104` | Prefix for resource names. The benchmark scripts expect the default. |
| `ttlHours` | `8` | Hours from each update until the stack is destroyed. |
| `kubernetesHost` | `false` | Create the Kubernetes runner host. |
| `buildHost` | `false` | Create the one-shot release build host. |
| `instanceType` | `m7i.xlarge` | Instance type for both hosts. |
| `sourceBranch` | `workshop/faster-pulumi-deployments` | Branch that the TTL destroy deployment runs from. |

[Pulumi.benchmark.yaml](Pulumi.benchmark.yaml) imports AWS credentials from the `aws/pulumi-ce` ESC environment. The TTL destroy runs from the committed copy of that file, so commit configuration changes to the source branch, or the destroy uses the old values.

## Use

```bash
npm install
pulumi stack init <org>/benchmark
pulumi up
```

To start the Kubernetes runner as well, set `pulumi config set kubernetesHost true` and run `pulumi up` again. The host reports readiness by writing `k8s/ready` to the bucket. To tear everything down before the TTL fires, run `pulumi destroy`.
