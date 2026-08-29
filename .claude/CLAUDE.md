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
| `.` | Universal core; rarely used directly (a fleet-wide grep found zero direct consumers — see below). Ignores `dist/**`, `node_modules/**`, `lib/**`, `coverage/**`, `**/*.js`, `**/*.mjs`, `.claude/worktrees/**` (Claude Code artifact dir, present fleet-wide), `.yalc/**` (yalc-linked packages snapshot `.d.ts`/`.d.mts` output, not just compiled JS — those crash the type-aware parser like any other out-of-project `.ts` file if not ignored). `no-unused-vars` carries the `^_`-prefix ignore pattern (see below) — every other preset inherits it from here |
| `./npm-package` | Published npm packages with no RN/server specifics (kits, Node plugins). Also ignores `tsup.config.ts` (no-op if the package doesn't have one — it sits outside the rootDir-scoped tsconfig most kit packages use, which trips the type-aware parser if linted), and turns `@typescript-eslint/no-explicit-any` off under `**/__tests__/**`/`**/__mocks__/**` — those directories are linted like anywhere else (formatting, import sort, unused vars), not excluded; `any` is a reasonable choice there for casting fixtures and mocking modules |
| `./react-native` | React Native packages; composes on `./npm-package`, so it inherits all of the above too |
| `./server` | Express/server apps (unpublished) |
| `./vue` | Vue/Nuxt apps; standalone, does not compose on `index.cjs`; includes the `package.json` plugin like `npm-package.cjs` does, inlined directly rather than composed (composing on `npm-package.cjs` would double up ignores/parser config) |
| `./prettier` | Shared Prettier rules object |

`react-native.cjs` and `server.cjs` compose on top of `npm-package.cjs`/`index.cjs` (note: `server.cjs` composes on `index.cjs` directly, not `npm-package.cjs` — it doesn't inherit the `tsup.config.ts` ignore or the `__tests__`/`__mocks__` relaxation, since server apps aren't published and are less likely to need either). `vue.cjs` is standalone instead — its ignores, TS parsing (no type-aware project, since Nuxt's generated tsconfig makes that awkward), and `no-unused-vars` rule shape all differ enough from the core that composing would mean overriding nearly everything anyway. Repo-specific overrides belong in the consuming repo's own `eslint.config.cjs`, composed via `defineConfig([...require(...), { ... }])`; never add repo-specific rules here.

If a consuming repo's `eslint.config.cjs` has nothing to add beyond the preset, don't wrap it in `defineConfig([...base])` — that's a redundant no-op, since the preset file already calls `defineConfig(...)` internally and exports the finished array. Just `module.exports = require('@infinitetoken/eslint-config/<variant>')` directly (see this repo's own `eslint.config.cjs`, or `TSConfig`'s, `Jest-Config`'s).

**`^_`-prefixed unused-vars/args ignore pattern, universal in the base (`index.cjs`).** `no-unused-vars` is `['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }]` in `index.cjs` itself, so every preset that composes on it (`npm-package`, `react-native`, `server`) inherits it automatically — a `_`-prefixed unused var/arg/caught-error binding is a deliberate "I need this position, not this value" signal (most commonly an object-destructure used only to omit a key, e.g. `const { id: _id, ...rest } = obj` — array destructuring can elide a position, but an object key binding is unavoidable) and shouldn't warn, anywhere in the fleet. `argsIgnorePattern` alone rarely matters in practice — `typescript-eslint`'s own `no-unused-vars` default (`args: 'after-used'`) already excuses an earlier unused parameter when a later one is used, so `(_, i) => checked.has(i)` needs no config either way; the pattern mainly matters for `varsIgnorePattern`/`caughtErrorsIgnorePattern`.

Originally only `./server` had this (added in isolation before `npm-package.cjs` needed it), which meant every `@rific`/`@tastic` library package that used the `_`-prefix convention had to patch it locally — confirmed repeatedly during the Wave 3/4 migration (TermKit's `argsIgnorePattern` for `(_, i) => ...`, Game-Profile's `varsIgnorePattern`) before this was centralized, first into `npm-package.cjs` alone, then hoisted one level further into `index.cjs` once a fleet-wide grep for bare `require('@infinitetoken/eslint-config')` (no subpath) came back with zero matches — every real consumer goes through `npm-package`/`react-native`/`server`/`vue`, so there was no actual "wants the plain `warn` instead" consumer of the bare export to preserve by keeping this scoped below the base, only speculation that one might exist someday — the same kind of untested hedge that turned out wrong for the sibling `Jest-Config` package's own bare `.` alias, which existed briefly then was removed outright once the same fleet-wide-grep check found zero real consumers (see that repo's own CLAUDE.md). `vue.cjs` is unaffected either way — it's standalone and never requires `index.cjs` at all, so its own separately-shaped `no-unused-vars` rule stands untouched.

`eslint-plugin-react-hooks` and `eslint-plugin-react-native` are optional peer dependencies, not bundled dependencies, since `eslint-plugin-react-native@5` only supports `eslint` up to v9, and bundling it would force that ceiling onto every consumer, not just React Native ones. `eslint-plugin-vue`/`vue-eslint-parser` don't have that problem (verified against `eslint@^10`), so they're bundled as regular dependencies like the rest.

## File layout

The six preset files (`index.cjs`, `npm-package.cjs`, `prettier.cjs`, `react-native.cjs`, `server.cjs`, `vue.cjs`) live in `src/`, not repo root — purely a physical/repo-tidiness move, not an API change. Every `exports` entry in `package.json` still maps to the same public subpath as before (`.`, `./npm-package`, `./prettier`, `./react-native`, `./server`, `./vue`); only the right-hand-side file path changed, e.g. `"./npm-package": "./src/npm-package.cjs"`. No consumer sees or needs to know about `src/` at all — `require('@infinitetoken/eslint-config/npm-package')` resolves exactly the same before and after. This is a different move than `TSConfig`'s `tsup/` directory, which nests in the *public* subpath too (`./tsup/lib`) because "tsup" is real, load-bearing information about which tool a consumer is picking; nesting `./eslint/npm-package` here would just repeat this package's own name for no reason (see `TSConfig`'s CLAUDE.md for the fuller reasoning — this repo was the case explicitly considered and rejected for that treatment, then revisited as a file-layout-only move instead).

## Code Style

This repo dogfoods itself: root `eslint.config.cjs` requires this package's own `src/npm-package.cjs` by relative path, and `package.json`'s `"prettier"` field points at `./src/prettier.cjs` the same way. Always run `npm run lint` before finishing any task.

Single quotes, JSX single quotes, no semicolons, no trailing commas, print width 1000 (effectively disabled).
