package lidy_test

import (
	"encoding/json"

	"github.com/hjson/hjson-go"
)

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
	criteriaMap map[string]TestLineSlice
}

func (s SchemaData) UnmarshalHumanJSON(input []byte) error {
	// Convert to JSON
	var data interface{}
	hjson.Unmarshal(input, &data)
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	// Unmarshal JSON
	err = json.Unmarshal(jsonData, &jsonData)

	return err
}

func (schemaData SchemaData) UnmarshalJSON(jsonData []byte) error {
	data := make(map[string]interface{})

	err := json.Unmarshal(jsonData, &data)
	if err != nil {
		return err
	}

	schemaData.target = data["target"].(string)
	delete(data, "target")

	jsonData2, err := json.Marshal(data)
	if err != nil {
		return err
	}

	json.Unmarshal(jsonData2, &schemaData.groupMap)

	return nil
}

var _ json.Unmarshaler = (*SchemaData)(nil)
