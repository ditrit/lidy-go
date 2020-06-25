package lidy

import "fmt"

// FlatProperty -- Helper to get all _merge properties as a single map
// If any key is present in several property maps, the value from the first map
// is kept.
func (data MapResult) FlatProperty() map[string]Result {
	var result map[string]Result

	data.writePropertyTo(result)

	return result
}

// writePropertyTo the recursive function doing flattening
func (data MapResult) writePropertyTo(result map[string]Result) {
	// Copy properties to the target map
	for key, value := range data.Property {
		if _, present := result[key]; !present {
			result[key] = value
		}
	}
	for _, compositeMap := range data.Merge {
		compositeMap.writePropertyTo(result)
	}
}

// Hashed -- Helper to get .MapOf as a map[string]Result
// it returns an error if any key is not a string.
func (data MapResult) Hashed() (map[string]Result, error) {
	var result map[string]Result

	for _, kvPair := range data.MapOf {
		if key, ok := kvPair.key.(string); ok {
			result[key] = kvPair.value
		} else {
			return nil, fmt.Errorf("Hashed() encountered a non-string result key [%s]", kvPair.key)
		}
	}

	return result, nil
}

// FlatHashed -- Helper to obtain the content of all .MapOf as a single map[string]Result.
// It returns an error if any key of any .MapOf is not a string.
func (data MapResult) FlatHashed() (map[string]Result, error) {
	var result map[string]Result

	err := data.writeAllMapOfTo(result)

	return result, err
}

// writePropertyTo the recursive function doing flattening
func (data MapResult) writeAllMapOfTo(result map[string]Result) error {
	for _, kvPair := range data.MapOf {
		if key, ok := kvPair.key.(string); ok {
			if _, present := result[key]; !present {
				result[key] = kvPair.value
			}
		} else {
			return fmt.Errorf("FlatHashed() encountered a non-string result key [%s]", kvPair.key)
		}
	}

	for _, compositeMap := range data.Merge {
		err := compositeMap.writeAllMapOfTo(result)
		if err != nil {
			return err
		}
	}

	return nil
}
