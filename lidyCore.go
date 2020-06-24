package lidy

import (
	"fmt"

	"gopkg.in/yaml.v3"
)

// lidyCore.go
// implement methods for core types like tRule and tExpression

func (r tRule) apply(content yaml.Node) (interface{}, error) {
	return nil, nil
}

func parseLidyExpression(node yaml.Node, context tSchemaContext) (tExpression, error) {
	switch {
	case node.Tag == "!!str":
		return parseLidyIdentifierReference(node)
	case node.Tag != "!!map":
		return nil, lidyNodeError(node, "an expression")
	case true:
		return nil, nil
	}
	return nil, nil
}

func lidyNodeError(node yaml.Node, expected string) error {
	position := fmt.Sprintf("%d:%d", node.Line, node.Column)
	return fmt.Errorf("error with lidy node of kind [%s], value \"%s\" at position %s, where [%s] was expected", node.Tag, node.Value, position, expected)
}
