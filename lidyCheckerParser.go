package lidy

import (
	"fmt"
	"regexp"

	"github.com/ditrit/lidy/errorlist"
	"gopkg.in/yaml.v3"
)

// lidyCheckerParser.go
//
// Schema parsing for lidy checkers and checkerForms.

type tChecker func(sp tSchemaParser, node yaml.Node, formMap tFormMap) (tExpression, []error)

type tFormMap map[string]yaml.Node

func mapChecker(sp tSchemaParser, node yaml.Node, formMap tFormMap) (tExpression, []error) {
	errList := errorlist.List{}

	form, err := mapForm(sp, node, formMap)
	errList.Push(err)

	sizing, err := sizingChecker(sp, node, formMap)
	errList.Push(err)

	return tMap{
		form,
		sizing,
	}, errList.ConcatError()
}

func seqChecker(sp tSchemaParser, node yaml.Node, formMap tFormMap) (tExpression, []error) {
	errList := errorlist.List{}

	form, err := seqForm(sp, node, formMap)
	errList.Push(err)

	sizing, err := sizingChecker(sp, node, formMap)
	errList.Push(err)

	return tSeq{
		form,
		sizing,
	}, errList.ConcatError()
}

func mapForm(sp tSchemaParser, node yaml.Node, formMap tFormMap) (tMapForm, []error) {
	return tMapForm{}, nil
}

func seqForm(sp tSchemaParser, node yaml.Node, formMap tFormMap) (tSeqForm, []error) {
	return tSeqForm{}, nil
}

func sizingChecker(sp tSchemaParser, node yaml.Node, formMap tFormMap) (tSizing, []error) {
	errList := errorlist.List{}

	minNode, _min := formMap["min"]
	maxNode, _max := formMap["max"]
	nbNode, _nb := formMap["nb"]

	var sizing tSizing = nil

	tryDecodeInteger := func(theNode yaml.Node) int {
		var theInt int
		err := node.Decode(&theInt)
		errList.Push(sp.schemaNodeError(theNode, "an integer, but error happened: "+err.Error()))
		return theInt
	}

	switch {
	case _nb && (_min || _max):
		errList.Push(sp.schemaNodeError(node, "no use of _nb, _min and _max together"))
	case !_min && !_max && !_nb:
		sizing = tSizingNone{}
	case _nb:
		sizing = tSizingNb{nb: tryDecodeInteger(nbNode)}
	case _min && !_max:
		sizing = tSizingMin{min: tryDecodeInteger(minNode)}
	case _max && !_min:
		sizing = tSizingMax{max: tryDecodeInteger(maxNode)}
	case _min && _max:
		sizing = tSizingMinMax{
			tSizingMin{min: tryDecodeInteger(minNode)},
			tSizingMax{max: tryDecodeInteger(maxNode)},
		}
	default:
		errList.Push(sp.schemaNodeError(node, "no unexpected combination of _nb, _min and _max (Internal error? "+pleaseReport+")"))
	}

	return sizing, errList.ConcatError()
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
