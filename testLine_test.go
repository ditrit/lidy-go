package lidy_test

import (
	"github.com/ditrit/lidy"
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
	_, err := lidy.ValidatorFromLidyExpression(line.text)

	return err
}

// asSchemaDocument
// interpret the testline itself as a schema document
func (line *TestLine) asSchemaDocument() error {
	_, err := lidy.ValidatorFromString(line.text)

	return err
}
