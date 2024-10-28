// Author: Kevin Lai
// Bitshare is a library for sending and receiving files.
// This file handles the peer to peer communication for file sharing.
package main

import (
	"bufio"
	"context"
	"encoding/gob"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	fp "path/filepath"
	"strings"
	"time"

	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/network"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/libp2p/go-libp2p/core/protocol"
	ma "github.com/multiformats/go-multiaddr"
)

var fileHashToPath = make(map[string]string)
var isFileHashProvided = make(map[string]bool)

type FileTransaction struct {
	FileRequest  FileRequest
	FileMetaData FileDataHeader
}

// File struct for file data
// Send when a client is ready to make a transaction and download a file
type FileDataHeader struct {
	FileName      string
	FileSize      int64
	FileHash      string
	FileExtension string
	Multiaddress  string
	PeerID        string
	price         float32 // price of the file in coins
}

// FileRequest struct for file request data
// Send when a client is rwants to make a transaction and download a file
type FileRequest struct {
	FileHash              string
	RequesterID           string
	RequesterMultiAddress string
	timeSent              time.Time
}

// MetaDataRequest struct for metadata request data
// Send when a client wants to get metadata for a file
type MetaDataRequest struct {
	FileHash              string
	RequesterID           string
	RequesterMultiAddress string
	timeSent              time.Time
}

// Error struct to handle errors
type Error struct {
	ErrorMessage string
}

// Create a stream to a target node
func createStream(node host.Host, targetNodeId string, streamProtocol protocol.ID) (network.Stream, error) {
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
	stream, err := node.NewStream(network.WithAllowLimitedConn(ctx, string(streamProtocol)), peerinfo.ID, streamProtocol)
	if err != nil {
		return nil, fmt.Errorf("failed to open stream to %s: %s", peerinfo.ID, err)
	}

	return stream, nil
}

///////////////////////////////// RECEIVER FUNCTIONS //////////////////////////////////////

// Listens for incoming file requests from peers
// node: the host node to listen for file requests on
func receiveFileRequests(node host.Host) {
	node.SetStreamHandler("/sendmessage/p2p", func(stream network.Stream) {
		defer stream.Close()

		fmt.Println("Received file request. Now reading request data...")

		buffer := bufio.NewReader(stream)

		// Read the data from the stream
		data, err := io.ReadAll(buffer)
		if err != nil {
			log.Printf("Error reading data from stream: %v", err)
			return
		}
		log.Printf("File Request Data: %s", data)

		// Read the JSON file request from the stream
		var fileRequest FileRequest
		err = json.Unmarshal(data, &fileRequest)
		if err != nil {
			log.Printf("Error unmarshalling file request: %v", err)
			return
		}

		// Find the file given the file hash
		filePath, ok := fileHashToPath[fileRequest.FileHash]
		if !ok {
			err = sendFileNotFoundToPeer(node, fileRequest.RequesterID)
			if err != nil {
				log.Printf("Error sending file not found message: %v", err)
			} else {
				log.Printf("Sent file not found message: %v", fileRequest.FileHash)
			}
		} else {
			// Send the file to the requester
			err = sendFileToPeer(node, fileRequest.RequesterID, filePath, fileRequest.FileHash)
			if err != nil {
				log.Printf("Error sending file: %v", err)
			} else {
				log.Printf("File sent")
			}
		}
	})
}

