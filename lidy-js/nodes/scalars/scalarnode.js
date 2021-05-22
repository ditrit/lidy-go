import { StringNode } from './stringnode.js'
import { BinaryNode } from './binarynode.js'
import { IntNode } from './intnode.js'
import { FloatNode } from './floatnode.js'
import { BooleanNode } from './booleannode.js'
import { NullNode } from './nullnode.js'
import { TimestampNode } from './timestampnode.js'
import { isMap, isScalar } from 'yaml'
import { MapNode } from '../collections/mapnode.js'
import { ListNode } from '../collections/listnode.js'


export class ScalarNode extends  LidyNode {
  constructor(ctx, current) {
    super(ctx, 'base64', current)
  }

  static parse(ctx, keyword, current) {
    switch (keyword) {
      case 'string': return StringNode.parse(ctx, current)
      case 'binary' : return BinaryNode.parse(ctx, current)
      case 'timestamp': return TimestampNode.parse(ctx, current)
      case 'int': return IntNode.parse(ctx, current)
      case 'float': return FloatNode.parse(ctx, current)
      case 'boolean': return BooleanNode.parse(ctx, current)
      case 'null' : return NullNode.parse(ctx, current)
      case 'any' : return ScalarNode.parse_any(ctx, current)
      default : return parse_lidy(ctx, keyword, current)
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
      return MapNode.parse_any(ctx, current)
    }
    if (isSeq(current)) {
      return ListNode.parse_any(ctx, current)
    }
    return null
  }

}
