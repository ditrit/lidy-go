package lidy

import (
	"fmt"

	"github.com/ditrit/lidy/errorlist"
	"gopkg.in/yaml.v3"
)

// lidyMatch.go
// match() and mergeMatch()

// tRule
func (rule tRule) match(content yaml.Node, parser tParser) (Result, []error) {
	result, err := rule.expression.match(content, parser)

	if len(err) > 0 {
		return nil, err
	}

	if rule.builder != nil {
		result, err := rule.builder.build(result)
		return result, err
	}

	return result, err
}

// tIdentifierReference
func (reference tIdentifierReference) match(content yaml.Node, parser tParser) (Result, []error) {
	return reference.rule.match(content, parser)
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
		multiMapMatch(f.propertyMap, f.mapOf, content, parser)
	}
	return nil, nil
}

func multiMapMatch(propertyMap map[string]tExpression, mapOf tKeyValueExpression, content yaml.Node, parser tParser) (Result, []error) {
	mapResult := MapResult{}
	errList := errorlist.List{}

	for k := 1; k < len(content.Content); k += 2 {
		key := content.Content[k-1]
		value := content.Content[k]

		if key.Tag == "!!str" {
			if property, ok := propertyMap[key.Value]; ok {
				result, err := property.match(*value, parser)

				errList.MaybeAppendError(err)

				mapResult.Property[key.Value] = result

				continue
			}
		}

		keyResult, err := mapOf.key.match(*key, parser)
		errList.MaybeAppendError(err)

		valueResult, err := mapOf.value.match(*value, parser)
		errList.MaybeAppendError(err)

		mapResult.MapOf = append(mapResult.MapOf, KeyValueResult{
			key:   keyResult,
			value: valueResult,
		})
	}

	for key, expression := range propertyMap {
	}

	return mapResult, errList.ConcatError()
}

// OneOf
func (oneOf tOneOf) match(content yaml.Node, parser tParser) (Result, []error) {
	for _, option := range oneOf.optionList {
		result, err := option.match(content, parser)
		if len(err) == 0 {
			return result, nil
		}
	}

	return nil, parser.contentError(content, oneOf.description())
}

// In
func (in tIn) match(content yaml.Node, parser tParser) (Result, []error) {
	if acceptList, found := in.valueMap[content.Tag]; found {
		for _, accept := range acceptList {
			if content.Value == accept {
				return content.Value, nil
			}
		}
	}

	return nil, parser.contentError(content, in.description())
}

// Regexp
func (rxp tRegexp) match(content yaml.Node, parser tParser) (Result, []error) {
	contentError := func() []error {
		return parser.contentError(content, fmt.Sprintf("a string (matching the regexp [%s])", rxp.regexpString))
	}

	if content.Tag != "!!str" {
		return nil, contentError()
	}

	if !rxp.regexp.MatchString(content.Value) {
		return nil, contentError()
	}

	return content.Value, nil
}

// Error
func (parser tParser) contentError(content yaml.Node, expected string) []error {
	position := fmt.Sprintf("$s:%d:%d", parser.filename, content.Line, content.Column)

	return []error{fmt.Errorf("error with content node of kind [%s], value \"%s\" at position %s, where [%s] was expected", content.Tag, content.Value, position, expected)}
}
