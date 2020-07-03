package lidy_test

import (
	"fmt"

	"github.com/ditrit/lidy"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("How to use the builderMap", func() {
	It("Runs the builder", func() {
		result, err := lidy.NewParser(
			"jungleDefinition.yaml",
			[]byte(`
main: animal
animal:: str
`),
		).With(map[string]lidy.Builder{
			"animal": func(input interface{}) (lidy.Result, []error) {
				animal := input.(string)
				if len(animal) == 0 {
					return nil, []error{fmt.Errorf("animal can't be the empty string")}
				}
				letter := []byte(animal)[0]
				return letter, nil
			},
		}).Parse(lidy.NewFile(
			"jungleContent.yaml",
			[]byte(`Jaguar`),
		))

		Expect(err).To(BeEmpty())

		switch v := result.(type) {
		case lidy.MapResult:
			Expect(v.MapOf).To(BeEmpty())
			Expect(v.Map).To(BeEmpty())
		}
	})
})
