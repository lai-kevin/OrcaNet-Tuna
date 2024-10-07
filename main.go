package api

import (
    "encoding/json"
    "log"
    "net/http"
    "github.com/btcsuite/btcd/rpcclient"
    // "github.com/btcsuite/btcutil"
)

// Struct to handle the response for the balance
type BalanceResponse struct {
    Balance float64 `json:"balance"`
}

// Setup for RPC connection to btcd or btcwallet
func connectRPC() (*rpcclient.Client, error) {
    connCfg := &rpcclient.ConnConfig{
        Host: "localhost:8334",  // Make sure the port matches your btcd setup
        User: "yourrpcuser",
        Pass: "yourrpcpassword",
        HTTPPostMode: true,   // Required for wallet-related commands
        DisableTLS: true,     // TLS is disabled for simplicity, but enable it in production!
    }

    return rpcclient.New(connCfg, nil)
}

// API to create a new wallet (simplified, you might want a more complex implementation)
func createWalletHandler(w http.ResponseWriter, r *http.Request) {
    client, err := connectRPC()
    if err != nil {
        http.Error(w, "Error connecting to RPC", http.StatusInternalServerError)
        return
    }
    defer client.Shutdown()

    // Assuming wallet creation is possible via rpcclient or btcwallet.
    // Depending on the implementation you might create and store keys manually.

    w.WriteHeader(http.StatusCreated)
    w.Write([]byte(`{"message": "Wallet created successfully"}`))
}

// API to get the balance of a wallet
func getBalanceHandler(w http.ResponseWriter, r *http.Request) {
    client, err := connectRPC()
    if err != nil {
        http.Error(w, "Error connecting to RPC", http.StatusInternalServerError)
        return
    }
    defer client.Shutdown()

    // Example of retrieving balance
    balance, err := client.GetBalance("*")
    if err != nil {
        http.Error(w, "Error fetching balance", http.StatusInternalServerError)
        return
    }

    // Create a response struct to convert balance to JSON
    balanceResp := BalanceResponse{
        Balance: balance.ToBTC(),  // Converts the balance to BTC units
    }

    // Return the balance as JSON
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(balanceResp)
}

// Main function to set up routes and start the HTTP server
func main() {
    http.HandleFunc("/create-wallet", createWalletHandler)
    http.HandleFunc("/get-balance", getBalanceHandler)

    log.Println("Starting server on :8080...")
    if err := http.ListenAndServe(":8080", nil); err != nil {
        log.Fatal("ListenAndServe: ", err)
    }
}