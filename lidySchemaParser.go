package lidy

import (
	"fmt"
	"regexp"

	"gopkg.in/yaml.v3"
)

// lidySchemaParser.go
// implement methods tSchemaParser

// tSchemaParser.document parse a lidy schema document
func (parser tSchemaParser) document(node yaml.Node) (tDocument, error) {
	var document tDocument

	if node.Tag != "!!map" {
		return tDocument{}, parser.schemaNodeError(node, "a lidy schema document")
	}

	for k := 1; k < len(node.Content); k += 2 {
		rule, err := createRule(node.Content[k-1], node.Content[k])
		if err != nil {
			return tDocument{}, err
		}
		document.ruleMap
	}

	switch {
	case node.Tag == "!!str":
		return parser.identifierReference(node)
	case node.Tag != "!!map" || len(node.Content) == 0:
		return nil, schemaNodeError(node, "an expression")
	}

	return document, nil
}

func createRule(key yaml.Node, value yaml.Node) (tRule, error) {
	return tRule{
		_node: value,
	}
}

// tSchemaParser.expression parse any lidy schema expression
func (parser tSchemaParser) expression(node yaml.Node) (tExpression, error) {
	switch {
	case node.Tag == "!!str":
		return parser.identifierReference(node)
	case node.Tag != "!!map" || len(node.Content) == 0:
		return nil, schemaNodeError(node, "an expression")
	}

	return parser.checkerExpression(node)
}

var regexIdentifier = *regexp.MustCompile("^[a-zA-Z][a-zA-Z0-9_]*(\\.[a-zA-Z][a-zA-Z0-9_]*)*$")

var regexIdentifierDeclaration = *regexp.MustCompile("^[a-zA-Z][a-zA-Z0-9_]*(\\.[a-zA-Z][a-zA-Z0-9_]*)*(:(:[a-zA-Z][a-zA-Z0-9_]*(\\.[a-zA-Z][a-zA-Z0-9_]*))?)?$")

func (parser tSchemaParser) identifierReference(node yaml.Node) (tExpression, error) {
	if !regexIdentifier.MatchString(node.Value) {
		return nil, parser.schemaNodeError(node, "a valid identifier (a-zA-Z)(a-zA-Z0-9)+")
	}

	if rule, ok := parser.identifierMap[node.Value]; ok {
		reference := tIdentifierReference{
			name: node.Value,
			rule: rule,
		}

		return reference, nil
	}

	return nil, parser.schemaNodeError(node, "the identifier to exist")
}

func (parser tSchemaParser) checkerExpression(node yaml.Node) (tExpression, error) {
	return parser.checkerExpression(node)
}

// Error
func (parser tSchemaParser) schemaNodeError(node yaml.Node, expected string) error {
	position := fmt.Sprintf("$s:%d:%d", parser.filename, node.Line, node.Column)

	return fmt.Errorf("error with lidy node of kind [%s], value \"%s\" at position %s, where [%s] was expected", node.Tag, node.Value, position, expected)
}
