package lidy

import (
	"fmt"
	"strings"

	"github.com/ditrit/lidy/errorlist"
)

// lidyCore.go
//
// Supporting the entry points of lidy.go

const pleaseReport = "please report it to https://github.com/ditrit/lidy/issues ."

type tSchemaParser tParser

// NewParser create a parser from a lidy paper
func (p *tParser) parseSchema() []error {
	schemaParser := (*tSchemaParser)(p)

	schemaParser.precomputeLidyDefaultRules()

	schema, err := schemaParser.hollowSchema(p.yaml)

	if err != nil {
		return err
	}

	schemaParser.schema = schema

	errList := errorlist.List{}

	for ruleName, rule := range schema.ruleMap {
		if _, present := p.lidyDefaultRuleMap[ruleName]; present {
			continue
		}
		if ruleName == "main" {
			fmt.Println("rule main")
		}

		expression, erl := schemaParser.expression(rule._node)
		errList.Push(erl)
		rule.expression = expression
	}

	return errList.ConcatError()
}

// parseContent apply the schema to the content
func (p *tParser) parseContent(content File) (Result, []error) {
	file := content.(*tFile)

	defer func() {
		if r := recover(); r != nil {
			if !strings.Contains(fmt.Sprintf("%s", r), "one error found, exiting") {
				panic(r)
			}
			fmt.Println("Recovered in `parseContent`, from", r)
		}
	}()

	if rule, ok := p.schema.ruleMap[p.target]; ok {
		return rule.match(file.yaml, p)
	}

	return nil, []error{fmt.Errorf("Could not find target rule '%s' in grammar", p.target)}
}
