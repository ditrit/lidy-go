package lidy

import (
	"fmt"
	"log"
	"regexp"
	"strings"

	"github.com/ditrit/lidy/errorlist"
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

// tSchemaParser.hollowSchema parses the outline of a lidy schema document
// it fills the `ruleMap` with `tRule` instances whose expression is uncomputed. It errors if the yaml node isn't a map.
func (sp tSchemaParser) hollowSchema(documentNode yaml.Node) (tSchema, []error) {
	// Note: The parsing is done in two steps
	// - First create tRule{} entities for all rules of the document (THIS STEP)
	// - Second, explore each rule value node, to populate the `expression` field of the rule node.
	// This approach allows to substitute identifiers for rule entities while exploring the schema.
	root, erl := getRoot(documentNode)

	if len(erl) > 0 {
		return tSchema{}, erl
	}

	if root.Kind != yaml.MappingNode {
		return tSchema{}, sp.schemaError(*root, "a lidy schema document (kind map)")
	}

	schema := tSchema{
		ruleMap: make(map[string]*tRule),
	}

	errList := errorlist.List{}

	// lidy default rules
	for ruleName, rule := range sp.lidyDefaultRuleMap {
		schema.ruleMap[ruleName] = rule
	}

	// user rules
	for k := 1; k < len(root.Content); k += 2 {
		rule, err := sp.createRule(*root.Content[k-1], *root.Content[k])
		if err != nil {
			return tSchema{}, err
		}
		if _, present := schema.ruleMap[rule.ruleName]; present {
			message := "no repeated rule declaration"

			if _, isDefaultRule := sp.lidyDefaultRuleMap[rule.ruleName]; isDefaultRule {
				message = "no redeclaration of lidy default rule"
			}

			errList.Push(sp.schemaError(*root.Content[k-1], message))
		}
		schema.ruleMap[rule.ruleName] = rule
	}

	return schema, nil
}

// Create an unparsed rule.
// This function parses the name of the rule to establish the local name and exported name, if the rule is exported
func (sp tSchemaParser) createRule(key yaml.Node, value yaml.Node) (*tRule, []error) {
	if key.Tag != "!!str" {
		return nil, sp.schemaError(key, "a YAML string (an identifier declaration)")
	}

	if !regexIdentifierDeclaration.MatchString(key.Value) {
		return nil, sp.schemaError(key, "a valid identifier declaration")
	}

	nameSlice := strings.SplitN(key.Value, ":", 3)

	localName := nameSlice[0]
	var builder Builder
	if strings.Contains(key.Value, ":") {
		var exportName string

		exportName = nameSlice[0]

		if nameSlice[1] != "" {
			log.Fatalf("Internal error with rule name parsing of `%s`, %s", key.Value, pleaseReport)
			// -> It appears the regex didn't do its job properly
		}

		if strings.Contains(key.Value, "::") {
			// delete me
			// exportName = nameSlice[3]
			// it can't be 3, it must be 2:
			//
			exportName = nameSlice[2]
		}

		builder, _ = sp.builderMap[exportName]
	}

	return &tRule{
		_node:      value,
		builder:    builder,
		ruleName:   localName,
		expression: nil,
	}, nil
}

// tSchemaParser.expression parse any lidy schema expression.
func (sp tSchemaParser) expression(node yaml.Node) (tExpression, []error) {
	switch {
	case node.Tag == "!!str":
		return sp.ruleReference(node)
	case node.Kind != yaml.MappingNode || len(node.Content) == 0:
		return nil, sp.schemaError(node, "an expression (a rule identifier or a YAML map)")
	}

	return sp.formRecognizer(node)
}

func (sp tSchemaParser) ruleReference(node yaml.Node) (tExpression, []error) {
	if !regexIdentifier.MatchString(node.Value) {
		return nil, sp.schemaError(node, "a valid identifier reference (a-zA-Z)(a-zA-Z0-9_)+")
	}

	if rule, ok := sp.schema.ruleMap[node.Value]; ok {
		return rule, nil
	}

	if sp.option.BypassMissingRule {
		sp.schema.ruleMap[node.Value] = sp.schema.ruleMap["any"]
		return sp.schema.ruleMap["any"], nil
	}

	return nil, sp.schemaError(node, "the identifier to exist in the document")
}

// formRecognizer
// match any checker form
func (sp tSchemaParser) formRecognizer(node yaml.Node) (tExpression, []error) {
	form := ""
	checker := missingChecker

	keyword := ""
	mustBeMapOrList := false
	conflictingForm := ""

	formMap := make(map[string]yaml.Node)
	errList := errorlist.List{}

	setForm := func(newForm string, key string, newChecker tChecker) {
		if form != "" && form != newForm {
			conflictingForm = newForm
		} else if mustBeMapOrList && newForm != "map" && newForm != "sequence" {
			conflictingForm = newForm
		} else {
			form = newForm
			checker = newChecker

			if keyword == "" {
				keyword = key
			}
		}
	}

	for k := 0; k+1 < len(node.Content); k += 2 {
		keyNode := node.Content[k]
		value := node.Content[k+1]

		// reject non-string "keywords"
		if keyNode.Tag != "!!str" {
			errList.Push(sp.schemaError(*keyNode, "only string keys (lidy keywords)"))
			continue
		}

		// update formMap with the content values
		key := keyNode.Value
		formMap[key] = *value

		// identifying the form
		switch key {
		case "_map", "_mapFacultative", "_mapOf", "_merge":
			setForm("map", key, mapChecker)
		case "_list", "_listFacultative", "_listOf":
			setForm("sequence", key, listChecker)
		case "_oneOf":
			setForm("oneOf", key, oneOfChecker)
		case "_in":
			setForm("in", key, inChecker)
		case "_regex":
			setForm("regex", key, regexChecker)
		case "_min", "_max", "_nb":
			if form != "" && form != "map" && form != "sequence" {
				errList.Push(sp.schemaError(*keyNode, fmt.Sprintf(
					"only keywords compatible with form '%s' (resulting from keyword '%s')",
					form, keyword,
				)))
			} else {
				mustBeMapOrList = true
			}
			if keyword != "" {
				keyword = key
			}
		default:
			errList.Push(sp.schemaError(*keyNode, "a valid lidy keyword"))
		}

		// process conflicts
		if conflictingForm != "" {
			errList.Push(sp.schemaError(*keyNode, fmt.Sprintf(
				"no keyword whose form %s conflicts with keyword %s of form %s",
				conflictingForm, keyword, form,
			)))

			conflictingForm = ""
		}
	}

	result, erl := checker(sp, node, formMap)

	errList.Push(erl)

	return result, errList.ConcatError()
}

// missingChecker (formRecognizer didn't detect a form)
func missingChecker(sp tSchemaParser, node yaml.Node, formMap tFormMap) (tExpression, []error) {
	return nil, sp.schemaError(node, "a recognizable lidy form")
}

// Error
func (sp tSchemaParser) schemaError(node yaml.Node, expected string) []error {
	if node.Kind == yaml.Kind(0) {
		return []error{fmt.Errorf("Tried to use uninitialized yaml node [node, expected: %s]; %s", expected, pleaseReport)}
	}

	return []error{fmt.Errorf("error in schema with yaml node, kind #%d,, tag '%s', value '%s' at position %s:%s, where [%s] was expected", node.Kind, node.ShortTag(), node.Value, sp.name, getPosition(node), expected)}
}
