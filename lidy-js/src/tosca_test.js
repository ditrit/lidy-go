import { parse } from './schemas/tosca.js'

console.log("on commence")
let res = parse({src_data: "tosca_definitions_version: tosca_1.2", keyword: "service_template"})
console.log("resultat : " + res + ".")
console.log(" res : " + res + " !")
console.log("on a fini")