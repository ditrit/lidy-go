package lidy

import (
	"fmt"

	"github.com/ditrit/lidy/errorlist"
	"gopkg.in/yaml.v3"
)

// lidyMatch.go
//
// Implement match() and mergeMatch() on tExpression and tMergeableExpression

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

func (rule tRule) mergeMatch(requiredSet map[string]bool, content yaml.Node, parser tParser) (MapResult, []error) {
	result, err := mergeMatchExpression(requiredSet, content, rule.expression, parser)

	if len(err) > 0 {
		return MapResult{}, err
	}

	if rule.builder != nil {
		_, err = rule.builder.build(result)
	}

	return result, err
}

// tExpression
func mergeMatchExpression(requiredSet map[string]bool, content yaml.Node, expression tExpression, parser tParser) (MapResult, []error) {
	switch mergeable := expression.(type) {
	case tMap:
		return mergeable.mergeMatch(requiredSet, content, parser)
	case tOneOf:
		return mergeable.mergeMatch(requiredSet, content, parser)
	}

	const errorTemplate = "Lidy internal error -- " +
		"_merge performed on  a non-mergeable in the schema -- " +
		"it should have been caught at schema parse time, please report it to https://github.com/ditrit/lidy/issues ." +
		"\n  expression: [%s]" +
		"\n  content: [%s]" +
		"\n  parser: [%s]"

	return MapResult{}, []error{fmt.Errorf(errorTemplate, expression, content, parser)}
}

// Map
func (mapChecker tMap) match(content yaml.Node, parser tParser) (Result, []error) {
	// Non-maps
	if content.Tag != "!!map" {
		return nil, parser.contentError(content, "a YAML map, "+mapChecker.description())
	}

	f := mapChecker.form

	// Missing key (preparation)
	// "toBeFoundRequiredPropertySet"
	requiredSet := make(map[string]bool)
	for key := range f.propertyMap {
		requiredSet[key] = true
	}

	mapResult, err := mapChecker.mergeMatch(requiredSet, content, parser)

	errList := errorlist.List{}
	errList.MaybeAppendError(err)

	// Missing keys (reporting)
	for key := range requiredSet {
		errList.MaybeAppendError(
			parser.contentError(
				content,
				fmt.Sprintf("to find a property %s %s", key, f.propertyMap[key].name()),
			),
		)
	}

	return mapResult, errList.ConcatError()
}

func (mapChecker tMap) mergeMatch(
	requiredSet map[string]bool,
	content yaml.Node,
	parser tParser,
) (MapResult, []error) {
	f := mapChecker.form
	mapResult := MapResult{}
	errList := errorlist.List{}

	// Bad sizing
	errList.MaybeAppendError(mapChecker.sizing.check(content, parser))

	// Going through the fields of the map
	for k := 1; k < len(content.Content); k += 2 {
		key := content.Content[k-1]
		value := content.Content[k]

		// propertyMap
		if f.propertyMap != nil && key.Tag == "!!str" {
			property, found := f.propertyMap[key.Value]

			if found {
				// Missing keys (updating)
				delete(requiredSet, key.Value)
			} else {
				property, found = f.optionalMap[key.Value]
			}

			if found {
				// Matching with the matcher specified for that property
				result, err := property.match(*value, parser)

				errList.MaybeAppendError(err)

				mapResult.Property[key.Value] = result

				continue
			}
		}

		// Rejecting extra keys
		if f.mapOf.key == nil {
			errList.MaybeAppendError(
				parser.contentError(
					content, fmt.Sprintf("no property `%s`", key.Value),
				),
			)
		}

		// mapOf
		// Checking the key
		keyResult, err := f.mapOf.key.match(*key, parser)
		errList.MaybeAppendError(err)

		if len(err) > 0 {
			continue
		}

		// (if the key is valid)
		// Checking the value
		valueResult, err := f.mapOf.value.match(*value, parser)
		errList.MaybeAppendError(err)

		if len(err) > 0 {
			continue
		}

		// (if both the key and the value are valid)
		// Adding the key-value pair
		mapResult.MapOf = append(mapResult.MapOf, KeyValueResult{
			key:   keyResult,
			value: valueResult,
		})
	}

	for _, mergeable := range f.mergeList {
		result, err := mergeable.mergeMatch(requiredSet, content, parser)
		errList.MaybeAppendError(err)

		mapResult.Merge = append(mapResult.Merge, result)
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

func (oneOf tOneOf) mergeMatch(
	requiredSet map[string]bool,
	content yaml.Node,
	parser tParser,
) (MapResult, []error) {
	const errorTemplate = "Lidy internal error -- " +
		"_merge performed on a non-mergeable in _oneOf in the schema -- " +
		"it should have been caught at schema parse time, please report it to https://github.com/ditrit/lidy/issues ." +
		"\n  expression: [%s]" +
		"\n  content: [%s]" +
		"\n  parser: [%s]"

	for _, option := range oneOf.optionList {
		if mergeable, ok := option.(tMergeableExpression); ok {
			mapResult, err := mergeable.mergeMatch(requiredSet, content, parser)

			if len(err) == 0 {
				return mapResult, nil
			}
		} else {
			return MapResult{}, []error{fmt.Errorf(errorTemplate, option, content, parser)}
		}
	}

	return MapResult{}, parser.contentError(content, oneOf.description())
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
