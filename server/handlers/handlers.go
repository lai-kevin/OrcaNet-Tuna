package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
	"strings"

	"github.com/lai-kevin/OrcaNet-Tuna/server/manager"
)

// GetRoot returns a welcome message and blockchain info
func GetRoot(w http.ResponseWriter, r *http.Request) {
	// Retrieve blockchain information using getblockchaininfo command
	_, err := manager.CallBtcctlCmd("getblockchaininfo")
	if err != nil {
		http.Error(w, "Failed to retrieve blockchain info: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Construct JSON response with only the welcome message
	response := map[string]string{
		"message": "Welcome to OrcaNet API from testcrypto!",
	}

	// Send JSON response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetHello provides a simple hello message with a timestamp
func GetHello(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{
		"message":   "Hello World!",
		"timestamp": time.Now().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// CreateWallet handler for creating a new wallet and configuring the mining address
func CreateWallet(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Step 1: Create the wallet
	_, err := manager.CreateWallet(request.Password)
	if err != nil {
		http.Error(w, "Failed to create wallet: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Step 2: Start btcwallet after creating the wallet
	if err := manager.StartWallet(); err != nil {
		http.Error(w, "Failed to start btcwallet after wallet creation: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Step 4: Wait for 5 seconds to allow btcwallet to fully initialize
	time.Sleep(5 * time.Second)

	// Step 3: Generate a new mining address
	newAddress, err := manager.CallBtcctlCmd("getnewaddress")
	if err != nil {
		http.Error(w, "Failed to generate mining address: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Step 4: Configure btcd to use this new address
	if err := manager.ConfigureMiningAddress(newAddress); err != nil {
		http.Error(w, "Failed to configure mining address: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message":       "Wallet created and mining address configured successfully!",
		"miningAddress": newAddress,
	})
}

// Login handler for logging in an existing user and starting services
func Login(w http.ResponseWriter, r *http.Request) {
	
	var request struct {
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Start btcwallet if needed and verify the mining address is set
	if err := manager.StartWallet(); err != nil {
		http.Error(w, "Failed to start wallet: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Ensure mining address is configured
	miningAddr, err := manager.GetMiningAddressFromConfig()
	if err != nil || miningAddr == "" {
		http.Error(w, "Mining address not configured. Please create a wallet first.", http.StatusUnauthorized)
		return
	}
	fmt.Println("!!!Retrieved mining address from config:", miningAddr)
	// Start btcd with the existing mining address
	if err := manager.StartOrcaNet(miningAddr); err != nil {
		http.Error(w, "Failed to start btcd with mining address: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Logged in successfully, services are running."})
}

// GetNewAddress generates and returns a new wallet address
func GetNewAddress(w http.ResponseWriter, r *http.Request) {
	// Call getnewaddress command
	newAddress, err := manager.CallBtcctlCmd("getnewaddress")
	if err != nil {
		http.Error(w, "Failed to generate new address: "+err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]string{
		"newAddress": newAddress,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetBalance retrieves and returns the wallet balance
func GetBalance(w http.ResponseWriter, r *http.Request) {
	// Call getbalance command
	balance, err := manager.CallBtcctlCmd("getbalance")
	if err != nil {
		http.Error(w, "Failed to retrieve balance: "+err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]string{"balance": balance}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// SendToAddress handles sending funds to a specific address
func SendToAddress(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Address string `json:"address"`
		Amount  string `json:"amount"`
	}

	// Decode the request body
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Use sendtoaddress command to transfer funds
	response, err := manager.CallBtcctlCmd(fmt.Sprintf("sendtoaddress %s %s", request.Address, request.Amount))
	if err != nil {
		http.Error(w, "Failed to send funds: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": fmt.Sprintf("Successfully sent %s to %s.", request.Amount, request.Address),
		"txid":    response,
	})
}


// Mine triggers mining by generating a specified number of blocks
func Mine(w http.ResponseWriter, r *http.Request) {
	var request struct {
		NumBlocks int `json:"num_blocks"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil || request.NumBlocks <= 0 {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Construct the command to start mining
	cmd := fmt.Sprintf("generate %d", request.NumBlocks)
	output, err := manager.CallBtcctlCmd(cmd)
	if err != nil {
		http.Error(w, "Failed to start mining: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Parse the response to get the block hashes of the mined blocks
	blockHashes := strings.Split(strings.TrimSpace(output), "\n")

	// Send response with the mined block hashes
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":    "Mining started successfully",
		"block_hash": blockHashes,
	})
}

