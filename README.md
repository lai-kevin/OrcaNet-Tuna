# OrcaCoin-Tuna: All-In-One Distributed File Share, Crypto, and Proxy Service
# TEAM TUNA

## Description
This project contains an independent distributed file sharing platform, OrcaCoin, and a Proxy Service for secure, anonymous data transfer. Built using libp2p and Electron.


## Features
- Downloading Files by Hash
- Requesting Metadata by Hash
- Pausing/Resuming Downloads
- Start/Stop Providing Files
- Download Time Estimation
- Download Speed
- OrcaCoin Transfer

## Installation and Getting Started

1. Clone the repository:
    ```sh
    git clone https://github.com/lai-kevin/OrcaNet-Tuna.git
    ```

2. Navigate to the fileshare directory:
    ```sh
    cd fileshare
    ```

3. Install dependencies:
    ```sh
    go mod tidy
    ```

4. Build fileshare image:
    ```sh
    docker build -t fileshare:v1 .
    ```
5. Navigate to the project directory:
    ```sh
    cd ..
    ```

6. Build btcd wallet Image:
    ```sh
    docker build -t myapi .
    ```

7. Navigate to the frontend directory:
    ```sh
    cd frontend
    ```

8. Install dependencies:
    ```sh
    npm install
    ```

9. Start the Electron Application:
    ```sh
    npm start
    ```

10. To begin, click on Register and copy the private key. Enter your SBUID when prompted.

11. Using the provided credentials, login! 

## Note:
For the proxy function, sample incoming/outgoing proxy requests are generated. Please wait a few seconds on the page to see the generated data.
