package lidy

import (
	fo "github.com/ditrit/lidy/fileoutline"
	"gopkg.in/yaml.v3"
)

// Validator supporting validation of YAML text
type Validator struct {
	target   string
	document tDocument
}

// ValidateTree accept an interface{} as produced by the go `yaml` module
func (v Validator) ValidateTree(tree interface{}) error {
	return nil
}

// ValidateFileOutline accept a fileoutline.FileOutline
func (v Validator) ValidateFileOutline(fileoutline fo.FileOutline) error {
	var node yaml.Node
	err := yaml.Unmarshal([]byte(fileoutline.Content), &node)

	if err != nil {
		panic(err)
	}
	return nil
}

// ValidateString accept a yaml string
func (v Validator) ValidateString(text string) error {
	return v.ValidateFileOutline(fo.FileOutline{Content: text})
}

// ValidateFile accept a filename (of a yaml file)
func (v Validator) ValidateFile(filename string) error {
	fileoutline, err := fo.ReadFile(filename)
	if err != nil {
		return err
	}
	return v.ValidateFileOutline(fileoutline)
}

// ValidatorFromLidyExpression create a validator from a lidy experssion
// This is motly used for tests.
func ValidatorFromLidyExpression(expression string) (Validator, error) {
	return Validator{
		target:   "main",
		document: tDocument{},
	}, nil
}

// ValidatorFromString create a validator from a lidy string
func ValidatorFromString(text string) (Validator, error) {
	return Validator{
		target:   "main",
		document: tDocument{},
	}, nil
}

// ValidatorFromFileOutline create a validator from a fileoutline.FileOutline
func ValidatorFromFileOutline(fileoutline fo.FileOutline) (Validator, error) {
	var node yaml.Node
	err := yaml.Unmarshal([]byte(fileoutline.Content), &node)

	if err != nil {
		panic(err)
	}
	return nil
}

// ValidateString accept a yaml string
func (v Validator) ValidateString(text string) error {
	return v.ValidateFileOutline(fo.FileOutline{Content: text})
}

// ValidateFile accept a filename (of a yaml file)
func (v Validator) ValidateFile(filename string) error {
	fileoutline, err := fo.ReadFile(filename)
	if err != nil {
		return err
	}
	return v.ValidateFileOutline(fileoutline)
}

// GetTrue return true
func GetTrue() bool {
	return true
}

// GetFalse return false
func GetFalse() bool {
	return false
}

// ParseString {} parse a YAML string according to a YAML DSL file
// Given a yaml source string, and the path to the file describing the DSL, parse the source according to the DSL. Return an Info object.
func ParseString(data fo.FileOutline, schema fo.FileOutline) interface{} {
	return nil
}

// ParseFile
