// Author: Kevin Lai
// This file contains the functions for sending and receiving chunks and metadata between nodes.
package main

import (
	"context"
	"encoding/binary"
	"fmt"
	"io"
	"os"

	dht "github.com/libp2p/go-libp2p-kad-dht"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/peer"
)

type Chunk struct {
	CID  int
	Data []byte
}

// Find a peer in orcanet and connect to it. Returns the peer's multiaddress.
func findPeerAndConnect(context context.Context, orcaDHT *dht.IpfsDHT, node host.Host, peerID string) (peerMultiAddress string, err error) {
	// Get multiaddress of peer
	decodedPeerID, err := peer.Decode(peerID)
	if err != nil {
		return "ERROR", err
	}
	peerInfo, err := orcaDHT.FindPeer(context, decodedPeerID)
	peerMultiAddress = peerInfo.Addrs[0].String()
	fullMultiAddress := fmt.Sprintf("%s/p2p/%s", peerMultiAddress, peerID)
	err = connectToNode(node, fullMultiAddress)
	if err != nil {
		fmt.Errorf("findPeerAndConnect: Error occured while connecting to peer during: %v", err)
		return "ERROR", err
	}
	return fullMultiAddress, nil
}

// Send a file to a peer from a given node. This function assumes peer is already connected. Use in conjunction with findPeerAndConnect.
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

	// Write the file size to the stream
	fileSizeBytes := make([]byte, 8)
	binary.BigEndian.PutUint64(fileSizeBytes, uint64(fileSize))
	_, err = stream.Write(fileSizeBytes)
	if err != nil {
		return fmt.Errorf("sendFileToPeer: failed to write file size to stream: %v", err)
	}

	// Open the file and write it to the stream
	file, err := os.Open(filepath)
	if err != nil {
		return fmt.Errorf("sendFileToPeer: failed to open file: %v", err)
	}
	defer file.Close()

	_, err = io.Copy(stream, file)
	if err != nil {
		return fmt.Errorf("sendFileToPeer: failed to write file to stream: %v", err)
	}

	// Close the stream
	err = stream.Close()
	if err != nil {
		return fmt.Errorf("sendFileToPeer: failed to close stream: %v", err)
	}

	return nil
}

// Send chunks to a peer from a given node. This function assumes peer is already connected.
// WARNGING: THIS FUNCTION IS NOT TESTED AND MAY NOT BE SUPPORTED IN THE FINAL VERSION.
func sendChunksToPeer(context context.Context, fullPeerMultiAddress string, node host.Host, chunks []Chunk) (err error) {
	// Parse peer peerID from multiaddress
	decodedPeerID, err := peer.Decode(fullPeerMultiAddress)

	// Create a new stream to the target peer
	stream, err := node.NewStream(context, decodedPeerID, "/fileshare/sendChunks")
	if err != nil {
		return fmt.Errorf("failed to open stream: %v", err)
	}
	defer stream.Close()

	totalBytes := 0
	for _, chunk := range chunks {
		totalBytes += len(chunk.Data)
	}

	transferredBytes := 0

	// Send chunks to peer
	for _, chunk := range chunks {
		// Write the chunk CID to the stream
		cidBytes := make([]byte, 4)
		binary.BigEndian.PutUint32(cidBytes, uint32(chunk.CID))
		_, err = stream.Write(cidBytes)
		if err != nil {
			return fmt.Errorf("sendChunksToPeer: failed to write chunk CID to stream: %v", err)
		}

		// Write the chunk data length
		dataLengthBytes := make([]byte, 4)
		binary.BigEndian.PutUint32(dataLengthBytes, uint32(len(chunk.Data)))
		_, err = stream.Write(dataLengthBytes)
		if err != nil {
			return fmt.Errorf("sendChunksToPeer: failed to write chunk data length to stream: %v", err)
		}

		// Write total bytes to be transferred
		totalBytesBytes := make([]byte, 4)
		binary.BigEndian.PutUint32(totalBytesBytes, uint32(totalBytes))

		// Write the chunk data
		_, err = stream.Write(chunk.Data)
		if err != nil {
			return fmt.Errorf("failed to write to stream: %v", err)
		}

		// Update the number of transferred bytes
		transferredBytes += len(chunk.Data)
	}

}

func receiveChunksFromPeer(peerID string, chunkpath string) (err error) {
	return
}

func sendFileMetaDataToPeer(peerID string, filepath string) (err error) {
	return
}

func receiveFileMetaDataFromPeer(peerID string, filepath string) (err error) {
	return
}
