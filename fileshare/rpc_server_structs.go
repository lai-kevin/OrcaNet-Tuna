package main

// REQUEST STRUCTS
type GetFileArgs struct {
	FileHash string `json:"file_hash"`
	PeerID   string `json:"peer_id"`
}

type GetFileMetaDataArgs struct {
	FileHash string `json:"file_hash"`
	PeerID   string `json:"peer_id"`
}

type GetProvidersArgs struct {
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

type GetUpdatesArgs struct {
}

type StopProvidingFileArgs struct {
	FileHash string `json:"file_hash"`
}

type PauseDownloadArgs struct {
	RequestID string `json:"request_id"`
}

// REPLY STRUCTS
type ProvideFileReply struct {
	Success  bool   `json:"success"`
	Message  string `json:"message"`
	FileHash string `json:"file_hash"`
}

type GetFileReply struct {
	Success   bool   `json:"success"`
	Message   string `json:"message"`
	RequestID string `json:"request_id"`
	FileHash  string `json:"file_hash"`
}

type GetFileMetaDataReply struct {
	Success      bool           `json:"success"`
	FileMetaData FileDataHeader `json:"file_meta_data"`
}

type GetProvidersReply struct {
	Success   bool     `json:"success"`
	Providers []string `json:"providers"`
}

type GetHistoryReply struct {
	Success         bool              `json:"success"`
	RequestedFiles  []FileRequest     `json:"requested_files"`
	DownloadHistory []FileTransaction `json:"download_history"`
}

type GetNodeInfoReply struct {
	Success   bool             `json:"success"`
	PeerID    string           `json:"peer_id"`
	MultiAddr string           `json:"multi_addr"`
	Status    string           `json:"status"`
	Providing []FileDataHeader `json:"providing"`
}

type GetUpdatesReply struct {
	Success        bool              `json:"success"`
	PeerID         string            `json:"peer_id"`
	MultiAddr      string            `json:"multi_addr"`
	Status         string            `json:"status"`
	PrivateIP      bool              `json:"private_ip"`
	Providing      []FileDataHeader  `json:"providing"`
	RequestedFiles []FileRequest     `json:"requested_files"`
	Downloads      []FileTransaction `json:"downloads"`
}
type StopProvidingFileReply struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type PauseDownloadReply struct {
	Success  bool   `json:"success"`
	Progress string `json:"progress"`
}
