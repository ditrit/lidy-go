package lidy

import (
	"fmt"

	"github.com/ditrit/lidy/lidy-go/errorlist"
)

// lidyCore.go
//
// Supporting the entry points of lidy.go

const pleaseReport = "please report it to https://github.com/ditrit/lidy/issues ."

type tSchemaParser tParser

// parseSchema parses the schema as yaml and lidy schema and stores it
// in the parser object, or return a non-empty error slice.
func (p *tParser) parseSchema() []error {
	// A. Analyse of the headers of rules (rule name and presence of a builder if exported)
	// B. Topological order cycle search
	// C. Rule analysis with report of the errors of the developer
	// -
	// D. Validation of user data, with report of the user
	if p.schema.ruleMap != nil {
		return p.schemaErrorSlice
	}

	// Make sure the schema's Yaml document is loaded
	err := p.Yaml()
	if err != nil {
		return []error{err}
	}
	if p.yaml.Kind == 0 {
		panic("go-yaml didn't load (" + p.name + "). " + pleaseReport)
	}

	// Cast the parser to tSchemaParser so as to be able to invoke methods related to tSchemaParser
	// note: this is possible because the tSchemaParser type is aliased to tParser
	schemaParser := (*tSchemaParser)(p)

	schemaParser.precomputeLidyDefaultRules()

	// first step of processing the yaml schema
	// it produces a schema with a hollow ruleMap
	schema, erl := schemaParser.hollowSchema(p.yaml)

	if erl != nil {
		return erl
	}

	p.schema = schema

	errList := errorlist.List{}

	for ruleName := range schema.ruleMap {
		if _, present := p.lidyDefaultRuleMap[ruleName]; present {
			continue // TODO this should produce an error
		}

		errList.Push(schemaParser.processRule(ruleName))
	}

	p.schemaErrorSlice = errList.ConcatError()

	return p.schemaErrorSlice
}

func (schemaParser *tSchemaParser) processRule(ruleName string) []error {
	errList := errorlist.List{}

	schemaParser.currentRuleName = ruleName
	expression, erl := schemaParser.expression(schemaParser.schema.ruleMap[ruleName]._node)
	schemaParser.currentRuleName = ""

	if len(erl) == 0 && expression == nil {
		node := schemaParser.schema.ruleMap[ruleName]._node
		message := "unknown resolution error. This should not happen, " + pleaseReport
		errList.Push(schemaParser.schemaError(node, message))
	}

	errList.Push(erl)
	schemaParser.schema.ruleMap[ruleName].expression = expression

	return errList.ConcatError()
}

// parseContent apply the schema to the content
func (p *tParser) parseContent(file File) (tResult, []error) {
	// make sure the schema is loaded
	erl := p.Schema()
	if len(erl) > 0 {
		return tResult{}, erl
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
		return tResult{}, []error{fmt.Errorf("could not find target rule '%s' in grammar", p.target)}
	}

	// Parsing the content
	err := file.Yaml()
	if err != nil {
		return tResult{}, []error{err}
	}

	contentFile := file.(*tFile)

	p.contentFile = *contentFile
	defer (func() { p.contentFile = tFile{} })()

	contentRoot, erl := getRoot(contentFile.yaml)

	if len(erl) > 0 {
		return tResult{}, erl
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
