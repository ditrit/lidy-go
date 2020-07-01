package lidy

import (
	"fmt"

	"github.com/ditrit/lidy/errorlist"
)

// lidyCore.go
//
// Supporting the entry points of lidy.go

const pleaseReport = "please report it to https://github.com/ditrit/lidy/issues ."

type tSchemaParser tParser

// NewParser create a parser from a lidy paper
func (p *tParser) parseSchema() []error {
	if p.schema.ruleMap != nil {
		return nil
	}

	// Make sure the schema's Yaml document is loaded
	err := p.Yaml()
	if err != nil {
		return []error{err}
	}
	if p.yaml.Kind == 0 {
		panic("yaml didn't load (" + p.name + "). " + pleaseReport)
	}

	schemaParser := (*tSchemaParser)(p)

	schemaParser.precomputeLidyDefaultRules()

	schema, erl := schemaParser.hollowSchema(p.yaml)

	if erl != nil {
		return erl
	}

	schemaParser.schema = schema

	errList := errorlist.List{}

	for ruleName, rule := range schema.ruleMap {
		if _, present := p.lidyDefaultRuleMap[ruleName]; present {
			continue
		}

		expression, erl := schemaParser.expression(rule._node)
		if len(erl) == 0 && expression == nil {
			errList.Push(schemaParser.schemaError(rule._node, "unknown resolution error. This should not happen, "+pleaseReport))
		}

		errList.Push(erl)
		rule.expression = expression
		schema.ruleMap[ruleName] = rule
	}

	return errList.ConcatError()
}

// parseContent apply the schema to the content
func (p *tParser) parseContent(file File) (Result, []error) {
	// make sure the schema is loaded
	erl := p.Schema()
	if len(erl) > 0 {
		return nil, erl
	}

	// assert that the schema is valid; that the schema parser works
	// as intended
	for name, rule := range p.schema.ruleMap {
		if rule.ruleName != name {
			panic("non-matching rulename rule " + name + "/" + rule.ruleName)
		}
		if _, present := p.lidyDefaultRuleMap[name]; present {
			continue
		}
		if rule.expression == nil {
			panic("nil rule expression for rule " + name)
		}
	}

	// Checking that the target rule is present
	targetRule, ruleFound := p.schema.ruleMap[p.target]
	if !ruleFound {
		return nil, []error{fmt.Errorf("Could not find target rule '%s' in grammar", p.target)}
	}

	// Parsing the content
	err := file.Yaml()
	if err != nil {
		return nil, []error{err}
	}

	contentFile := file.(*tFile)

	p.contentFile = *contentFile

	contentRoot, erl := getRoot(contentFile.yaml)

	if len(erl) > 0 {
		return nil, erl
	}

	// defer func() {
	// 	if r := recover(); r != nil {
	// 		if !strings.Contains(fmt.Sprintf("%s", r), "one error found, exiting") {
	// 			panic(r)
	// 		}
	// 		fmt.Println("Recovered in `parseContent`, from", r)
	// 	}
	// }()

	return targetRule.match(*contentRoot, p)
}
