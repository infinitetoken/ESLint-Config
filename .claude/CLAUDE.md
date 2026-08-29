# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# @infinitetoken/eslint-config

Shared ESLint (flat config) and Prettier rules for InfiniteToken TypeScript packages. Part of the `@infinitetoken` shared tooling scope, alongside `@infinitetoken/tsconfig` (`../TSConfig`).

## Commands

```bash
npm run lint   # ESLint check
npm run fix    # Auto-fix lint/format issues
npm test       # Verify every preset resolves and loads correctly
npm run verify     # lint + test
```

## Release

Tag-based, using npm trusted publishing (OIDC, no token required):

```bash
npm version patch   # or minor / major
git push --follow-tags
```

The `publish.yml` workflow fires on `v*` tags and runs `npm publish`.

## Presets

| Export | Use for |
| --- | --- |
| `.` | Universal core; rarely used directly. Ignores `dist/**`, `node_modules/**`, `lib/**`, `coverage/**`, `**/*.js`, `**/*.mjs`, `.claude/worktrees/**` (Claude Code artifact dir, present fleet-wide), `.yalc/**` (yalc-linked packages snapshot `.d.ts`/`.d.mts` output, not just compiled JS — those crash the type-aware parser like any other out-of-project `.ts` file if not ignored) |
| `./npm-package` | Published npm packages with no RN/server specifics (kits, Node plugins). Also ignores `tsup.config.ts` (no-op if the package doesn't have one — it sits outside the rootDir-scoped tsconfig most kit packages use, which trips the type-aware parser if linted), and turns `@typescript-eslint/no-explicit-any` off under `**/__tests__/**`/`**/__mocks__/**` — those directories are linted like anywhere else (formatting, import sort, unused vars), not excluded; `any` is a reasonable choice there for casting fixtures and mocking modules |
| `./react-native` | React Native packages; composes on `./npm-package`, so it inherits all of the above too |
| `./server` | Express/server apps (unpublished) |
| `./vue` | Vue/Nuxt apps; standalone, does not compose on `index.cjs`; includes the `package.json` plugin like `npm-package.cjs` does, inlined directly rather than composed (composing on `npm-package.cjs` would double up ignores/parser config) |
| `./prettier` | Shared Prettier rules object |

`react-native.cjs` and `server.cjs` compose on top of `npm-package.cjs`/`index.cjs` (note: `server.cjs` composes on `index.cjs` directly, not `npm-package.cjs` — it doesn't inherit the `tsup.config.ts` ignore or the `__tests__`/`__mocks__` relaxation, since server apps aren't published and are less likely to need either). `vue.cjs` is standalone instead — its ignores, TS parsing (no type-aware project, since Nuxt's generated tsconfig makes that awkward), and `no-unused-vars` rule shape all differ enough from the core that composing would mean overriding nearly everything anyway. Repo-specific overrides belong in the consuming repo's own `eslint.config.cjs`, composed via `defineConfig([...require(...), { ... }])`; never add repo-specific rules here.

If a consuming repo's `eslint.config.cjs` has nothing to add beyond the preset, don't wrap it in `defineConfig([...base])` — that's a redundant no-op, since the preset file already calls `defineConfig(...)` internally and exports the finished array. Just `module.exports = require('@infinitetoken/eslint-config/<variant>')` directly (see this repo's own `eslint.config.cjs`, or `TSConfig`'s, `Jest-Config`'s).

**Known gap, not yet fixed:** the `^_`-prefixed unused-vars/args ignore pattern (`varsIgnorePattern: '^_'`, etc.) only exists in `./server`'s rules — `./npm-package`/`./react-native` don't have it, so a library package that follows the same underscore convention for intentionally-unused params will still get a warning. Confirmed via the Wave 3/4 `@rific`/`@tastic` migration (several repos surfaced these once `__tests__` started getting linted). Worth adding to the base at some point, not done unilaterally since it's a rule-severity decision affecting every consumer.

`eslint-plugin-react-hooks` and `eslint-plugin-react-native` are optional peer dependencies, not bundled dependencies, since `eslint-plugin-react-native@5` only supports `eslint` up to v9, and bundling it would force that ceiling onto every consumer, not just React Native ones. `eslint-plugin-vue`/`vue-eslint-parser` don't have that problem (verified against `eslint@^10`), so they're bundled as regular dependencies like the rest.

## File layout

The six preset files (`index.cjs`, `npm-package.cjs`, `prettier.cjs`, `react-native.cjs`, `server.cjs`, `vue.cjs`) live in `src/`, not repo root — purely a physical/repo-tidiness move, not an API change. Every `exports` entry in `package.json` still maps to the same public subpath as before (`.`, `./npm-package`, `./prettier`, `./react-native`, `./server`, `./vue`); only the right-hand-side file path changed, e.g. `"./npm-package": "./src/npm-package.cjs"`. No consumer sees or needs to know about `src/` at all — `require('@infinitetoken/eslint-config/npm-package')` resolves exactly the same before and after. This is a different move than `TSConfig`'s `tsup/` directory, which nests in the *public* subpath too (`./tsup/lib`) because "tsup" is real, load-bearing information about which tool a consumer is picking; nesting `./eslint/npm-package` here would just repeat this package's own name for no reason (see `TSConfig`'s CLAUDE.md for the fuller reasoning — this repo was the case explicitly considered and rejected for that treatment, then revisited as a file-layout-only move instead).

## Code Style

This repo dogfoods itself: root `eslint.config.cjs` requires this package's own `src/npm-package.cjs` by relative path, and `package.json`'s `"prettier"` field points at `./src/prettier.cjs` the same way. Always run `npm run lint` before finishing any task.

Single quotes, JSX single quotes, no semicolons, no trailing commas, print width 1000 (effectively disabled).
