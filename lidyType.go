package lidy

type tDocument struct {
	ruleMap map[string]tExpression
}

type tRule struct {
	expression tExpression
	isExported bool
}

type tExpression interface{}

type tMap struct {
	form   tMapForm
	sizing tSizing
}

// tMapForm map-related size-agnostic content of a tMap node
type tMapForm struct {
	propertyMap map[string]tExpression
	mapOf       []tKeyValueExpression
}

type tKeyValueExpression struct {
	key   tExpression
	value tExpression
}

type tSizing struct {
	min int
	max int
	nb  int
}

type tPosition struct {
	line      int
	column    int
	lineEnd   int
	columnEnd int
}
