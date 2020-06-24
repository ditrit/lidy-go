package fileoutline_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/ditrit/lidy/fileoutline"
)

var _ = Describe("Util/Fileoutline/ReadFile", func() {
	It("Opens existing files", func() {
		fileOutline, err := fileoutline.ReadFile("fileoutline_test.go")

		Expect(err).To(BeNil())
		Expect(string(fileOutline.Content)).To(ContainSubstring("package fileoutline_test"))
	})

	It("Errors on missing files", func() {
		fileOutline, err := fileoutline.ReadFile("`non-existing`file`")

		Expect(err).NotTo(BeNil())
		Expect(fileOutline).To(BeNil())
	})
})
