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

func main() {
	// Initialize the application and check for errors
	if err := manager.Initialize(); err != nil {
		log.Fatalf("Initialization failed: %v", err)
	}

	// Set up HTTP routes
	setupRoutes()

	// // Start the OrcaNet service
	if err := manager.StartOrcaNet(""); err != nil {
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
	http.HandleFunc("/createWallet", handlers.CreateWallet)
	http.HandleFunc("/login", handlers.Login)
	http.HandleFunc("/getMiningAddress", handlers.GetMiningAddress)
	http.HandleFunc("/getNewAddress", handlers.GetNewAddress)
	http.HandleFunc("/getBalance", handlers.GetBalance)
	http.HandleFunc("/mine", handlers.Mine)
	http.HandleFunc("/sendToAddress", handlers.SendToAddress)
	http.HandleFunc("/getTransactionHistory", handlers.GetTransactionHistory)
	// http.HandleFunc("/getPeerInfo", handlers.GetPeerInfo)
	// http.HandleFunc("/getBlockchainInfo", handlers.GetBlockchainInfo)

}

// handleGracefulShutdown listens for termination signals and shuts down services gracefully
// Ctrl+C or SIGTERM
func handleGracefulShutdown() {	 
	stopChan := make(chan os.Signal, 1) // Creates a channel to listen for OS signals
	signal.Notify(stopChan, os.Interrupt, syscall.SIGTERM) // Notify the chanel when Interrupt or SIGTERM signals are recieved

	// Uses go routine to wait for the termination signal in the background
	go func() {
		<-stopChan // Wait for a termination signal
		fmt.Println("Shutdown signal received. Stopping services...")

		if err := manager.StopOrcaNet(); err != nil {
			log.Fatalf("Failed to stop OrcaNet: %v", err)
		}

		// Exit the program
		os.Exit(0)
	}()
}
