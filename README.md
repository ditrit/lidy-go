# lidy

A Yaml grammar language to parse and run other Yaml-based languages.

In details, lidy is:

- A Yaml schema language
- A validator consuming the Lidy schema language to validate yaml files
- A deserialization tool

## Example

### Schema only example

**dsl_definition.yaml**

```yaml
main:
  _dict:
    derived_from: str
    version: str
    metadata: metadata
    description: str
```

## Documentation

## Contribute

This project uses [yarn](https://classic.yarnpkg.com/en/docs/install/), an alternative to npm, to manage dependencies.
