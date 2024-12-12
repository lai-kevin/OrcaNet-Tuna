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

5. Start a fileshare container using the image:
    ```sh
    Linux:
    docker run -v ~/Downloads:/downloads -p 8081:1234 fileshare:v1 <SBU_ID> <OPTIONAL: BOOTSTRAP_MULTIADDRESS>

    Windows:
    docker run -v "${env:USERPROFILE}/Downloads:/downloads" -p 8081:1234 fileshare:v1 <SBU_ID> <OPTIONAL: BOOTSTRAP_MULTIADDRESS>

    ```
6. Navigate to the frontend directory:
    ```sh
    cd ..
    cd frontend
    ```

7. Install dependencies:
    ```sh
    npm install
    ```

8. Start the Electron Application:
    ```sh
    npm start
    ```

9. To begin, click on Register and copy the private key. Enter your SBUID when prompted.

10. Using the provided credentials, login! 

## Note:
For the proxy function, sample incoming/outgoing proxy requests are generated. Please wait a few seconds on the page to see the generated data.
