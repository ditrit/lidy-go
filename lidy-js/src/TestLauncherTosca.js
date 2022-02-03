import { parse as parse_tosca } from './schemas/tosca.js'
import listener from "./listener/listener.js"
import fs from "fs"
import { ToscaProg } from './tosca/prog.js'
import { ToscaServiceTemplate } from './tosca/service_template.js'
import { LidyError } from './parser/errors.js'
import request from'sync-request'
import path from 'path'

export function parse_one(file, prog) { 
    let src_data, res, current_path
    if (typeof(file) == 'string') {
        if (file.slice(0,4) == 'http') {
            src_data = request('GET', file).getBody().toString()
        } else {
            src_data = fs.readFileSync(file, 'utf8')
        }
        
        current_path = path.dirname(file)

        prog.current_service_template = new ToscaServiceTemplate()
        res = parse_tosca({src_data, listener, prog, file})
        prog.service_templates.push(prog.current_service_template)
       
        if (res.errors != []) {
            res.errors.forEach(e => {
                let err = e
                err.originFile = file
                prog.errors.push(err)
            })   
        }
        prog.alreadyImported.push(file)
        
        prog.current_service_template.imports.forEach(fi => { 
            console.log("File import: "+fi);
            let absPath = getAbsolutePath(current_path, fi, prog)
            console.log("\n\nAbsolute path : ", absPath);

            if (!prog.alreadyImported.includes(fi.path)) {
                parse_one(absPath, prog)
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
    return parse_one(src, prog)
}


function getAbsolutePath(current_path, current_import, prog) {
    let res
    // repository management
    if (current_import.repository && current_import.repository != "") {
        res = `${prog.repositories[current_import.repository].getFullUrl()}:`
    } else { 
        // current_file is URL or already absolute path
        res = (!current_import.path.match(/^[a-zA-Z]*:\/\//) || !current_import.path[0] == '/') ? 
            current_path + '/' + current_import.path : 
            current_import.path
    }
    if (!res.match(/^[a-zA-Z]*:\/\//)) { // res not url
        res = path.resolve(res)
    }
    current_import.fullPath = res
    return res
}

let res2 = parse("../ToscaExampleSimple.yml")

if (res2.prog.errors.length != 0) {
    console.log("TOSCA ERROR : ");
    res2.prog.errors.forEach(e => console.log(e))
} else {

    console.log("alreadyImport: ", res2.prog.alreadyImported);
    // console.log("Data_types: ", res2.prog.data_types);
    // console.log("Node_types: ", res2.prog.node_types);
    // console.log("service_templates: ", res2.prog.service_templates);
    console.log(res2.prog.service_templates.toString());
}
