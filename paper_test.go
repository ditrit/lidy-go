package lidy_test

import (
	"github.com/ditrit/lidy"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("Paper/PaperFromFile", func() {
	It("Opens existing YAML files", func() {
		paper, err := lidy.PaperFromFile("lidy.schema.yaml")

		Expect(err).To(BeNil())
		Expect(string(paper.FileOutline.Content)).To(ContainSubstring("identifier.declaration"))
	})

	It("Errors on missing files", func() {
		_, err := lidy.PaperFromFile("`non-existing`file`")

		Expect(err).NotTo(BeNil())
	})
})
