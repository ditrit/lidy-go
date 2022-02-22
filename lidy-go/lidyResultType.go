package lidy

// Position -- Position in the content file of the YAML node whose data allowed generating that result.
type Position interface {
	Filename() string
	// The beginning line of the position
	Line() int
	// The beginning column in the line of the position
	Column() int
}

var _ Position = tPosition{}

type tPosition struct {
	filename string // TODO: update tPosition{} to have them specify the filename
	// The beginning line of the position
	line int
	// The beginning column in the line of the position
	column int
	// The ending line of the position
	lineEnd int
	// The ending column of the position
	columnEnd int
}

//
// Result interface
//

// Result -- Any type constructed by Lidy
type Result interface {
	// The position in the content file where the data is from
	Position
	RuleName() string
	// True if the data is the output of a builder
	HasBeenBuilt() bool
	// True if the type of the data is used by Lidy
	IsLidyData() bool
	// Get the piece of data itself
	Data() interface{}
}

var _ Result = tResult{}

type tResult struct {
	tPosition
	ruleName     string
	hasBeenBuilt bool
	isLidyData   bool
	data         interface{}
}

//
// Result data types
//

// MapData -- Lidy result of a MapChecker
type MapData struct {
	// Map -- the named, individually-typed properties specified in _map
	Map map[string]Result
	// MapOf -- the unnamed entries of the map
	MapOf []KeyValueData
}

// KeyValueData -- A lidy key-value pair, usually part of a MapData
type KeyValueData struct {
	Key   Result
	Value Result
}

// ListData -- A lidy yaml sequence result
type ListData struct {
	List   []Result
	ListOf []Result
}
