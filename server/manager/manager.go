package manager

import (
    "fmt"
    "os/exec"
    "path/filepath"
    "os"
)

var orcaNetCmd *exec.Cmd

// StartOrcaNet starts the OrcaNet process.
func StartOrcaNet() error {
    exePath, err := os.Executable()
    if err != nil {
        return fmt.Errorf("failed to get executable path: %v", err)
    }
    orcaNetPath := filepath.Join(filepath.Dir(exePath), "../btcd/OrcaNet")

    orcaNetCmd = exec.Command(orcaNetPath)
    err = orcaNetCmd.Start()
    if err != nil {
        return fmt.Errorf("failed to start OrcaNet: %v", err)
    }
    fmt.Println("OrcaNet started")
    return nil
}

// StopOrcaNet stops the OrcaNet process.
func StopOrcaNet() error {
    if orcaNetCmd == nil || orcaNetCmd.Process == nil {
        return fmt.Errorf("OrcaNet is not running")
    }
    err := orcaNetCmd.Process.Kill()
    if err != nil {
        return fmt.Errorf("failed to stop OrcaNet: %v", err)
    }
    fmt.Println("OrcaNet stopped")
    return nil
}
