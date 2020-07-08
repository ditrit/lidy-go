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
	schemaString := "main:" + strings.ReplaceAll("\n"+expression, "\n", "\n  ")

	parser := lidy.NewParser(
		filename,
		[]byte(schemaString),
	)
	return parser
}

func newParserFromRegexChecker(filename string, regexValue string) lidy.Parser {
	return newParserFromExpression(filename, "_regex: '"+regexValue+"'")
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
	if startsWithSkipFlag(group.description) {
		PDescribe(group.description, func() {})
		return
	}

	if len(group.criteriaMap) == 0 {
		Specify(group.description, func() {
			Fail("SPEC ERROR: group should contain at least one criterion")
		})
	}

	Describer := GetDescriber(group.description)

	Describer(group.description, func() {
		for criterionName, lineSlice := range group.criteriaMap {
			if startsWithSkipFlag(criterionName) {
				PSpecify(criterionName, func() {})
				continue
			}

			Specifier := SpecifierAndCriterionName(&criterionName)

			if len(lineSlice.slice) == 0 && lineSlice.reference == "" {
				Specifier(criterionName, func() {
					Fail("SPEC ERROR: criterion should contain at least one test")
				})
				continue
			}

			expectingError := strings.HasPrefix(criterionName, "reject")

			if !expectingError && !strings.HasPrefix(criterionName, "accept") {
				Specifier(criterionName, func() {
					Fail("SPEC ERROR: criterion name should begin with \"accept\" or \"reject\". The associated test list was skipped.")
				})
				continue
			}

			for k, testLine := range lineSlice.slice {
				lineName := fmt.Sprintf("%s (#%d)", criterionName, k)

				Specifier(lineName, func() {
					var parser lidy.Parser

					text := testLine.text
					if group.target == "document" {
						parser = lidy.NewParser("~"+text+"~.yaml", []byte(text))
					} else if group.target == "expression" {
						parser = newParserFromExpression("~"+text+"~expr.yaml", text)
					} else if group.target == "regex.checker" {
						parser = newParserFromRegexChecker("~"+text+"~regex.yaml", text)
					} else {
						panic("Unknown target '" + group.target + "'")
					}

					erl := parser.Schema()

					assertErlResult(expectingError, erl)
				})
			}
		}
	})
}

func (group *ContentGroup) runContentTest() {
	// COPY PASTED from (*SchemaGroup) :( I feel like a Golang noob -- MC

	if startsWithSkipFlag(group.description) {
		PDescribe(group.description, func() {})
		return
	}

	if len(group.criteriaMap) == 0 {
		Specify(group.description, func() {
			Fail("SPEC ERROR: group should contain at least one criterion")
		})
	}

	Describer := GetDescriber(group.description)

	Describer(group.description+" (("+group.schema+"))", func() {
		for criterionName, lineSlice := range group.criteriaMap {
			if startsWithSkipFlag(criterionName) {
				PSpecify(criterionName, func() {})
				continue
			}

			Specifier := SpecifierAndCriterionName(&criterionName)

			if len(lineSlice.slice) == 0 && lineSlice.reference == "" { // TODO implement reference loading
				Specifier(criterionName, func() {
					Fail("SPEC ERROR: criterion should contain at least one test")
				})
				continue
			}

			expectingError := strings.HasPrefix(criterionName, "reject")

			if !expectingError && !strings.HasPrefix(criterionName, "accept") {
				Specifier(criterionName, func() {
					Fail("SPEC ERROR: criterion name should begin with \"accept\" or \"reject\". The associated test list was skipped.")
				})
				continue
			}

			var parser lidy.Parser
			schemaFilename := "~" + group.description + "~.yaml"

			if group.target == "document" {
				parser = lidy.NewParser(schemaFilename, []byte(group.schema))
			} else if group.target == "expression" {
				parser = newParserFromExpression(schemaFilename, group.schema)
			} else if group.target == "regex.checker" {
				parser = newParserFromExpression(schemaFilename, group.schema)
			} else {
				parser = newParserFromExpression(schemaFilename, group.schema)
			}

			erl := parser.Schema()
			if len(erl) > 0 {
				Specifier(group.description, func() {
					Fail("no test run because schema ((" + group.schema + ")) failed to parse: " + erl[0].Error())
				})
				continue
			}

			for k, testLine := range lineSlice.slice {
				lineName := fmt.Sprintf("%s (#%d)", criterionName, k)

				Specifier(lineName, func() {
					erl := testLine.validate(parser)

					assertErlResult(expectingError, erl)
				})
			}
		}
	})
}

func GetDescriber(description string) func(text string, body func()) bool {
	Describer := Describe

	if strings.HasPrefix(description, "FOCUS ") {
		Describer = FDescribe
	}

	return Describer
}

func SpecifierAndCriterionName(criterionName *string) func(text string, body interface{}, timeout ...float64) bool {
	Specifier := Specify

	if strings.HasPrefix(*criterionName, "FOCUS ") {
		*criterionName = string([]rune(*criterionName)[6:])
		Specifier = FSpecify
	}

	return Specifier
}

func startsWithSkipFlag(name string) bool {
	return strings.HasPrefix(name, "SKIP ") || strings.HasPrefix(name, "PENDING ")
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
