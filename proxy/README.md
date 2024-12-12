
Proxy Functionalities
The proxy functionalities work in the backend. Follow the instructions below to navigate through its features and operations.

Features:
Node Advertisements: Nodes advertise themselves as proxies on the DHT.
HTTP/HTTPS Support: Proxies can handle HTTP and HTTPS requests.
Request Logging: An endpoint is available to document proxy request data.
Running Proxy Nodes
Proxy nodes run on:
127.0.0.1:8085
127.0.0.1:8084
Steps:
Navigate to the proxy directory:
bash
Copy code
cd path/to/proxy
Start the proxy nodes:
bash
Copy code
go run .
Two proxy nodes (8085 and 8084) will start and be ready to handle requests.
Testing the Proxy Nodes
Testing HTTP Requests
Open a terminal.
Use curl to make HTTP requests via the proxies:
bash
Copy code
curl --proxy 127.0.0.1:8085 -I http://www.example.com/
curl --proxy 127.0.0.1:8084 -I http://www.google.com/
Testing HTTPS Requests
Open a terminal.
Use curl to make HTTPS requests via the proxies:
bash
Copy code
curl --proxy 127.0.0.1:8085 -I https://www.example.com/
curl --proxy 127.0.0.1:8084 -I https://www.google.com/
Viewing Request Logs
Open a browser and navigate to:
http://localhost:8085/logs
http://localhost:8084/logs
Click on the Pretty-print button to view details:
URL of the request.
Bytes transferred from client to server.
Bytes transferred from server to client.
Configuring Your Device to Use the Proxy
Open your device's settings.
Set the following:
IP Address: 127.0.0.1
Port: Either 8085 or 8084
Open your browser and visit a website, such as:
https://google.com
