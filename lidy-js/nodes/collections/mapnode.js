import { CollectionNode } from "./collectionnode.js"
import { isMap, isScalar  } from 'yaml'
import { parse_any } from "../nodes/scalars/map.js.js"
import { parse_rule } from '../../parser/parse.js'


export class MapNode extends CollectionNode {
  constructor(ctx, current) {
    super(ctx, 'map', current, parsedKeys)
    this.parsedKeys = this.parsedKeys
  }

  static checkCurrent(current) {
    // value must be a map whose keys are string
    return isMap(current) && current.items.every(pair => pair.key && isScalar(pair.key) && (pair.key.value instanceof string ))
  }

  static parse(ctx, rule, current) {
    // current value is a map
    if (!checkCurrent(current)) {
      ctx.syntaxError(current, `Error : a map whose keys are strings is expected `)
      return null
    }
  
    // quantity checkers are verified
    if (!MapNode.collectionCheckers(ctx, rule, current)) {
      return null
    }
    
    // get values for map keywords 
    let mapNode = rule.get('_map')
    let mapOfNode = rule.get('_mapOf')
    let mapFacultativeNode = rule.get('_mapFacultative')
  
    // values for keywords are maps if not null
    if ((mapNode != null && !isMap(mapNode)) || (mapOfNode != null && !isMap(mapOfNode)) || (mapFacultativeNode != null && !isMap(mapFacultativeNode))) {
      ctx.grammarError(current, `Error : error in map value definition`)
      return null
    }
  
    // every mandatory key (defined for the '_map' keyword) exists
    if (mapNode != null) {
      mapNode.items.forEach(pair => { 
        // only maps with string entries are allowed
        if (!((isPair(pair) && isScalar(pair.key) && pair.key.value instanceof string))) {
          ctx.grammarError(current, `Error : error in map definition`)
          return null
        }
        if (! current.items.has(pair.key.value)) {
          ctx.syntaxError(current, `Error : key '${pair.key.value}' not found in current value`)
          return null
        }      
      })
    }
  
    let parsedKeys = {}
    // for every (key, value) in current, key is in _map or _mapFacultative and value matches definition, if not, value matches defnition of _mapOf 
    current.items.forEach(pair => {
      let key = pair.key.value
      let value = pair.value
      let parsedValue = null
      if (mapNode && mapNode.has(key)) {
        parsedValue = parse_rule(ctx, null, mapNode.get(key), value)
      } else {
        if (mapFacultativeNode && mapFacultativeNode.has(key)) {
          parsedValue = parse_rule(ctx, null, mapFacultativeNode.get(key), value)
        } else {
          if (mapOfNode) {
            parsedValue = parse_rule(ctx, null, mapOfNode, value)
          } else {
            ctx.SyntaxError(value, `Error : '${key}' is not a valid key`)
            return null
          }
        }
      }
      if (parsedValue == null) {
        ctx.SyntaxError(value, `Error : bad value '${value}'found for '${key}'`)
        return null
      }
      parsedKeys[key] = parsedValue
    })

    // everything is ok
    return new MapNode(ctx, current, parsedKeys)
  }

  static parse_any(ctx, current) {
    // current value is a map whose keys are strings
    if (!checkCurrent(current)) {
      ctx.syntaxError(current, `Error : a map whose keys are strings is expected `)
      return null
    }

    // parse every item of the map as 'any'
    let parsedKeys = {}
    current.items.forEach(pair => {
      let key = pair.key.value
      let value = pair.value
      let parsedValue = parse_any(ctx, value)
      if (parsedValue == null) {
        ctx.SyntaxError(value, `Error : bad value '${value}'found for '${key}'`)
        return null
      }
      parsedKeys[key] = parsedValue
    })

    // everything is ok
    return new MapNode(ctx, current, parsedKeys)
  }
}
