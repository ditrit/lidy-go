package lidy

import (
	"fmt"
	"regexp"
	"time"

	"gopkg.in/yaml.v3"
)

// lidyDefaultRule.go
//
// Rules to parse default rules:
// - lidy scalar values
// - `any`

const regexBase64Source = `^[a-zA-Z0-9_\- \n]*[= \n]*$`

var regexBase64 = *regexp.MustCompile(regexBase64Source)

var lidyDefaultRuleMatcherMap map[string]tLidyMatcher = map[string]tLidyMatcher{
	"string": func(content yaml.Node, parser *tParser) (tResult, []error) {
		if content.Tag == "!!str" {
			return parser.wrap(content.Value, content), nil
		}
		return tResult{}, parser.contentError(content, "a YAML string")
	},

	"int": func(content yaml.Node, parser *tParser) (tResult, []error) {
		if content.Tag == "!!int" {
			var result int
			err := content.Decode(&result)
			if err == nil {
				return parser.wrap(result, content), nil
			}
		}
		return tResult{}, parser.contentError(content, "a YAML integer")
	},

	"float": func(content yaml.Node, parser *tParser) (tResult, []error) {
		if content.Tag == "!!float" || content.Tag == "!!int" {
			var result float64
			err := content.Decode(&result)
			if err == nil {
				return parser.wrap(result, content), nil
			}
		}
		return tResult{}, parser.contentError(content, "a YAML float")
	},

	"binary": func(content yaml.Node, parser *tParser) (tResult, []error) {
		if content.Tag != "!!str" && content.Tag != "!!binary" {
			return tResult{}, parser.contentError(content, "a YAML binary (a base64 string)")
		}

		if !regexBase64.MatchString(content.Value) {
			return tResult{}, parser.contentError(content, "a base64 string; it must match: /"+regexBase64Source+"/")
		}

		return parser.wrap(content.Value, content), nil
	},

	"boolean": func(content yaml.Node, parser *tParser) (tResult, []error) {
		if content.Tag != "!!bool" {
			return tResult{}, parser.contentError(content, "a YAML boolean")
		}

		var result bool
		content.Decode(&result)
		return parser.wrap(result, content), nil
	},

	"nullType": func(content yaml.Node, parser *tParser) (tResult, []error) {
		if content.Tag != "!!null" {
			return tResult{}, parser.contentError(content, "the YAML null value")
		}

		return tResult{}, nil
	},

	"timestamp": func(content yaml.Node, parser *tParser) (tResult, []error) {
		if content.Tag != "!!str" && content.Tag != "!!timestamp" {
			return tResult{}, parser.contentError(content, "a YAML timestamp (an ISO 8601 datetime)")
		}

		_, err := time.Parse(time.RFC3339Nano, content.Value)
		if err != nil {
			return tResult{}, parser.contentError(content, fmt.Sprintf("a YAML timestamp (an ISO 8601 datetime; got error [%s])", err.Error()))
		}

		return parser.wrap(content.Value, content), nil
	},

	"any": func(content yaml.Node, parser *tParser) (tResult, []error) {
		return parser.wrap(content.Value, content), nil
	},
}

func (sp *tSchemaParser) precomputeLidyDefaultRules() {
	if _, present := sp.schema.ruleMap["any"]; present {
		return
	}

	sp.lidyDefaultRuleMap = make(map[string]*tRule)

	for key, matcher := range lidyDefaultRuleMatcherMap {
		sp.lidyDefaultRuleMap[key] = &tRule{
			ruleName:    key,
			lidyMatcher: matcher,
		}
	}

	ruleAny := &tRule{
		ruleName: "any",
	}

	ruleAny.expression = tOneOf{
		optionList: []tExpression{
			sp.lidyDefaultRuleMap["string"],
			sp.lidyDefaultRuleMap["boolean"],
			sp.lidyDefaultRuleMap["int"],
			sp.lidyDefaultRuleMap["float"],
			sp.lidyDefaultRuleMap["nullType"],
			tMap{
				tMapForm{
					mapOf: tKeyValueExpression{
						key:   ruleAny,
						value: ruleAny,
					},
				},
				tSizingNone{},
			},
			tList{
				tListForm{
					listOf: ruleAny,
				},
				tSizingNone{},
			},
		},
	}

	sp.lidyDefaultRuleMap["any"] = ruleAny
}
