const fs     = require('fs')
const yaml   = require('yaml' )
const YMap    = require('yaml/map' ).default
const YSeq    = require('yaml/seq').default
const YPair   = require('yaml/pair').default
const YScalar = require('yaml/scalar').default
const lineCol = require('line-column')

// utils for syntax tree objects
function ypair_get_key(pair) {
    if (pair instanceof YPair) return pair.stringKey 
    else throw SyntaxError("Should be a PAIR")
    // Toujours un scalar ???
}

function ypair_get_yval(pair) {
    if (pair instanceof YPair) return pair.value 
    throw SyntaxError("Should be a PAIR")
}

function ymap_has_all(st_dict, keys) {
  for (const k of keys) {
    if (! st_dict.has(k) ) return false
  }
  return true
}

function _parseRuleType(src_st, rule_def, dsl_def, keyword) {

        switch (rule_def) {

        case 'null':
            if ( src_st instanceof YScalar && src_st.value === null )      
                return src_st.value
            else throw SyntaxError(`'Should be null value in ( ${keyword} ) !`)

        case 'timestamp':
            if ( src_st instanceof YScalar )  
                let timestamp = null
                try { timestamp = new Date(src_st.value) } catch (e) { timestamp = null }
            if (!timestamp) throw SyntaxError(`'Should be a timestamp in ( ${keyword} ) !`)
            return src_st.value

        case 'bool':
            if ( src_st instanceof YScalar && ( src_st.value === true || src_st.value === false ) )            
                return src_st.value
            else throw SyntaxError(`'Should be a boolean in ( ${keyword} ) !`)

        case 'str':
            if ( src_st instanceof YScalar && typeof src_st.value == 'string' )
                return src_st.value
            else throw SyntaxError(`'Should be a string in ( ${keyword} ) !`)

        case 'int':
            if ( src_st instanceof YScalar && typeof src_st.value == 'number' && Number.isInteger(src_st.value) )
                return src_st.value
            else throw SyntaxError(`'Should be an int in ( ${keyword} ) !`)

        case 'float':
            if ( src_st instanceof YScalar && typeof src_st.value == 'number' && !Number.isInteger(src_st.value) )
                return src_st.value
            else throw SyntaxError(`'Should be a float in ( ${keyword} ) !`)

        case 'unbounded':
            if ( src_st instanceof YScalar && src_st.value.toLowerCase() == 'undefined' )
                return src_st.value = 'undefined'
            else throw SyntaxError(`'Should be 'unbounded' in ( ${keyword} ) !`)

        default:
            return parseDsl(src_st, dsl_def, rule_def)
        }

}

function _copyDict(rule_def, dsl_def) { 
        let copy_rule = rule_def['copy']
        if (!copy_rule) return rule_def
        let to_copy_dict = copy_rule && dsl_def[copy_rule]
        let to_copy_flat_dict = to_copy_dict && _copyDict(to_copy_dict, dsl_def)

        let new_rule = Object.assign({}, rule_def)
        if ('required' in new_rule) new_rule.required = [...new_rule.required]

        if ('dictOf' in new_rule)
            if ('dictOf' in to_copy_flat_dict) throw SyntaxError(`Error in grammar : 'dictOf' exists in both rule and copied rule`) 
        else if (dictOf in to_copy_flat_dict) new_rule.dictOf = to_copy_flat_dict.dictOf
        
        if ('dict' in new_rule) new_rule.dict = Object.assign({}, new_rule.dict)
        else if ('dict' in to_copy_flat_dict) new_rule.dict = {}

        if (to_copy_flat_dict.dict) {
            for (const key in to_copy_flat_dict.dict) {
                if (key in new_rule.dict) throw SyntaxError(`Error in grammar : key ${key} exists in both rule and copied rule`) 
                else new_rule.dict[key] = to_copy_flat_dict.dict[key]
            }
        }

        return new_rule
}

