package main

import (
	"fmt"
	"net/http"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/lai-kevin/OrcaNet-Tuna/server/handlers"
	"github.com/lai-kevin/OrcaNet-Tuna/server/manager"
)

// Used for GetBestBlockInfo

// type Block struct {
//     Hash   string `json:"hash"`
//     Height int    `json:"height"`
// }

func main() {
	// Initialize the application and check for errors
	if err := manager.Initialize(); err != nil {
		log.Fatalf("Initialization failed: %v", err)
	}

	// Set up HTTP routes
	setupRoutes()

	// Start the OrcaNet service
	if err := manager.StartOrcaNet(); err != nil {
		log.Fatalf("Failed to start OrcaNet: %v", err)
	}

	// Handle graceful shutdown for the OrcaNet service
	handleGracefulShutdown()

	// Start the HTTP server
	const serverAddr = ":8080"
	log.Printf("Server starting on %s...\n", serverAddr)
	if err := http.ListenAndServe(serverAddr, nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// setupRoutes defines the HTTP routes for the API
func setupRoutes() {
	http.HandleFunc("/", handlers.GetRoot)
	http.HandleFunc("/hello", handlers.GetHello)
	http.HandleFunc("/getBlockchainInfo", handlers.GetBlockchainInfo)
	http.HandleFunc("/getNewAddress", handlers.GetNewAddress)
	http.HandleFunc("/getBalance", handlers.GetBalance)
	http.HandleFunc("/sendToAddress", handlers.SendToAddress)
	// http.HandleFunc("/mine", handlers.Mine)
	// http.HandleFunc("/getPeerInfo", handlers.GetPeerInfo)
	// http.HandleFunc("/getBestBlock", handlers.GetBestBlock)
	// http.HandleFunc("/getBestBlockInfo", handlers.GetBestBlockInfo)
}

// handleGracefulShutdown listens for termination signals and shuts down services gracefully
func handleGracefulShutdown() {
	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		<-stopChan // Wait for a termination signal

		fmt.Println("Shutdown signal received. Stopping services...")

		// Stop the OrcaNet service
		if err := manager.StopOrcaNet(); err != nil {
			log.Fatalf("Failed to stop OrcaNet: %v", err)
		}

		// Exit the program
		os.Exit(0)
	}()
}
