package lidy

type tDocument struct {
	ruleMap map[string]tExpression
}

type tExpression interface{}

type tIdentifier struct {
	identifierName string
}

type tMap struct {
	tMapForm
	tSized
}

// tMapForm map-related size-agnostic content of a tMap node
type tMapForm struct {
	mapFormMode tMapFormMode
	propertyMap map[string]tExpression
	mapOf       []tKeyValueExpression
}

type tKeyValueExpression struct {
	key   tExpression
	value tExpression
}

type tSized struct {
	sizeMode tSizeMode
	min      int
	max      int
	nb       int
}

type tPosition struct {
	line      int
	column    int
	lineEnd   int
	columnEnd int
}
