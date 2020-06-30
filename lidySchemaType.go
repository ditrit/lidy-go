package lidy

import (
	"regexp"

	"gopkg.in/yaml.v3"
)

type tExpression interface {
	match(content yaml.Node, parser *tParser) (Result, []error)
	name() string
	description() string
}

type tMergeableExpression interface {
	tExpression
	mergeMatch(mapResult MapResult, usefulList []bool, content yaml.Node, parser *tParser) []error
}

type tDocument struct {
	ruleMap map[string]tRule
}

var _ tExpression = tRule{}
var _ tMergeableExpression = tRule{}

type tRule struct {
	ruleName string
	//
	// On lidy default rules //
	// lidyMatcher
	// present iif the rule is a lidy default rule
	lidyMatcher tLidyMatcher
	//
	// On user rules //
	// builder
	// - present on exported types if the user has provided one
	builder Builder
	// _node
	// - missing from rules with a lidyMatcher-s
	// - temporary value, used to keep the readily node available between the rule
	//   creation (0th pass), and the expression parsing (1th pass).
	_node yaml.Node
	// expression
	// - missing from rules with a lidyMatcher-s
	// - missing at the 0th pass, added during the 1th.
	expression tExpression
}

// Map
var _ tExpression = tMap{}
var _ tMergeableExpression = tMap{}

type tMap struct {
	form   tMapForm
	sizing tSizing
}

// tMapForm map-related size-agnostic content of a tMap node
type tMapForm struct {
	propertyMap map[string]tExpression
	optionalMap map[string]tExpression
	mapOf       tKeyValueExpression
	mergeList   []tMergeableExpression
}

type tKeyValueExpression struct {
	key   tExpression
	value tExpression
}

// tSeq
var _ tExpression = tSeq{}

type tSeq struct {
	form   tSeqForm
	sizing tSizing
}

type tSeqForm struct {
	tuple         []tExpression
	optionalTuple []tExpression
	seqOf         tExpression
}

// Sizing
type tSizing interface {
	check(content yaml.Node, parser *tParser) []error
}

var _ tSizing = tSizingMinMax{}

type tSizingMinMax struct {
	tSizingMin
	tSizingMax
}

type tSizingMin struct {
	min int
}

type tSizingMax struct {
	max int
}

var _ tSizing = tSizingNb{}

type tSizingNb struct {
	nb int
}

var _ tSizing = tSizingNone{}

type tSizingNone struct{}

// OneOf
var _ tExpression = tOneOf{}
var _ tMergeableExpression = tOneOf{}

type tOneOf struct {
	optionList []tExpression
}

// In
var _ tExpression = tIn{}

type tIn struct {
	// valueMap
	// maps Node.Tag-s to slices of Node.Value
	valueMap map[string][]string
}

// Regex
var _ tExpression = tRegex{}

type tRegex struct {
	regexString string
	regex       *regexp.Regexp
}
