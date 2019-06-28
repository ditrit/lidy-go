const fs      = require('fs')
const path    = require('path')
const yaml    = require('yaml' )
const YMap    = require('yaml/map' ).default
const YSeq    = require('yaml/seq').default
const YPair   = require('yaml/pair').default
const YScalar = require('yaml/scalar').default
const lineCol = require('line-column')


function ymap_has_all(tree, keys) {
  for (const key of keys) {
      let items = key.split('|')
      let found = false
      for (const item of items) {
          if (found = tree.has(item)) break;
      }
    if (! found ) return false
  }
  return true
}

function _newTimestamp(tree) {
    let timestamp = NaN
    if ( tree instanceof YScalar ) {
        try { timestamp = Date.parse(tree.value) } catch (erreur) { }
        if (isNaN(timestamp)) 
            timestamp = null
        else
            timestamp.range = tree.range
    } 
    return timestamp
}

function _newBoolean(tree) {
    let bool_val = null
    if ( tree instanceof YScalar && ( tree.value === true || tree.value === false ) ) {
        bool_val = new Boolean(true)
        bool_val.range = tree.range
    }
    return bool_val
}

function _newUnbounded(tree) {
    let unbounded = null
    if ( tree instanceof YScalar && typeof tree.value == 'string' && tree.value.toLowerCase() == 'unbounded' ) {
        unbounded = new Number(Infinity)
        unbounded.range = tree.range
        unbounded.isUnbounded = true
        unbounded.isInteger = true
        unbounded.isFloat = true
    }
    return unbounded
}

function _newString(tree) {
    let str = null
    if ( tree instanceof YScalar && (typeof tree.value === 'string' || typeof tree.value === 'number' )) {
        str = new String(tree.value)
        str.range = tree.range                
    }
    return str
}

function _newInteger(tree) {
    let num = null
    if ( tree instanceof YScalar && typeof tree.value == 'number' && Number.isInteger(tree.value) ) {
        num = new Number(tree.value)
        num.range = tree.range
        num.isUnbounded = false
        num.isInteger = true
        num.isFloat = false
    }
    return num
}

function _newFloat(tree) {
    let num = null
    if ( tree instanceof YScalar && typeof tree.value == 'number' && !Number.isInteger(tree.value) ) {
        num = new Number(tree.value)
        num.range = tree.range
        num.isUnbounded = false
        num.isInteger = false
        num.isFloat = true
    }
    return num
}

function _newList(tree) {
    let list_array = null
    if ( tree instanceof YSeq ) {
        list_array = tree.items.map(x => _parseRuleAnyYaml(x))
        list_array.range = tree.range
    }
    return list_array
}

function _newMap(tree) {
    let map = null
    if ( tree instanceof YMap ) {
        map = new Map()
        for (item of tree.items) {
            let key = item.key.value
            let value  = item.value
            map.set(key, _parseRuleAnyYaml(value))
        }
        map.range = tree.range
        return map
    }
}

function _locate(src_idx, range) {
    let begin = src_idx.fromIndex( (range[0] > 1 ) ? range[0] : 0 )
    let end = src_idx.fromIndex( (range[1] > 1 ) ? range[1]  : 0 )
    let loc_str = ` at ${begin.line}:${begin.col} <-> ${end.line}:${end.col}`
    return loc_str
}


function _parseAtomic(tree, rule_def, keyword, info) {

    let res = null
    switch (rule_def) {

        case 'null': 
            if (! (tree instanceof YScalar && tree.value === null)) 
            throw SyntaxError(`'Should be null value in ( ${keyword} ) ! ${_locate(info.index, tree.range)}`)
            break
        case 'timestamp': 
            res = _newTimestamp(tree) 
            if (!res) throw SyntaxError(`'Should be a timestamp in ( ${keyword} ) ! ${_locate(info.index, tree.range)}`)
            break
        case 'bool': 
            res = _newBoolean(tree) 
            if (!res) throw SyntaxError(`'Should be a boolean in ( ${keyword} ) ! ${_locate(info.index, tree.range)}`)
            break
        case 'unbounded': 
            res = _newUnbounded(tree) 
            if (!res) throw SyntaxError(`'Should be 'unbounded' in ( ${keyword} ) ! ${_locate(info.index, tree.range)}`)
            break
        case 'int': 
            res = _newInteger(tree) 
            if (!res) throw SyntaxError(`'Should be an int in ( ${keyword} ) ! ${_locate(info.index, tree.range)}`)
            break
        case 'float': 
            res = _newFloat(tree) 
            if (!res) throw SyntaxError(`'Should be a float in ( ${keyword} ) ! ${_locate(info.index, tree.range)}`)
            break
        case 'list': 
            res= _newList(tree) 
            if (!res) throw SyntaxError(`'Should be a list in ( ${keyword} ) ! ${_locate(info.index, tree.range)}`)
            break
        case 'map': 
            res = _newMap(tree) 
            if (!res) throw SyntaxError(`'Should be a map in ( ${keyword} ) ! ${_locate(info.index, tree.range)}`)
            break
        case 'str': 
            res = _newString(tree) 
            if (!res) throw SyntaxError(`'Should be a string in ( ${keyword} ) ! ${_locate(info.index, tree.range)}`)
            break
        case 'any': 
            res = _parseRuleAnyYaml(tree)
            break
    }
    if (res) return _dslObject(res, rule_def, info)
    else return parseDsl(tree, info, rule_def)
}

