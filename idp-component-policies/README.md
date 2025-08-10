# IDP Component Policies

This project demonstrates how to create an IDP (Internal Developer Platform) component using Pulumi with the Go Microservice Boilerplate template.

## Step-by-Step Instructions

Follow these steps to recreate this project:

### 1. Initialize Pulumi Project

Navigate to the solution folder and create a new Pulumi project using the Go Microservice Boilerplate template:

```bash
cd solution
pulumi new ./../../golden-paths-infrastructure-components-and-templates/go-microservice-boilerplate \
  --name "idp-component-policies" \
  --description "IDP Component Policies project using Go Microservice Boilerplate template" \
  --yes
```

### 2. Configure Local Backend (if needed)

If you encounter organization-related errors, switch to local backend:

```bash
pulumi login --local
```

### 3. Initialize Stack

Create a development stack:

```bash
pulumi stack init dev
```

## Project Structure

```
idp-component-policies/
├── README.md          # This file with step-by-step instructions
└── solution/          # Generated Pulumi project
    ├── Pulumi.yaml     # Pulumi project configuration
    ├── README.md       # Template-specific documentation
    └── src/           # Go application source code
        ├── Dockerfile
        ├── go.mod
        ├── go.sum
        ├── main.go
        └── README.md
```

### 4. Deploy the Infrastructure

Deploy the microservice to AWS:

```bash
pulumi up
```

### 5. Verify Deployment

After deployment, get the public URL and test the endpoints:

```bash
# Test health endpoint
curl "$(pulumi stack output publicUrl)/health"
# Expected: {"service":"idp-component-policies","status":"healthy"}

# Test echo endpoint with default message
curl "$(pulumi stack output publicUrl)/echo"
# Expected: {"echo":"Hello from Go microservice!","service":"idp-component-policies","timestamp":"2025-08-07T12:17:58Z"}

# Test echo endpoint with custom message
curl "$(pulumi stack output publicUrl)/echo?message=IDP%20Component%20Working!"
# Expected: {"echo":"IDP Component Working!","service":"idp-component-policies","timestamp":"2025-08-07T12:17:58Z"}
```

## Available Endpoints

The deployed Go microservice exposes the following endpoints:

- **`GET /health`** - Health check endpoint
  - Returns service status and name
- **`GET /echo?message=<text>`** - Echo service
  - Returns the message parameter (or default message)
  - Includes service name and timestamp
  - Supports OpenTelemetry tracing

## Infrastructure Components

The Pulumi component creates the following AWS resources:

- **ECR Repository** - Container image storage
- **ECS Cluster** - Container orchestration
- **ECS Service** - Running container instances (2 replicas)
- **Application Load Balancer** - Traffic distribution
- **Security Groups** - Network access control
- **IAM Roles** - Service permissions
- **CloudWatch Log Group** - Container logging

## Cleanup

To destroy the infrastructure:

```bash
pulumi destroy
```