package lidy_test

import (
	"io/ioutil"

	"github.com/ditrit/lidy"
	. "github.com/onsi/ginkgo"
)

// hSchemaSet_test.go

var _ = Describe("The lidy (meta) schema", func() {
	Specify("The lidy schema can be loaded", func() {
		filename := "schema.lidy.yaml"
		byteContent, _ := ioutil.ReadFile(filename)

		parser := lidy.NewParser(filename, byteContent)

		errorList := parser.Schema()

		if len(errorList) > 0 {
			Fail("Parsing produced errors. [0]: " + errorList[0].Error())
		}
	})
	Specify("The lidy schema matches the lidy schema", func() {
		filename := "schema.lidy.yaml"
		byteContent, _ := ioutil.ReadFile(filename)

		parser := lidy.NewParser(filename, byteContent)
		file := lidy.NewFile(filename, byteContent)

		_, errorList := parser.Parse(file)

		if len(errorList) > 0 {
			Fail("Matching produced errors. [0]: " + errorList[0].Error())
		}
	})
})
