package lidy_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"gopkg.in/yaml.v3"
)

var _ = Describe("The yaml parser", func() {
	Specify("yaml.Unmarshal", func() {
		var node yaml.Node

		Expect(node.Kind).To(Equal(yaml.Kind(0)))

		err := yaml.Unmarshal([]byte(`
a: Easy!
b:
  c: 2
  d: [3, 4]
`), &node)

		Expect(err).To(BeNil())

		if err != nil {
			return
		}

		Expect(node.Kind).To(Equal(yaml.DocumentNode))
		Expect(node.Content).To(HaveLen(1))
		Expect(node.Content[0].Kind).To(Equal(yaml.MappingNode))
	})
})
