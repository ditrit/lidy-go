package lidy_test

import (
	"fmt"
	"strings"
	"testing"

	"github.com/ditrit/lidy"
	"github.com/ditrit/specimen/go/specimen"
)

func errorText(start string, errorSlice []error) string {
	messageSlice := []string{start}
	for _, err := range errorSlice {
		messageSlice = append(messageSlice, err.Error())
	}
	return strings.Join(messageSlice, ", ")
}

func readSchema(input specimen.Dict) (string, string) {
	var schema string
	var filename string
	if schemaAny, ok := input["schema"]; ok {
		schema = schemaAny.(string)
		filename = "schema.yaml"
	} else if expressionAny, ok := input["expression"]; ok {
		schema = "main:\n  " + strings.ReplaceAll(expressionAny.(string), "\n", "\n  ")
		filename = "expression.yaml"
	} else if regexAny, ok := input["regex"]; ok {
		schema = "main:\n  regex: " + regexAny.(string)
		filename = "regex.yaml"
	}
	return schema, filename
}

func trial(kind string, useTemplate bool) func(s *specimen.S, input specimen.Dict) {
	return func(s *specimen.S, input specimen.Dict) {
		// /\ READ /\
		// Get the schema
		schema, filename := readSchema(input)
		if len(schema) == 0 {
			s.Abort("need a schema")
		}

		// Get the yaml content
		dataAny := input["data"]
		if dataAny == nil {
			s.Abort("need data")
		}
		data := dataAny.(string)

		// Perform template substitution if applicable
		if useTemplate {
			for k, v := range input {
				if strings.HasSuffix(k, "Value") {
					keyword := fmt.Sprintf("%s%s%s", "${", strings.TrimSuffix(k, "Value"), "}")
					value := v.(string)
					schema = strings.ReplaceAll(schema, keyword, value)
					data = strings.ReplaceAll(data, keyword, value)
				}
			}
		}
		// \/ READ \/

		// /\ RUN /\

		// Obtain a parser
		parser := lidy.NewParser(
			filename,
			[]byte(schema),
		)
		errorSlice := parser.Schema()
		if len(errorSlice) > 0 {
			messageSlice := []string{}
			for _, err := range errorSlice {
				messageSlice = append(messageSlice, err.Error())
			}
			s.Abort(fmt.Sprintf("error in the schema (%s)", strings.Join(messageSlice, ";")))
		}

		_, errorSlice = parser.Parse(
			lidy.NewFile(
				"data.yaml",
				[]byte(data),
			),
		)

		switch kind {
		case "ACCEPT":
			if len(errorSlice) > 0 {
				s.Fail(errorText("expected acception", errorSlice))
			}
		case "REJECT":
			if len(errorSlice) == 0 {
				s.Fail("expected rejection")
			}
		default:
			s.Abort("trial kind should be either ACCEPT or REJECT")
		}
		// \/ RUN \/
	}
}

func make_lidy_parser(outcome string) func(s *specimen.S, input specimen.Dict) {
	return func(s *specimen.S, input specimen.Dict) {
		// /\ READ /\
		if outcomeAny, ok := input["outcome"]; ok {
			outcome = outcomeAny.(string)
		}
		if len(outcome) == 0 {
			s.Abort("need an outcome")
		}
		schema, filename := readSchema(input)
		if len(schema) == 0 {
			s.Abort("need a schema")
		}
		var contain string
		if containAny, ok := input["contain"]; ok {
			contain = containAny.(string)
		}
		// \/ READ \/

		parser := lidy.NewParser(
			filename,
			[]byte(schema),
		)
		errorSlice := parser.Schema()

		if outcome == "accept" {
			if len(errorSlice) > 0 {
				s.Fail(errorText("expected schema acception", errorSlice))
			}
		} else if outcome == "reject" {
			if len(errorSlice) == 0 {
				s.Fail("expected schema rejection")
			} else if len(contain) > 0 {
				found := false
				for _, err := range errorSlice {
					if strings.Contains(err.Error(), contain) {
						found = true
						break
					}
				}
				if !found {
					s.Fail(fmt.Sprintf(
						"expected one of the (%d) errors to contain (%s) but none does {{{%s}}}",
						len(errorSlice), contain, errorText("_", errorSlice),
					))
				}
			}
		} else {
			s.Abort(fmt.Sprintf("unrecognized outcome (%s)", outcome))
		}
	}
}

var codeboxSet = specimen.MakeCodeboxSet(map[string]specimen.BoxFunction{
	"trial ACCEPT":          trial("ACCEPT", false),
	"trial REJECT":          trial("REJECT", false),
	"template trial ACCEPT": trial("ACCEPT", true),
	"template trial REJECT": trial("REJECT", true),
	"regex trial ACCEPT":    make_lidy_parser("accept"),
	"regex trial REJECT":    make_lidy_parser("reject"),
	"make lidy parser":      make_lidy_parser(""),
})

var filenameSlice = []string{
	"testdata/collection/listOf.spec.yaml",
	"testdata/collection/map.spec.yaml",
	"testdata/collection/mapOf.spec.yaml",
	// "testdata/collection/merge.spec.yaml",
	"testdata/collection/min_max_nb.spec.yaml",
	"testdata/collection/tuple.spec.yaml",
	"testdata/combinator/oneOf.spec.yaml",
	"testdata/scalar/in.spec.yaml",
	"testdata/scalar/regex.spec.yaml",
	"testdata/scalarType/scalar.spec.yaml",
	"testdata/schema/document.spec.yaml",
	"testdata/schema/expression.spec.yaml",
	// "testdata/schema/mergeChecker.spec.yaml",
	"testdata/schema/regex.spec.yaml",
	"testdata/yaml/yaml.spec.yaml",
}

func TestWithData(t *testing.T) {
	var fileSlice = []specimen.File{}
	for _, filename := range filenameSlice {
		fileSlice = append(fileSlice, specimen.ReadLocalFile(filename))
	}

	specimen.Run(
		t,
		codeboxSet,
		fileSlice,
	)
}