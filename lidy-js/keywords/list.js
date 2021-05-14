import { isSeq  } from 'yaml'
import { collectionCheckers } from './collection.js'
import { parse_rule } from '../parse.js'

export function parse_list(ctx, rule, current) {
    
  if (!isSeq(current)) {
    ctx.syntaxError(current, `Error : a list is expected `)
    return false
  }
  if (!collectionCheckers(rule, current)) {
    return false
  }
  
  let listNode = rule.get('_list')
  let listOfNode = rule.get('_listOf')
  let listFacultativeNode = rule.get('_listFacultative')

}