function _parseRuleAnyYaml(src_st) {
    let res = null
    res = _newTimestamp(src_st) 
    if (!res) res = _newBoolean(src_st) 
    if (!res) res = _newUnbounded(src_st) 
    if (!res) res = _newString(src_st) 
    if (!res) res = _newInteger(src_st) 
    if (!res) res = _newFloat(src_st) 
    if (!res) res = _newList(src_st) 
    if (!res) res = _newMap(src_st) 
    return res
}

function _copyDict(rule_def, info) { 
    
    let copy_rule = rule_def['_copy']
    if (!copy_rule) return rule_def
    let to_copy_dict = copy_rule && info.dsl[copy_rule]
    let to_copy_flat_dict = to_copy_dict && _copyDict(to_copy_dict, info.dsl)

    let new_rule = Object.assign({}, rule_def)
    if ('_required' in new_rule) new_rule._required = [...new_rule._required]

    if ('_dictOf' in new_rule)
        if ('_dictOf' in to_copy_flat_dict) throw SyntaxError(`Error in grammar : '_dictOf' exists in both rule and copied rule`) 
    else if ('_dictOf' in to_copy_flat_dict) new_rule._dictOf = to_copy_flat_dict._dictOf
        
    if ('_dict' in new_rule) new_rule._dict = Object.assign({}, new_rule._dict)
    else if ('_dict' in to_copy_flat_dict) new_rule._dict = {}

    if (to_copy_flat_dict._dict) {
        for (const key in to_copy_flat_dict._dict) {
            if (key in new_rule._dict) throw SyntaxError(`Error in grammar : key ${key} exists in both rule and copied rule`) 
            else new_rule._dict[key] = to_copy_flat_dict._dict[key]
        }
    }

    return new_rule
}

function _parseRuleMap(tree, rule_def, keyword, info) {

    if (!tree) tree = new YMap()
    if ( ! (tree instanceof YMap) )
    throw SyntaxError(`'Should be a map  ( ${keyword} )  ! ${_locate(info.index, tree.range)}`)

    // apply (recursive) copy if 'copy' keyword exists
    rule_def = _copyDict(rule_def, info)

    // required
    let required = rule_def["_required"] || []
    if ( ! ymap_has_all(tree, required) ) 
    throw SyntaxError(`'${required.join(', ')}' element${(required.length > 1) ? "s are" : " is"} required in a ${keyword} ${_locate(info.index, tree.range)}`)

    // cardinality
    let nb  = rule_def["_nb"]
    let max = rule_def["_max"]
    let min = rule_def["_min"]
    let nb_items = tree.items.length
    if (nb && nb_items != nb)
    throw SyntaxError(`'this map should have ${nb} element${(nb > 1) ? "s " : " "}(${nb_items} provided) ${_locate(info.index, tree.range)}`)
    if (max && nb_items > max)
    throw SyntaxError(`'this map should have at most ${max} element${(nb > 1) ? "s " : " "}(${nb_items} provided) ${_locate(info.index, tree.range)}`)
    if (min && nb_items < min)
    throw SyntaxError(`'this map should have at least ${min} element${(min > 1) ? "s " : " "}(${nb_items} provided) ${_locate(info.index, tree.range)}`)

    // schemas of elements
    let defaults = rule_def["_defaults"] || {} 
    let dict     = rule_def["_dict"]
    let ele_key, ele_val
    let dictOf   = rule_def["_dictOf"]

    if (dictOf && Object.keys(dictOf).length == 1) {
        ele_key = Object.keys(dictOf)[0]
        ele_val = Object.values(dictOf)[0]
    } else dictOf = null

    let map = new Map()
    map.range = tree.range
    for (const item of tree.items ) {
        if ( item instanceof YPair ) {
            let pair_key = item && item.key
            let key = pair_key.value
            let pair_value = item && item.value
            let parsed_key, parsed_val
            if ( dict && key in dict ) {
                parsed_val = parseRule(pair_value, dict[key], keyword, info) || defaults[key] 
                map.set(key, parsed_val)
            } else {
                if (ele_key && ele_val) {
                    parsed_key = parseRule( pair_key, ele_key, keyword, info)
                    parsed_val = parseRule( pair_value, ele_val, keyword, info) || defaults[key] 
                    map.set(parsed_key, parsed_val) 
                } else {
                    let message = `'${key}' is not allowed inside of '${keyword}' ${_locate(info.index, tree.range)}`
                    throw SyntaxError(message)
                }
            }
        }
     }
   return map
}


