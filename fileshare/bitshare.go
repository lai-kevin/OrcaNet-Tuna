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
type FileDataHeader struct {
	FileName     string
	FileSize     int
	Multiaddress string
	PeerID       string
}

// FileRequest struct for file request data
type FileRequest struct {
	FileHash              string
	RequesterID           string
	RequesterMultiAddress string
	timeSent              time.Time
}

// Create a stream to a target node
func createStream(node host.Host, targetNodeId string) (network.Stream, error) {
	var ctx = context.Background()
	targetPeerID := strings.TrimSpace(targetNodeId)
	relayAddr, err := ma.NewMultiaddr(RELAY_NODE_MULTIADDR)
	if err != nil {
		return nil, fmt.Errorf("failed to create relay multiaddr: %v", err)
	}
	peerMultiaddr := relayAddr.Encapsulate(ma.StringCast("/p2p-circuit/p2p/" + targetPeerID))

	peerinfo, err := peer.AddrInfoFromP2pAddr(peerMultiaddr)
	if err != nil {
		return nil, fmt.Errorf("failed to parse peer address: %s", err)
	}
	if err := node.Connect(ctx, *peerinfo); err != nil {
		return nil, fmt.Errorf("failed to connect to peer %s via relay: %v", peerinfo.ID, err)
	}
	stream, err := node.NewStream(network.WithAllowLimitedConn(ctx, "/senddata/p2p"), peerinfo.ID, "/senddata/p2p")
	if err != nil {
		return nil, fmt.Errorf("failed to open stream to %s: %s", peerinfo.ID, err)
	}
	defer stream.Close()

	return stream, nil
}

// Listens for incoming file requests from peers
// node: the host node to listen for file requests on
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

// Send a file request to a peer from a given node.
// node: the node sending the file request
// targetNodeId: the ID of the target peer
// fileHash: the hash of the file to request
func sendFileRequestToPeer(node host.Host, targetNodeId string, fileHash string) error {
	stream, err := createStream(node, targetNodeId)
	if err != nil {
		return fmt.Errorf("sendFileRequestToPeer: %v", err)
	}

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

// Send a file to a peer from a given node.
// node: the host node sending the file
// targetNodeId: the ID of the target peer
// filepath: the path to the file to send
func sendFileToPeer(node host.Host, targetNodeId, filepath string) (err error) {
	stream, err := createStream(node, targetNodeId)

	// Create fileDataHeader struct
	fileInfo, err := os.Stat(filepath)
	if err != nil {
		return fmt.Errorf("sendFileToPeer: %v", err)
	}
	fileSize := fileInfo.Size()
	fileName := fileInfo.Name()

	fileHeader := FileDataHeader{
		FileName:     fileName,
		FileSize:     int(fileSize),
		Multiaddress: node.Addrs()[0].String(),
		PeerID:       node.ID().String(),
	}

	// Convert the file header to JSON
	fileHeaderBytes, err := json.Marshal(fileHeader)
	if err != nil {
		return fmt.Errorf("sendFileToPeer: %v", err)
	}

	// Write the file header to the stream
	_, err = stream.Write(fileHeaderBytes)
	if err != nil {
		return fmt.Errorf("sendFileToPeer: %v", err)
	}

	// Open the file and store it in a buffer
	file, err := os.Open(filepath)
	if err != nil {
		return fmt.Errorf("sendFileToPeer: %v", err)
	}
	defer file.Close()

	// Create a buffer to store the file data in chunks
	buffer := make([]byte, 1024)
	for {
		// Read the file data into the buffer/chunk
		bytesRead, err := file.Read(buffer)
		if err != nil {
			if err.Error() == "EOF" {
				break
			}
			return fmt.Errorf("sendFileToPeer: failed to read file: %v", err)
		}

		// Write the buffer/chunk to the stream
		_, err = stream.Write(buffer[:bytesRead])
		if err != nil {
			return fmt.Errorf("sendFileToPeer: failed to write buffer to stream: %v", err)
		}

	}

	// Close the stream
	err = stream.Close()
	if err != nil {
		return fmt.Errorf("sendFileToPeer: %v", err)
	}

	return nil
}

// Send file and source node metadata to a peer from a given node.
// node: the host node sending the file
// targetNodeId: the ID of the target peer
// filepath: the path to the file to send metadata for
func sendFileMetaDataToPeer(node host.Host, targetNodeId, filepath string) (err error) {
	stream, err := createStream(node, targetNodeId)
	if err != nil {
		return fmt.Errorf("sendFileMetaDataToPeer:  %v", err)
	}

	// Create fileDataHeader struct
	fileInfo, err := os.Stat(filepath)
	if err != nil {
		return fmt.Errorf("sendFileToPeer: %v", err)
	}

	fileSize := fileInfo.Size()
	fileName := fileInfo.Name()

	fileHeader := FileDataHeader{
		FileName:     fileName,
		FileSize:     int(fileSize),
		Multiaddress: node.Addrs()[0].String(),
		PeerID:       node.ID().String(),
	}

	// Convert metadata to JSON
	metaDataBytes, err := json.Marshal(fileHeader)
	if err != nil {
		return fmt.Errorf("sendFileMetaDataToPeer: %v", err)
	}

	// Write the metadata to the stream as JSON
	_, err = stream.Write(metaDataBytes)
	if err != nil {
		return fmt.Errorf("sendFileMetaDataToPeer: %v", err)
	}

	// Close the stream
	err = stream.Close()
	if err != nil {
		return fmt.Errorf("sendFileMetaDataToPeer: %v", err)
	}

	return nil
}
