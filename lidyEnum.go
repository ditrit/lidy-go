package lidy

type tDocument struct {
	ruleMap map[string]tExpression
}

// tExpressionKind - union selector of tExpression
type tExpressionKind int

const (
	kindIdentifier tExpressionKind = iota
	kindMap
	kindSeq
	kindIn
	kindOneOf
	kindRegex
	kindMerge
)

func (kind tExpressionKind) String() string {
	return [...]string{
		"kindIdentifier",
		"kindMap",
		"kindSeq",
		"kindIn",
		"kindOneOf",
		"kindRegex",
		"kindMerge",
	}[kind]
}

// tSizeMode union selector of tSized
type tSizeMode int

const (
	modeOff tSizeMode = iota
	modeMin
	modeMax
	modeMinMax
	modeNb
)

func (mode tSizeMode) String() string {
	return [...]string{
		"modeOff",
		"modeMin",
		"modeMax",
		"modeMinMax",
		"modeNb",
	}[mode]
}

// tMapFormMode union selector of tMapForm
type tMapFormMode int
