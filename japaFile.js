// https://github.com/adonisjs/core/blob/fac6bc/japaFile.js
process.env.TS_NODE_FILES = true
require('ts-node/register')

const { configure } = require('japa')

let files = ['spec/**/*.spec.ts', 'test/**/*.test.ts']

if (process.argv.length > 2) {
    files = process.argv.slice(2).map((path) => path.replace(/\\/g, '/'))
}

configure({
    files,
})
