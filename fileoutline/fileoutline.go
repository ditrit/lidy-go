// Package fileoutline -- a file outline is a struct gathering the name (the path) of a file, with its content

package fileoutline

import (
	"io/ioutil"
)

// FileOutline A util class representing a file once its content has been read
type FileOutline struct {
	// The name of the file. It can be also nil pointer
	Name string
	// The content of the file, as a string
	Content string
}

// ReadFile A wrapper for ioutil.ReadFile to produce a FileOutline
func ReadFile(filename string) (FileOutline, error) {
	byteContent, err := ioutil.ReadFile(filename)

	if err != nil {
		return FileOutline{}, err
	}

	return FileOutline{filename, string(byteContent)}, nil
}
