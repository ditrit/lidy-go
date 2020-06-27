package lidy

// Almost all of lidy's entry points

import (
	"fmt"
	"io/ioutil"

	"gopkg.in/yaml.v3"
)

//
// File
//

// File -- A way to load the content of a file
// One of:
// - the text of a file `File{Text: ""}`
// - the path to a file `File{Name: ""}`
// - both the text of a file and an indicative name `File{Text: "", Name: ""}`
type File struct {
	Text interface{}
	Name string
}

// Load -- obtain the Text value of the file
// also populate the Text field using the Name, if Text is missing
func (f File) Load() (string, error) {
	if f.Text == nil {
		byteContent, err := ioutil.ReadFile(f.Name)

		if err != nil {
			return "", err
		}

		content := string(byteContent)
		f.Text = content
		return content, nil
	} else if content, ok := f.Text.(string); ok {
		return content, nil
	}

	return "", fmt.Errorf("File.Text containing a value other than nil or a string")
}

//
// YAML
//

// YamlFile -- the representation of a file whose content is YAML
type YamlFile interface {
	File
}

type yamlFile struct {
	File
	yaml yaml.Node
}

// Yaml -- assert this file to be Yaml
func (f File) Yaml() (File, error) {
	text, err := f.Load()
	if err != nil {
		return yamlFile{}, err
	}

	result := yamlFile{
		File: f,
		yaml: yaml.Node{},
	}

	err = yaml.Unmarshal([]byte(text), &result.yaml)

	return result, err
}

//
// Schema
//

// schemaFile -- the representation of a file whose content is a Lidy schema
type schemaFile struct {
	yamlFile
	schema tDocument
}

// Schema -- assert the file to be a Lidy Schema
func (f File) Schema() (schemaFile, error) {
	yaml, err := f.Yaml()
	if err != nil {
		return schemaFile{}, err
	}

	schema, err := parseSchema(yaml)

	result := schemaFile{
		yamlFile: yaml,
		schema:   schema,
	}

	return result, err
}
