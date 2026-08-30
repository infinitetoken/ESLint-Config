const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const reactNative = require('./react-native.cjs')

module.exports = defineConfig([
  {
    ignores: ['ios/**', 'android/**', '.expo/**', '.vscode/**']
  },
  ...expoConfig,
  ...reactNative
])
