package lidy

import (
	"testing"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

func TestGoLi(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Lidy Suite")
}
