package lidy_test

import (
	"fmt"
	"strings"

	"github.com/ditrit/lidy"
)

type TestLine struct {
	text       string
	extraCheck ExtraCheck
}

type ExtraCheck struct {
	contain string
}

func (line *TestLine) withExpression(schemaExpression string) {
	validator, err := lidy.ValidatorFromExpression(schemaExpression)

	if err != nil {
		panic(err)
	}

	validationError := validator.ValidateString(line.text)
	errorText := fmt.Sprintf("%s", validationError)

	if validationError != nil && !strings.Contains(errorText, line.extraCheck.contain) {
		panic(fmt.Sprintf("error \"%s\" does not contain \"%s\"", validationError, line.extraCheck.contain))
	}
}

func (line *TestLine) asSchemaExpression() error {
	_, err := lidy.ValidatorFromExpression(line.text)

	return err
}

func (line *TestLine) asSchemaDocument() error {
	_, err := lidy.ValidatorFromDocument(line.text)

	return err
}
