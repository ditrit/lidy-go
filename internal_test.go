package lidy

import (
	"testing"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"gopkg.in/yaml.v3"
)

func TestGoLi(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Lidy Suite")
}

var _ = Describe("file.Yaml", func() {
	Specify("it unmarshals the yaml to the .yaml field", func() {
		file := NewFile("someYaml.txt", []byte(`a: "a string"`))
		internalFile := file.(*tFile)

		Expect(internalFile.yaml.Kind).To(Equal(yaml.Kind(0)))

		err := file.Yaml()
		Expect(err).To(BeNil())

		if err != nil {
			return
		}

		internalFile = file.(*tFile) // Is it really needed?
		node := internalFile.yaml

		Expect(node.Kind).To(Equal(yaml.DocumentNode), "document node kind")
		Expect(node.Content).To(HaveLen(1), "content length")
		Expect(node.Content[0].Kind).To(Equal(yaml.MappingNode), "root kind")
		// Expect(node.Content[0].Tag).To(Equal("!!str"))
	})
})

var _ = Describe("Internal behaviours of current implementation", func() {
	When(".Yaml() is called", func() {
		It("loads the Yaml document", func() {
			file := NewFile("someYaml.txt", []byte(`"I am just a string"`))
			err := file.Yaml()
			Expect(err).To(BeNil())
		})

		It("errors if the document is invalid Yaml", func() {
			file := NewFile("notYaml.txt", []byte(`"I am NOT a YAML document!`))
			err := file.Yaml()
			Expect(err).NotTo(BeNil())
		})
	})
})

var _ = Describe("_map schema parsing", func() {
	It("parses all _map keys", func() {
		parser := NewParser("schema.yaml", []byte(`
main:
  _map:
    ka: str
    kb: str
`)).(*tParser)
		erl := parser.Schema()
		Expect(erl).To(HaveLen(0))

		mainRule := parser.schema.ruleMap["main"]
		Expect(mainRule).NotTo(BeNil())

		mapChecker, isTMap := mainRule.expression.(tMap)
		Expect(isTMap).To(BeTrue())
		Expect(mapChecker.form.propertyMap).To(HaveLen(2))
	})
})
