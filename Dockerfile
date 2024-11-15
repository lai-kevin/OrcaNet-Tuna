# Stage 1: Build the Go code and dependencies for both the project and the binaries
FROM golang:1.20-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk update && apk add --no-cache \
    curl \
    git \
    build-base \
    bash \
    && rm -rf /var/cache/apk/*

# Copy go.mod and go.sum to fetch dependencies first
COPY go.mod go.sum ./


# Copy all project files
COPY . .

# Run go mod vendor to fetch dependencies
RUN go mod vendor

# Build btcd binary
WORKDIR /app/btcd
RUN go build -o /app/btcd/btcd

# Build btcwallet binary
WORKDIR /app/btcwallet
RUN go build -v -o /app/btcwallet/btcwallet

# Build btcctl binary (from btcd/cmd/btcctl)
WORKDIR /app/btcd/cmd/btcctl
RUN go build -o /app/btcd/cmd/btcctl/btcctl

# Build the main application (orcanet-tuna)
WORKDIR /app/server
RUN go build -o /app/orcanet-tuna ./main.go

# Stage 2: Create a smaller runtime image using Alpine
FROM alpine:latest

WORKDIR /app

# Copy the binaries from the build stage
COPY --from=builder /app/orcanet-tuna /usr/local/bin/orcanet-tuna
COPY --from=builder /app/btcd/btcd /usr/local/bin/btcd
COPY --from=builder /app/btcwallet/btcwallet /usr/local/bin/btcwallet
COPY --from=builder /app/btcd/cmd/btcctl/btcctl /usr/local/bin/btcctl

# Expose the port for the application
EXPOSE 8080

# Run the application by default
CMD ["orcanet-tuna"]
