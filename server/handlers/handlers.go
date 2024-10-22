package handler

import (
    "fmt"
    "net/http"
    "github.com/lai-kevin/OrcaNet-Tuna/manager"
)

// GetRoot handles the root path.
func GetRoot(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Welcome to OrcaNet API!")
}

// StartOrcaNetHandler starts OrcaNet when called.
func StartOrcaNetHandler(w http.ResponseWriter, r *http.Request) {
    err := manager.StartOrcaNet()
    if err != nil {
        http.Error(w, fmt.Sprintf("Failed to start OrcaNet: %v", err), http.StatusInternalServerError)
        return
    }
    fmt.Fprintf(w, "OrcaNet started successfully")
}

// StopOrcaNetHandler stops OrcaNet when called.
func StopOrcaNetHandler(w http.ResponseWriter, r *http.Request) {
    err := manager.StopOrcaNet()
    if err != nil {
        http.Error(w, fmt.Sprintf("Failed to stop OrcaNet: %v", err), http.StatusInternalServerError)
        return
    }
    fmt.Fprintf(w, "OrcaNet stopped successfully")
}

// Other handlers like GetBlockchainInfo, GetNewAddress, etc., will follow the same pattern.
