import { newToscaVersion } from "../model/version.js"

export default {
    exit_version(parsed_rule) {
        let version = (parsed_rule.value) ? parsed_rule.value : ""
        newToscaVersion(version, parsed_rule)
    }
}