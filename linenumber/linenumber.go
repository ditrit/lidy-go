package main

// An example of use of the go yaml v3 Node API
// Disclaimer: I'm very new to go. This code may miss a lot of Go goodnesses

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	"gopkg.in/yaml.v3"
)

const testYaml = `
a: Easy!
b:
  c: 2
  d: [3, 4]
`

const yamlOffset = 18

func main() {
	var node yaml.Node
	err := yaml.Unmarshal([]byte(testYaml), &node)

	if err != nil {
		log.Fatalf("error unmarshling the yaml: %v", err)
	}

	var buf bytes.Buffer
	var writer tWriter = tWriter{&buf}

	processNode(node, writer, 0)

	println(buf.String())
}

type tWriter struct {
	io.Writer
}

func (writer tWriter) add(text string) {
	writer.Write([]byte(text))
}

func (writer tWriter) indent(count int) {
	writer.add(strings.Repeat("  ", count))
}

func processNode(node yaml.Node, writer tWriter, indent int) {
	description := nodeLocalDescription(node)

	writer.add(description)

	switch node.Kind {
	case yaml.DocumentNode:
		switch {
		case len(node.Content) == 1:
			processNode(*node.Content[0], writer, indent) // INDENT NOT INCREMENTED
		case len(node.Content) == 0:
			panic("got document node with 0 children")
		case len(node.Content) > 1:
			panic("got document node with more than one child")
		default:
			panic("len() < 0 ?")
		}
	case yaml.SequenceNode:
		writer.add(fmt.Sprintf("[%d][\n", len(node.Content)))
		for _, nodeRef := range node.Content {
			writer.indent(indent + 1)
			writer.add("- ")
			processNode(*nodeRef, writer, indent+1)
			writer.add("\n")
		}
		writer.indent(indent)
		writer.add("]")
	case yaml.MappingNode:
		c := len(node.Content)
		writer.add(fmt.Sprintf("[%d]{\n", c/2))
		if c%2 != 0 {
			writer.add("[[len(node.Content) is ODD!!]]")
		}
		for k := 0; k < c; k += 2 {
			writer.indent(indent + 1)
			writer.add("[")
			processNode(*node.Content[k], writer, indent+1)
			writer.add("]: ")
			processNode(*node.Content[k+1], writer, indent+1)
			writer.add("\n")
		}
		writer.indent(indent)
		writer.add("}")
	case yaml.ScalarNode:
		writer.add(" ")
		writer.add(node.Value)
	case yaml.AliasNode:
		writer.add("&")
		writer.add(node.Alias.Anchor)
	}
}

func nodeLocalDescription(node yaml.Node) string {
	var kindStr = "\\_"

	switch node.Kind {
	case yaml.DocumentNode:
		kindStr = "\\doc"
	case yaml.SequenceNode:
		kindStr = "\\seq"
	case yaml.MappingNode:
		kindStr = "\\map"
	case yaml.ScalarNode:
		kindStr = "$"
	case yaml.AliasNode:
		kindStr = "\\ali"
	}

	return fmt.Sprintf(
		"%s(%s:%d:%d)",
		kindStr,
		HereFilename(),
		yamlOffset+node.Line,
		node.Column,
	)
}

// base on https://stackoverflow.com/a/47219362/9878263
func HereFilename(skip ...int) string {
	sk := 1
	if len(skip) > 0 && skip[0] > 1 {
		sk = skip[0]
	}

	_, filename, _, _ := runtime.Caller(sk)
	cwd, err := os.Getwd()
	if err != nil {
		return filename
	}
	relFilename, err := filepath.Rel(cwd, filename)
	if err != nil {
		return filename
	}
	return fmt.Sprintf("./%s", relFilename)
}
