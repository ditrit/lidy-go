package lidy_test

import (
	"encoding/json"

	"github.com/hjson/hjson-go"
)

// readTestdata_test.go
//
// Types and methods to deserialize the .hjson files in testdata/

// SchemaData
type SchemaData struct {
	target   string
	groupMap map[string]SchemaGroup
}

type SchemaGroup struct {
	criteriaMap map[string]TestLineSlice
}

type TestLineSlice []TestLine

// ContentData
type ContentData struct {
	groupMap map[string]ContentGroup
}

type ContentGroup struct {
	target      string
	schema      string
	template    string
	criteriaMap map[string]TestLineSlice
}

// UnmarshalHumanJSON -- Hooks onto JSON's rich deserialisation interface
func (schemaData *SchemaData) UnmarshalHumanJSON(input []byte) error {
	// Convert to JSON
	var data interface{}

	err := hjson.Unmarshal(input, &data)
	if err != nil {
		return err
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	// Unmarshal JSON
	err = json.Unmarshal(jsonData, schemaData)

	return err
}

func (schemaData *SchemaData) UnmarshalJSON(compositeJsonInput []byte) error {
	data := make(map[string]interface{})

	err := json.Unmarshal(compositeJsonInput, &data)
	if err != nil {
		return err
	}

	schemaData.target = data["target"].(string)
	delete(data, "target")

	pureJsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	schemaData.groupMap = make(map[string]SchemaGroup)

	err = json.Unmarshal(pureJsonData, &schemaData.groupMap)
	if err != nil {
		return err
	}

	return nil
}

var _ json.Unmarshaler = (*SchemaData)(nil)

func (lineSlice *TestLineSlice) UnmarshalJSON(jsonData []byte) error {
	lineMap := make(map[string]ExtraCheck)

	err := json.Unmarshal(jsonData, &lineMap)
	if err != nil {
		return err
	}

	for key, check := range lineMap {
		*lineSlice = append(*lineSlice, TestLine{text: key, extraCheck: check})
	}

	var lineArray [][]interface{}

	err = json.Unmarshal(jsonData, &lineArray)
	if err != nil {
		return err
	}

	for _, pair := range lineArray {
		text := pair[0].(string)
		checkMap := pair[1].(map[string]string)

		var check ExtraCheck
		if contain, ok := checkMap["contain"]; ok {
			check.contain = contain
		}

		*lineSlice = append(*lineSlice, TestLine{text: text, extraCheck: check})
	}

	return nil
}

func (contentGroup *ContentGroup) UnmarshalJSON(compositeJsonInput []byte) error {
	data := make(map[string]interface{})

	err := json.Unmarshal(compositeJsonInput, &data)
	if err != nil {
		return err
	}

	if schema, ok := data["expression"].(string); ok {
		delete(data, "expression")

		contentGroup.target = "expression"
		contentGroup.schema = schema
	} else if schema, ok := data["schema"].(string); ok {
		delete(data, "schema")

		contentGroup.target = "document"
		contentGroup.schema = schema
	} else if template, ok := data["expressionTemplate"].(string); ok {
		delete(data, "expressionTemplate")

		contentGroup.target = "expression"
		contentGroup.template = template
	} else if template, ok := data["schemaTemplate"].(string); ok {
		delete(data, "schemaTemplate")

		contentGroup.target = "document"
		contentGroup.template = template
	} else {
		panic("Missing schema (`expression: ''`) in contentGroup")
	}

	pureJsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	json.Unmarshal(pureJsonData, &contentGroup.criteriaMap)

	return nil
}
