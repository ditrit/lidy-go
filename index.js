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

function _parseRuleType(src_st, rule_def, keyword) {

        switch (rule_def) {

        case 'str':
            if ( src_st instanceof YScalar && typeof src_st.value == 'string' )
                return src_st.value
            break;

        case 'int':
            if ( src_st instanceof YScalar && typeof src_st.value == 'number' )
                return src_st.value
            break;

        case 'unbounded':
            if ( src_st instanceof YScalar && src_st.value.toLowerCase() == 'undefined' )
                return src_st.value = 'undefined'
            break;

        default:
            return parseDsl(src_st, rule_def)

        }

}

function _parseRuleMap(src_st, rule_def, keyword) {

        if ( ! (src_st instanceof YMap) )
        throw SyntaxError(`'Should be a map  ( ${keyword} ) !`)
        
        let required = rule_def["required"] || []
        if ( ! ymap_has_all(src_st, required) ) 
        throw SyntaxError(`'${required.join(', ')}' element${(required.length > 1) ? "s are" : " is"} required in a ${keyword}`)
        
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
                    parsed_val = parseRule(pair_value, dict[key], keyword) || defaults[key] 
                    src_st.value[key] = parsed_val
                } else {
                    if (ele_key && ele_val) {
                        parsed_key = parseRule( pair_key, ele_key, keyword )
                        parsed_val = parseRule( pair_value, ele_val, keyword) || defaults[key] 
                        src_st.value[parsed_key] = parsed_val 

                    } else throw SyntaxError(`'${key}' is not allowed inside of '${keyword}'`)
                }
        
            }
        }

        return src_st
}

function _parseRuleList(src_st, rule_def, keyword) {
    return src_st
}

// parsing 
function parseRule(src_st, rule_def, keyword) {

    if ( typeof rule_def == 'string' ) return _parseRuleType(src_st, rule_def, keyword);

    if (rule_def instanceof Object) {

        if ( "dict" in rule_def || "dictOf" in rule_def ) return _parseRuleMap(src_st, rule_def, keyword)
        if ( "list" in rule_def || "listOf" in rule_def ) return _parseRuleList(src_st, rule_def, keyword)
    }
}


function parseDsl(src_st, keyword) {
    let keyrule = dsl_def[keyword]
    return parseRule(src_st, keyrule, keyword)
}

// Load dsl definition file
let  dsl_def_txt
try { dsl_def_txt = fs.readFileSync('tosca_definition.yaml', 'utf8') }
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
try { src_txt = fs.readFileSync('tosca_types.yaml', 'utf8') }
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
let nodes = parseDsl(syntax_tree.contents, "service_template")
console.log(nodes)


console.log(nodes.tmap)