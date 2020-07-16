package lidy_test

import (
	"io/ioutil"

	"github.com/ditrit/lidy"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

// invocation_test.go

var _ = Describe("The lidy loaders", func() {
	Specify("Using a Lidy file loader", func() {
		filename := ".gitignore"
		byteContent, _ := ioutil.ReadFile(filename)

		var _ = lidy.NewFile(filename, byteContent)
	})
	Specify("Using a Lidy string loader", func() {
		var _ = lidy.NewFile("", []byte("Hello World!"))
	})
	Specify("Using a Lidy string loader, providing an informative filename", func() {
		var _ = lidy.NewFile("hello.txt", []byte("Hello World!"))
	})
})

var _ = Describe("The different ways to invoke lidy checking features", func() {
	When("Checking that a file is valid YAML", func() {
		It("works with YAML", func() {
			err := lidy.NewFile("some.yaml", []byte(`a: b`)).Yaml()
			Expect(err).To(BeNil())
		})
		It("works with JSON, since JSON is YAML", func() {
			err := lidy.NewFile("some.json", []byte(`{ "a": "b" }`)).Yaml()
			Expect(err).To(BeNil())
		})
	})
	When("Checking that a schema is valid", func() {
		It("works with YAML", func() {
			err := lidy.NewParser("schema.yaml", []byte(`main: string`)).Schema()
			Expect(err).To(BeEmpty())
		})
		It("works with JSON, since JSON is YAML", func() {
			err := lidy.NewParser("schema.json", []byte(`{ "main": "string" }`)).Schema()
			Expect(err).To(BeEmpty())
		})
	})
	When("Running a schema against YAML file", func() {
		It("works with YAML", func() {
			content := "Hello, I'm a string!"

			parser := lidy.NewParser("schema.yaml", []byte(`main: string`))
			result, err := parser.Parse(
				lidy.NewFile("content.yaml", []byte(content)),
			)

			Expect(err).To(BeEmpty())
			Expect(result.Data()).To(Equal(content))
		})
		It("works with JSON, since JSON is YAML", func() {
			content := "Hello, I'm a string!"

			parser := lidy.NewParser("schema.json", []byte(`{ "main": "string" }`))
			result, err := parser.Parse(
				lidy.NewFile("content.yaml", []byte(content)),
			)

			Expect(err).To(BeEmpty())
			Expect(result.Data()).To(Equal(content))
		})
	})

	Specify("the example of the README should work", func() {
		result, err := lidy.NewParser(
			"treeDefinition.yaml",
			[]byte(`
main: tree

tree:
  _map:
    name: string
    children:
      _listOf: tree
`),
		).Parse(lidy.NewFile(
			"treeContent.yaml",
			[]byte(`
name: root
children:
  - name: leafA
    children: []
  - name: branchB
    children:
    - name: leafC
      children: []
  - name: leafD
    children: []
`),
		))

		Expect(err).To(BeEmpty())

		switch v := result.Data().(type) {
		case lidy.MapData:
			Expect(v.MapOf).To(BeEmpty())
			Expect(v.Map).To(HaveLen(2))
		default:
			Fail("Expected result of type MapResult")
		}
	})
})
