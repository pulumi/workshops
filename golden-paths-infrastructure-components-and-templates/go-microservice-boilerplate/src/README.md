# ${PROJECT}

A simple Go microservice built with the Echo framework and OpenTelemetry instrumentation. This service provides a basic echo endpoint and is designed to be used as boilerplate code for future microservice development.

## Features

- **Echo Framework**: Fast and minimalist Go web framework
- **OpenTelemetry**: Distributed tracing with OTLP HTTP exporter
- **Health Check**: Basic health endpoint for monitoring
- **Graceful Shutdown**: Proper shutdown handling
- **CORS Support**: Cross-origin resource sharing enabled
- **Request Logging**: Built-in request/response logging

## API Endpoints

### Echo Endpoint
- **URL**: `GET /echo`
- **Query Parameters**:
  - `message` (optional): String to echo back
- **Response**: JSON object with echoed message, service name, and timestamp
- **Example**: 
  ```bash
  curl "http://localhost:8080/echo?message=Hello%20World"
  ```
  ```json
  {
    "echo": "Hello World",
    "service": "${PROJECT}",
    "timestamp": "2023-12-01T10:30:00Z"
  }
  ```

### Health Check
- **URL**: `GET /health`
- **Response**: JSON object with service status
- **Example**:
  ```bash
  curl "http://localhost:8080/health"
  ```
  ```json
  {
    "status": "healthy",
    "service": "${PROJECT}"
  }
  ```

## OpenTelemetry Configuration

The service is configured with OpenTelemetry tracing:
- **Service Name**: `${PROJECT}`
- **Service Version**: `1.0.0`
- **Exporter**: OTLP HTTP (default endpoint: `http://localhost:4318/v1/traces`)
- **Sampling**: Always sample (100% of traces)

### Environment Variables

You can configure the OpenTelemetry exporter using standard environment variables:
- `OTEL_EXPORTER_OTLP_ENDPOINT`: OTLP endpoint URL
- `OTEL_EXPORTER_OTLP_HEADERS`: Additional headers for authentication
- `OTEL_SERVICE_NAME`: Override service name
- `OTEL_SERVICE_VERSION`: Override service version

## Running the Service

### Prerequisites
- Go 1.23 or later
- Docker (optional, for containerized deployment)

### Local Development
1. Clone the repository
2. Install dependencies:
   ```bash
   go mod tidy
   ```
3. Run the service:
   ```bash
   go run main.go
   ```
4. The service will start on port 8080

### Docker Deployment

The service includes a production-ready Dockerfile with security best practices:

#### Building the Docker Image
```bash
# Build the image
docker build -t ${PROJECT}:latest .

# Build with specific tag
docker build -t ${PROJECT}:v1.0.0 .
```

#### Running with Docker
```bash
# Run the container
docker run -p 8080:8080 ${PROJECT}:latest

# Run with OpenTelemetry configuration
docker run -p 8080:8080 \
  -e OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4318/v1/traces \
  ${PROJECT}:latest

# Run with custom service name
docker run -p 8080:8080 \
  -e OTEL_SERVICE_NAME=my-service \
  -e OTEL_SERVICE_VERSION=1.0.0 \
  ${PROJECT}:latest
```

#### Docker Security Features
- **Distroless Runtime**: Uses Google's distroless image for minimal attack surface
- **Non-root User**: Runs as non-root user (UID 65532)
- **Pinned Base Images**: Uses SHA256 digests for reproducible builds
- **Multi-stage Build**: Separates build and runtime environments
- **Security Hardening**: Compiled with PIE (Position Independent Executable) and other security flags

#### Health Check
The container includes a built-in health check that runs every 30 seconds:
```bash
# Check container health
docker ps
# Look for "healthy" status in the STATUS column
```

## Testing with OpenTelemetry

To see the traces in action, you can use Jaeger or any OTLP-compatible backend:

1. **Jaeger (Docker)**:
   ```bash
   docker run -d --name jaeger \
     -p 16686:16686 \
     -p 14268:14268 \
     -p 4317:4317 \
     -p 4318:4318 \
     jaegertracing/all-in-one:latest
   ```

2. **Using Docker Compose** (create a `docker-compose.yml`):
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "8080:8080"
       environment:
         - OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4318/v1/traces
         - OTEL_SERVICE_NAME=${PROJECT}
       depends_on:
         - jaeger
     
     jaeger:
       image: jaegertracing/all-in-one:latest
       ports:
         - "16686:16686"
         - "4317:4317"
         - "4318:4318"
   ```
   
   Run with: `docker-compose up --build`

3. **Make requests** to generate traces:
   ```bash
   curl "http://localhost:8080/echo?message=trace-test"
   ```

4. **View traces** at `http://localhost:16686`

## Development Notes

This boilerplate includes:
- Structured logging with Echo's built-in logger
- Automatic OpenTelemetry instrumentation for HTTP requests
- Graceful shutdown handling with 10-second timeout
- CORS middleware for cross-origin requests
- Recovery middleware for panic handling

## Extending the Service

To add new endpoints:
1. Create handler functions following the `echo.HandlerFunc` signature
2. Register routes in the `main()` function
3. Add appropriate OpenTelemetry spans if needed for custom tracing

Example:
```go
func newEndpointHandler(c echo.Context) error {
    // Your logic here
    return c.JSON(http.StatusOK, map[string]string{"message": "success"})
}

// In main():
e.GET("/new-endpoint", newEndpointHandler)
```
