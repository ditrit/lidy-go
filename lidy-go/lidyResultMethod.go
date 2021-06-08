package lidy

//
// Position, tPosition
//

func (p tPosition) Filename() string {
	return p.filename
}

func (p tPosition) Line() int {
	return p.line
}

func (p tPosition) Column() int {
	return p.column
}

//
// Result, tResult
//

func (r tResult) RuleName() string {
	return r.ruleName
}

func (r tResult) HasBeenBuilt() bool {
	return r.hasBeenBuilt
}

func (r tResult) IsLidyData() bool {
	return r.isLidyData
}

func (r tResult) Data() interface{} {
	return r.data
}
