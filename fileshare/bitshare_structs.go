package main

import (
	"time"
)

type AppState struct {
	SBU_ID             string
	DOWNLOAD_DIRECTORY string
	fileHashToPath     map[string]string          // map of file hashes to file paths on device
	isFileHashProvided map[string]bool            // true if file hash is provided by this node, else false
	downloadStatus     map[string]bool            // proceed with download if true, else pause download
	lastDownloadStatus time.Time                  // last time download status was updated
	metadataResponse   map[string]FileDataHeader  // fileHash -> metadata
	downloadHistory    map[string]FileTransaction // requestID -> transaction
	fileRequests       []FileRequest
	providedFiles      []FileDataHeader
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
