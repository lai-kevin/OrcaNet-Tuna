package manager

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
	"os/signal"
	"syscall"
)

var orcaNetCmd *exec.Cmd
var walletCmd *exec.Cmd

// Initialize application, placeholder for future use if needed
func Initialize() error {
	fmt.Println("Initializing OrcaNet application...")
	return nil
}

// Get the project root path (parent of the 'server' folder)
func getExePath() (string, error) {
	// Get current working directory (where 'server' folder is)
	wd, err := os.Getwd()
	if err != nil {
		return "", fmt.Errorf("could not get working directory: %v", err)
	}

	// Move one level up to the project root
	rootPath := filepath.Dir(wd)

	return rootPath, nil
}

// StartOrcaNet starts the OrcaNet process by locating and executing the btcd binary
func StartOrcaNet() error {
    // Get the project root path (or current working directory based on getExePath)
    rootPath, err := getExePath()
    if err != nil {
        return err
    }

    // Construct the path to the btcd binary inside the 'btcd' folder
    orcaNetPath := filepath.Join(rootPath, "btcd", "btcd")

    // Print the path to ensure it's correct (debugging purpose)
    fmt.Printf("Looking for OrcaNet binary at: %s\n", orcaNetPath)

    // Check if the btcd binary exists at the specified path
    _, err = os.Stat(orcaNetPath)
    if os.IsNotExist(err) {
        return fmt.Errorf("OrcaNet binary not found at %s", orcaNetPath)
    }

    rpcUser := "user"         
    rpcPass := "password"     
    miningAddr := "1885q3h76A4kK3yceXMVFRTjCaWzeZNPTj"

    // Arguments to start btcd with custom configurations
    args := []string{
        "--rpcuser=" + rpcUser,
        "--rpcpass=" + rpcPass,
        "--notls",                   // Disable TLS (for local testing only; secure in production)
        "--miningaddr=" + miningAddr, // Address to receive mining rewards
    }


    // Start the OrcaNet process with the correct binary path
    orcaNetCmd := exec.Command(orcaNetPath, args...)

    // Get stdout and stderr pipes to capture the output of the process
    stdout, err := orcaNetCmd.StdoutPipe()
    if err != nil {
        return fmt.Errorf("failed to create stdout pipe: %v", err)
    }
    stderr, err := orcaNetCmd.StderrPipe()
    if err != nil {
        return fmt.Errorf("failed to create stderr pipe: %v", err)
    }

    // Start the process and handle errors if any
    if err := orcaNetCmd.Start(); err != nil {
        return fmt.Errorf("failed to start OrcaNet: %v", err)
    }

    // Stream the output of the OrcaNet process to the console
    go streamOutput(stdout, "OrcaNet")
    go streamOutput(stderr, "OrcaNet error")

    // Print a success message indicating that OrcaNet has started
    fmt.Println("OrcaNet started successfully.")

    return nil
}

// streamOutput reads the output from the provided pipe and prints it with a prefix
func streamOutput(r io.Reader, prefix string) {
    scanner := bufio.NewScanner(r)
    for scanner.Scan() {
        fmt.Printf("[%s] %s\n", prefix, scanner.Text())
    }
    if err := scanner.Err(); err != nil {
        fmt.Printf("Error reading %s stream: %v\n", prefix, err)
    }
}


// Stop OrcaNet service
func StopOrcaNet() error {
	if orcaNetCmd != nil && orcaNetCmd.Process != nil {
		if err := orcaNetCmd.Process.Signal(os.Interrupt); err != nil {
			return fmt.Errorf("failed to stop OrcaNet: %v", err)
		}
		orcaNetCmd.Wait()
		fmt.Println("OrcaNet stopped.")
	} else {
		return fmt.Errorf("OrcaNet is not running.")
	}
	return nil
}

// Start the wallet service
func StartWallet() error {
	rootPath, err := getExePath()
	if err != nil {
		return err
	}
	walletPath := filepath.Join(rootPath, "btcwallet", "btcwallet")

	_, err = os.Stat(walletPath)
	if os.IsNotExist(err) {
		return fmt.Errorf("Wallet binary not found at %s", walletPath)
	}

    // Note to self:
    // Create a wallet if you do not have one
    btcdUser := "user"
    btcdPass := "password"

    args := []string{
        "--btcdusername=" + btcdUser,
        "--btcdpassword=" + btcdPass,
    }

	walletCmd = exec.Command(walletPath, args...)
    
    stdout, err := walletCmd.StdoutPipe()
    if err != nil {
        return fmt.Errorf("failed to create stdout pipe: %v", err)
    }
    stderr, err := walletCmd.StderrPipe()
    if err != nil {
        return fmt.Errorf("failed to create stderr pipe: %v", err)
    }
    
	if err := walletCmd.Start(); err != nil {
		return fmt.Errorf("failed to start wallet: %v", err)
	}

    go streamOutput(stdout, "btcwallet")
    go streamOutput(stderr, "btcwallet error")

	fmt.Println("Wallet started successfully.")
	return nil
}

// Stop the wallet service
func StopWallet() error {
	if walletCmd != nil && walletCmd.Process != nil {
		if err := walletCmd.Process.Signal(os.Interrupt); err != nil {
			return fmt.Errorf("failed to stop wallet: %v", err)
		}
		walletCmd.Wait()
		fmt.Println("Wallet stopped.")
	} else {
		return fmt.Errorf("Wallet is not running.")
	}
	return nil
}

// Handle graceful shutdown for both OrcaNet and wallet
func handleGracefulShutdown() {
	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, os.Interrupt, syscall.SIGTERM)

	<-stopChan // Wait for a termination signal

	fmt.Println("Shutting down services...")
	StopOrcaNet()
	StopWallet()

	time.Sleep(1 * time.Second)
	os.Exit(0)
}

// Read RPC info from btcd.conf
func readRPCInfo(confPath string) ([]string, error) {
	body, err := os.ReadFile(confPath)
	if err != nil {
		return nil, fmt.Errorf("error reading btcd.conf file: %v", err)
	}

	var rpcInfo []string
	lines := strings.Split(string(body), "\n")
	for _, line := range lines {
		if strings.HasPrefix(line, "rpcuser") || strings.HasPrefix(line, "rpcpass") {
			parts := strings.Split(line, "=")
			if len(parts) == 2 {
				rpcInfo = append(rpcInfo, strings.TrimSpace(parts[1]))
			}
		}
	}

	if len(rpcInfo) < 2 {
		return nil, fmt.Errorf("incomplete rpc information in btcd.conf")
	}
	return rpcInfo, nil
}

// CallBtcctlCmd calls a btcctl command and returns the result
func CallBtcctlCmd(cmdStr string) (string, error) {
	// Get the rpc values from btcd.conf
	rpcInfo, err := readRPCInfo(filepath.Join(filepath.Dir(os.Getenv("HOME")), ".btcd", "btcd.conf"))
	if err != nil {
		return "", fmt.Errorf("failed to read RPC info: %v", err)
	}

	exePath, err := getExePath()
	if err != nil {
		return "", fmt.Errorf("failed to get executable path: %v", err)
	}

	btcctlPath := filepath.Join(filepath.Dir(exePath), "btcctl")

	// Add rpcuser and rpcpass to btcctl command
	params := strings.Split(cmdStr, " ")
	params = append(params, "--rpcuser="+rpcInfo[0], "--rpcpass="+rpcInfo[1])

	cmd := exec.Command(btcctlPath, params...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("failed to execute btcctl command: %s, error: %v", cmdStr, err)
	}

	return string(output), nil
}
