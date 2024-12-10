Team Tuna's README

Instructions for running:

1. After cloning the repository, open IDE (VS Code recommended) and navigate to the frontend folder 
2. Run 'npm install'
3. After successful installation:
    1. Download the Docker desktop application
    2. Ensure it is open and runnning
    2. Navigate back to the project folder
    ```
    cd ..
    ```
    2. Build the docker image:
    ```
    docker build -t myapi .
    ```
    3. Navigate to the fileshare folder:
    ```
    cd fileshare
    ```
    4. Build the docker image:
    ```
    docker build -t fileshare:v1 .
    ```
4. Navigate to the frontend folder
    ```
    cd ..
    ```
5. Run "npm start"
6. The above step should open an Electron app and our OrcaNet interface
7. To begin, click on Register 

To access some of the features as described in the design doc we have provided a few sample hashes that can be pasted into the search bar in the **Files** Tab to preview the workflow for downloading a file.
```
Hash 1: Zxczv123kcbxvh14boadab

Hash 2: Asdasdxc5nksdhbvshba2315jhd
```
You can also add your own files to the uploads and use the hash generated as well.

For the proxy function, sample incoming/outgoing proxy requests are generated. Please wait a few seconds on the page to see the generated data.
