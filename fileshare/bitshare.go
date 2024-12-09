// Author: Kevin Lai
// Bitshare is a library for sending and receiving files.
// This file handles the peer to peer communication for file sharing.
package main

import (
	"bufio"
	"context"
	"encoding/gob"
	"fmt"
	"io"
	"log"
	"os"
	"strings"
	"time"

	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/network"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/libp2p/go-libp2p/core/protocol"
	ma "github.com/multiformats/go-multiaddr"
)

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

func receiveFileRequests(node host.Host) {
	node.SetStreamHandler("/sendmessage/p2p", func(stream network.Stream) {
		defer stream.Close()

		fmt.Println("Received file request. Now reading request data...")

		buffer := bufio.NewReader(stream)

		data, err := io.ReadAll(buffer)
		if err != nil {
			log.Printf("Error reading data from stream: %v", err)
			return
		}
		log.Printf("File Request Data: %s", data)

		var fileRequest FileRequest
		err = json.Unmarshal(data, &fileRequest)
		if err != nil {
			log.Printf("Error unmarshalling file request: %v", err)
			return
		}

		filePath, ok := fileHashToPath[fileRequest.FileHash]
		if !ok {
			err = sendFileNotFoundToPeer(node, fileRequest.RequesterID, fileRequest.RequestID)
			if err != nil {
				log.Printf("Error sending file not found message: %v", err)
			} else {
				log.Printf("Sent file not found message: %v", fileRequest.FileHash)
			}
		} else {
			if lastDownloadStatus.IsZero() || lastDownloadStatus.Before(fileRequest.TimeSent) {
				downloadStatus[fileRequest.RequestID] = true
			}
			err = sendFileToPeer(node, fileRequest.RequesterID, filePath, fileRequest.FileHash, fileRequest.RequestID)
			if err != nil {
				log.Printf("Error sending file: %v", err)
			} else {
				log.Printf("File sent")
			}
		}
	})
}

func receiveFileData(node host.Host) {
	node.SetStreamHandler("/senddata/p2p", func(stream network.Stream) {
		defer stream.Close()

		log.Println("Received file data. Reading data...")

		var fileMetaData FileDataHeader
		decoder := gob.NewDecoder(stream)
		if err := decoder.Decode(&fileMetaData); err != nil {
			log.Printf("Error decoding file metadata in file data receiver: %v", err)
			return
		}

		downloadHistory[fileMetaData.RequestID] = FileTransaction{
			RequestID:        fileMetaData.RequestID,
			FileHash:         fileMetaData.FileHash,
			FileMetaData:     fileMetaData,
			DownloadProgress: 0.0,
			DownloadSpeed:    0.0,
			DownloadStart:    time.Now(),
			RemainingTime:    "",
			BytesDownloaded:  0,
		}

		// // Pause download if priority list is full, else update the priority list
		// for !slices.Contains(downloadPriority, fileMetaData.RequestID) {
		// 	if len(downloadPriority) < 4 {
		// 		// Add request ID of oldest file request that isn't downloaded to download priority list
		// 		for _, fileRequest := range fileRequests {
		// 			if !fileRequest.Complete {
		// 				downloadPriority = append(downloadPriority, fileRequest.RequestID)
		// 				break
		// 			}
		// 		}
		// 	}
		// }

		file, err := os.Create(DOWNLOAD_DIRECTORY + "/" + fileMetaData.FileName)
		if err != nil {
			log.Printf("Error creating file: %v", err)
			return
		}
		defer file.Close()

		totalBytesRead := 0
		startTime := time.Now()
		lastUpdateTime := startTime
		lastUpdateBytes := 0

		updateInterval := time.Second * 1

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

			currentTime := time.Now()
			totalBytesRead += bytesRead

			if currentTime.Sub(lastUpdateTime) >= updateInterval {
				duration := currentTime.Sub(lastUpdateTime)
				bytesReadSinceLastUpdate := totalBytesRead - lastUpdateBytes
				ft := downloadHistory[fileMetaData.RequestID]
				ft.BytesDownloaded = int64(totalBytesRead)
				ft.DownloadSpeed = float32(bytesReadSinceLastUpdate) / float32(duration.Seconds())
				ft.DownloadSpeed = ft.DownloadSpeed / (1024 * 1024) // convert to MB/s
				ft.DownloadProgress = float32(totalBytesRead) / float32(fileMetaData.FileSize)
				downloadHistory[fileMetaData.RequestID] = ft
				lastUpdateTime = currentTime
				lastUpdateBytes = totalBytesRead
			}
		}

		ft := downloadHistory[fileMetaData.RequestID]
		ft.DownloadProgress = 1.0
		downloadHistory[fileMetaData.RequestID] = ft

		// // Remove the request ID from the download priority list
		// for i, requestID := range downloadPriority {
		// 	if requestID == fileMetaData.RequestID {
		// 		downloadPriority = append(downloadPriority[:i], downloadPriority[i+1:]...)
		// 		break
		// 	}
		// }

		// Make as complete in fileRequests
		for i, fileRequest := range fileRequests {
			if fileRequest.RequestID == fileMetaData.RequestID {
				fileRequest.Complete = true
				fileRequests[i] = fileRequest
				break
			}
		}

	})
}

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
			log.Printf("Error unmarshalling file metadata request: %v", err)
			return
		}

		// Find the file given the file hash
		filePath, ok := fileHashToPath[fileRequest.FileHash]
		if !ok {
			err = sendFileNotFoundToPeer(node, fileRequest.RequesterID, fileRequest.RequestID)
			if err != nil {
				log.Printf("Error sending file not found message: %v", err)
			} else {
				log.Printf("Sent file not found message: %v", fileRequest.FileHash)
			}
		} else {
			// Send the file to the requester
			err = sendFileMetaDataToPeer(node, fileRequest.RequesterID, filePath, fileRequest.FileHash)
			if err != nil {
				log.Printf("Error sending file metadata: %v", err)
			} else {
				log.Printf("File metadata sent")
			}
		}

	})
}

