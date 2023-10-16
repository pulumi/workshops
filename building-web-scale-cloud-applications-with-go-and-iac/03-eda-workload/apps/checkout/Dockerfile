# First stage: Build the application
FROM golang:1.21 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy go mod and sum files to download dependencies
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code into the container
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Second stage: Run the application
FROM scratch

# Set the working directory
WORKDIR /app/

# Copy the binary from the first stage
COPY --from=builder /app/main .

# Expose port for the application (optional, if your app serves HTTP for example)
EXPOSE 3000

# Command to run the application
CMD ["./main"]
