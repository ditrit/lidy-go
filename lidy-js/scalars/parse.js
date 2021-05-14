import { newStringNode } from './stringnode.js'
import { newBase64Node } from './base64node.js'
import { newIntNode } from './intnode.js'
import { newFloatNode } from './floatnode.js'
import { newBooleanNode } from './booleannode.js'
import { newNullNode } from './nullnode.js'
import { newTimestampNode } from './timestampnode.js'
import { newAnyNode } from './anynode.js'

export function parse_scalar(ctx, keyword, current) {
    switch (keyword) {
      case 'string': return newStringNode(ctx, current)
      case 'base64' : return newBase64Node(ctx, current)
      case 'timestamp': return newTimestampNode(ctx, current)
      case 'int': return newIntNode(ctx, current)
      case 'float': return newFloatNode(ctx, current)
      case 'boolean': return newBooleanNode(ctx, current)
      case 'null' : return newNullNode(ctx, current)
      case 'any' : return newAnyNode(ctx, current)
      default : return parse_lidy(ctx, keyword, current)
    }
  }
  
//export { newStringNode, newBase64Node, newIntNode, newFloatNode, newBooleanNode, newNullNode, newTimestampNode, newAnyNode }


