# Lidy Documentation

## Lidy schema syntax

A lidy document is a YAML map of rule identifiers to lidy expressions. The identifier `main` is special: it is the default rule used to parse the YAML content document.

### Lidy identifier

A valid lidy identifier is a dot-separated list of lidy names. A lidy name is a sequence of the characters beginning with one of [`a-zA-Z`], followed by any number of character among [`a-zA-Z0-9_`].

### Lidy expression

A Lidy expression can be a string or a YAML map.

- If it is a string, it must be a valid Lidy identifier. The identifier shall either be one of the [default-lidy-identifiers](#default-lidy-identifiers).
- If it is a map, it must be of one of the available [checker forms](#lidy-checker-forms).

### Default Lidy identifiers

The default lidy identifiers are [the scalars](#scalars), [the predefined string checkers](#predefined-string-checkers) and [the special checkers](#special-checkers).

### Scalars

Scalars, as defined in the [YAML specification](https://yaml.org/type/#id838503)

- `str`, a YAML string
- `bool`, a YAML boolean
- `int`, a YAML integer
- `float`, a YAML floating-point value
- `null`, the YAML null value

### Predefined string checkers

These Lidy checkers match `string` values, and perform extra checks

- `timestamp`, an ISO 8601 datetime
- `binary`, a string consisting only of base64 characters, as defined by [tag:yaml.org,2002:binary](https://yaml.org/type/binary.html)

Also see the [`_regex`](#_regex) keyword.

### Special checkers

There's only one: `any`. It matches any YAML content. It can be defined in Lidy schema as follow:

```yaml
any:
  _oneOf:
    - str
    - bool
    - int
    - float
    - null
    - mapOf: { any: any }
    - seqOf: any
```

Please note that `any` will store YAML map contents in the `mapOf` field of `MapResult` instances.

### Lidy checker forms

Lidy has 5 checker forms:

- the map checker, matching a YAML map
- the seq checker, matching a YAML sequence
- the one-of, selecting the first matching lidy expression
- the in checker, matching an exact scalar
- the regex checker, matching a string

### `_regex: ...`, define your own string checker

##### \_regex

The `_regex` keyword allows you to accept only strings that match the given regex. The regex engine is [re2](https://github.com/google/re2). Non-strings values are rejected.

Example:

```yaml
url:
  _regex: "https?://[^/]+\.[a-zA-Z0-9()]{1,6}(/.*)?"
phoneNumber:
  _regex: "https"
```

### Hashmap, Dict, Object, !!map, **Map-related checkers**

The keywords of the map checker form all store produce their result as a `MapResult`. A `MapResult` is defined as follow:

```go
type MapResult interface {
  Result
  // structure
  Map() map[string]LidyResult
  MapOf() []KeyValueResult
}
```

```go
type KeyValueResult struct {
	key   Result
	value Result
}
```

MapResult comes with the helper method `Hashed()` for:

```go
func (MapResult) Hashed() (map[string]Result, error)
```

Assuming all keys are strings, `Hashed()` converts the KeyValueResult list into a map of `string`-s to `Result`-s. It errors if any key is not a string.

#### `_map`, the structured type

Usage:

```yaml
_map: <map of strings to lidy expressions>
_optional?: <map of strings to lidy expressions>
_min?: <int>
_max?: <int>
_nb?: <int>
```

Example:

```yaml
_map:
  exactPropertyNameA: str
  exactPropertyNameB: int
_optional:
  exactPropertyNameCforAnOptionalProperty: bool
```

`_map`, defines an association of properties. The keys used in the schema specify are to be exactly matched in the content. The value-side lidy expressions are each used to match the value in the content.

All keys defined in the map will be **required** in the YAML content.

The `_optional` keyword, used in the same expression as `_map` allows to define optional properties. For this, the presence of the `_map` keyword is required. If you want to specify a map where there are no required properties, `_map` should receive the empty map, `{}`, see example:

```yaml
_map: {}
_optional:
  name: str
  birthYear: int
```

#### `_mapOf`, the associative container

Usage:

```yaml
_mapOf: <a map with a single entry>
_min?: <int>
_max?: <int>
_nb?: <int>
```

Example:

```yaml
fullname:
  _mapOf:
    str: str
conversionTable:
  _mapOf:
    float: float
sparseArray:
  _mapOf:
    int: any
_min: 1
```

### Array, List, Slice, !!seq, **Sequence-related checkers**

## Go interface

### Invocation in Go

Example:

```go
package main

import (
    "github.com/ditrit/lidy"
)

func main() {
    lidy.File{
        Text: `
main:

`
        Name: "schema.yaml"
    }.With()
}
```
