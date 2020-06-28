package lidy

import (
	"fmt"

	"github.com/ditrit/lidy/errorlist"
)

// lidyCore.go
//
// Supporting the entry points of lidy.go

type tSchemaParser tParser

// NewParser create a parser from a lidy paper
func (p tParser) parseSchema() []error {
	schemaParser := tSchemaParser(p)

	schema, err := schemaParser.hollowSchema(p.yaml)

	if err != nil {
		return err
	}

	schemaParser.schema = schema

	errList := errorlist.List{}

	for _, rule := range schema.ruleMap {
		expression, erl := schemaParser.expression(rule._node)
		errList.Push(erl)
		rule.expression = expression
	}

	return err
}

func (p tParser) parseContent(content File) (Result, []error) {
	file := content.(tFile)

	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Recovered in `parseContent`, from", r)
		}
	}()

	if rule, ok := p.schema.ruleMap[p.target]; ok {
		return rule.match(file.yaml, p)
	}

	return nil, []error{fmt.Errorf("Could not find target rule %s in grammar", p.target)}
}
