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

		fmt.Printf("Name: %s\n", file.Name())

		err := schemaData.UnmarshalHumanJSON([]byte(file.Content()))
		if err != nil {
			panic(err)
		}

		for description, group := range schemaData.groupMap {
			Describe(description, func() {
				for criterionName, lineList := range group.criteriaMap {
					expectingError := strings.HasPrefix(criterionName, "reject")

					if !expectingError && !strings.HasPrefix(criterionName, "accept") {
						It(criterionName, func() {
							Fail("SPEC ERROR: criterion name should begin with \"accept\" or \"reject\". The associated test list was skipped.")
						})
						continue
					}

					for k, testLine := range lineList {
						It(fmt.Sprintf("%s(%d)", criterionName, k), func() {
							var erl []error

							if schemaData.target == "document" {
								erl = testLine.asSchemaDocument()
							} else {
								erl = testLine.asSchemaExpression()
							}

							if expectingError && erl == nil {
								Fail("Expected an error")
							} else if !expectingError && erl != nil {
								Fail("Got error: " + erl[0].Error() + " (1/" + string(len(erl)) + ")")
							}
						})
					}
				}
			})
			// if content, ok := v.(map[string]interface{}); ok {
			// }
			// fmt.Printf("key[%s] value[%s]\n", k, v)
		}
	}

	if err != nil {
		panic(err)
	}
})
