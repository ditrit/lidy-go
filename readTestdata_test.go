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
	target      string
	description string
	criteriaMap CriteriaMap
}

type CriteriaMap map[string]TestLineSlice

// PreCriteria*
// Used to load the schema before populating the criteria map
// MPreCriteria* -- to be used with "test line maps"
// SPreCriteria* -- to be used with "test line slices"
type MPreCriteriaMap map[string]MPreCriteria
type MPreCriteria map[string]TestLine
type SPreCriteriaMap map[string]SPreCriteria
type SPreCriteria [][]interface{}

type TestLineSlice []TestLine

// ContentData
type ContentData struct {
	groupMap map[string]ContentGroup
}

type ContentGroup struct {
	target      string
	schema      string
	template    string
	description string
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

var _ json.Unmarshaler = (*SchemaData)(nil)

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

	err = json.Unmarshal(pureJsonData, &schemaData.groupMap)

	return err
}

var _ json.Unmarshaler = &SchemaGroup{}

func (schemaGroup *SchemaGroup) UnmarshalJSON(jsonInput []byte) error {
	return json.Unmarshal(jsonInput, &schemaGroup.criteriaMap)
}

var _ json.Unmarshaler = &CriteriaMap{}

func (criteriaMap *CriteriaMap) UnmarshalJSON(jsonInput []byte) error {
	var data interface{}
	if *criteriaMap == nil {
		*criteriaMap = make(CriteriaMap)
	}

	err := json.Unmarshal(jsonInput, &data)
	if err != nil {
		return err
	}
	mdata := data.(map[string]interface{})

	var piece interface{}
	for _, v := range mdata {
		piece = v
		break
	}

	switch piece.(type) {
	case map[string]interface{}:
		preCriteriaMap := make(MPreCriteriaMap)

		err = json.Unmarshal(jsonInput, &preCriteriaMap)
		if err != nil {
			return err
		}

		for name, preCriteria := range preCriteriaMap {
			testLineSlice := TestLineSlice{}

			for text, testLine := range preCriteria {
				testLine.text = text
				testLineSlice = append(testLineSlice, testLine)
			}

			(*criteriaMap)[name] = testLineSlice
		}
	case []interface{}:
		preCriteriaMap := make(SPreCriteriaMap)

		err = json.Unmarshal(jsonInput, &preCriteriaMap)
		if err != nil {
			return err
		}

		for name, preCriteria := range preCriteriaMap {
			testLineSlice := TestLineSlice{}

			for _, testLineInfo := range preCriteria {
				testLine := TestLine{
					text: testLineInfo[0].(string),
				}
				if len(testLineInfo) >= 2 {
					extra := testLineInfo[1].(map[string]interface{})

					if contain, ok := extra["contain"]; ok {
						testLine.extraCheck.contain = contain.(string)
					}
				}
				testLineSlice = append(testLineSlice, testLine)
			}

			(*criteriaMap)[name] = testLineSlice
		}
	}

	return nil
}

var _ json.Unmarshaler = &ContentGroup{}

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

	err = json.Unmarshal(pureJsonData, &contentGroup.criteriaMap)

	return err
}

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
