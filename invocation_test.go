package lidy_test

import (
	"github.com/ditrit/lidy"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

// invocation_test.go

var _ = Describe("The lidy loaders", func() {
	Specify("Using a Lidy file loader", func() {
		var _ = lidy.File{Name: "hello.txt"}
	})
	Specify("Using a Lidy string loader", func() {
		var _ = lidy.File{Text: "Hello World!"}
	})
	Specify("Using a Lidy string loader, providing an informative filename", func() {
		var _ = lidy.File{
			Text: "Hello World!",
			Name: "hello.txt",
		}
	})
})
var _ = Describe("The different ways to invoke lidy checking features", func() {
	Specify("Checking that a file can be loaded", func() {
		text, err := lidy.File{Name: "testdata/asset/some.txt"}.Load()
		Expect(text).To(Equal("Text!\n"))
		Expect(err).To(BeNil())
	})
	When("Checking that a file is valid YAML", func() {
		It("works works with YAML", func() {
			_, err := lidy.File{Name: "testdata/asset/some.yaml"}.Yaml()
			Expect(err).To(BeNil())
		})
		It("works with JSON, since JSON is YAML", func() {
			_, err := lidy.File{Name: "testdata/asset/some.json"}.Yaml()
			Expect(err).To(BeNil())
		})
	})
	When("Checking that a schema is valid", func() {
		It("works works with YAML", func() {
			_, err := lidy.File{Name: "testdata/asset/schema.yaml"}.Schema()
			Expect(err).To(BeNil())
		})
		It("works with JSON, since JSON is YAML", func() {
			_, err := lidy.File{Name: "testdata/asset/schema.json"}.Schema()
			Expect(err).To(BeNil())
		})
	})
	When("Running a schema against YAML file", func() {
		It("works works with YAML", func() {
			_, err := lidy.File{Name: "testdata/asset/schema.yaml"}.With()
			Expect(err).To(BeNil())
		})
		It("works with JSON, since JSON is YAML", func() {
			_, err := lidy.File{Name: "testdata/asset/schema.json"}.Schema()
			Expect(err).To(BeNil())
		})
	})
})
