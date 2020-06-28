package lidy

import (
	"fmt"
	"regexp"

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
func (sp tSchemaParser) hollowSchema(node yaml.Node) (tDocument, []error) {
	// Note: The parsing is done in two steps
	// - First create tRule{} entities for all rules of the document
	// - Second, explore each rule value node, to populate the `expression` field of the rule node.
	// This approach allows to substitute identifiers for rule entities while exploring the schema.
	var document tDocument

	if node.Tag != "!!map" {
		return tDocument{}, sp.schemaNodeError(node, "a lidy schema document")
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

	return tRule{
		_node: value,
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

	return nil, sp.schemaNodeError(node, "the identifier to exist in the document")
}

func (sp tSchemaParser) checkerExpression(node yaml.Node) (tExpression, []error) {
	return sp.checkerExpression(node)
}

// Error
func (sp tSchemaParser) schemaNodeError(node yaml.Node, expected string) []error {
	position := fmt.Sprintf("%s:%d:%d", sp.name, node.Line, node.Column)

	return []error{fmt.Errorf("error with lidy node of kind [%s], value \"%s\" at position %s, where [%s] was expected", node.Tag, node.Value, position, expected)}
}
