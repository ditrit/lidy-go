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
func (rule *tRule) match(content yaml.Node, parser *tParser) (tResult, []error) {
	if rule.lidyMatcher != nil {
		return rule.lidyMatcher(content, parser)
	}

	if rule.expression == nil {
		panic("nil expression in rule " + rule.ruleName + "; " + pleaseReport)
	}

	result, err := rule.expression.match(content, parser)

	if len(err) > 0 {
		return tResult{}, err
	}

	if rule.builder != nil {
		data, err := rule.builder(result)
		result := parser.wrap(data, content)
		result.ruleName = rule.ruleName
		return result, err
	}

	return result, err
}

func (rule tRule) mergeMatch(mapResult MapData, utilizationTrackingList []bool, content yaml.Node, parser *tParser) []error {
	return mergeMatchExpression(mapResult, utilizationTrackingList, content, rule.expression, parser)
}

// tExpression
func mergeMatchExpression(mapResult MapData, utilizationTrackingList []bool, content yaml.Node, expression tExpression, parser *tParser) []error {
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
func (mapChecker tMap) match(content yaml.Node, parser *tParser) (tResult, []error) {
	// Non-maps
	if content.Tag != "!!map" {
		return tResult{}, parser.contentError(content, "a YAML map, "+mapChecker.description())
	}

	// Extra key (preparation)
	// list tracking whether a key-value pair was used or not
	utilizationTrackingList := make([]bool, len(content.Content)/2)

	mapData := MapData{
		Map:   make(map[string]Result),
		MapOf: nil,
	}
	// mapResult.Map = make(map[string]Result)

	erl := mapChecker.mergeMatch(mapData, utilizationTrackingList, content, parser)

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
		mapData.MapOf = append(mapData.MapOf, KeyValueData{
			Key:   keyResult,
			Value: valueResult,
		})
	}

	return parser.wrap(mapData, content), errList.ConcatError()
}

func (mapChecker tMap) mergeMatch(
	mapResult MapData,
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

// List
func (list tList) match(content yaml.Node, parser *tParser) (tResult, []error) {
	// Non-maps
	if content.Tag != "!!seq" {
		return tResult{}, parser.contentError(content, "a YAML list (seq), "+list.description())
	}

	listData := ListData{}
	errList := errorlist.List{}

	// Bad sizing
	errList.Push(list.sizing.check(content, parser))

	// Going through the fields of the map
	for k, value := range content.Content {
		if k < len(list.form.list) {
			// List (required)
			result, erl := list.form.list[k].match(*value, parser)
			errList.Push(erl)
			listData.List = append(listData.List, result)
		} else if k -= len(list.form.list); k < len(list.form.optionalList) {
			// List (optional)
			result, erl := list.form.optionalList[k].match(*value, parser)
			errList.Push(erl)
			listData.List = append(listData.List, result)
		} else if list.form.listOf != nil {
			// ListOf (all the rest)
			result, erl := list.form.listOf.match(*value, parser)
			errList.Push(erl)
			listData.ListOf = append(listData.ListOf, result)
		} else {
			// Rejecting extra entries (all the rest, if no ListOf)
			message := fmt.Sprintf(
				"no %dth entry (%s) `%s`",
				k, value.Tag, value.Value,
			)
			errList.Push(parser.contentError(*value, message))
		}
	}

	// Signaling missing keys
	for k := len(content.Content); k < len(list.form.list); k++ {
		message := fmt.Sprintf(
			"a %dth entry %s",
			k, list.form.list[k].description(),
		)
		errList.Push(parser.contentError(content, message))
	}

	return parser.wrap(listData, content), errList.ConcatError()
}

// OneOf
func (oneOf tOneOf) match(content yaml.Node, parser *tParser) (tResult, []error) {
	for _, option := range oneOf.optionList {
		if option == nil {
			fmt.Printf("aaaaaa, %s\n", oneOf.optionList)
		}
		result, err := option.match(content, parser)
		if len(err) == 0 {
			return result, nil
		}
	}

	return tResult{}, parser.contentError(content, oneOf.description())
}

func (oneOf tOneOf) mergeMatch(
	mapResult MapData,
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
func (in tIn) match(content yaml.Node, parser *tParser) (tResult, []error) {
	if acceptList, found := in.valueMap[content.Tag]; found {
		for _, accept := range acceptList {
			if content.Value == accept {
				// TODO:
				// `data := content.Value, nil` only works if the value is supposed to be a string
				// This returns the wrong type if the value must be a boolean or an integer or a float
				data := content.Value
				return parser.wrap(data, content), nil
			}
		}
	}

	return tResult{}, parser.contentError(content, in.description())
}

// Regex
func (rxp tRegex) match(content yaml.Node, parser *tParser) (tResult, []error) {
	if content.Tag != "!!str" || !rxp.regex.MatchString(content.Value) {
		return tResult{}, parser.contentError(content, fmt.Sprintf("a string (matching the regex [%s])", rxp.regexString))
	}

	return parser.wrap(content.Value, content), nil
}

// Add metadata to value, to create a Result
func (parser tParser) wrap(data interface{}, content yaml.Node) tResult {
	return tResult{
		tPosition:    positionFromYamlNode(parser.contentFile.name, content),
		isLidyData:   true,
		hasBeenBuilt: false,
		ruleName:     "",
		data:         data,
	}
}

func positionFromYamlNode(filename string, node yaml.Node) tPosition {
	return tPosition{
		filename: filename,
		line:     node.Line,
		column:   node.Column,
	}
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
			"Internal: Content length of root node is not 1, but %d. %s",
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
