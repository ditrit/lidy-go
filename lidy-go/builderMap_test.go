package lidy_test

import (
	"fmt"

	lidy "github.com/ditrit/lidy/lidy-go"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

// hBuilderMap_test.go

var _ = Describe("How to use the builderMap", func() {
	It("Runs the builder", func() {
		result, err := lidy.NewParser(
			"jungleDefinition.yaml",
			[]byte(`
main: animal
animal:: string
`),
		).With(map[string]lidy.Builder{
			// The animal builder reduces the animal name to its first letter
			"animal": func(input lidy.Result) (interface{}, []error) {
				animal := input.Data().(string)
				if len(animal) == 0 {
					return nil, []error{fmt.Errorf("animal can't be the empty string")}
				}
				letter := string([]rune(animal)[0])
				return letter, nil
			},
		}).Parse(lidy.NewFile(
			"jungleContent.yaml",
			[]byte(`Jaguar`),
		))

		Expect(err).To(BeEmpty())

		switch v := result.Data().(type) {
		case string:
			Expect(v).To(Equal("J"))
		default:
			Fail(fmt.Sprintf("wrong result type for [%s]", v))
		}
	})
})
