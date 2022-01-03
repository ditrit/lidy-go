import { parse as parse_tosca } from './schemas/tosca.js'
import listener from "./listener/listener.js"
import fs from "fs"
import { ToscaProg } from './tosca/prog.js'
import { newToscaImport, ToscaImport } from './tosca/imports.js'
import { LidyError } from './parser/errors.js'
import fetch from 'node-fetch';
import request from'sync-request'

export function parse_one(file, prog) { 
    let src_data
    let res
    if (typeof(file) == 'string') {
        if (file.slice(0,4) == 'http') {
            src_data = request('GET', file).getBody().toString()
        } else {
            src_data = fs.readFileSync(file, 'utf8')
        }
        prog.imports = []
        res = parse_tosca({src_data, listener, prog, file})
        if (res.errors != []) {
            res.errors.forEach(e => {
                let err = e
                err.originFile = file
                prog.errors.push(err)
            })   
        }
        prog.alreadyImported.push(file)
        
        prog.imports.forEach(fi => { 
            if (!prog.alreadyImported.includes(fi.path)) {
                parse_one(fi.path, prog)
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
    return parse_one(src, prog)
}
// Path for debuger
// let res2 = parse("./lidy-js/ToscaExample.yml")

// Path for terminal
let res2 = parse("../ToscaExample.yml")

if (res2.prog.errors.length != 0) {
    console.log("TOSCA ERROR : ");
    res2.prog.errors.forEach(e => console.log(e))
} else {

    console.log("alreadyImport: ", res2.prog.alreadyImported);
    console.log("Data_types: ", res2.prog.data_types);
    console.log("Node_types: ", res2.prog.node_types);
    console.log(res2.prog.toString());
}
