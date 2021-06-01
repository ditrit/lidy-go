import { MapNode } from "../nodes/collections/mapnode.js"
import { ScalarParser } from "./scalarparser.js"
import { parse_rule } from './parse.js'
import { isPair, isMap, isScalar  } from 'yaml'
import { StringNode } from "../nodes/scalars/stringnode.js"
import { OneOfParser } from "./oneofparser.js"
import { MergeParser } from "./mergeparser.js"


export class MapParser {

  static parse(ctx, rule, current) {
    // current value is a map
    if (!MapNode.checkCurrent(current)) {
      ctx.syntaxError(current, `Error : a map whose keys are strings is expected `)
      return null
    }

    // get values for map _merge keywords 
    if (rule.has('_merge')) {
      rule = MergeParser.parse(ctx, rule)
      if (rule.has('_oneOf')) { 
        return OneOfParser.parse(ctx, rule, current)
      }
    }

    let mapNode = rule.get('_map', true)
    let mapOfNode = rule.get('_mapOf', true)
    let mapFacultativeNode = rule.get('_mapFacultative', true)
  
    // values for keywords are well formed
    if ((mapNode != null && !isMap(mapNode)) || 
        ((mapOfNode != null && !(isMap(mapOfNode) && mapOfNode.items.length <= 1))) || 
        (mapFacultativeNode != null && !isMap(mapFacultativeNode))) {
      ctx.grammarError(current, `Error : error in map value definition`)
      return null
    }

    // quantity checkers are verified
    if (!MapNode.collectionCheckers(ctx, rule, current)) {
      return null
    }

    // every mandatory key (defined for the '_map' keyword) exists
    if (mapNode != null) {
      for (let pair of mapNode.items) { 
        // only maps with string entries are allowed
        if (!((isPair(pair) && isScalar(pair.key) && (typeof(pair.key.value) == 'string')))) {
          ctx.grammarError(current, `Error : error in map definition`)
          return null
        }
        if (! current.has(pair.key.value)) {
          ctx.syntaxError(current, `Error : key '${pair.key.value}' not found in current value`)
          return null
        }
      }
    }
  
    // pair definition for _mapOf 
    let mapOfKey = null
    let mapOfValue = null
    if (mapOfNode && mapOfNode.items.length == 1) {
      mapOfKey = mapOfNode.items[0].key
      mapOfValue = mapOfNode.items[0].value
    }

    let parsedMap = {}

    // for every (key, value) in current, (key: value) matches _map or _mapFacultative or _mapOf 
    for (let pair of current.items) {
      let key = pair.key.value
      let value = pair.value
      let parsedValue = null

      if (mapNode && mapNode.has(key)) {
        parsedValue = parse_rule(ctx, null, mapNode.get(key, true), value)
      } else {
        if (mapFacultativeNode && mapFacultativeNode.has(key)) {
          parsedValue = parse_rule(ctx, null, mapFacultativeNode.get(key, true), value)
        } else {
          if (mapOfKey && mapOfValue) {
            let parsedKey = parse_rule(ctx, null, mapOfKey, pair.key)
            parsedValue = parse_rule(ctx, null, mapOfValue, value)
            if (parsedKey.value != key) {
              ctx.syntaxError(key, `Error : '${key}' does not match expected '${mapOfNode.key}' type`)
              return null
            }
          } else {
            ctx.syntaxError(value, `Error : '${key}' is not a valid key`)
            return null
          }
        }
      }
      if (parsedValue == null) {
        ctx.syntaxError(value, `Error : bad value '${value}'found for '${key}' (mapparser.parse)`)
        return null
      }
      let parsedKey = new StringNode(ctx, pair.key)
      parsedValue.key = parsedKey
      if (parsedMap[key] != null) {
        ctx.syntaxError(value, `Error : more than one value provided in the map for the key '${key}'`)
        return null
      }
      parsedMap[key] = parsedValue
    }

    // everything is ok
    return new MapNode(ctx, current, parsedMap)
  }

  static parse_any(ctx, current) {
    // current value is a map whose keys are strings
    if (!MapNode.checkCurrent(current)) {
      ctx.syntaxError(current, `Error : a map whose keys are strings is expected `)
      return null
    }

    // parse every item of the map as 'any'
    let parsedMap = {}
    current.items.forEach(pair => {
      let key = pair.key.value
      let value = pair.value
      let parsedValue = ScalarParser.parse_any(ctx, value)
      if (parsedValue == null) {
        ctx.syntaxError(value, `Error : bad value '${value}' found for '${key}' (mapparser.parse_any)`)
        return null
      }
      let parsedKey = new StringNode(ctx, pair.key)
      parsedValue.key = parsedKey
      if (parsedMap[key] != null) {
        ctx.syntaxError(value, `Error : more than one value provided in the map for the key '${key}'`)
      }
      parsedMap[key] = parsedValue
    })

    // everything is ok
    return new MapNode(ctx, current, parsedMap)
  }
}
