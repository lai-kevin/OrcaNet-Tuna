package main

import (
	"bytes"
	"context"
	"crypto/sha256"
	"fmt"

	libp2p "github.com/libp2p/go-libp2p"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	record "github.com/libp2p/go-libp2p-record"
	"github.com/libp2p/go-libp2p/core/crypto"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/network"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/libp2p/go-libp2p/core/peerstore"
	"github.com/libp2p/go-libp2p/p2p/protocol/circuitv2/relay"
	ma "github.com/multiformats/go-multiaddr"
)

// Hard coded values to connect to TA provided relay node and bootstrap node
// CHANGE AS NEEDED
const BOOTSTRAP_NODE_MULTIADDR = "/ip4/130.245.173.222/tcp/61000/p2p/12D3KooWQd1K1k8XA9xVEzSAu7HUCodC7LJB6uW5Kw4VwkRdstPE"
const RELAY_NODE_MULTIADDR = "/ip4/130.245.173.221/tcp/4001/p2p/12D3KooWDpJ7As7BWAwRMfu1VU2WCqNjvq387JEYKDBj4kx6nXTN"
const SBU_ID = "114433442"

// Global context for the application
var globalCtx context.Context

type PeerInfo struct {
	PeerID string `json:"peerID"`
}

func generatePrivateKeyFromSeed(seed string) (crypto.PrivKey, error) {
	hash := sha256.Sum256([]byte(seed))
	privateKey, _, err := crypto.GenerateEd25519Key(bytes.NewReader(hash[:]))
	if err != nil {
		fmt.Errorf("Error occured while generating private key: %v", err)
		return nil, err
	}
	return privateKey, nil
}

// Creates a new node in given mode. Use dht.ModeAuto to let the node decide the mode.
func createNode(mode dht.Mode) (host.Host, *dht.IpfsDHT, error) {
	context := context.Background()
	privateKey, err := generatePrivateKeyFromSeed(SBU_ID)
	if err != nil {
		return nil, nil, err
	}

	// Create multiaddress for custom address and relay address
	customAddress, err := ma.NewMultiaddr("/ip4/0.0.0.0/tcp/0")
	if err != nil {
		return nil, nil, err
	}
	relayAddress, err := ma.NewMultiaddr(RELAY_NODE_MULTIADDR)
	if err != nil {
		return nil, nil, err
	}
	relayInfo, err := peer.AddrInfoFromP2pAddr(relayAddress)
	if err != nil {
		return nil, nil, err
	}

	// Create host
	node, err := libp2p.New(
		libp2p.ListenAddrs(customAddress),
		libp2p.Identity(privateKey),
		libp2p.NATPortMap(),
		libp2p.EnableNATService(),
		libp2p.EnableAutoRelayWithStaticRelays([]peer.AddrInfo{*relayInfo}),
		libp2p.EnableRelayService(),
		libp2p.EnableHolePunching(),
	)
	if err != nil {
		fmt.Errorf("Error occured while creating node: %v", err)
		return nil, nil, err
	}

	// Create relay.
	// TODO: NOT SURE IF THIS IS NEEDED
	_, err = relay.New(node)
	if err != nil {
		fmt.Errorf("Error occured while creating relay: %v", err)
		return nil, nil, err
	}

	// Create DHT
	orcaDHT, err := dht.New(context, node, dht.Mode(mode))
	if err != nil {
		fmt.Errorf("Error occured while creating DHT: %v", err)
		return nil, nil, err
	}

	// Validators for DHT
	// TODO: Don't know what this does
	namespacedValidator := record.NamespacedValidator{
		"orcanet": &CustomValidator{}, // Add a custom validator for the "orcanet" namespace
	}

	orcaDHT.Validator = namespacedValidator // Configure the DHT to use the custom validator

	// Bootstrap the DHT
	err = orcaDHT.Bootstrap(context)
	if err != nil {
		fmt.Errorf("Error occured while bootstrapping DHT: %v", err)
		return nil, nil, err
	}

	// Notify the orca network that this node is online
	// TODO: NOT SURE IF THIS NETWORK STUFF IS NEEDED
	node.Network().Notify(&network.NotifyBundle{
		ConnectedF: func(n network.Network, conn network.Conn) {
			fmt.Printf("Notification: New peer connected %s\n", conn.RemotePeer().String())
		},
	})

	return node, orcaDHT, nil
}

// Connects to the target node with the given targetNodeAddress
func connectToNode(node host.Host, targetNodeAddress string) error {
	// Create multi address from targetNodeAddress
	targetNodeMultiAddr, err := ma.NewMultiaddr(targetNodeAddress)
	if err != nil {
		fmt.Errorf("Error occured while creating multi address: %v", err)
		return err
	}

	targetNodeInfo, err := peer.AddrInfoFromP2pAddr(targetNodeMultiAddr)
	if err != nil {
		fmt.Errorf("Error occured while creating peer address info: %v", err)
		return err
	}

	// Add the target node to the peerstore of the current node
	node.Peerstore().AddAddrs(targetNodeInfo.ID, targetNodeInfo.Addrs, peerstore.PermanentAddrTTL)
	err = node.Connect(context.Background(), *targetNodeInfo)
	if err != nil {
		fmt.Errorf("Error occured while connecting to target node: %v", err)
		return err
	}

	fmt.Println("Connected to target node: ", targetNodeInfo.ID)
	return nil
}
