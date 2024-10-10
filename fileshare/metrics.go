// This file contains metric operations for OrcaNet

package main

import (
	"github.com/libp2p/go-libp2p-core/peer"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	ma "github.com/multiformats/go-multiaddr"
)

type Metadata struct {
	peerID    string
	multiaddr ma.Multiaddr
	city      string
	state     string
	country   string
	isp       string
}

// Calculates the number of connected nodes in the network
func numberOfConnectedNodes(*dht.IpfsDHT) (chunks int) {
	return
}

// Calculates the number of files in the network
func numberOfFiles(orcaDHT *dht.IpfsDHT) (chunks int) {
	return
}

// Returns a hashmap of peerId and their metadata
func peerMetadata(orcaDHT *dht.IpfsDHT) map[peer.ID]string {
	return nil
}
