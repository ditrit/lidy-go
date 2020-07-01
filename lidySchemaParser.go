package lidy

import (
	"fmt"
	"log"
	"regexp"
	"strings"

	"github.com/ditrit/lidy/errorlist"
	"gopkg.in/yaml.v3"
)

var regexIdentifier = *regexp.MustCompile("^" +
	"[a-zA-Z][a-zA-Z0-9_]*(\\.[a-zA-Z][a-zA-Z0-9_]*)*$",
)

var regexIdentifierDeclaration = *regexp.MustCompile("^" +
	"[a-zA-Z][a-zA-Z0-9_]*(\\.[a-zA-Z][a-zA-Z0-9_]*)*(:(:" +
	"[a-zA-Z][a-zA-Z0-9_]*(\\.[a-zA-Z][a-zA-Z0-9_]*)" +
	")?)?$",
)

// lidySchemaParser.go
// implement methods tSchemaParser

// tSchemaParser.hollowSchema parse the outline of a lidy schema document
// it fills the `ruleMap` with `tRule` instances whose expression is uncomputed. It errors if the yaml node isn't a map.
func (sp tSchemaParser) hollowSchema(root yaml.Node) (tDocument, []error) {
	// Note: The parsing is done in two steps
	// - First create tRule{} entities for all rules of the document (THIS STEP)
	// - Second, explore each rule value node, to populate the `expression` field of the rule node.
	// This approach allows to substitute identifiers for rule entities while exploring the schema.
	if root.Kind != yaml.DocumentNode {
		return tDocument{}, []error{fmt.Errorf(
			"Internal: Kind of root node is not document (e%d, g%d). %s",
			yaml.DocumentNode, root.Kind, pleaseReport,
		)}
	}

	if len(root.Content) != 1 {
		return tDocument{}, []error{fmt.Errorf(
			"Internal: Content lenght of root node is not 1, but %d. %s",
			len(root.Content), pleaseReport,
		)}
	}

	node := *root.Content[0]

	if node.Kind != yaml.MappingNode {
		return tDocument{}, sp.schemaError(node, "a lidy schema document (kind map)")
	}

	document := tDocument{
		ruleMap: make(map[string]tRule),
	}

	errList := errorlist.List{}

	// lidy default rules
	for key, rule := range sp.lidyDefaultRuleMap {
		document.ruleMap[key] = rule
	}

	// user rules
	for k := 1; k < len(node.Content); k += 2 {
		rule, err := sp.createRule(*node.Content[k-1], *node.Content[k])
		if err != nil {
			return tDocument{}, err
		}
		if _, present := document.ruleMap[rule.ruleName]; present {
			message := "no repeted rule declaration"

			if _, isDefaultRule := sp.lidyDefaultRuleMap[rule.ruleName]; isDefaultRule {
				message = "no redeclaration of lidy default rule"
			}

			errList.Push(sp.schemaError(*node.Content[k-1], message))
		}
		document.ruleMap[rule.ruleName] = rule
	}

	return document, nil
}

func (sp tSchemaParser) createRule(key yaml.Node, value yaml.Node) (tRule, []error) {
	if key.Tag != "!!str" {
		return tRule{}, sp.schemaError(key, "a YAML string (an identifier declaration)")
	}

	if !regexIdentifierDeclaration.MatchString(key.Value) {
		return tRule{}, sp.schemaError(key, "a valid identifier declaration")
	}

	nameSlice := strings.SplitN(key.Value, ":", 3)

	localName := nameSlice[0]
	var builder Builder = nil
	if strings.Contains(key.Value, ":") {
		var exportName string

		exportName = nameSlice[0]

		if nameSlice[1] != "" {
			log.Fatalf("Internal error with rule name parsing of `%s`, %s", key.Value, pleaseReport)
		}

		if strings.Contains(key.Value, "::") {
			exportName = nameSlice[3]
		}

		builder, _ = sp.builderMap[exportName]
	}

	return tRule{
		_node:      value,
		builder:    builder,
		ruleName:   localName,
		expression: nil,
	}, nil
}

