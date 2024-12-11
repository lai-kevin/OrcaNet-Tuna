package main

import (
	"time"
)

type AppState struct {
	SBU_ID             string
	DOWNLOAD_DIRECTORY string
	FileHashToPath     map[string]string          // map of file hashes to file paths on device
	IsFileHashProvided map[string]bool            // true if file hash is provided by this node, else false
	DownloadStatus     map[string]bool            // proceed with download if true, else pause download
	LastDownloadStatus time.Time                  // last time download status was updated
	MetadataResponse   map[string]FileDataHeader  // fileHash -> metadata
	DownloadHistory    map[string]FileTransaction // requestID -> transaction
	FileRequests       []FileRequest
	ProvidedFiles      []FileDataHeader
}

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
	Price         float32
	MiningAddress string
	RequestID     string
	Provided      bool
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
