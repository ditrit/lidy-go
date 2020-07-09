package lidy

import (
	"fmt"
	"strings"
)

// lidyDescribe.go
//
// Implement the ability of tExpression concrete types to produce their
// name and their description.

// Rule
func (rule *tRule) name() string {
	return "(" + rule.ruleName + ")"
}

func (rule *tRule) description() string {
	return fmt.Sprintf("Rule %s %s", rule.ruleName, rule.expression.name())
}

// Map
func (mapChecker tMap) name() string {
	namePartList := []string{"("}

	if mapChecker.form.propertyMap != nil {
		namePartList = append(namePartList, "_map")
	}
	if mapChecker.form.mapOf.key != nil {
		namePartList = append(namePartList, "_mapOf")
	}
	if len(mapChecker.form.mergeList) > 0 {
		namePartList = append(namePartList, "_merge")
	}
	namePartList = append(namePartList, ")")

	return strings.Join(namePartList, "&")
}

func (mapChecker tMap) description() string {
	partList := []string{}

	mForm := mapChecker.form

	if mForm.propertyMap != nil {
		partList = append(partList, "_map:")

		for key, value := range mForm.propertyMap {
			partList = append(partList, "  ", key, ": ", value.name(), "\n")
		}
	}
	if m := mForm.mapOf; m.key != nil {
		partList = append(partList, "_mapOf: { ", m.key.name(), ": ", m.value.name(), " }\n")
	}
	if len(mForm.mergeList) > 0 {
		inner := []string{}

		for _, mergeable := range mForm.mergeList {
			inner = append(inner, mergeable.name())
		}
		innerString := strings.Join(inner, ", ")

		partList = append(partList, "_merge: [", innerString, "]")
	}

	return strings.Join(partList, "\n")
}

// List
func (seq tList) name() string {
	namePartList := []string{"("}

	if seq.form.list != nil {
		namePartList = append(namePartList, "_list")
	}
	if seq.form.listOf != nil {
		namePartList = append(namePartList, "_listOf")
	}
	namePartList = append(namePartList, ")")

	return strings.Join(namePartList, "&")
}

func (seq tList) description() string {
	partList := []string{}

	if seq.form.list != nil {
		inner := []string{}

		for _, expression := range seq.form.list {
			inner = append(inner, expression.name())
		}
		innerString := strings.Join(inner, ", ")

		partList = append(partList, "_list: [", innerString, "]")
	}
	if seq.form.listOf != nil {
		partList = append(partList, "_listOf: ", seq.form.listOf.name())
	}

	return strings.Join(partList, "\n")
}

// OneOf
func (oneOf tOneOf) name() string {
	return "(oneOf)"
}

func (oneOf tOneOf) description() string {
	if len(oneOf.optionList) == 0 {
		return "one of (nothing): []"
	}

	partList := []string{"one of:\n"}
	for _, option := range oneOf.optionList {
		partList = append(partList, "- ", option.name(), "\n")
	}

	return strings.Join(partList, "")
}

// In
func (in tIn) name() string {
	return "(in)"
}

func (in tIn) description() string {
	if len(in.valueMap) == 0 {
		return "in: []"
	}

	partList := []string{"in: "}

	for tag, valueList := range in.valueMap {
		innerString := strings.Join(valueList, ", ")

		partList = append(partList, "[", tag, "][", innerString, "]")
	}

	return strings.Join(partList, ", ")
}

// Regex
func (regex tRegex) name() string {
	return "(regex)"
}

func (regex tRegex) description() string {
	return "/" + regex.regexString + "/"
}
