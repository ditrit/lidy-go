import { parse as parse_tosca } from './schemas/tosca.js'
import listener from "./listener/listener.js"
import fs from "fs"
import { ToscaProg } from './tosca/prog.js'
import { newToscaImport, ToscaImport } from './tosca/imports.js'
import { LidyError } from './parser/errors.js'

export function parse_one(src, prog) { 
    let src_data
    let res
    if (src instanceof ToscaImport) {
        src_data = fs.readFileSync(src.file, 'utf8')
            
        prog.currentPath = src.pathDir
        prog.imports = []
        res = parse_tosca({src_data, listener, prog})
        prog.alreadyImported.push(src.path)
        
        prog.imports.forEach(fi => { 
            if (!prog.alreadyImported.includes(fi.path)) {
                parse_one(fi, prog)
            } else { 
            console.log(`Fichier doublon !: ${fi.path}`);}
        });
    } else {
        prog.errors.push(new LidyError('IMPORT_ERROR error', 0, `Can not read file ${src.file}`))
        console.log(prog.errors.map(x => x.message)); 
    }
    return res
}

export function parse (src) {
    let prog = new ToscaProg()
    prog.alreadyImported = []
    let srcAsImport = newToscaImport({file: src, currentPath: ".", repository: "", namespace_prefix: "", namespace_uri: ""}, {ctx : prog.ctx})
    return parse_one(srcAsImport, prog)
}
// Path for debuger
// let res2 = parse("./lidy-js/ToscaExample.yml")

// Path for terminal
let res2 = parse("../ToscaExample.yml")

if (res2.errors.length > 0) {
    console.log("TOSCA ERROR : ", res2.errors);
} else {

    console.log("alreadyImport: ", res2.prog.alreadyImported);
    console.log("Data_types: ", res2.prog.data_types);
    console.log("Node_types: ", res2.prog.node_types);
    console.log(res2.prog.toString());
}
