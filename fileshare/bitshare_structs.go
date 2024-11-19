package main

import (
	"time"
)

type FileTransaction struct {
	RequestID        string
	FileHash         string
	FileMetaData     FileDataHeader
	DownloadProgress float32
	DownloadSpeed    float32
	DownloadStart    time.Time
	RemainingTime    string
	BytesDownloaded  int64
}

type FileDataHeader struct {
	FileName      string
	FileSize      int64
	FileHash      string
	FileExtension string
	Multiaddress  string
	PeerID        string
	price         float32
	RequestID     string
}

type FileRequest struct {
	RequestID             string
	FileHash              string
	RequesterID           string
	RequesterMultiAddress string
	TimeSent              time.Time
	Complete              bool
}

type MetaDataRequest struct {
	FileHash              string
	RequesterID           string
	RequesterMultiAddress string
	TimeSent              time.Time
}

type PauseDownloadRequest struct {
	RequestID string
	Status    bool // true for resume, false for pause
	TimeSent  time.Time
}

type Error struct {
	ErrorMessage string
	RequestID    string
}
