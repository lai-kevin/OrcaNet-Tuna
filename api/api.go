package api

import (
    "encoding/json"
    "net/http"
    "github.com/btcsuite/btcd/rpcclient"
    // "github.com/btcsuite/btcutil"
)

// Struct to handle the response for the balance
type BalanceResponse struct {
    Balance float64 `json:"balance"`
}

// Connect to RPC (function to be defined)
func connectRPC() (*rpcclient.Client, error) {
    connCfg := &rpcclient.ConnConfig{
        Host: "localhost:8334",  // Make sure the port matches your btcd setup
        User: "yourrpcuser",
        Pass: "yourrpcpassword",
        HTTPPostMode: true,       // Required for wallet-related commands
        DisableTLS: true,         // TLS is disabled for simplicity, but enable it in production!
    }

    return rpcclient.New(connCfg, nil)
}

// API to create a new wallet (simplified implementation)
func CreateWalletHandler(w http.ResponseWriter, r *http.Request) {
    client, err := connectRPC()
    if err != nil {
        http.Error(w, "Error connecting to RPC", http.StatusInternalServerError)
        return
    }
    defer client.Shutdown()

    // Create the wallet using btcwallet
    // You may want to customize wallet creation parameters based on your needs
    _, err = client.CreateWallet("mywallet", "", "")
    if err != nil {
        http.Error(w, "Error creating wallet: "+err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusCreated)
    w.Write([]byte(`{"message": "Wallet created successfully"}`))
}

// API to get the balance of a wallet
func GetBalanceHandler(w http.ResponseWriter, r *http.Request) {
    client, err := connectRPC()
    if err != nil {
        http.Error(w, "Error connecting to RPC", http.StatusInternalServerError)
        return
    }
    defer client.Shutdown()

    // Example of retrieving balance
    balance, err := client.GetBalance("*") // Use "*" to get the total balance
    if err != nil {
        http.Error(w, "Error fetching balance: "+err.Error(), http.StatusInternalServerError)
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
