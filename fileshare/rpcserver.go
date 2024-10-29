// Author: Kevin Lai
// This file handles the RPC server to provide file sharing services to the client.
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	fp "path/filepath"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/rpc"
	rpcjson "github.com/gorilla/rpc/json"
	dht "github.com/libp2p/go-libp2p-kad-dht"
)

var globalOrcaDHT *dht.IpfsDHT

// REQUEST STRUCTS
type GetFileArgs struct {
	FileHash string `json:"file_hash"`
}

type GetFileMetaDataArgs struct {
	FileHash string `json:"file_hash"`
}

type GetHistoryArgs struct {
}

type ProvideFileArgs struct {
	FilePath string  `json:"file_path"`
	Price    float64 `json:"price"`
}

type GetNodeInfoArgs struct {
}

type StopProvidingFileArgs struct {
	FileHash string `json:"file_hash"`
}

// REPLY STRUCTS
type ProvideFileReply struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type GetFileReply struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type GetFileMetaDataReply struct {
	Success      bool           `json:"success"`
	FileMetaData FileDataHeader `json:"file_meta_data"`
}

type GetHistoryReply struct {
	Success         bool              `json:"success"`
	RequestedFiles  []FileRequest     `json:"requested_files"`
	DownloadHistory []FileTransaction `json:"history"`
}

type GetNodeInfoReply struct {
	Success   bool             `json:"success"`
	PeerID    string           `json:"peer_id"`
	MultiAddr string           `json:"multi_addr"`
	Status    string           `json:"status"`
	WalletID  string           `json:"wallet_id"`
	Providing []FileDataHeader `json:"providing"`
}

type StopProvidingFileReply struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type FileShareService struct{}

var metadataResponse = make(map[string]FileDataHeader)
var downloadHistory = []FileTransaction{}
var fileRequests = []FileRequest{}
var providedFiles = []FileDataHeader{}

func (s *FileShareService) GetFile(r *http.Request, args *GetFileArgs, reply *GetFileReply) error {
	log.Printf("Received GetFile request for file hash %s\n", args.FileHash)

	fileRequests = append(fileRequests, FileRequest{
		FileHash:              args.FileHash,
		RequesterID:           globalNode.ID().String(),
		RequesterMultiAddress: globalOrcaDHT.Host().Addrs()[0].String(),
		TimeSent:              time.Now(),
	})

	err := connectAndRequestFileFromPeer(args.FileHash)
	if err != nil {
		log.Printf("Failed to get file: %v\n", err)
		*reply = GetFileReply{Success: false}
		return err
	}

	*reply = GetFileReply{Success: true, Message: "File dowloaded successfully"}

	return nil
}

func (s *FileShareService) GetFileMetaData(r *http.Request, args *GetFileMetaDataArgs, reply *GetFileMetaDataReply) error {
	log.Printf("Received GetFileMetaData request for file hash %s\n", args.FileHash)

	err := connectAndRequestFileMetaDataFromPeer(args.FileHash)
	if err != nil {
		log.Printf("Failed to get file meta data: %v\n", err)
		*reply = GetFileMetaDataReply{Success: false}
		return err
	}

	timeout := time.After(10 * time.Second)
	tick := time.Tick(500 * time.Millisecond)

	for {
		select {
		case <-timeout:
			log.Printf("Timeout while waiting for file meta data for file hash %s\n", args.FileHash)
			*reply = GetFileMetaDataReply{Success: false}
			return fmt.Errorf("timeout while waiting for file meta data")
		case <-tick:
			metaData, ok := metadataResponse[args.FileHash]
			if !ok {
				log.Printf("File metadata does not exist. Failed to marshal %s\n", args.FileHash)
				*reply = GetFileMetaDataReply{Success: false}
				return err
			}

			*reply = GetFileMetaDataReply{Success: true, FileMetaData: metaData}
			return nil
		}
	}
}

func (s *FileShareService) GetHistory(r *http.Request, args *GetHistoryArgs, reply *GetHistoryReply) error {
	log.Printf("Received GetHistory request")
	*reply = GetHistoryReply{Success: true, RequestedFiles: fileRequests, DownloadHistory: downloadHistory}
	return nil
}

func (s *FileShareService) GetNodeInfo(r *http.Request, args *GetNodeInfoArgs, reply *GetNodeInfoReply) error {
	log.Printf("Received GetNodeInfo request")
	*reply = GetNodeInfoReply{
		Success:   true,
		PeerID:    globalNode.ID().String(),
		MultiAddr: globalOrcaDHT.Host().Addrs()[0].String(),
		Status:    "Online",
		WalletID:  "462dfsg46hlgsdjgpo3i5nhdfgsdfg2354",
	}
	return nil
}

func (s *FileShareService) ProvideFile(r *http.Request, args *ProvideFileArgs, reply *ProvideFileReply) error {
	log.Printf("Received ProvideFile request for file %s with price %f\n", args.FilePath, args.Price)

	filepath := args.FilePath
	peerID := globalNode.ID().String()

	fileHash := generateFileHash(filepath)

	provideFileOnDHT(fileHash, peerID)

	fileHashToPath[fileHash] = filepath
	isFileHashProvided[fileHash] = true

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

	fileMetaData := FileDataHeader{
		FileName:      fileInfo.Name(),
		FileSize:      fileInfo.Size(),
		FileHash:      fileHash,
		FileExtension: fileExt,
		Multiaddress:  globalNode.Addrs()[0].String(),
		PeerID:        globalNode.ID().String(),
		price:         0.0,
	}

	providedFiles = append(providedFiles, fileMetaData)

	*reply = ProvideFileReply{Success: true, Message: "File is now available on OrcaNet"}
	log.Printf("Provided file %s on DHT\n", filepath)

	return nil
}

func (s *FileShareService) StopProvidingFile(r *http.Request, args *StopProvidingFileArgs, reply *StopProvidingFileReply) error {
	isFileHashProvided[args.FileHash] = false
	log.Printf("Stopped providing file %s on DHT\n", fileHashToPath[args.FileHash])
	// TODO: Remove file from DHT
	*reply = StopProvidingFileReply{Success: true, Message: "File is no longer available on OrcaNet"}
	return nil
}

func (s *FileShareService) ResumeProvidingFile(r *http.Request, args *StopProvidingFileArgs, reply *StopProvidingFileReply) error {
	isFileHashProvided[args.FileHash] = true
	log.Printf("Resumed providing file %s on DHT\n", fileHashToPath[args.FileHash])
	// TODO: Add file to DHT
	*reply = StopProvidingFileReply{Success: true, Message: "File is now available on OrcaNet"}
	return nil
}

func startRPCServer(orcaDHT *dht.IpfsDHT) {
	globalOrcaDHT = orcaDHT
	s := rpc.NewServer()
	s.RegisterCodec(rpcjson.NewCodec(), "application/json")
	s.RegisterService(new(FileShareService), "")

	r := mux.NewRouter()
	r.Handle("/rpc", s)

	fmt.Println("Starting JSON-RPC server on port 1234")
	http.ListenAndServe(":1234", r)
}
