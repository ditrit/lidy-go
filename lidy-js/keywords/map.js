import { isMap, isPair, isScalar, isSeq  } from 'yaml'
import { collectionCheckers } from './collection.js'
import { parse_rule } from '../parse.js'
import { mapNode } from './parsenode.js'

export function parse_map(ctx, rule, current) {

  // current value is a map
  if (!isMap(current)) {
    ctx.syntaxError(current, `Error : a map is expected `)
    return false
  }

  // quantity checkers are verified
  if (!collectionCheckers(rule, current)) {
    return false
  }
  
  // get values for map keywords 
  let mapNode = rule.get('_map')
  let mapOfNode = rule.get('_mapOf')
  let mapFacultativeNode = rule.get('_mapFacultative')

  // values for keywords are maps if not null
  if ((mapNode != null && !isMap(mapNode)) || (mapOfNode != null && !isMap(mapOfNode)) || (mapFacultativeNode != null && !isMap(mapFacultativeNode))) {
    ctx.grammarError(current, `Error : error in map value definition`)
    return false
  }

  // every mandatory key (defined for the '_map' keyword) exists
  mapNode.items.forEach(pair => { 
    if (!((isPair(pair) && isScalar(pair.key) && pair.key.value instanceof string))) {
      ctx.grammarError(current, `Error : error in map definition`)
      return false
    }
    if (! current.items.has(pair.key.value)) {
      ctx.syntaxError(current, `Error : key '${pair.key.value}' not found in current value`)
      return false
    }      
  })

  let parsedKeys = {}
  // for every (key, value) in current, key is in _map or _mapFacultative and value matches definition, if not, value matches defnition of _mapOf 
  current.items.forEach(pair => {
    if (!((isPair(pair) && isScalar(pair.key) && pair.key.value instanceof string))) {
      ctx.SyntaxError(current, `Error : '${pair.key.value}' is not a valid key value in a map (only strings are alllowed as key in maps)`)
      return false
    }
    let lidyValue = null
    if (mapNode && mapNode.has(key)) {
      lidyValue = parse_rule(ctx, null, mapNode.get(pair.key.value), pair.value)
    } else {
      if (mapFacultativeNode && mapFacultativeNode.has(pair.key.value)) {
        lidyValue = parse_rule(ctx, null, mapFacultativeNode.get(pair.key.value), pair.value)
      } else {
        if (mapOfNode) {
          lidyValue = parse_rule(ctx, null, mapOfNode, pair.value)
        } else {
          ctx.SyntaxError(pair.value, `Error : '${pair.key.value}' is not a valid key`)
          return false
        }
      }
    }
    if (lidyValue == null) {
      ctx.SyntaxError(pair.value, `Error : bad value '${pair.value}'found for '${pair.key.value}'`)
      return false 
    }
    parsedKeys[pair.key.value] = lidyValue
  })

  return new MapNode(ctx, current, parsedKeys)
}
