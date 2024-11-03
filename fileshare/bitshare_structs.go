package main

import (
	"time"
)

type FileTransaction struct {
	RequestID        string
	FileHash         string
	FileMetaData     FileDataHeader
	DownloadProgress float32
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
	RequestID     string  // Optional request ID for the file
}

// FileRequest struct for file request data
// Send when a client is rwants to make a transaction and download a file
type FileRequest struct {
	RequestID             string
	FileHash              string
	RequesterID           string
	RequesterMultiAddress string
	TimeSent              time.Time
}

// MetaDataRequest struct for metadata request data
// Send when a client wants to get metadata for a file
type MetaDataRequest struct {
	FileHash              string
	RequesterID           string
	RequesterMultiAddress string
	TimeSent              time.Time
}

// Error struct to handle errors
type Error struct {
	ErrorMessage string
}
