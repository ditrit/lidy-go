package lidy

// Position -- Position in the content file of the YAML node whose data allowed generating that result.
type Position struct {
	Line      int
	Column    int
	lineEnd   int
	columnEnd int
}

//
// Result interface
//

// Result -- Any type constructed by Lidy
type Result interface{}

//
// Result types
//

var _ Result = MapResult{}

// MapResult -- Lidy result of a MapChecker
type MapResult struct {
	// Map -- the named, individually-typed properties specified in _map
	Map map[string]Result
	// MapOf -- the unnamed entries of the map
	MapOf []KeyValueResult
}

// KeyValueResult -- A lidy key-value pair, usually part of a MapResult
type KeyValueResult struct {
	Key   Result
	Value Result
}

// ListResult -- A lidy yaml sequence result
type ListResult struct {
	List   []Result
	ListOf []Result
}
