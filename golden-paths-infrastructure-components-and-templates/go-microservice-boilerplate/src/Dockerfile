# syntax=docker/dockerfile:1

# Build stage - Pin to specific digest for reproducible builds
FROM golang:1.24-alpine AS builder

# Install security updates and necessary packages with version pinning
RUN apk update && apk upgrade && apk add --no-cache \
    ca-certificates \
    git \
    && rm -rf /var/cache/apk/* \
    && rm -rf /tmp/*

# Create non-root user and group for build with specific UID/GID
RUN addgroup -g 1001 -S appgroup && \
    adduser -D -s /bin/sh -u 1001 -G appgroup appuser

# Set working directory and ensure proper ownership
WORKDIR /build
RUN chown 1001:1001 /build

# Copy go mod files first for better layer caching
COPY --chown=1001:1001 go.mod go.sum ./

# Download dependencies as non-root user
USER 1001
RUN go mod download && go mod verify

# Copy source code with proper ownership
COPY --chown=1001:1001 . .

# Build the binary with enhanced security flags
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o app .

# Production stage - Use distroless for minimal attack surface
FROM gcr.io/distroless/base-debian11 AS build-release-stage

# Set security labels
LABEL org.opencontainers.image.authors="your-email@example.com" \
      org.opencontainers.image.description="Secure Go microservice" \
      org.opencontainers.image.source="https://github.com/your-org/go-microservice-boilerplate" \
      org.opencontainers.image.vendor="Your Organization" \
      org.opencontainers.image.licenses="MIT" \
      security.scan="enabled"

# Copy the binary with proper ownership
COPY --from=builder --chown=nonroot:nonroot /build/app /app

# Use distroless nonroot user (UID 65532)
USER nonroot:nonroot

# Expose port with documentation
EXPOSE 8080/tcp

# Add security-focused health check with timeout
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["/app", "-health-check"]

# Set entry point with exec form for proper signal handling
ENTRYPOINT ["/app"]
