export class ToscaProg {
    constructor() {
        this.errors = []
        this.warnings = []
        this.imports = []
        this.alreadyImported = []
        this.service_templates = []
    }

    toStringType(tosca_type) {
        let str = `\n ${tosca_type} : \n`
        for (const key in this[tosca_type]) {
            let node_type = this[tosca_type][key]
            str += `    ${key}: ${node_type}\n`
        }
        return str
    }

    toString() {
        let str = "prog: \n"
        console.log("DEBUG: ",this.service_templates + "\n\n");        
        for (const st in this.service_templates) {
            str += st.toString()
        }
        return str
    }
}

export class ToscaNode {
    constructor(source) {
        this.source = source
        this.source.tosca = this
    }
}

export class ToscaType extends ToscaNode {
    constructor(input, source) {
        super(source)
        this.derived_from = input.derived_from
        this.version = input.version
        this.metadata = input.metadata
        this.description = input.description
    }

    setName(name) {
        this.name= name
    }

    getClassname() {
        return this._classname
    }

    setId(name, parsed_rule) {
        let current_st = parsed_rule.ctx.prog.current_service_template
        let parent_st = parsed_rule.ctx.prog.current_parent_service_template
            

        this.import_id = current_st.ns_uri +
        "|" + current_st.ns_prefix +
        "|"+ this.getClassname() + "|" + name

        this.id = current_st.namespace.value +
        "||"+ this.getClassname() + "|" + name

        console.log("Import_id : " + this.import_id);
        console.log("ID : " + this.id);
        console.log("Parent ids : " + parent_st?.tosca_types);
        
        if (parent_st?.tosca_types.includes(this.import_id)) {
            parsed_rule.ctx.grammarError('Type collision : '+this.import_id)
            console.log("Erreur de collision de type");
        } else {
            parent_st?.tosca_types.push(this.import_id)
            current_st?.tosca_types.push(this.id)
            current_st.tosca_types[name] = this
            this.setName(name)
        }
    }

    toString() {
        let str
        str += `{name: ${this.name}, \n    `
        str += `    Derived_from: ${this.derived_from}, \n    `
        if (this.version) {str += this.version}
        if (this.description) {str += this.description}
        if (this.metadata) { str += this.metadata }
        return str;
    }
    static isValid(input, source) {
        if (typeof(input.derived_from) != 'string' // || 
            ) {
            
            return false
        }
        return true
    }
}

export function newToscaType (input, source) {
    let res
    if (ToscaType.isValid(input, source)) {
        res = newToscaType(input, source)
    } else {
        res = {}
    }
    return res
}