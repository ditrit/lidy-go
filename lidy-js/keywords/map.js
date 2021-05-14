import { isMap, isScalar, isSeq  } from 'yaml'
import { collectionCheckers } from './collection.js'
import { parse_rule } from '../parse.js'

export function parse_map(ctx, rule, current) {

  if (!isMap(current)) {
    ctx.syntaxError(current, `Error : a map is expected `)
    return false
  }
  if (!collectionCheckers(rule, current)) {
    return false
  }
  
  let mapNode = rule.get('_map')
  let mapOfNode = rule.get('_mapOf')
  let mapFacultativeNode = rule.get('_mapFacultative')

}
