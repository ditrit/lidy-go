package lidy

import (
	"fmt"
	"regexp"

	"gopkg.in/yaml.v3"
)

var regexpIdentifier = *regexp.MustCompile("^[a-zA-Z][a-zA-Z0-9_]*(\\.[a-zA-Z][a-zA-Z0-9_]*)*$")

var regexpIdentifierDeclaration = *regexp.MustCompile("^[a-zA-Z][a-zA-Z0-9_]*(\\.[a-zA-Z][a-zA-Z0-9_]*)*(:(:[a-zA-Z][a-zA-Z0-9_]*(\\.[a-zA-Z][a-zA-Z0-9_]*))?)?$")

// lidySchemaParser.go
// implement methods tSchemaParser

// tSchemaParser.document parse a lidy schema document
func (parser tSchemaParser) document(node yaml.Node) (tDocument, error) {
	// Note: The parsing is done in two steps
	// - First create tRule{} entities for all rules of the document
	// - Second, explore each rule value node, to populate the `expression` field of the rule node.
	// This approach allows to substitute identifiers for rule entities while exploring the schema.
	var document tDocument

	if node.Tag != "!!map" {
		return tDocument{}, parser.schemaNodeError(node, "a lidy schema document")
	}

	for k := 1; k < len(node.Content); k += 2 {
		rule, err := parser.createRule(*node.Content[k-1], *node.Content[k])
		if err != nil {
			return tDocument{}, err
		}
		document.ruleMap[rule.ruleName] = rule
	}

	return document, nil
}

func (parser tSchemaParser) createRule(key yaml.Node, value yaml.Node) (tRule, error) {
	if key.Tag != "!!str" {
		return tRule{}, parser.schemaNodeError(key, "a YAML string (an identifier declaration)")
	}

	if !regexpIdentifierDeclaration.MatchString(key.Value) {
		return tRule{}, parser.schemaNodeError(key, "a valid identifier declaration")
	}

	return tRule{
		_node: value,
	}, nil
}

// tSchemaParser.expression parse any lidy schema expression
func (parser tSchemaParser) expression(node yaml.Node) (tExpression, error) {
	switch {
	case node.Tag == "!!str":
		return parser.identifierReference(node)
	case node.Tag != "!!map" || len(node.Content) == 0:
		return nil, parser.schemaNodeError(node, "an expression")
	}

	return parser.checkerExpression(node)
}

func (parser tSchemaParser) identifierReference(node yaml.Node) (tExpression, error) {
	if !regexpIdentifier.MatchString(node.Value) {
		return nil, parser.schemaNodeError(node, "a valid identifier reference (a-zA-Z)(a-zA-Z0-9)+")
	}

	if rule, ok := parser.identifierMap[node.Value]; ok {
		return rule, nil
	}

	return nil, parser.schemaNodeError(node, "the identifier to exist in the document")
}

func (parser tSchemaParser) checkerExpression(node yaml.Node) (tExpression, error) {
	return parser.checkerExpression(node)
}

// Error
func (parser tSchemaParser) schemaNodeError(node yaml.Node, expected string) error {
	position := fmt.Sprintf("$s:%d:%d", parser.filename, node.Line, node.Column)

	return fmt.Errorf("error with lidy node of kind [%s], value \"%s\" at position %s, where [%s] was expected", node.Tag, node.Value, position, expected)
}
