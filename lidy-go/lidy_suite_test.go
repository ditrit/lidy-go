package lidy

import (
	"testing"

	"github.com/ditrit/specimen/go/specimen"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var codeboxSet = specimen.MakeCodeboxSet(map[string]specimen.BoxFunction{
	"trial ACCEPT":          trial("ACCEPT", false),
	"trial REJECT":          trial("REJECT", false),
	"template trial ACCEPT": trial("ACCEPT", true),
	"template trial REJECT": trial("REJECT", true),
	"regex trial ACCEPT":    make_lidy_parser("accept"),
	"regex trial REJECT":    make_lidy_parser("reject"),
	"make lidy parser":      make_lidy_parser(""),
})

var filenameSlice = []string{
	"testdata/collection/listOf.spec.yaml",
	"testdata/collection/map.spec.yaml",
	"testdata/collection/mapOf.spec.yaml",
	// "testdata/collection/merge.spec.yaml",
	"testdata/collection/min_max_nb.spec.yaml",
	"testdata/collection/tuple.spec.yaml",
	"testdata/combinator/oneOf.spec.yaml",
	"testdata/scalar/in.spec.yaml",
	"testdata/scalar/regex.spec.yaml",
	"testdata/scalarType/scalar.spec.yaml",
	"testdata/schema/document.spec.yaml",
	"testdata/schema/expression.spec.yaml",
	// "testdata/schema/mergeChecker.spec.yaml",
	"testdata/schema/regex.spec.yaml",
	"testdata/yaml/yaml.spec.yaml",
}

func TestLidy(t *testing.T) {
	// Ginkgo and Gomega
	RegisterFailHandler(Fail)
	RunSpecs(t, "Lidy Suite")

	// Specimen data-based test
	var fileSlice = []specimen.File{}
	for _, filename := range filenameSlice {
		fileSlice = append(fileSlice, specimen.ReadLocalFile(filename))
	}
	specimen.Run(
		t,
		codeboxSet,
		fileSlice,
	)
}