function _parseRuleMap(src_st, rule_def, dsl_def, keyword) {

    if (!src_st) src_st = new YMap()
    if ( ! (src_st instanceof YMap) )
    throw SyntaxError(`'Should be a map  ( ${keyword} ) !`)

    // apply (recursive) copy if 'copy' keyword exists
    rule_def = _copyDict(rule_def, dsl_def)

    // required
    let required = rule_def["required"] || []
    if ( ! ymap_has_all(src_st, required) ) 
    throw SyntaxError(`'${required.join(', ')}' element${(required.length > 1) ? "s are" : " is"} required in a ${keyword}`)

    // cardinality
    let nb  = rule_def["nb"]
    let max = rule_def["max"]
    let min = rule_def["min"]
    let nb_items = src_st.items.length
    if (nb && nb_items != nb)
    throw SyntaxError(`'this map should have ${nb} element${(nb > 1) ? "s " : " "}(${nb_items} provided)`)
    if (max && nb_items > max)
    throw SyntaxError(`'this map should have at most ${max} element${(nb > 1) ? "s " : " "}(${nb_items} provided)`)
    if (min && nb_items < min)
    throw SyntaxError(`'this map should have at least ${min} element${(min > 1) ? "s " : " "}(${nb_items} provided)`)

    // schemas of elements
    let defaults = rule_def["defaults"] || {} 
    let dict     = rule_def["dict"]
    let ele_key, ele_val
    let dictOf   = rule_def["dictOf"]

    if (dictOf && Object.keys(dictOf).length == 1) {
        ele_key = Object.keys(dictOf)[0]
        ele_val = Object.values(dictOf)[0]
    } else dictOf = null

    src_st.value = {}
    for (const item of src_st.items ) {
        if ( item instanceof YPair ) {
            let pair_key = item && item.key
            let key = pair_key.value
            let pair_value = item && item.value
            let parsed_key, parsed_val
            if ( dict && key in dict ) {
                parsed_val = parseRule(pair_value, dict[key], dsl_def, keyword) || defaults[key] 
                src_st.value[key] = parsed_val
            } else {
                if (ele_key && ele_val) {
                    parsed_key = parseRule( pair_key, ele_key, dsl_def, keyword )
                    parsed_val = parseRule( pair_value, ele_val, dsl_def, keyword) || defaults[key] 
                    src_st.value[parsed_key] = parsed_val 
              } else throw SyntaxError(`'${key}' is not allowed inside of '${keyword}'`)
            }
        }
     }
   return src_st
}


function _parseRuleList(src_st, rule_def, dsl_def, keyword) { 

    if (!src_st) src_st = new YSeq()
    if ( ! (src_st instanceof YSeq) )
    throw SyntaxError(`'Should be a list  ( ${keyword} ) !`)

    // cardinality
    let nb  = rule_def["nb"]
    let max = rule_def["max"]
    let min = rule_def["min"]
    let nb_items = src_st.items.length
    if (nb && nb_items !== nb)
    throw SyntaxError(`'this map should have ${nb} element${(nb > 1) ? "s " : " "}(${nb_items} provided)`)
    if (max && nb_items > max)
    throw SyntaxError(`'this map should have at most ${max} element${(nb > 1) ? "s " : " "}(${nb_items} provided)`)
    if (min && nb_items < min)
    throw SyntaxError(`'this map should have at least ${min} element${(min > 1) ? "s " : " "}(${nb_items} provided)`)

    // schemas of elements
    let optional = rule_def["optional"] || []
    //let defaults = rule_def["defaults"] || {} 
    let list     = rule_def["list"]
    let listOf   = rule_def["listOf"]

    let ele = (listOf && listOf instanceof Array && listOf.length == 1) ? listOf[0] :  null

    src_st.value = []
    let idx = 0
    let lst_nb = (list && list.length) || 0
    let item
    let parsed_item
    let parsed_ok = true

    if (list) {
        for (let lst_idx = 0; lst_idx < lst_nb; lst_idx++ ) {
            if (parsed_ok == true) {
                item = src_st.items[idx]
                idx++
            }
            let def_ele = list[lst_idx]
            let is_optional = optional.includes(lst_idx + 1)
            try { 
                parsed_item = parseRule( item, def_ele, dsl_def, keyword) 
                parsed_ok = true
            } catch (error) { 
                if ( ! is_optional) throw (error)
                parsed_ok = false 
            }
            if (parsed_ok == true) src_st.value.push(parsed_item)
        }
    }   
    if (listOf) {
        is_optional = optional.includes(lst_nb + 1)
        def_ele = listOf
        let nb_of = 0
        for (;idx < nb_items; idx++) {
            item = src_st.items[idx]
            parsed_item = parseRule( item, def_ele, dsl_def, keyword) 
            src_st.value.push(parsed_item)
            nb_of++
        }
        if (nb_of == 0 && is_optional == false ) throw SyntaxError(` ListOf should contain at least one element `)
    } else if (src_st.items[idx]) throw SyntaxError(`To many elements in the list`)

    return src_st
}

