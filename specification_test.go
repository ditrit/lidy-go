package lidy_test

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

	"github.com/ditrit/lidy"
	. "github.com/onsi/ginkgo"
)

type TestLine struct {
	text       string
	extraCheck ExtraCheck
}

type ExtraCheck struct {
	contain string
}

type tContext struct {
	namedSlice map[string]TestLineSlice
}

func newParserFromExpression(filename string, expression string) lidy.Parser {
	parser := lidy.NewParser(
		filename,
		[]byte("main:"+strings.ReplaceAll("\n"+expression, "\n", "\n  ")),
	)
	return parser
}

// validate
// Interpret the testline as data, to be used with the given validator.
func (line *TestLine) validate(parser lidy.Parser) []error {
	_, erl := parser.Parse(lidy.NewFile(
		"~"+line.text+"~.yaml",
		[]byte(line.text),
	))
	return erl
}

// asSchemaExpression
// interpret the testline itself as a schema expression
func (line *TestLine) asSchemaExpression() []error {
	parser := newParserFromExpression(line.text, line.text)
	erl := parser.Schema()
	return erl
}

// asSchemaDocument
// interpret the testline itself as a schema document
func (line *TestLine) asSchemaDocument() []error {
	parser := lidy.NewParser("~"+line.text+"~.yaml", []byte(line.text))
	erl := parser.Schema()
	return erl
}

// Loading files and running tests
var _ = Describe("schema tests", func() {
	testFileList, err := GetTestFileList()
	if err != nil {
		panic(err)
	}

	Specify("the testFileList contains files", func() {
		if len(testFileList.content) == 0 {
			Fail("empty .content")
		}
		if len(testFileList.schema) == 0 {
			Fail("empty .schema")
		}
	})

	// Schema
	for _, file := range testFileList.schema {
		// Let's hook onto JSON's rich deserialisation interface
		jsonData, err := HumanJSONtoJSON([]byte(file.Content()))
		if err != nil {
			panic(err)
		}

		schemaData := SchemaData{}
		err = json.Unmarshal(jsonData, &schemaData)
		if err != nil {
			panic(err)
		}

		for description, group := range schemaData.groupMap {
			group.target = schemaData.target
			group.description = description
			group.runSchemaTest()
		}
	}

	// Content
	for _, file := range testFileList.content {
		// Let's hook onto JSON's rich deserialisation interface
		jsonData, err := HumanJSONtoJSON([]byte(file.Content()))
		if err != nil {
			panic(err)
		}

		contentData := ContentData{}
		err = json.Unmarshal(jsonData, &contentData)
		if err != nil {
			panic(err)
		}

		for description, group := range contentData.groupMap {
			group.description = description
			group.runContentTest()
		}
	}

	if err != nil {
		panic(err)
	}
})

func (group *SchemaGroup) runSchemaTest() {
	if len(group.criteriaMap) == 0 {
		Specify(group.description, func() {
			Fail("SPEC ERROR: group should contain at least one criterion")
		})
	}

	Describe(group.description, func() {
		for criterionName, lineSlice := range group.criteriaMap {
			if startsWithSkipFlag(criterionName) {
				PSpecify(criterionName, func() {})
				continue
			}

			if len(lineSlice.slice) == 0 && lineSlice.reference == "" {
				Specify(criterionName, func() {
					Fail("SPEC ERROR: criterion should contain at least one test")
				})
				continue
			}

			expectingError := strings.HasPrefix(criterionName, "reject")

			if !expectingError && !strings.HasPrefix(criterionName, "accept") {
				Specify(criterionName, func() {
					Fail("SPEC ERROR: criterion name should begin with \"accept\" or \"reject\". The associated test list was skipped.")
				})
				continue
			}

			for k, testLine := range lineSlice.slice {
				lineName := fmt.Sprintf("%s (#%d)", criterionName, k)

				Specify(lineName, func() {
					// goal := "___"
					// if strings.Contains(lineName, goal) {
					// 	fmt.Printf(goal + "\n")
					// }

					var erl []error

					if group.target == "document" {
						erl = testLine.asSchemaDocument()
					} else {
						erl = testLine.asSchemaExpression()
					}

					assertErlResult(expectingError, erl)
				})
			}
		}
	})
}

func (group *ContentGroup) runContentTest() {
	// COPY PASTED from (*SchemaGroup) :( I feel like a Golang noob -- MC

	if len(group.criteriaMap) == 0 {
		Specify(group.description, func() {
			Fail("SPEC ERROR: group should contain at least one criterion")
		})
	}

	Describe(group.description, func() {
		for criterionName, lineSlice := range group.criteriaMap {
			if startsWithSkipFlag(criterionName) {
				PSpecify(criterionName, func() {})
				continue
			}

			if len(lineSlice.slice) == 0 && lineSlice.reference == "" { // TODO implement reference loading
				Specify(criterionName, func() {
					Fail("SPEC ERROR: criterion should contain at least one test")
				})
				continue
			}

			expectingError := strings.HasPrefix(criterionName, "reject")

			if !expectingError && !strings.HasPrefix(criterionName, "accept") {
				Specify(criterionName, func() {
					Fail("SPEC ERROR: criterion name should begin with \"accept\" or \"reject\". The associated test list was skipped.")
				})
				continue
			}

			var parser lidy.Parser
			schemaFilename := "~" + group.description + "~.yaml"

			if group.target == "document" {
				parser = lidy.NewParser(schemaFilename, []byte(group.schema))
			} else {
				parser = newParserFromExpression(schemaFilename, group.schema)
			}

			erl := parser.Schema()
			if len(erl) > 0 {
				Specify(group.description, func() {
					Fail("Even schema failed to parse: " + erl[0].Error())
				})
			}

			for k, testLine := range lineSlice.slice {
				lineName := fmt.Sprintf("%s (#%d)", criterionName, k)

				Specify(lineName, func() {
					goal := "accept a lot of strings"
					if strings.Contains(lineName, goal) {
						fmt.Printf(goal + "\n")
					}

					erl := testLine.validate(parser)

					assertErlResult(expectingError, erl)
				})
			}
		}
	})
}

func startsWithSkipFlag(name string) bool {
	return strings.HasPrefix(name, "SKIP") || strings.HasPrefix(name, "PENDING")
}

func assertErlResult(expectingError bool, erl []error) {
	if expectingError && len(erl) == 0 {
		Fail("Expected an error")
	} else if !expectingError && len(erl) > 0 {
		failWithErl("Got error: ", erl)
	}
}

func failWithErl(message string, erl []error) {
	Fail(message + erl[0].Error() + " (1/" + strconv.Itoa(len(erl)) + ")")
}
