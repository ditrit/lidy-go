package lidy_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	. "github.com/ditrit/lidy"
)

var _ = Describe("_copy keyword test using a dedicated Grammar ->", func() {
	It("The compiler should manage grammar rules that use the '_copy' fonctionnality", func() {
		Expect(GetTrue()).Should(BeTrue())
	})
	It("GetFalse returns false", func() {
		Expect(GetFalse()).Should(BeFalse())
	})
})