function _parseRuleList(tree, rule_def, keyword, info) { 

    if (!tree) tree = new YSeq()
    if ( ! (tree instanceof YSeq) )
    throw SyntaxError(`'Should be a list  ( ${keyword} ) ${_locate(info.index, tree.range)} !`)

    // cardinality
    let nb  = rule_def["_nb"]
    let max = rule_def["_max"]
    let min = rule_def["_min"]
    let nb_items = tree.items.length
    if (nb && nb_items !== nb)
    throw SyntaxError(`'this map should have ${nb} element${(nb > 1) ? "s " : " "}(${nb_items} provided) ${_locate(info.index, tree.range)}`)
    if (max && nb_items > max)
    throw SyntaxError(`'this map should have at most ${max} element${(nb > 1) ? "s " : " "}(${nb_items} provided) ${_locate(info.index, tree.range)}`)
    if (min && nb_items < min)
    throw SyntaxError(`'this map should have at least ${min} element${(min > 1) ? "s " : " "}(${nb_items} provided) ${_locate(info.index, tree.range)}`)

    // schemas of elements
    let optional = rule_def["_optional"] || []
    //let defaults = rule_def["defaults"] || {} 
    let list     = rule_def["_list"]
    let listOf   = rule_def["_listOf"]

    tree.value = []
    let idx = 0
    let lst_nb = (list && list.length) || 0
    let item
    let parsed_item
    let parsed_ok = true

    let list_array = []
    list_array.range = tree.range

    if (list) {
        for (let lst_idx = 0; lst_idx < lst_nb; lst_idx++ ) {
            if (parsed_ok == true) {
                item = tree.items[idx]
                idx++
            }
            let def_ele = list[lst_idx]
            let is_optional = optional.includes(lst_idx + 1)
            try { 
                parsed_item = parseRule( item, def_ele, keyword, info) 
                parsed_ok = true
            } catch (error) { 
                if ( ! is_optional) throw (error)
                parsed_ok = false 
            }
            if (parsed_ok == true) list_array.push(parsed_item)
        }
    }   
    if (listOf) {
        is_optional = optional.includes(lst_nb + 1)
        def_ele = listOf
        let nb_of = 0
        for (;idx < nb_items; idx++) {
            item = tree.items[idx]
            parsed_item = parseRule( item, def_ele, keyword, info) 
            list_array.push(parsed_item)
            nb_of++
        }
        if (nb_of == 0 && is_optional == false ) throw SyntaxError(` ListOf should contain at least one element ${_locate(info.index, tree.range)}`)
    } else if (tree.items[idx]) throw SyntaxError(`To many elements in the list ${_locate(info.index, tree.range)}`)

    return list_array
}

function _parseRuleOneOf(tree, rule_def, keyword, info) {

    let choices     = rule_def["_oneOf"]
    if (choices) {
        for (let choice of choices ) {
            try { 
                let res = parseRule( tree, choice, keyword, info)
                return res
            } catch (error) { }
        }
    } 
    throw SyntaxError(`No option satisfied in oneOf ${_locate(info.index, tree.range)}`)
}

function _parseRuleIn(tree, rule_def, keyword, info) {
    // fonctionne pour les scalaires uniquement, revoir pour les valeurs complexes
    if ( rule_def["_in"].includes( tree.value ) ) {
        let str_res = _newString(tree)
        str_res.range = tree.range
        return str_res
    } else throw SyntaxError(`${tree.value} is not in  ${rule_def["_in"]} for grammar keyword '${keyword} ${_locate(info.index, tree.range)}`)
}

function _parseRuleNotIn(tree, rule_def, keyword, info) {
    // fonctionne pour les scalaires uniquement, revoir pour les valeurs complexes
    if ( ! rule_def["_notin"].includes( tree.value ) ) {
        let str_res = _newString(tree)
        str_res.range = tree.range
        return str_res
    } else throw SyntaxError(`${tree.value} should not be in ${rule_def["_notin"]} for grammar keyword '${keyword} ${_locate(info.index, tree.range)}`)
}

