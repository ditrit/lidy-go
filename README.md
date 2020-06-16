# lidy

A YAML-YAML schema validation and deserialisation tool.

Lidy is:

- A YAML schema language meant to check YAML files
- An engine to run the Lidy schema
- A rich deserialisation tool

## JSON schema

How does lidy differ from JSON schema?

- Lidy targets YAML rather than JSON
- In Lidy, local refs are first class citizens, you no longer need to write (`{ ref: "#/..." }`) everywhere.
- Lidy provides support for rich deserialisation

### About lidy's reference

Where you used to write `"a": { "ref": "#/$def/b" }`, you now write `"a": "b"`. Lidy does not support accessing non-root nodes. All nodes that must be referred to must be at the root of the Lidy schema.

### Schema only example

**dsl_definition.yaml**

```yaml
main:
  _dict:
    derived_from: str
    version: str
    metadata: metadata
    description: str

metadata:
  _dictOf: { str: str }
```

## Documentation

## Contribute

This project uses [yarn](https://classic.yarnpkg.com/en/docs/install/), an alternative to npm, to manage dependencies.

## Spec

### Data types (YAML+unbounded)

- `timestamp`
- `str` -- string
- `boolean`
- `int` -- Integer
- `unbounded` -- type representing only the infinity
- `float`
- ~~List~~ use `{ _listOf: any }`
- ~~Map~~ use `{ _dictOf: any }`
- `any` -- any yaml structure

### Composite checkers

- `_dict`
- `_dictOf`
- ~~`_list`~~ -> use `_tuple`
- `_listOf`
- `_oneOf`

### Container checkers

- `_dictRequired` extra entries to add to a `_dict`
- ~~`_required`~~ -> use `_dictRequired`
- `_optional` -- unsure
- `_nb` -- the container must exactly have the specified number of entries
- `_max` -- the container must have at most the specified number of entries
- `_min` -- the container must have at least the specified number of entries

### Terminal checkers

- `_regex` -- applies only to strings
- `_in` -- an exact enumeration of terminal YAML values the value must be part of
- `_notin` -- an exact enumeration of terminal YAML values the value must NOT be part of
- \+ `_range` -- applies only to numbers
  - Examples for floats: `0 <= (float)`, `1 < (float) < 10`, `(float) < 0`
  - Examples for integers: `0 <= (int) <= 9`
