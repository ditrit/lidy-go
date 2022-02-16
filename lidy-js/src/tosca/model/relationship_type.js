class ToscaRelationshipType extends ToscaType {
    constructor(name, derived_from, version, metadata, description, source) {
        super(name, derived_from, version, metadata, description, source)
    }
    static _classname = "relationship_type"
}