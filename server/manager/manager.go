package manager

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"strconv"
	"time"
	"github.com/creack/pty"
	"os/user"
	"runtime"
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
	wd, err := os.Getwd()
	if err != nil {
		return "", fmt.Errorf("could not get working directory: %v", err)
	}
	rootPath := filepath.Dir(wd)
	return rootPath, nil
}

// StartOrcaNet starts the btcd process with an optional mining address
func StartOrcaNet(miningAddr string) error {
	if orcaNetCmd != nil && orcaNetCmd.Process != nil {
		fmt.Println("btcd is already running.")
		return nil
	}

	rootPath, err := getExePath()
	if err != nil {
		return fmt.Errorf("failed to get executable path: %v", err)
	}
	orcaNetPath := filepath.Join(rootPath, "btcd", "btcd")

	if _, err = os.Stat(orcaNetPath); os.IsNotExist(err) {
		return fmt.Errorf("btcd binary not found at %s", orcaNetPath)
	}

	rpcUser := "user"
	rpcPass := "password"
    addpeer := "130.245.173.221:8333"
	args := []string{
		"--rpcuser=" + rpcUser,
		"--rpcpass=" + rpcPass,
		"--notls",
		"--txindex",
        "--addpeer=" + addpeer, 
	}

	if miningAddr != "" {
		args = append(args, "--miningaddr="+miningAddr)
        fmt.Println("Retrieved mining address added to btcd")
	} else{
        fmt.Println("Mining address is nothing")
    }

    

	orcaNetCmd = exec.Command(orcaNetPath, args...)
	stdout, err := orcaNetCmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("failed to create stdout pipe: %v", err)
	}
	stderr, err := orcaNetCmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("failed to create stderr pipe: %v", err)
	}

	if err := orcaNetCmd.Start(); err != nil {
		return fmt.Errorf("failed to start btcd: %v", err)
	}

	go streamOutput(stdout, "btcd")
	go streamOutput(stderr, "btcd error")

	fmt.Println("btcd started successfully.")
	return nil
}

// StopOrcaNet stops the btcd process if it is running
func StopOrcaNet() error {
	if orcaNetCmd != nil && orcaNetCmd.Process != nil {
		if err := orcaNetCmd.Process.Signal(os.Interrupt); err != nil {
			return fmt.Errorf("failed to stop btcd: %v", err)
		}

		// Wait for the process to exit and check for errors
		if err := orcaNetCmd.Wait(); err != nil {
			return fmt.Errorf("btcd did not shut down cleanly: %v", err)
		}

		fmt.Println("btcd stopped.")
		orcaNetCmd = nil // Reset orcaNetCmd to indicate btcd is no longer running
	} else {
		return fmt.Errorf("btcd is not running.")
	}
	return nil
}



// StartWallet starts the btcwallet service
func StartWallet() error {
	if walletCmd != nil && walletCmd.Process != nil {
		fmt.Println("btcwallet is already running.")
		return nil
	}

	rootPath, err := getExePath()
	if err != nil {
		return fmt.Errorf("failed to get executable path: %v", err)
	}
	walletPath := filepath.Join(rootPath, "btcwallet", "btcwallet")

	if _, err = os.Stat(walletPath); os.IsNotExist(err) {
		return fmt.Errorf("btcwallet binary not found at %s", walletPath)
	}

	rpcUser := "user"
	rpcPass := "password"
	rpcConnect := "127.0.0.1:8334"
	args := []string{
		"--btcdusername=" + rpcUser,
		"--btcdpassword=" + rpcPass,
		"--rpcconnect=" + rpcConnect,
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
		return fmt.Errorf("failed to start btcwallet: %v", err)
	}

	go streamOutput(stdout, "btcwallet")
	go streamOutput(stderr, "btcwallet error")

	return nil
}

func StopWallet() error {
	if walletCmd != nil && walletCmd.Process != nil {
		// Attempt to gracefully stop btcwallet
		if err := walletCmd.Process.Signal(os.Interrupt); err != nil {
			return fmt.Errorf("failed to stop btcwallet: %v", err)
		}

		// Wait for the process to exit and check for errors
		err := walletCmd.Wait()
		if err != nil {
			return fmt.Errorf("btcwallet did not shut down cleanly: %v", err)
		}

		fmt.Println("btcwallet stopped.")
		walletCmd = nil // Reset walletCmd to indicate btcwallet is no longer running
	} else {
		return fmt.Errorf("btcwallet is not running.")
	}
	return nil
}

