package lidy

import "gopkg.in/yaml.v3"

type tDocument struct {
	ruleMap map[string]tRule
}

type tRule struct {
	expression tExpression
	isExported bool
}

type tExpression interface {
	match(content yaml.Node, document tDocument) error
}

type tMergeableExpression interface {
	mergeMatch(content yaml.Node, document tDocument) []tMap
}

// Identifier
var _ tExpression = tIdentifier("")
var _ tMergeableExpression = tIdentifier("")

type tIdentifier string

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
	mapOf       []tKeyValueExpression
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
	tuple []tExpression
	seqOf tExpression
}

// Sizing
type tSizing struct {
	min int
	max int
	nb  int
}

// In
var _ tExpression = tIn{}

type tIn struct {
	// valueMap
	// maps Node.Tag-s to slices of Node.Value
	valueMap map[string][]string
}

// OneOf
var _ tExpression = tOneOf{}
var _ tMergeableExpression = tOneOf{}

type tOneOf struct {
	optionList []tExpression
}

// Regex
var _ tExpression = tRegex{}

type tRegex struct {
	regexString string
}

// Position
type tPosition struct {
	line      int
	column    int
	lineEnd   int
	columnEnd int
}
