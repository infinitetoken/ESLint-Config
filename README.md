# @infinitetoken/eslint-config

Shared ESLint (flat config) and Prettier rules for InfiniteToken TypeScript packages.

## Presets

| Export | Use for |
| --- | --- |
| `@infinitetoken/eslint-config` | Universal core (TS recommended, prettier, import sort); rarely used directly. Always ignores `dist/**`, `node_modules/**`, `lib/**`, `coverage/**`, `**/*.js`, `**/*.mjs`, and `.claude/worktrees/**` (a Claude Code artifact directory present across the whole fleet) |
| `@infinitetoken/eslint-config/npm-package` | Any published npm package with no React Native or server specifics (kits, Node plugins). Also ignores `tsup.config.ts` (a no-op if the package doesn't have one — it sits outside the rootDir-scoped tsconfig most kit packages use, which trips the type-aware parser if linted) and turns off `no-explicit-any` under `**/__tests__/**` and `**/__mocks__/**` — those directories are linted like anywhere else (formatting, import sort, unused vars), not excluded; `any` is just a reasonable choice there for casting fixtures and mocking modules |
| `@infinitetoken/eslint-config/react-native` | React Native packages; adds `eslint-plugin-react-hooks` and `eslint-plugin-react-native` |
| `@infinitetoken/eslint-config/server` | Express/server apps; relaxed `no-unused-vars` (`^_` ignore pattern), `no-explicit-any: warn`, skips the `package.json` plugin since these aren't published |
| `@infinitetoken/eslint-config/vue` | Vue/Nuxt apps; adds `vue-eslint-parser` + `eslint-plugin-vue`'s `flat/recommended`, no type-aware TS parsing (Nuxt's generated tsconfig makes that awkward) |
| `@infinitetoken/eslint-config/prettier` | The shared Prettier rules object, for the `"prettier"` field in `package.json` |

## Usage

```js
// eslint.config.cjs
module.exports = require('@infinitetoken/eslint-config/react-native')
```

Repo-specific overrides (extra ignores, a one-off rule exception) stay local, composed in the same file:

```js
const { defineConfig } = require('eslint/config')

module.exports = defineConfig([
  ...require('@infinitetoken/eslint-config/react-native'),
  { ignores: ['some-repo-specific-dir/**'] }
])
```

```json
// package.json
{
  "prettier": "@infinitetoken/eslint-config/prettier"
}
```

`eslint` itself is a peer dependency (`^9.9.0 || ^10.0.0`); keep it as your own devDependency for the CLI binary. Most plugins the config requires (`typescript-eslint`, `eslint-plugin-prettier`, `eslint-plugin-simple-import-sort`, `eslint-plugin-package-json`, `eslint-plugin-vue`, `vue-eslint-parser`, `prettier`) ship as regular dependencies of this package, so consumers don't list or version them individually.

`eslint-plugin-react-hooks` and `eslint-plugin-react-native` are the exception: they're optional peer dependencies instead, only needed by the `/react-native` preset. `eslint-plugin-react-native@5` currently only supports `eslint` up to v9, so bundling it as a regular dependency would force that ceiling onto every consumer, not just React Native ones. If you use the `/react-native` preset, add both as your own devDependencies (matching what the RN packages already do today).

## Release

Tag-based, using npm trusted publishing (OIDC, no token required):

```bash
npm version patch   # or minor / major
git push --follow-tags
```
