// Author: Kevin Lai
// Bitshare is a library for sending and receiving files.
package main

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"strings"
	"time"

	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/network"
	"github.com/libp2p/go-libp2p/core/peer"
	ma "github.com/multiformats/go-multiaddr"
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

// Listens for incoming file requests from peers
func receiveFileRequests(node host.Host) {
	node.SetStreamHandler("/senddata/p2p", func(stream network.Stream) {
		defer stream.Close()

		buffer := bufio.NewReader(stream)

		data, err := buffer.ReadBytes('\n') // Reads until a newline character
		if err != nil {
			if err == io.EOF {
				log.Printf("Stream closed by peer: %s", stream.Conn().RemotePeer())
			} else {
				log.Printf("Error reading from stream: %v", err)
			}
			return
		}
		// Print the received data
		log.Printf("Received data: %s", data)
	})
}

func sendFileRequestToPeer(node host.Host, targetNodeId string, fileHash string) error {
	var ctx = context.Background()
	targetPeerID := strings.TrimSpace(targetNodeId)
	relayAddr, err := ma.NewMultiaddr(RELAY_NODE_MULTIADDR)
	if err != nil {
		log.Printf("Failed to create relay multiaddr: %v", err)
	}
	peerMultiaddr := relayAddr.Encapsulate(ma.StringCast("/p2p-circuit/p2p/" + targetPeerID))

	peerinfo, err := peer.AddrInfoFromP2pAddr(peerMultiaddr)
	if err != nil {
		return fmt.Errorf("failed to parse peer address: %s", err)
	}
	if err := node.Connect(ctx, *peerinfo); err != nil {
		return fmt.Errorf("failed to connect to peer %s via relay: %v", peerinfo.ID, err)
	}
	stream, err := node.NewStream(network.WithAllowLimitedConn(ctx, "/senddata/p2p"), peerinfo.ID, "/senddata/p2p")
	if err != nil {
		return fmt.Errorf("failed to open stream to %s: %s", peerinfo.ID, err)
	}
	defer stream.Close()

	sourceID := node.ID().String()
	sourceMultiAddress := node.Addrs()[0].String()

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
	stream, err := node.NewStream(context, decodedPeerID, "/orcanet/fileshare/sendFile")
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
