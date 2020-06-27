package lidy

import (
	fo "github.com/ditrit/lidy/fileoutline"
	"gopkg.in/yaml.v3"
)

// Paper -- the lidy representation of a yaml document with its path
type Paper struct {
	fo.FileOutline
	yaml yaml.Node
}

// unmarshal reads the content as yaml and write into the Yaml Node of the struct
func (p Paper) unmarshal() error {
	err := yaml.Unmarshal([]byte(p.Content), &p.yaml)
	return err
}

// PaperFromFile -- read a filename into a Paper
func PaperFromFile(filename string) (Paper, error) {
	fileoutline, err := fo.ReadFile(filename)

	if err != nil {
		return Paper{}, err
	}

	return PaperFromFileOutline(fileoutline)
}

// PaperFromFileOutline -- create a Paper from a file outline
func PaperFromFileOutline(fileoutline fo.FileOutline) (Paper, error) {
	paper := Paper{FileOutline: fileoutline}
	err := paper.unmarshal()

	return paper, err
}

// PaperFromString -- create a Paper from a string
func PaperFromString(text string) (Paper, error) {
	paper := Paper{FileOutline: fo.FileOutline{Content: text}}
	err := paper.unmarshal()

	return paper, err
}
