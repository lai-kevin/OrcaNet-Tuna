// Author: Kevin Lai
// This file contains the functions for file operations.
package main

type File struct {
	Hash     string
	Size     int
	filepath string
}

// Gets the metadata of a file
func getFileMetaData(filepath string) (size int, err error) {
	return
}

// Splits a file into chunks of size chunkSize bytes
func chunkifyFile(filepath string, chunkSize int) (chunks []string, err error) {
	return
}

// Merges chunks into a file
func mergeChunks(chunks []string, filepath string) (err error) {
	return
}

// Hashes a file
func hashFile(filepath string) (hash string, err error) {
	return
}

// Calculates CID of a chunk
func calculateCID(chunkpath string) (cid string, err error) {
	return
}
