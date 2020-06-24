package lidy_test

import (
	"os"
	"path/filepath"
	"strings"

	fo "github.com/ditrit/lidy/fileoutline"
)

type TestFileList struct {
	schema  []fo.FileOutline
	content []fo.FileOutline
}

// GetTestFileList walks "testdata/" and load files into two lists
func GetTestFileList() (TestFileList, error) {
	root := "testdata"
	var testFileList TestFileList

	schemaRoot := root + "/schema"
	schemaRootAlt := root + "\\schema"

	err := filepath.Walk(root, func(filename string, info os.FileInfo, err error) error {
		if strings.HasSuffix(filename, ".spec.hjson") {
			fileoutline, err := fo.ReadFile(filename)

			if err != nil {
				return err
			}

			if strings.HasPrefix(filename, schemaRoot) || strings.HasPrefix(filename, schemaRootAlt) {
				testFileList.schema = append(testFileList.schema, fileoutline)
			} else {
				testFileList.content = append(testFileList.content, fileoutline)
			}
		}

		return nil
	})

	return testFileList, err
}
