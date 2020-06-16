// https://github.com/adonisjs/core/blob/fac6bc/japaFile.js
process.env.TS_NODE_FILES = true
require('ts-node/register')

const { configure } = require('japa')
configure({
    files: ['spec/**/*.spec.ts', 'test/**/*.spec.ts'],
})
