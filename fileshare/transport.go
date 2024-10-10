// Author: Kevin Lai
// This file contains the functions for sending and receiving chunks and metadata between nodes.
package main

import (
	"context"
	"encoding/binary"
	"fmt"

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

// Send chunks to a peer from a given node. This function assumes peer is already connected.
func sendChunksToPeer(context context.Context, fullPeerMultiAddress string, node host.Host, chunks []Chunk) (err error) {
	// Parse peer peerID from multiaddress
	decodedPeerID, err := peer.Decode(fullPeerMultiAddress)

	// Create a new stream to the target peer
	stream, err := node.NewStream(context, decodedPeerID, "/fileshare/sendChunks")
	if err != nil {
		return fmt.Errorf("failed to open stream: %v", err)
	}
	defer stream.Close()

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

		// Write the chunk data
		_, err = stream.Write(chunk.Data)
		if err != nil {
			return fmt.Errorf("failed to write to stream: %v", err)
		}
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
