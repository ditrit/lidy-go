package lidy

// lidy.go
//
// Exported types, methods, functions and other entry points

import (
	"fmt"

	"gopkg.in/yaml.v3"
)

//
// File interface
//

// File -- the representation of a file
type File interface {
	Name() string
	Content() []byte
	Yaml() error

	unimplementable()
}

//
// Parser interface
//

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

// Option cherry-pick some parser behaviour
// All options are false by default, (this is the default go value)
type Option struct {
	//
	// Schema parse time
	//
	// WarnUnimplementedBuilder **DO** warn when there are exported identifiers that don't have an associated builder in the map.
	WarnUnimplementedBuilder bool
	// IgnoreExtraBuilder Do not warn when the builderMap contains useless builders
	IgnoreExtraBuilder bool
	// WarnUnusedRule **DO** warn when some used are declared but never refered to in the schema
	WarnUnusedRule bool
	// BypassMissingRule Persist to run the schema even if there are reported references to undeclared rules. The undeclared rules will accept any YAML content
	BypassMissingRule bool
	// StopAtFirstSchemaError Return at most one error while parsing the schema
	StopAtFirstSchemaError bool
	//
	// Content parse time
	//
	// StopAtFirstError Return at most one error while parsing the YAML content
	StopAtFirstError bool
}

// Builder -- user-implemented input-validation and creation of user objects
type Builder func(input interface{}) (Result, []error)

// tLidyBuilder -- builders for lidy's internal types
type tLidyMatcher func(content yaml.Node, p *tParser) (Result, []error)

//
// Concrete types
//

var _ File = &tFile{}

type tFile struct {
	name    string
	content []byte
	yaml    yaml.Node
}

var _ Parser = &tParser{}

type tParser struct {
	tFile
	builderMap         map[string]Builder
	lidyDefaultRuleMap map[string]tRule
	option             Option
	schema             tDocument
	target             string
}

//
// File
//

// NewFile -- create a Lidy representation of a file
// the filename is only used for error reporting
func NewFile(filename string, content []byte) File {
	return &tFile{
		name:    filename,
		content: content,
	}
}

func (f *tFile) Name() string {
	return f.name
}

func (f *tFile) Content() []byte {
	return f.content
}

// Yaml -- assert this file to be Yaml
func (f *tFile) Yaml() error {
	if f.yaml.Kind == yaml.Kind(0) {
		// TODO
		// Think of upgrading to using yaml.NewDecoder, and handle any io.Reader
		err := yaml.Unmarshal(f.content, &f.yaml)

		if err != nil {
			return err
		}

		if f.yaml.Kind == 0 {
			return fmt.Errorf("INTERNAL yaml.Unmarshal failed silently. %s", pleaseReport)
		}
	}
	return nil
}

// File is unimplementable by external libraries
// This method must exist to validate the interface
func (*tFile) unimplementable() {}

//
// Parser
//

// NewParser -- create a new lidy parser
func NewParser(filename string, content []byte) Parser {
	return &tParser{
		tFile: tFile{
			name:    filename,
			content: content,
		},
		target: "main",
	}
}

// Target -- set the target. Return this
func (p *tParser) Target(target string) Parser {
	p.target = target
	return p
}

// With -- set the builderMap. Return this
func (p *tParser) With(builderMap map[string]Builder) Parser {
	p.builderMap = builderMap
	return p
}

// Option -- set the parser option instance. Return this
func (p *tParser) Option(option Option) Parser {
	p.option = option
	return p
}

// Schema -- assert the Schema of the parser to be valid. Return this and the list of encountered error, while processing the schema, if any.
func (p *tParser) Schema() []error {
	err := p.Yaml()
	if err != nil {
		return []error{err}
	}
	if p.yaml.Kind == 0 {
		panic("yaml.Kind still 0 in " + p.name)
	}
	return p.parseSchema()
}

// Parse -- use the parser to check the given YAML file, and produce a Lidy Result.
func (p *tParser) Parse(file File) (Result, []error) {
	err := p.Schema()
	if len(err) > 0 {
		return nil, err
	}

	p.lidyDefaultRuleMap = make(map[string]tRule)

	for key, matcher := range lidyDefaultRuleMatcherMap {
		p.lidyDefaultRuleMap[key] = tRule{
			ruleName:    key,
			lidyMatcher: matcher,
		}
	}

	ruleAny := tRule{
		ruleName: "any",
	}

	ruleAny.expression = tOneOf{
		optionList: []tExpression{
			p.lidyDefaultRuleMap["str"],
			p.lidyDefaultRuleMap["boolean"],
			p.lidyDefaultRuleMap["int"],
			p.lidyDefaultRuleMap["float"],
			p.lidyDefaultRuleMap["null"],
			tMap{
				tMapForm{
					mapOf: tKeyValueExpression{
						key:   ruleAny,
						value: ruleAny,
					},
				},
				tSizingNone{},
			},
			tSeq{
				tSeqForm{
					seqOf: ruleAny,
				},
				tSizingNone{},
			},
		},
	}

	p.lidyDefaultRuleMap["any"] = ruleAny

	return p.parseContent(file)
}