// tSchemaParser.expression parse any lidy schema expression
func (sp tSchemaParser) expression(node yaml.Node) (tExpression, []error) {
	switch {
	case node.Tag == "!!str":
		return sp.identifierReference(node)
	case node.Kind != yaml.MappingNode || len(node.Content) == 0:
		return nil, sp.schemaError(node, "an expression (a rule identifier or a YAML map)")
	}

	return sp.formRecognizer(node)
}

func (sp tSchemaParser) identifierReference(node yaml.Node) (tExpression, []error) {
	if !regexIdentifier.MatchString(node.Value) {
		return nil, sp.schemaError(node, "a valid identifier reference (a-zA-Z)(a-zA-Z0-9_)+")
	}

	if rule, ok := sp.schema.ruleMap[node.Value]; ok {
		return rule, nil
	}

	if sp.option.BypassMissingRule {
		sp.schema.ruleMap[node.Value] = sp.schema.ruleMap["any"]
		return sp.schema.ruleMap["any"], nil
	}

	return nil, sp.schemaError(node, "the identifier to exist in the document")
}

// formRecognizer
// match any checker form
func (sp tSchemaParser) formRecognizer(node yaml.Node) (tExpression, []error) {
	form := ""
	checker := missingChecker

	keyword := ""
	mustBeMapOrSequence := false
	conflictingForm := ""

	formMap := make(map[string]yaml.Node)
	errList := errorlist.List{}

	setForm := func(newForm string, key string, newChecker tChecker) {
		if form != "" && form != newForm {
			conflictingForm = newForm
		} else if mustBeMapOrSequence && newForm != "map" && newForm != "sequence" {
			conflictingForm = newForm
		} else {
			form = newForm
			checker = newChecker

			if keyword == "" {
				keyword = key
			}
		}
	}

	for k := 0; k+1 < len(node.Content); k += 2 {
		keyNode := node.Content[k]
		value := node.Content[k+1]

		// reject non-string "keywords"
		if keyNode.Tag != "!!str" {
			errList.Push(sp.schemaError(*keyNode, "only string keys"))
			continue
		}

		// update formMap with the content values
		key := keyNode.Value
		formMap[key] = *value

		// identifying the form
		switch key {
		case "_map", "_mapOf", "_merge":
			setForm("map", key, mapChecker)
		case "_seq", "_tuple":
			setForm("sequence", key, seqChecker)
		case "_oneOf":
			setForm("oneOf", key, oneOfChecker)
		case "_in":
			setForm("in", key, inChecker)
		case "_regex":
			setForm("regex", key, regexChecker)
		case "_optional", "_min", "_max", "_nb":
			if form != "" && form != "map" && form != "sequence" {
				errList.Push(sp.schemaError(*keyNode, fmt.Sprintf(
					"only keywords compatible with form '%s' (resulting from keyword '%s')",
					form, keyword,
				)))
			} else {
				mustBeMapOrSequence = true
			}
			if keyword != "" {
				keyword = key
			}
		default:
			errList.Push(sp.schemaError(*keyNode, "a valid lidy keyword"))
		}

		// process conflicts
		if conflictingForm != "" {
			errList.Push(sp.schemaError(*keyNode, fmt.Sprintf(
				"no keyword whose form %s conflicts with keyword %s of form %s",
				conflictingForm, keyword, form,
			)))

			conflictingForm = ""
		}
	}

	result, erl := checker(sp, node, formMap)

	errList.Push(erl)

	return result, errList.ConcatError()
}

// missingChecker (formRecognizer didn't detect a form)
func missingChecker(sp tSchemaParser, node yaml.Node, formMap tFormMap) (tExpression, []error) {
	return nil, sp.schemaError(node, "a recognisable lidy form")
}

// Error
func (sp tSchemaParser) schemaError(node yaml.Node, expected string) []error {
	position := fmt.Sprintf("%s:%d:%d", sp.name, node.Line, node.Column)

	return []error{fmt.Errorf("error in schema with yaml node of kind [%s], value '%s' at position %s, where [%s] was expected", node.ShortTag(), node.Value, position, expected)}
}
