package main

import (
	"crypto/sha256"
	"fmt"
	"io"
	"log"
	"os"
	"strings"

	"github.com/google/uuid"
)

func generateFileHash(filepath string) string {
	file, err := os.Open(filepath)
	if err != nil {
		fmt.Println("Error opening file: ", err)
	}
	defer file.Close()

	hash := sha256.New()

	if _, err := io.Copy(hash, file); err != nil {
		return "error"
	}

	fileHash := fmt.Sprintf("%x", hash.Sum(nil))

	return fileHash
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
	fmt.Printf("File found at peerID: %s\n", res)

	return string(res), nil
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
