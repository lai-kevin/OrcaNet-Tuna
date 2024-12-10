package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
	"strings"
	"crypto/rand"
	"math/big"
	"os"
	"os/signal"
	"syscall"

	"github.com/lai-kevin/OrcaNet-Tuna/server/manager"
)

// GetRoot returns a welcome message and blockchain info
func GetRoot(w http.ResponseWriter, r *http.Request) {

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

// GenerateRandomPassword generates a secure 12-character random password
func GenerateRandomPassword(length int) (string, error) {
	// Define the characters we can use in the password
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	var password strings.Builder
	for i := 0; i < length; i++ {
		// Generate a random index to pick a character from charset
		randomIndex, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			return "", fmt.Errorf("failed to generate random index: %v", err)
		}
		password.WriteByte(charset[randomIndex.Int64()])
	}
	return password.String(), nil
}


// CreateWallet handler for creating a new wallet and configuring the mining address
func CreateWallet(w http.ResponseWriter, r *http.Request) {
	// Step 1: Generate a random 12-character password
	password, err := GenerateRandomPassword(12)
	if err != nil {
		http.Error(w, "Failed to generate password: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Step 2: Create the wallet using the generated password
	_, err = manager.CreateWallet(password)
	if err != nil {
		http.Error(w, "Failed to create wallet: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Step 3: Start btcwallet after creating the wallet
	if err := manager.StartWallet(); err != nil {
		http.Error(w, "Failed to start btcwallet after wallet creation: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Step 4: Wait for 3 seconds to allow btcwallet to fully initialize
	time.Sleep(3 * time.Second)

	// Step 5: Generate a new mining address
	newAddress, err := manager.CallBtcctlCmd("getnewaddress")
	if err != nil {
		http.Error(w, "Failed to generate mining address: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Step 6: Configure btcd to use this new address
	if err := manager.ConfigureMiningAddress(newAddress); err != nil {
		http.Error(w, "Failed to configure mining address: "+err.Error(), http.StatusInternalServerError)
		return
	}

	time.Sleep(3 * time.Second)

	// Step 7: Unlock the wallet with the generated password
	unlockCmd := fmt.Sprintf("walletpassphrase %s %d", password, 24*60*60) // Unlock for 1 hour
	if _, err := manager.CallBtcctlCmd(unlockCmd); err != nil {
		http.Error(w, "Failed to unlock wallet: "+err.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Println("Unlocking wallet after wallet creation")

	// Step 8: Return the generated password and mining address
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message":       "Wallet created and mining address configured successfully!",
		"password":      password,
		"miningAddress": newAddress,
	})
}

// // CreateWallet handler for creating a new wallet and configuring the mining address
// func CreateWallet(w http.ResponseWriter, r *http.Request) {
// 	var request struct {
// 		Password string `json:"password"`
// 	}
// 	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
// 		http.Error(w, "Invalid request payload", http.StatusBadRequest)
// 		return
// 	}

// 	// Step 1: Create the wallet
// 	_, err := manager.CreateWallet(request.Password)
// 	if err != nil {
// 		http.Error(w, "Failed to create wallet: "+err.Error(), http.StatusInternalServerError)
// 		return
// 	}

// 	// Step 2: Start btcwallet after creating the wallet
// 	if err := manager.StartWallet(); err != nil {
// 		http.Error(w, "Failed to start btcwallet after wallet creation: "+err.Error(), http.StatusInternalServerError)
// 		return
// 	}

// 	// Step 3: Wait for 5 seconds to allow btcwallet to fully initialize
// 	time.Sleep(3 * time.Second)

// 	// Step 5: Generate a new mining address
// 	newAddress, err := manager.CallBtcctlCmd("getnewaddress")
// 	if err != nil {
// 		http.Error(w, "Failed to generate mining address: "+err.Error(), http.StatusInternalServerError)
// 		return
// 	}

// 	// Step 6: Configure btcd to use this new address
// 	if err := manager.ConfigureMiningAddress(newAddress); err != nil {
// 		http.Error(w, "Failed to configure mining address: "+err.Error(), http.StatusInternalServerError)
// 		return
// 	}

// 	time.Sleep(3 * time.Second)

// 	// Step 4: Unlock the wallet with the provided password
// 	unlockCmd := fmt.Sprintf("walletpassphrase %s %d", request.Password, 60*60) // Unlock for 1 hour
// 	if _, err := manager.CallBtcctlCmd(unlockCmd); err != nil {
// 		http.Error(w, "Failed to unlock wallet: "+err.Error(), http.StatusInternalServerError)
// 		return
// 	}
// 	fmt.Println("Unlocking wallet after wallet creation")

// 	w.WriteHeader(http.StatusCreated)
// 	json.NewEncoder(w).Encode(map[string]string{
// 		"message":       "Wallet created and mining address configured successfully!",
// 		"miningAddress": newAddress,
// 	})
// }

// Login handler for logging in an existing user and starting services
func Login(w http.ResponseWriter, r *http.Request) {
    var request struct {
        Password string `json:"password"`
    }
    if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return 
    }

    // Step 1: Start btcwallet if needed
    if err := manager.StartWallet(); err != nil {
        fmt.Println("Error: Failed to start wallet -", err)
        http.Error(w, "Failed to start wallet. Please create a wallet first.", http.StatusUnauthorized)
        return 
    }

    time.Sleep(3 * time.Second) // Allow wallet some time to initialize
    fmt.Println("Going to unlock wallet")

    // Step 2: Unlock the wallet with the provided password
    unlockCmd := fmt.Sprintf("walletpassphrase %s %d", request.Password, 60*60) // Unlock for 1 hour
    if _, err := manager.CallBtcctlCmd(unlockCmd); err != nil {
        fmt.Println("Error: Failed to unlock wallet -", err)
        http.Error(w, "Failed to unlock wallet: "+err.Error(), http.StatusUnauthorized)
        return 
    }

    // Step 3: Ensure mining address is configured
    miningAddr, err := manager.GetMiningAddressFromConfig()
    if err != nil || miningAddr == "" {
        fmt.Println("Error: Mining address not configured.")
        http.Error(w, "Mining address not configured. Please create a wallet first.", http.StatusUnauthorized)
        return 
    }
    fmt.Println("Retrieved mining address from config:", miningAddr)

    // Step 4: Restart btcd (OrcaNet) with the retrieved mining address
    if err := manager.StopOrcaNet(); err != nil {
        fmt.Println("Error: Failed to stop OrcaNet -", err)
        http.Error(w, "Failed to stop btcd: "+err.Error(), http.StatusInternalServerError)
        return
    }

	time.Sleep(3 * time.Second)

    if err := manager.StartOrcaNet(miningAddr); err != nil {
        fmt.Println("Error: Failed to start btcd -", err)
        http.Error(w, "Failed to start btcd with mining address: "+err.Error(), http.StatusInternalServerError)
        return 
    }

    // Step 5: If all steps succeed, respond to the client indicating a successful login
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{"message": "Logged in successfully, services are running."})
}

// Logout locks the wallet and stops the btcwallet process when the user logs out
func Logout(w http.ResponseWriter, r *http.Request) {
	// Step 1: Call the walletlock command to lock the wallet
	cmd := "walletlock"
	_, err := manager.CallBtcctlCmd(cmd)
	if err != nil {
		// If the walletlock command fails, return an error to the user
		http.Error(w, "Failed to lock wallet: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Step 2: Stop the btcwallet service (but keep btcd running)
	if err := manager.StopWallet(); err != nil {
		http.Error(w, "Failed to stop btcwallet: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Step 3: Respond with a confirmation message indicating the wallet is locked and btcwallet has stopped
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Wallet locked and btcwallet stopped successfully!",
	})
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

// GetMiningAddress retrieves the current mining address from the configuration
func GetMiningAddress(w http.ResponseWriter, r *http.Request) {
	miningAddr, err := manager.GetMiningAddressFromConfig()
	if err != nil || miningAddr == "" {
		http.Error(w, "Mining address not configured or unavailable.", http.StatusNotFound)
		return
	}

	response := map[string]string{
		"miningAddress": miningAddr,
	}
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

    // Validate the recipient's address
    isValid, err := manager.ValidateAddress(request.Address)
    if err != nil || !isValid {
        http.Error(w, "Invalid recipient address: "+err.Error(), http.StatusBadRequest)
        return
    }

    // Check balance using the existing getBalance command
    balanceStr, err := manager.CallBtcctlCmd("getbalance")
    if err != nil {
        http.Error(w, "Failed to retrieve wallet balance: "+err.Error(), http.StatusInternalServerError)
        return
    }

    // Parse balance and amount to float for comparison
    balance, amount, parseErr := manager.ParseBalanceAndAmount(balanceStr, request.Amount)
    if parseErr != nil {
        http.Error(w, "Failed to parse balance or amount: "+parseErr.Error(), http.StatusInternalServerError)
        return
    }

    if amount > balance {
        http.Error(w, "Insufficient funds to complete the transaction", http.StatusBadRequest)
        return
    }

    // Execute the btcctl sendtoaddress command
    txid, err := manager.CallBtcctlCmd(fmt.Sprintf("sendtoaddress %s %s", request.Address, request.Amount))
    if err != nil {
        http.Error(w, "Failed to send funds: "+err.Error(), http.StatusInternalServerError)
        return
    }

    // Respond with the transaction ID
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{
        "message": "Funds sent successfully!",
        "txid":    txid,
    })
}


// GetTransactionHistory retrieves and returns the transaction history of the node
func GetTransactionHistory(w http.ResponseWriter, r *http.Request) {
	// Call listtransactions command to get transaction history
	cmd := "listtransactions"
	output, err := manager.CallBtcctlCmd(cmd)
	if err != nil {
		http.Error(w, "Failed to retrieve transaction history: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Parse the output into a JSON structure
	var transactions []map[string]interface{}
	if err := json.Unmarshal([]byte(output), &transactions); err != nil {
		http.Error(w, "Failed to parse transaction history: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Create a formatted response with the necessary information
	var transactionDetails []map[string]interface{}
	for _, tx := range transactions {
		txDetails := map[string]interface{}{
			"txid":          tx["txid"],
			"time":          time.Unix(int64(tx["time"].(float64)), 0).Format(time.RFC3339),
			"amount":        tx["amount"],
			"category":      tx["category"],  // "send", "receive", or "generate" (mined)
			"confirmations": tx["confirmations"],
		}

		// Check if the transaction has an address and include it
		if address, ok := tx["address"]; ok {
			txDetails["address"] = address
		} else {
			txDetails["address"] = "N/A"  // If no address found, mark it as N/A
		}

		transactionDetails = append(transactionDetails, txDetails)
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"transactions": transactionDetails,
	})
}

// getTransactionAddresses retrieves the addresses involved in a given transaction using getrawtransaction
func getTransactionAddresses(txid string) ([]string, error) {
	// Call getrawtransaction to fetch detailed transaction information
	cmd := fmt.Sprintf("getrawtransaction %s 1", txid) // verbose mode set to 1 to get detailed info
	output, err := manager.CallBtcctlCmd(cmd)
	if err != nil {
		return nil, fmt.Errorf("failed to get transaction details for txid %s: %v", txid, err)
	}

	// Parse the output into a JSON structure
	var txDetails map[string]interface{}
	if err := json.Unmarshal([]byte(output), &txDetails); err != nil {
		return nil, fmt.Errorf("failed to parse transaction details for txid %s: %v", txid, err)
	}

	// Extract the addresses from the transaction details
	var addresses []string
	if vouts, ok := txDetails["vout"].([]interface{}); ok {
		for _, vout := range vouts {
			voutMap := vout.(map[string]interface{})
			if scriptPubKey, exists := voutMap["scriptPubKey"].(map[string]interface{}); exists {
				if addressesArray, ok := scriptPubKey["addresses"].([]interface{}); ok {
					for _, address := range addressesArray {
						addresses = append(addresses, address.(string))
					}
				}
			}
		}
	}

	return addresses, nil
}

func Shutdown(w http.ResponseWriter, r *http.Request) {

	// Step 1: Stop the btcwallet service
	if err := manager.StopWallet(); err != nil {
		http.Error(w, "Failed to stop btcwallet: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Step 2: Stop OrcaNet (btcd)
	if err := manager.StopOrcaNet(); err != nil {
		http.Error(w, "Failed to stop OrcaNet (btcd): "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Step 3: Gracefully terminate the services (Sending SIGINT)
	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, os.Interrupt, syscall.SIGTERM)

	// Send SIGINT to simulate the shutdown signal
	go func() {
		stopChan <- os.Interrupt // Simulate SIGINT to terminate processes
	}()

	// Step 4: Forcefully kill the processes if they don't shut down gracefully
	go func() {
		time.Sleep(5 * time.Second) // Give some time for graceful shutdown
		if err := manager.KillProcesses(); err != nil {
			fmt.Println("Error while forcefully killing processes:", err)
		}
	}()

	// Step 5: Exit the main program after shutdown
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "Shutdown initiated. Stopping services...")

	// Exit the program, ensuring everything is stopped
	os.Exit(0)
}

// DeleteWallet handler for deleting the wallet
func DeleteWallet(w http.ResponseWriter, r *http.Request) {
	// Call the DeleteWallet function from manager.go
	if err := manager.DeleteWallet(); err != nil {
		http.Error(w, "Failed to delete wallet: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Respond with success message
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "Wallet deleted successfully!")
}
