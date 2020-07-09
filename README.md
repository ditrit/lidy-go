# Lidy

A YAML-YAML type-oriented schema validation and deserialisation tool.

Lidy is:

- The Lidy schema-type language, a YAML language to specify how to check YAML files
- An engine to run the Lidy schema on YAML files
- A rich deserialisation tool (if you want it to)

## Content

- [Lidy](#lidy)
  - [Content](#content)
  - [JSON schema](#json-schema)
    - [About lidy's refs](#about-lidys-refs)
  - [Example](#example)
  - [Alternatives: YAML Schema validators](#alternatives-yaml-schema-validators)
  - [Using Regex](#using-regex)
  - [Documentation](#documentation)
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
    - [Range](#range)
    - [Parameter-less string checkers](#parameter-less-string-checkers)
    - [Functional types (aka type parameter aka template types)](#functional-types-aka-type-parameter-aka-template-types)
  - [Contributing](#contributing)
    - [Developing](#developing)

## JSON schema

What's the point of Lidy, when there's already JSON schema?

- **YAML**: Lidy targets YAML rather than JSON. Of course, it _does_ work with JSON perfectly fine.
- **Refs**: In Lidy, refs are first class citizens, they are just like in programming languages: `<name>`, as opposed to JSON Schema's heavy `{ ref: "#/<name>" }`, see below.
- **Line numbers**: Lidy is meant to _assist_ your users with writing YAML: Lidy provides the line numbers at which the checking failed.
- **Algebriac data types**: Lidy schema are similar to Algebriac data types. They have union types (`_oneOf`), positional product types (`_tuple`), named product types (`_map`), and combined types (`_merge`). (N.B. parameterized types aren't yet there, but they are on our short list).
- **Rich deserialisation**: Lidy provides support for rich deserialisation. It's core use-case. This includes access to the source line numbers.
- **Custom checkers**: Writing a custom value checker is just as easy as writing a deserialiser, Lidy
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
    name: string
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

## Alternatives: YAML Schema validators

Here's a list of schema validators we could find:

- Kwalify, [[website]](http://www.kuwata-lab.com/kwalify/) [[source (mirror?)]]() (Ruby and Java, v0.7.2, 2010-07-18)
- [pykwalify](https://github.com/Grokzen/pykwalify), [[documentation]](https://pykwalify.readthedocs.io/en/master) (Python, v1.7.0, 2018-08-03)
- [Rx](https://github.com/rjbs/Rx), [[website]](http://rx.codesimply.com/) (Js, Perl, PHP, Python, Ruby, v0.200006, 2014-05-21)

Also see the [dedicated page on JSON Schema Everywhere](https://json-schema-everywhere.github.io/yaml).

And a few more project(s):

- [Azuki](https://github.com/guoyk93/azuki), just a Map evaluation tool (Java)

None has the feature-set of Lidy, nor its type-minded approach.

## Using Regex

If you need a regex to match a well-known format, think of going shopping for it before you start writing it. Ressource: [RgxDB](https://rgxdb.com).

## Documentation

See [DOCUMENTATION.md](./DOCUMENTATION.md)

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
- `string` -- string
- `null`

Also see [Scalar rules](DOCUMENTATION.md#scalar-rules).

#### Predefined string checker rules

- `timestamp` -- ISO 8601 datetime
- `binary` -- a base64 encoded binary blob, with space characters allowed

Also see [Predefined string checker rules](DOCUMENTATION#predefined-string-checker-rules).

#### `any` - Any yaml content

- `any` -- any yaml structure. See [any](DOCUMENTATION.md#any)

### Container checkers

#### Map checkers

- [`_map`](DOCUMENTATION.md#_map) -- followed by a map of exact keys to lidy expressions
- [`_mapOf`](DOCUMENTATION.md#_mapOf) -- Example: `_mapOf: { string: int }`
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

### Range

- `_range` -- would apply only to numbers
  - Examples for floats: `(0 <= float)`, `(1 < float < 10)`, `(float < 0)`
  - Examples for integers: `(0 <= int <= 9)`

### Parameter-less string checkers

Somewhat likely to be added (because it wouldn't make lidy heavier):

- `lang.regex.re2`
- `lang.json`
- `lang.yaml`

Less likely to be added, but still considered:

- `lang.regex.pcre`
- `lang.csv`
- `lang.jsonc`
- `lang.json4`
- `lang.hjson`
- `lang.strictyaml`
- `lang.html`
- `lang.xml`

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
    name: string
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

## Contributing

If you have any idea that you'd like to see added to Lidy, please create an issue in the [issue tracker](https://github.com/ditrit/lidy/issues) to share your feature request with us (remember to search-check for duplicate issues first).

You're also welcome to report bugs, ask questions or use the issue tracker as you see fit. We try to be welcoming.

### Developing

Cloning:

```sh
git clone https://github.com/ditrit/lidy
cd lidy
```

Running Lidy's tests:

```sh
# Install
# go get github.com/onsi/ginkgo/ginkgo

# Test
ginkgo
```
