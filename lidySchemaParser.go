package lidy

import (
	"fmt"
	"log"
	"regexp"
	"strings"

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
	// - First create tRule{} entities for all rules of the document
	// - Second, explore each rule value node, to populate the `expression` field of the rule node.
	// This approach allows to substitute identifiers for rule entities while exploring the schema.
	document := tDocument{make(map[string]tRule)}

	if root.Kind != yaml.DocumentNode {
		return tDocument{}, []error{fmt.Errorf(
			"Kind of root node is not document (e%d, g%d). %s",
			yaml.DocumentNode, root.Kind, pleaseReport,
		)}
	}

	if len(root.Content) != 1 {
		return tDocument{}, []error{fmt.Errorf(
			"Content lenght of root node is not 1, but %d. %s",
			len(root.Content), pleaseReport,
		)}
	}

	node := *root.Content[0]

	if node.Kind != yaml.MappingNode {
		return tDocument{}, sp.schemaNodeError(node, "a lidy schema document (kind map)")
	}

	for k := 1; k < len(node.Content); k += 2 {
		rule, err := sp.createRule(*node.Content[k-1], *node.Content[k])
		if err != nil {
			return tDocument{}, err
		}
		document.ruleMap[rule.ruleName] = rule
	}

	return document, nil
}

func (sp tSchemaParser) createRule(key yaml.Node, value yaml.Node) (tRule, []error) {
	if key.Tag != "!!str" {
		return tRule{}, sp.schemaNodeError(key, "a YAML string (an identifier declaration)")
	}

	if !regexIdentifierDeclaration.MatchString(key.Value) {
		return tRule{}, sp.schemaNodeError(key, "a valid identifier declaration")
	}

	var builder Builder = nil
	var localName string
	if strings.Contains(key.Value, ":") {
		var exportName string

		slice := strings.SplitN(key.Value, ":", 3)
		localName = slice[0]
		exportName = slice[0]

		if slice[1] != "" {
			log.Fatalf("Internal error with rule name parsing of `%s`, %s", key.Value, pleaseReport)
		}

		if strings.Contains(key.Value, "::") {
			exportName = slice[3]
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
	case node.Tag != "!!map" || len(node.Content) == 0:
		return nil, sp.schemaNodeError(node, "an expression")
	}

	return sp.checkerExpression(node)
}

func (sp tSchemaParser) identifierReference(node yaml.Node) (tExpression, []error) {
	if !regexIdentifier.MatchString(node.Value) {
		return nil, sp.schemaNodeError(node, "a valid identifier reference (a-zA-Z)(a-zA-Z0-9_)+")
	}

	if rule, ok := sp.schema.ruleMap[node.Value]; ok {
		return rule, nil
	}

	if sp.option.BypassMissingRule {
		sp.schema.ruleMap[node.Value] = sp.schema.ruleMap["any"]
		return sp.schema.ruleMap["any"], nil
	}

	return nil, sp.schemaNodeError(node, "the identifier to exist in the document")
}

func (sp tSchemaParser) checkerExpression(node yaml.Node) (tExpression, []error) {
	return nil, nil
	// return sp.checkerExpression(node)
}

// Error
func (sp tSchemaParser) schemaNodeError(node yaml.Node, expected string) []error {
	position := fmt.Sprintf("%s:%d:%d", sp.name, node.Line, node.Column)

	return []error{fmt.Errorf("error in schema with yaml node of kind [%s], value '%s' at position %s, where [%s] was expected", node.ShortTag(), node.Value, position, expected)}
}
