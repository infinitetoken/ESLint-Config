const { defineConfig } = require('eslint/config')
const reactHooks = require('eslint-plugin-react-hooks')
const eslintReactNative = require('eslint-plugin-react-native')
const npmPackage = require('./npm-package.cjs')

module.exports = defineConfig([
  ...npmPackage,
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-native': eslintReactNative
    },
    rules: {
      'react-native/no-inline-styles': 'warn',
      'react-native/no-unused-styles': 'warn',
      'react-native/no-raw-text': 'off',
      'react-native/sort-styles': 'warn',
      // rules-of-hooks stays at error since it's the foundational hook-ordering check, not a
      // judgment call. The rest match the fleet's severities (warn, not error).
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/set-state-in-effect': 'warn'
    }
  }
])