function _parseRuleOneOf(src_st, rule_def, dsl_def, keyword) {

    let choices     = rule_def["oneOf"]
    if (choices) {
        for (let choice of choices ) {
            try { 
                let value = parseRule( src_st, choice, dsl_def, keyword)
                return src_st
            } catch (error) { }
        }
    } 
    throw SyntaxError(`No option satisfied in oneOf`)
}

function _parseRuleEnum(src_st, rule_def, dsl_def, keyword) {
    // fonctionne pour les scalaires uniquement, revoir pour les valeurs complexes
    if ( rule_def["enum"].includes( src_st.value ) ) return src_st
    else throw SyntaxError(`${src_st.value} not in enum ${rule_def["enum"]}`)
}

// parsing 
function parseRule(src_st, rule_def, dsl_def, keyword) {

    if ( typeof rule_def == 'string' ) return _parseRuleType(src_st, rule_def, dsl_def, keyword);

    if (rule_def instanceof Object) {

        if ( "dict"  in rule_def || "dictOf" in rule_def ) return _parseRuleMap(src_st, rule_def, dsl_def, keyword)
        if ( "list"  in rule_def || "listOf" in rule_def ) return _parseRuleList(src_st, rule_def, dsl_def, keyword)
        if ( "oneOf" in rule_def) return _parseRuleOneOf(src_st, rule_def, dsl_def, keyword)
        if ( "enum"  in rule_def) return _parseRuleEnum(src_st, rule_def, dsl_def, keyword)
    }
}

function parseDsl(src_st, dsl_def, keyword) {
    let keyrule = dsl_def[keyword]
    if (keyrule) {
        return parseRule(src_st, keyrule, dsl_def, keyword)
    } else throw (SyntaxError(`No definition found for keyword '${keyword}'`))
}

function parse(src_file, dsl_def_file, keyword) {
    // Load dsl definition file
    let  dsl_def_txt
    try { dsl_def_txt = fs.readFileSync(dsl_def_file, 'utf8') }
    catch (e) { console.log(`can not read the language definition file : ${e}`) }

    // parse dsl definition file
    let dsl_def
    try { dsl_def = yaml.parse(dsl_def_txt) } 
    catch(e) {
        const dsl_def_linecol = lineCol(dsl_def_txt)
        const deb = dsl_def_linecol.fromIndex(e.source.range.start - 1)
        const fin = dsl_def_linecol.fromIndex(e.source.range.end - 1)
        console.log(`${e.name}: ${e.message} at position ${deb}, ${fin}`)
    }

    // Load source code
    let src_txt
    try { src_txt = fs.readFileSync(src_file, 'utf8') }
    catch (e) { console.log(`can not read the TOSCA source file : ${e}`) }

    // parse source code
    let syntax_tree
    try { syntax_tree = yaml.parseDocument(src_txt) }
    catch (e) {
        const src_linecol = lineCol(src_txt)
        const deb = src_linecol.fromIndex(e.source.range.start - 1)
        const fin = src_linecol.fromIndex(e.source.range.end - 1)
        console.log(`${e.name}: ${e.message} at position ${deb}, ${fin}`)
    }

    // parse !!!!!
    let nodes = parseDsl(syntax_tree.contents, dsl_def, keyword)
    console.log(nodes)
    console.log(nodes.value)
}

//parse('tests/tosca_types.yaml', 'tests/tosca_definition.yaml', 'service_template')
parse('tests/test_dict_copy.yaml', 'tests/test_dict_copy_def.yaml', 'artifact_type')
