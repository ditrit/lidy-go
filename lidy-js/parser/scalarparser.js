import { StringNode } from '../nodes/scalars/stringnode.js'
import { BinaryNode } from '../nodes/scalars/binarynode.js'
import { IntNode } from '../nodes/scalars/intnode.js'
import { FloatNode } from '../nodes/scalars/floatnode.js'
import { BooleanNode } from '../nodes/scalars/booleannode.js'
import { NullNode } from '../nodes/scalars/nullnode.js'
import { TimestampNode } from '../nodes/scalars/timestampnode.js'
import { isMap, isSeq, isScalar } from 'yaml'
import { MapParser } from './mapparser.js'
import { ListParser } from './listparser.js'
import { parse_rule_name } from './parse.js'

export class ScalarParser {

  static parse(ctx, keyword, current) {
    switch (keyword) {
      case 'string': return StringNode.parse(ctx, current)
      case 'binary' : return BinaryNode.parse(ctx, current)
      case 'timestamp': return TimestampNode.parse(ctx, current)
      case 'int': return IntNode.parse(ctx, current)
      case 'float': return FloatNode.parse(ctx, current)
      case 'boolean': return BooleanNode.parse(ctx, current)
      case 'null' : return NullNode.parse(ctx, current)
      case 'any' : return ScalarParser.parse_any(ctx, current)
      default : return parse_rule_name(ctx, keyword, current)
    }
  }

  static  parse_any(ctx, current) {
    if (isScalar(current)) {
      switch (typeof(current.value)) {
        case 'number':
          if (IntNode.checkCurrent(current)) {
            return IntNode.parse(ctx, current);
          } else {
            return FloatNode.parse(ctx, current);
          }
        case 'boolean':
          return BooleanNode.parse(ctx, current);
        case 'string':
          return StringNode.parse(ctx, current);
        case 'object':
          if (current.value == null) {
            return NullNode.parse(ctx, current);
          } else {
            ctx.syntaxError(current, `Error: value '${current.value}' is not a scalar value`)
          }
        default:
          ctx.syntaxError(current, `Error: value '${current.value}' is not a scalar value`)
      }
      return null
    }
    if (isMap(current)) {
      return MapParser.parse_any(ctx, current)
    }
    if (isSeq(current)) {
      return ListParser.parse_any(ctx, current)
    }
    return null
  }

}