// Listens for incoming raw file data
// node: the host node to listen for file data on
func receiveFileData(node host.Host) {
	node.SetStreamHandler("/senddata/p2p", func(stream network.Stream) {
		defer stream.Close()

		log.Println("Received file data. Reading data...")

		// Read the metadata
		var fileMetaData FileDataHeader
		decoder := gob.NewDecoder(stream)
		if err := decoder.Decode(&fileMetaData); err != nil {
			log.Printf("Error decoding file metadata in file data receiver: %v", err)
			return
		}

		// Create a file to write the data to
		file, err := os.Create(DOWNLOAD_DIRECTORY + "/" + fileMetaData.FileName)
		if err != nil {
			log.Printf("Error creating file: %v", err)
			return
		}
		defer file.Close()

		// Read the file data from the stream and write it to the file
		for {
			buffer := make([]byte, 1024)
			bytesRead, err := stream.Read(buffer)
			if err != nil {
				if err == io.EOF {
					break
				}
				log.Printf("Error reading file data from stream: %v", err)
				return
			}

			_, err = file.Write(buffer[:bytesRead])
			if err != nil {
				log.Printf("Error writing file data to output file: %v", err)
				return
			}
		}

	})
}

// Listens for incoming file metadata requests from peers
// node: the host node to listen for file metadata requests on
func receiveFileMetaDataRequests(node host.Host) {
	node.SetStreamHandler("/sendmetadatarequest/p2p", func(stream network.Stream) {
		defer stream.Close()

		fmt.Println("Received file metadata request. Now reading request data...")

		buffer := bufio.NewReader(stream)

		data, err := io.ReadAll(buffer)
		if err != nil {
			log.Printf("Error reading data from stream: %v", err)
			return
		}
		log.Printf("File Metadata Request Data: %s", data)

		// Read the JSON file request from the stream
		var fileRequest FileRequest
		err = json.Unmarshal(data, &fileRequest)
		if err != nil {
			log.Printf("Error unmarshalling file request: %v", err)
			return
		}

		// Find the file given the file hash
		filePath, ok := fileHashToPath[fileRequest.FileHash]
		if !ok {
			err = sendFileNotFoundToPeer(node, fileRequest.RequesterID)
			if err != nil {
				log.Printf("Error sending file not found message: %v", err)
			} else {
				log.Printf("Sent file not found message: %v", fileRequest.FileHash)
			}
		} else {
			// Send the file to the requester
			err = sendFileMetaDataToPeer(node, fileRequest.RequesterID, filePath, fileRequest.FileHash)
			if err != nil {
				log.Printf("Error sending file: %v", err)
			} else {
				log.Printf("File sent")
			}
		}

	})
}

func receiveFileMetaData(node host.Host) {
	node.SetStreamHandler("/sendmetadata/p2p", func(stream network.Stream) {
		defer stream.Close()

		log.Println("Received file metadata. Reading metadata...")

		// Read the metadata
		var fileMetaData FileDataHeader
		decoder := gob.NewDecoder(stream)
		if err := decoder.Decode(&fileMetaData); err != nil {
			log.Printf("Error decoding file metadata in file data receiver: %v", err)
			return
		}

		metadataResponse[fileMetaData.FileHash] = fileMetaData
		log.Printf("Metadata received: %v", fileMetaData)

	})
}

///////////////////////////////// SENDER FUNCTIONS //////////////////////////////////////

// Send a "file not found" message to a peer from a given node.
// node: the node sending the file not found message
// targetNodeId: the ID of the target peer
func sendFileNotFoundToPeer(node host.Host, targetNodeId string) error {
	stream, err := createStream(node, targetNodeId, "/sendmessage/p2p")
	if err != nil {
		return fmt.Errorf("sendFileNotFoundToPeer: %v", err)
	}
	defer stream.Close()

	errorStruct := Error{
		ErrorMessage: "File not found",
	}

	errorBytes, err := json.Marshal(errorStruct)
	if err != nil {
		return fmt.Errorf("sendFileNotFoundToPeer: %v", err)
	}

	_, err = stream.Write(errorBytes)
	if err != nil {
		return fmt.Errorf("sendFileNotFoundToPeer: %v", err)
	}
	return nil
}

