// Author: Kevin Lai
// This file contains the functions for sending and receiving chunks and metadata between nodes.
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	dht "github.com/libp2p/go-libp2p-kad-dht"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/peer"
)

// File struct for file data
type FileData struct {
	FileName string
	FileSize int
}

// FileRequest struct for file request data
type FileRequest struct {
	FileHash              string
	RequesterID           string
	RequesterMultiAddress string
	timeSent              time.Time
}

// MetaData struct for file metadata
type MetaData struct {
	FileName      string
	FileSize      int
	Multiaddress  string
	PeerID        string
	PeerPublicKey string
}

// Find a peer in orcanet and connect to it. Returns the peer's multiaddress.
// context: the context for the operation
// orcaDHT: the DHT to search for the peer
// node: the source node
// peerID: the target peer's ID
func findPeerAndConnect(context context.Context, orcaDHT *dht.IpfsDHT, node host.Host, peerID string) (peerMultiAddress string, err error) {
	// Get multiaddress of peer
	decodedPeerID, err := peer.Decode(peerID)
	if err != nil {
		return "ERROR", err
	}
	peerInfo, err := orcaDHT.FindPeer(context, decodedPeerID)
	if err != nil {
		err := fmt.Errorf("findPeerAndConnect: Error occured while finding peer: %v", err)
		return "ERROR", err
	}
	peerMultiAddress = peerInfo.Addrs[0].String()
	fullMultiAddress := fmt.Sprintf("%s/p2p/%s", peerMultiAddress, peerID)
	err = connectToNode(node, fullMultiAddress)
	if err != nil {
		err := fmt.Errorf("findPeerAndConnect: Error occured while connecting to peer during: %v", err)
		return "ERROR", err
	}
	return fullMultiAddress, nil
}

// Send a file request to a peer from a given node. This function assumes peer is already connected. Use in conjunction with findPeerAndConnect.
// context: the context for the operation
// fullPeerMultiAddress: the target peer's multiaddress
// node: the source node
// fileName: the name of the file to request
func sendFileRequestToPeer(
	context context.Context,
	node host.Host,
	targetNodeMultiAddr string,
	fileHash string) (err error) {
	// Parse the peerID from the multiaddress
	decodedPeerID, err := peer.Decode(targetNodeMultiAddr)
	if err != nil {
		return fmt.Errorf("sendFileRequestToPeer: failed to decode peerID: %v", err)
	}

	// Create a new stream to the target peer
	stream, err := node.NewStream(context, decodedPeerID, "/fileshare/requestFile")
	if err != nil {
		return fmt.Errorf("sendFileRequestToPeer: failed to open stream: %v", err)
	}
	defer stream.Close()

	// Get the source node's multiaddress
	sourceMultiAddress := node.Addrs()[0].String()

	// Get the source node's ID
	sourceID := node.ID().String()

	// Create file request struct
	fileRequest := FileRequest{
		FileHash:              fileHash,
		RequesterID:           sourceID,
		RequesterMultiAddress: sourceMultiAddress,
		timeSent:              time.Now(),
	}

	// Write the file request to the stream
	fileRequestBytes, err := json.Marshal(fileRequest)
	if err != nil {
		return fmt.Errorf("sendFileRequestToPeer: failed to marshal file request to JSON: %v", err)
	}
	_, err = stream.Write(fileRequestBytes)
	if err != nil {
		return fmt.Errorf("sendFileRequestToPeer: failed to write file request to stream: %v", err)
	}

	// Close the stream
	err = stream.Close()
	if err != nil {
		return fmt.Errorf("sendFileRequestToPeer: failed to close stream: %v", err)
	}

	return nil
}

