// Author: Kevin Lai
// This file handles the RPC server to provide file sharing services to the client.
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/rpc"
	"github.com/gorilla/rpc/json"
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

// REPLY STRUCTS
type ProvideFileReply struct {
	Success bool `json:"success"`
}

type GetFileReply struct {
	Success bool `json:"success"`
}

type GetFileMetaDataReply struct {
	Success      bool    `json:"success"`
	FileMetaData []bytes `json:"file_meta_data"`
}

type GetHistoryReply struct {
	Success bool              `json:"success"`
	History []FileTransaction `json:"history"`
}

type FileShareService struct{}

var metadataResponse = make(map[string]FileDataHeader)
var history []FileTransaction

func (s *FileShareService) GetFile(r *http.Request, args *GetFileArgs, reply *ProvideFileReply) error {
	log.Printf("Received GetFile request for file hash %s\n", args.FileHash)

	// TODO: send file meta data request and store in history as file transaction

	err := connectAndRequestFileFromPeer(args.FileHash)
	if err != nil {
		log.Printf("Failed to get file: %v\n", err)
		*reply = ProvideFileReply{Success: false}
		return err
	}

	*reply = ProvideFileReply{Success: true}

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
			metaDataBytes, err := json.Marshal(metaData)
			if err != nil {
				log.Printf("Failed to marshal meta data: %v\n", err)
				*reply = GetFileMetaDataReply{Success: false}
				return err
			}

			*reply = GetFileMetaDataReply{Success: true, FileMetaData: metaDataBytes}
			return nil
		}
	}
}

func (s *FileShareService) GetHistory(r *http.Request, args *GetHistoryArgs, reply *GetHistoryReply) error {
	log.Printf("Received GetHistory request")
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

	*reply = ProvideFileReply{Success: true}
	log.Printf("Provided file %s on DHT\n", filepath)

	return nil
}

func startRPCServer(orcaDHT *dht.IpfsDHT) {
	globalOrcaDHT = orcaDHT
	s := rpc.NewServer()
	s.RegisterCodec(json.NewCodec(), "application/json")
	s.RegisterService(new(FileShareService), "")

	r := mux.NewRouter()
	r.Handle("/rpc", s)

	fmt.Println("Starting JSON-RPC server on port 1234")
	http.ListenAndServe(":1234", r)
}
