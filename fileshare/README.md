# Bitshare: Distributed File Sharing Package

## Description
The purpose of this utility/package is to handle the distributed file sharing between OrcaNet nodes. Bitshare is intended to provide an easy way to securely share files between nodes. This utility is built using the go-libp2p package for node creation, DHT, and p2p communication. The DHT is used for mapping file hashes to peerID’s of nodes providing a file. Connected nodes will be able to send and receive files from other nodes. Nodes providing a file can earn OrcaCoin and nodes downloading files pay for files they want to download. Files are downloaded by looking up the file’s hash in the DHT, connecting to its associated node using peerID, then downloading via libp2p streams. To enable support for nodes running behind firewalls and NATs, a relay server is used to communicate with other nodes. All code in this package is written in go since go-libp2p is one of the most developed implementations of the libp2p specifications.


## Features
- Downloading Files by Hash
- Requesting Metadata by Hash
- Pausing/Resuming Downloads
- Queing Downloads by Priority
- Download Time Estimation
- Obtaining Network Statistics of Providers of a File

## Installation
1. Clone the repository:
    ```sh
    git clone https://github.com/lai-kevin/OrcaNet-Tuna.git
    ```
2. Navigate to the project directory:
    ```sh
    cd fileshare
    ```
3. Install dependencies:
    ```sh
    go mod tidy
    ```

## Usage
1. Start the application:
    ```sh
    go run . <SBU_ID>
    ```
2. Make requests to `http://localhost:1234/rpc`. See more in the postman doc.