// ConfigureMiningAddress stops btcd, updates btcd.conf with a new mining address, and restarts btcd
func ConfigureMiningAddress(address string) error {
	if err := StopOrcaNet(); err != nil {
		return fmt.Errorf("failed to stop btcd: %v", err)
	}

    // Short delay to ensure btcd has shut down completely
	time.Sleep(5 * time.Second)


	if err := UpdateBtcdConfigWithMiningAddr(address); err != nil {
		return fmt.Errorf("failed to update btcd config: %v", err)
	}
    
    time.Sleep(5 * time.Second)
	
    if err := StartOrcaNet(address); err != nil {
		return fmt.Errorf("failed to restart btcd with mining address: %v", err)
	}
	return nil
}

// UpdateBtcdConfigWithMiningAddr updates btcd.conf with the specified mining address
func UpdateBtcdConfigWithMiningAddr(address string) error {
	// Get the project root path
	rootPath, err := getExePath()
	if err != nil {
		return fmt.Errorf("failed to get project root path: %v", err)
	}

	// Construct the path to btcd.conf within the btcd directory
	configPath := filepath.Join(rootPath, "btcd", "sample-btcd.conf")

	// Read the current btcd.conf content
	content, err := os.ReadFile(configPath)
	if err != nil {
		return fmt.Errorf("failed to read btcd.conf: %v", err)
	}

	// Update or add the mining address line
	lines := strings.Split(string(content), "\n")
	var found bool
	for i, line := range lines {
		if strings.HasPrefix(line, "miningaddr=") {
			lines[i] = fmt.Sprintf("miningaddr=%s", address)
			found = true
			break
		}
	}
	if !found {
		// If no mining address was found, add a new line for it
		lines = append(lines, fmt.Sprintf("miningaddr=%s", address))
	}

	// Write the updated content back to btcd.conf
	updatedContent := strings.Join(lines, "\n")
	if err := os.WriteFile(configPath, []byte(updatedContent), 0644); err != nil {
		return fmt.Errorf("failed to write to btcd.conf: %v", err)
	}

	fmt.Println("btcd.conf updated with new mining address:", address)
	return nil
}

// GetMiningAddressFromConfig reads btcd.conf and retrieves the mining address if it exists
func GetMiningAddressFromConfig() (string, error) {
	// Get the project root path
	rootPath, err := getExePath()
	if err != nil {
		return "", fmt.Errorf("failed to get project root path: %v", err)
	}

	// Construct the path to btcd.conf within the btcd directory
	configPath := filepath.Join(rootPath, "btcd", "sample-btcd.conf")

	// Read the btcd.conf file
	data, err := os.ReadFile(configPath)
	if err != nil {
		return "", fmt.Errorf("failed to read btcd.conf: %v", err)
	}

	// Search for the mining address line
	for _, line := range strings.Split(string(data), "\n") {
		if strings.HasPrefix(line, "miningaddr=") {
			return strings.TrimSpace(strings.TrimPrefix(line, "miningaddr=")), nil
		}
	}
	
	// Return empty string if no mining address is found
	return "", nil
}

// CreateWallet creates a new wallet and returns a confirmation message
func CreateWallet(password string) (string, error) {
	rootPath, err := getExePath()
	if err != nil {
		return "", fmt.Errorf("failed to get root path: %v", err)
	}
	walletPath := filepath.Join(rootPath, "btcwallet", "btcwallet")

	if _, err = os.Stat(walletPath); os.IsNotExist(err) {
		return "", fmt.Errorf("btcwallet binary not found at %s", walletPath)
	}

	walletCmd := exec.Command(walletPath, "--create")
	ptmx, err := pty.Start(walletCmd)
	if err != nil {
		return "", fmt.Errorf("failed to start wallet creation with pty: %v", err)
	}
	defer ptmx.Close()

	go func() {
		scanner := bufio.NewScanner(ptmx)
		for scanner.Scan() {
			line := scanner.Text()
			fmt.Println(line)
		}
	}()

	go func() {
		time.Sleep(1 * time.Second)
		fmt.Fprintln(ptmx, password)
		time.Sleep(1 * time.Second)
		fmt.Fprintln(ptmx, password)
		time.Sleep(1 * time.Second)
		fmt.Fprintln(ptmx, "no")
		time.Sleep(1 * time.Second)
		fmt.Fprintln(ptmx, "no")
		fmt.Fprintln(ptmx, "OK")
	}()

	if err := walletCmd.Wait(); err != nil {
		return "", fmt.Errorf("wallet creation failed: %v", err)
	}

	fmt.Println("Wallet created successfully with automated inputs.")
	return "", nil
}

