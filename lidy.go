package lidy

import (
	"fmt"

	"gopkg.in/yaml.v3"
)

// Parser -- able to validate and build a yaml content
type Parser interface {
	Parse(content Paper) (interface{}, error)
}

type ParserOption struct {
	warnUnimplementedBuilder bool
	ignoreExtraBuilder       bool
}

var _ Parser = tParser{}

type tParser struct {
	filename   string
	target     string
	grammar    tDocument
	builderMap map[string]Builder
}

type tSchemaParser struct {
	filename string
	option
	builderMap map[string]Builder
}

// Builder -- user-implemented input-validation and creation of user objects
type Builder interface {
	build(input interface{}) (interface{}, error)
}

// NewParser create a parser from a lidy paper
func NewParser(paper Paper, builderMap map[string]Builder, parserOption ParserOption) (Parser, error) {
	var schemaParser tSchemaParser
	expression, err := schemaParser.expression(paper.yaml)

	if builderMap == nil {
		builderMap = make(map[string]Builder)
	}

	if err != nil {
		return tParser{builderMap: builderMap}, err
	}

	ruleMap := make(map[string]tRule)

	ruleMap["main"] = tRule{
		isExported: false,
		expression: expression,
	}

	return tParser{
		target: "main",
		grammar: tDocument{
			ruleMap: ruleMap,
		},
		builderMap: builderMap,
	}, nil
}

// NewParserFromExpression Create a parser from a Lidy expression
// It is rarely what you want or need. You should prefer `NewParserFromString`. `NewParserFromExpression` is mostly meant to be used in tests.
func NewParserFromExpression(expressionText string) (Parser, error) {
	var expressionYaml yaml.Node
	yaml.Unmarshal([]byte(expressionText), &expressionYaml)
	expression, err := unmarshalLidyExpression(expressionYaml)

	builderMap := make(map[string]Builder)

	if err != nil {
		return tParser{builderMap: builderMap}, err
	}

	ruleMap := make(map[string]tRule)

	ruleMap["main"] = tRule{
		isExported: false,
		expression: expression,
	}

	return tParser{
		filename: "?",
		target:   "main",
		grammar: tDocument{
			ruleMap: ruleMap,
		},
		builderMap: builderMap,
	}, nil
}

func (p tParser) Parse(content Paper) (interface{}, error) {
	if rule, ok := p.grammar.ruleMap[p.target]; ok {
		result, err := rule.apply(content.yaml)

		return result, err
	}
	var noResult struct{}
	var err error = fmt.Errorf("Could not find target rule %s in grammar", p.target)

	return noResult, err
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
