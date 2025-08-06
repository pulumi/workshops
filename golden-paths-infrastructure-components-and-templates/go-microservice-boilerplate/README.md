# Go Microservice Golden Path

A **golden path** template that gets your Go microservice from code to production on AWS in minutes, not weeks.

## What You Get

This golden path provides everything your development team needs to deploy production-ready Go microservices:

✅ **Production-ready Go microservice** with Echo framework and OpenTelemetry tracing  
✅ **AWS infrastructure that scales** - ECS with auto-scaling from 1-4 instances  
✅ **Security by default** - Hardened containers, IAM roles, security groups  
✅ **Monitoring built-in** - Health checks, load balancer monitoring, CloudWatch alarms  
✅ **One-command deployment** - `pulumi up` handles everything  
✅ **No AWS expertise required** - Complex ECS setup abstracted away  

## For Development Teams: What to Expect

### Your Experience

**Day 1: Getting Started**
- Clone this repo, run `pulumi up`
- Your service is live on AWS in 5-10 minutes
- Public URL provided automatically - no manual setup needed

**Day 2-N: Development Workflow**
- Write your Go code in `microservice/main.go`
- Test locally with `go run main.go`
- Deploy changes with `pulumi up`
- AWS automatically rebuilds and redeploys your container

**Production Operations**
- Service automatically scales with CPU load (80% up, 10% down)
- Health checks ensure unhealthy containers are replaced
- Load balancer distributes traffic across healthy instances
- Distributed tracing helps debug issues across services

### What's Handled For You

You **don't** need to learn or configure:
- ECS clusters, services, and task definitions
- Application Load Balancers and target groups
- Auto-scaling policies and CloudWatch alarms
- Security groups and IAM roles
- Container registries and image building
- Health check configuration

You **do** focus on:
- Writing your Go application logic
- Adding your business endpoints
- Testing your service locally
- Deploying with confidence

## Quick Start (5 minutes)

1. **Clone and customize:**
   ```bash
   git clone <this-repo>
   cd go-microservice-boilerplate
   ```

2. **Deploy to AWS:**
   ```bash
   pulumi up
   # ✅ Creates your ECS cluster
   # ✅ Builds and pushes your container
   # ✅ Sets up load balancer and scaling
   # ✅ Provides public URL
   ```

3. **Test your service:**
   ```bash
   # Get your service URL
   export SERVICE_URL=$(pulumi stack output publicUrl)
   
   # Test the echo endpoint
   curl "$SERVICE_URL/echo?message=Hello%20World"
   # Returns: {"echo":"Hello World","service":"go-microservice-boilerplate","timestamp":"2024-01-15T10:30:00Z"}
   
   # Check health
   curl "$SERVICE_URL/health"
   # Returns: {"status":"healthy","service":"go-microservice-boilerplate"}
   ```

## Your Application Code

The golden path includes a starter Go microservice you can customize:

**File: `microservice/main.go`**
```go
// Your service starts here - customize these endpoints
func echoHandler(c echo.Context) error {
    message := c.QueryParam("message")
    if message == "" {
        message = "Hello from Go microservice!"
    }
    
    return c.JSON(http.StatusOK, map[string]string{
        "echo":      message,
        "service":   "go-microservice-boilerplate", // ← Change this
        "timestamp": time.Now().UTC().Format(time.RFC3339),
    })
}

// Add your business logic endpoints here
func main() {
    // ... OpenTelemetry setup handled for you
    e := echo.New()
    
    // Add your routes here
    e.GET("/echo", echoHandler)
    e.GET("/health", healthHandler)
    
    // ← Add your endpoints: e.GET("/api/users", getUsersHandler)
}
```

## Development Workflow

### Local Development
```bash
cd microservice/

# Install dependencies
go mod tidy

# Run locally (port 8080)
go run main.go

# Test your changes
curl "http://localhost:8080/echo?message=testing"

# Add new dependencies
go get github.com/your/package
```

### Deploy Changes
```bash
# From project root
pulumi up
# ✅ Rebuilds container with your changes
# ✅ Redeploys to ECS automatically
# ✅ Zero-downtime rolling deployment
```

### View Your Service
```bash
# Get service details
pulumi stack output publicUrl    # Your public URL
pulumi stack output --json       # All outputs

# Monitor in AWS Console
aws ecs list-services --cluster $(pulumi stack output clusterName)
```

## What's Under the Hood (You Don't Need to Know This)

The golden path uses a **Pulumi component** that creates:

**AWS Infrastructure:**
- ECS Fargate cluster for container orchestration
- Application Load Balancer for traffic distribution
- ECR repository for your container images
- Auto-scaling policies (scale at 80% CPU, down at 10%)
- CloudWatch alarms for monitoring
- Security groups with minimal required access
- IAM roles with least-privilege permissions

