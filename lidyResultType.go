package lidy

// Result -- Any type constructed by Lidy
type Result interface{}

var _ Result = MapResult{}

// MapResult -- Lidy result of a MapChecker
type MapResult struct {
	// Property -- the named, individually-typed properties specified in _map
	Property map[string]Result
	// MapOf -- the unnamed entries of the map
	MapOf []KeyValueResult
	// Merge -- access to the MapResults of the composit MapCheckers
	Merge []MapResult
}

// KeyValueResult -- A lidy key-value pair, usually part of a MapResult
type KeyValueResult struct {
	key   Result
	value Result
}

// SeqResult -- A lidy yaml sequence result
type SeqResult struct {
	Tuple []Result
	Seq   Result
}
