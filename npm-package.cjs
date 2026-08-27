const { defineConfig } = require('eslint/config')
const packageJson = require('eslint-plugin-package-json')
const base = require('./index.cjs')

module.exports = defineConfig([
  ...base,
  packageJson.configs.recommended,
  {
    extends: [packageJson.configs.recommended],
    files: ['package.json'],
    rules: {
      'package-json/order-properties': 'warn',
      'package-json/sort-collections': 'warn'
    }
  }
])
