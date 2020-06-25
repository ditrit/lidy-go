package lidy

import "gopkg.in/yaml.v3"

// lidyCore.go
// implement methods for core types like tRule and tExpression

func (r tRule) apply(content yaml.Node) (Result, error) {
	return nil, nil
}
