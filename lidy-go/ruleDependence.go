package lidy

func (rule tRule) dependencyList() []string {
	return []string{rule.name()}
}

func (mapChecker tMap) dependencyList() []string {
	return mapChecker.form._dependencyList
}

func (list tList) dependencyList() []string {
	return []string{}
}

func (oneOf tOneOf) dependencyList() []string {
	return oneOf._dependencyList
}

func (in tIn) dependencyList() []string {
	return []string{}
}

func (regex tRegex) dependencyList() []string {
	return []string{}
}
