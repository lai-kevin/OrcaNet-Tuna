package main

import (
	"crypto/sha256"
	"fmt"
	"io"
	"log"
	"os"
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

func provideFileOnDHT(fileHash string, peerID string) error {
	dhtKey := "/orcanet/" + fileHash

	fmt.Println("Updating DHT with file hash: ", dhtKey)

	err := globalOrcaDHT.PutValue(globalCtx, dhtKey, []byte(peerID))
	if err != nil {
		return err
	}

	provideKey(globalCtx, globalOrcaDHT, fileHash)

	return nil
}

func connectAndRequestFileFromPeer(fileHash string) error {
	dhtKey := "/orcanet/" + fileHash

	log.Println("Searching for file hash: ", dhtKey)
	res, err := globalOrcaDHT.GetValue(globalCtx, dhtKey)
	if err != nil {
		return err
	}
	fmt.Printf("File found at peerID: %s\n", res)

	// Connect to the peer
	providerPeerID := string(res)
	err = connectToNodeUsingRelay(globalNode, providerPeerID)
	if err != nil {
		return err
	}

	// Request the file from the peer
	err = sendFileRequestToPeer(globalNode, providerPeerID, fileHash)
	if err != nil {
		return err
	}

	return nil
}
