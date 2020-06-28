package lidy

// Almost all of lidy's entry points

import (
	"gopkg.in/yaml.v3"
)

//
// File
//

// File -- the representation of a file
type File interface {
	Name() string
	Content() []byte
	Yaml() error

	unimplementable()
}

// Parser -- performing validation and deserialisation
type Parser interface {
	File
	// Target -- set what rule of the schema should be used to process the content
	Target(target string) Parser
	// With -- set the builderMap
	With(builderMap map[string]Builder) Parser
	// Option -- set the parser options
	Option(option Option) Parser
	// Schema -- assert that the file content is a valid schema
	Schema() []error
	// Parse
	// validate a yaml content, and deserialise it into a Lidy result
	Parse(file File) (Result, []error)
}

var _ File = tFile{}

type tFile struct {
	name    string
	content []byte
	yaml    yaml.Node
}

var _ Parser = tParser{}

type tParser struct {
	tFile
	builderMap map[string]Builder
	option     Option
	schema     tDocument
	target     string
}

//
// File
//

// NewFile -- create a Lidy representation of a file
// the filename is only used for error reporting
func NewFile(filename string, content []byte) File {
	return tFile{
		name:    filename,
		content: content,
	}
}

func (f tFile) Name() string {
	return f.name
}

func (f tFile) Content() []byte {
	return f.content
}

// Yaml -- assert this file to be Yaml
func (f tFile) Yaml() error {
	if f.yaml.Tag == "" {
		// TODO
		// Think of upgrading to using yaml.NewDecoder, and handle any io.Reader
		return yaml.Unmarshal(f.content, &f.yaml)
	}
	return nil
}

// File is unimplementable by external libraries
// This method must exist to validate the interface
func (tFile) unimplementable() {}

//
// Parser
//

// NewParser -- create a new lidy parser
func NewParser(filename string, content []byte) Parser {
	return tParser{
		tFile: tFile{
			name:    filename,
			content: content,
		},
		target: "main",
	}
}

// Target -- set the target. Return this
func (f tParser) Target(target string) Parser {
	f.target = target
	return f
}

// With -- set the builderMap. Return this
func (f tParser) With(builderMap map[string]Builder) Parser {
	f.builderMap = builderMap
	return f
}

// Option -- set the parser option instance. Return this
func (f tParser) Option(option Option) Parser {
	f.option = option
	return f
}

// Schema -- assert the Schema of the parser to be valid. Return this and the list of encountered error, while processing the schema, if any.
func (f tParser) Schema() []error {
	err := f.Yaml()
	if err != nil {
		return []error{err}
	}
	return parseSchema(f)
}

func (f tParser) Parse(file File) (Result, []error) {
	err := f.Schema()
	if len(err) > 0 {
		return nil, err
	}
	return f.parseContent(file)
}
