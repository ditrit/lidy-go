package lidy_test

import (
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	"github.com/ditrit/lidy"
)

type TestFileList struct {
	schema     []lidy.File
	content    []lidy.File
	scalarType []lidy.File
}

// GetTestFileList walks "testdata/" and load files into two lists
func GetTestFileList(testFileList *TestFileList) error {
	root := "testdata"

	schemaRoot := root + "/schema"
	schemaRootAlt := root + "\\schema"

	scalarTypeRoot := root + "/scalarType"
	scalarTypeRootAlt := root + "\\scalarType"

	err := filepath.Walk(root, func(filename string, info os.FileInfo, err error) error {
		match := func(prefix string) bool {
			return strings.HasPrefix(filename, prefix)
		}

		if strings.HasSuffix(filename, ".spec.yaml") {
			content, err := ioutil.ReadFile(filename)
			file := lidy.NewFile(filename, content)
			if err != nil {
				return err
			}

			if match(schemaRoot) || match(schemaRootAlt) {
				testFileList.schema = append(testFileList.schema, file)
			} else if match(scalarTypeRoot) || match(scalarTypeRootAlt) {
				testFileList.scalarType = append(testFileList.scalarType, file)
			} else {
				testFileList.content = append(testFileList.content, file)
			}
		}

		return nil
	})

	return err
}