function _parseRuleRegExp(tree, rule_def, keyword, info) {
    let re_str = rule_def["_regexp"]
    if ( typeof re_str === 'string' ) {
        let re = new RegExp(re_str) 
        let str_res = _newString(tree)
        if (str_res && re.exec(str_res)) {
            str_res.range = tree.range
            return str_res
        }  else throw SyntaxError(`'${str_res}' does not match '${re_str}' for grammar keyword '${keyword}' ${_locate(info.index, tree.range)}`) 
    } else throw SyntaxError(`'${str_res}' can not be used as a regular expression ( keyword '${keyword}' ) ${_locate(info.index, tree.range)}`) 
}

function _dslObject(yamlObject, key_value, info) {
    let classname
    if ( typeof key_value == 'string' ) classname =  info.typed_rules[key_value]
    else throw SyntaxError(`'${key_value}' is not a key in the grammar`)

    if (classname)
        if (classname in info.classes) {
            let ret= new (info.classes)[classname](yamlObject)
            return ret
        } else throw SyntaxError(`'${classname}' is not a known class`)
    else {
        let ret = yamlObject
        return yamlObject
    }
}

// parsing 
function parseRule(tree, rule_def, keyword, info) {

    if ( typeof rule_def == 'string' ) return _parseAtomic(tree, rule_def, keyword, info);

    if (rule_def instanceof Object) {

        if ( "_dict"   in rule_def || "_dictOf" in rule_def ) return _parseRuleMap(tree, rule_def, keyword, info);
        if ( "_list"   in rule_def || "_listOf" in rule_def ) return _parseRuleList(tree, rule_def, keyword, info);
        if ( "_oneOf"  in rule_def) return _parseRuleOneOf(tree, rule_def, keyword, info);
        if ( "_in"     in rule_def) return _parseRuleIn(tree, rule_def, keyword, info);
        if ( "_notin"  in rule_def) return _parseRuleNotIn(tree, rule_def, keyword, info);
        if ( "_regexp" in rule_def) return _parseRuleRegExp(tree, rule_def, keyword, info);
    }
}

function parseDsl(tree, info, keyword) {
    if (!tree) 
        console.log("LOG")
    let keyrule = info.dsl[keyword]
    if (keyrule) {
        let yamlObject = parseRule(tree, keyrule, keyword, info)
        return _dslObject(yamlObject, keyword, info)
    } else throw (SyntaxError(`Keyword '${keyword}' not found in language definition`))
}

function getTextFromFile(file_path, file_descr) {
    let txt
    try { txt = fs.readFileSync(file_path, 'utf8') }
    catch (e) { console.log(`can not read ${file_descr} file : ${e}`) }
    return txt
}

function parseYaml(src_txt, document = false) {
    let index = lineCol(src_txt + "\n")
    let tree
    try { 
        if ( document === true ) {
            let doc = yaml.parseDocument(src_txt)
            tree = doc.contents
        } else {
            tree = yaml.parse(src_txt)
        }
    } catch(e) {
        const deb = index.fromIndex(e.source.range.start - 1)
        const fin = index.fromIndex(e.source.range.end - 1)
        console.log(`${e.name}: ${e.message}\n\t at position ${deb}, ${fin}`)
    }
    return { tree: tree, index: index }
}

function parseYamlDocument(src_txt) {
    return parseYaml(src_txt, true)
}

function _parse(src_file, src_txt, dsl_def_file, keyword) {

    let dsl_txt = getTextFromFile(dsl_def_file, "language definition")
    let dsl_dir = path.resolve(path.dirname(dsl_def_file))
    let dsl = parseYaml(dsl_txt)
    let dsl_tree = {}
    let dsl_key2class = {}
    for (const label in dsl.tree) {
        [ key, classname ] = label.split("->")
        dsl_tree[key] = dsl.tree[label]
        dsl_key2class[key] = classname
    }
    let classes = {}
    if ('@import_classes' in dsl_tree) {
        try {
            var class_path = `${dsl_dir}/${dsl_tree['@import_classes']}`
            classes  = require(class_path)
        } catch(e) {
            throw(`Error : Can not load the DLS classes definition file ${class_path}\n  ${e.name}: ${e.message}`)
        }
    } else {
            console.log('No DSL classes definition')
    }

    let src_content = (src_file) ? getTextFromFile(src_file, "source") : src_txt
    let src = parseYamlDocument(src_content)

    let info = { dsl: dsl_tree, typed_rules: dsl_key2class, index: src.index, filename: src_file, classes: classes }
    let nodes = parseDsl(src.tree, info, keyword)
    return nodes
}

function parse_file(src_file, dsl_def_file, keyword) {
    return _parse(src_file, null, dsl_def_file, keyword)
}

function parse_string(src_txt, dsl_def_file, keyword) {
    return _parse(null, src_txt, dsl_def_file, keyword)
}

exports.parse_string=parse_string
exports.parse_file=parse_file

