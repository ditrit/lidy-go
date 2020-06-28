package lidy

import (
	"fmt"
)

// lidy.go
//
// Exported types, methods, functions and other entry points

// Option cherry-pick some parser behaviour
// All options are false by default, (this is the default go value)
type Option struct {
	// WarnUnimplementedBuilder **DO** warn when there are exported identifiers that don't have an associated builder in the map.
	WarnUnimplementedBuilder bool
	// IgnoreExtraBuilder Do not warn when the builderMap contains useless builders
	IgnoreExtraBuilder bool
	// StopAtFirstSchemaError Return at most one error while parsing the schema
	StopAtFirstSchemaError bool
	// StopAtFirstError Return at most one error while parsing the YAML content
	StopAtFirstError bool
}

// var _ Parser = tOldParser{}

type tOldParser struct {
	filename   string
	target     string
	grammar    tDocument
	option     Option
	builderMap map[string]Builder
}

type tSchemaParser struct {
	filename      string
	option        Option
	builderMap    map[string]Builder
	identifierMap map[string]tRule
}

// Builder -- user-implemented input-validation and creation of user objects
type Builder interface {
	build(input interface{}) (Result, []error)
}

// Position
type tPosition struct {
	line      int
	column    int
	lineEnd   int
	columnEnd int
}

// NewParser create a parser from a lidy paper
// func NewParser(paper Paper, builderMap map[string]Builder, parserOption Option) (Parser, error) {
// 	if builderMap == nil {
// 		builderMap = make(map[string]Builder)
// 	}

// 	schemaParser := tSchemaParser{
// 		filename:   paper.Name,
// 		builderMap: builderMap,
// 		option:     parserOption,
// 	}

// 	document, err := schemaParser.document(paper.yaml)

// 	if err != nil {
// 		return tOldParser{}, err
// 	}

// 	return tOldParser{
// 		target:     "main",
// 		grammar:    document,
// 		builderMap: builderMap,
// 	}, nil
// }

// NewParserFromExpression Create a parser from a Lidy expression
// It is rarely what you want or need. You should prefer `NewParserFromString`. `NewParserFromExpression` is mostly meant to be used in tests.
// func NewParserFromExpression(expressionText string) (Parser, error) {
// 	var expressionYaml yaml.Node
// 	yaml.Unmarshal([]byte(expressionText), &expressionYaml)
// 	expression, err := unmarshalLidyExpression(expressionYaml)

// 	builderMap := make(map[string]Builder)

// 	if err != nil {
// 		return tParser{builderMap: builderMap}, err
// 	}

// 	ruleMap := make(map[string]tRule)

// 	ruleMap["main"] = tRule{
// 		expression: expression
// 	}

// 	return tParser{
// 		filename: "?",
// 		target:   "main",
// 		grammar: tDocument{
// 			ruleMap: ruleMap,
// 		},
// 		builderMap: builderMap,
// 	}, nil
// }

func (p tOldParser) Parse(content Paper) (Result, []error) {
	if rule, ok := p.grammar.ruleMap[p.target]; ok {
		return rule.match(content.yaml, p)
	}

	return nil, []error{fmt.Errorf("Could not find target rule %s in grammar", p.target)}
}

// // Validator supporting validation of YAML text
// type Validator struct {
// 	target   string
// 	document tDocument
// }

// // ValidateTree accept an interface{} as produced by the go `yaml` module
// func (v Validator) ValidateTree(tree interface{}) error {
// 	return nil
// }

// // ValidateFileOutline accept a fileoutline.FileOutline
// func (v Validator) ValidateFileOutline(fileoutline fo.FileOutline) error {
// 	var node yaml.Node
// 	err := yaml.Unmarshal([]byte(fileoutline.Content), &node)

// 	if err != nil {
// 		panic(err)
// 	}
// 	return nil
// }

// // ValidateString accept a yaml string
// func (v Validator) ValidateString(text string) error {
// 	return v.ValidateFileOutline(fo.FileOutline{Content: text})
// }

// // ValidateFile accept a filename (of a yaml file)
// func (v Validator) ValidateFile(filename string) error {
// 	fileoutline, err := fo.ReadFile(filename)
// 	if err != nil {
// 		return err
// 	}
// 	return v.ValidateFileOutline(fileoutline)
// }

// // ValidatorFromLidyExpression create a validator from a lidy experssion
// // This is motly used for tests.
// func ValidatorFromLidyExpression(expression string) (Validator, error) {
// 	return Validator{
// 		target:   "main",
// 		document: tDocument{},
// 	}, nil
// }

// // ValidatorFromString create a validator from a lidy string
// func ValidatorFromString(text string) (Validator, error) {
// 	return Validator{
// 		target:   "main",
// 		document: tDocument{},
// 	}, nil
// }

// // ValidatorFromFileOutline create a validator from a fileoutline.FileOutline
// func ValidatorFromFileOutline(fileoutline fo.FileOutline) (Validator, error) {
// 	var node yaml.Node
// 	err := yaml.Unmarshal([]byte(fileoutline.Content), &node)

// 	if err != nil {
// 		panic(err)
// 	}
// 	return nil
// }

// // ValidateString accept a yaml string
// func (v Validator) ValidateString(text string) error {
// 	return v.ValidateFileOutline(fo.FileOutline{Content: text})
// }

// // ValidateFile accept a filename (of a yaml file)
// func (v Validator) ValidateFile(filename string) error {
// 	fileoutline, err := fo.ReadFile(filename)
// 	if err != nil {
// 		return err
// 	}
// 	return v.ValidateFileOutline(fileoutline)
// }

// // GetTrue return true
// func GetTrue() bool {
// 	return true
// }

// // GetFalse return false
// func GetFalse() bool {
// 	return false
// }

// // ParseString {} parse a YAML string according to a YAML DSL file
// // Given a yaml source string, and the path to the file describing the DSL, parse the source according to the DSL. Return an Info object.
// func ParseString(data fo.FileOutline, schema fo.FileOutline) interface{} {
// 	return nil
// }

// ParseFile
