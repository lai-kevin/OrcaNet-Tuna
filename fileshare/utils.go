package main

import (
	"crypto/sha256"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
)

func generateFileHash(filepath string) (string, error) {
	file, err := os.Open(filepath)
	if err != nil {
		fmt.Println("Error opening file: ", err)
		return "", err
	}
	defer file.Close()

	hash := sha256.New()

	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}

	fileHash := fmt.Sprintf("%x", hash.Sum(nil))

	return fileHash, nil
}

func generateRequestID() string {
	id := uuid.New()
	return id.String()
}

func searchFileOnDHT(fileHash string) (string, error) {
	dhtKey := "/orcanet/" + fileHash

	log.Println("Searching for file hash: ", dhtKey)
	res, err := globalOrcaDHT.GetValue(globalCtx, dhtKey)
	if err != nil {
		fmt.Printf("Failed to get existing value associated with file hash: %s\n", fileHash)
		return "", nil
	}

	// Remove duplicate providers
	providers := strings.Split(string(res), ",")
	uniqueProviders := make(map[string]bool)

	for _, provider := range providers {
		if _, exists := uniqueProviders[provider]; !exists {
			uniqueProviders[provider] = true
		}
	}
	providers = []string{}
	for provider := range uniqueProviders {
		providers = append(providers, provider)
	}

	providersStr := strings.Join(providers, ",")

	fmt.Printf("File found at peerID: %s\n", providersStr)

	return string(providersStr), nil
}

func provideFileOnDHT(fileHash string, peerID string) error {
	dhtKey := "/orcanet/" + fileHash

	fmt.Println("Updating DHT with key: ", dhtKey)

	res, err := searchFileOnDHT(fileHash)
	if err != nil {
		return err
	}

	providers := strings.Split(string(res), ",")
	providers = append(providers, peerID)
	providersStr := strings.Join(providers, ",")

	err = globalOrcaDHT.PutValue(globalCtx, dhtKey, []byte(providersStr))
	if err != nil {
		return err
	}

	err = provideKey(globalCtx, globalOrcaDHT, fileHash)
	if err != nil {
		return err
	}

	return nil
}

func connectAndRequestFileFromPeer(fileHash string, requestID string, peerID string) error {
	// Connect to the peer
	providerPeerID := string(peerID)
	err := connectToNodeUsingRelay(globalNode, providerPeerID)
	if err != nil {
		return err
	}

	// Request the file from the peer
	err = sendFileRequestToPeer(globalNode, providerPeerID, fileHash, requestID)
	if err != nil {
		return err
	}

	return nil
}

func connectAndRequestFileMetaDataFromPeer(fileHash string, peerID string) error {
	// Connect to the peer
	providerPeerID := string(peerID)
	err := connectToNodeUsingRelay(globalNode, providerPeerID)
	if err != nil {
		return err
	}

	// Request the file metadata from the peer
	err = sendFileMetaDataRequestToPeer(globalNode, providerPeerID, fileHash)
	if err != nil {
		return err
	}

	return nil
}

func connectAndPauseRequestFromPeer(requestID string, status bool) error {
	transaction, ok := downloadHistory[requestID]
	if !ok {
		return fmt.Errorf("transaction does not exist for requestID %s", requestID)
	}

	// Connect to the peer
	err := connectToNodeUsingRelay(globalNode, transaction.FileMetaData.PeerID)
	if err != nil {
		return err
	}

	// Send the pause download request to the peer
	err = sendPauseRequestToPeer(globalNode, transaction.FileMetaData.PeerID, requestID, status)
	if err != nil {
		return err
	}

	return nil
}

func sendCoinToAddress(miningAddress string, amount float32) (string, error) {
	url := "http://host.docker.internal:8080/sendToAddress"
	method := "GET"

	payload := strings.NewReader(fmt.Sprintf(`{
		"address": "%s",
		"amount": "%.2f"
	}`, miningAddress, amount))

	client := &http.Client{}
	req, err := http.NewRequest(method, url, payload)

	if err != nil {
		return "", err
	}
	req.Header.Add("Content-Type", "application/json")

	res, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return "", errors.New("failed to send coin: " + res.Status)
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return "", err
	}

	var result map[string]string
	if err = json.Unmarshal(body, &result); err != nil {
		return "", err
	}

	log.Println("Sent coin to address: ", miningAddress)
	return result["txid"], err
}

func checkBalance() (string, error) {
	url := "http://host.docker.internal:8080/getBalance"
	method := "GET"
	client := &http.Client{}
	req, err := http.NewRequest(method, url, nil)

	if err != nil {
		return "", err
	}
	res, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return "", errors.New("failed to get balance: " + res.Status)
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return "", err
	}

	var result map[string]string
	if err = json.Unmarshal(body, &result); err != nil {
		return "", err
	}

	log.Println("Got Balance:", result["balance"])
	return result["balance"], nil
}

func getMiningAddress() (string, error) {
	url := "http://host.docker.internal:8080/getMiningAddress"
	method := "GET"
	client := &http.Client{}
	req, err := http.NewRequest(method, url, nil)

	if err != nil {
		return "", err
	}
	res, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return "", errors.New("failed to get mining address: " + res.Status)
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return "", err
	}

	log.Println("Response Body:", string(body))

	var result map[string]string
	if err = json.Unmarshal(body, &result); err != nil {
		return "", err
	}

	log.Println("Got Mining address:", result["miningAddress"])
	return result["miningAddress"], nil
}

func copyFromContainer(sourcePath, filename string) error {
	source, err := os.Open(sourcePath)
	if err != nil {
		return err
	}
	defer source.Close()

	destPath := filepath.Join("/"+"downloads", filename)
	destination, err := os.Create(destPath)
	if err != nil {
		return err
	}
	defer destination.Close()

	_, err = io.Copy(destination, source)
	return err
}