// Send an insufficient funds error message to a peer from a given node.
// node: the node sending the insufficient funds message
// targetNodeId: the ID of the target peer
func sendInsufficientFundsToPeer(node host.Host, targetNodeId string) error {
	stream, err := createStream(node, targetNodeId, "/sendmessage/p2p")
	if err != nil {
		return fmt.Errorf("sendInsufficientFundsToPeer: %v", err)
	}
	defer stream.Close()
	if err != nil {
		return fmt.Errorf("sendInsufficientFundsToPeer: %v", err)
	}

	errorStruct := Error{
		ErrorMessage: "Insufficient funds",
	}

	errorBytes, err := json.Marshal(errorStruct)
	if err != nil {
		return fmt.Errorf("sendInsufficientFundsToPeer: %v", err)
	}

	_, err = stream.Write(errorBytes)
	if err != nil {
		return fmt.Errorf("sendInsufficientFundsToPeer: %v", err)
	}
	return nil
}

// Send a node stopped providing file error message to a peer from a given node.
// node: the node sending the user stopped providing file message
// targetNodeId: the ID of the target peer
func sendNodeStoppedProvidingFileToPeer(node host.Host, targetNodeId string) error {
	stream, err := createStream(node, targetNodeId, "/sendmessage/p2p")
	if err != nil {
		return fmt.Errorf("sendNodeStoppedProvidingFileToPeer: %v", err)
	}
	defer stream.Close()
	if err != nil {
		return fmt.Errorf("sendUserStoppedProvidingFileToPeer: %v", err)
	}

	errorStruct := Error{
		ErrorMessage: "Node stopped providing file",
	}

	errorBytes, err := json.Marshal(errorStruct)
	if err != nil {
		return fmt.Errorf("sendUserStoppedProvidingFileToPeer: %v", err)
	}

	_, err = stream.Write(errorBytes)
	if err != nil {
		return fmt.Errorf("sendUserStoppedProvidingFileToPeer: %v", err)
	}
	return nil
}

// Send a transaction error message to a peer from a given node.
// node: the node sending the transaction error message
// targetNodeId: the ID of the target peer
func sendTransactionErrorToPeer(node host.Host, targetNodeId string) error {
	stream, err := createStream(node, targetNodeId, "/sendmessage/p2p")
	if err != nil {
		return fmt.Errorf("sendTransactionErrorToPeer: %v", err)
	}
	defer stream.Close()
	if err != nil {
		return fmt.Errorf("sendTransactionErrorToPeer: %v", err)
	}

	errorStruct := Error{
		ErrorMessage: "Transaction error",
	}

	errorBytes, err := json.Marshal(errorStruct)
	if err != nil {
		return fmt.Errorf("sendTransactionErrorToPeer: %v", err)
	}

	_, err = stream.Write(errorBytes)
	if err != nil {
		return fmt.Errorf("sendTransactionErrorToPeer: %v", err)
	}
	return nil
}

