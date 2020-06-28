package lidy

import (
	"fmt"

	"gopkg.in/yaml.v3"
)

// lidyMatch.go
//
// Implement check() i.e. matchers that do not produce a result

// Sizing check()
func (sizing tSizingMinMax) check(content yaml.Node, parser tOldParser) []error {
	size, err := getSize(content)

	if len(err) > 0 {
		return err
	}

	if size < sizing.min {
		err = append(
			err,
			parser.contentError(content, "have at least "+string(sizing.min)+" entries")...,
		)
	}

	if size > sizing.max {
		err = append(
			err,
			parser.contentError(content, "have at most "+string(sizing.max)+" entries")...,
		)
	}

	return err
}

func (sizing tSizingNb) check(content yaml.Node, parser tOldParser) []error {
	size, err := getSize(content)

	if len(err) > 0 {
		return err
	}

	if size != sizing.nb {
		return parser.contentError(content, "have exactly "+string(sizing.nb)+" entries")
	}

	return err
}

func getSize(content yaml.Node) (int, []error) {
	switch content.Tag {
	case "!!seq":
		return len(content.Content), nil
	case "!!map":
		return len(content.Content) / 2, nil
	default:
		const errorTemplate = "Lidy internal error -- " +
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
