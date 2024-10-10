// Author: Kevin Lai
// This file contains the main logic for starting the node and connecting to the relay
// and bootstrap node.
package main

import (
	"bufio"
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"

	libp2p "github.com/libp2p/go-libp2p"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	record "github.com/libp2p/go-libp2p-record"
	"github.com/libp2p/go-libp2p/core/crypto"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/network"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/libp2p/go-libp2p/core/peerstore"
	"github.com/libp2p/go-libp2p/p2p/protocol/circuitv2/client"
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
func createNode(mode dht.ModeOpt) (host.Host, *dht.IpfsDHT, error) {
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

// Connects to the target node through the relay node with the given targetPeerID
func connectToNodeUsingRelay(node host.Host, targetPeerID string) error {
	context := globalCtx

	// Parse the target peer ID and create a multiaddress for the relay
	targetPeerID = strings.TrimSpace(targetPeerID)
	relayAddr, err := ma.NewMultiaddr(RELAY_NODE_MULTIADDR)
	if err != nil {
		fmt.Errorf("Failed to create relay multiaddr: %v", err)
		return err
	}

	peerMultiaddr := relayAddr.Encapsulate(ma.StringCast("/p2p-circuit/p2p/" + targetPeerID))

	relayedAddrInfo, err := peer.AddrInfoFromP2pAddr(peerMultiaddr)
	if err != nil {
		fmt.Errorf("Failed to get relayed AddrInfo: %w", err)
		return err
	}

	// Connect to the peer through the relay
	err = node.Connect(context, *relayedAddrInfo)
	if err != nil {
		fmt.Errorf("Failed to connect to peer through relay: %w", err)
		return err
	}

	fmt.Printf("Connected to peer via relay: %s\n", targetPeerID)
	return nil
}

// Handler for peer exchange with given node and relay using streams
func handlePeerExhangeWithRelay(node host.Host) error {
	relayAddr, err := ma.NewMultiaddr(RELAY_NODE_MULTIADDR)
	if err != nil {
		fmt.Errorf("Failed to create relay multiaddr: %v", err)
		return err
	}
	relayInfo, err := peer.AddrInfoFromP2pAddr(relayAddr)
	if err != nil {
		fmt.Errorf("Failed to get relay AddrInfo: %w", err)
		return err
	}

	// Set up a stream to the relay
	node.SetStreamHandler("/orcanet/p2p", func(stream network.Stream) {
		defer stream.Close()

		buffer := bufio.NewReader(stream)
		peerAddress, err := buffer.ReadString('\n')
		if err != nil {
			if err != io.EOF {
				fmt.Errorf("EOF: Failed to read peer address: %w", err)
			}
			fmt.Errorf("Failed to read peer address: %w", err)
		}
		peerAddress = strings.TrimSpace(peerAddress)
		var data map[string]interface{}
		err = json.Unmarshal([]byte(peerAddress), &data)
		if err != nil {
			fmt.Errorf("Failed to unmarshal during relay exhange: %w", err)
		}
		if knownPeers, ok := data["known_peers"].([]interface{}); ok {
			for _, peer := range knownPeers {
				fmt.Println("Peer:")
				if peerMap, ok := peer.(map[string]interface{}); ok {
					if peerID, ok := peerMap["peer_id"].(string); ok {
						if string(peerID) != string(relayInfo.ID) {
							connectToNodeUsingRelay(node, peerID)
						}
					}
				}
			}
		}

	})

	return nil
}

// Make reservation on the relay node
func makeReservation(node host.Host) error {
	context := globalCtx
	relayAddress, err := ma.NewMultiaddr(RELAY_NODE_MULTIADDR)
	if err != nil {
		fmt.Errorf("Failed to create relay multiaddr: %v", err)
		return err
	}
	relayInfo, err := peer.AddrInfoFromP2pAddr(relayAddress)
	if err != nil {
		fmt.Errorf("Failed to create relay address: %v", err)
		return err
	}
	_, err = client.Reserve(context, node, *relayInfo)
	if err != nil {
		fmt.Errorf("Failed to make reservation on relay: %v", err)
		return err
	}
	return nil
}

// Handle input from stdio
func handleInput(context context.Context, orcaDHT *dht.IpfsDHT) {
	reader := bufio.NewReader(os.Stdin)
	for {
		fmt.Print("Enter peer ID to connect to: ")

		// TODO: REPLACE THIS
		peerID, err := reader.ReadString('\n')
		if err != nil {
			fmt.Errorf("Error occured while reading input: %v", err)
			return
		}
		peerID = strings.TrimSpace(peerID)
		if peerID == "" {
			fmt.Println("Invalid peer ID")
			continue
		}
		peerID = strings.TrimSpace(peerID)
		connectToNodeUsingRelay(node, peerID)
	}
}

func main() {
	// Start node
	node, orcaDHT, err := createNode(dht.ModeAuto)
	if err != nil {
		fmt.Errorf("Error occured while creating node: %v", err)
		return
	}

	// Create context for the application
	contex, cancel := context.WithCancel(context.Background())
	defer cancel()
	globalCtx = contex

	// Connect to relay node and bootstrap node
	err = connectToNode(node, RELAY_NODE_MULTIADDR)
	if err != nil {
		fmt.Errorf("Error occured while connecting to relay node: %v", err)
		return
	}
	err = makeReservation(node)
	if err != nil {
		fmt.Errorf("Error occured while making reservation: %v", err)
		return
	}
	err = connectToNode(node, BOOTSTRAP_NODE_MULTIADDR)
	if err != nil {
		fmt.Errorf("Error occured while connecting to bootstrap node: %v", err)
		return
	}

	go handlePeerExhangeWithRelay(node)

	// Keep the node running until the user exits
	go handleInput(contex, orcaDHT)

	defer node.Close()

	select {}
}
