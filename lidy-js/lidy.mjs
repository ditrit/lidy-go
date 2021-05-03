import fs   from 'fs'
import path from 'path'

import {
    Document,
    isDocument,
    parseDocument,
    isAlias, isCollection, isMap,
    isNode, isPair, isScalar, isSeq,
    Scalar, visit, YAMLMap, YAMLSeq,
    LineCounter
  } from 'yaml'

  const lineCounter = new LineCounter()
  const doc = parseDocument(`


  toto: 
    tutu: 7 #comment
    titi: 5`, {lineCounter:lineCounter})
  let value = doc.contents
  console.log(value)
  console.log(lineCounter.linePos(21))
  console.log(lineCounter.lineStarts)
