package lidy

import (
	fo "github.com/ditrit/lidy/fileoutline"
)

// GetTrue return true
func GetTrue() bool {
	return true
}

// GetFalse return false
func GetFalse() bool {
	return false
}

// ParseDslDefinition parse a YAML DSL description into an Info object.
func ParseDslDefinition() {

}

// ParseString parse a YAML string according to a YAML DSL file
// Given a yaml source string, and the path to the file describing the DSL, parse the source according to the DSL. Return an Info object.
func ParseString(sourceString string, dslDefinition fo.FileOutline, mainRuleName string) interface{} {
	return nil
}

// ParseFile
