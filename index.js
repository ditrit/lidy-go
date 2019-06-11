const fs     = require('fs')
const yaml   = require('yaml' )
const YMap    = require('yaml/map' ).default
const YSeq    = require('yaml/seq').default
const YPair   = require('yaml/pair').default
const YScalar = require('yaml/scalar').default
const lineCol = require('line-column')

function ymap_has_all(st_dict, keys) {
  for (const k of keys) {
    if (! st_dict.has(k) ) return false
  }
  return true
}

function _newTimestamp(src_st) {
    let timestamp = NaN
    if ( src_st instanceof YScalar ) {
        try { timestamp = Date.parse(src_st.value) } catch (erreur) { }
        if (isNaN(timestamp)) 
            timestamp = null
        else
            timestamp.range = src_st.range
    } 
    return timestamp
}

function _newBoolean(src_st) {
    let bool_val = null
    if ( src_st instanceof YScalar && ( src_st.value === true || src_st.value === false ) ) {
        bool_val = new Boolean(true)
        bool_val.range = src_st.range
    }
    return bool_val
}

function _newUnbounded(src_st) {
    let unbounded = null
    if ( src_st instanceof YScalar && typeof src_st.value == 'string' && src_st.value.toLowerCase() == 'unbounded' ) {
        unbounded = new Number(Infinity)
        unbounded.range = src_st.range
        unbounded.isUnbounded = true
        unbounded.isInteger = true
        unbounded.isFloat = true
    }
    return unbounded
}

function _newString(src_st) {
    let str = null
    if ( src_st instanceof YScalar && (typeof src_st.value === 'string' || typeof src_st.value === 'number' )) {
        str = new String(src_st.value)
        str.range = src_st.range                
    }
    return str
}

function _newInteger(src_st) {
    let num = null
    if ( src_st instanceof YScalar && typeof src_st.value == 'number' && Number.isInteger(src_st.value) ) {
        num = new Number(src_st.value)
        num.range = src_st.range
        num.isUnbounded = false
        num.isInteger = true
        num.isFloat = false
    }
    return num
}

function _newFloat(src_st) {
    let num = null
    if ( src_st instanceof YScalar && typeof src_st.value == 'number' && !Number.isInteger(src_st.value) ) {
        num = new Number(src_st.value)
        num.range = src_st.range
        num.isUnbounded = false
        num.isInteger = false
        num.isFloat = true
    }
    return num
}

function _newList(src_st) {
    let list_array = null
    if ( src_st instanceof YSeq ) {
        list_array = src_st.items.map(x => _parseRuleAnyYaml(x))
        list_array.range = src_st.range
    }
    return list_array
}

function _newMap(src_st) {
    let map = null
    if ( src_st instanceof YMap ) {
        map = new Map()
        for (item of src_st.items) {
            let key = item.key.value
            let value  = item.value
            map.set(key, _parseRuleAnyYaml(value))
        }
        map.range = src_st.range
        return map
    }
}

function _locate(src_idx, range) {
    let begin = src_idx.fromIndex( (range[0] > 1 ) ? range[0] : 0 )
    let end = src_idx.fromIndex( (range[1] > 1 ) ? range[1]  : 0 )
    let loc_str = ` at ${begin.line}:${begin.col} <-> ${end.line}:${end.col}`
    return loc_str
}