// Send a file request to a peer from a given node.
// node: the node sending the file request
// targetNodeId: the ID of the target peer
// fileHash: the hash of the file to request
func sendFileRequestToPeer(node host.Host, targetNodeId string, fileHash string) error {
	fmt.Printf("Sending file request to peer %s\n", targetNodeId)
	stream, err := createStream(node, targetNodeId, "/sendmessage/p2p")
	if err != nil {
		return fmt.Errorf("sendFileRequestToPeer: %v", err)
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

	// Update the file request map
	requestedFiles[fileHash] = fileRequest

	// Write the file request to the stream
	fileRequestBytes, err := json.Marshal(fileRequest)
	if err != nil {
		return fmt.Errorf("sendFileRequestToPeer:  %v", err)
	}
	_, err = stream.Write(fileRequestBytes)
	if err != nil {
		return fmt.Errorf("sendFileRequestToPeer: %v", err)
	}

	fmt.Printf("Successful file request sent to peer %s\n", targetNodeId)
	return nil
}

// Send a file to a peer from a given node.
// node: the host node sending the file
// targetNodeId: the ID of the target peer
// filepath: the path to the file to send
func sendFileToPeer(node host.Host, targetNodeId, filepath string, filehash string) (err error) {
	stream, err := createStream(node, targetNodeId, "/senddata/p2p")
	if err != nil {
		return fmt.Errorf("sendFileToPeer: %v", err)
	}
	defer stream.Close()

	// Open the file and store it in a buffer
	file, err := os.Open(filepath)
	if err != nil {
		return fmt.Errorf("sendFileToPeer: %v", err)
	}
	defer file.Close()

	fileInfo, err := file.Stat()
	if err != nil {
		return fmt.Errorf("sendFileToPeer: %v", err)
	}

	fileExt := fp.Ext(filepath)

	// Create fileDataHeader struct
	fileMetaData := FileDataHeader{
		FileName:      fileInfo.Name(),
		FileSize:      fileInfo.Size(),
		FileHash:      filehash,
		FileExtension: fileExt,
		Multiaddress:  node.Addrs()[0].String(),
		PeerID:        node.ID().String(),
		price:         0.0,
	}

	// Send the metadata to the peer
	encoder := gob.NewEncoder(stream)
	if err := encoder.Encode(fileMetaData); err != nil {
		return fmt.Errorf("sendFileToPeer: %v", err)
	}

	// Send the file data to the peer in chunks
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
func sendFileMetaDataToPeer(node host.Host, targetNodeId, filepath string, filehash string) (err error) {
	stream, err := createStream(node, targetNodeId, "/sendmetadata/p2p")
	if err != nil {
		return fmt.Errorf("sendFileMetaDataToPeer: %v", err)
	}
	defer stream.Close()

	if err != nil {
		return fmt.Errorf("sendFileMetaDataToPeer:  %v", err)
	}

	fileInfo, err := os.Stat(filepath)
	if err != nil {
		return fmt.Errorf("sendFileToPeer: %v", err)
	}

	fileSize := fileInfo.Size()
	fileName := fileInfo.Name()
	fileExt := fp.Ext(filepath)

	fileMetaData := FileDataHeader{
		FileName:      fileName,
		FileSize:      fileSize,
		FileHash:      filehash,
		FileExtension: fileExt,
		Multiaddress:  node.Addrs()[0].String(),
		PeerID:        node.ID().String(),
		price:         0.0, // TODO: Add price to file metadata
	}

	encoder := gob.NewEncoder(stream)
	if err := encoder.Encode(fileMetaData); err != nil {
		return fmt.Errorf("sendFileMetaDataToPeer: %v", err)
	}

	err = stream.Close()
	if err != nil {
		return fmt.Errorf("sendFileMetaDataToPeer: %v", err)
	}

	return nil
}

// Send a file metadata request to a peer from a given node.
func sendFileMetaDataRequestToPeer(node host.Host, targetNodeId string, fileHash string) error {
	fmt.Printf("Sending file metadata request to peer %s\n", targetNodeId)
	stream, err := createStream(node, targetNodeId, "/sendmetadatarequest/p2p")
	if err != nil {
		return fmt.Errorf("sendFileMetadataRequestToPeer: %v", err)
	}
	defer stream.Close()

	sourceID := node.ID().String()
	sourceMultiAddress := node.Addrs()[0].String()

	fileMetadataRequest := MetaDataRequest{
		FileHash:              fileHash,
		RequesterID:           sourceID,
		RequesterMultiAddress: sourceMultiAddress,
		timeSent:              time.Now(),
	}

	// Write the file metadata request to the stream
	fileRequestBytes, err := json.Marshal(fileMetadataRequest)
	if err != nil {
		return fmt.Errorf("sendFileMetadataRequestToPeer:  %v", err)
	}
	_, err = stream.Write(fileRequestBytes)
	if err != nil {
		return fmt.Errorf("sendFileMetadataRequestToPeer: %v", err)
	}

	fmt.Printf("Successful file metadata request sent to peer %s\n", targetNodeId)
	return nil
}