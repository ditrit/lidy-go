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

func (rule tRule) mergeMatch(usefulList []bool, content yaml.Node, parser tParser) (MapResult, []error) {
	result, err := mergeMatchExpression(usefulList, content, rule.expression, parser)

	if len(err) > 0 {
		return MapResult{}, err
	}

	if rule.builder != nil {
		_, err = rule.builder.build(result)
	}

	return result, err
}

// tExpression
func mergeMatchExpression(usefulList []bool, content yaml.Node, expression tExpression, parser tParser) (MapResult, []error) {
	switch mergeable := expression.(type) {
	case tMap:
		return mergeable.mergeMatch(usefulList, content, parser)
	case tOneOf:
		return mergeable.mergeMatch(usefulList, content, parser)
	}

	return MapResult{}, parser.reportSchemaParserInternalError(
		"_merge performed on  a non-mergeable in the schema -- ",
		expression,
		content,
	)
}

// Map
func (mapChecker tMap) match(content yaml.Node, parser tParser) (Result, []error) {
	// Non-maps
	if content.Tag != "!!map" {
		return nil, parser.contentError(content, "a YAML map, "+mapChecker.description())
	}

	// Extra key (preparation)
	// list tracking whether a key-value pair was used or not
	usefulList := make([]bool, len(content.Content)/2)

	mapResult, err := mapChecker.mergeMatch(usefulList, content, parser)

	mapOf := mapChecker.form.mapOf

	errList := errorlist.List{}
	errList.Push(err)

	for k, v := range usefulList {
		if v == false { // "used up"
			continue // skip
		}

		key := content.Content[2*k]
		value := content.Content[2*k+1]

		// mapOf
		// Checking the key
		keyResult, err := mapOf.key.match(*key, parser)
		errList.Push(err)

		if len(err) > 0 {
			continue
		}

		// (if the key is valid)
		// Checking the value
		valueResult, err := mapOf.value.match(*value, parser)
		errList.Push(err)

		if len(err) > 0 {
			continue
		}

		// (if both the key and the value are valid)
		// Adding the key-value pair
		mapResult.MapOf = append(mapResult.MapOf, KeyValueResult{
			key:   keyResult,
			value: valueResult,
		})

		errList.Push(
			parser.contentError(
				content, fmt.Sprintf("no extra property (%s) `%s`", key.Tag, key.Value),
			),
		)
	}

	return mapResult, errList.ConcatError()
}

func (mapChecker tMap) mergeMatch(
	usefulList []bool,
	content yaml.Node,
	parser tParser,
) (MapResult, []error) {
	f := mapChecker.form
	mapResult := MapResult{}
	errList := errorlist.List{}

	// Bad sizing
	errList.Push(mapChecker.sizing.check(content, parser))

	// Missing key (preparation)
	// "toBeFoundRequiredPropertySet"
	requiredSet := make(map[string]bool)
	for key := range f.propertyMap {
		requiredSet[key] = true
	}

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
				usefulList[(k-1)/2] = false
			} else {
				property, found = f.optionalMap[key.Value]
			}

			if found {
				// Matching with the matcher specified for that property
				result, err := property.match(*value, parser)

				errList.Push(err)

				mapResult.Property[key.Value] = result
			}
		}
	}

	// Missing keys (reporting)
	for key := range requiredSet {
		errList.Push(
			parser.contentError(
				content,
				fmt.Sprintf("to find a property %s %s", key, f.propertyMap[key].name()),
			),
		)
	}

	// Merges
	for _, mergeable := range f.mergeList {
		result, err := mergeable.mergeMatch(usefulList, content, parser)
		errList.Push(err)

		mapResult.Merge = append(mapResult.Merge, result)
	}

	return mapResult, errList.ConcatError()
}

