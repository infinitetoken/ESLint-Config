const { defineConfig } = require('eslint/config')
const prettierRecommended = require('eslint-plugin-prettier/recommended')
const simpleImportSort = require('eslint-plugin-simple-import-sort')
const tsParser = require('@typescript-eslint/parser')
const tsEslint = require('typescript-eslint')

module.exports = defineConfig([
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json'
      }
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'lib/**', 'coverage/**', '**/*.js', '**/*.mjs', '.claude/worktrees/**', '.yalc/**']
  },
  ...tsEslint.configs.recommended,
  prettierRecommended,
  {
    plugins: {
      'simple-import-sort': simpleImportSort
    },
    rules: {
      'prettier/prettier': 'warn',
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      'no-console': 'warn',
      // '_'-prefixed unused var/arg/caught-error bindings are a deliberate "I need this position,
      // not this value" signal (most commonly an object-destructure used only to omit a key, e.g.
      // `const { id: _id, ...rest } = obj` — unlike array destructuring, an object key binding can't
      // be elided) and shouldn't warn. Universal fleet-wide: a grep across every repo in the fleet
      // found zero consumers of this bare `.` export, so there's no real "wants the plain warn
      // instead" consumer to preserve by scoping this to individual presets instead.
      '@typescript-eslint/no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      '@typescript-eslint/no-require-imports': 'off'
    }
  }
])
