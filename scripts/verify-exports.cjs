const assert = require('node:assert/strict')
const path = require('node:path')

const configExports = ['index.cjs', 'npm-package.cjs', 'react-native.cjs', 'server.cjs']

for (const file of configExports) {
  const config = require(path.join('..', file))
  assert.ok(Array.isArray(config), `${file} should export an array`)
  assert.ok(config.length > 0, `${file} should export a non-empty config`)
  console.log(`${file}: OK (${config.length} entries)`)
}

const prettierConfig = require('../prettier.cjs')
assert.equal(typeof prettierConfig, 'object', 'prettier.cjs should export an object')
assert.equal(prettierConfig.semi, false, 'prettier.cjs should set semi: false')
console.log('prettier.cjs: OK')
