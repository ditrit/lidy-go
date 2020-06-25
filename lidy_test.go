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

// // withValidator
// // Interpret the testline as data, to be used with the given validator.
// func (line *TestLine) withValidator(validator lidy.Validator) error {
// 	validationError := validator.ValidateString(line.text)
// 	errorText := fmt.Sprintf("%s", validationError)

// 	if validationError != nil && !strings.Contains(errorText, line.extraCheck.contain) {
// 		panic(fmt.Sprintf("error \"%s\" does not contain \"%s\"", validationError, line.extraCheck.contain))
// 	}

// 	return validationError
// }

// asSchemaExpression
// interpret the testline itself as a schema expression
func (line *TestLine) asSchemaExpression() error {
	_, err := lidy.NewParserFromExpression(line.text)

	return err
}

// asSchemaDocument
// interpret the testline itself as a schema document
func (line *TestLine) asSchemaDocument() error {
	paper, err := lidy.PaperFromString(line.text)

	if err != nil {
		return err
	}

	_, err = lidy.NewParser(paper, nil, lidy.ParserOption{})

	return err
}

var _ = Describe("", func() {
	testFileList, err := GetTestFileList()

	for _, file := range testFileList.schema {
		schemaData := SchemaData{}

		schemaData.UnmarshalHumanJSON([]byte(file.Content))

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
							var err error

							if schemaData.target == "document" {
								err = testLine.asSchemaDocument()
							} else {
								err = testLine.asSchemaExpression()
							}

							if expectingError && err == nil {
								Fail("Expected an error")
							} else if !expectingError && err != nil {
								Fail("Got error: " + err.Error())
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