function _parseAtomic(src_st, rule_def, dsl_def, keyword, src_idx) {

    let res = null
    switch (rule_def) {

        case 'null': 
            if (! (src_st instanceof YScalar && src_st.value === null)) 
            throw SyntaxError(`'Should be null value in ( ${keyword} ) ! ${_locate(src_idx, src_st.range)}`)
            break
        case 'timestamp': 
            res = _newTimestamp(src_st) 
            if (!res) throw SyntaxError(`'Should be a timestamp in ( ${keyword} ) ! ${_locate(src_idx, src_st.range)}`)
            break
        case 'bool': 
            res = _newBoolean(src_st) 
            if (!res) throw SyntaxError(`'Should be a boolean in ( ${keyword} ) ! ${_locate(src_idx, src_st.range)}`)
            break
        case 'unbounded': 
            res = _newUnbounded(src_st) 
            if (!res) throw SyntaxError(`'Should be 'unbounded' in ( ${keyword} ) ! ${_locate(src_idx, src_st.range)}`)
            break
        case 'int': 
            res = _newInteger(src_st) 
            if (!res) throw SyntaxError(`'Should be an int in ( ${keyword} ) ! ${_locate(src_idx, src_st.range)}`)
            break
        case 'float': 
            res = _newFloat(src_st) 
            if (!res) throw SyntaxError(`'Should be a float in ( ${keyword} ) ! ${_locate(src_idx, src_st.range)}`)
            break
        case 'list': 
            res= _newList(src_st) 
            if (!res) throw SyntaxError(`'Should be a list in ( ${keyword} ) ! ${_locate(src_idx, src_st.range)}`)
            break
        case 'map': 
            res = _newMap(src_st) 
            if (!res) throw SyntaxError(`'Should be a map in ( ${keyword} ) ! ${_locate(src_idx, src_st.range)}`)
            break
        case 'str': 
            res = _newString(src_st) 
            if (!res) throw SyntaxError(`'Should be a string in ( ${keyword} ) ! ${_locate(src_idx, src_st.range)}`)
            break
        case 'any': 
            res = _parseRuleAnyYaml(src_st)
            break
        default: res= parseDsl(src_st, dsl_def, rule_def, src_idx)
    }
    return res
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

function _copyDict(rule_def, dsl_def) { 
    
    let copy_rule = rule_def['_copy']
    if (!copy_rule) return rule_def
    let to_copy_dict = copy_rule && dsl_def[copy_rule]
    let to_copy_flat_dict = to_copy_dict && _copyDict(to_copy_dict, dsl_def)

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

function _parseRuleMap(src_st, rule_def, dsl_def, keyword, src_idx) {

    if (!src_st) src_st = new YMap()
    if ( ! (src_st instanceof YMap) )
    throw SyntaxError(`'Should be a map  ( ${keyword} )  ! ${_locate(src_idx, src_st.range)}`)

    // apply (recursive) copy if 'copy' keyword exists
    rule_def = _copyDict(rule_def, dsl_def)

    // required
    let required = rule_def["_required"] || []
    if ( ! ymap_has_all(src_st, required) ) 
    throw SyntaxError(`'${required.join(', ')}' element${(required.length > 1) ? "s are" : " is"} required in a ${keyword} ${_locate(src_idx, src_st.range)}`)

    // cardinality
    let nb  = rule_def["_nb"]
    let max = rule_def["_max"]
    let min = rule_def["_min"]
    let nb_items = src_st.items.length
    if (nb && nb_items != nb)
    throw SyntaxError(`'this map should have ${nb} element${(nb > 1) ? "s " : " "}(${nb_items} provided) ${_locate(src_idx, src_st.range)}`)
    if (max && nb_items > max)
    throw SyntaxError(`'this map should have at most ${max} element${(nb > 1) ? "s " : " "}(${nb_items} provided) ${_locate(src_idx, src_st.range)}`)
    if (min && nb_items < min)
    throw SyntaxError(`'this map should have at least ${min} element${(min > 1) ? "s " : " "}(${nb_items} provided) ${_locate(src_idx, src_st.range)}`)

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
    map.range = src_st.range
    for (const item of src_st.items ) {
        if ( item instanceof YPair ) {
            let pair_key = item && item.key
            let key = pair_key.value
            let pair_value = item && item.value
            let parsed_key, parsed_val
            if ( dict && key in dict ) {
                parsed_val = parseRule(pair_value, dict[key], dsl_def, keyword, src_idx) || defaults[key] 
                map.set(key, parsed_val)
            } else {
                if (ele_key && ele_val) {
                    parsed_key = parseRule( pair_key, ele_key, dsl_def, keyword, src_idx)
                    parsed_val = parseRule( pair_value, ele_val, dsl_def, keyword, src_idx) || defaults[key] 
                    map.set(parsed_key, parsed_val) 
                } else {
                    let message = `'${key}' is not allowed inside of '${keyword}' ${_locate(src_idx, src_st.range)}`
                    throw SyntaxError(message)
                }
            }
        }
     }
   return map
}


function _parseRuleList(src_st, rule_def, dsl_def, keyword, src_idx) { 

    if (!src_st) src_st = new YSeq()
    if ( ! (src_st instanceof YSeq) )
    throw SyntaxError(`'Should be a list  ( ${keyword} ) ${_locate(src_idx, src_st.range)} !`)

    // cardinality
    let nb  = rule_def["_nb"]
    let max = rule_def["_max"]
    let min = rule_def["_min"]
    let nb_items = src_st.items.length
    if (nb && nb_items !== nb)
    throw SyntaxError(`'this map should have ${nb} element${(nb > 1) ? "s " : " "}(${nb_items} provided) ${_locate(src_idx, src_st.range)}`)
    if (max && nb_items > max)
    throw SyntaxError(`'this map should have at most ${max} element${(nb > 1) ? "s " : " "}(${nb_items} provided) ${_locate(src_idx, src_st.range)}`)
    if (min && nb_items < min)
    throw SyntaxError(`'this map should have at least ${min} element${(min > 1) ? "s " : " "}(${nb_items} provided) ${_locate(src_idx, src_st.range)}`)

    // schemas of elements
    let optional = rule_def["_optional"] || []
    //let defaults = rule_def["defaults"] || {} 
    let list     = rule_def["_list"]
    let listOf   = rule_def["_listOf"]

    src_st.value = []
    let idx = 0
    let lst_nb = (list && list.length) || 0
    let item
    let parsed_item
    let parsed_ok = true

    let list_array = []
    list_array.range = src_st.range

    if (list) {
        for (let lst_idx = 0; lst_idx < lst_nb; lst_idx++ ) {
            if (parsed_ok == true) {
                item = src_st.items[idx]
                idx++
            }
            let def_ele = list[lst_idx]
            let is_optional = optional.includes(lst_idx + 1)
            try { 
                parsed_item = parseRule( item, def_ele, dsl_def, keyword, src_idx) 
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
            item = src_st.items[idx]
            parsed_item = parseRule( item, def_ele, dsl_def, keyword, src_idx) 
            list_array.push(parsed_item)
            nb_of++
        }
        if (nb_of == 0 && is_optional == false ) throw SyntaxError(` ListOf should contain at least one element ${_locate(src_idx, src_st.range)}`)
    } else if (src_st.items[idx]) throw SyntaxError(`To many elements in the list ${_locate(src_idx, src_st.range)}`)

    return list_array
}

function _parseRuleOneOf(src_st, rule_def, dsl_def, keyword, src_idx) {

    let choices     = rule_def["_oneOf"]
    if (choices) {
        for (let choice of choices ) {
            try { 
                let res = parseRule( src_st, choice, dsl_def, keyword, src_idx)
                return res
            } catch (error) { }
        }
    } 
    throw SyntaxError(`No option satisfied in oneOf ${_locate(src_idx, src_st.range)}`)
}

function _parseRuleEnum(src_st, rule_def, dsl_def, keyword, src_idx) {
    // fonctionne pour les scalaires uniquement, revoir pour les valeurs complexes
    if ( rule_def["_enum"].includes( src_st.value ) ) {
        let str_res = _newString(src_st)
        str_res.range = src_st.range
        return str_res
    } else throw SyntaxError(`${src_st.value} not in enum ${rule_def["enum"]} ${_locate(src_idx, src_st.range)}`)
}

function _parseRuleRegExp(src_st, rule_def, dsl_def, keyword, src_idx) {

    let re_str = rule_def["_regexp"]
    if ( typeof re_str === 'string' ) {
        let re = new RegExp(re_str) 
        let str_res = _newString(src_st)
        if (str_res && re.exec(str_res)) {
            str_res.range = src_st.range
        }  else throw SyntaxError(`'${str_res}' does not match '${re_str}' for grammar keyword '${keyword}' ${_locate(src_idx, src_st.range)}`) 
    } else throw SyntaxError(`'${str_res}' can not be used as a regular expression ( keyword '${keyword}' ) ${_locate(src_idx, src_st.range)}`) 
}

// parsing 
function parseRule(src_st, rule_def, dsl_def, keyword, src_idx) {

    if ( typeof rule_def == 'string' ) return _parseAtomic(src_st, rule_def, dsl_def, keyword, src_idx);

    if (rule_def instanceof Object) {

        if ( "_dict"   in rule_def || "_dictOf" in rule_def ) return _parseRuleMap(src_st, rule_def, dsl_def, keyword, src_idx)
        if ( "_list"   in rule_def || "_listOf" in rule_def ) return _parseRuleList(src_st, rule_def, dsl_def, keyword, src_idx)
        if ( "_oneOf"  in rule_def) return _parseRuleOneOf(src_st, rule_def, dsl_def, keyword, src_idx)
        if ( "_enum"   in rule_def) return _parseRuleEnum(src_st, rule_def, dsl_def, keyword, src_idx)
        if ( "_regexp" in rule_def) return _parseRuleRegExp(src_st, rule_def, dsl_def, keyword, src_idx)
    }
}

function parseDsl(src_st, dsl_def, keyword, src_idx) {
    if (!dsl_def) 
        console.log("LOG")
    let keyrule = dsl_def[keyword]
    if (keyrule) {
        return parseRule(src_st, keyrule, dsl_def, keyword, src_idx)
    } else throw (SyntaxError(`Keyword '${keyword}' not found in language definition`))
}

function getTextFromFile(file_path, file_descr) {
    let txt
    try { txt = fs.readFileSync(file_path, 'utf8') }
    catch (e) { console.log(`can not read ${file_descr} file : ${e}`) }
    return txt
}

function parseYaml(src_txt, document) {
    let linecol_idx = lineCol(src_txt + "\n")
    var src_st
    try { 
        var src_st = (document === true) ? yaml.parseDocument(src_txt) : yaml.parse(src_txt) 
    } catch(e) {
        const deb = linecol_idx.fromIndex(e.source.range.start - 1)
        const fin = linecol_idx.fromIndex(e.source.range.end - 1)
        console.log(`${e.name}: ${e.message}\n\t at position ${deb}, ${fin}`)
    }
    return { syntax_tree: src_st, content: src_txt, linecol: linecol_idx }
}

function parseYamlDocument(src_txt) {
    return parseYaml(src_txt, true)
}

function parse(src_file, dsl_def_file, keyword) {

    let  dsl_txt = getTextFromFile(dsl_def_file, "language definition")
    let dsl = parseYaml(dsl_txt)

    let src_txt = getTextFromFile(src_file, "source")
    let src = parseYamlDocument(src_txt)

    let nodes = parseDsl(src.syntax_tree.contents, dsl.syntax_tree, keyword, src.linecol)
    return nodes
}

function parseString(src_txt, dsl_def_file, keyword) {

    let  dsl_txt = getTextFromFile(dsl_def_file, "language definition")
    let dsl = parseYaml(dsl_txt)

    let src = parseYamlDocument(src_txt)

    let nodes = parseDsl(src.syntax_tree.contents, dsl.syntax_tree, keyword, src.linecol)
    return nodes
}

//parse('tests/tosca_types.yaml', 'tests/tosca_definition.yaml', 'service_template')
let res = parse('tests/test_dict_copy.yaml', 'tests/test_dict_copy_def.yaml', 'artifact_type')
//parse('tests/tosca_types.yaml', 'tests/yaml_def.yaml', 'yamldoc') 

