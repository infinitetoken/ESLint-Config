/* eslint-disable no-console */
const assert = require('node:assert/strict')
const path = require('node:path')

const configExports = ['index.cjs', 'npm-package.cjs', 'react-native.cjs', 'server.cjs', 'vue.cjs', 'expo.cjs']

for (const file of configExports) {
  const config = require(path.join('..', 'src', file))
  assert.ok(Array.isArray(config), `${file} should export an array`)
  assert.ok(config.length > 0, `${file} should export a non-empty config`)
  console.log(`${file}: OK (${config.length} entries)`)
}

const prettierConfig = require('../src/prettier.cjs')
assert.equal(typeof prettierConfig, 'object', 'prettier.cjs should export an object')
assert.equal(prettierConfig.semi, false, 'prettier.cjs should set semi: false')
console.log('prettier.cjs: OK')

const indexConfig = require('../src/index.cjs')
const indexIgnores = indexConfig.flatMap((block) => block.ignores || [])
assert.ok(indexIgnores.includes('.claude/worktrees/**'), 'index.cjs should ignore .claude/worktrees/** (universal across the fleet)')
assert.ok(indexIgnores.includes('.yalc/**'), 'index.cjs should ignore .yalc/** (yalc-linked packages snapshot .d.ts/.d.mts output, not just compiled JS)')
console.log('index.cjs (.claude/worktrees + .yalc ignores): OK')

const npmPackageConfig = require('../src/npm-package.cjs')
const npmPackageIgnores = npmPackageConfig.flatMap((block) => block.ignores || [])
assert.ok(npmPackageIgnores.includes('tsup.config.ts'), 'npm-package.cjs should ignore tsup.config.ts (outside rootDir-scoped tsconfig for most kit packages)')
const testMockOverride = npmPackageConfig.find((block) => block.files?.includes('**/__tests__/**/*.ts'))
assert.ok(testMockOverride, 'npm-package.cjs should have a __tests__/__mocks__ files override')
assert.equal(testMockOverride.rules['@typescript-eslint/no-explicit-any'], 'off', 'npm-package.cjs should turn off no-explicit-any for __tests__/__mocks__, not ignore them entirely')
console.log('npm-package.cjs (tsup.config.ts ignore + test/mock any relaxation): OK')

const reactNativeConfig = require('../src/react-native.cjs')
const reactNativeRulesBlock = reactNativeConfig.find((block) => block.rules?.['react-native/sort-styles'])
assert.ok(reactNativeRulesBlock, 'react-native.cjs should set react-native/sort-styles')
console.log('react-native.cjs (sort-styles rule): OK')

const expoConfig = require('../src/expo.cjs')
const expoIgnores = expoConfig.flatMap((block) => block.ignores || [])
assert.ok(expoIgnores.includes('ios/**') && expoIgnores.includes('android/**') && expoIgnores.includes('.expo/**'), 'expo.cjs should ignore native build dirs (ios/**, android/**, .expo/**)')
const expoUnusedVarsBlock = [...expoConfig].reverse().find((block) => block.rules?.['@typescript-eslint/no-unused-vars'])
assert.ok(expoUnusedVarsBlock, 'expo.cjs should end up with a @typescript-eslint/no-unused-vars rule in effect')
assert.deepEqual(expoUnusedVarsBlock.rules['@typescript-eslint/no-unused-vars'][1], { varsIgnorePattern: '^_', argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }, 'expo.cjs should apply the fleet-wide ^_ ignore pattern last, so eslint-config-expo/flat cannot win that rule back')
console.log('expo.cjs (native-dir ignores + ^_ pattern wins over eslint-config-expo/flat): OK')
