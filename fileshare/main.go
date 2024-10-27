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
	"log"
	"os"
	"strings"
	"time"

	"github.com/ipfs/go-cid"
	"github.com/libp2p/go-libp2p"
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
	"github.com/multiformats/go-multihash"
)

// Hard coded values to connect to TA provided relay node and bootstrap node
const BOOTSTRAP_NODE_MULTIADDR = "/ip4/130.245.173.222/tcp/61000/p2p/12D3KooWQd1K1k8XA9xVEzSAu7HUCodC7LJB6uW5Kw4VwkRdstPE"
const RELAY_NODE_MULTIADDR = "/ip4/130.245.173.221/tcp/4001/p2p/12D3KooWDpJ7As7BWAwRMfu1VU2WCqNjvq387JEYKDBj4kx6nXTN"
const DESKTOP_NODE_MULTIADDR = "/ip4/130.245.173.221/tcp/4001/p2p/12D3KooWDpJ7As7BWAwRMfu1VU2WCqNjvq387JEYKDBj4kx6nXTN/p2p-circuit/p2p/12D3KooWS9VBsbpZPzpxsK6by9LzFUsW62fHHk3owJGHRKWy4KnX"

var SBU_ID string

var DOWNLOAD_DIRECTORY = "downloads"

// Global context for the application
var globalCtx context.Context

var globalNode host.Host

// File hash to file type mapping
// This is used when a node is requesting a file and needs the file type for saving.
// This map is updated when a file is requested from the network.
var requestedFiles = make(map[string]FileRequest)

type PeerInfo struct {
	PeerID string `json:"peerID"`
}

func generatePrivateKeyFromSeed(seed string) (crypto.PrivKey, error) {
	hash := sha256.Sum256([]byte(seed))
	privateKey, _, err := crypto.GenerateEd25519Key(bytes.NewReader(hash[:]))
	if err != nil {
		err := fmt.Errorf("error occured while generating private key: %v", err)
		return nil, err
	}
	return privateKey, nil
}

// Creates a new node in given mode.
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
		err := fmt.Errorf("error occured while creating node: %v", err)
		return nil, nil, err
	}

	// Create relay
	_, err = relay.New(node)
	if err != nil {
		err := fmt.Errorf("error occured while creating relay: %v", err)
		return nil, nil, err
	}

	// Create DHT
	orcaDHT, err := dht.New(context, node, dht.Mode(mode))
	if err != nil {
		err := fmt.Errorf("error occured while creating DHT: %v", err)
		return nil, nil, err
	}

	// Validators for DHT
	namespacedValidator := record.NamespacedValidator{
		"orcanet": &CustomValidator{}, // Add a custom validator for the "orcanet" namespace
	}

	orcaDHT.Validator = namespacedValidator // Configure the DHT to use the custom validator

	// Bootstrap the DHT
	err = orcaDHT.Bootstrap(context)
	if err != nil {
		err := fmt.Errorf("error occured while bootstrapping DHT: %v", err)
		return nil, nil, err
	}

	// Notify this peer when a new peer connects
	node.Network().Notify(&network.NotifyBundle{
		ConnectedF: func(n network.Network, conn network.Conn) {
			log.Printf("Notification: New peer connected %s\n", conn.RemotePeer().String())
		},
		DisconnectedF: func(n network.Network, conn network.Conn) {
			log.Printf("Disconnected from: %s", conn.RemotePeer())
		},
	})

	return node, orcaDHT, nil
}

// Connects to the target node with the given targetNodeAddress
func connectToNode(node host.Host, targetNodeAddress string) error {
	// Create multi address from targetNodeAddress
	targetNodeMultiAddr, err := ma.NewMultiaddr(targetNodeAddress)
	if err != nil {
		err = fmt.Errorf("error occured while creating multi address: %v", err)
		return err
	}

	targetNodeInfo, err := peer.AddrInfoFromP2pAddr(targetNodeMultiAddr)
	if err != nil {
		err = fmt.Errorf("error occured while creating peer address info: %v", err)
		return err
	}

	// Add the target node to the peerstore of the current node
	node.Peerstore().AddAddrs(targetNodeInfo.ID, targetNodeInfo.Addrs, peerstore.PermanentAddrTTL)
	err = node.Connect(context.Background(), *targetNodeInfo)
	if err != nil {
		err = fmt.Errorf("error occured while connecting to target node: %v", err)
		return err
	}

	log.Println("Connected to: ", targetNodeInfo.ID)

	return nil
}

