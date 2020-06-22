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

func (schemaData SchemaData) UnmarshalJSON(compositeJsonData []byte) error {
	data := make(map[string]interface{})

	err := json.Unmarshal(compositeJsonData, &data)
	if err != nil {
		return err
	}

	schemaData.target = data["target"].(string)
	delete(data, "target")

	pureJsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	json.Unmarshal(pureJsonData, &schemaData.groupMap)

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
