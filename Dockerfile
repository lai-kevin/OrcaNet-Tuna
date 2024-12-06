# Stage 1: Build everything (Go app, btcd, btcwallet, btcctl)
FROM golang:1.23 as builder

# Set the working directory inside the container
WORKDIR /app

# Copy the entire project into the container
COPY . /app

# Set the Go environment variables
ENV GOPATH=/go
ENV GO111MODULE=on

# Install dependencies for btcd and btcwallet if needed (optional)
RUN apt-get update && apt-get install -y \
    make \
    build-essential \
    git \
    curl \
    wget \
    && apt-get clean

# Build btcd using go build (no need for make)
WORKDIR /app/btcd
RUN go build -o btcd

# Build btcctl (same for Go build)
WORKDIR /app/btcd/cmd/btcctl
RUN go build -o btcctl

# Build btcwallet
WORKDIR /app/btcwallet
RUN go mod tidy
RUN go build -o btcwallet

# Build the Go application (server)
WORKDIR /app/server
RUN go mod tidy
RUN go build -o myapi ./main.go

# Stage 2: Create a minimal runtime image
FROM ubuntu:22.04

# Install runtime dependencies (e.g., for running btcwallet and btcd)
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    libssl-dev \
    && apt-get clean

# Create the necessary directories for the binaries and config file
RUN mkdir -p /btcd /app/bin /btcd/cmd/btcctl /root/.btcwallet  # Create the full directory structure

# Set BTCDHOME environment variable to point to the correct directory where btcd.conf is located
ENV BTCDHOME=/btcd

# Copy the built Go binary (myapi), btcd, btcctl, and btcwallet binaries from the builder stage
COPY --from=builder /app/server/myapi /app/bin/myapi
COPY --from=builder /app/btcd/btcd /btcd/btcd  
COPY --from=builder /app/btcd/cmd/btcctl/btcctl /btcd/cmd/btcctl/ 
COPY --from=builder /app/btcwallet/btcwallet /btcwallet/btcwallet

# Copy the btcd.conf and btcwallet.conf into the correct locations
COPY --from=builder /app/btcd/sample-btcd.conf /btcd/sample-btcd.conf  
COPY --from=builder /app/btcwallet/btcwallet.conf /root/.btcwallet/btcwallet.conf

# Expose the port your API will run on
EXPOSE 8080

# Command to run the API when the container starts
CMD ["/app/bin/myapi"]
