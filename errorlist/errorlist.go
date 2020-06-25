package errorlist

// List -- self descriptive
type List struct {
	list [][]error
}

// MaybeAppendError -- Append error list if non-empty
func (me List) MaybeAppendError(errorList []error) {
	if errorList != nil && len(errorList) > 0 {
		me.list = append(me.list, errorList)
	}
}

// ConcatError -- Obtain a single list of all errors
func (me List) ConcatError() []error {
	var totalLength int
	for _, s := range me.list {
		totalLength += len(s)
	}

	result := make([]error, totalLength)
	var k int

	for _, s := range me.list {
		k += copy(result[k:], s)
	}

	return result
}
