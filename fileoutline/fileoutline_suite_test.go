package fileoutline_test

import (
	"testing"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

func TestFileoutline(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Fileoutline Suite")
}
