import { parse as parse_tosca } from '../../schemas/tosca.js'
import listener from "../listener/listener.js"
import { ToscaServiceTemplate } from '../../tosca/model/service_template.js'
import { LidyError } from '../../parser/errors.js'
import fs from "fs"
import path from 'path'
import request from 'sync-request'

export default function parse_file(file, namespace_uri, namespace_prefix, parent_service_template, prog) {
    let src_data, res
    if (typeof (file) == 'string') {
        if (file.slice(0, 4) == 'http') {
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
        res = parse_tosca({ src_data, listener, prog, file })
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
                parse_file(absPath, fi.namespace_uri, fi.namespace_prefix, current_service_template, prog)
            });

        }
    } else {
        prog.errors.push(new LidyError('IMPORT_ERROR error', 0, `Can not read file ${src.file}`))
        console.log(prog.errors.map(x => x.message));
    }
    return res
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