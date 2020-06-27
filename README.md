# lidy

A YAML-YAML schema validation and deserialisation tool.

Lidy is:

- The Lidy schema language, a YAML language to specify how to check YAML files
- An engine to run the Lidy schema on YAML files
- A rich deserialisation tool

## JSON schema

How does lidy differ from JSON schema?

- Lidy targets YAML rather than JSON, though it _does_ work with JSON perfectly fine.
- In Lidy, refs are first class citizens, you no longer need to write (`{ ref: "#/..." }`) everywhere, see below.
- Lidy is meant to _assist_ your users with writing YAML: Lidy provides the line numbers at which the checking failed.
- Lidy schema are similar to Algebriac data types. They have union types (`_oneOf`), products (`_tuple` and `_map`), and combinations (`_merge`).
- Lidy provides support for rich deserialisation
- Writing a custom value checker is just as easy as writing a deserialiser, Lidy
  handles the two through the same interface

### About lidy's refs

Where you used to write `"a": { "ref": "#/$def/b" }`, you now write `"a": "b"`. Lidy does not support accessing non-root nodes. All nodes that must be referred to must be at the root of the Lidy schema.

Note: Lidy does not yet support remote references.

## Example

```go
import "github.com/ditrit/lidy"

paper, _ := lidy.PaperFromString(`
main: tree

tree:
  _map:
    name: str
    children:
      _seqOf: tree
`)

parser, _ = lidy.NewParser(paper, nil, lidy.ParserOption{})

result, err = parser.ParseString(`
name: root
children:
  - name: leafA
    children: []
  - name: branchB
    children:
      - name: leafC
        children: []
  - name: leafD
    children: []
`)
```

## Documentation

See [DOCUMENTATION.md](./DOCUMENTATION.md)

## Contributing

Installing:

```sh
# git clone ...
# cd lidy
go get -t
```

Running the tests:

```sh
# Tests
go ginkgo
```

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

- `_regex` -- applies only to strings. Accepted syntax at https://github.com/google/re2/wiki/Syntax
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
