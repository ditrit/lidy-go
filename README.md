# lidy

A YAML-YAML schema validation and deserialisation tool.

Lidy is:

- A YAML schema language meant to check YAML files
- An engine to run the Lidy schema
- A rich deserialisation tool (occasionally called data-binding)

## JSON schema

How does lidy differ from JSON schema?

- Lidy targets YAML rather than JSON
- In Lidy, local refs are first class citizens, you no longer need to write (`{ ref: "#/..." }`) everywhere.
- Lidy provides support for rich deserialisation

### About lidy's reference

Where you used to write `"a": { "ref": "#/$def/b" }`, you now write `"a": "b"`. Lidy does not support accessing non-root nodes. All nodes that must be referred to must be at the root of the Lidy schema.

## Getting started

```go
import "github.com/ditrit/lidy"

paper, err := lidy.PaperFromString(`
main:
  _dict:
    derived_from: str
    version: str
    metadata: metadata
    description: str

metadata:
  _dictOf: { str: str }
`)

result, err = parser.ParseString(`
derived_from: ditrit
version: v1.0.1
metadata: {}
description: "This shall pass, too"
`)
```

## Contributing

Installing:

```sh
# git clone ...
# cd lidy
go get -t
```

Running:

```sh
# Tests
go ginkgo
```

## Documentation

## Spec

### Data types: YAML

- `boolean`
- `float`
- `int` -- integer
- `str` -- string
- `null`
- `timestamp` -- ISO 8601 datetime
- `any` -- any yaml structure

### Composite checkers

- `_map`
- `_mapOf`
- `_seqOf`
- `_tuple`
- `_optional`
- `_extend`
- `_oneOf`

### Container checkers

- `_nb` -- the container must exactly have the specified number of entries
- `_max` -- the container must have at most the specified number of entries
- `_min` -- the container must have at least the specified number of entries

### Scalar checkers

- `_regexp` -- applies only to strings. Accepted syntax at https://github.com/google/re2/wiki/Syntax
- `_in` -- an exact enumeration of terminal YAML values the value must be part of
- \+ `_range` -- applies only to numbers
  - Examples for floats: `(0 <= float)`, `(1 < float < 10)`, `(float < 0)`
  - Examples for integers: `(0 <= int <= 9)`
- \+ `_balanced` -- check that the provided characters are balanced in the string
  - Example for the regex dsl: `_balanced: [\\, ()[]{}]`
  - Note: balanced can't be used to balance multi-characters anchors, like in XML
- \+ `_dsl` -- provide an LL grammar recogniser

### Parameter-less string checkers

- `pattern.email`
- `pattern.url`
- `pattern.uri`
- `pattern.date`
- `pattern.time`
- `lang.regex`
- `lang.csv`
- `lang.json`
- `lang.jsonc`
- `lang.json4`
- `lang.hjson`
- `lang.yaml`
- `lang.html`
- `lang.xml`
