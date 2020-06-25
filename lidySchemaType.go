package lidy

import (
	"regexp"

	"gopkg.in/yaml.v3"
)

type tExpression interface {
	match(content yaml.Node, parser tParser) (Result, []error)
	name() string
	description() string
}

type tMergeableExpression interface {
	tExpression
	mergeMatch(content yaml.Node, parser tParser) (Result, []error)
}

type tDocument struct {
	ruleMap map[string]tRule
}

var _ tExpression = tRule{}

type tRule struct {
	ruleName   string
	expression tExpression
	builder    Builder
	_node      yaml.Node
}

// Identifier
var _ tExpression = tIdentifierReference{}
var _ tMergeableExpression = tIdentifierReference{}

type tIdentifierReference struct {
	rule tRule
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
var _ tMergeableExpression = tSeq{}

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
	check(content yaml.Node, parser tParser) []error
}

var _ tSizing = tSizingMinMax{}

type tSizingMinMax struct {
	min int
	max int
}

var _ tSizing = tSizingNb{}

type tSizingNb struct {
	nb int
}

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
var _ tExpression = tRegexp{}

type tRegexp struct {
	regexpString string
	regexp       regexp.Regexp
}
