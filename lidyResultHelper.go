package lidy

import "fmt"

// Hashed -- Helper to get .MapOf as a map[string]Result
// it returns an error if any key is not a string.
func (data MapResult) Hashed() (map[string]Result, error) {
	var result map[string]Result

	for _, kvPair := range data.MapOf {
		if key, ok := kvPair.Key.(string); ok {
			result[key] = kvPair.Value
		} else {
			return nil, fmt.Errorf("Hashed() encountered a non-string result key [%s]", kvPair.Key)
		}
	}

	return result, nil
}