func receivePauseDownload(node host.Host) {
	node.SetStreamHandler("/sendpause/p2p", func(stream network.Stream) {
		defer stream.Close()
		log.Println("Received pause/resume download request. Chaning download status...")

		buffer := bufio.NewReader(stream)
		data, err := io.ReadAll(buffer)
		if err != nil {
			log.Printf("Error reading data from stream: %v", err)
			return
		}
		var pauseRequest PauseDownloadRequest
		err = json.Unmarshal(data, &pauseRequest)
		if err != nil {
			log.Printf("Error unmarshalling pause request: %v", err)
			return
		}

		downloadStatus[pauseRequest.RequestID] = pauseRequest.Status
		if pauseRequest.Status {
			log.Printf("Download resumed for request ID: %s", pauseRequest.RequestID)
		} else {
			log.Printf("Download paused for request ID: %s", pauseRequest.RequestID)
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

		metadataResponse[fileMetaData.FileHash+fileMetaData.PeerID] = fileMetaData
		log.Printf("Metadata received: %v", fileMetaData)

	})
}

func receiveErrorMessages(node host.Host) {
	node.SetStreamHandler("/error/p2p", func(stream network.Stream) {
		defer stream.Close()

		log.Println("Received error message. Reading error message...")

		buffer := bufio.NewReader(stream)

		data, err := io.ReadAll(buffer)
		if err != nil {
			log.Printf("Error reading data from stream: %v", err)
			return
		}
		log.Printf("Error Message: %s", data)

		var errorStruct Error
		err = json.Unmarshal(data, &errorStruct)
		if err != nil {
			log.Printf("Error unmarshalling error message: %v", err)
			return
		}

		log.Printf("Error occurred on requestID: %s.message: %s", errorStruct.RequestID, errorStruct.ErrorMessage)

		fmt.Printf("ERROR: %s %s", errorStruct.RequestID, errorStruct.ErrorMessage)
	})
}

///////////////////////////////// SENDER FUNCTIONS //////////////////////////////////////

// Send a "file not found" message to a peer from a given node.
// node: the node sending the file not found message
// targetNodeId: the ID of the target peer
func sendFileNotFoundToPeer(node host.Host, targetNodeId string, RequestID string) error {
	stream, err := createStream(node, targetNodeId, "/error/p2p")
	if err != nil {
		return fmt.Errorf("sendFileNotFoundToPeer: %v", err)
	}
	defer stream.Close()

	errorStruct := Error{
		ErrorMessage: "File not found",
		RequestID:    RequestID,
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
func sendFileRequestToPeer(node host.Host, targetNodeId string, fileHash string, requestID string) error {
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
		RequestID:             requestID,
		FileHash:              fileHash,
		RequesterID:           sourceID,
		RequesterMultiAddress: sourceMultiAddress,
		TimeSent:              time.Now(),
		Complete:              false,
	}

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
func sendFileToPeer(node host.Host, targetNodeId, filepath string, filehash string, requestID string) (err error) {
	stream, err := createStream(node, targetNodeId, "/senddata/p2p")
	if err != nil {
		return fmt.Errorf("sendFileToPeer: %v", err)
	}
	defer stream.Close()

	file, err := os.Open(filepath)
	if err != nil {
		return fmt.Errorf("sendFileToPeer: %v", err)
	}
	defer file.Close()

	var fileMetaData FileDataHeader

	for i := 0; i < len(providedFiles); i++ {
		if providedFiles[i].FileHash == filehash {
			fileMetaData = providedFiles[i]
		}
	}

	encoder := gob.NewEncoder(stream)
	if err := encoder.Encode(fileMetaData); err != nil {
		return fmt.Errorf("sendFileToPeer: %v", err)
	}

	buffer := make([]byte, 1024)
	for {
		for !downloadStatus[requestID] {
			time.Sleep(1 * time.Second)
		}

		bytesRead, err := file.Read(buffer)
		if err != nil {
			if err.Error() == "EOF" {
				break
			}
			return fmt.Errorf("sendFileToPeer: failed to read file: %v", err)
		}

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

	var fileMetaData FileDataHeader

	for i := 0; i < len(providedFiles); i++ {
		if providedFiles[i].FileHash == filehash {
			fileMetaData = providedFiles[i]
		}
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
		TimeSent:              time.Now(),
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

func sendPauseRequestToPeer(node host.Host, targetNodeId string, requestID string, status bool) error {
	fmt.Printf("Sending pause request to peer %s\n", targetNodeId)
	stream, err := createStream(node, targetNodeId, "/sendpause/p2p")
	if err != nil {
		return fmt.Errorf("sendPauseRequestToPeer: %v", err)
	}
	defer stream.Close()

	pauseRequest := PauseDownloadRequest{
		RequestID: requestID,
		Status:    status,
		TimeSent:  time.Now(),
	}

	pauseRequestBytes, err := json.Marshal(pauseRequest)
	if err != nil {
		return fmt.Errorf("sendPauseRequestToPeer: %v", err)
	}

	_, err = stream.Write(pauseRequestBytes)
	if err != nil {
		return fmt.Errorf("sendPauseRequestToPeer: %v", err)
	}

	return nil
}
