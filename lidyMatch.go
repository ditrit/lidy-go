package lidy

import (
	"fmt"

	"gopkg.in/yaml.v3"
)

// lidyMatch.go
// match() and mergeMatch()

// tIdentifierReference
func (reference tIdentifierReference) match(content yaml.Node, parser tParser) (Result, []error) {
	result, err := reference.rule.expression.match(content, parser)

	if len(err) > 0 {
		return nil, err
	}

	if reference.rule.builder != nil {
		result, err := reference.rule.builder.build(result)
		return result, err
	}

	return result, err
}

func (reference tIdentifierReference) mergeMatch(content yaml.Node, parser tParser) (Result, []error) {
	result, err := mergeMatchExpression(content, reference.rule.expression, parser)

	if len(err) > 0 {
		return nil, err
	}

	if reference.rule.builder != nil {
		_, err = reference.rule.builder.build(result)
	}

	if len(err) > 0 {
		return nil, err
	}

	return result, err
}

// tExpression
func mergeMatchExpression(content yaml.Node, expression tExpression, parser tParser) (Result, []error) {
	switch mergeable := expression.(type) {
	case tMap:
		return mergeable.mergeMatch(content, parser)
	case tOneOf:
		return mergeable.mergeMatch(content, parser)
	}

	const errorTemplate = "Lidy internal error -- " +
		"_merge performed on  a non-mergeable in the schema -- " +
		"it should have been caught at schema parse time, please report it." +
		"\n  expression: [%s]" +
		"\n  content: [%s]" +
		"\n  parser: [%s]"

	return nil, []error{fmt.Errorf(errorTemplate, expression, content, parser)}
}

// tMap
func (mapChecker tMap) match(content yaml.Node, parser tParser) (Result, []error) {
	f := mapChecker.form
	switch {
	case f.propertyMap != nil && f.mapOf.key != nil:
		mapMapOfMatch(f.propertyMap, f.mapOf, content, parser)
	}
	return nil, nil
}

func mapMapOfMatch(propertyMap map[string]tExpression, mapOf tKeyValueExpression, content yaml.Node, parser tParser) {
	mapResult := MapResult{}
	errorListList := [][]error{}

	for k := 1; k < len(content.Content); k += 2 {
		key := content.Content[k-1]
		value := content.Content[k]

		if key.Tag == "!!str" {
			if property, ok := propertyMap[key.Value]; ok {
				result, err := property.match(*value, parser)

				if len(err) > 0 {
					errorListList = append(errorListList, err)
				}
			}
		}

		if err != nil {
			return tDocument{}, err
		}
		document.ruleMap
	}

	for key, expression := range mapChecker.form.propertyMap {
	}

	return mapResult, util.concatError(errorListList)
}