// DeleteWallet deletes the wallet database (wallet.db) based on the OS
func DeleteWallet() error {
	// Get the current user's home directory
	user, err := user.Current()
	if err != nil {
		return fmt.Errorf("failed to get current user: %v", err)
	}

	var walletPath string

	// Determine the wallet path based on the operating system
	switch runtime.GOOS {
	case "darwin": // macOS
		walletPath = filepath.Join(user.HomeDir, "Library", "Application Support", "Btcwallet", "mainnet", "wallet.db")
	case "linux": // Linux
		walletPath = filepath.Join(user.HomeDir, ".btcwallet", "mainnet", "wallet.db")
	case "windows": // Windows
		walletPath = filepath.Join(user.HomeDir, "AppData", "Roaming", "Btcwallet", "mainnet", "wallet.db")
	default:
		return fmt.Errorf("unsupported OS: %v", runtime.GOOS)
	}

	// Check if the wallet file exists
	if _, err := os.Stat(walletPath); os.IsNotExist(err) {
		return fmt.Errorf("wallet file does not exist at path: %s", walletPath)
	}

	// Attempt to delete the wallet file
	if err := os.Remove(walletPath); err != nil {
		return fmt.Errorf("failed to delete wallet at path %s: %v", walletPath, err)
	}

	fmt.Println("Wallet deleted successfully.")
	return nil
}

func CallBtcctlCmd(cmdStr string) (string, error) {
    rpcUser := "user"
    rpcPass := "password"
    rpcServer := "127.0.0.1:8332"

    rootPath, err := getExePath()
    if err != nil {
        return "", fmt.Errorf("failed to get executable path: %v", err)
    }

    btcctlPath := filepath.Join(rootPath, "btcd", "cmd", "btcctl", "btcctl")
    fmt.Printf("Executing btcctl at path: %s\n", btcctlPath)

    if _, err := os.Stat(btcctlPath); os.IsNotExist(err) {
        return "", fmt.Errorf("btcctl binary not found at %s", btcctlPath)
    }

    // Add flags before the command itself
    params := []string{
        "--wallet",
        "--rpcuser=" + rpcUser,
        "--rpcpass=" + rpcPass,
        "--rpcserver=" + rpcServer,
        "--notls",
    }

    params = append(params, strings.Split(cmdStr, " ")...)

    fmt.Printf("Executing command: %s %s\n", btcctlPath, strings.Join(params, " "))

    cmd := exec.Command(btcctlPath, params...)
    output, err := cmd.CombinedOutput()
    if err != nil {
        return "", fmt.Errorf("failed to execute btcctl command: %v, output: %s", err, string(output))
    }

    return strings.TrimSpace(string(output)), nil
}


// streamOutput reads the output from a command pipe and prints it with a prefix
func streamOutput(r io.Reader, prefix string) {
	scanner := bufio.NewScanner(r)
	for scanner.Scan() {
		fmt.Printf("[%s] %s\n", prefix, scanner.Text())
	}
	if err := scanner.Err(); err != nil {
		fmt.Printf("Error reading %s stream: %v\n", prefix, err)
	}
}


// ValidateAddress checks if the given address is valid
func ValidateAddress(address string) (bool, error) {
    cmd := fmt.Sprintf("validateaddress %s", address)
    output, err := CallBtcctlCmd(cmd)
    if err != nil {
        return false, fmt.Errorf("failed to validate address: %v", err)
    }

    // Parse the output to check if the address is valid
    return strings.Contains(output, `"isvalid": true`), nil
}

// ParseBalanceAndAmount parses balance and amount strings into float64
func ParseBalanceAndAmount(balanceStr, amountStr string) (float64, float64, error) {
    balance, err := strconv.ParseFloat(balanceStr, 64)
    if err != nil {
        return 0, 0, fmt.Errorf("invalid balance format: %v", err)
    }

    amount, err := strconv.ParseFloat(amountStr, 64)
    if err != nil {
        return 0, 0, fmt.Errorf("invalid amount format: %v", err)
    }

    return balance, amount, nil
}

// KillProcesses forcefully kills both btcd and btcwallet processes
func KillProcesses() error {
	// Kill btcd process
	if orcaNetCmd != nil && orcaNetCmd.Process != nil {
		if err := orcaNetCmd.Process.Kill(); err != nil {
			return fmt.Errorf("failed to kill btcd process: %v", err)
		}
		fmt.Println("Killed btcd process.")
	}

	// Kill btcwallet process
	if walletCmd != nil && walletCmd.Process != nil {
		if err := walletCmd.Process.Kill(); err != nil {
			return fmt.Errorf("failed to kill btcwallet process: %v", err)
		}
		fmt.Println("Killed btcwallet process.")
	}

	return nil
}
