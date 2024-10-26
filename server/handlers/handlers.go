package handlers

import (
	"fmt"
	"net/http"
	"encoding/json"
    "github.com/lai-kevin/OrcaNet-Tuna/server/manager"
    "time"
)

// GetRoot returns a welcome message and blockchain info
func GetRoot(w http.ResponseWriter, r *http.Request) {
    // Retrieve blockchain information using getblockchaininfo command
    info, err := manager.CallBtcctlCmd("getblockchaininfo")
    if err != nil {
        http.Error(w, "Failed to retrieve blockchain info: "+err.Error(), http.StatusInternalServerError)
        return
    }

    // Construct JSON response with dynamic info
    response := map[string]string{
        "message": "Welcome to OrcaNet API from testcrypto!",
        "info":    info,
    }

    // Send JSON response
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

// GetHello provides a simple hello message with a timestamp
func GetHello(w http.ResponseWriter, r *http.Request) {
    // Prepare response with current timestamp
    response := map[string]string{
        "message":   "Hello World!",
        "timestamp": time.Now().Format(time.RFC3339),
    }

    // Send JSON response
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}


// Handler to get blockchain info
func GetBlockchainInfo(w http.ResponseWriter, r *http.Request) {
	// Add logic to interact with the blockchain and return relevant info
	response := map[string]string{"blockchainInfo": "Blockchain info will be displayed here."}
	json.NewEncoder(w).Encode(response)
}

// GetNewAddress generates and returns a new wallet address
func GetNewAddress(w http.ResponseWriter, r *http.Request) {
    // Call getnewaddress command
    newAddress, err := manager.CallBtcctlCmd("getnewaddress")
    if err != nil {
        // Return an error message to the client if address generation fails
        http.Error(w, "Failed to generate new address: "+err.Error(), http.StatusInternalServerError)
        return
    }

    // Prepare JSON response with the new address
    response := map[string]string{
        "newAddress": newAddress,
    }

    // Send the JSON response
    w.Header().Set("Content-Type", "application/json")
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
