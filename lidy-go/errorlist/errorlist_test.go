package errorlist

import (
	"fmt"
	"testing"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

func TestGoLi(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "errrorlist Suite")
}

var _ = Describe("Usual use case", func() {
	Specify("Push adds an error list", func() {
		errList := List{}
		errList.Push([]error{fmt.Errorf("aaa")})

		Expect(errList.list).To(HaveLen(1))
		Expect(errList.list[0]).To(HaveLen(1))
		Expect(errList.list[0][0].Error()).To(Equal("aaa"))
	})
	It("ConcatError", func() {
		errList := List{}
		errList.list = [][]error{{fmt.Errorf("bbb")}}
		result := errList.ConcatError()

		Expect(result).To(HaveLen(1))
		Expect(result[0].Error()).To(Equal("bbb"))
	})
	It("Produces a previously registered error", func() {
		errList := List{}
		errList.Push([]error{fmt.Errorf("ccc")})
		result := errList.ConcatError()

		Expect(result).To(HaveLen(1))
		Expect(result[0].Error()).To(Equal("ccc"))
	})
})
