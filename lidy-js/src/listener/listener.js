import imports from './imports.js'
import prog from './prog.js'
import description from './description.js'
import metadata from './metadata.js'
import namespace from './namespace.js'
import nodetype from './node_type.js'
import repository from './repository.js'


export default {
    ...prog,
    ...imports, 
    ...description, 
    ...metadata, 
    ...namespace, 
    ...nodetype,
    ...repository,
}