package lidy_test

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/ditrit/lidy"
	"gopkg.in/yaml.v3"
)

// TestLidy runs all lidy data tests
func TestLidy(t *testing.T) {
	var fileList []lidy.File
	var schemaFileList []lidy.File
	var scalarFileList []lidy.File

	root := "testdata"

	schemaRoot := root + "/schema"
	schemaRootAlt := root + "\\schema"

	scalarTypeRoot := root + "/scalarType"
	scalarTypeRootAlt := root + "\\scalarType"

	isSchemaFile := func(filename string) bool {
		return strings.HasPrefix(filename, schemaRoot) || strings.HasPrefix(filename, schemaRootAlt)
	}

	isScalarTypeFile := func(filename string) bool {
		return strings.HasPrefix(filename, scalarTypeRoot) || strings.HasPrefix(filename, scalarTypeRootAlt)
	}

	// fill up the fileList
	err := filepath.Walk(root, func(filename string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return err
		}
		if strings.HasSuffix(filename, ".spec.yaml") {
			content, err := ioutil.ReadFile(filename)
			if err != nil {
				return err
			}
			file := lidy.NewFile(filename, content)

			if isSchemaFile(filename) {
				schemaFileList = append(schemaFileList, file)
			} else if isScalarTypeFile(filename) {
				scalarFileList = append(scalarFileList, file)
			} else {
				fileList = append(fileList, file)
			}
		}

		return nil
	})

	if err != nil {
		t.Fatal(err)
	}

	runCriterion := func(t *testing.T, runList *[]func(), criterionName string, runnable func()) {}

	runSimpleGroup := func(t *testing.T, runList *[]func(), groupData *yaml.Node) {
		if groupData.Kind != yaml.MappingNode {
			t.Fatalf("[test data] Expected group to be a yaml mapping")
		}
		content = groupData.Content

		for k := range content {
			if k%2 > 0 {
				continue
			}
			criterionName = content[k]
			criterionNode = content[k+1]
			runnable := func() {
				t.Run("", func() {})
			}
			runCriterion(t, runList, criterionName, runnable)
			// TODO
		}
	}

	runSchemaGroup := func(t *testing.T, runList *[]func(), target string, groupData *yaml.Node) {
		// TODO
	}

	runFileContent := func(t *testing.T, runList *[]func(), file lidy.File, kind string) {
		var document yaml.Node
		err := yaml.Unmarshal([]byte(file.Content()), &document)
		if err != nil {
			t.Fatal(err)
		}
		if document.Kind != yaml.DocumentNode {
			t.Fatalf("[test data] Unexpectedly didn't get a document node")
		}
		if len(document.Content) != 1 {
			t.Fatalf("[test data] Unexpectedly didn't get a document count of 1")
		}
		if document.Content[0].Kind != yaml.MappingNode {
			t.Fatalf("[test data] Expected the document to be a yaml mapping")
		}
		content := document.Content[0].Content

		var target string

		for k := range content {
			if k%2 > 0 {
				continue
			}

			key := content[k]

			if key.Tag != "!str" {
				t.Fatalf("[test data] Expected all group names to be a string")
			}
			name := key.Value

			if kind == "schema" && name == "target" {
				targetValueNode := content[k+1]
				if targetValueNode.Tag != "!str" {
					t.Fatalf("[test data][schema] Expected target to be a string")
				}
				target = targetValueNode.Value
				continue
			}

			*runList = append(*runList, func() {
				location := fmt.Sprintf("%s:%d:%d", file.Name(), key.Line, key.Column)
				group_run_name := fmt.Sprintf("%s group %s (%s)", kind, name, location)

				t.Run(group_run_name, func(t *testing.T) {
					if kind == "simple" {
						runSimpleGroup(t, runList, file, content[k+1])
					} else if kind == "schema" {
						runSchemaGroup(t, runList, file, target, content[k+1])
					}
				})
			})
		}
	}

	loadFile := func(t *testing.T, runList *[]func(), file lidy.File, kind string) {
		t.Run(fmt.Sprintf("file %s", file.Name()), func(t *testing.T) {
			runFileContent(t, runList, file, kind)
		})
	}

	runList := &[]func(){}

	for _, file := range fileList {
		loadFile(t, runList, file, "simple")
	}
	for _, file := range scalarFileList {
		loadFile(t, runList, file, "scalar")
	}
	for _, file := range schemaFileList {
		loadFile(t, runList, file, "schema")
	}

	for k := 0; k < len(*runList); k += 1 {
		(*runList)[k]()
	}
}
