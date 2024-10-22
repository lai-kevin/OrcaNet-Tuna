package main

import(
	"fmt" //Used for format I/O: printing to console or formatting strings
	"net/http" //Provides HTTP client and server: create HTTP servers and handle HTTP requests and responses 
	"log" //Logs messages, errors, etc. to console
	"github.com/lai-kevin/OrcaNet-Tuna/server/manager"
	"github.com/lai-kevin/OrcaNet-Tuna/server/handlers"

)

func main() {
	http.HandleFunc("/", handlers.GetRoot)
    http.HandleFunc("/startOrcaNet", handlers.StartOrcaNetHandler)
    http.HandleFunc("/stopOrcaNet", handlers.StopOrcaNetHandler)
    http.HandleFunc("/getBlockchainInfo", handlers.GetBlockchainInfo)
    http.HandleFunc("/getNewAddress", handlers.GetNewAddress)
    http.HandleFunc("/getBalance", handlers.GetBalance)
    http.HandleFunc("/mine", handlers.Mine)
    http.HandleFunc("/sendToAddress", handlers.SendToAddress)

    fmt.Println("Starting OrcaNet API server on port 8080...")
    if err := http.ListenAndServe(":8080", nil); err != nil {
        log.Fatalf("Failed to start server: %v", err)
    }

}
