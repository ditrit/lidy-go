package lidy_test

import (
	"fmt"
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

// withValidator
// Interpret the testline as data, to be used with the given validator.
func (line *TestLine) againstSchema(parser lidy.Parser) []error {
	_, erl := parser.Parse(lidy.NewFile(
		"~testContent.yaml~",
		[]byte(line.text),
	))
	return erl
}

// asSchemaExpression
// interpret the testline itself as a schema expression
func (line *TestLine) asSchemaExpression() []error {
	parser := lidy.NewParser(
		"~testSchemaExpressoin.yaml~",
		[]byte("main:"+strings.ReplaceAll("\n"+line.text, "\n", "\n  ")),
	)
	erl := parser.Schema()
	return erl
}

// asSchemaDocument
// interpret the testline itself as a schema document
func (line *TestLine) asSchemaDocument() []error {
	parser := lidy.NewParser("~testSchemaDocument.yaml~", []byte(line.text))
	erl := parser.Schema()
	return erl
}

var _ = Describe("schema tests", func() {
	testFileList, err := GetTestFileList()

	Specify("the testFileList contains files", func() {
		if len(testFileList.content) == 0 {
			Fail("empty .content")
		}
		if len(testFileList.schema) == 0 {
			Fail("empty .schema")
		}
	})

	for _, file := range testFileList.schema {
		schemaData := SchemaData{}

		err := schemaData.UnmarshalHumanJSON([]byte(file.Content()))
		if err != nil {
			panic(err)
		}

		for description, group := range schemaData.groupMap {
			group.target = schemaData.target
			group.description = description
			group.runTest()
		}
	}

	if err != nil {
		panic(err)
	}
})

func (group *SchemaGroup) runTest() {
	if len(group.criteriaMap) == 0 {
		Specify(group.description, func() {
			Fail("SPEC ERROR: group should contain at least one criterion")
		})
	}

	Describe(group.description, func() {
		for criterionName, lineList := range group.criteriaMap {
			if len(lineList) == 0 {
				Specify(criterionName, func() {
					Fail("SPEC ERROR: criterion should contain at least one test")
				})
			}
			if shouldBeSkipped(criterionName) {
				return
			}

			expectingError := strings.HasPrefix(criterionName, "reject")

			if !expectingError && !strings.HasPrefix(criterionName, "accept") {
				Specify(criterionName, func() {
					Fail("SPEC ERROR: criterion name should begin with \"accept\" or \"reject\". The associated test list was skipped.")
				})
				continue
			}

			for k, testLine := range lineList {
				It(fmt.Sprintf("%s (#%d)", criterionName, k), func() {
					var erl []error

					if group.target == "document" {
						erl = testLine.asSchemaDocument()
					} else {
						erl = testLine.asSchemaExpression()
					}

					if expectingError && len(erl) == 0 {
						Fail("Expected an error")
					} else if !expectingError && len(erl) > 0 {
						Fail("Got error: " + erl[0].Error() + " (1/" + string(len(erl)) + ")")
					}
				})
			}
		}
	})
}

func shouldBeSkipped(name string) bool {
	return strings.HasPrefix(name, "SKIP") || strings.HasPrefix(name, "PENDING")
}