**The Component Approach:**
```yaml
# This one resource creates ~15 AWS resources for you
resources:
  microserviceComponent:
    type: component-microservice:MicroserviceComponent
    properties:
      appPath: ./microservice
      port: 8080
      containerName: go-microservice-boilerplate
```

**Why This Matters:**
- **Consistency** - Every team gets the same battle-tested setup
- **Best Practices** - Security, scaling, and monitoring built-in
- **Maintenance** - Platform team can upgrade the component, you get improvements
- **Simplicity** - You see 1 resource, not 15 complex AWS resources

## Customizing Your Service

### Change Service Name
```bash
# Update your service identifier
pulumi config set containerName my-awesome-api

# Redeploy
pulumi up
```

### Add Environment Variables
Modify `Pulumi.yaml` to add environment variables:
```yaml
resources:
  microserviceComponent:
    type: component-microservice:MicroserviceComponent
    properties:
      appPath: ./microservice
      port: 8080
      containerName: my-service
      # Add environment variables (check component docs)
```

### Scale Configuration
```bash
# Change scaling limits (requires updating Pulumi.yaml)
# Modify ecsTarget minCapacity/maxCapacity values
pulumi up
```

## Common Development Patterns

### Adding Database Connections
```go
// In your main.go, add database setup
import (
    "database/sql"
    _ "github.com/lib/pq" // PostgreSQL driver
)

func main() {
    // Add database connection
    db, err := sql.Open("postgres", os.Getenv("DATABASE_URL"))
    // ... use db in your handlers
}
```

### Adding New Endpoints
```go
// Add business logic endpoints
e.GET("/api/users", getUsersHandler)
e.POST("/api/users", createUserHandler)
e.GET("/api/users/:id", getUserHandler)

func getUsersHandler(c echo.Context) error {
    // Your business logic here
    users := []User{} // Fetch from database
    return c.JSON(http.StatusOK, users)
}
```

### Environment Configuration
```bash
# Set environment variables for your service
export DATABASE_URL="postgres://..."
export REDIS_URL="redis://..."

# These will be available in your Go application
```

## Monitoring Your Service

### Built-in Observability
- **Health Checks**: `/health` endpoint monitored by load balancer
- **Auto-scaling**: CPU-based scaling happens automatically
- **Request Logging**: All HTTP requests logged via Echo middleware
- **Distributed Tracing**: OpenTelemetry traces available (configure endpoint)

### AWS Console Monitoring
- **ECS Console**: View service health, task count, deployments
- **CloudWatch**: CPU metrics, scaling events, application logs
- **Load Balancer**: Request rates, response times, health check status

### Distributed Tracing Setup
```bash
# Configure OpenTelemetry endpoint
export OTEL_EXPORTER_OTLP_ENDPOINT="http://jaeger:4318/v1/traces"
export OTEL_SERVICE_NAME="my-awesome-api"

# Traces automatically exported from all HTTP requests
```

## FAQ for Development Teams

**Q: Do I need to learn AWS ECS?**  
A: No. The golden path abstracts away ECS complexity. Focus on your Go code.

**Q: How do I add a database?**  
A: Add database resources to `Pulumi.yaml` and connection code to your Go app. The platform team can provide database golden paths too.

**Q: What if I need different scaling?**  
A: Modify the `ecsTarget` configuration in `Pulumi.yaml`. The component handles the underlying auto-scaling setup.

**Q: How do I debug production issues?**  
A: Use the built-in health checks, CloudWatch logs, and configure distributed tracing. Your service includes request logging.

**Q: Can I use this for non-HTTP services?**  
A: This golden path is optimized for HTTP APIs. For background workers or other patterns, ask your platform team for additional golden paths.

**Q: How do I handle secrets?**  
A: Use AWS Systems Manager Parameter Store or Secrets Manager. Add secret references to your component configuration.

## Support

**Getting Help:**
- **Platform Team**: Your first point of contact for golden path issues
- **Component Issues**: https://github.com/dirien/component-microservice
- **Pulumi Docs**: https://www.pulumi.com/docs/
- **Go + Echo Docs**: https://echo.labstack.com/

**Common Issues:**
- **Deployment fails**: Check AWS credentials and permissions
- **Service unhealthy**: Verify your `/health` endpoint returns 200 OK
- **Can't reach service**: Check security group configuration in AWS Console

## Next Steps

1. **Customize** the starter service with your business logic
2. **Add endpoints** for your API requirements  
3. **Connect databases** or external services as needed
4. **Configure monitoring** with your preferred observability tools
5. **Set up CI/CD** to automate deployments from your git repository

Your platform team may provide additional golden paths for databases, message queues, and CI/CD pipelines to complement this microservice foundation.