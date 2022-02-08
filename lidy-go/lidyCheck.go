package lidy

import (
	"fmt"
	"strconv"

	"github.com/ditrit/lidy/errorlist"
	"gopkg.in/yaml.v3"
)

// lidyMatch.go
//
// Implement check() i.e. matchers that do not produce a result

// Sizing check()
func (sizing tSizingMinMax) check(content yaml.Node, parser *tParser) []error {
	errList := errorlist.List{}

	errList.Push(sizing.tSizingMin.check(content, parser))
	errList.Push(sizing.tSizingMax.check(content, parser))

	return errList.ConcatError()
}

func (sizing tSizingMin) check(content yaml.Node, parser *tParser) []error {
	size, err := getSize(content)

	if len(err) > 0 {
		return err
	}

	if size < sizing.min {
		return parser.contentError(content, "have at least "+strconv.Itoa(sizing.min)+" entries")
	}
	return nil
}

func (sizing tSizingMax) check(content yaml.Node, parser *tParser) []error {
	size, err := getSize(content)

	if len(err) > 0 {
		return err
	}

	if size > sizing.max {
		return parser.contentError(content, "have at most "+strconv.Itoa(sizing.max)+" entries")
	}
	return nil
}

func (sizing tSizingNb) check(content yaml.Node, parser *tParser) []error {
	size, err := getSize(content)

	if len(err) > 0 {
		return err
	}

	if size != sizing.nb {
		return parser.contentError(content, "have exactly "+strconv.Itoa(sizing.nb)+" entries")
	}
	return nil
}

func (tSizingNone) check(content yaml.Node, parser *tParser) []error {
	return nil
}

func getSize(content yaml.Node) (int, []error) {
	switch content.Kind {
	case yaml.SequenceNode:
		return len(content.Content), nil
	case yaml.MappingNode:
		return len(content.Content) / 2, nil
	default:
		const errorTemplate = "lidy internal error -- " +
			"getSize() was called on a non-map non-sequence YAML value -- " +
			"this should not happen, please report it to " +
			"https://github.com/ditrit/lidy/issues ." +
			"\n  content: [kind [%s], len %d, value [%s] at position %d:%d]"

		return -1, []error{fmt.Errorf(
			errorTemplate,
			content.Tag, len(content.Content), content.Value, content.Line, content.Column,
		)}
	}
}
