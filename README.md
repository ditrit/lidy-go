# Lidy

A YAML-YAML type-oriented schema validation and deserialisation tool.

Lidy is:

- The Lidy schema language, a YAML language to specify how to check YAML files
- An engine to run the Lidy schema on YAML files
- A rich deserialisation tool (if you want it to)

## Content

- [Lidy](#lidy)
  - [Content](#content)
  - [JSON schema](#json-schema)
    - [About lidy's refs](#about-lidys-refs)
  - [Example](#example)
  - [Documentation](#documentation)
  - [Contributing](#contributing)
  - [Similar tools](#similar-tools)
  - [Short reference](#short-reference)
    - [Lidy expression](#lidy-expression)
    - [Predefined lidy rules](#predefined-lidy-rules)
      - [Scalar types](#scalar-types)
      - [Predefined string checker rules](#predefined-string-checker-rules)
      - [`any` - Any yaml content](#any---any-yaml-content)
    - [Container checkers](#container-checkers)
      - [Map checkers](#map-checkers)
      - [Sequence checkers](#sequence-checkers)
    - [Composite checkers](#composite-checkers)
    - [Container checkers](#container-checkers-1)
    - [Scalar checkers](#scalar-checkers)
  - [Not yet in Lidy](#not-yet-in-lidy)
    - [Functional types (aka type parameter aka template types)](#functional-types-aka-type-parameter-aka-template-types)
    - [Range](#range)
    - [Parameter-less string checkers](#parameter-less-string-checkers)
-

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
package main

import (
	"fmt"

	"github.com/ditrit/lidy"
)

func main() {
	result, errorList := lidy.NewParser(
		"treeDefinition.yaml",
		[]byte(`
main: tree

tree:
  _map:
    name: str
    children:
      _seqOf: tree
`),
	).Parse(
		lidy.NewFile(
			"treeContent.yaml",
			[]byte(`
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
`),
		),
	)

	if len(errorList) > 0 {
		panic(errorList[0])
	}

	mapResult := result.(lidy.MapResult)

	fmt.Println(mapResult)
}
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

## Similar tools

- Kwalify, [[website]](http://www.kuwata-lab.com/kwalify/) [[source (mirror?)]]() (Ruby and Java, v0.7.2, 2010-07-18)
- [pykwalify](https://github.com/Grokzen/pykwalify), [[documentation]](https://pykwalify.readthedocs.io/en/master) (Python, v1.7.0, 2018-08-03)
- [Rx](https://github.com/rjbs/Rx), [[website]](http://rx.codesimply.com/) (Js, Perl, PHP, Python, Ruby, v0.200006, 2014-05-21)

Also see the [dedicated page on JSON Schema Everywhere](https://json-schema-everywhere.github.io/yaml).

A few more project(s):

- [Azuki](https://github.com/guoyk93/azuki), just a Map evaluation tool (Java)

## Short reference

### Lidy expression

A lidy expression is either:

- The name of a predefined lidy rule
- The name of a lidy rule defined in the same document
- A YAML map which associates one or more lidy keywords to its YAML argument. See [Lidy checker forms](DOCUMENTATION.md#lidy-checker-forms).
  - Note: Not all keyword combinations are valid

Also see [lidy expression](DOCUMENTATION.md#lidy-expression).

### Predefined lidy rules

Also see [predefined lidy rules](DOCUMENTATION.md#predefined-lidy-rules).

#### Scalar types

- `boolean`
- `float`
- `int` -- integer
- `str` -- string
- `null`

Also see [Scalars](DOCUMENTATION.md#scalar-rules).

#### Predefined string checker rules

- `timestamp` -- ISO 8601 datetime
- `binary` -- a base64 encoded binary blob, with space characters allowed

Also see [Predefined string checker rules](DOCUMENTATION#predefined-string-checker-rules).

#### `any` - Any yaml content

- `any` -- any yaml structure. See [any](DOCUMENTATION.md#any)

### Container checkers

#### Map checkers

- [`_map`](DOCUMENTATION.md#_map) -- followed by a map of exact keys to lidy expressions
- [`_mapOf`](DOCUMENTATION.md#_mapOf) -- Example: `_mapOf: { str: int }`
- [`_merge`](DOCUMENTATION.md#_merge) -- create a map checker merging the keys of the listed map checkers
- [`_optional`](DOCUMENTATION.md#_mapOptional) -- \_optional must be used together with \_map

#### Sequence checkers

- [`_tuple`](DOCUMENTATION.md#_tuple) -- (the equivalent of `_map` but for sequences. It could have been named `_seq`)
- [`_seqOf`](DOCUMENTATION.md#_seqOf)
- [`_optional`](DOCUMENTATION.md#_seqOptional)

### Composite checkers

- [`_oneOf`](DOCUMENTATION.md#_oneOf) -- accept a list of lidy expressions and select the first that matches, or fail

### Container checkers

- [`_nb`](DOCUMENTATION.md#_nb) -- the container must exactly have the specified number of entries
- [`_max`](DOCUMENTATION.md#_max) -- the container must have at most the specified number of entries
- [`_min`](DOCUMENTATION.md#_min) -- the container must have at least the specified number of entries

### Scalar checkers

- [`_regex`](DOCUMENTATION.md#_regex) -- applies only to strings. Accepted syntax at https://github.com/google/re2/wiki/Syntax
- [`_in`](DOCUMENTATION.md#_in) -- an exact enumeration of terminal YAML values the value must be part of

## Not yet in Lidy

### Functional types (aka type parameter aka template types)

Declare a parameter type name:

```yaml
<ContentType>: []
# the <> are forbidden in lidy identifiers. This form is detected as a
# parameter type name declaration
```

Declare a functional type:

```yaml
tree<ContentType>:
  _map:
    name: str
    children: treeChildren
# treeChildren requires a parameter: `treeChildren<ContentType>`
# but lidy is smart enougth to pass it from the parent automatically, since they
# uses the same type name

treeChildren<ContentType>:
  _seqOf: treeOrContent

treeOrContent<ContentType>:
  _oneOf:
    - tree
    - ContentType
```

Refer to the functional type:

```yaml
main: tree<boolean>
```

### Range

- `_range` -- would apply only to numbers
  - Examples for floats: `(0 <= float)`, `(1 < float < 10)`, `(float < 0)`
  - Examples for integers: `(0 <= int <= 9)`

###

### Parameter-less string checkers

Somewhat likely to be added (because it wouldn't make lidy heavier):

- `lang.regex.re2`
- `lang.json`
- `lang.yaml`

Less likely to be added:

- `pattern.email`
- `pattern.url`
- `pattern.uri`
- `pattern.date`
- `pattern.time`

Least likely to be added, but still:

- `lang.regex.pcre`
- `lang.csv`
- `lang.jsonc`
- `lang.json4`
- `lang.hjson`
- `lang.html`
- `lang.xml`
