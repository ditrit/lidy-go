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
		Expect(string(paper.FileOutline.Content)).To(ContainSubstring("package paper_test"))
	})

	It("Errors on missing files", func() {
		fileOutline, err := lidy.PaperFromFile("`non-existing`file`")

		Expect(err).NotTo(BeNil())
		Expect(fileOutline).To(BeNil())
	})
})
