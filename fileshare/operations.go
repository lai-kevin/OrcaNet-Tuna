// Author: Kevin Lai
// This file contains the operation for file sharing.
package main

import dht "github.com/libp2p/go-libp2p-kad-dht"

// Uploads a file from filepath to the DHT network
func uploadFile(orcaDHT *dht.IpfsDHT, filepath string) (err error) {
	return
}

// Downloads a file from the DHT network to filepath given the file hash
func downloadFile(orcaDHT *dht.IpfsDHT, filehash string, filepath string) (err error) {
	return
}

// Gets the metadata of a file given the file hash
func getFileMetaDataByHash(hash string) (size int, err error) {
	return
}