// Send a file to a peer from a given node. This function assumes peer is already connected. Use in conjunction with findPeerAndConnect.
// context: the context for the operation
// fullPeerMultiAddress: the target peer's multiaddress
// node: the source node
// filepath: the path to the file to send
func sendFileToPeer(context context.Context, fullPeerMultiAddress string, node host.Host, filepath string) (err error) {
	// Parse the peerID from the multiaddress
	decodedPeerID, err := peer.Decode(fullPeerMultiAddress)
	if err != nil {
		return fmt.Errorf("sendFileToPeer: failed to decode peerID: %v", err)
	}

	// Create a new stream to the target peer
	stream, err := node.NewStream(context, decodedPeerID, "/fileshare/sendFile")
	if err != nil {
		return fmt.Errorf("sendFileToPeer: failed to open stream: %v", err)
	}
	defer stream.Close()

	// Get the file size
	fileInfo, err := os.Stat(filepath)
	if err != nil {
		return fmt.Errorf("sendFileToPeer: failed to get file size: %v", err)
	}
	fileSize := fileInfo.Size()

	// Get the file name
	fileName := fileInfo.Name()

	// Create file struct
	fileHeader := FileData{
		FileName: fileName,
		FileSize: int(fileSize),
	}

	// Convert the file header to JSON
	fileHeaderBytes, err := json.Marshal(fileHeader)
	if err != nil {
		return fmt.Errorf("sendFileToPeer: failed to marshal file to JSON: %v", err)
	}

	// Write the file header to the stream
	_, err = stream.Write(fileHeaderBytes)
	if err != nil {
		return fmt.Errorf("sendFileToPeer: failed to write file to stream: %v", err)
	}

	// Open the file and store it in a buffer
	file, err := os.Open(filepath)
	if err != nil {
		return fmt.Errorf("sendFileToPeer: failed to open file: %v", err)
	}
	defer file.Close()

	// Create a buffer to store the file data
	buffer := make([]byte, 1024)
	for {
		// Read the file data into the buffer
		bytesRead, err := file.Read(buffer)
		if err != nil {
			if err.Error() == "EOF" {
				break
			}
			return fmt.Errorf("sendFileToPeer: failed to read file: %v", err)
		}

		// Write the buffer to the stream
		_, err = stream.Write(buffer[:bytesRead])
		if err != nil {
			return fmt.Errorf("sendFileToPeer: failed to write buffer to stream: %v", err)
		}

	}

	// Close the stream
	err = stream.Close()
	if err != nil {
		return fmt.Errorf("sendFileToPeer: failed to close stream: %v", err)
	}

	return nil
}

// Send file and source node metadata to a peer from a given node. This function assumes peer is already connected. Use in conjunction with findPeerAndConnect.
// context: the context for the operation
// orcaDHT: the DHT to search for the peer
// node: the source node
// peerID: the target peer's ID
func sendFileMetaDataToPeer(context context.Context, fullPeerMultiAddress string, node host.Host, filepath string) (err error) {
	// Parse the peerID from the multiaddress
	decodedPeerID, err := peer.Decode(fullPeerMultiAddress)
	if err != nil {
		return fmt.Errorf("sendFileToPeer: failed to decode peerID: %v", err)
	}

	// Create a new stream to the target peer
	stream, err := node.NewStream(context, decodedPeerID, "/fileshare/sendFile")
	if err != nil {
		return fmt.Errorf("sendFileToPeer: failed to open stream: %v", err)
	}
	defer stream.Close()

	// Get the file size
	fileInfo, err := os.Stat(filepath)
	if err != nil {
		return fmt.Errorf("sendFileToPeer: failed to get file size: %v", err)
	}
	fileSize := fileInfo.Size()

	// Get the file name
	fileName := fileInfo.Name()

	// Get the source node's multiaddress
	sourceMultiAddress := node.Addrs()[0].String()

	// Get the source node's ID
	sourceID := node.ID().String()

	// Get the source node's public key
	pubKeyBytes, err := node.Peerstore().PubKey(node.ID()).Raw()
	if err != nil {
		return fmt.Errorf("sendFileMetaDataToPeer: failed to get raw public key: %v", err)
	}
	sourcePublicKey := fmt.Sprintf("%x", pubKeyBytes)

	// Create metadata struct
	metaData := MetaData{
		FileName:      fileName,
		FileSize:      int(fileSize),
		Multiaddress:  sourceMultiAddress,
		PeerID:        sourceID,
		PeerPublicKey: sourcePublicKey,
	}

	// Convert metadata to JSON
	metaDataBytes, err := json.Marshal(metaData)
	if err != nil {
		return fmt.Errorf("sendFileMetaDataToPeer: failed to marshal metadata to JSON: %v", err)
	}

	// Write the metadata to the stream as JSON
	_, err = stream.Write(metaDataBytes)
	if err != nil {
		return fmt.Errorf("sendFileMetaDataToPeer: failed to write metadata to stream: %v", err)
	}

	// Close the stream
	err = stream.Close()
	if err != nil {
		return fmt.Errorf("sendFileMetaDataToPeer: failed to close stream: %v", err)
	}

	return nil
}
