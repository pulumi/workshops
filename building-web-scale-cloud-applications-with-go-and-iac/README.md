# Building Web-Scale Cloud Applications with Go and IaC

## Introduction

In this workshop, you will learn how to build a web-scale cloud application using Go and Infrastructure as Code (IaC).

The workshop consist of 3 parts:

- Deploying an EKS cluster using Go and the new Go Generics support
- Deploying several services to the EKS cluster using Go
- Creating EDA (Event Driven Architecture) based workload, containerized using Docker and deployed to the EKS cluster
  using Go

The EDA based workload will use dapr to implement the EDA pattern and KEDA to scale the workload based on the number of
messages in the queue.

## Prerequisites

- Go 1.20 or higher
- Docker
- AWS account
- Pulumi CLI
- k6 CLI (optional)

## Steps to Success!

### Step 1 - Deploy the AWS base infrastructure

Switch into the `00-aws-infrastructre` directory and run `pulumi up`. This will deploy a no-thrills AWS EKS cluster.

### Step 2 - Deploy the EDA infrastructure

Head over to the `01-eda-infrastructure` directory and run `pulumi up`. This will deploy the infrastructure for the
EDA (SNS, SQS, S3)

### Step 3 - Deploy the dapr and keda services

We will deploy the dapr and keda services to the EKS cluster. Head over to the `02-eks-services` directory and
run `pulumi up`.

### Step 4 - Deploy the EDA workload

Now we are ready to deploy the EDA workload. Head over to the `03-eda-workload` directory and run `pulumi up`.

### Step 5 - Run the load test

Port forward the `checkout` service to your local machine and run this command:

```bash
curl -X POST -H "Content-Type: application/json" \
     -d '{"orderId": "test2" }' \
     http://localhost:3000/neworder
```

To test everything, we will run a load test against the EDA workload. Head over to the `04-load-test` directory and run
`k6 run k6.js]`. This will run a load test against the EDA workload.

## Clean up

To clean up the resources, run `pulumi destroy` in the `00-aws-infrastructre`, `01-eda-infrastructure`,
`02-eks-services` and `03-eda-workload` directories in reverse order.
