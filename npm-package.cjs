const { defineConfig } = require('eslint/config')
const packageJson = require('eslint-plugin-package-json')
const base = require('./index.cjs')

module.exports = defineConfig([
  ...base,
  {
    // tsup.config.ts (used by packages that build via a config file rather than tsup CLI args)
    // sits outside the package's own tsconfig `include` (scoped to src/ for a flat dist/
    // declaration layout), which trips the type-aware parser's "file not found in project"
    // error if linted. A no-op ignore for packages that don't have this file.
    ignores: ['tsup.config.ts']
  },
  packageJson.configs.recommended,
  {
    extends: [packageJson.configs.recommended],
    files: ['package.json'],
    rules: {
      'package-json/order-properties': 'warn',
      'package-json/sort-collections': 'warn'
    }
  },
  {
    // Test/mock files reasonably use `any` for casting fixtures and mocking modules — this
    // should not be a reason to exclude them from linting altogether (formatting, import
    // sorting, and every other rule still apply).
    files: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx', '**/__mocks__/**/*.ts', '**/__mocks__/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
])
