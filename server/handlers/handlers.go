package handlers

import (
	"fmt"
	"net/http"
	"encoding/json"
)

// Root handler
func GetRoot(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{"message": "Welcome to OrcaNet API from testcrypto!"}
	json.NewEncoder(w).Encode(response)
}

// Example handler for "/hello" route
func GetHello(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{"message": "Hello World!"}
	json.NewEncoder(w).Encode(response)
}

// Handler to get blockchain info
func GetBlockchainInfo(w http.ResponseWriter, r *http.Request) {
	// Add logic to interact with the blockchain and return relevant info
	response := map[string]string{"blockchainInfo": "Blockchain info will be displayed here."}
	json.NewEncoder(w).Encode(response)
}

// Handler to get a new address
func GetNewAddress(w http.ResponseWriter, r *http.Request) {
	// Generate and return a new address
	response := map[string]string{"newAddress": "[Address]"}
	json.NewEncoder(w).Encode(response)
}

// Handler to get balance
func GetBalance(w http.ResponseWriter, r *http.Request) {
	// Return the balance info
	response := map[string]string{"balance": "[Balance Amount]"}
	json.NewEncoder(w).Encode(response)
}

// Handler to send to address
func SendToAddress(w http.ResponseWriter, r *http.Request) {
	// Example input structure (replace with actual input handling)
	var request struct {
		Address string `json:"address"`
		Amount  string `json:"amount"`
	}

	// Decode the request body
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Handle sending funds to a specific address
	response := map[string]string{"message": fmt.Sprintf("Sent %s to %s.", request.Amount, request.Address)}
	json.NewEncoder(w).Encode(response)
}
