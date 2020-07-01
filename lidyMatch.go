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
func (rule tRule) match(content yaml.Node, parser *tParser) (Result, []error) {
	if rule.lidyMatcher != nil {
		return rule.lidyMatcher(content, parser)
	}

	result, err := rule.expression.match(content, parser)

	if len(err) > 0 {
		return nil, err
	}

	if rule.builder != nil {
		result, err := rule.builder(result)
		return result, err
	}

	return result, err
}

func (rule tRule) mergeMatch(mapResult MapResult, usefulList []bool, content yaml.Node, parser *tParser) []error {
	return mergeMatchExpression(mapResult, usefulList, content, rule.expression, parser)
}

// tExpression
func mergeMatchExpression(mapResult MapResult, usefulList []bool, content yaml.Node, expression tExpression, parser *tParser) []error {
	switch mergeable := expression.(type) {
	case tMap:
		return mergeable.mergeMatch(mapResult, usefulList, content, parser)
	case tOneOf:
		return mergeable.mergeMatch(mapResult, usefulList, content, parser)
	}

	return parser.reportSchemaParserInternalError(
		"_merge performed on  a non-mergeable in the schema -- ",
		expression,
		content,
	)
}

// Map
func (mapChecker tMap) match(content yaml.Node, parser *tParser) (Result, []error) {
	// Non-maps
	if content.Tag != "!!map" {
		return nil, parser.contentError(content, "a YAML map, "+mapChecker.description())
	}

	// Extra key (preparation)
	// list tracking whether a key-value pair was used or not
	usefulList := make([]bool, len(content.Content)/2)

	mapResult := MapResult{}
	// mapResult.Map = make(map[string]Result)

	erl := mapChecker.mergeMatch(mapResult, usefulList, content, parser)

	mapOf := mapChecker.form.mapOf

	errList := errorlist.List{}
	errList.Push(erl)

	for k, v := range usefulList {
		if v == false { // "used up"
			continue // skip
		}

		key := content.Content[2*k]
		value := content.Content[2*k+1]

		// mapOf
		// Checking the key
		keyResult, erl := mapOf.key.match(*key, parser)
		errList.Push(erl)

		if len(erl) > 0 {
			continue
		}

		// (if the key is valid)
		// Checking the value
		valueResult, erl := mapOf.value.match(*value, parser)
		errList.Push(erl)

		if len(erl) > 0 {
			continue
		}

		// (if both the key and the value are valid)
		// Adding the key-value pair
		mapResult.MapOf = append(mapResult.MapOf, KeyValueResult{
			Key:   keyResult,
			Value: valueResult,
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
	mapResult MapResult,
	usefulList []bool,
	content yaml.Node,
	parser *tParser,
) []error {
	f := mapChecker.form
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
			property, propertyFound := f.propertyMap[key.Value]

			if propertyFound {
				// Missing keys (updating)
				delete(requiredSet, key.Value)
				usefulList[(k-1)/2] = true
			} else {
				property, propertyFound = f.optionalMap[key.Value]
			}

			_, alreadyAssigned := mapResult.Map[key.Value]

			if propertyFound && !alreadyAssigned {
				// Matching with the matcher specified for that property
				result, erl := property.match(*value, parser)

				errList.Push(erl)

				// Assigning without checking the error
				// so that it is now seen as "alreadyAssigned"
				mapResult.Map[key.Value] = result
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
		erl := mergeable.mergeMatch(mapResult, usefulList, content, parser)
		errList.Push(erl)
	}

	return errList.ConcatError()
}

// Seq
func (seq tSeq) match(content yaml.Node, parser *tParser) (Result, []error) {
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
			result, erl := seq.form.tuple[k].match(*value, parser)
			errList.Push(erl)
			seqResult.Tuple = append(seqResult.Tuple, result)
		} else if k -= len(seq.form.tuple); k < len(seq.form.optionalTuple) {
			// Tuple (optional)
			result, erl := seq.form.optionalTuple[k].match(*value, parser)
			errList.Push(erl)
			seqResult.Tuple = append(seqResult.Tuple, result)
		} else if seq.form.seqOf != nil {
			// SeqOf (all the rest)
			result, erl := seq.form.seqOf.match(*value, parser)
			errList.Push(erl)
			seqResult.SeqOf = append(seqResult.SeqOf, result)
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
func (oneOf tOneOf) match(content yaml.Node, parser *tParser) (Result, []error) {
	for _, option := range oneOf.optionList {
		result, err := option.match(content, parser)
		if len(err) == 0 {
			return result, nil
		}
	}

	return nil, parser.contentError(content, oneOf.description())
}

func (oneOf tOneOf) mergeMatch(
	mapResult MapResult,
	usefulList []bool,
	content yaml.Node,
	parser *tParser,
) []error {
	const errorTemplate = "Lidy internal error -- " +
		"_merge performed on a non-mergeable in _oneOf in the schema -- " +
		"it should have been caught at schema parse time, please report it to https://github.com/ditrit/lidy/issues ." +
		"\n  expression: [%s]" +
		"\n  content: [kind [%s], len %d, value [%s] at position %d:%d]"

	for _, option := range oneOf.optionList {
		if mergeable, ok := option.(tMergeableExpression); ok {
			err := mergeable.mergeMatch(mapResult, usefulList, content, parser)

			if len(err) == 0 {
				return nil
			}
		} else {
			return []error{fmt.Errorf(
				errorTemplate,
				option.description(),
				content.Tag, len(content.Content), content.Value, content.Line, content.Column,
			)}
		}
	}

	return parser.contentError(content, oneOf.description())
}

// In
func (in tIn) match(content yaml.Node, parser *tParser) (Result, []error) {
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
func (rxp tRegex) match(content yaml.Node, parser *tParser) (Result, []error) {
	if content.Tag != "!!str" || !rxp.regex.MatchString(content.Value) {
		return nil, parser.contentError(content, fmt.Sprintf("a string (matching the regex [%s])", rxp.regexString))
	}

	return content.Value, nil
}

// Error
func (parser *tParser) contentError(content yaml.Node, expected string) []error {
	position := fmt.Sprintf("%s:%d:%d", parser.name, content.Line, content.Column)

	return []error{fmt.Errorf("error with content node of kind [%s], value '%s' at position %s, where [%s] was expected", content.Tag, content.Value, position, expected)}
}

func (parser *tParser) reportSchemaParserInternalError(context string, expression tExpression, content yaml.Node) []error {
	return []error{fmt.Errorf(""+
		"Lidy internal error -- "+
		"%s"+
		"it should have been caught at schema parse time, "+pleaseReport+
		"\n  expression: [%s]"+
		"\n  content: [kind [%s], len %d, value [%s] at position %s:%d:%d]"+
		context,
		expression.description(),
		content.Tag, len(content.Content), content.Value,
		parser.name, content.Line, content.Column,
	)}
}
