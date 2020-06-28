package lidy_test

import (
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	"github.com/ditrit/lidy"
)

type TestFileList struct {
	schema  []lidy.File
	content []lidy.File
}

// GetTestFileList walks "testdata/" and load files into two lists
func GetTestFileList() (TestFileList, error) {
	root := "testdata"
	var testFileList TestFileList

	schemaRoot := root + "/schema"
	schemaRootAlt := root + "\\schema"

	err := filepath.Walk(root, func(filename string, info os.FileInfo, err error) error {
		if strings.HasSuffix(filename, ".spec.hjson") {
			content, err := ioutil.ReadFile(filename)
			file := lidy.NewFile(filename, content)

			if err != nil {
				return err
			}

			if strings.HasPrefix(filename, schemaRoot) || strings.HasPrefix(filename, schemaRootAlt) {
				testFileList.schema = append(testFileList.schema, file)
			} else {
				testFileList.content = append(testFileList.content, file)
			}
		}

		return nil
	})

	return testFileList, err
}
