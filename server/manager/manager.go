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
    "github.com/creack/pty"
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
    
    // Arguments to start btcd with custom configurations
    args := []string{
        "--rpcuser=" + rpcUser,
        "--rpcpass=" + rpcPass,
        "--notls",                   // Disable TLS (for local testing only; secure in production)
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

func OpenWallet(password string) error {
    rootPath, err := getExePath()
    if err != nil {
        return err
    }
    walletPath := filepath.Join(rootPath, "btcwallet", "btcwallet")

    // Check if the wallet binary exists
    if _, err = os.Stat(walletPath); os.IsNotExist(err) {
        return fmt.Errorf("Wallet binary not found at %s", walletPath)
    }

    // Start the wallet process with the appropriate arguments
    walletCmd = exec.Command(walletPath, "--password="+password)
    stdout, err := walletCmd.StdoutPipe()
    if err != nil {
        return fmt.Errorf("failed to create stdout pipe: %v", err)
    }
    stderr, err := walletCmd.StderrPipe()
    if err != nil {
        return fmt.Errorf("failed to create stderr pipe: %v", err)
    }

    // Start the wallet process
    if err := walletCmd.Start(); err != nil {
        return fmt.Errorf("failed to open wallet: %v", err)
    }

    go streamOutput(stdout, "btcwallet")
    go streamOutput(stderr, "btcwallet error")

    fmt.Println("Wallet opened successfully.")
    return nil
}

func CreateWallet(password string) (string, error) {
    // Determine paths
    rootPath, err := getExePath()
    if err != nil {
        return "", fmt.Errorf("failed to get root path: %v", err)
    }
    walletPath := filepath.Join(rootPath, "btcwallet", "btcwallet")

    // Check for wallet binary
    if _, err = os.Stat(walletPath); os.IsNotExist(err) {
        return "", fmt.Errorf("btcwallet binary not found at %s", walletPath)
    }

    // Prepare command with --create flag
    walletCmd := exec.Command(walletPath, "--create")

    // Create a pseudo-terminal for the command
    ptmx, err := pty.Start(walletCmd)
    if err != nil {
        return "", fmt.Errorf("failed to start wallet creation with pty: %v", err)
    }
    defer ptmx.Close() // Close the pty at the end

    // Goroutine to capture output and parse the seed
    go func() {
        scanner := bufio.NewScanner(ptmx)
        for scanner.Scan() {
            line := scanner.Text()
            fmt.Println(line) // Print output for logging/debugging
        }
    }()

    // Send password, "no" responses
    go func() {
        time.Sleep(1 * time.Second)
        fmt.Fprintln(ptmx, password) // First password prompt
        time.Sleep(1 * time.Second)
        fmt.Fprintln(ptmx, password) // Confirm password prompt
        time.Sleep(1 * time.Second)
        fmt.Fprintln(ptmx, "no")     // Additional encryption prompt
        time.Sleep(1 * time.Second)
        fmt.Fprintln(ptmx, "no")     // Existing seed prompt
        fmt.Fprintln(ptmx, "OK")    // Final OK prompt to create the wallet
    }()

    // Wait for the wallet creation to complete
    if err := walletCmd.Wait(); err != nil {
        return "", fmt.Errorf("wallet creation failed: %v", err)
    }

    fmt.Println("Wallet created successfully with automated inputs.")
    return "",nil
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
    rpcConnect := "127.0.0.1:8334" 
    
    args := []string{
        "--btcdusername=" + btcdUser,
        "--btcdpassword=" + btcdPass,
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
		return fmt.Errorf("failed to start wallet: %v", err)
	}

    go streamOutput(stdout, "btcwallet")
    go streamOutput(stderr, "btcwallet error")

	fmt.Println("Wallet started successfully!!")
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



// // ReadRPCInfo reads the rpcuser and rpcpass values from btcd.conf located in the user's home directory
// func readRPCInfo() ([]string, error) {
//     // Get the user's home directory
//     homeDir, err := os.UserHomeDir()
//     if err != nil {
//         return nil, fmt.Errorf("unable to determine home directory: %v", err)
//     }

//     // Construct the path to ~/.btcd/btcd.conf
//     confPath := filepath.Join(homeDir, ".btcd", "btcd.conf")

//     // Read the content of the configuration file
//     body, err := os.ReadFile(confPath)
//     if err != nil {
//         return nil, fmt.Errorf("error reading btcd.conf file at %s: %v", confPath, err)
//     }

//     var rpcInfo []string
//     lines := strings.Split(string(body), "\n")
//     for _, line := range lines {
//         // Check if the line has either "rpcuser" or "rpcpass"
//         if strings.HasPrefix(line, "rpcuser") || strings.HasPrefix(line, "rpcpass") {
//             parts := strings.Split(line, "=")
//             if len(parts) == 2 {
//                 rpcInfo = append(rpcInfo, strings.TrimSpace(parts[1]))
//             }
//         }
//     }

//     // Ensure both rpcuser and rpcpass were found
//     if len(rpcInfo) < 2 {
//         return nil, fmt.Errorf("incomplete RPC information in btcd.conf: missing rpcuser or rpcpass")
//     }
//     return rpcInfo, nil
// }

// CallBtcctlCmd executes a btcctl command with the necessary RPC credentials and returns the output
func CallBtcctlCmd(cmdStr string) (string, error) {
    // Hardcoded RPC credentials and connection details
    rpcUser := "user"      // Replace with your actual RPC user
    rpcPass := "password"  // Replace with your actual RPC password
    rpcServer := "127.0.0.1:8334" // Replace with your actual RPC connection (default port for btcd is 8334)

    // Determine the project root path using getExePath
    rootPath, err := getExePath()
    if err != nil {
        return "", fmt.Errorf("failed to get executable path: %v", err)
    }

    // Construct the full path to btcctl binary within btcd/cmd/btcctl
    btcctlPath := filepath.Join(rootPath, "btcd", "cmd", "btcctl", "btcctl")
    fmt.Printf("Executing btcctl at path: %s\n", btcctlPath) // Debugging statement to verify path

    // Check if the btcctl binary exists
    if _, err := os.Stat(btcctlPath); os.IsNotExist(err) {
        return "", fmt.Errorf("btcctl binary not found at %s", btcctlPath)
    }

    // Split command string into arguments and add hardcoded RPC credentials and connection flags
    params := strings.Split(cmdStr, " ")
    params = append(params,
        "--wallet",
        "--rpcuser="+rpcUser,
        "--rpcpass="+rpcPass,
        "--rpcserver="+rpcServer,
        "--notls", // Optional, only use in development if TLS is disabled
    )

    // Execute the btcctl command with the constructed parameters
    cmd := exec.Command(btcctlPath, params...)
    output, err := cmd.CombinedOutput() // CombinedOutput captures both stdout and stderr
    if err != nil {
        return "", fmt.Errorf("failed to execute btcctl command: %v, output: %s", err, string(output))
    }

    return strings.TrimSpace(string(output)), nil
}