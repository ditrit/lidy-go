package lidy

import (
	"fmt"
	"regexp"

	"github.com/ditrit/lidy/errorlist"
	"gopkg.in/yaml.v3"
)

// lidyCheckerParser.go
//
// Perform schema parsing of all lidy checker forms.

type tChecker func(sp tSchemaParser, node yaml.Node, formMap tFormMap) (tExpression, []error)

type tFormMap map[string]yaml.Node

func mapChecker(sp tSchemaParser, node yaml.Node, formMap tFormMap) (tExpression, []error) {
	errList := errorlist.List{}
	return tMap{}, errList.ConcatError()
}

func seqChecker(sp tSchemaParser, node yaml.Node, formMap tFormMap) (tExpression, []error) {
	errList := errorlist.List{}
	return tSeq{}, errList.ConcatError()
}

func oneOfChecker(sp tSchemaParser, _ yaml.Node, formMap tFormMap) (tExpression, []error) {
	oneOfValueNode := formMap["_oneOf"]

	if oneOfValueNode.Kind != yaml.SequenceNode {
		return nil, sp.schemaNodeError(oneOfValueNode, "a sequence (of lidy expressions)")
	}
	errList := errorlist.List{}
	optionList := []tExpression{}

	for _, subNode := range oneOfValueNode.Content {
		expression, erl := sp.expression(*subNode)
		errList.Push(erl)
		optionList = append(optionList, expression)
	}

	return tOneOf{
		optionList: optionList,
	}, errList.ConcatError()
}

func inChecker(sp tSchemaParser, _ yaml.Node, formMap tFormMap) (tExpression, []error) {
	inValueNode := formMap["_in"]

	if inValueNode.Kind != yaml.SequenceNode {
		return nil, sp.schemaNodeError(inValueNode, "a sequence (of YAML scalars)")
	}
	errList := errorlist.List{}
	valueMap := make(map[string][]string)

NodeContentLoop:
	for _, value := range inValueNode.Content {
		// scalar values only
		if value.Kind != yaml.ScalarNode {
			errList.Push(sp.schemaNodeError(inValueNode, "a scalar value"))
			continue
		}

		// add a slice to the map if this kind of scalar value is yet unmet
		if _, ok := valueMap[value.Tag]; !ok {
			valueMap[value.Tag] = []string{}
		}

		for _, v := range valueMap[value.Tag] {
			if v == value.Value {
				errList.Push(sp.schemaNodeError(*value, "no duplicated value"))
				continue NodeContentLoop
			}
		}

		// add the value
		valueMap[value.Tag] = append(valueMap[value.Tag], value.Value)
	}

	return tIn{
		valueMap: valueMap,
	}, errList.ConcatError()
}

func regexChecker(sp tSchemaParser, _ yaml.Node, formMap tFormMap) (tExpression, []error) {
	regexValueNode := formMap["_regex"]
	if regexValueNode.Tag != "!!str" {
		return nil, sp.schemaNodeError(regexValueNode, "a string (a regex)")
	}

	regexString := regexValueNode.Value

	regex, err := regexp.Compile(regexString)

	if err != nil {
		return nil, sp.schemaNodeError(regexValueNode, fmt.Sprintf(
			"a valid regex (error: '%s')",
			err.Error(),
		))
	}

	return tRegex{
		regex: regex,
	}, nil
}
