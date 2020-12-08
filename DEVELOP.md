# Develop

Guide for developers

## File structure

```
# Get file headers:
cat lidy*.go | grep -EA 4 '^// lidy'`
```

<dl>
<dt>h*.go => h*_test.go</dt>
<dd>External tests. Tests using the package lidy_test.</dd>

<dt>k*.go => k*_test.go</dt>
<dd>Internal tests. Tests using the package lidy.</dd>

<dt>lidy*.go</dt>
<dd>Files used to provide the features of lidy</dd>

<dt>lidyCore.go</dt>
<dd>"Main", containing the steps and loops to process the YAML schema, as well as those to apply the parsed schema to the content</dd>

<dt>lidy_suite_test.go</dt>
<dd>Entry point for Ginkgo</dd>
</dl>

lidy tests

- hBuilderMap_test.go
  - test using `.With(map[string]lidy.Builder{})`
- hInvocation_test.go
  - document how to create and call a parser
- hReadTestdata_test.go
  - deserialize .hjson into test data
- hSchemaSet_test.go
  - test that the meta schema lidy is valid
- hSpecification_test.go
  - use hWalk_testdata_test.go, then **run the test data**
- hWalk_testdata_test.go
  - use hReadTestdata_test to load each test in memory
- hYaml_test.go
  - test base features of gopkg.in/yaml.v3
- kInternal_test.go
  - A few internal tests
- lidy_suite_test.go
  - Entry point for Ginkgo

lidy itself

- lidy.go
  - Almost all exported types, methods and function entry points. Also see lidyResult\*.go
- lidyCheck.go
  - Perform the checking of a yaml document against a loaded parser
- lidyCheckerParser.go
  - Parses the shema to populate checkers and checkerForms
- lidyCore.go
  - The "main" file, supporting the entry points, dispatching the calls
- lidyDefaultRule.go
  - Define lidy scalar values and the rule `any`
- lidyDescribe.go
  - Implement the ability of tExpression concrete types to produce their name and their description.
- lidyMatch.go
  - Implement match() and mergeMatch() on tExpression and tMergeableExpression
- lidyResult\*.go
  - define the result types, the (accessor) methods available on those types, and a few helper methods.
- lidySchemaParser.go
  - Parses the shema to populate the whole lidy parser
- lidySchemaType.go
  - Types specific to the schema

## Specification / Test data

The test data are part of the specification. The files are loaded by hWalk_testdata_test, and the objects inside them are loaded by hWalk_testdata_test.go. They are finally run by hSpecification_test.go.