// Connects to the target node through the relay node with the given targetPeerID
func connectToNodeUsingRelay(node host.Host, targetPeerID string) error {
	context := globalCtx

	// Parse the target peer ID and create a multiaddress for the relay
	targetPeerID = strings.TrimSpace(targetPeerID)
	relayAddr, err := ma.NewMultiaddr(RELAY_NODE_MULTIADDR)
	if err != nil {
		err := fmt.Errorf("failed to create relay multiaddr: %v", err)
		return err
	}

	peerMultiaddr := relayAddr.Encapsulate(ma.StringCast("/p2p-circuit/p2p/" + targetPeerID))

	relayedAddrInfo, err := peer.AddrInfoFromP2pAddr(peerMultiaddr)
	if err != nil {
		err := fmt.Errorf("failed to get relayed AddrInfo: %w", err)
		return err
	}

	// Connect to the peer through the relay
	err = node.Connect(context, *relayedAddrInfo)
	if err != nil {
		err := fmt.Errorf("failed to connect to peer through relay: %w", err)
		return err
	}

	log.Printf("connectToNodeUsingRelay: %s is connected via relay", targetPeerID)

	return nil
}

// Handler for peer exchange with given node and relay using streams
func handlePeerExhangeWithRelay(node host.Host) error {
	relayAddr, err := ma.NewMultiaddr(RELAY_NODE_MULTIADDR)
	if err != nil {
		err := fmt.Errorf("failed to create relay multiaddr: %v", err)
		return err
	}
	relayInfo, err := peer.AddrInfoFromP2pAddr(relayAddr)
	if err != nil {
		err := fmt.Errorf("failed to get relay AddrInfo: %w", err)
		return err
	}

	// Set up a stream to the relay
	node.SetStreamHandler("/orcanet/p2p", func(stream network.Stream) {
		defer stream.Close()

		buffer := bufio.NewReader(stream)
		peerAddress, err := buffer.ReadString('\n')
		if err != nil {
			if err != io.EOF {
				log.Printf("EOF: Failed to read peer address\n")
			}

			// Ignore EOF
		}
		peerAddress = strings.TrimSpace(peerAddress)
		var data map[string]interface{}
		err = json.Unmarshal([]byte(peerAddress), &data)
		if err != nil {
			log.Printf("Failed to unmarshal during relay exhange")
		}
		if knownPeers, ok := data["known_peers"].([]interface{}); ok {
			for _, peer := range knownPeers {
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
		return fmt.Errorf("failed to create relay multiaddr: %v", err)
	}
	relayInfo, err := peer.AddrInfoFromP2pAddr(relayAddress)
	if err != nil {
		return fmt.Errorf("failed to create relay address: %v", err)
	}

	_, err = client.Reserve(context, node, *relayInfo)
	if err != nil {
		return fmt.Errorf("failed to make reservation on relay: %v", err)
	}

	log.Println("Reservation made on relay node")
	return nil
}

func refreshReservation(node host.Host, internal time.Duration) error {
	ticker := time.NewTicker(internal)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			err := makeReservation(node)
			if err != nil {
				log.Fatalf("Failed to refresh reservation: %v", err)
			}
		case <-globalCtx.Done():
			log.Println("Context cancelled. Stopping reservation refresh")
			return nil
		}
	}

}

// Handle input from stdio
func handleInput(context context.Context, orcaDHT *dht.IpfsDHT, node host.Host) {
	reader := bufio.NewReader(os.Stdin)
	for {
		input, _ := reader.ReadString('\n') // Read input from keyboard
		input = strings.TrimSpace(input)    // Trim any trailing newline or spaces
		args := strings.Split(input, " ")
		if len(args) < 1 {
			fmt.Println("No command provided")
			continue
		}
		command := args[0]
		command = strings.ToUpper(command)
		switch command {
		case "GET":
			if len(args) < 2 {
				fmt.Println("Expected key")
				continue
			}
			key := args[1]
			dhtKey := "/orcanet/" + key
			res, err := orcaDHT.GetValue(context, dhtKey)
			if err != nil {
				fmt.Printf("Failed to get record: %v\n", err)
				continue
			}
			fmt.Printf("Record: %s\n", res)

		case "GET_PROVIDERS":
			if len(args) < 2 {
				fmt.Println("Expected key")
				continue
			}
			key := args[1]
			data := []byte(key)
			hash := sha256.Sum256(data)
			mh, err := multihash.EncodeName(hash[:], "sha2-256")
			if err != nil {
				fmt.Printf("Error encoding multihash: %v\n", err)
				continue
			}
			c := cid.NewCidV1(cid.Raw, mh)
			providers := orcaDHT.FindProvidersAsync(context, c, 20)

			fmt.Println("Searching for providers...")
			for p := range providers {
				if p.ID == peer.ID("") {
					break
				}
				fmt.Printf("Found provider: %s\n", p.ID.String())
				for _, addr := range p.Addrs {
					fmt.Printf(" - Address: %s\n", addr.String())
				}
			}

		case "PUT":
			if len(args) < 3 {
				fmt.Println("Expected key and value")
				continue
			}
			key := args[1]
			value := args[2]
			dhtKey := "/orcanet/" + key
			log.Println(dhtKey)
			err := orcaDHT.PutValue(context, dhtKey, []byte(value))
			if err != nil {
				fmt.Printf("Failed to put record: %v\n", err)
				continue
			}
			provideKey(context, orcaDHT, key)
			fmt.Println("Record stored successfully")

		case "PUT_PROVIDER":
			if len(args) < 2 {
				fmt.Println("Expected key")
				continue
			}
			key := args[1]
			provideKey(context, orcaDHT, key)
		case "PROVIDE_FILE":
			if len(args) < 2 {
				fmt.Println("Expected file path")
				continue
			}
			filepath := args[1]
			peerID := node.ID().String()

			// Generate a file hash
			file, err := os.Open(filepath)
			if err != nil {
				fmt.Println("Error opening file: ", err)
			}
			defer file.Close()

			hash := sha256.New()

			if _, err := io.Copy(hash, file); err != nil {
				fmt.Println("Error copying file contents: ", err)
			}

			fileHash := fmt.Sprintf("%x", hash.Sum(nil))

			// Provide the file on DHT
			dhtKey := "/orcanet/" + fileHash

			fmt.Println("Updating DHT with file hash: ", dhtKey)

			err = orcaDHT.PutValue(context, dhtKey, []byte(peerID))
			if err != nil {
				fmt.Println("Error providing file: ", err)
			}

			provideKey(context, orcaDHT, fileHash)

			fileHashToPath[fileHash] = filepath

			fmt.Println("File provided successfully")
		case "PROVIDE_FILE_META":
			if len(args) < 2 {
				fmt.Println("Expected file path")
				continue
			}
			continue
		case "GET_FILE":
			if len(args) < 2 {
				fmt.Println("Expected file hash")
				continue
			}
			fileHash := args[1]
			dhtKey := "/orcanet/" + fileHash

			log.Println("Searching for file hash: ", dhtKey)
			res, err := orcaDHT.GetValue(context, dhtKey)
			if err != nil {
				fmt.Printf("Failed to get record: %v\n", err)
			}
			fmt.Printf("File found at peerID: %s\n", res)

			// Connect to the peer
			providerPeerID := string(res)
			err = connectToNodeUsingRelay(node, providerPeerID)
			if err != nil {
				fmt.Printf("Failed to connect to peer: %v\n", err)
			}

			// Request the file from the peer
			err = sendFileRequestToPeer(node, providerPeerID, fileHash)
			if err != nil {
				fmt.Printf("Failed to request file from peer: %v\n", err)
			}

		case "GET_FILE_META":
			if len(args) < 2 {
				fmt.Println("Expected file hash")
			}
			// TODO: Implement

		default:
			fmt.Println("Expected GET, GET_PROVIDERS, PUT, PUT_PROVIDER, PROVIDE_FILE, PROVIDE_FILE_META, DOWNLOAD_FILE, DOWNLOAD_FILE_META")
		}
	}
}

// Annouce to the network that the node is providing a key for a file
func provideKey(ctx context.Context, dht *dht.IpfsDHT, key string) error {
	data := []byte(key)
	hash := sha256.Sum256(data)
	mh, err := multihash.EncodeName(hash[:], "sha2-256")
	if err != nil {
		return fmt.Errorf("error encoding multihash: %v", err)
	}
	c := cid.NewCidV1(cid.Raw, mh)

	// Start providing the key
	err = dht.Provide(ctx, c, true)
	if err != nil {
		return fmt.Errorf("failed to start providing key: %v", err)
	}
	return nil
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Expected SBU ID")
		return
	}
	SBU_ID = os.Args[1]

	// Start node
	node, orcaDHT, err := createNode(dht.ModeServer)
	if err != nil {
		log.Printf("Error occured while creating node: %v", err)
		return
	}

	globalNode = node

	// Create context for the application
	contex, cancel := context.WithCancel(context.Background())
	defer cancel()
	globalCtx = contex

	// Connect to relay node and bootstrap node
	err = connectToNode(node, RELAY_NODE_MULTIADDR)
	if err != nil {
		log.Printf("Error occured while connecting to relay node: %v", err)
		return
	}

	err = makeReservation(node)
	if err != nil {
		log.Printf("Error occured while making reservation: %v", err)
		return
	}
	go refreshReservation(node, 5*time.Minute)

	err = connectToNode(node, BOOTSTRAP_NODE_MULTIADDR)
	if err != nil {
		log.Printf("Error occured while connecting to bootstrap node: %v", err)
		return
	}

	// print the node's multiaddress
	for _, addr := range node.Addrs() {
		fmt.Printf("NEW NODE INITIALIZED: %s/p2p/%s\n", addr, node.ID())
	}

	go startRPCServer(orcaDHT)

	go handlePeerExhangeWithRelay(node)

	// Keep the node running until the user exits
	go handleInput(contex, orcaDHT, node)

	// Handle incoming file requests
	go receiveFileRequests(node)

	// Handle incoming file data
	go receiveFileData(node)

	defer node.Close()
	select {}
}
