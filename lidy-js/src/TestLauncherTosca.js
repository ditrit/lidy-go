import { parse as parse_tosca } from './schemas/tosca.js'
import listener from "./listener/listener.js"
import fs from "fs"
import { ToscaProg } from './tosca/prog.js'
import { ToscaServiceTemplate } from './tosca/service_template.js'
import { LidyError } from './parser/errors.js'
import request from'sync-request'
import path from 'path'
import { execPath, kill } from 'process'

export function parse_one(file, namespace_uri, namespace_prefix, parent_service_template, prog) { 
    let src_data, res
    if (typeof(file) == 'string') {
        if (file.slice(0,4) == 'http') {
            src_data = request('GET', file).getBody().toString()
        } else {
            src_data = fs.readFileSync(file, 'utf8')
        }
        
        let current_path = path.dirname(file)

        
        let current_service_template = new ToscaServiceTemplate()
        current_service_template.origin_file = file
        current_service_template.ns_uri = (namespace_uri) ? namespace_uri : ""
        current_service_template.ns_prefix = (namespace_prefix) ? namespace_prefix : ""
        
        prog.current_parent_service_template = parent_service_template
        prog.current_service_template = current_service_template
        res = parse_tosca({src_data, listener, prog, file})
        prog.service_templates.push(current_service_template)
       
        prog.alreadyImported.push(file)

        if (res.errors.length != 0) {
            res.errors.forEach(e => {
                let err = e
                err.originFile = file
                prog.errors.push(err)
            })   
        } else {
            current_service_template.imports.forEach(fi => { 
                let absPath = getAbsolutePath(current_path, fi, prog)

                // if (!prog.alreadyImported.includes(fi.path)) {
                parse_one(absPath, fi.namespace_uri, fi.namespace_prefix, current_service_template, prog)
            //     } else { 
            //     console.log(`Fichier doublon !: ${fi.path}`);}
            }); 
        }
    } else {
        prog.errors.push(new LidyError('IMPORT_ERROR error', 0, `Can not read file ${src.file}`))
        console.log(prog.errors.map(x => x.message)); 
    }
    return res
}

export function parse (src) {
    let prog = new ToscaProg()
    return parse_one(src, "", "", null, prog)
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
console.log(process.cwd());

let res2 = parse("./A.yml")

if (res2.prog.errors.length != 0) {
    console.log("TOSCA ERROR : ");
    res2.prog.errors.forEach(e => console.log(e))
} else {

    // console.log("alreadyImport: ", res2.prog.alreadyImported);
    // console.log("Data_types: ", res2.prog.data_types);
    // console.log("Node_types: ", res2.prog.node_types);
    // console.log("service_templates: ", res2.prog.service_templates);
    // console.log("\n\nTosca_types : "+res2.prog.tosca_types.toString()+"\n\n");
    res2.prog.service_templates.forEach(st => {
        console.log("\n-------" + st.origin_file + " -------------------------------------");
        for (const key in st.node_types) {
                console.log("key = "+key.toString());
            }
        }
    );
    // console.log(res2.prog.service_templates.toString());

}
