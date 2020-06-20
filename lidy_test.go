package lidy_test

import (
	"fmt"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("", func() {
	testFileList, err := GetTestFileList()

	for _, file := range testFileList.schema {
		schemaData := SchemaData{}

		schemaData.UnmarshalHumanJSON([]byte(file.Content))

		for description, group := range schemaData.groupMap {
			Describe(description, func() {
				for criteriaName, criteria := range group.criteriaMap {
					for k, testLine := range criteria {
						It(fmt.Sprintf("%s(%d)", criteriaName, k), func() {
							if schemaData.target == "document" {
								testLine.asSchemaDocument()
							} else {
								testLine.asSchemaExpression()
							}
						})
					}
				}
			})
			if content, ok := v.(map[string]interface{}); ok {
			}
			fmt.Printf("key[%s] value[%s]\n", k, v)
		}
	}

	if err != nil {
		panic(err)
	}
})
