package lidy_test

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/hjson/hjson-go"
)

// hReadTestdata_test.go
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

type TestLineSlice struct {
	slice     []TestLine
	reference string
}

// ContentData
type ContentData struct {
	groupMap map[string]ContentGroup
}

type ContentGroup struct {
	target      string
	schema      string
	template    string
	valueName   string
	valueList   []string
	description string
	criteriaMap map[string]TestLineSlice
}

// HumanJSONtoJSON -- Convert to JSON
func HumanJSONtoJSON(input []byte) ([]byte, error) {
	var data interface{}

	err := hjson.Unmarshal(input, &data)
	if err != nil {
		return nil, err
	}

	jsonData, err := json.Marshal(data)

	return jsonData, err
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

	return json.Unmarshal(pureJsonData, &schemaData.groupMap)
}

var _ json.Unmarshaler = (*ContentData)(nil)

func (contentData *ContentData) UnmarshalJSON(compositeJsonInput []byte) error {
	data := make(map[string]interface{})

	err := json.Unmarshal(compositeJsonInput, &data)
	if err != nil {
		return err
	}

	pureJsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	return json.Unmarshal(pureJsonData, &contentData.groupMap)
}

var _ json.Unmarshaler = &SchemaGroup{}

func (schemaGroup *SchemaGroup) UnmarshalJSON(jsonInput []byte) error {
	return json.Unmarshal(jsonInput, &schemaGroup.criteriaMap)
}

var _ json.Unmarshaler = &ContentGroup{}

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
				testLineSlice.slice = append(testLineSlice.slice, testLine)
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
				testLineSlice.slice = append(testLineSlice.slice, testLine)
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
	}

	for name, value := range data {
		if !strings.Contains(name, " ") {
			if listSuffix := "List"; strings.HasSuffix(name, listSuffix) {
				contentGroup.valueName = string([]rune(name)[:len(name)-len(listSuffix)])

				if len(contentGroup.valueList) > 0 {
					return jsonError(fmt.Errorf("met *List twice"), compositeJsonInput)
				}
				for _, v := range value.([]interface{}) {
					contentGroup.valueList = append(contentGroup.valueList, v.(string))
				}
				delete(data, name)
			}

			if strings.HasSuffix(name, "Template") {
				if contentGroup.template == "" {
					return jsonError(fmt.Errorf("met *Template twice"), compositeJsonInput)
				}
				contentGroup.template = value.(string)
				delete(data, name)
			}

			newTarget := ""

			if strings.HasPrefix(name, "expression") {
				newTarget = "expression"
				delete(data, name)
			} else if strings.HasPrefix(name, "schema") {
				newTarget = "document"
				delete(data, name)
			} else if name == "target" {
				newTarget = name
			}
			if newTarget != "" {
				if contentGroup.target != "" {
					return jsonError(fmt.Errorf("met target declaration twice"), compositeJsonInput)
				}
				contentGroup.target = newTarget
			}

		}
	}

	pureJsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	err = json.Unmarshal(pureJsonData, &contentGroup.criteriaMap)

	return err
}

func (lineSlice *TestLineSlice) UnmarshalJSON(jsonInput []byte) error {
	var data interface{}
	err := json.Unmarshal(jsonInput, &data)
	if err != nil {
		return err
	}

	switch content := data.(type) {
	case map[string]interface{}:
		lineMap := make(map[string]ExtraCheck)

		err = json.Unmarshal(jsonInput, &lineMap)
		if err != nil {
			return jsonError(err, jsonInput)
		}

		for key, check := range lineMap {
			lineSlice.slice = append(lineSlice.slice, TestLine{text: key, extraCheck: check})
		}
	case []interface{}:
		lineArray := content
		for _, element := range lineArray {
			pair, ok := element.([]interface{})
			if !ok {
				return jsonError(fmt.Errorf("Expected a testline pair"), jsonInput)
			}
			text := pair[0].(string)
			checkMap := pair[1].(map[string]interface{})

			var check ExtraCheck
			if contain, ok := checkMap["contain"]; ok {
				check.contain = contain.(string)
			}

			lineSlice.slice = append(lineSlice.slice, TestLine{text: text, extraCheck: check})
		}
	case string:
		lineSlice.reference = content
	default:
		return jsonError(fmt.Errorf("Unrecognized TestLineSlice form"), jsonInput)
	}

	return nil
}

func jsonError(err error, jsonInput []byte) error {
	return fmt.Errorf("[\n  err: [%s]\n  jsonData: ((%s))\n]\n", err.Error(), jsonInput)
}
