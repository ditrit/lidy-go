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
func (rule *tRule) match(content yaml.Node, parser *tParser) (Result, []error) {
	if rule.lidyMatcher != nil {
		return rule.lidyMatcher(content, parser)
	}

	if rule.expression == nil {
		panic("nil expression in rule " + rule.ruleName + "; " + pleaseReport)
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

func (rule tRule) mergeMatch(mapResult MapResult, utilizationTrackingList []bool, content yaml.Node, parser *tParser) []error {
	return mergeMatchExpression(mapResult, utilizationTrackingList, content, rule.expression, parser)
}

// tExpression
func mergeMatchExpression(mapResult MapResult, utilizationTrackingList []bool, content yaml.Node, expression tExpression, parser *tParser) []error {
	switch mergeable := expression.(type) {
	case tMap:
		return mergeable.mergeMatch(mapResult, utilizationTrackingList, content, parser)
	case tOneOf:
		return mergeable.mergeMatch(mapResult, utilizationTrackingList, content, parser)
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
	utilizationTrackingList := make([]bool, len(content.Content)/2)

	mapResult := MapResult{
		Map:   make(map[string]Result),
		MapOf: nil,
	}
	// mapResult.Map = make(map[string]Result)

	erl := mapChecker.mergeMatch(mapResult, utilizationTrackingList, content, parser)

	errList := errorlist.List{}
	errList.Push(erl)

	for k, v := range utilizationTrackingList {
		if v == true { // "used up"
			continue // skip
		}

		key := content.Content[2*k]
		value := content.Content[2*k+1]

		if mapChecker.form.mapOf.key == nil {
			keyValue := yaml.Node{
				Kind:   yaml.ScalarNode,
				Tag:    "!!lidyKvPair",
				Value:  "[" + key.Value + ": " + value.Value + "]",
				Line:   key.Line,
				Column: key.Column,
			}
			errList.Push(parser.contentError(keyValue, "no extra entry"))
			continue
		}

		// mapOf
		// Checking the key
		keyResult, erl := mapChecker.form.mapOf.key.match(*key, parser)
		errList.Push(erl)

		if len(erl) > 0 {
			continue
		}

		// (if the key is valid)
		// Checking the value
		valueResult, erl := mapChecker.form.mapOf.value.match(*value, parser)
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
	}

	return mapResult, errList.ConcatError()
}

func (mapChecker tMap) mergeMatch(
	mapResult MapResult,
	utilizzTrackingList []bool,
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
	for k := 0; k+1 < len(content.Content); k += 2 {
		if utilizzTrackingList[k/2] {
			// don't use the same entry twice
			continue
		}

		key := content.Content[k]
		value := content.Content[k+1]

		// propertyMap
		property, propertyFound := getMapProperty(f.propertyMap, &utilizzTrackingList[k/2], key)
		if propertyFound {
			// Missing keys (updating)
			delete(requiredSet, key.Value)
		} else {
			property, propertyFound = getMapProperty(f.optionalMap, &utilizzTrackingList[k/2], key)
		}

		if propertyFound {
			// Matching with the matcher specified for that property
			result, erl := property.match(*value, parser)

			errList.Push(erl)

			// Assigning without checking the error
			// so that it is now seen as "alreadyAssigned"
			mapResult.Map[key.Value] = result
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
		erl := mergeable.mergeMatch(mapResult, utilizzTrackingList, content, parser)
		errList.Push(erl)
	}

	return errList.ConcatError()
}

func getMapProperty(propertyMap map[string]tExpression, utilized *bool, key *yaml.Node) (tExpression, bool) {
	if propertyMap != nil && key.Tag == "!!str" {
		property, propertyFound := propertyMap[key.Value]

		if propertyFound {
			*utilized = true
		}

		return property, propertyFound
	}

	return nil, false
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
		if option == nil {
			fmt.Printf("aaaaaa, %s\n", oneOf.optionList)
		}
		result, err := option.match(content, parser)
		if len(err) == 0 {
			return result, nil
		}
	}

	return nil, parser.contentError(content, oneOf.description())
}

func (oneOf tOneOf) mergeMatch(
	mapResult MapResult,
	utilizationTrackingList []bool,
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
			err := mergeable.mergeMatch(mapResult, utilizationTrackingList, content, parser)

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

// Yaml document root
func getRoot(documentNode yaml.Node) (*yaml.Node, []error) {
	if documentNode.Kind != yaml.DocumentNode {
		return nil, []error{fmt.Errorf(
			"Internal: Kind of root node is not document (e%d, g%d). %s",
			yaml.DocumentNode, documentNode.Kind, pleaseReport,
		)}
	}

	if len(documentNode.Content) != 1 {
		return nil, []error{fmt.Errorf(
			"Internal: Content lenght of root node is not 1, but %d. %s",
			len(documentNode.Content), pleaseReport,
		)}
	}

	return documentNode.Content[0], nil
}

// Error
func getPosition(content yaml.Node) string {
	return fmt.Sprintf("%d:%d", content.Line, content.Column)
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

func (parser *tParser) contentError(content yaml.Node, expected string) []error {
	if content.Kind == yaml.Kind(0) {
		return []error{fmt.Errorf("Tried to use uninitialised yaml node [node, expected: %s]; %s", expected, pleaseReport)}
	}

	return []error{fmt.Errorf("error with content node, kind #%d, tag '%s', value '%s' at position %s:%s, where [%s] was expected", content.Kind, content.Tag, content.Value, parser.contentFile.name, getPosition(content), expected)}
}