// Seq
func (seq tSeq) match(content yaml.Node, parser tParser) (Result, []error) {
	// Non-maps
	if content.Tag != "!!seq" {
		return nil, parser.contentError(content, "a YAML list (seq), "+seq.description())
	}

	seqResult := SeqResult{}
	errList := errorlist.List{}

	// Bad sizing
	errList.Push(seq.sizing.check(content, parser))

	// Going through the fields of the map
	for k, value := range content.Content {
		if k < len(seq.form.tuple) {
			// Tuple (required)
			result, err := seq.form.tuple[k].match(*value, parser)
			errList.Push(err)
			seqResult.Tuple = append(seqResult.Tuple, result)
		} else if k -= len(seq.form.tuple); k < len(seq.form.optionalTuple) {
			// Tuple (optional)
			result, err := seq.form.optionalTuple[k].match(*value, parser)
			errList.Push(err)
			seqResult.Tuple = append(seqResult.Tuple, result)
		} else if seq.form.seqOf != nil {
			// SeqOf (all the rest)
			result, err := seq.form.seqOf.match(*value, parser)
			errList.Push(err)
			seqResult.Seq = append(seqResult.Seq, result)
		} else {
			// Rejecting extra entries (all the rest, if no SeqOf)
			message := fmt.Sprintf(
				"no %dth entry (%s) `%s`",
				k, value.Tag, value.Value,
			)
			errList.Push(parser.contentError(*value, message))
		}
	}

	// Signaling missing keys
	for k := len(content.Content); k < len(seq.form.tuple); k++ {
		message := fmt.Sprintf(
			"a %dth entry %s",
			k, seq.form.tuple[k].description(),
		)
		errList.Push(parser.contentError(content, message))
	}

	return seqResult, errList.ConcatError()
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
	usefulList []bool,
	content yaml.Node,
	parser tParser,
) (MapResult, []error) {
	const errorTemplate = "Lidy internal error -- " +
		"_merge performed on a non-mergeable in _oneOf in the schema -- " +
		"it should have been caught at schema parse time, please report it to https://github.com/ditrit/lidy/issues ." +
		"\n  expression: [%s]" +
		"\n  content: [kind [%s], len %d, value [%s] at position %d:%d]"

	for _, option := range oneOf.optionList {
		if mergeable, ok := option.(tMergeableExpression); ok {
			mapResult, err := mergeable.mergeMatch(usefulList, content, parser)

			if len(err) == 0 {
				return mapResult, nil
			}
		} else {
			return MapResult{}, []error{fmt.Errorf(
				errorTemplate,
				option.description(),
				content.Tag, len(content.Content), content.Value, content.Line, content.Column,
			)}
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

// Regex
func (rxp tRegex) match(content yaml.Node, parser tParser) (Result, []error) {
	contentError := func() []error {
		return parser.contentError(content, fmt.Sprintf("a string (matching the regex [%s])", rxp.regexString))
	}

	if content.Tag != "!!str" {
		return nil, contentError()
	}

	if !rxp.regex.MatchString(content.Value) {
		return nil, contentError()
	}

	return content.Value, nil
}

// Error
func (parser tParser) contentError(content yaml.Node, expected string) []error {
	position := fmt.Sprintf("%s:%d:%d", parser.filename, content.Line, content.Column)

	return []error{fmt.Errorf("error with content node of kind [%s], value \"%s\" at position %s, where [%s] was expected", content.Tag, content.Value, position, expected)}
}

func (parser tParser) reportSchemaParserInternalError(context string, expression tExpression, content yaml.Node) []error {
	return []error{fmt.Errorf(""+
		"Lidy internal error -- "+
		"%s"+
		"it should have been caught at schema parse time, please report it to https://github.com/ditrit/lidy/issues ."+
		"\n  expression: [%s]"+
		"\n  content: [kind [%s], len %d, value [%s] at position %s:%d:%d]"+
		context,
		expression.description(),
		content.Tag, len(content.Content), content.Value,
		parser.filename, content.Line, content.Column,
	)}
}
